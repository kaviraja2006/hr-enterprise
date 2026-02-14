import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';
import { Decimal } from '@prisma/client-runtime-utils';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Salary Structure Methods ============

  async createSalaryStructure(createDto: CreateSalaryStructureDto) {
    const { name } = createDto;

    const existing = await this.prisma.salaryStructure.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Salary structure "${name}" already exists`);
    }

    const structure = await this.prisma.salaryStructure.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        basic: new Decimal(createDto.basic),
        hra: new Decimal(createDto.hra),
        conveyance: new Decimal(createDto.conveyance ?? 0),
        medicalAllowance: new Decimal(createDto.medicalAllowance ?? 0),
        specialAllowance: new Decimal(createDto.specialAllowance ?? 0),
        professionalTax: new Decimal(createDto.professionalTax ?? 0),
        pf: new Decimal(createDto.pf ?? 0),
        esi: new Decimal(createDto.esi ?? 0),
        isActive: createDto.isActive ?? true,
      },
    });

    this.logger.log(`Salary structure created: ${name}`);
    return structure;
  }

  async findAllSalaryStructures() {
    return this.prisma.salaryStructure.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findSalaryStructureById(id: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    return structure;
  }

  async updateSalaryStructure(id: string, updateDto: UpdateSalaryStructureDto) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    if (updateDto.name && updateDto.name !== structure.name) {
      const existing = await this.prisma.salaryStructure.findUnique({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException(`Salary structure "${updateDto.name}" already exists`);
      }
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.basic !== undefined) updateData.basic = new Decimal(updateDto.basic);
    if (updateDto.hra !== undefined) updateData.hra = new Decimal(updateDto.hra);
    if (updateDto.conveyance !== undefined) updateData.conveyance = new Decimal(updateDto.conveyance);
    if (updateDto.medicalAllowance !== undefined) updateData.medicalAllowance = new Decimal(updateDto.medicalAllowance);
    if (updateDto.specialAllowance !== undefined) updateData.specialAllowance = new Decimal(updateDto.specialAllowance);
    if (updateDto.professionalTax !== undefined) updateData.professionalTax = new Decimal(updateDto.professionalTax);
    if (updateDto.pf !== undefined) updateData.pf = new Decimal(updateDto.pf);
    if (updateDto.esi !== undefined) updateData.esi = new Decimal(updateDto.esi);
    if (updateDto.isActive !== undefined) updateData.isActive = updateDto.isActive;

    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Salary structure updated: ${id}`);
    return updated;
  }

  async deleteSalaryStructure(id: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Salary structure with ID ${id} not found`);
    }

    if (structure._count.employees > 0) {
      throw new BadRequestException(
        'Cannot delete salary structure with assigned employees. Please reassign employees first.',
      );
    }

    await this.prisma.salaryStructure.delete({
      where: { id },
    });

    this.logger.log(`Salary structure deleted: ${id}`);
    return { message: 'Salary structure deleted successfully' };
  }

  // ============ Payroll Run Methods ============

  async createPayrollRun(createDto: CreatePayrollRunDto) {
    const { month, year } = createDto;

    // Check if payroll run already exists for this month/year
    const existing = await this.prisma.payrollRun.findUnique({
      where: { month_year: { month, year } },
    });

    if (existing) {
      throw new ConflictException(
        `Payroll run already exists for ${month}/${year}`,
      );
    }

    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        month,
        year,
        status: 'draft',
      },
    });

    this.logger.log(`Payroll run created: ${month}/${year}`);
    return payrollRun;
  }

  async findAllPayrollRuns() {
    return this.prisma.payrollRun.findMany({
      include: {
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findPayrollRunById(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
          },
        },
        entries: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    return payrollRun;
  }

  async calculatePayrollEntries(payrollRunId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${payrollRunId} not found`);
    }

    if (payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only calculate entries for draft payroll runs');
    }

    // Get all active employees with salary structures
    const employees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
        salaryStructureId: { not: null },
      },
      include: {
        salaryStructure: true,
      },
    });

    // Get LOP days for each employee for the month
    const startDate = new Date(payrollRun.year, payrollRun.month - 1, 1);
    const endDate = new Date(payrollRun.year, payrollRun.month, 0);

    const entries: {
      payrollRunId: string;
      employeeId: string;
      grossSalary: Decimal;
      lopDays: number;
      lopDeduction: Decimal;
      totalDeductions: Decimal;
      netSalary: Decimal;
    }[] = [];

    for (const employee of employees) {
      if (!employee.salaryStructure) continue;

      // Get attendance for the month
      const attendance = await this.prisma.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'absent',
        },
      });

      // Get approved leave requests for the month
      const approvedLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });

      // Calculate LOP days (absent days not covered by approved leave)
      const leaveDays = approvedLeaves.reduce((total, leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        const effectiveStart = new Date(Math.max(leaveStart.getTime(), startDate.getTime()));
        const effectiveEnd = new Date(Math.min(leaveEnd.getTime(), endDate.getTime()));
        return total + Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }, 0);

      const lopDays = Math.max(0, attendance.length - leaveDays);

      // Calculate salary
      const structure = employee.salaryStructure;
      const grossSalary = Number(structure.basic) + Number(structure.hra) + 
        Number(structure.conveyance) + Number(structure.medicalAllowance) + 
        Number(structure.specialAllowance);
      
      const perDaySalary = grossSalary / 30;
      const lopDeduction = perDaySalary * lopDays;
      const totalDeductions = lopDeduction + Number(structure.professionalTax) + 
        Number(structure.pf) + Number(structure.esi);
      const netSalary = grossSalary - totalDeductions;

      entries.push({
        payrollRunId,
        employeeId: employee.id,
        grossSalary: new Decimal(grossSalary.toFixed(2)),
        lopDays,
        lopDeduction: new Decimal(lopDeduction.toFixed(2)),
        totalDeductions: new Decimal(totalDeductions.toFixed(2)),
        netSalary: new Decimal(netSalary.toFixed(2)),
      });
    }

    // Delete existing entries and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.payrollEntry.deleteMany({
        where: { payrollRunId },
      });

      await tx.payrollEntry.createMany({
        data: entries,
      });
    });

    this.logger.log(`Payroll entries calculated for run ${payrollRunId}: ${entries.length} entries`);
    return { message: `Calculated ${entries.length} payroll entries`, count: entries.length };
  }

  async approvePayrollRun(id: string, userId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only approve draft payroll runs');
    }

    if (payrollRun._count.entries === 0) {
      throw new BadRequestException('Cannot approve payroll run with no entries');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    this.logger.log(`Payroll run approved: ${id}`);
    return updated;
  }

  async processPayrollRun(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status !== 'approved') {
      throw new BadRequestException('Can only process approved payroll runs');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'processed',
        processedAt: new Date(),
      },
    });

    this.logger.log(`Payroll run processed: ${id}`);
    return updated;
  }

  async deletePayrollRun(id: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status === 'processed') {
      throw new ForbiddenException('Cannot delete processed payroll runs');
    }

    await this.prisma.payrollRun.delete({
      where: { id },
    });

    this.logger.log(`Payroll run deleted: ${id}`);
    return { message: 'Payroll run deleted successfully' };
  }

  // ============ Payroll Entry Methods ============

  async findPayrollEntryById(id: string) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id },
      include: {
        payrollRun: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
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

    if (!entry) {
      throw new NotFoundException(`Payroll entry with ID ${id} not found`);
    }

    return entry;
  }

  async updatePayrollEntry(id: string, data: { lopDays?: number; notes?: string }) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id },
      include: { payrollRun: true },
    });

    if (!entry) {
      throw new NotFoundException(`Payroll entry with ID ${id} not found`);
    }

    if (entry.payrollRun.status !== 'draft') {
      throw new BadRequestException('Can only update entries in draft payroll runs');
    }

    const grossSalary = Number(entry.grossSalary);
    const perDaySalary = grossSalary / 30;
    const lopDays = data.lopDays ?? entry.lopDays;
    const lopDeduction = perDaySalary * lopDays;

    // Get employee's salary structure for deductions
    const employee = await this.prisma.employee.findUnique({
      where: { id: entry.employeeId },
      include: { salaryStructure: true },
    });

    const structure = employee?.salaryStructure;
    const fixedDeductions = structure 
      ? Number(structure.professionalTax) + Number(structure.pf) + Number(structure.esi)
      : 0;

    const totalDeductions = lopDeduction + fixedDeductions;
    const netSalary = grossSalary - totalDeductions;

    const updated = await this.prisma.payrollEntry.update({
      where: { id },
      data: {
        lopDays,
        lopDeduction: new Decimal(lopDeduction.toFixed(2)),
        totalDeductions: new Decimal(totalDeductions.toFixed(2)),
        netSalary: new Decimal(netSalary.toFixed(2)),
      },
    });

    this.logger.log(`Payroll entry updated: ${id}`);
    return updated;
  }

  // ============ Reports ============

  async getPayrollSummary(payrollRunId: string) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        entries: {
          include: {
            employee: {
              select: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${payrollRunId} not found`);
    }

    const totalGross = payrollRun.entries.reduce((sum, e) => sum + Number(e.grossSalary), 0);
    const totalDeductions = payrollRun.entries.reduce((sum, e) => sum + Number(e.totalDeductions), 0);
    const totalNet = payrollRun.entries.reduce((sum, e) => sum + Number(e.netSalary), 0);

    // Group by department
    const byDepartment = payrollRun.entries.reduce((acc, e) => {
      const deptName = e.employee.department?.name || 'Unassigned';
      if (!acc[deptName]) {
        acc[deptName] = { count: 0, gross: 0, deductions: 0, net: 0 };
      }
      acc[deptName].count++;
      acc[deptName].gross += Number(e.grossSalary);
      acc[deptName].deductions += Number(e.totalDeductions);
      acc[deptName].net += Number(e.netSalary);
      return acc;
    }, {} as Record<string, { count: number; gross: number; deductions: number; net: number }>);

    return {
      payrollRun: {
        id: payrollRun.id,
        month: payrollRun.month,
        year: payrollRun.year,
        status: payrollRun.status,
      },
      summary: {
        totalEmployees: payrollRun.entries.length,
        totalGrossSalary: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNetSalary: totalNet.toFixed(2),
      },
      byDepartment: Object.entries(byDepartment).map(([dept, data]) => ({
        department: dept,
        employeeCount: data.count,
        grossSalary: data.gross.toFixed(2),
        deductions: data.deductions.toFixed(2),
        netSalary: data.net.toFixed(2),
      })),
    };
  }
}
