import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { Decimal } from '@prisma/client-runtime-utils';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Job Methods ============

  async createJob(createDto: CreateJobDto) {
    if (createDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: createDto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('Invalid department ID');
      }
    }

    const job = await this.prisma.job.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        departmentId: createDto.departmentId,
        requirements: createDto.requirements,
        location: createDto.location,
        employmentType: createDto.employmentType,
        minSalary: createDto.minSalary ? new Decimal(createDto.minSalary) : null,
        maxSalary: createDto.maxSalary ? new Decimal(createDto.maxSalary) : null,
        openings: createDto.openings ?? 1,
        status: 'draft',
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`Job created: ${job.id} - ${job.title}`);
    return job;
  }

  async findAllJobs(params: { status?: string; departmentId?: string }) {
    const { status, departmentId } = params;

    const where: any = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    return this.prisma.job.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findJobById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        candidates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            stage: true,
            appliedAt: true,
          },
          orderBy: { appliedAt: 'desc' },
        },
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async publishJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.status !== 'draft') {
      throw new BadRequestException('Can only publish draft jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'open',
        postedAt: new Date(),
      },
    });

    this.logger.log(`Job published: ${id}`);
    return updated;
  }

  async closeJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Can only close open jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });

    this.logger.log(`Job closed: ${id}`);
    return updated;
  }

  async deleteJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job._count.candidates > 0) {
      throw new BadRequestException('Cannot delete job with candidates');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    this.logger.log(`Job deleted: ${id}`);
    return { message: 'Job deleted successfully' };
  }

  // ============ Candidate Methods ============

  async createCandidate(createDto: CreateCandidateDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: createDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${createDto.jobId} not found`);
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Can only apply to open jobs');
    }

    // Check if candidate already applied
    const existing = await this.prisma.candidate.findFirst({
      where: {
        jobId: createDto.jobId,
        email: createDto.email,
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied for this job');
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        jobId: createDto.jobId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        resumeUrl: createDto.resumeUrl,
        coverLetter: createDto.coverLetter,
        source: createDto.source,
        notes: createDto.notes,
        stage: 'applied',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    this.logger.log(`Candidate created: ${candidate.id} for job ${createDto.jobId}`);
    return candidate;
  }

  async findAllCandidates(params: {
    jobId?: string;
    stage?: string;
    skip?: number;
    take?: number;
  }) {
    const { jobId, stage, skip = 0, take = 20 } = params;

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (stage) where.stage = stage;

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async moveCandidateStage(id: string, stage: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    const validStages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStages.includes(stage)) {
      throw new BadRequestException(`Invalid stage. Valid stages are: ${validStages.join(', ')}`);
    }

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: { stage },
    });

    this.logger.log(`Candidate ${id} moved to stage: ${stage}`);
    return updated;
  }

  async convertToEmployee(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    if (candidate.stage !== 'offer') {
      throw new BadRequestException('Can only convert candidates with offer stage to employees');
    }

    // Generate employee code
    const employeeCount = await this.prisma.employee.count();
    const employeeCode = `EMP${String(employeeCount + 1).padStart(5, '0')}`;

    // Create employee
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        departmentId: candidate.job.departmentId,
        designation: candidate.job.title,
        dateOfJoining: new Date(),
        employmentStatus: 'active',
      },
    });

    // Update candidate stage
    await this.prisma.candidate.update({
      where: { id },
      data: { stage: 'hired' },
    });

    this.logger.log(`Candidate ${id} converted to employee ${employee.id}`);
    return employee;
  }

  async deleteCandidate(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    await this.prisma.candidate.delete({
      where: { id },
    });

    this.logger.log(`Candidate deleted: ${id}`);
    return { message: 'Candidate deleted successfully' };
  }

  // ============ Recruitment Analytics ============

  async getRecruitmentSummary() {
    const totalJobs = await this.prisma.job.count();
    const openJobs = await this.prisma.job.count({ where: { status: 'open' } });
    const totalCandidates = await this.prisma.candidate.count();
    
    const candidatesByStage = await this.prisma.candidate.groupBy({
      by: ['stage'],
      _count: true,
    });

    const hiredThisMonth = await this.prisma.candidate.count({
      where: {
        stage: 'hired',
        appliedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      totalJobs,
      openJobs,
      totalCandidates,
      candidatesByStage: candidatesByStage.reduce((acc, item) => {
        acc[item.stage] = item._count;
        return acc;
      }, {} as Record<string, number>),
      hiredThisMonth,
    };
  }
}
