import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { PrismaModule } from './database/prisma.module';
import { AuditModule } from './shared/audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { PerformanceModule } from './performance/performance.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkflowModule } from './workflow/workflow.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from './common/guards';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    // Background jobs
    ScheduleModule.forRoot(),
    // Database
    PrismaModule,
    // Shared
    AuditModule,
    // Feature modules
    AuthModule,
    UsersModule,
    RbacModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    PerformanceModule,
    RecruitmentModule,
    ComplianceModule,
    AnalyticsModule,
    WorkflowModule,
    SchedulerModule,
  ],
  providers: [
    // Global guards - disabled by default, use @UseGuards() decorator
    // Uncomment to enable global authentication
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
  ],
})
export class AppModule {}
