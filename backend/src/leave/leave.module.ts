import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveTypesController } from './leave-types.controller';
import { LeaveRequestsController } from './leave-requests.controller';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [LeaveTypesController, LeaveRequestsController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
