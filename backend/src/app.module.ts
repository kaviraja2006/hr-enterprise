import { Module } from '@nestjs/common';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [HrModule],
})
export class AppModule {}
