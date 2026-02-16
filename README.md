# HR Enterprise - Complete Human Resources Management System

## 📖 Project Overview

HR Enterprise is a comprehensive, enterprise-grade Human Resources Management System (HRMS) built with modern web technologies. It provides a complete solution for managing employees, tracking attendance, processing payroll, handling leave requests, managing recruitment, ensuring compliance, and providing advanced analytics.

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: February 2026

---

## 🎯 Key Features

### Core HR Modules
- **Employee Management** - Complete employee lifecycle management with profiles, documents, and history
- **Department Management** - Organizational structure with department hierarchy
- **Attendance Tracking** - Real-time attendance monitoring with check-in/out, manual entries, and automated absence marking
- **Leave Management** - Comprehensive leave system with types, balances, accrual, and approval workflows

### Payroll & Performance
- **Payroll Processing** - Automated payroll runs with salary structures, deductions, and payment processing
- **Performance Management** - Goal setting, performance reviews, and employee development tracking

### Recruitment & Compliance
- **Recruitment** - Job postings, candidate tracking, interview scheduling, and hiring pipeline
- **Compliance Management** - Statutory filings, policy acknowledgments, and regulatory compliance tracking

### Analytics & Workflow
- **HR Analytics** - Executive dashboards, attendance metrics, attrition analysis, department analytics
- **Approval Workflows** - Multi-step approval processes for leaves, payroll, and other requests

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HR ENTERPRISE SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │   FRONTEND      │◄───────►│    BACKEND      │                │
│  │   (React 19)    │  HTTP   │   (NestJS 11)   │                │
│  │   Port: 3000    │         │   Port: 3002    │                │
│  └─────────────────┘         └────────┬────────┘                │
│                                       │                          │
│                                       ▼                          │
│                              ┌─────────────────┐                │
│                              │   PostgreSQL    │                │
│                              │   (Prisma ORM)  │                │
│                              │   Port: 5432    │                │
│                              └─────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend (NestJS)
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 7.x |
| Authentication | Passport.js + JWT | - |
| Validation | class-validator | - |
| Documentation | Swagger/OpenAPI | - |
| Scheduling | @nestjs/schedule | - |
| Security | Helmet, CORS, Throttler | - |

#### Frontend (React)
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.9.x |
| Build Tool | Vite | 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| Routing | React Router | 7.2.0 |
| State Management | React Query | 5.90.21 |
| HTTP Client | Axios | 1.13.5 |
| Charts | Recharts | 2.15.0 |
| Icons | Lucide React | - |

---

## 📁 Project Structure

```
hr-enterprise/
├── backend/                    # NestJS Backend Application
│   ├── prisma/                # Database schema & migrations
│   │   ├── schema.prisma      # 18 models, 520+ lines
│   │   ├── seed.ts           # Database seeding
│   │   └── migrations/       # Migration history
│   ├── src/                  # Source code
│   │   ├── main.ts           # Application entry point
│   │   ├── app.module.ts     # Root module
│   │   ├── config/           # Configuration (env, validation)
│   │   ├── database/         # Prisma module & service
│   │   ├── common/           # Guards, interceptors, decorators
│   │   ├── shared/           # Shared utilities (audit, errors)
│   │   └── [16 modules]/     # Domain modules (see below)
│   ├── test/                 # E2E tests
│   ├── package.json          # Dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── nest-cli.json         # NestJS CLI config
│
├── frontend/                  # React Frontend Application
│   ├── src/
│   │   ├── main.tsx          # Application entry
│   │   ├── app/              # Application layer (router, providers)
│   │   ├── config/           # Configuration (env, routes, navigation)
│   │   ├── core/             # Core framework layer
│   │   │   ├── api/          # HTTP infrastructure (axios, api-client)
│   │   │   ├── auth/         # Authentication context & hooks
│   │   │   ├── layout/       # Layout components (Header, Sidebar)
│   │   │   ├── rbac/         # Permission hooks
│   │   │   └── types/        # Core type definitions
│   │   ├── modules/          # Feature modules (13 modules)
│   │   └── shared/           # Shared components & utilities
│   ├── package.json          # Dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript config
│
├── api-documentation.md       # Complete API reference (1380 lines)
├── architect.md              # System architecture overview
├── implementation-plan.md    # New modules implementation plan
├── testing-strategy.md       # Testing approach
├── data-flow-documentation.md # Data flow diagrams
├── future-roadmap.md         # Strategic roadmap
└── README.md                 # This file
```

---

## 🔧 Backend Architecture

### Domain Modules (16 Total)

#### Core HR Modules
1. **Auth Module** (`src/auth/`)
   - JWT authentication with access & refresh tokens
   - User registration and login
   - Password hashing with bcrypt
   - Token refresh mechanism
   - Profile management

