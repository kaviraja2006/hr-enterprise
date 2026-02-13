import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  // Run at 11:55 PM IST (6:25 PM UTC) every day
  @Cron('25 18 * * *')
  async markAbsentees() {
    this.logger.log('Running daily absentee marking job');
    
    try {
      const count = await this.attendanceService.markAbsentees();
      this.logger.log(`Marked ${count} employees as absent`);
    } catch (error) {
      this.logger.error('Failed to mark absentees', error);
    }
  }
}
