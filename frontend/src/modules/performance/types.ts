// Performance Types

export type GoalStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type ReviewStatus = 'draft' | 'submitted' | 'acknowledged';

export interface Goal {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    profilePicture?: string;
    department?: {
      name: string;
    };
  };
  title: string;
  description?: string;
  targetValue: number;
  achievedValue: number;
  weightage: number;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  progress?: number; // Calculated percentage
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    profilePicture?: string;
    department?: {
      name: string;
    };
  };
  reviewerId: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewPeriod: string;
  rating: number;
  comments?: string;
  strengths?: string;
  improvements?: string;
  status: ReviewStatus;
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDto {
  employeeId: string;
  title: string;
  description?: string;
  targetValue: number;
  weightage?: number;
  startDate: string;
  endDate: string;
}

export interface CreatePerformanceReviewDto {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  rating: number;
  comments?: string;
  strengths?: string;
  improvements?: string;
}

export interface PerformanceSummary {
  employeeId: string;
  employeeName: string;
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  pendingGoals: number;
  averageGoalProgress: number;
  totalReviews: number;
  averageRating: number;
  lastReviewDate?: string;
}

export interface PerformanceStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  pendingGoals: number;
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
}
