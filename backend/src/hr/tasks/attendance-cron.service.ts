import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { HrRepository } from '../repository/hr.repository';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(
    @Inject('HrRepository')
    private readonly repository: HrRepository,
  ) {}

  // Run at 11:55 PM IST every day (5:25 PM UTC)
  @Cron('25 17 * * *')
  async markAbsentEmployees(): Promise<void> {
    this.logger.debug('Running auto-absence cron job');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const employeesWithoutAttendance =
        await this.repository.findEmployeesWithoutAttendance(today);

      this.logger.debug(
        `Found ${employeesWithoutAttendance.length} employees without attendance`,
      );

      for (const employeeId of employeesWithoutAttendance) {
        try {
          await this.repository.createAttendance({
            employeeId,
            attendanceDate: today,
            status: 'absent',
            notes: 'Auto-marked as absent - no check-in recorded',
          });

          this.logger.debug(`Marked employee ${employeeId} as absent`);
        } catch (error) {
          this.logger.error(
            `Failed to mark absent for employee ${employeeId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.debug('Auto-absence cron job completed');
    } catch (error) {
      this.logger.error(
        `Auto-absence cron job failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
