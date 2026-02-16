# HR Enterprise Frontend

## Overview

The HR Enterprise Frontend is a modern, responsive web application built with React 19 and TypeScript. It provides an intuitive user interface for managing all HR operations including employee management, attendance tracking, payroll processing, leave management, recruitment, compliance, and advanced analytics.

**Framework**: React 19.2.0  
**Language**: TypeScript 5.9.x  
**Build Tool**: Vite 7.3.1  
**Styling**: Tailwind CSS 4.1.18  
**State Management**: React Query 5.90.21  
**HTTP Client**: Axios 1.13.5  

---

## Table of Contents

1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Modules](#modules)
5. [Routing](#routing)
6. [Authentication](#authentication)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [UI Components](#ui-components)
10. [Configuration](#configuration)
11. [Getting Started](#getting-started)
12. [Development](#development)
13. [Building](#building)
14. [Testing](#testing)

---

## Architecture

### Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HR ENTERPRISE FRONTEND                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     REACT APP LAYER                      │    │
│  │  - Router Configuration  - Authentication Context        │    │
│  │  - Global Providers      - Error Boundaries              │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   FEATURE MODULES LAYER                  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │  Auth   │ │Employee │ │Attendance│ │   Payroll   │   │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │    │
│  │       │           │           │              │          │    │
│  │  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌──────┴──────┐   │    │
│  │  │  Leave  │ │Performance│ │Recruitment│ │ Compliance │   │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │    │
│  │       │           │           │              │          │    │
│  │  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌──────┴──────┐   │    │
│  │  │Analytics│ │ Workflow│ │ Settings│ │  Executive  │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     CORE FRAMEWORK LAYER                 │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐   │    │
│  │  │   API       │ │    Auth     │ │      Layout      │   │    │
│  │  │ (Axios)     │ │  (Context)  │ │  (Components)    │   │    │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘   │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     SHARED LAYER                         │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐   │    │
│  │  │ UI Components│ │  Utilities  │ │  Hooks           │   │    │
│  │  │ (Tailwind)   │ │  (Helpers)  │ │  (Reusable)      │   │    │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action
     ↓
React Component
     ↓
React Query Hook (useMutation/useQuery)
     ↓
API Service (axios/api-client)
     ↓
Axios Interceptor (add JWT token)
     ↓
HTTP Request → Backend API
     ↓
Backend Response
     ↓
Axios Interceptor (unwrap response)
     ↓
React Query Cache Update
     ↓
UI Re-render with new data
```

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── app.tsx                     # Root App component
│   │
│   ├── app/                        # Application layer
│   │   ├── router.tsx              # React Router configuration
│   │   ├── providers.tsx           # Global providers (QueryClient, Auth)
│   │   └── components/             # Router components
│   │       ├── loading-components.tsx    # LoadingFallback, SuspenseWrapper
│   │       └── public-route.tsx          # PublicRoute component
│   │
│   ├── config/                     # Configuration files
│   │   ├── env.ts                  # Environment variables
│   │   ├── routes.ts               # Route constants
│   │   └── navigation.ts           # Sidebar navigation items
│   │
│   ├── core/                       # Core framework layer
│   │   ├── api/                    # HTTP infrastructure
│   │   │   ├── axios.ts            # Axios instance with interceptors
│   │   │   └── api-client.ts       # API client wrapper
│   │   │
│   │   ├── auth/                   # Authentication system
│   │   │   ├── auth-context.tsx    # React Context for auth state
│   │   │   ├── auth-context-def.ts # Context definition
│   │   │   ├── auth-service.ts     # Authentication API calls
│   │   │   ├── auth-types.ts       # Auth type definitions
│   │   │   ├── use-auth-context.tsx # useAuthContext hook
│   │   │   └── protected-route.tsx # Route protection component
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── DashboardLayout.tsx # Main dashboard layout
│   │   │   ├── Header.tsx          # Top navigation header
│   │   │   └── Sidebar.tsx         # Side navigation menu
│   │   │
│   │   ├── rbac/                   # Role-based access control
│   │   │   └── permission-hook.ts  # Permission checking hooks
│   │   │
│   │   └── types/                  # Core type definitions
│   │       └── user.types.ts       # User type definitions
│   │
│   ├── modules/                    # Feature modules (13 modules)
│   │   ├── auth/                   # Authentication module
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   │
│   │   ├── employees/              # Employee management
│   │   │   ├── pages/
│   │   │   │   ├── EmployeeListPage.tsx
│   │   │   │   └── EmployeeDetailPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEmployee.ts
│   │   │   └── services/
│   │   │       └── employee.api.ts
│   │   │
│   │   ├── departments/            # Department management
│   │   │   ├── pages/
│   │   │   │   └── DepartmentListPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDepartment.ts
│   │   │   └── services/
│   │   │       └── department.api.ts
│   │   │
│   │   ├── attendance/             # Attendance tracking
│   │   │   ├── pages/
│   │   │   │   ├── AttendanceDashboard.tsx
│   │   │   │   └── AttendanceList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAttendance.ts
│   │   │   └── services/
│   │   │       └── attendance.api.ts
│   │   │
│   │   ├── leave/                  # Leave management
│   │   │   ├── pages/
│   │   │   │   ├── LeaveDashboard.tsx
│   │   │   │   └── LeaveRequests.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLeave.ts
│   │   │   └── services/
│   │   │       └── leave.api.ts
│   │   │
│   │   ├── payroll/                # Payroll processing
│   │   │   ├── pages/
│   │   │   │   ├── PayrollDashboard.tsx
│   │   │   │   ├── PayrollRuns.tsx
│   │   │   │   └── PayrollRunDetails.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePayroll.ts
│   │   │   └── services/
│   │   │       └── payroll.api.ts
│   │   │
│   │   ├── performance/            # Performance management
│   │   │   ├── pages/
│   │   │   │   ├── PerformanceDashboard.tsx
│   │   │   │   ├── GoalsPage.tsx
│   │   │   │   └── ReviewsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePerformance.ts
│   │   │   └── services/
│   │   │       └── performance.api.ts
│   │   │
│   │   ├── recruitment/            # Recruitment & hiring
│   │   │   ├── pages/
│   │   │   │   ├── RecruitmentDashboard.tsx
│   │   │   │   ├── JobsPage.tsx
│   │   │   │   └── CandidatesPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useRecruitment.ts
│   │   │   └── services/
│   │   │       └── recruitment.api.ts
│   │   │
│   │   ├── compliance/             # Compliance tracking
│   │   │   ├── pages/
│   │   │   │   ├── ComplianceDashboard.tsx
│   │   │   │   └── FilingsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCompliance.ts
│   │   │   └── services/
│   │   │       └── compliance.api.ts
│   │   │
│   │   ├── analytics/              # HR analytics
│   │   │   ├── pages/
│   │   │   │   ├── AttritionAnalytics.tsx
│   │   │   │   └── DepartmentAnalytics.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAnalytics.ts
│   │   │   └── services/
│   │   │       └── analytics.api.ts
│   │   │
│   │   ├── workflow/               # Approval workflows
│   │   │   ├── pages/
│   │   │   │   └── ApprovalsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWorkflow.ts
│   │   │   └── services/
│   │   │       └── workflow.api.ts
│   │   │
│   │   ├── settings/               # System settings
│   │   │   ├── pages/
│   │   │   │   ├── RolesPage.tsx
│   │   │   │   ├── PermissionsPage.tsx
│   │   │   │   └── SystemSettings.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSettings.ts
│   │   │   └── services/
│   │   │       └── settings.api.ts
│   │   │
│   │   └── executive/              # Executive dashboard
│   │       ├── pages/
│   │       │   └── ExecutiveDashboard.tsx
│   │       ├── components/
│   │       │   ├── ExecutiveCharts.tsx
│   │       │   └── ExecutiveKpis.tsx
│   │       ├── hooks/
│   │       │   └── useExecutive.ts
│   │       └── services/
│   │           └── executive.api.ts
│   │
│   └── shared/                     # Shared components & utilities
│       ├── components/
│       │   └── ui/                 # UI component library
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Badge.tsx
│       │       ├── Modal.tsx
│       │       └── Spinner.tsx
│       └── utils/
│           └── cn.ts               # Tailwind class utilities
│
├── public/                         # Static assets
│   ├── favicon.ico
│   └── logo.png
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── eslint.config.js               # ESLint configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── .env.example                    # Environment template
```

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| TypeScript | 5.9.x | Type safety |
| Vite | 7.3.1 | Build tool & dev server |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| React Query | 5.90.21 | Server state management |
| React Context | Built-in | Global auth state |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| React Router | 7.2.0 | Client-side routing |

### HTTP Client

| Technology | Version | Purpose |
|------------|---------|---------|
| Axios | 1.13.5 | HTTP requests |

### Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| Lucide React | - | Icon library |

### Charts & Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.15.0 | Data visualization |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript | Type checking |

---

## Modules

### 1. Auth Module

**Purpose**: User authentication and registration

**Pages**:
- `LoginPage` - User login form
- `RegisterPage` - User registration form

**Components**:
- `LoginForm` - Login form with validation
- `RegisterForm` - Registration form with validation

**Features**:
- Email/password authentication
- Form validation
- Error handling
- Redirect after login

### 2. Employees Module

**Purpose**: Employee lifecycle management

**Pages**:
- `EmployeeListPage` - Employee directory
  - Search by name/email
  - Filter by department/status
  - Pagination
  - Quick actions
  
- `EmployeeDetailPage` - Employee profile
  - Personal information
  - Employment details
  - Attendance summary
  - Leave balance
  - Performance reviews

**Hooks**:
```typescript
// useEmployee.ts
export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
```

**API Service**:
```typescript
// employee.api.ts
export const employeeApi = {
  list: (params: EmployeeListParams) => 
    apiClient.get<EmployeeListResponse>('/employees', { params }),
  
  get: (id: string) => 
    apiClient.get<Employee>(`/employees/${id}`),
  
  create: (data: CreateEmployeeDto) => 
    apiClient.post<Employee>('/employees', data),
  
  update: (id: string, data: UpdateEmployeeDto) => 
    apiClient.patch<Employee>(`/employees/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/employees/${id}`),
  
  getTeam: (id: string) => 
    apiClient.get<Employee[]>(`/employees/${id}/team`),
};
```

### 3. Attendance Module

**Purpose**: Time and attendance tracking

**Pages**:
- `AttendanceDashboard` - Real-time attendance overview
  - Today's attendance summary
  - Check-in/out statistics
  - Late arrivals
  - Department-wise view

- `AttendanceList` - Detailed attendance records
  - Date range filter
  - Employee filter
  - Status filter
  - Export option

**Features**:
- Check-in/check-out functionality
- Manual attendance entry
- Attendance statistics
- Late arrival tracking

### 4. Leave Module

**Purpose**: Leave management with approval workflows

**Pages**:
- `LeaveDashboard` - Leave overview
  - Leave balance summary
  - Upcoming leaves
  - Pending requests
  - Leave calendar

- `LeaveRequests` - Leave request management
  - List all requests
  - Filter by status/type
  - Approve/reject actions
  - Request details

**Features**:
- Apply for leave
- Track leave balance
- Approval workflow
- Leave history

### 5. Payroll Module

**Purpose**: Payroll processing and management

**Pages**:
- `PayrollDashboard` - Payroll overview
  - Monthly statistics
  - Recent payroll runs
  - Pending approvals

- `PayrollRuns` - Payroll run management
  - List all payroll runs
  - Create new run
  - Calculate payroll
  - Approve/process

- `PayrollRunDetails` - Individual payroll details
  - Employee entries
  - Salary breakdown
  - Deductions
  - Summary cards

**Features**:
- Create payroll runs
- Automatic calculations
- Multi-level approval
- Payment processing
- Payslip generation

### 6. Performance Module

**Purpose**: Performance management and reviews

**Pages**:
- `PerformanceDashboard` - Performance overview
  - Goal completion rates
  - Review status
  - Performance metrics

- `GoalsPage` - Goal management
  - Create/edit goals
  - Track progress
  - Update achievement

- `ReviewsPage` - Performance reviews
  - Review cycles
  - Self-assessment
  - Manager reviews
  - Final ratings

### 7. Recruitment Module

**Purpose**: Hiring and candidate management

**Pages**:
- `RecruitmentDashboard` - Hiring pipeline overview
  - Open positions
  - Candidate funnel
  - Time to hire
  - Source analytics

- `JobsPage` - Job posting management
  - Create job posts
  - Publish/close jobs
  - Job details

- `CandidatesPage` - Candidate tracking
  - Add candidates
  - Move through pipeline
  - Interview scheduling
  - Convert to employee

**Pipeline Stages**:
1. Applied
2. Screening
3. Interview
4. Offer
5. Hired
6. Rejected

### 8. Compliance Module

**Purpose**: Statutory compliance tracking

**Pages**:
- `ComplianceDashboard` - Compliance overview
  - Filing status summary
  - Upcoming deadlines
  - Policy acknowledgments

- `FilingsPage` - Filing management
  - Add filings
  - Track status
  - File documents
  - Acknowledge receipts

**Filing Types**:
- PF (Provident Fund)
- ESI (Employee State Insurance)
- TDS (Tax Deducted at Source)
- GST (Goods and Services Tax)
- PT (Professional Tax)
- ITR (Income Tax Return)

### 9. Analytics Module

**Purpose**: HR metrics and reporting

**Pages**:
- `AttritionAnalytics` - Employee turnover analysis
  - Attrition rate trends
  - Department-wise turnover
  - Tenure analysis
  - Exit reasons

- `DepartmentAnalytics` - Department statistics
  - Headcount distribution
  - Performance by dept
  - Salary ranges
  - Attendance rates

**Features**:
- Interactive charts
- Date range filters
- Export reports
- Drill-down analysis

### 10. Workflow Module

**Purpose**: Approval workflow management

**Pages**:
- `ApprovalsPage` - Approval requests
  - Pending approvals
  - Approval history
  - Approve/reject actions
  - Approval statistics

**Workflow Types**:
- Leave requests
- Payroll runs
- Employee changes
- Expense claims

### 11. Settings Module

**Purpose**: System configuration

**Pages**:
- `RolesPage` - Role management
  - Create roles
  - Assign permissions
  - Edit/delete roles

- `PermissionsPage` - Permission management
  - View all permissions
  - Create custom permissions

- `SystemSettings` - System configuration
  - General settings
  - Email templates
  - Notification preferences

### 12. Executive Module

**Purpose**: High-level executive dashboard

**Pages**:
- `ExecutiveDashboard` - CEO/CTO dashboard
  - Key metrics
  - Trend charts
  - Quick stats
  - Department overview

**Components**:
- `ExecutiveKpis` - KPI cards
- `ExecutiveCharts` - Data visualizations
- Department breakdown
- Trend analysis

---

## Routing

### Route Configuration

```typescript
// router.tsx
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <LoginPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <RegisterPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <ExecutiveDashboard /> },
      {
        path: 'employees',
        children: [
          { index: true, element: <EmployeeListPage /> },
          { path: ':id', element: <EmployeeDetailPage /> },
        ],
      },
      { path: 'departments', element: <DepartmentListPage /> },
      {
        path: 'attendance',
        children: [
          { index: true, element: <AttendanceDashboard /> },
          { path: 'list', element: <AttendanceList /> },
        ],
      },
      {
        path: 'leave',
        children: [
          { index: true, element: <LeaveDashboard /> },
          { path: 'requests', element: <LeaveRequests /> },
        ],
      },
      {
        path: 'payroll',
        children: [
          { index: true, element: <PayrollDashboard /> },
          { path: 'runs', element: <PayrollRuns /> },
          { path: 'runs/:id', element: <PayrollRunDetails /> },
        ],
      },
      {
        path: 'performance',
        children: [
          { index: true, element: <PerformanceDashboard /> },
          { path: 'goals', element: <GoalsPage /> },
          { path: 'reviews', element: <ReviewsPage /> },
        ],
      },
      {
        path: 'recruitment',
        children: [
          { index: true, element: <RecruitmentDashboard /> },
          { path: 'jobs', element: <JobsPage /> },
          { path: 'candidates', element: <CandidatesPage /> },
        ],
      },
      {
        path: 'compliance',
        children: [
          { index: true, element: <ComplianceDashboard /> },
          { path: 'filings', element: <FilingsPage /> },
        ],
      },
      {
        path: 'analytics',
        children: [
          { path: 'attrition', element: <AttritionAnalytics /> },
          { path: 'departments', element: <DepartmentAnalytics /> },
        ],
      },
      { path: 'approvals', element: <ApprovalsPage /> },
      {
        path: 'settings',
        children: [
          { path: 'roles', element: <RolesPage /> },
          { path: 'permissions', element: <PermissionsPage /> },
          { path: 'system', element: <SystemSettings /> },
        ],
      },
    ],
  },
]);
```

### Route Components

**ProtectedRoute**:
```typescript
// protected-route.tsx
export function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const { user, isLoading, hasAnyPermission } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

**PublicRoute**:
```typescript
// public-route.tsx
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return <LoadingFallback />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
```

---

## Authentication

### Auth Context

```typescript
// auth-context.tsx
export interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('accessToken', response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
    setUser(response.user);
    setPermissions(response.permissions);
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (permission: string) => 
    permissions.includes(permission);

  const hasAnyPermission = (perms: string[]) => 
    perms.some(p => permissions.includes(p));

  return (
    <AuthContext.Provider value={{ 
      user, permissions, isLoading, 
      login, logout, hasPermission, hasAnyPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Token Refresh Mechanism

```typescript
// axios.ts
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## State Management

### React Query Configuration

```typescript
// providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Query Keys Pattern

```typescript
// employee-keys.ts
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => 
    [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};
```

### Mutation Patterns

```typescript
// Create with cache invalidation
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ 
        queryKey: employeeKeys.lists() 
      });
    },
  });
}

// Update with optimistic update
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });
      
      // Snapshot previous value
      const previousEmployee = queryClient.getQueryData(
        employeeKeys.detail(id)
      );
      
      // Optimistically update
      queryClient.setQueryData(employeeKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
      }));
      
      return { previousEmployee };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(
        employeeKeys.detail(id),
        context?.previousEmployee
      );
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}
```

---

## API Integration

### API Client

```typescript
// api-client.ts
import axios, { AxiosResponse } from 'axios';
import { env } from '../config/env';

interface BackendResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor - add JWT token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - unwrap data
    this.client.interceptors.response.use(
      (response: AxiosResponse<BackendResponse<any>>) => {
        return response.data.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any): Promise<T> {
    return this.client.get(url, config);
  }

  post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.patch(url, data, config);
  }

  delete<T>(url: string, config?: any): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
```

### Axios Instance with Interceptors

```typescript
// axios.ts
import axios from 'axios';
import { env } from '../config/env';

const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${env.apiBaseUrl}/auth/refresh`,
            { refreshToken }
          );
          
          // Backend returns: { data: { tokens: { accessToken, refreshToken } } }
          const tokens = response.data.data.tokens;
          const { accessToken, refreshToken: newRefreshToken } = tokens;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## UI Components

### Button Component

```typescript
// Button.tsx
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': 
            variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': 
            variant === 'secondary',
          'border-2 border-gray-300 text-gray-700 hover:bg-gray-50': 
            variant === 'outline',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': 
            variant === 'danger',
          'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500': 
            variant === 'success',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
```

### Card Component

```typescript
// Card.tsx
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
```

### Badge Component

```typescript
// Badge.tsx
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
```

### Modal Component

```typescript
// Modal.tsx
import { useEffect } from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={cn(
            'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle',
            {
              'sm:max-w-sm': size === 'sm',
              'sm:max-w-lg': size === 'md',
              'sm:max-w-2xl': size === 'lg',
              'sm:max-w-4xl': size === 'xl',
            }
          )}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Configuration

### Environment Variables

```typescript
// env.ts
interface Env {
  apiBaseUrl: string;
  appName: string;
  appVersion: string;
}

export const env: Env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  appName: import.meta.env.VITE_APP_NAME || 'HR Enterprise',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
```

### Routes Configuration

```typescript
// routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: (id: string) => `/employees/${id}`,
  DEPARTMENTS: '/departments',
  ATTENDANCE: '/attendance',
  ATTENDANCE_LIST: '/attendance/list',
  LEAVE: '/leave',
  LEAVE_REQUESTS: '/leave/requests',
  PAYROLL: '/payroll',
  PAYROLL_RUNS: '/payroll/runs',
  PAYROLL_RUN_DETAIL: (id: string) => `/payroll/runs/${id}`,
  PERFORMANCE: '/performance',
  PERFORMANCE_GOALS: '/performance/goals',
  PERFORMANCE_REVIEWS: '/performance/reviews',
  RECRUITMENT: '/recruitment',
  RECRUITMENT_JOBS: '/recruitment/jobs',
  RECRUITMENT_CANDIDATES: '/recruitment/candidates',
  COMPLIANCE: '/compliance',
  COMPLIANCE_FILINGS: '/compliance/filings',
  ANALYTICS_ATTRITION: '/analytics/attrition',
  ANALYTICS_DEPARTMENTS: '/analytics/departments',
  APPROVALS: '/approvals',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_PERMISSIONS: '/settings/permissions',
  SETTINGS_SYSTEM: '/settings/system',
} as const;
```

### Navigation Configuration

```typescript
// navigation.ts
export interface NavItem {
  name: string;
  path: string;
  icon: string;
  requiredPermissions?: string[];
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Employees',
    path: '/employees',
    icon: '👥',
    requiredPermissions: ['employees:read'],
  },
  {
    name: 'Departments',
    path: '/departments',
    icon: '🏢',
    requiredPermissions: ['departments:read'],
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: '⏰',
    requiredPermissions: ['attendance:read'],
    children: [
      { name: 'Overview', path: '/attendance', icon: '📈' },
      { name: 'Records', path: '/attendance/list', icon: '📋' },
    ],
  },
  {
    name: 'Leave',
    path: '/leave',
    icon: '🏖️',
    requiredPermissions: ['leave:read'],
    children: [
      { name: 'Dashboard', path: '/leave', icon: '📊' },
      { name: 'Requests', path: '/leave/requests', icon: '📝' },
    ],
  },
  {
    name: 'Payroll',
    path: '/payroll',
    icon: '💰',
    requiredPermissions: ['payroll:read'],
    children: [
      { name: 'Dashboard', path: '/payroll', icon: '📊' },
      { name: 'Payroll Runs', path: '/payroll/runs', icon: '💵' },
    ],
  },
  {
    name: 'Performance',
    path: '/performance',
    icon: '🎯',
    requiredPermissions: ['performance:read'],
    children: [
      { name: 'Dashboard', path: '/performance', icon: '📊' },
      { name: 'Goals', path: '/performance/goals', icon: '🎯' },
      { name: 'Reviews', path: '/performance/reviews', icon: '⭐' },
    ],
  },
  {
    name: 'Recruitment',
    path: '/recruitment',
    icon: '🤝',
    requiredPermissions: ['recruitment:read'],
    children: [
      { name: 'Dashboard', path: '/recruitment', icon: '📊' },
      { name: 'Jobs', path: '/recruitment/jobs', icon: '💼' },
      { name: 'Candidates', path: '/recruitment/candidates', icon: '👤' },
    ],
  },
  {
    name: 'Compliance',
    path: '/compliance',
    icon: '📋',
    requiredPermissions: ['compliance:read'],
    children: [
      { name: 'Dashboard', path: '/compliance', icon: '📊' },
      { name: 'Filings', path: '/compliance/filings', icon: '📄' },
    ],
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: '📈',
    requiredPermissions: ['analytics:read'],
    children: [
      { name: 'Attrition', path: '/analytics/attrition', icon: '📉' },
      { name: 'Departments', path: '/analytics/departments', icon: '🏢' },
    ],
  },
  {
    name: 'Approvals',
    path: '/approvals',
    icon: '✅',
    requiredPermissions: ['approvals:read'],
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: '⚙️',
    requiredPermissions: ['settings:read'],
    children: [
      { name: 'Roles', path: '/settings/roles', icon: '🔐' },
      { name: 'Permissions', path: '/settings/permissions', icon: '🔑' },
      { name: 'System', path: '/settings/system', icon: '⚙️' },
    ],
  },
];
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running (http://localhost:3002)

### Installation

```bash
# Navigate to frontend directory
cd hr-enterprise/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Environment Variables

```env
# .env
VITE_API_BASE_URL=http://localhost:3002
VITE_APP_NAME=HR Enterprise
VITE_APP_VERSION=1.0.0
```

### Access the Application

- Frontend: http://localhost:3000
- Default Login: Use seeded credentials from backend

---

## Development

### Available Scripts

```bash
# Development
npm run dev            # Start development server with HMR

# Building
npm run build          # Production build
npm run preview        # Preview production build

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run typecheck      # Run TypeScript type checking
```

### Development Guidelines

**Component Structure**:
```typescript
// Component file structure
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { useAuthContext } from '../../../core/auth/use-auth-context';

interface Props {
  // Props definition
}

export function ComponentName({}: Props) {
  // Hooks
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery({...});
  
  // Local state
  const [isOpen, setIsOpen] = useState(false);
  
  // Handlers
  const handleClick = () => {
    setIsOpen(true);
  };
  
  // Render
  if (isLoading) return <LoadingFallback />;
  
  return (
    <div>
      <Button onClick={handleClick}>Click Me</Button>
    </div>
  );
}
```

**Hook Pattern**:
```typescript
// Custom hook for data fetching
export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: ['employees', 'list', params],
    queryFn: () => api.get('/employees', { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for mutations
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => 
      api.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
```

**Service Pattern**:
```typescript
// API service
export const employeeApi = {
  list: (params: EmployeeListParams) =>
    apiClient.get<EmployeeListResponse>('/employees', { params }),
  
  get: (id: string) =>
    apiClient.get<Employee>(`/employees/${id}`),
  
  create: (data: CreateEmployeeDto) =>
    apiClient.post<Employee>('/employees', data),
  
  update: (id: string, data: UpdateEmployeeDto) =>
    apiClient.patch<Employee>(`/employees/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/employees/${id}`),
};
```

---

## Building

### Production Build

```bash
# Build for production
npm run build

# Output: dist/ directory
```

### Build Configuration

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },
});
```

---

## Testing

### Testing Strategy

**Unit Tests** (Vitest + React Testing Library):
```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Integration Tests**:
```typescript
// Hook test
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees } from './useEmployee';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useEmployees', () => {
  it('fetches employees', async () => {
    const { result } = renderHook(() => useEmployees({}), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

**E2E Tests** (Playwright):
```typescript
// E2E test
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load routes
const EmployeeListPage = lazy(() => import('./modules/employees/pages/EmployeeListPage'));
const PayrollDashboard = lazy(() => import('./modules/payroll/pages/PayrollDashboard'));
```

### React Query Optimization

```typescript
// Optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      suspense: false,
    },
  },
});
```

### Memoization

```typescript
// Memoize expensive computations
const filteredEmployees = useMemo(() => {
  return employees.filter(emp => 
    emp.firstName.toLowerCase().includes(search.toLowerCase())
  );
}, [employees, search]);

// Memoize callbacks
const handleSave = useCallback(() => {
  saveEmployee(data);
}, [data]);
```

---

## Best Practices

### 1. Use TypeScript Strictly
```typescript
// Good: Strong typing
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
}

// Bad: Using any
const employee: any = fetchEmployee();
```

### 2. Handle Loading States
```typescript
// Good: Handle all states
const { data, isLoading, error } = useEmployees();

if (isLoading) return <LoadingFallback />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <EmployeeList employees={data} />;
```

### 3. Use React Query for Server State
```typescript
// Good: Server state with React Query
const { data } = useQuery({
  queryKey: ['employees'],
  queryFn: fetchEmployees,
});

// Bad: useEffect for data fetching
const [employees, setEmployees] = useState([]);
useEffect(() => {
  fetchEmployees().then(setEmployees);
}, []);
```

### 4. Implement Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 5. Optimize Re-renders
```typescript
// Good: Split components
const EmployeeCard = memo(({ employee }: { employee: Employee }) => {
  return <div>{employee.firstName}</div>;
});

// Good: Use React DevTools Profiler
```

---

## Troubleshooting

### Common Issues

**1. CORS Errors**:
```
Solution: Ensure backend CORS is configured to allow frontend origin
```

**2. Token Refresh Loop**:
```
Solution: Check that refresh token endpoint is not protected
```

**3. Module Not Found**:
```
Solution: Check import paths and ensure file exists
```

**4. TypeScript Errors**:
```bash
# Regenerate types
npm run typecheck
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

---

**Happy Coding! 🚀**
