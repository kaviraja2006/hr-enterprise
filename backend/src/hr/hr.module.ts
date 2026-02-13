import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { EmployeeApplicationService } from './application/employee.application';
import { AttendanceApplicationService } from './application/attendance.application';
import { LeaveApplicationService } from './application/leave.application';
import { PrismaHrRepository } from './repository/prisma-hr.repository';
import { AttendanceCronService } from './tasks/attendance-cron.service';
import { EmployeeController } from './controller/employee.controller';
import { DepartmentController } from './controller/department.controller';
import { DesignationController } from './controller/designation.controller';
import { AttendanceController } from './controller/attendance.controller';
import { LeaveController } from './controller/leave.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    EmployeeController,
    DepartmentController,
    DesignationController,
    AttendanceController,
    LeaveController,
  ],
  providers: [
    PrismaService,
    EmployeeApplicationService,
    AttendanceApplicationService,
    LeaveApplicationService,
    AttendanceCronService,
    PrismaHrRepository,
    {
      provide: 'HrRepository',
      useClass: PrismaHrRepository,
    },
  ],
  exports: [PrismaService],
})
export class HrModule {}
