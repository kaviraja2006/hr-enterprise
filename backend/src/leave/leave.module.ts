import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveTypesController } from './leave-types.controller';
import { LeaveRequestsController } from './leave-requests.controller';

@Module({
  controllers: [LeaveTypesController, LeaveRequestsController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
