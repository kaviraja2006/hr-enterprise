import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Mark absentees daily at 11:59 PM IST
  @Cron('59 23 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async markAbsentees() {
    this.logger.log('Running daily absentee marking job...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active employees
      const activeEmployees = await this.prisma.employee.findMany({
        where: { employmentStatus: 'active' },
        select: { id: true },
      });

      // Get employees who already have attendance marked
      const existingAttendance = await this.prisma.attendance.findMany({
        where: {
          date: today,
        },
        select: { employeeId: true },
      });

      const markedEmployeeIds = new Set(existingAttendance.map((a) => a.employeeId));

      // Get employees on approved leave
      const approvedLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          status: 'approved',
          startDate: { lte: today },
          endDate: { gte: today },
        },
        select: { employeeId: true },
      });

      const employeesOnLeave = new Set(approvedLeaves.map((l) => l.employeeId));

      // Mark absent for employees without attendance
      const absentEmployees = activeEmployees.filter(
        (e) => !markedEmployeeIds.has(e.id) && !employeesOnLeave.has(e.id),
      );

      if (absentEmployees.length > 0) {
        await this.prisma.attendance.createMany({
          data: absentEmployees.map((e) => ({
            employeeId: e.id,
            date: today,
            status: 'absent',
            lateMinutes: 0,
            overtimeMinutes: 0,
          })),
        });

        this.logger.log(`Marked ${absentEmployees.length} employees as absent`);
      } else {
        this.logger.log('No employees to mark as absent');
      }

      // Mark on-leave for employees with approved leave
      const leaveEmployees = activeEmployees.filter(
        (e) => !markedEmployeeIds.has(e.id) && employeesOnLeave.has(e.id),
      );

      if (leaveEmployees.length > 0) {
        await this.prisma.attendance.createMany({
          data: leaveEmployees.map((e) => ({
            employeeId: e.id,
            date: today,
            status: 'on-leave',
            lateMinutes: 0,
            overtimeMinutes: 0,
          })),
        });

        this.logger.log(`Marked ${leaveEmployees.length} employees as on-leave`);
      }
    } catch (error) {
      this.logger.error('Error in absentee marking job', error);
    }
  }

  // Accrue leave balances monthly on the 1st at 12:05 AM IST
  @Cron('5 0 1 * *', {
    timeZone: 'Asia/Kolkata',
  })
  async accrueLeaveBalances() {
    this.logger.log('Running monthly leave accrual job...');

    try {
      const currentYear = new Date().getFullYear();
      const activeEmployees = await this.prisma.employee.findMany({
        where: { employmentStatus: 'active' },
        select: { id: true },
      });

      const leaveTypes = await this.prisma.leaveType.findMany({
        where: { isActive: true },
      });

      for (const employee of activeEmployees) {
        for (const leaveType of leaveTypes) {
          // Check if balance exists for this year
          let balance = await this.prisma.leaveBalance.findUnique({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year: currentYear,
              },
            },
          });

          if (!balance) {
            // Create new balance for the year
            balance = await this.prisma.leaveBalance.create({
              data: {
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year: currentYear,
                totalDays: leaveType.annualLimit,
                usedDays: 0,
                pendingDays: 0,
                remainingDays: leaveType.annualLimit,
              },
            });
          }

          // Monthly accrual (annual limit / 12)
          const monthlyAccrual = Math.floor(leaveType.annualLimit / 12);
          if (monthlyAccrual > 0) {
            await this.prisma.leaveBalance.update({
              where: { id: balance.id },
              data: {
                totalDays: { increment: monthlyAccrual },
                remainingDays: { increment: monthlyAccrual },
              },
            });
          }
        }
      }

      this.logger.log(`Leave accrual completed for ${activeEmployees.length} employees`);
    } catch (error) {
      this.logger.error('Error in leave accrual job', error);
    }
  }

  // Carry forward leave balances on January 1st at 12:10 AM IST
  @Cron('10 0 1 1 *', {
    timeZone: 'Asia/Kolkata',
  })
  async carryForwardLeaveBalances() {
    this.logger.log('Running annual leave carry forward job...');

    try {
      const previousYear = new Date().getFullYear() - 1;
      const currentYear = new Date().getFullYear();

      const leaveTypes = await this.prisma.leaveType.findMany({
        where: {
          isActive: true,
          carryForwardAllowed: true,
        },
      });

      const previousBalances = await this.prisma.leaveBalance.findMany({
        where: {
          year: previousYear,
          remainingDays: { gt: 0 },
        },
      });

      for (const prevBalance of previousBalances) {
        const leaveType = leaveTypes.find((lt) => lt.id === prevBalance.leaveTypeId);
        if (!leaveType) continue;

        const carryForwardDays = leaveType.maxCarryForward
          ? Math.min(prevBalance.remainingDays, leaveType.maxCarryForward)
          : prevBalance.remainingDays;

        if (carryForwardDays > 0) {
          // Check if current year balance exists
          let currentBalance = await this.prisma.leaveBalance.findUnique({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: prevBalance.employeeId,
                leaveTypeId: prevBalance.leaveTypeId,
                year: currentYear,
              },
            },
          });

          if (currentBalance) {
            await this.prisma.leaveBalance.update({
              where: { id: currentBalance.id },
              data: {
                totalDays: { increment: carryForwardDays },
                remainingDays: { increment: carryForwardDays },
                carriedForward: carryForwardDays,
              },
            });
          } else {
            await this.prisma.leaveBalance.create({
              data: {
                employeeId: prevBalance.employeeId,
                leaveTypeId: prevBalance.leaveTypeId,
                year: currentYear,
                totalDays: leaveType.annualLimit + carryForwardDays,
                usedDays: 0,
                pendingDays: 0,
                remainingDays: leaveType.annualLimit + carryForwardDays,
                carriedForward: carryForwardDays,
              },
            });
          }
        }
      }

      this.logger.log('Leave carry forward completed');
    } catch (error) {
      this.logger.error('Error in leave carry forward job', error);
    }
  }

  // Send reminders for pending approvals daily at 9:00 AM IST
  @Cron('0 9 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async sendPendingApprovalReminders() {
    this.logger.log('Running pending approval reminders job...');

    try {
      const pendingApprovals = await this.prisma.approval.findMany({
        where: { status: 'pending' },
        include: {
          steps: {
            where: { status: 'pending' },
            include: {
              approver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            take: 1,
            orderBy: { stepNumber: 'asc' },
          },
        },
      });

      // In a real implementation, you would send emails here
      // For now, we just log the pending approvals
      this.logger.log(`Found ${pendingApprovals.length} pending approvals`);

      for (const approval of pendingApprovals) {
        const currentStep = approval.steps[0];
        if (currentStep) {
          this.logger.log(
            `Reminder: ${currentStep.approver.firstName} ${currentStep.approver.lastName} has a pending approval for ${approval.entityType}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in pending approval reminders job', error);
    }
  }

  // Check for compliance filing due dates daily at 8:00 AM IST
  @Cron('0 8 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async checkComplianceDueDates() {
    this.logger.log('Running compliance due date check job...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const upcomingDueFilings = await this.prisma.filingRecord.findMany({
        where: {
          status: 'pending',
          dueDate: {
            gte: tomorrow,
            lt: dayAfter,
          },
        },
      });

      if (upcomingDueFilings.length > 0) {
        this.logger.log(`Found ${upcomingDueFilings.length} filings due tomorrow`);
        // In a real implementation, you would send email notifications here
      }
    } catch (error) {
      this.logger.error('Error in compliance due date check job', error);
    }
  }
}
