# HR Enterprise Backend

## Overview

The HR Enterprise Backend is a robust, enterprise-grade API built with NestJS (v11) and TypeScript. It provides comprehensive HR management capabilities through a RESTful API architecture.

**Framework**: NestJS 11.x  
**Language**: TypeScript 5.x  
**Database**: PostgreSQL 15+ with Prisma ORM  
**Architecture**: Modular, Domain-Driven Design  
**API Style**: RESTful with OpenAPI/Swagger documentation  

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Modules](#modules)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication & Security](#authentication--security)
7. [Configuration](#configuration)
8. [Getting Started](#getting-started)
9. [Development](#development)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Cron Jobs](#cron-jobs)
13. [Error Handling](#error-handling)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HR ENTERPRISE BACKEND                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CONTROLLER LAYER                      │    │
│  │  HTTP Request Handling, Validation, Response Formatting  │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   SERVICE LAYER                          │    │
│  │  Business Logic, Data Processing, External Integrations  │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  REPOSITORY LAYER                        │    │
│  │  Database Operations, Query Building, Transaction Mgmt   │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  DATABASE (PostgreSQL)                   │    │
│  │  18 Models, 40+ Tables, Indexed, Optimized               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### NestJS Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP MODULE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Auth      │ │   Users     │ │    RBAC     │ │ Employees │ │
│  │   Module    │ │   Module    │ │   Module    │ │  Module   │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │
│         │               │               │              │       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Departments │ │ Attendance  │ │    Leave    │ │  Payroll  │ │
│  │   Module    │ │   Module    │ │   Module    │ │  Module   │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │
│         │               │               │              │       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │Performance  │ │ Recruitment │ │  Compliance │ │ Analytics │ │
│  │   Module    │ │   Module    │ │   Module    │ │  Module   │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │
│         │               │               │              │       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │  Workflow   │ │  Scheduler  │ │    Database Module      │   │
│  │   Module    │ │   Module    │ │    (Prisma Service)     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
backend/
├── prisma/                          # Database layer
│   ├── schema.prisma               # Database schema (520+ lines)
│   ├── seed.ts                     # Database seeding script
│   └── migrations/                 # Database migrations
│       ├── 20250213000000_init/    # Initial migration
│       └── migration_lock.toml
│
├── src/                            # Source code
│   ├── main.ts                     # Application bootstrap
│   ├── app.module.ts               # Root application module
│   │
│   ├── config/                     # Configuration
│   │   ├── configuration.ts        # Config loading
│   │   └── validation.ts           # Environment validation
│   │
│   ├── database/                   # Database module
│   │   ├── prisma.module.ts        # Prisma module
│   │   └── prisma.service.ts       # Prisma service
│   │
│   ├── common/                     # Shared infrastructure
│   │   ├── decorators/             # Custom decorators
│   │   │   ├── public.decorator.ts
│   │   │   └── permissions.decorator.ts
│   │   ├── filters/                # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/                 # Authentication guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/           # Request/response interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── pipes/                  # Validation pipes
│   │       └── parse-uuid.pipe.ts
│   │
│   ├── shared/                     # Shared kernel
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   └── audit.service.ts    # Audit logging
│   │   └── errors/
│   │       ├── domain.error.ts
│   │       └── infrastructure.error.ts
│   │
│   ├── auth/                       # Authentication module
│   │   ├── auth.controller.ts      # Auth endpoints
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── change-password.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts     # JWT passport strategy
│   │
│   ├── users/                      # User management module
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── rbac/                       # Role-based access control
│   │   ├── rbac.controller.ts
│   │   ├── rbac.module.ts
│   │   ├── rbac.service.ts
│   │   └── dto/
│   │       ├── create-role.dto.ts
│   │       ├── update-role.dto.ts
│   │       ├── create-permission.dto.ts
│   │       └── assign-permissions.dto.ts
│   │
│   ├── employees/                  # Employee management
│   │   ├── employees.controller.ts
│   │   ├── employees.module.ts
│   │   └── employees.service.ts
│   │
│   ├── departments/                # Department management
│   │   ├── departments.controller.ts
│   │   ├── departments.module.ts
│   │   └── departments.service.ts
│   │
│   ├── attendance/                 # Attendance tracking
│   │   ├── attendance.controller.ts
│   │   ├── attendance.module.ts
│   │   ├── attendance.service.ts
│   │   ├── attendance-cron.service.ts
│   │   └── dto/
│   │       ├── create-attendance.dto.ts
│   │       ├── update-attendance.dto.ts
│   │       ├── check-in.dto.ts
│   │       └── check-out.dto.ts
│   │
│   ├── leave/                      # Leave management
│   │   ├── leave.module.ts
│   │   ├── leave.service.ts
│   │   ├── leave-requests.controller.ts
│   │   ├── leave-types.controller.ts
│   │   └── dto/
│   │       └── create-leave-request.dto.ts
│   │
│   ├── payroll/                    # Payroll processing
│   │   ├── payroll.controller.ts
│   │   ├── payroll.module.ts
│   │   ├── payroll.service.ts
│   │   └── dto/
│   │       ├── create-payroll-run.dto.ts
│   │       ├── update-salary-structure.dto.ts
│   │       └── create-salary-structure.dto.ts
│   │
│   ├── performance/                # Performance management
│   │   ├── performance.controller.ts
│   │   ├── performance.module.ts
│   │   ├── performance.service.ts
│   │   └── dto/
│   │       ├── create-goal.dto.ts
│   │       └── create-performance-review.dto.ts
│   │
│   ├── recruitment/                # Recruitment & hiring
│   │   ├── recruitment.controller.ts
│   │   ├── recruitment.module.ts
│   │   ├── recruitment.service.ts
│   │   └── dto/
│   │       ├── create-job.dto.ts
│   │       └── create-candidate.dto.ts
│   │
│   ├── compliance/                 # Compliance tracking
│   │   ├── compliance.controller.ts
│   │   ├── compliance.module.ts
│   │   ├── compliance.service.ts
│   │   └── dto/
│   │       ├── create-filing-record.dto.ts
│   │       └── create-policy-acknowledgement.dto.ts
│   │
│   ├── analytics/                  # HR analytics
│   │   ├── analytics.controller.ts
│   │   ├── analytics.module.ts
│   │   └── analytics.service.ts
│   │
│   ├── workflow/                   # Approval workflows
│   │   ├── workflow.controller.ts
│   │   ├── workflow.module.ts
│   │   └── workflow.service.ts
│   │
│   └── scheduler/                  # Background jobs
│       ├── scheduler.module.ts
│       └── scheduler.service.ts
│
├── test/                           # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── nest-cli.json                   # NestJS CLI configuration
├── eslint.config.mjs              # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .env.example                    # Environment variables template
└── HR.README.md                    # Additional HR documentation
```

---

## Modules

### 1. Auth Module

**Purpose**: Authentication and authorization

**Controllers**:
- `POST /auth/login` - User login with email/password
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/logout-all` - Logout all sessions
- `GET /auth/me` - Get current user profile
- `POST /auth/change-password` - Change password

**Services**:
- `login()` - Validates credentials, returns tokens
- `register()` - Creates new user with hashed password
- `refreshTokens()` - Generates new token pair
- `logout()` - Invalidates refresh token
- `getProfile()` - Returns user with permissions

**Features**:
- JWT-based authentication
- Access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- bcrypt password hashing (12 rounds)
- Passport.js JWT strategy

### 2. Users Module

**Purpose**: User account management

**Controllers**:
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/role` - Assign role
- `POST /users/:id/reset-password` - Reset password

**Services**:
- `create()` - Create new user
- `findAll()` - List users with pagination
- `findOne()` - Get single user
- `update()` - Update user details
- `remove()` - Soft delete user
- `assignRole()` - Assign role to user
- `resetPassword()` - Generate new password

### 3. RBAC Module

**Purpose**: Role-based access control

**Controllers**:
- `GET /roles` - List roles
- `GET /roles/:id` - Get role details
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `GET /permissions` - List permissions
- `POST /permissions` - Create permission
- `POST /roles/:id/permissions` - Assign permissions

**Permission Format**: `resource:action`
Examples: `employees:read`, `employees:create`, `payroll:manage`

**Services**:
- `createRole()` - Create new role
- `findAllRoles()` - List all roles
- `assignPermissions()` - Assign permissions to role
- `checkPermission()` - Verify user permission

### 4. Employees Module

**Purpose**: Employee lifecycle management

**Controllers**:
- `GET /employees` - List employees (paginated, filtered)
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create employee
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee
- `GET /employees/:id/team` - Get team members
- `POST /employees/bulk` - Bulk import employees

**Features**:
- Employee profiles with personal info
- Manager assignments
- Department assignments
- Document management
- Employment history
- Bulk operations

**Services**:
- `create()` - Create employee with validations
- `findAll()` - Query with filters
- `findOne()` - Get with relations
- `update()` - Update employee
- `getTeam()` - Get subordinates
- `bulkCreate()` - Import from CSV

### 5. Departments Module

**Purpose**: Organizational structure management

**Controllers**:
- `GET /departments` - List departments
- `GET /departments/:id` - Get department
- `POST /departments` - Create department
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department
- `GET /departments/:id/employees` - Get department employees

**Features**:
- Department hierarchy
- Department heads
- Employee counts
- Cost center tracking

### 6. Attendance Module

**Purpose**: Time and attendance tracking

**Controllers**:
- `GET /attendance` - List attendance records
- `POST /attendance` - Manual attendance entry
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out
- `GET /attendance/stats` - Attendance statistics
- `GET /attendance/today` - Today's attendance

**Cron Jobs**:
- `markAbsentees()` - Runs daily at 11:59 PM
  - Marks employees without check-in as absent
  - Generates attendance report

**Services**:
- `checkIn()` - Record check-in time
- `checkOut()` - Record check-out, calculate hours
- `create()` - Manual entry for exceptions
- `getStats()` - Generate statistics
- `getTodayStats()` - Today's summary

### 7. Leave Module

**Purpose**: Leave management with approval workflows

**Controllers**:
- **Leave Requests**:
  - `GET /leave/requests` - List leave requests
  - `POST /leave/requests` - Create request
  - `GET /leave/requests/:id` - Get request details
  - `POST /leave/requests/:id/approve` - Approve request
  - `POST /leave/requests/:id/reject` - Reject request
  - `POST /leave/requests/:id/cancel` - Cancel request

- **Leave Types**:
  - `GET /leave/types` - List leave types
  - `POST /leave/types` - Create leave type
  - `PATCH /leave/types/:id` - Update leave type

**Cron Jobs**:
- `accrueLeave()` - Monthly leave accrual
- `carryForwardLeave()` - Yearly carry forward

**Services**:
- `createRequest()` - Submit leave request
- `approveRequest()` - Manager approval
- `rejectRequest()` - Manager rejection
- `calculateBalance()` - Calculate available leaves
- `accrueMonthly()` - Monthly leave accrual

### 8. Payroll Module

**Purpose**: Payroll processing and management

**Controllers**:
- `GET /payroll/runs` - List payroll runs
- `POST /payroll/runs` - Create payroll run
- `GET /payroll/runs/:id` - Get payroll run
- `POST /payroll/runs/:id/calculate` - Calculate payroll
- `POST /payroll/runs/:id/approve` - Approve payroll
- `POST /payroll/runs/:id/process` - Process payments
- `GET /payroll/runs/:id/summary` - Payroll summary

- **Salary Structures**:
  - `GET /payroll/salary-structures` - List structures
  - `POST /payroll/salary-structures` - Create structure
  - `GET /payroll/salary-structures/:id` - Get structure
  - `PATCH /payroll/salary-structures/:id` - Update structure

**Services**:
- `createRun()` - Initialize payroll run
- `calculatePayroll()` - Calculate for all employees
- `approvePayroll()` - Manager approval
- `processPayments()` - Final processing
- `generatePayslip()` - Generate payslip PDF

**Payroll Calculation**:
- Basic salary
- Allowances (HRA, DA, etc.)
- Deductions (PF, ESI, TDS, PT)
- Loss of pay (LOP) calculation
- Net salary computation

### 9. Performance Module

**Purpose**: Performance management and reviews

**Controllers**:
- **Goals**:
  - `GET /performance/goals` - List goals
  - `POST /performance/goals` - Create goal
  - `PATCH /performance/goals/:id` - Update goal
  - `POST /performance/goals/:id/progress` - Update progress

- **Reviews**:
  - `GET /performance/reviews` - List reviews
  - `POST /performance/reviews` - Create review
  - `GET /performance/reviews/:id` - Get review
  - `POST /performance/reviews/:id/submit` - Submit review

**Services**:
- `createGoal()` - Set employee goals
- `updateProgress()` - Track goal achievement
- `createReview()` - Initiate review cycle
- `submitReview()` - Complete review
- `calculateRating()` - Compute performance score

### 10. Recruitment Module

**Purpose**: Hiring and candidate management

**Controllers**:
- **Jobs**:
  - `GET /recruitment/jobs` - List job postings
  - `POST /recruitment/jobs` - Create job
  - `GET /recruitment/jobs/:id` - Get job details
  - `PATCH /recruitment/jobs/:id` - Update job
  - `POST /recruitment/jobs/:id/publish` - Publish job
  - `POST /recruitment/jobs/:id/close` - Close job

- **Candidates**:
  - `GET /recruitment/candidates` - List candidates
  - `POST /recruitment/candidates` - Add candidate
  - `GET /recruitment/candidates/:id` - Get candidate
  - `POST /recruitment/candidates/:id/stage` - Move stage
  - `POST /recruitment/candidates/:id/convert` - Convert to employee

**Pipeline Stages**:
1. Applied
2. Screening
3. Interview
4. Offer
5. Hired
6. Rejected

**Services**:
- `createJob()` - Post job opening
- `addCandidate()` - Add applicant
- `moveStage()` - Advance candidate
- `convertToEmployee()` - Hire candidate
- `getPipelineStats()` - Recruitment metrics

### 11. Compliance Module

**Purpose**: Statutory compliance tracking

**Controllers**:
- **Filings**:
  - `GET /compliance/filings` - List filings
  - `POST /compliance/filings` - Create filing
  - `POST /compliance/filings/:id/file` - Mark as filed
  - `POST /compliance/filings/:id/acknowledge` - Acknowledge

- **Policies**:
  - `GET /compliance/policies` - List policies
  - `POST /compliance/policies` - Create policy
  - `POST /compliance/policies/:id/acknowledge` - Acknowledge

**Filing Types**:
- PF (Provident Fund)
- ESI (Employee State Insurance)
- TDS (Tax Deducted at Source)
- GST (Goods and Services Tax)
- PT (Professional Tax)
- ITR (Income Tax Return)

**Services**:
- `createFiling()` - Add filing record
- `markAsFiled()` - Update filing status
- `getDueFilings()` - Overdue filings
- `createPolicy()` - Add policy document
- `trackAcknowledgment()` - Monitor acknowledgments

### 12. Analytics Module

**Purpose**: HR metrics and reporting

**Controllers**:
- `GET /analytics/executive-summary` - High-level summary
- `GET /analytics/attendance` - Attendance metrics
- `GET /analytics/attrition` - Turnover analysis
- `GET /analytics/departments` - Department stats
- `GET /analytics/headcount` - Headcount trends

**Metrics Provided**:
- Total employees
- Active vs inactive
- Department distribution
- Attendance rate
- Attrition rate
- Average tenure
- Gender diversity
- Age distribution

**Services**:
- `getExecutiveSummary()` - CEO dashboard data
- `getAttendanceMetrics()` - Attendance analytics
- `getAttritionAnalysis()` - Turnover trends
- `getDepartmentStats()` - Department breakdown

### 13. Workflow Module

**Purpose**: Approval workflow engine

**Controllers**:
- `GET /approvals` - List approvals
- `GET /approvals/pending` - Pending approvals
- `GET /approvals/:id` - Get approval details
- `POST /approvals/:id/approve` - Approve step
- `POST /approvals/:id/reject` - Reject step
- `GET /approvals/stats` - Approval statistics

**Workflow Types**:
- Leave requests
- Payroll runs
- Employee changes
- Expense claims

**Services**:
- `createWorkflow()` - Initialize approval
- `approveStep()` - Approve current step
- `rejectStep()` - Reject with reason
- `getPending()` - Get pending for user
- `getStats()` - Workflow metrics

### 14. Scheduler Module

**Purpose**: Background job scheduling

**Cron Jobs**:

1. **Daily (11:59 PM)** - `markAbsentees()`
   ```typescript
   @Cron('59 23 * * *')
   async markAbsentees() {
     // Mark employees without check-in as absent
   }
   ```

2. **Monthly (1st, 9:00 AM)** - `accrueLeave()`
   ```typescript
   @Cron('0 9 1 * *')
   async accrueLeave() {
     // Accrue monthly leave balances
   }
   ```

3. **Yearly (Jan 1, 12:00 AM)** - `carryForwardLeave()`
   ```typescript
   @Cron('0 0 1 1 *')
   async carryForwardLeave() {
     // Carry forward unused leaves
   }
   ```

4. **Daily (9:00 AM)** - `sendApprovalReminders()`
   ```typescript
   @Cron('0 9 * * *')
   async sendApprovalReminders() {
     // Send pending approval reminders
   }
   ```

---

## Database Schema

### Complete Model Overview (18 Models)

```prisma
// User & Authentication
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  roleId        String?
  employeeId    String?
  isActive      Boolean        @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
  role          Role?          @relation(fields: [roleId], references: [id])
  employee      Employee?      @relation(fields: [employeeId], references: [id])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// RBAC
model Role {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique
  resource    String
  action      String
  description String?
  createdAt   DateTime         @default(now())
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@id([roleId, permissionId])
}

// Core HR
model Department {
  id          String     @id @default(uuid())
  name        String
  description String?
  headId      String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  head        Employee?  @relation("DepartmentHead", fields: [headId], references: [id])
  employees   Employee[]
}

model Employee {
  id               String            @id @default(uuid())
  employeeCode     String            @unique
  firstName        String
  lastName         String
  email            String            @unique
  phone            String?
  dateOfBirth      DateTime?
  gender           String?
  address          String?
  joinDate         DateTime
  exitDate         DateTime?
  status           EmployeeStatus    @default(ACTIVE)
  departmentId     String?
  managerId        String?
  designation      String?
  employmentType   EmploymentType    @default(FULL_TIME)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  department       Department?       @relation(fields: [departmentId], references: [id])
  manager          Employee?         @relation("ManagerRelation", fields: [managerId], references: [id])
  subordinates     Employee[]        @relation("ManagerRelation")
  departmentsHead  Department[]      @relation("DepartmentHead")
  attendances      Attendance[]
  leaveRequests    LeaveRequest[]
  payrollEntries   PayrollEntry[]
  goals            Goal[]
  reviews          PerformanceReview[]
  candidates       Candidate[]
  salaryStructure  SalaryStructure?
  leaveBalances    LeaveBalance[]
  user             User[]
}

// Attendance
model Attendance {
  id           String           @id @default(uuid())
  employeeId   String
  date         DateTime
  checkIn      DateTime?
  checkOut     DateTime?
  status       AttendanceStatus @default(PRESENT)
  workHours    Float?
  notes        String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  employee     Employee         @relation(fields: [employeeId], references: [id])
  
  @@unique([employeeId, date])
}

// Leave
model LeaveType {
  id            String         @id @default(uuid())
  name          String         @unique
  description   String?
  daysPerYear   Int
  isPaid        Boolean        @default(true)
  isCarryForward Boolean       @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  leaveRequests LeaveRequest[]
  leaveBalances LeaveBalance[]
}

model LeaveBalance {
  id           String    @id @default(uuid())
  employeeId   String
  leaveTypeId  String
  year         Int
  totalDays    Int
  usedDays     Int       @default(0)
  balance      Int
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  employee     Employee  @relation(fields: [employeeId], references: [id])
  leaveType    LeaveType @relation(fields: [leaveTypeId], references: [id])
  
  @@unique([employeeId, leaveTypeId, year])
}

model LeaveRequest {
  id             String        @id @default(uuid())
  employeeId     String
  leaveTypeId    String
  startDate      DateTime
  endDate        DateTime
  days           Int
  reason         String?
  status         LeaveStatus   @default(PENDING)
  approvedBy     String?
  approvedAt     DateTime?
  rejectionReason String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  employee       Employee      @relation(fields: [employeeId], references: [id])
  leaveType      LeaveType     @relation(fields: [leaveTypeId], references: [id])
}

// Payroll
model SalaryStructure {
  id             String   @id @default(uuid())
  employeeId     String   @unique
  basicSalary    Float
  hra            Float    @default(0)
  da             Float    @default(0)
  otherAllowances Float   @default(0)
  pfEmployee     Float    @default(0)
  pfEmployer     Float    @default(0)
  esiEmployee    Float    @default(0)
  esiEmployer    Float    @default(0)
  tds            Float    @default(0)
  professionalTax Float   @default(0)
  effectiveFrom  DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  employee       Employee @relation(fields: [employeeId], references: [id])
}

model PayrollRun {
  id           String         @id @default(uuid())
  month        Int
  year         Int
  status       PayrollStatus  @default(DRAFT)
  totalAmount  Float          @default(0)
  approvedBy   String?
  approvedAt   DateTime?
  processedBy  String?
  processedAt  DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  entries      PayrollEntry[]
}

model PayrollEntry {
  id               String     @id @default(uuid())
  payrollRunId     String
  employeeId       String
  basicSalary      Float
  allowances       Float      @default(0)
  grossSalary      Float
  pfDeduction      Float      @default(0)
  esiDeduction     Float      @default(0)
  tdsDeduction     Float      @default(0)
  professionalTax  Float      @default(0)
  otherDeductions  Float      @default(0)
  totalDeductions  Float      @default(0)
  netSalary        Float
  lopDays          Int        @default(0)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  payrollRun       PayrollRun @relation(fields: [payrollRunId], references: [id])
  employee         Employee   @relation(fields: [employeeId], references: [id])
}

// Performance
model Goal {
  id             String     @id @default(uuid())
  employeeId     String
  title          String
  description    String?
  targetValue    Float
  achievedValue  Float      @default(0)
  startDate      DateTime
  endDate        DateTime
  status         GoalStatus @default(PENDING)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  employee       Employee   @relation(fields: [employeeId], references: [id])
}

model PerformanceReview {
  id           String   @id @default(uuid())
  employeeId   String
  reviewerId   String
  reviewCycle  String
  selfRating   Int?
  managerRating Int?
  finalRating  Int?
  strengths    String?
  improvements String?
  goals        String?
  status       ReviewStatus @default(DRAFT)
  submittedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  employee     Employee @relation(fields: [employeeId], references: [id])
}

// Recruitment
model Job {
  id            String     @id @default(uuid())
  title         String
  description   String
  department    String?
  location      String?
  employmentType String?
  salaryMin     Float?
  salaryMax     Float?
  requirements  String?
  status        JobStatus  @default(OPEN)
  publishedAt   DateTime?
  closedAt      DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  candidates    Candidate[]
}

model Candidate {
  id            String         @id @default(uuid())
  jobId         String
  firstName     String
  lastName      String
  email         String
  phone         String?
  resumeUrl     String?
  source        String?
  stage         CandidateStage @default(APPLIED)
  appliedAt     DateTime       @default(now())
  hiredAt       DateTime?
  employeeId    String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  job           Job            @relation(fields: [jobId], references: [id])
  employee      Employee?      @relation(fields: [employeeId], references: [id])
}

// Compliance
model FilingRecord {
  id             String        @id @default(uuid())
  type           FilingType
  period         String
  dueDate        DateTime?
  filedAt        DateTime?
  filedBy        String?
  receiptNo      String?
  amount         Float?
  status         FilingStatus  @default(PENDING)
  notes          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model PolicyAcknowledgement {
  id             String   @id @default(uuid())
  policyId       String
  employeeId     String
  acknowledgedAt DateTime @default(now())
  ipAddress      String?
  createdAt      DateTime @default(now())
  
  @@unique([policyId, employeeId])
}

// Workflow
model Approval {
  id              String         @id @default(uuid())
  entityType      String
  entityId        String
  requesterId     String
  status          ApprovalStatus @default(PENDING)
  currentStep     Int            @default(1)
  totalSteps      Int            @default(1)
  createdAt       DateTime       @default(now())
  approvedAt      DateTime?
  steps           ApprovalStep[]
}

model ApprovalStep {
  id          String          @id @default(uuid())
  approvalId  String
  stepNumber  Int
  approverId  String
  status      ApprovalStatus  @default(PENDING)
  comments    String?
  actedAt     DateTime?
  createdAt   DateTime        @default(now())
  approval    Approval        @relation(fields: [approvalId], references: [id])
}

// Audit
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String
  entityType  String
  entityId    String?
  oldData     Json?
  newData     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}

// Enums
enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  ON_LEAVE
  WFH
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum PayrollStatus {
  DRAFT
  CALCULATED
  APPROVED
  PROCESSED
}

enum GoalStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ReviewStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  ACKNOWLEDGED
}

enum JobStatus {
  DRAFT
  OPEN
  CLOSED
  ON_HOLD
}

enum CandidateStage {
  APPLIED
  SCREENING
  INTERVIEW
  OFFER
  HIRED
  REJECTED
}

enum FilingType {
  PF
  ESI
  TDS
  GST
  PT
  ITR
  OTHER
}

enum FilingStatus {
  PENDING
  FILED
  ACKNOWLEDGED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## API Documentation

### Response Format

All API responses follow a consistent structure:

**Success Response**:
```json
{
  "data": {
    // Response payload
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error Response**:
```json
{
  "statusCode": 404,
  "timestamp": "2026-02-14T12:00:00.000Z",
  "path": "/api/employees/123",
  "method": "GET",
  "message": "Employee not found",
  "code": "P2025"
}
```

### Authentication

All endpoints (except login/register) require a Bearer token:

```
Authorization: Bearer <access_token>
```

### Endpoints by Module

#### Auth Endpoints
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
GET  /auth/me
POST /auth/change-password
```

#### User Endpoints
```
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
POST   /users/:id/role
POST   /users/:id/reset-password
```

#### RBAC Endpoints
```
GET    /roles
GET    /roles/:id
POST   /roles
PATCH  /roles/:id
DELETE /roles/:id
GET    /permissions
POST   /permissions
POST   /roles/:id/permissions
```

#### Employee Endpoints
```
GET    /employees
GET    /employees/:id
POST   /employees
PATCH  /employees/:id
DELETE /employees/:id
GET    /employees/:id/team
POST   /employees/bulk
```

#### Department Endpoints
```
GET    /departments
GET    /departments/:id
POST   /departments
PATCH  /departments/:id
DELETE /departments/:id
GET    /departments/:id/employees
```

#### Attendance Endpoints
```
GET  /attendance
POST /attendance
POST /attendance/check-in
POST /attendance/check-out
GET  /attendance/stats
GET  /attendance/today
```

#### Leave Endpoints
```
GET    /leave/requests
POST   /leave/requests
GET    /leave/requests/:id
POST   /leave/requests/:id/approve
POST   /leave/requests/:id/reject
POST   /leave/requests/:id/cancel
GET    /leave/types
POST   /leave/types
PATCH  /leave/types/:id
```

#### Payroll Endpoints
```
GET    /payroll/runs
POST   /payroll/runs
GET    /payroll/runs/:id
POST   /payroll/runs/:id/calculate
POST   /payroll/runs/:id/approve
POST   /payroll/runs/:id/process
GET    /payroll/runs/:id/summary
GET    /payroll/salary-structures
POST   /payroll/salary-structures
GET    /payroll/salary-structures/:id
PATCH  /payroll/salary-structures/:id
```

#### Performance Endpoints
```
GET    /performance/goals
POST   /performance/goals
PATCH  /performance/goals/:id
POST   /performance/goals/:id/progress
GET    /performance/reviews
POST   /performance/reviews
GET    /performance/reviews/:id
POST   /performance/reviews/:id/submit
```

#### Recruitment Endpoints
```
GET    /recruitment/jobs
POST   /recruitment/jobs
GET    /recruitment/jobs/:id
PATCH  /recruitment/jobs/:id
POST   /recruitment/jobs/:id/publish
POST   /recruitment/jobs/:id/close
GET    /recruitment/candidates
POST   /recruitment/candidates
GET    /recruitment/candidates/:id
POST   /recruitment/candidates/:id/stage
POST   /recruitment/candidates/:id/convert
```

#### Compliance Endpoints
```
GET   /compliance/filings
POST  /compliance/filings
POST  /compliance/filings/:id/file
POST  /compliance/filings/:id/acknowledge
GET   /compliance/policies
POST  /compliance/policies
POST  /compliance/policies/:id/acknowledge
```

#### Analytics Endpoints
```
GET /analytics/executive-summary
GET /analytics/attendance
GET /analytics/attrition
GET /analytics/departments
GET /analytics/headcount
```

#### Workflow Endpoints
```
GET   /approvals
GET   /approvals/pending
GET   /approvals/:id
POST  /approvals/:id/approve
POST  /approvals/:id/reject
GET   /approvals/stats
```

---

## Authentication & Security

### JWT Strategy

**Access Token**:
- Expiry: 15 minutes
- Contains: userId, email, role
- Stored: Frontend localStorage

**Refresh Token**:
- Expiry: 7 days
- Contains: tokenId, userId
- Stored: Database + Frontend localStorage

**Token Refresh Flow**:
1. Frontend detects 401 error
2. Calls `/auth/refresh` with refreshToken
3. Backend validates and issues new token pair
4. Frontend retries original request

### Permission System

**Permission Format**: `resource:action`

**Examples**:
- `employees:read` - View employees
- `employees:create` - Create employees
- `employees:update` - Update employees
- `employees:delete` - Delete employees
- `payroll:manage` - Full payroll access
- `leave:approve` - Approve leave requests

**Role-Permission Assignment**:
```typescript
// Example: HR Manager role
const hrManagerPermissions = [
  'employees:read', 'employees:create', 'employees:update',
  'leave:read', 'leave:approve',
  'payroll:read', 'payroll:manage',
  'recruitment:read', 'recruitment:manage'
];
```

### Security Features

1. **Password Security**:
   - bcrypt hashing (12 rounds)
   - Minimum 8 characters
   - Complexity requirements

2. **API Security**:
   - Helmet.js for headers
   - CORS configuration
   - Rate limiting (100 req/min)
   - Input sanitization

3. **Audit Logging**:
   - All mutations logged
   - User ID, IP address, timestamp
   - Before/after data snapshots

---

## Configuration

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=3002
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hr_enterprise

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Configuration Files

**nest-cli.json**:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hr-enterprise/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development
npm run start:dev
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Seed with sample data
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Development with hot reload
npm run start:debug        # Debug mode
npm run start:prod         # Production mode

# Building
npm run build              # Production build

# Testing
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests

# Linting & Formatting
npm run lint               # ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Prettier format
```

### Code Structure Conventions

**Controller**:
```typescript
@Controller('employees')
export class EmployeesController {
  @Get()
  findAll(@Query() query: EmployeeListDto) {
    return this.employeesService.findAll(query);
  }
}
```

**Service**:
```typescript
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}
  
  async findAll(params: EmployeeListDto) {
    return this.prisma.employee.findMany({
      where: { /* filters */ },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });
  }
}
```

**DTO**:
```typescript
export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  
  @IsEmail()
  email: string;
}
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- employees.service.spec.ts

# Run with coverage
npm run test:cov
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E in watch mode
npm run test:e2e -- --watch
```

### Test Structure

```typescript
describe('EmployeesService', () => {
  let service: EmployeesService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EmployeesService, PrismaService],
    }).compile();
    
    service = module.get<EmployeesService>(EmployeesService);
  });
  
  it('should create employee', async () => {
    const dto = { firstName: 'John', email: 'john@example.com' };
    const result = await service.create(dto);
    expect(result.firstName).toBe('John');
  });
});
```

---

## Deployment

### Production Build

```bash
# Build application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["node", "dist/main"]
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://prod_user:password@prod-db:5432/hr_enterprise
JWT_SECRET=<strong-secret-key>
JWT_REFRESH_SECRET=<strong-refresh-secret>
```

---

## Cron Jobs

### Automated Tasks

All cron jobs are defined in `scheduler.service.ts`:

1. **Mark Absentees** (Daily 11:59 PM)
   ```typescript
   @Cron('59 23 * * *')
   async markAbsentees() {
     const today = new Date();
     const employees = await this.prisma.employee.findMany({
       where: { status: 'ACTIVE' }
     });
     
     for (const employee of employees) {
       const hasAttendance = await this.prisma.attendance.findFirst({
         where: { employeeId: employee.id, date: today }
       });
       
       if (!hasAttendance) {
         await this.prisma.attendance.create({
           data: {
             employeeId: employee.id,
             date: today,
             status: 'ABSENT'
           }
         });
       }
     }
   }
   ```

2. **Leave Accrual** (Monthly 1st 9:00 AM)
   ```typescript
   @Cron('0 9 1 * *')
   async accrueLeave() {
     const leaveTypes = await this.prisma.leaveType.findMany();
     const employees = await this.prisma.employee.findMany();
     
     for (const employee of employees) {
       for (const leaveType of leaveTypes) {
         await this.leaveService.accrueMonthly(employee.id, leaveType.id);
       }
     }
   }
   ```

---

## Error Handling

### Exception Filters

**HTTP Exception Filter**:
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

**Prisma Exception Filter**:
```typescript
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return new ConflictException('Unique constraint violation');
      case 'P2025':
        return new NotFoundException('Record not found');
    }
  }
}
```

### Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| P2002 | Unique constraint violation | 409 |
| P2025 | Record not found | 404 |
| P2003 | Foreign key constraint failed | 400 |
| P2014 | Invalid relation | 400 |

---

## Performance Optimization

### Database Optimization

1. **Indexes**:
   ```prisma
   model Employee {
     employeeCode String @unique
     email        String @unique
     departmentId String
     managerId    String
     
     @@index([departmentId])
     @@index([managerId])
     @@index([status])
   }
   ```

2. **Query Optimization**:
   ```typescript
   // Good: Select only needed fields
   await this.prisma.employee.findMany({
     select: { id: true, firstName: true, lastName: true },
     where: { status: 'ACTIVE' }
   });
   
   // Good: Use pagination
   await this.prisma.employee.findMany({
     skip: (page - 1) * limit,
     take: limit,
   });
   ```

### Caching Strategy

```typescript
// Use for analytics that don't change frequently
@Injectable()
export class AnalyticsService {
  private cache = new Map<string, { data: any; expires: number }>();
  