2. **Users Module** (`src/users/`)
   - User CRUD operations
   - Role assignment
   - Password reset
   - User status management

3. **RBAC Module** (`src/rbac/`)
   - Role-based access control
   - Permission management
   - Role-permission assignments
   - Granular permissions (`resource:action` format)

4. **Employees Module** (`src/employees/`)
   - Employee CRUD operations
   - Manager assignments
   - Team hierarchy
   - Employee documents
   - Bulk operations

5. **Departments Module** (`src/departments/`)
   - Department CRUD
   - Department heads
   - Employee counts
   - Hierarchical structure

#### Operations Modules
6. **Attendance Module** (`src/attendance/`)
   - Check-in/check-out tracking
   - Manual attendance entry
   - Attendance reports
   - Cron jobs for auto-marking absentees
   - Work hours calculation

7. **Leave Module** (`src/leave/`)
   - Leave type management
   - Leave balance tracking
   - Leave request workflow
   - Approval/rejection process
   - Cron jobs for leave accrual
   - Carry forward policies

8. **Payroll Module** (`src/payroll/`)
   - Salary structure management
   - Payroll run creation
   - Payroll calculation
   - Approval workflow
   - Payment processing
   - Payroll entries per employee

9. **Performance Module** (`src/performance/`)
   - Goal setting and tracking
   - Performance reviews
   - Review cycles
   - Rating systems
   - Employee development plans

#### Extended Modules
10. **Recruitment Module** (`src/recruitment/`)
    - Job posting management
    - Candidate tracking
    - Interview scheduling
    - Hiring pipeline (applied → screening → interview → offer → hired)
    - Candidate-to-employee conversion

11. **Compliance Module** (`src/compliance/`)
    - Statutory filings (PF, ESI, TDS, GST, PT, ITR)
    - Filing status tracking
    - Policy acknowledgments
    - Compliance reporting
    - Due date monitoring

12. **Analytics Module** (`src/analytics/`)
    - Executive summary dashboard
    - Attendance analytics
    - Attrition analysis
    - Department-wise metrics
    - Custom reports

13. **Workflow Module** (`src/workflow/`)
    - Approval workflow engine
    - Multi-step approvals
    - Approval history
    - Workflow templates
    - Email notifications

14. **Scheduler Module** (`src/scheduler/`)
    - Background job scheduling
    - Cron jobs for attendance
    - Leave accrual jobs
    - Approval reminders
    - Report generation

15. **Database Module** (`src/database/`)
    - Prisma service
    - Database connection
    - Transaction handling

16. **Shared Module** (`src/shared/`)
    - Audit logging service
    - Error handling utilities
    - Common exceptions

### Database Schema (18 Models)

#### User & Authentication
- `User` - User accounts and credentials
- `RefreshToken` - JWT refresh tokens

#### RBAC
- `Role` - User roles
- `Permission` - Available permissions
- `RolePermission` - Role-permission mappings

#### Core HR
- `Department` - Organizational departments
- `Employee` - Employee records with manager relations

#### Attendance
- `Attendance` - Daily attendance records

#### Leave
- `LeaveType` - Types of leave (Casual, Sick, etc.)
- `LeaveBalance` - Employee leave balances
- `LeaveRequest` - Leave applications

#### Payroll
- `SalaryStructure` - Employee salary configurations
- `PayrollRun` - Payroll processing runs
- `PayrollEntry` - Individual employee payroll entries

#### Performance
- `Goal` - Employee goals and objectives
- `PerformanceReview` - Performance review records

#### Recruitment
- `Job` - Job postings
- `Candidate` - Job candidates

#### Compliance
- `FilingRecord` - Statutory filing records
- `PolicyAcknowledgement` - Policy acknowledgment tracking

#### Workflow
- `Approval` - Approval requests
- `ApprovalStep` - Individual approval steps

#### Audit
- `AuditLog` - System audit logs

---

## 🎨 Frontend Architecture

### Module Structure (13 Modules)

#### Core Modules
1. **Auth Module** (`src/modules/auth/`)
   - LoginPage - User authentication
   - RegisterPage - User registration
   - LoginForm - Login form component
   - RegisterForm - Registration form component

2. **Employees Module** (`src/modules/employees/`)
   - EmployeeListPage - Employee directory with search/filter
   - EmployeeDetailPage - Individual employee profile
   - EmployeeList - Employee table component
   - Hooks: useEmployee

3. **Departments Module** (`src/modules/departments/`)
   - DepartmentListPage - Department listing
   - Hooks: useDepartment

