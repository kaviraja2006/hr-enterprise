import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFilingRecordDto } from './dto/create-filing-record.dto';
import { CreatePolicyAcknowledgementDto } from './dto/create-policy-acknowledgement.dto';
import { Decimal } from '@prisma/client-runtime-utils';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Filing Record Methods ============

  async createFilingRecord(createDto: CreateFilingRecordDto) {
    const existing = await this.prisma.filingRecord.findUnique({
      where: {
        type_period: {
          type: createDto.type,
          period: createDto.period,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Filing record already exists for ${createDto.type} - ${createDto.period}`,
      );
    }

    const record = await this.prisma.filingRecord.create({
      data: {
        type: createDto.type,
        period: createDto.period,
        amount: createDto.amount ? new Decimal(createDto.amount) : null,
        receiptNo: createDto.receiptNo,
        notes: createDto.notes,
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
        status: 'pending',
      },
    });

    this.logger.log(`Filing record created: ${createDto.type} - ${createDto.period}`);
    return record;
  }

  async findAllFilingRecords(params: {
    type?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const { type, status, skip = 0, take = 20 } = params;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      this.prisma.filingRecord.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.filingRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findFilingRecordById(id: string) {
    const record = await this.prisma.filingRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Filing record with ID ${id} not found`);
    }

    return record;
  }

  async fileFilingRecord(id: string, userId: string, receiptNo?: string) {
    const record = await this.prisma.filingRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Filing record with ID ${id} not found`);
    }

    if (record.status !== 'pending') {
      throw new BadRequestException('Can only file pending records');
    }

    const updated = await this.prisma.filingRecord.update({
      where: { id },
      data: {
        status: 'filed',
        filedAt: new Date(),
        filedBy: userId,
        receiptNo: receiptNo ?? record.receiptNo,
      },
    });

    this.logger.log(`Filing record filed: ${id}`);
    return updated;
  }

  async acknowledgeFilingRecord(id: string) {
    const record = await this.prisma.filingRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Filing record with ID ${id} not found`);
    }

    if (record.status !== 'filed') {
      throw new BadRequestException('Can only acknowledge filed records');
    }

    const updated = await this.prisma.filingRecord.update({
      where: { id },
      data: { status: 'acknowledged' },
    });

    this.logger.log(`Filing record acknowledged: ${id}`);
    return updated;
  }

  async getUpcomingFilings() {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.filingRecord.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: today,
          lte: thirtyDaysLater,
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // ============ Policy Acknowledgement Methods ============

  async createPolicyAcknowledgement(createDto: CreatePolicyAcknowledgementDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createDto.employeeId} not found`);
    }

    const existing = await this.prisma.policyAcknowledgement.findUnique({
      where: {
        employeeId_policyName: {
          employeeId: createDto.employeeId,
          policyName: createDto.policyName,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Employee has already acknowledged this policy');
    }

    const acknowledgement = await this.prisma.policyAcknowledgement.create({
      data: {
        employeeId: createDto.employeeId,
        policyName: createDto.policyName,
        policyVersion: createDto.policyVersion,
        notes: createDto.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Policy acknowledgement created: ${createDto.policyName} by employee ${createDto.employeeId}`);
    return acknowledgement;
  }

  async findAllPolicyAcknowledgements(params: {
    employeeId?: string;
    policyName?: string;
    skip?: number;
    take?: number;
  }) {
    const { employeeId, policyName, skip = 0, take = 20 } = params;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (policyName) where.policyName = policyName;

    const [acknowledgements, total] = await Promise.all([
      this.prisma.policyAcknowledgement.findMany({
        where,
        skip,
        take,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { acknowledgedAt: 'desc' },
      }),
      this.prisma.policyAcknowledgement.count({ where }),
    ]);

    return {
      data: acknowledgements,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getPolicyComplianceReport(policyName: string) {
    const totalEmployees = await this.prisma.employee.count({
      where: { employmentStatus: 'active' },
    });

    const acknowledgedCount = await this.prisma.policyAcknowledgement.count({
      where: { policyName },
    });

    const pendingEmployees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
        NOT: {
          policyAcknowledgements: {
            some: { policyName },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      policyName,
      totalEmployees,
      acknowledgedCount,
      pendingCount: totalEmployees - acknowledgedCount,
      complianceRate: totalEmployees > 0 ? ((acknowledgedCount / totalEmployees) * 100).toFixed(2) : 0,
      pendingEmployees,
    };
  }

  // ============ Compliance Dashboard ============

  async getComplianceDashboard() {
    // Filing summary
    const pendingFilings = await this.prisma.filingRecord.count({
      where: { status: 'pending' },
    });

    const filedThisMonth = await this.prisma.filingRecord.count({
      where: {
        status: { in: ['filed', 'acknowledged'] },
        filedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Policy acknowledgement summary
    const totalPolicies = await this.prisma.policyAcknowledgement.groupBy({
      by: ['policyName'],
      _count: true,
    });

    const upcomingFilings = await this.getUpcomingFilings();

    return {
      filings: {
        pending: pendingFilings,
        filedThisMonth,
        upcoming: upcomingFilings,
      },
      policies: totalPolicies.map((p) => ({
        name: p.policyName,
        acknowledgedCount: p._count,
      })),
    };
  }
}
