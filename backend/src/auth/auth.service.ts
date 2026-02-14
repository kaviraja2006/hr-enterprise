import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import {
  hashPassword,
  comparePassword,
} from '../common/utils/encryption.utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    roleId?: string;
    employeeId?: string;
  };
  tokens: TokenPayload;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const bcryptRounds = this.configService.get<number>('security.bcryptRounds') ?? 12;
    const passwordHash = await hashPassword(password, bcryptRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`User registered: ${email}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId || undefined,
        employeeId: user.employeeId || undefined,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${email}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId || undefined,
        employeeId: user.employeeId || undefined,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPayload> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if token exists and is not revoked
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Revoke refresh token
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  async getProfile(userId: string): Promise<{ user: any; permissions: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        employee: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.role?.permissions.map(
      (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
    ) || [];

    return {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role?.name,
        employeeId: user.employeeId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      permissions,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const bcryptRounds = this.configService.get<number>('security.bcryptRounds') ?? 12;
    const newPasswordHash = await hashPassword(newPassword, bcryptRounds);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens
    await this.logoutAll(userId);

    this.logger.log(`Password changed for user: ${userId}`);
  }

  private async generateTokens(user: any): Promise<TokenPayload> {
    const permissions = user.role?.permissions.map(
      (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
    ) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
      employeeId: user.employeeId,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret')!,
      expiresIn: this.configService.get<string>('jwt.expiration')! as any,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
        expiresIn: this.configService.get<string>('jwt.refreshExpiration')! as any,
      },
    );

    // Store refresh token
    const expiresIn = this.parseExpiration(
      this.configService.get<string>('jwt.refreshExpiration')!,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(
        this.configService.get<string>('jwt.expiration')!,
      ),
    };
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }
}