  async getCachedStats(key: string) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    const data = await this.calculateStats();
    this.cache.set(key, {
      data,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    return data;
  }
}
```

---

## Monitoring & Logging

### Logging Configuration

```typescript
// app.module.ts
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { singleLine: true }
        }
      }
    })
  ]
})
```

### Audit Logging

```typescript
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}
  
  async log(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
  }) {
    await this.prisma.auditLog.create({
      data: {
        ...data,
        createdAt: new Date()
      }
    });
  }
}
```

---

## Best Practices

### 1. Always Use DTOs
```typescript
// Good
@Post()
async create(@Body() dto: CreateEmployeeDto) {
  return this.service.create(dto);
}

// Bad
@Post()
async create(@Body() data: any) {
  return this.service.create(data);
}
```

### 2. Handle Async Operations
```typescript
// Good
async findAll() {
  try {
    return await this.prisma.employee.findMany();
  } catch (error) {
    this.logger.error('Failed to fetch employees', error);
    throw new InternalServerErrorException();
  }
}
```

### 3. Use Transactions
```typescript
// Good
await this.prisma.$transaction([
  this.prisma.employee.create({ data: employeeData }),
  this.prisma.user.create({ data: userData }),
  this.prisma.auditLog.create({ data: auditData })
]);
```

### 4. Implement Soft Deletes
```typescript
// Good
async remove(id: string) {
  return this.prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

---

## Support

For support, contact the development team or create an issue in the repository.

---

## License

Proprietary and confidential. All rights reserved.

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready
