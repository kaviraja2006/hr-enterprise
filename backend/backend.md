# HR Enterprise Backend Documentation

## 🧠 Architectural Style

**Pattern:** Modular Monolith (Domain-Driven Structure)

The backend is organized by business domains rather than technical layers. Each domain is an isolated NestJS module with its own controllers, services, and DTOs.

---

## 🏗️ Current Root Structure

```
backend/
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Migration files
│
├── generated/
│   └── prisma/                # Generated Prisma client
│
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   │
│   ├── config/
│   │   ├── configuration.ts   # Configuration factory
│   │   └── validation.ts      # Environment validation
│   │
│   ├── database/
│   │   ├── prisma.service.ts  # Prisma client wrapper
│   │   └── prisma.module.ts   # Global database module
│   │
│   ├── common/
│   │   ├── decorators/        # Custom decorators
│   │   ├── guards/            # Authentication guards
│   │   ├── filters/           # Exception filters
│   │   ├── interceptors/      # Request/response interceptors
│   │   ├── pipes/             # Custom pipes
│   │   └── utils/             # Utility functions
│   │
│   ├── auth/                  # ✅ Authentication module
│   ├── users/                 # ✅ Users module
│   ├── rbac/                  # ✅ Role-based access control
│   ├── employees/             # ✅ Core HR module
│   ├── departments/           # ✅ Departments module
│   ├── attendance/            # ✅ Attendance tracking
│   ├── leave/                 # ✅ Leave management
│   ├── payroll/               # ✅ Payroll management
│   ├── performance/           # ✅ Performance reviews
│   ├── recruitment/           # ✅ Recruitment/hiring
│   ├── compliance/            # ✅ Compliance tracking
│   ├── analytics/             # ✅ Analytics & reporting
│   ├── workflow/              # ✅ Approval workflows
│   ├── scheduler/             # ✅ Background jobs
│   │
│   └── shared/
│       ├── audit/             # ✅ Audit logging
│       └── errors/            # Custom error classes
│
└── test/                      # E2E tests
```

---

## 🏛️ Implemented Foundation Layer

### 🔹 Config Module

**Status:** ✅ Implemented

Uses `@nestjs/config` with Joi validation.

