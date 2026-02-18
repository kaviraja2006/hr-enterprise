import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('approvals')
  async createApproval(
    @Body() data: {
      entityType: string;
      entityId: string;
      approverIds: string[];
      comments?: string;
    },
    @Request() req: any,
  ) {
    return this.workflowService.createApproval({
      ...data,
      requesterId: req.user.employeeId,
    });
  }

  @Get('approvals')
  async findAllApprovals(
    @Query('requesterId') requesterId?: string,
    @Query('approverId') approverId?: string,
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.workflowService.findAllApprovals({
      requesterId,
      approverId,
      status,
      entityType,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('approvals/stats')
  async getApprovalStats(@Request() req: any) {
    return this.workflowService.getApprovalStats(req.user.employeeId);
  }

  @Get('approvals/pending')
  async getPendingApprovals(@Request() req: any) {
    return this.workflowService.getPendingApprovalsForUser(req.user.employeeId);
  }

  @Get('approvals/:id')
  async findApprovalById(@Param('id') id: string) {
    return this.workflowService.findApprovalById(id);
  }

  @Post('approvals/:id/approve')
  async approveStep(
    @Param('id') id: string,
    @Request() req: any,
    @Body('comments') comments?: string,
  ) {
    return this.workflowService.approveStep(id, req.user.employeeId, comments);
  }

  @Post('approvals/:id/reject')
  async rejectApproval(
    @Param('id') id: string,
    @Request() req: any,
    @Body('comments') comments: string,
  ) {
    return this.workflowService.rejectApproval(id, req.user.employeeId, comments);
  }

  @Get('history/:entityType/:entityId')
  async getApprovalHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.workflowService.getApprovalHistory(entityType, entityId);
  }
}
