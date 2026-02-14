import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('executive-summary')
  @Roles('admin', 'hr', 'manager')
  async getExecutiveSummary() {
    return this.analyticsService.getExecutiveSummary();
  }

  @Get('attendance/today')
  async getTodayAttendance() {
    return this.analyticsService.getTodayAttendanceSummary();
  }

  @Get('attendance/metrics')
  @Roles('admin', 'hr', 'manager')
  async getAttendanceMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getAttendanceMetrics({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      departmentId,
    });
  }

  @Get('leave/metrics')
  @Roles('admin', 'hr', 'manager')
  async getLeaveMetrics(
    @Query('year') year: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getLeaveMetrics({
      year: parseInt(year, 10),
      departmentId,
    });
  }

  @Get('payroll/metrics')
  @Roles('admin', 'hr')
  async getPayrollMetrics(@Query('year') year: string) {
    return this.analyticsService.getPayrollMetrics({
      year: parseInt(year, 10),
    });
  }

  @Get('attrition')
  @Roles('admin', 'hr')
  async getAttritionRate(@Query('year') year: string) {
    return this.analyticsService.getAttritionRate({
      year: parseInt(year, 10),
    });
  }

  @Get('departments')
  @Roles('admin', 'hr', 'manager')
  async getDepartmentMetrics() {
    return this.analyticsService.getDepartmentMetrics();
  }
}