#### Operations Modules
4. **Attendance Module** (`src/modules/attendance/`)
   - AttendanceDashboard - Real-time attendance overview
   - AttendanceList - Detailed attendance records
   - Hooks: useAttendance

5. **Leave Module** (`src/modules/leave/`)
   - LeaveDashboard - Leave overview dashboard
   - LeaveRequests - Leave request management
   - Hooks: useLeave

6. **Payroll Module** (`src/modules/payroll/`)
   - PayrollDashboard - Payroll overview
   - PayrollRuns - Payroll run management
   - PayrollRunDetails - Individual payroll details
   - Hooks: usePayroll

7. **Performance Module** (`src/modules/performance/`)
   - PerformanceDashboard - Performance overview
   - GoalsPage - Goal management
   - ReviewsPage - Performance reviews
   - Hooks: usePerformance

#### Extended Modules
8. **Recruitment Module** (`src/modules/recruitment/`)
   - RecruitmentDashboard - Hiring pipeline overview
   - JobsPage - Job posting management
   - CandidatesPage - Candidate tracking
   - Hooks: useRecruitment

9. **Compliance Module** (`src/modules/compliance/`)
   - ComplianceDashboard - Compliance overview
   - FilingsPage - Statutory filing management
   - Hooks: useCompliance

10. **Analytics Module** (`src/modules/analytics/`)
    - AttritionAnalytics - Employee turnover analysis
    - DepartmentAnalytics - Department-wise metrics
    - Hooks: useAnalytics

11. **Workflow Module** (`src/modules/workflow/`)
    - ApprovalsPage - Approval request management
    - Hooks: useWorkflow

12. **Settings Module** (`src/modules/settings/`)
    - RolesPage - Role management
    - PermissionsPage - Permission management
    - SystemSettings - System configuration
    - Hooks: useSettings

13. **Executive Module** (`src/modules/executive/`)
    - ExecutiveDashboard - High-level HR metrics
    - ExecutiveCharts - Data visualizations
    - ExecutiveKpis - Key performance indicators
    - Hooks: useExecutive

### Core Layer Structure

#### API Layer (`src/core/api/`)
- `axios.ts` - Axios instance with interceptors
- `api-client.ts` - API client wrapper with response unwrapping
- Request/response interceptors for JWT tokens
- Automatic token refresh on 401 errors

#### Authentication (`src/core/auth/`)
- `auth-context.tsx` - React Context for auth state
- `auth-context-def.ts` - Context definition
- `use-auth-context.tsx` - useAuthContext hook
- `auth-service.ts` - Authentication API calls
- `protected-route.tsx` - Route protection component

#### Layout (`src/core/layout/`)
- `DashboardLayout.tsx` - Main dashboard layout
- `Header.tsx` - Top navigation header
- `Sidebar.tsx` - Side navigation menu

#### RBAC (`src/core/rbac/`)
- `permission-hook.ts` - Permission checking hooks
- usePermission, usePermissions, useAnyPermission

### Shared Components (`src/shared/`)

#### UI Components (`src/shared/components/ui/`)
- `Button.tsx` - Button component with variants
- `Card.tsx` - Card container component
- `Badge.tsx` - Status badge component
- `Modal.tsx` - Modal dialog component
- `Spinner.tsx` - Loading spinner

#### Utilities (`src/shared/utils/`)
- `cn.ts` - Tailwind class merging utility

### Route Structure

```
Public Routes:
  /login                    - Login page
  /register                 - Registration page

Protected Routes:
  /                         - Redirects to /dashboard
  /dashboard                - Executive dashboard
  /employees                - Employee list
  /employees/:id            - Employee details
  /departments              - Department list
  /attendance               - Attendance dashboard
  /attendance/list          - Attendance records
  /leave                    - Leave dashboard
  /leave/requests           - Leave requests
  /payroll                  - Payroll dashboard
  /payroll/runs             - Payroll runs
  /payroll/runs/:id         - Payroll run details
  /performance              - Performance dashboard
  /performance/goals        - Goals management
  /performance/reviews      - Performance reviews
  /recruitment              - Recruitment dashboard
  /recruitment/jobs         - Job postings
  /recruitment/candidates   - Candidate tracking
  /compliance               - Compliance dashboard
  /compliance/filings       - Statutory filings
  /analytics/attrition      - Attrition analysis
  /analytics/departments    - Department analytics
  /approvals                - Approval workflows
  /settings/roles           - Role management
  /settings/permissions     - Permission management
  /settings/system          - System settings
```

---

## 🔐 Security Features

### Backend Security
- **JWT Authentication** - Access tokens (15 min expiry) + refresh tokens
- **Password Hashing** - bcrypt with 12 rounds
- **RBAC** - Granular permissions (resource:action format)
- **Input Validation** - class-validator DTOs
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **Rate Limiting** - 100 requests per minute per IP
- **Audit Logging** - All mutations logged with user and timestamp

