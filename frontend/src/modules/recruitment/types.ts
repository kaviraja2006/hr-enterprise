// Recruitment Types

export type JobStatus = 'OPEN' | 'CLOSED' | 'ON_HOLD';
export type CandidateStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  openings?: number;
  status: JobStatus;
  postedDate: string;
  closedDate?: string;
  postedAt?: string;
  candidateCount?: number;
  department?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  stage: CandidateStage;
  appliedAt: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface CandidateListResponse {
  data: Candidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateJobDto {
  title: string;
  description?: string;
  departmentId?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  openings?: number;
}

export interface CreateCandidateDto {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  source?: string;
  notes?: string;
}

export interface RecruitmentSummary {
  openJobs: number;
  totalCandidates: number;
  hiredThisMonth: number;
  avgTimeToHire: number;
  interviewsScheduled: number;
  candidatesByStage: Record<CandidateStage, number>;
}