**Environment Variables:**
- `PORT` - Server port (default: 3002)
- `NODE_ENV` - Environment mode
- `CORS_ORIGIN` - CORS origin URL
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - Access token expiry (e.g., `15m`)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_REFRESH_EXPIRATION` - Refresh token expiry (e.g., `7d`)
- `BCRYPT_ROUNDS` - Password hashing rounds
- `RATE_LIMIT_TTL` - Rate limit window
- `RATE_LIMIT_MAX` - Max requests per window

### 🔹 Database Layer

**Status:** ✅ Implemented

- **Prisma ORM** with PostgreSQL
- **Driver Adapter** (`@prisma/adapter-pg`) for Prisma 7.x compatibility
- Connection pooling via pg Pool
- Graceful shutdown handling
- Query logging in development

### 🔹 Global Infrastructure

**Guards:**
| Guard | Status | Description |
|-------|--------|-------------|
| `JwtAuthGuard` | ✅ | Validates JWT tokens |
| `RolesGuard` | ✅ | Checks user roles |
| `PermissionsGuard` | ✅ | Checks user permissions |

**Interceptors:**
| Interceptor | Status | Description |
|-------------|--------|-------------|
| `LoggingInterceptor` | ✅ | Logs request/response |
| `TransformInterceptor` | ✅ | Standardizes API responses |

**Filters:**
| Filter | Status | Description |
|--------|--------|-------------|
| `HttpExceptionFilter` | ✅ | Catches HTTP exceptions |
| `PrismaExceptionFilter` | ✅ | Handles Prisma errors |

**Pipes:**
| Pipe | Status | Description |
|------|--------|-------------|
| `ValidationPipe` | ✅ | Global validation (built-in) |
| `ParseUUIDPipe` | ✅ | UUID validation |

---

## 📊 Database Schema

### Implemented Entities

| Entity | Status | Description |
|--------|--------|-------------|
| `User` | ✅ | System user accounts |
| `RefreshToken` | ✅ | JWT refresh tokens |
| `Role` | ✅ | User roles |
| `Permission` | ✅ | Granular permissions |
| `RolePermission` | ✅ | Role-permission mapping |
| `Department` | ✅ | Organizational departments |
| `Employee` | ✅ | Employee records |
| `Attendance` | ✅ | Daily attendance records |
| `LeaveType` | ✅ | Leave categories |
| `LeaveBalance` | ✅ | Employee leave balances |
| `LeaveRequest` | ✅ | Leave applications |
| `SalaryStructure` | ✅ | Salary components |
| `PayrollRun` | ✅ | Monthly payroll runs |
| `PayrollEntry` | ✅ | Individual payroll entries |
| `Goal` | ✅ | Employee goals |
| `PerformanceReview` | ✅ | Performance reviews |
| `Job` | ✅ | Job postings |
| `Candidate` | ✅ | Job candidates |
| `FilingRecord` | ✅ | Statutory filings |
| `PolicyAcknowledgement` | ✅ | Policy acknowledgements |
| `Approval` | ✅ | Approval workflows |
| `ApprovalStep` | ✅ | Workflow steps |
| `AuditLog` | ✅ | System audit trail |

---

## 🔐 Authentication Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| User Registration | ✅ | `POST /auth/register` |
| User Login | ✅ | `POST /auth/login` |
| Token Refresh | ✅ | `POST /auth/refresh` |
| Logout | ✅ | `POST /auth/logout` |
| Logout All Sessions | ✅ | `POST /auth/logout-all` |
| Change Password | ✅ | `POST /auth/change-password` |

### JWT Token Payload

```json
{
  "sub": "userId",
  "email": "user@example.com",
  "roleId": "role-uuid",
  "roleName": "admin",
  "employeeId": "employee-uuid",
  "permissions": ["employee:read", "employee:write"]
}
```

### Security Features

- ✅ bcrypt password hashing
- ✅ Refresh token rotation
- ✅ Token revocation on logout
- ✅ Session invalidation on password change
- ✅ Last login tracking

---

## 👤 Users Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Users | ✅ | `GET /users` |
| Get User by ID | ✅ | `GET /users/:id` |
| Create User | ✅ | `POST /users` |
| Update User | ✅ | `PATCH /users/:id` |
| Deactivate User | ✅ | `DELETE /users/:id` |
| Reset Password | ✅ | `POST /users/:id/reset-password` |
| Assign Role | ✅ | `POST /users/:id/role` |

---

## 🛡️ RBAC Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Roles | ✅ | `GET /rbac/roles` |
| Get Role by ID | ✅ | `GET /rbac/roles/:id` |
| Create Role | ✅ | `POST /rbac/roles` |
| Update Role | ✅ | `PATCH /rbac/roles/:id` |
| Delete Role | ✅ | `DELETE /rbac/roles/:id` |
| List Permissions | ✅ | `GET /rbac/permissions` |
| Create Permission | ✅ | `POST /rbac/permissions` |
| Assign Permissions to Role | ✅ | `POST /rbac/roles/:id/permissions` |

### Permission Format

Permissions follow the pattern: `resource:action`

Examples:
- `employee:read`
- `employee:write`
- `attendance:manage`
- `leave:approve`

---

## 🧍 Employees Module (Core HR)

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Employees | ✅ | `GET /employees` |
| Get Employee by ID | ✅ | `GET /employees/:id` |
| Create Employee | ✅ | `POST /employees` |
| Update Employee | ✅ | `PATCH /employees/:id` |
| Delete Employee | ✅ | `DELETE /employees/:id` |
| Assign Manager | ✅ | `POST /employees/:id/manager` |
| Get Team Members | ✅ | `GET /employees/:id/team` |
| Get Org Hierarchy | ✅ | `GET /employees/:id/hierarchy` |

---

## 🏢 Departments Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Departments | ✅ | `GET /departments` |
| Get Department by ID | ✅ | `GET /departments/:id` |
| Create Department | ✅ | `POST /departments` |
| Update Department | ✅ | `PATCH /departments/:id` |
| Delete Department | ✅ | `DELETE /departments/:id` |
| Assign Department Head | ✅ | `POST /departments/:id/head` |

---

## 🕒 Attendance Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| Check In | ✅ | `POST /attendance/check-in` |
| Check Out | ✅ | `POST /attendance/check-out` |
| Create Manual Entry | ✅ | `POST /attendance` |
| Update Attendance | ✅ | `PATCH /attendance/:id` |
| Get Attendance by ID | ✅ | `GET /attendance/:id` |
| List Attendance Records | ✅ | `GET /attendance` |
| Get Employee Attendance | ✅ | `GET /attendance/employee/:employeeId` |
| Get Attendance Summary | ✅ | `GET /attendance/summary/:employeeId` |

### Attendance Status Types

| Status | Description |
|--------|-------------|
| `present` | Checked in on time |
| `late` | Checked in after 9:15 AM |
| `half-day` | Worked less than 4 hours |
| `absent` | No check-in |
| `on-leave` | Approved leave |

---

## 🏖️ Leave Module

**Status:** ✅ Fully Implemented

### Leave Types

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Leave Types | ✅ | `GET /leave/types` |
| Get Leave Type | ✅ | `GET /leave/types/:id` |
| Create Leave Type | ✅ | `POST /leave/types` |
| Update Leave Type | ✅ | `PATCH /leave/types/:id` |
| Delete Leave Type | ✅ | `DELETE /leave/types/:id` |

### Leave Requests

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Leave Requests | ✅ | `GET /leave/requests` |
| Get Leave Request | ✅ | `GET /leave/requests/:id` |
| Apply for Leave | ✅ | `POST /leave/requests` |
| Approve Leave | ✅ | `POST /leave/requests/:id/approve` |
| Reject Leave | ✅ | `POST /leave/requests/:id/reject` |
| Cancel Leave | ✅ | `POST /leave/requests/:id/cancel` |
| Get My Leave Requests | ✅ | `GET /leave/requests/my` |
| Get Pending Approvals | ✅ | `GET /leave/requests/pending` |

### Leave Balance Management

| Feature | Status | Endpoint |
|---------|--------|----------|
| Get Employee Balances | ✅ | `GET /leave/balances/:employeeId` |
| Initialize Year Balances | ✅ | `POST /leave/balances/initialize` |
| Adjust Balance | ✅ | `POST /leave/balances/:id/adjust` |

---

## 💰 Payroll Module

**Status:** ✅ Fully Implemented

### Salary Structures

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Salary Structures | ✅ | `GET /payroll/structures` |
| Get Salary Structure | ✅ | `GET /payroll/structures/:id` |
| Create Salary Structure | ✅ | `POST /payroll/structures` |
| Update Salary Structure | ✅ | `PATCH /payroll/structures/:id` |
| Delete Salary Structure | ✅ | `DELETE /payroll/structures/:id` |
| Assign to Employee | ✅ | `POST /payroll/structures/:id/assign/:employeeId` |

### Payroll Runs

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Payroll Runs | ✅ | `GET /payroll/runs` |
| Get Payroll Run | ✅ | `GET /payroll/runs/:id` |
| Create Payroll Run | ✅ | `POST /payroll/runs` |
| Calculate Entries | ✅ | `POST /payroll/runs/:id/calculate` |
| Approve Payroll | ✅ | `POST /payroll/runs/:id/approve` |
| Process Payroll | ✅ | `POST /payroll/runs/:id/process` |
| Get Payroll Entries | ✅ | `GET /payroll/runs/:id/entries` |

### Salary Components

| Component | Type | Description |
|-----------|------|-------------|
| `basic` | Earning | Basic salary |
| `hra` | Earning | House rent allowance |
| `conveyance` | Earning | Travel allowance |
| `medicalAllowance` | Earning | Medical allowance |
| `specialAllowance` | Earning | Special allowance |
| `professionalTax` | Deduction | Professional tax |
| `pf` | Deduction | Provident fund |
| `esi` | Deduction | Employee state insurance |

### Business Rules

- ✅ LOP (Loss of Pay) calculation based on attendance
- ✅ Per-day salary calculation (gross/30)
- ✅ Automatic deduction for absent days
- ✅ Payroll status workflow (draft → approved → processed)
- ✅ Prevention of duplicate payroll runs for same month

---

## 📈 Performance Module

**Status:** ✅ Fully Implemented

### Goals

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Goals | ✅ | `GET /performance/goals` |
| Get Goal | ✅ | `GET /performance/goals/:id` |
| Create Goal | ✅ | `POST /performance/goals` |
| Update Goal | ✅ | `PATCH /performance/goals/:id` |
| Delete Goal | ✅ | `DELETE /performance/goals/:id` |
| Update Progress | ✅ | `PATCH /performance/goals/:id/progress` |
| Get Employee Goals | ✅ | `GET /performance/goals/employee/:employeeId` |

### Performance Reviews

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Reviews | ✅ | `GET /performance/reviews` |
| Get Review | ✅ | `GET /performance/reviews/:id` |
| Create Review | ✅ | `POST /performance/reviews` |
| Update Review | ✅ | `PATCH /performance/reviews/:id` |
| Delete Review | ✅ | `DELETE /performance/reviews/:id` |
| Get Employee Reviews | ✅ | `GET /performance/reviews/employee/:employeeId` |
| Get Pending Reviews | ✅ | `GET /performance/reviews/pending` |

### Goal Status

| Status | Description |
|--------|-------------|
| `pending` | Not started |
| `in-progress` | Currently working |
| `completed` | Goal achieved |
| `cancelled` | Goal cancelled |

### Rating Scale

- 1: Needs Improvement
- 2: Below Expectations
- 3: Meets Expectations
- 4: Exceeds Expectations
- 5: Outstanding

---

## 👥 Recruitment Module

**Status:** ✅ Fully Implemented

### Jobs

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Jobs | ✅ | `GET /recruitment/jobs` |
| Get Job | ✅ | `GET /recruitment/jobs/:id` |
| Create Job | ✅ | `POST /recruitment/jobs` |
| Update Job | ✅ | `PATCH /recruitment/jobs/:id` |
| Delete Job | ✅ | `DELETE /recruitment/jobs/:id` |
| Close Job | ✅ | `POST /recruitment/jobs/:id/close` |
| Reopen Job | ✅ | `POST /recruitment/jobs/:id/reopen` |

### Candidates

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Candidates | ✅ | `GET /recruitment/candidates` |
| Get Candidate | ✅ | `GET /recruitment/candidates/:id` |
| Create Candidate | ✅ | `POST /recruitment/candidates` |
| Update Candidate | ✅ | `PATCH /recruitment/candidates/:id` |
| Delete Candidate | ✅ | `DELETE /recruitment/candidates/:id` |
| Move to Stage | ✅ | `POST /recruitment/candidates/:id/stage` |
| Convert to Employee | ✅ | `POST /recruitment/candidates/:id/convert` |
| Get Job Candidates | ✅ | `GET /recruitment/jobs/:id/candidates` |

### Job Status

| Status | Description |
|--------|-------------|
| `open` | Accepting applications |
| `closed` | Position filled/closed |
| `on-hold` | Temporarily paused |

### Candidate Stages

| Stage | Description |
|-------|-------------|
| `applied` | Initial application |
| `screening` | Resume screening |
| `interview` | Interview process |
| `offered` | Offer extended |
| `hired` | Accepted offer |
| `rejected` | Rejected |

---

## 📋 Compliance Module

**Status:** ✅ Fully Implemented

### Filing Records

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Filings | ✅ | `GET /compliance/filings` |
| Get Filing | ✅ | `GET /compliance/filings/:id` |
| Create Filing | ✅ | `POST /compliance/filings` |
| Update Filing | ✅ | `PATCH /compliance/filings/:id` |
| Delete Filing | ✅ | `DELETE /compliance/filings/:id` |
| Mark as Filed | ✅ | `POST /compliance/filings/:id/file` |
| Get Dashboard | ✅ | `GET /compliance/dashboard` |

### Policy Acknowledgements

| Feature | Status | Endpoint |
|---------|--------|----------|
| List Acknowledgements | ✅ | `GET /compliance/acknowledgements` |
| Get Acknowledgement | ✅ | `GET /compliance/acknowledgements/:id` |
| Create Acknowledgement | ✅ | `POST /compliance/acknowledgements` |
| Get Employee Acknowledgements | ✅ | `GET /compliance/acknowledgements/employee/:employeeId` |

### Filing Types

| Type | Description |
|------|-------------|
| `PF` | Provident Fund |
| `ESI` | Employee State Insurance |
| `TDS` | Tax Deducted at Source |
| `PT` | Professional Tax |
| `GST` | Goods and Services Tax |

### Filing Status

| Status | Description |
|--------|-------------|
| `pending` | Not yet filed |
| `filed` | Successfully filed |
| `overdue` | Past due date |

---

## 📊 Analytics Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| Executive Summary | ✅ | `GET /analytics/executive-summary` |
| Attendance Metrics | ✅ | `GET /analytics/attendance` |
| Leave Metrics | ✅ | `GET /analytics/leave` |
| Payroll Metrics | ✅ | `GET /analytics/payroll` |
| Attrition Rate | ✅ | `GET /analytics/attrition` |
| Department Analytics | ✅ | `GET /analytics/departments` |

### Executive Summary Includes

- Total employees
- Active employees count
- New joinings (current month)
- Attrition count
- Department breakdown
- Attendance summary
- Pending leave requests
- Pending approvals

### Metrics Available

- **Attendance**: Present %, late %, absent %, average work hours
- **Leave**: Leave utilization, pending requests, by type breakdown
- **Payroll**: Total disbursed, average salary, by department
- **Attrition**: Monthly rate, yearly rate, by department

---

## 🔄 Workflow Module

**Status:** ✅ Fully Implemented

### Features

| Feature | Status | Endpoint |
|---------|--------|----------|
| Create Approval | ✅ | `POST /workflow/approvals` |
| Get Approval | ✅ | `GET /workflow/approvals/:id` |
| List Approvals | ✅ | `GET /workflow/approvals` |
| Approve Step | ✅ | `POST /workflow/approvals/:id/approve` |
| Reject Step | ✅ | `POST /workflow/approvals/:id/reject` |
| Get Pending Approvals | ✅ | `GET /workflow/approvals/pending` |
| Get Approval History | ✅ | `GET /workflow/approvals/:id/history` |

### Supported Entity Types

- `leave_request` - Leave approvals
- `payroll_run` - Payroll approvals
- `expense_claim` - Expense approvals (future)

### Approval Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting approval |
| `approved` | Fully approved |
| `rejected` | Rejected at some step |

### Step Status

| Status | Description |
|--------|-------------|
| `pending` | Waiting for this step |
| `approved` | Step approved |
| `rejected` | Step rejected |

---

## ⏰ Scheduler Module (Background Jobs)

**Status:** ✅ Fully Implemented

### Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Mark Absentees | Daily 11:59 PM IST | Mark employees without check-in as absent |
| Leave Accrual | Monthly 1st 12:05 AM IST | Add monthly leave balance |
| Leave Carry Forward | Yearly Jan 1st 12:10 AM IST | Carry forward remaining leaves |
| Pending Approval Reminders | Daily 9:00 AM IST | Send reminders for pending approvals |
| Compliance Due Check | Daily 8:00 AM IST | Check for upcoming filing due dates |

---

## 📝 Audit Logging

**Status:** ✅ Implemented

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| Log Actions | ✅ | Automatic logging of key actions |
| Query Logs | ✅ | Filter by user, entity, action, date |
| Entity History | ✅ | Get all logs for specific entity |

### Logged Information

- User who performed the action
- Action type (create, update, delete, etc.)
- Entity type and ID
- Old and new values (JSON)
- IP address
- User agent
- Timestamp

---

## 📈 API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🔒 Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Helmet | ✅ | HTTP headers security |
| CORS | ✅ | Configured CORS origin |
| Rate Limiting | ✅ | Configurable rate limits |
| Password Hashing | ✅ | bcrypt with configurable rounds |
| JWT Authentication | ✅ | Access + refresh tokens |
| Role-Based Access | ✅ | Role guard |
| Permission-Based Access | ✅ | Permission guard |
| Input Validation | ✅ | class-validator DTOs |

---

## 📊 Current Implementation Status

```
Overall Progress: 100%