### Frontend Security
- **Protected Routes** - Authentication checks on all private routes
- **Permission Guards** - Route-level permission checking
- **Token Storage** - JWT stored in localStorage
- **Auto Refresh** - Automatic token refresh before expiry
- **XSS Prevention** - React's built-in XSS protection
- **CSRF Protection** - SameSite cookie policies

---

## 📊 API Overview

### Base URL
```
Development: http://localhost:3002
Production: https://api.yourdomain.com
```

### Authentication
All endpoints (except login/register) require Bearer token:
```
Authorization: Bearer <access_token>
```

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh tokens
- `GET /auth/me` - Get current user profile

#### Employees
- `GET /employees` - List employees
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create employee
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

#### Attendance
- `GET /attendance` - List attendance records
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out
- `POST /attendance` - Manual attendance entry

#### Leave
- `GET /leave/requests` - List leave requests
- `POST /leave/requests` - Create leave request
- `POST /leave/requests/:id/approve` - Approve leave
- `POST /leave/requests/:id/reject` - Reject leave

#### Payroll
- `GET /payroll/runs` - List payroll runs
- `POST /payroll/runs` - Create payroll run
- `POST /payroll/runs/:id/calculate` - Calculate payroll
- `POST /payroll/runs/:id/approve` - Approve payroll
- `POST /payroll/runs/:id/process` - Process payments

For complete API documentation, see [api-documentation.md](api-documentation.md)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or pnpm

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- API Documentation: http://localhost:3002/api/docs (Swagger)

---

## 📝 Scripts

### Backend
```bash
npm run start:dev      # Development mode with hot reload
npm run start:debug    # Debug mode
npm run build          # Production build
npm run start:prod     # Production mode
npm run test           # Run tests
npm run test:e2e       # E2E tests
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

### Frontend
```bash
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Jest for services and utilities
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Full workflow testing

### Frontend Testing
- **Unit Tests**: Vitest for components and hooks
- **Integration Tests**: React Testing Library
- **E2E Tests**: Playwright for full user workflows

See [testing-strategy.md](testing-strategy.md) for detailed testing approach.

---

## 📈 Performance Optimizations

### Backend
- Database indexing on frequently queried fields
- Query optimization with Prisma
- Response caching for analytics
- Lazy loading of relations
- Pagination for large datasets

### Frontend
- Lazy loading of routes (React.lazy)
- React Query caching
- Optimistic updates
- Debounced search inputs
- Virtual scrolling for large lists

---

## 🔄 Background Jobs

### Cron Jobs (Automated Tasks)
1. **Mark Absentees** - Daily at 11:59 PM
   - Marks employees who didn't check in as absent

2. **Leave Accrual** - Monthly (1st of month)
   - Accrues leave balances based on policies

3. **Leave Carry Forward** - Yearly (January 1st)
   - Carries forward unused leaves

4. **Approval Reminders** - Daily at 9:00 AM
   - Sends reminders for pending approvals

---

## 📚 Documentation

### Complete Documentation Suite
1. **[api-documentation.md](api-documentation.md)** - Complete API reference (1380+ lines)
2. **[architect.md](architect.md)** - System architecture overview
3. **[backend/backend-architecture.md](backend/backend-architecture.md)** - Backend architecture (1410+ lines)
4. **[frontend/frontend-architecture.md](frontend/frontend-architecture.md)** - Frontend architecture (1088+ lines)
5. **[data-flow-documentation.md](data-flow-documentation.md)** - Data flow diagrams
6. **[implementation-plan.md](implementation-plan.md)** - New modules implementation plan
7. **[testing-strategy.md](testing-strategy.md)** - Testing strategy
8. **[future-roadmap.md](future-roadmap.md)** - Strategic roadmap

---

## 🛣️ Roadmap

### Completed Features ✅
- Employee management
- Department management
- Attendance tracking
- Leave management with workflows
- Payroll processing
- Performance management
- Recruitment pipeline
- Compliance tracking
- Analytics dashboards
- Approval workflows
- RBAC system

### Planned Features 📋
- Employee Engagement & Culture Module
- Advanced HR Analytics Module
- Mobile application
- Email notifications
- SMS alerts
- Advanced reporting
- Data export/import
- Multi-tenancy support

See [future-roadmap.md](future-roadmap.md) for detailed roadmap.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 👥 Team

**Development Team**: HR Enterprise Team  
**Last Updated**: February 2026  
**Version**: 1.0.0

---

## 📞 Support

For support, email support@hrenterprise.com or create an issue in the repository.

---

**Happy Coding! 🚀**
