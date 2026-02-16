// Recruitment Types

export type JobStatus = 'draft' | 'open' | 'closed' | 'archived';
export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  requirements?: string;
  location?: string;
  employmentType?: EmploymentType;
  minSalary?: number;
  maxSalary?: number;
  status: JobStatus;
  openings: number;
  postedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  candidates?: Candidate[];
  candidateCount?: number;
}

export interface Candidate {
  id: string;
  jobId: string;
  job?: {
    id: string;
    title: string;
    department?: {
      name: string;
    };
  };
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  source?: string;
  stage: CandidateStage;
  appliedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  title: string;
  description?: string;
  departmentId?: string;
  requirements?: string;
  location?: string;
  employmentType?: EmploymentType;
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
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  hiredCandidates: number;
  candidatesByStage: Record<CandidateStage, number>;
}

export interface RecruitmentStats {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  newCandidatesThisMonth: number;
  hiredThisMonth: number;
  averageTimeToHire: number; // in days
}
