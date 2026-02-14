// Attendance Types

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    profilePicture?: string;
  };
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceListResponse {
  data: Attendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CheckInDto {
  employeeId: string;
  notes?: string;
}

export interface CheckOutDto {
  employeeId: string;
  notes?: string;
}

export interface CreateAttendanceDto {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceDto {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  averageWorkHours: number;
  totalOvertimeHours: number;
}

export interface DailyAttendanceStats {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface TodayAttendanceStats {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  totalEmployees: number;
}
