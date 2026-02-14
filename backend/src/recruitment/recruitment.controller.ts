import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Controller('recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ============ Job Endpoints ============

  @Post('jobs')
  @Roles('admin', 'hr')
  async createJob(@Body() createDto: CreateJobDto) {
    return this.recruitmentService.createJob(createDto);
  }

  @Get('jobs')
  async findAllJobs(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.recruitmentService.findAllJobs({ status, departmentId });
  }

  @Get('jobs/:id')
  async findJobById(@Param('id') id: string) {
    return this.recruitmentService.findJobById(id);
  }

  @Post('jobs/:id/publish')
  @Roles('admin', 'hr')
  async publishJob(@Param('id') id: string) {
    return this.recruitmentService.publishJob(id);
  }

  @Post('jobs/:id/close')
  @Roles('admin', 'hr')
  async closeJob(@Param('id') id: string) {
    return this.recruitmentService.closeJob(id);
  }

  @Delete('jobs/:id')
  @Roles('admin', 'hr')
  async deleteJob(@Param('id') id: string) {
    return this.recruitmentService.deleteJob(id);
  }

  // ============ Candidate Endpoints ============

  @Post('candidates')
  async createCandidate(@Body() createDto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(createDto);
  }

  @Get('candidates')
  async findAllCandidates(
    @Query('jobId') jobId?: string,
    @Query('stage') stage?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.recruitmentService.findAllCandidates({
      jobId,
      stage,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('candidates/:id')
  async findCandidateById(@Param('id') id: string) {
    return this.recruitmentService.findCandidateById(id);
  }

  @Patch('candidates/:id/stage')
  @Roles('admin', 'hr')
  async moveCandidateStage(
    @Param('id') id: string,
    @Body('stage') stage: string,
  ) {
    return this.recruitmentService.moveCandidateStage(id, stage);
  }

  @Post('candidates/:id/convert')
  @Roles('admin', 'hr')
  async convertToEmployee(@Param('id') id: string) {
    return this.recruitmentService.convertToEmployee(id);
  }

  @Delete('candidates/:id')
  @Roles('admin', 'hr')
  async deleteCandidate(@Param('id') id: string) {
    return this.recruitmentService.deleteCandidate(id);
  }

  // ============ Analytics ============

  @Get('summary')
  async getRecruitmentSummary() {
    return this.recruitmentService.getRecruitmentSummary();
  }
}