Foundation Layer:     ████████████████████ 100%
Authentication:       ████████████████████ 100%
User Management:      ████████████████████ 100%
RBAC:                 ████████████████████ 100%
Core HR (Employees):  ████████████████████ 100%
Departments:          ████████████████████ 100%
Attendance:           ████████████████████ 100%
Leave Management:     ████████████████████ 100%
Payroll:              ████████████████████ 100%
Performance:          ████████████████████ 100%
Recruitment:          ████████████████████ 100%
Compliance:           ████████████████████ 100%
Analytics:            ████████████████████ 100%
Workflow:             ████████████████████ 100%
Background Jobs:      ████████████████████ 100%
Audit Logging:        ████████████████████ 100%
```

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development server
pnpm start:dev
```

---

## 🛠️ Technical Debt / Future Enhancements

1. **Tests** - E2E tests need to be written
2. **API Documentation** - Swagger/OpenAPI integration
3. **Performance Optimization** - Add database indexes
4. **Caching** - Redis integration for frequently accessed data
5. **Logging** - Structured logging with log levels
6. **Monitoring** - Health checks and metrics endpoints
7. **Email Notifications** - For approvals, reminders
8. **File Upload Service** - For documents, resumes
9. **Employee Documents** - Document management
10. **Company Calendar** - Holidays, events
11. **Shift Management** - Shift scheduling
12. **Expense Claims** - Expense management

---

## 📝 License

Private - HR Enterprise System
