import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LeaveApplicationService } from '../application/leave.application';
import type {
  LeaveRequestSnapshot,
  LeaveSummary,
} from '../domain/leave.domain';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto';
import { RejectLeaveRequestDto } from './dto/process-leave-request.dto';
import { LeaveSummaryQueryDto } from './dto/leave-summary-query.dto';

@Controller('leave-requests')
export class LeaveController {
  private readonly logger = new Logger(LeaveController.name);

  constructor(private readonly leaveService: LeaveApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLeaveRequest(
    @Body() dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequestSnapshot> {
    this.logger.debug(`Creating leave request for employee: ${dto.employeeId}`);
    return this.leaveService.createLeaveRequest({
      employeeId: dto.employeeId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      leaveType: dto.leaveType,
      reason: dto.reason,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listLeaveRequests(
    @Query() query: LeaveRequestQueryDto,
  ): Promise<LeaveRequestSnapshot[]> {
    const hasFilters = query.employeeId || query.status || query.leaveType;
    this.logger.debug(
      hasFilters
        ? `Listing leave requests with filters`
        : 'Listing all leave requests',
    );
    return this.leaveService.listLeaveRequests({
      employeeId: query.employeeId,
      status: query.status,
      startDateFrom: query.startDateFrom
        ? new Date(query.startDateFrom)
        : undefined,
      startDateTo: query.startDateTo ? new Date(query.startDateTo) : undefined,
      leaveType: query.leaveType as
        | 'annual'
        | 'sick'
        | 'casual'
        | 'maternity'
        | 'paternity'
        | 'bereavement'
        | 'unpaid'
        | 'other'
        | undefined,
    });
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPendingLeaveRequests(): Promise<LeaveRequestSnapshot[]> {
    this.logger.debug('Getting pending leave requests');
    return this.leaveService.getPendingLeaveRequests();
  }

  @Get('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  async getEmployeeLeaveRequests(
    @Param('employeeId') employeeId: string,
  ): Promise<LeaveRequestSnapshot[]> {
    this.logger.debug(`Getting leave requests for employee: ${employeeId}`);
    return this.leaveService.getEmployeeLeaveRequests(employeeId);
  }

  @Get('summary/:employeeId')
  @HttpCode(HttpStatus.OK)
  async getLeaveSummary(
    @Param('employeeId') employeeId: string,
    @Query() query: LeaveSummaryQueryDto,
  ): Promise<LeaveSummary> {
    const year = query.year ?? new Date().getFullYear();
    this.logger.debug(
      `Getting leave summary for employee: ${employeeId}, year: ${year}`,
    );
    return this.leaveService.getLeaveSummary(employeeId, year);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLeaveRequestById(
    @Param('id') id: string,
  ): Promise<LeaveRequestSnapshot> {
    this.logger.debug(`Getting leave request: ${id}`);
    const request = await this.leaveService.getLeaveRequestById(id);
    if (!request) {
      throw new Error('Leave request not found');
    }
    return request;
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveLeaveRequest(@Param('id') id: string): Promise<void> {
    this.logger.debug(`Approving leave request: ${id}`);
    await this.leaveService.approveLeaveRequest(id, 'system');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() dto: RejectLeaveRequestDto,
  ): Promise<void> {
    this.logger.debug(`Rejecting leave request: ${id}`);
    await this.leaveService.rejectLeaveRequest(id, 'system', dto.reason);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelLeaveRequest(@Param('id') id: string): Promise<void> {
    this.logger.debug(`Cancelling leave request: ${id}`);
    await this.leaveService.cancelLeaveRequest(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLeaveRequest(@Param('id') id: string): Promise<void> {
    this.logger.debug(`Deleting leave request: ${id}`);
    // Note: This would require a delete method in the service/repository
    // For now, we'll cancel instead of hard delete
    await this.leaveService.cancelLeaveRequest(id);
  }
}
