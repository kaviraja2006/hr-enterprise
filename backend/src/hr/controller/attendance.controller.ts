import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AttendanceApplicationService } from '../application/attendance.application';
import type {
  AttendanceSnapshot,
  AttendanceSummary,
} from '../domain/attendance.domain';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceDomain } from '../domain/attendance.domain';

@Controller('attendance')
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(
    private readonly attendanceService: AttendanceApplicationService,
  ) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  async checkIn(@Body() dto: CheckInDto): Promise<AttendanceSnapshot> {
    this.logger.debug(`Check-in request for employee: ${dto.employeeId}`);
    return this.attendanceService.checkIn({
      employeeId: dto.employeeId,
      timestamp: dto.timestamp,
      notes: dto.notes,
    });
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  async checkOut(@Body() dto: CheckOutDto): Promise<AttendanceSnapshot> {
    this.logger.debug(`Check-out request: ${dto.attendanceId}`);
    return this.attendanceService.checkOut({
      attendanceId: dto.attendanceId,
      timestamp: dto.timestamp,
      notes: dto.notes,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listAttendance(
    @Query() query: AttendanceQueryDto,
  ): Promise<AttendanceSnapshot[]> {
    this.logger.debug('Listing attendance records', query);

    if (query.employeeId && query.startDate && query.endDate) {
      return this.attendanceService.getEmployeeAttendance(
        query.employeeId,
        new Date(query.startDate),
        new Date(query.endDate),
      );
    }

    if (query.date) {
      return this.attendanceService.getDailyAttendance(new Date(query.date));
    }

    // Default: return today's attendance
    const today = new Date();
    return this.attendanceService.getDailyAttendance(today);
  }

  @Get('summary/:employeeId')
  @HttpCode(HttpStatus.OK)
  async getAttendanceSummary(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AttendanceSummary> {
    this.logger.debug(`Getting attendance summary for ${employeeId}`);

    const start = startDate
      ? new Date(startDate)
      : AttendanceDomain.getCurrentIST();
    start.setDate(1); // First day of current month
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : AttendanceDomain.getCurrentIST();
    end.setHours(23, 59, 59, 999);

    return this.attendanceService.getAttendanceSummary(employeeId, start, end);
  }

  @Get('my-records')
  @HttpCode(HttpStatus.OK)
  async getMyAttendance(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AttendanceSnapshot[]> {
    this.logger.debug('Getting current employee attendance');

    // TODO: Get current employee ID from auth context
    const employeeId = 'current-employee-id';

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    return this.attendanceService.getEmployeeAttendance(employeeId, start, end);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ): Promise<AttendanceSnapshot> {
    this.logger.debug(`Updating attendance: ${id}`);
    return this.attendanceService.updateAttendance(id, true, {
      status: dto.status,
      notes: dto.notes,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttendance(@Param('id') id: string): Promise<void> {
    this.logger.debug(`Deleting attendance: ${id}`);
    await this.attendanceService['repository'].deleteAttendance(id);
  }
}
