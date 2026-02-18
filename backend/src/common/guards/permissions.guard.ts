import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    permissions: string[];
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermissions) {
      try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'debug-perms.log');
        const logMessage = `[${new Date().toISOString()}] DENIAL - Required: ${requiredPermissions.join(', ')} - User Perms: ${user.permissions.join(', ')}\n`;
        fs.appendFileSync(logPath, logMessage);
      } catch (e) {
        // Ignore logging errors
      }
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }
    
    // Always log at least once to confirm guard is running
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'debug-perms.log');
      const logMessage = `[${new Date().toISOString()}] ACCESS - User: ${user.email} - Perms Count: ${user.permissions.length}\n`;
      fs.appendFileSync(logPath, logMessage);
    } catch (e) {}

    return true;
  }
}
