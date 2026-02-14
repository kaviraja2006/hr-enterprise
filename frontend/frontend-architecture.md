# HR Enterprise Frontend Architecture

## Table of Contents
1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Directory Structure](#directory-structure)
4. [Layered Architecture](#layered-architecture)
5. [State Management](#state-management)
6. [Routing](#routing)
7. [API Integration](#api-integration)
8. [Authentication Flow](#authentication-flow)
9. [Module Architecture](#module-architecture)
10. [Component Patterns](#component-patterns)
11. [Testing Strategy](#testing-strategy)
12. [Best Practices](#best-practices)

---

## Overview

The HR Enterprise frontend is built with **React 18+**, **TypeScript**, and **Tailwind CSS**, following a **Feature-Based Module Architecture**. This approach organizes code by business domain rather than technical function, making the codebase more maintainable and scalable.

### Key Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 18+ | UI library |
| Language | TypeScript | 5+ | Type safety |
| Styling | Tailwind CSS | 4+ | Utility-first CSS |
| Routing | React Router | 6+ | SPA navigation |
| State | React Query | 5+ | Server state |
| Context | React Context | 18+ | Client state |
| HTTP | Axios | 1+ | HTTP client |
| Charts | Recharts | 2+ | Data visualization |
| Build | Vite | 6+ | Build tool |

---

## Architecture Patterns

### 1. Feature-Based Module Architecture

Code is organized by business feature, not by technical layer:

```
❌ DON'T: Technical Layer Organization
src/
  components/
    Button.tsx
    Card.tsx
  hooks/
    useEmployees.ts
    useDepartments.ts
  pages/
    EmployeesPage.tsx
    DepartmentsPage.tsx

✅ DO: Feature-Based Organization
src/modules/
  employees/
    components/
    hooks/
    pages/
    services/
    types.ts
  departments/
    components/
    hooks/
    pages/
    services/
    types.ts
```

### 2. Layered Architecture

Four distinct layers with clear responsibilities:

```
┌─────────────────────────────────────────────┐
│  Layer 4: Application Layer (app/)           │
│  - Router configuration                      │
│  - Provider composition                      │
│  - App bootstrap                             │
├─────────────────────────────────────────────┤
│  Layer 3: Core Layer (core/)                 │
│  - API infrastructure                        │
│  - Authentication                            │
│  - Authorization (RBAC)                      │
│  - Layout components                         │
├─────────────────────────────────────────────┤
│  Layer 2: Feature Modules (modules/)         │
│  - Domain-specific features                  │
│  - Self-contained modules                    │
├─────────────────────────────────────────────┤
│  Layer 1: Shared Layer (shared/)             │
│  - UI components                             │
│  - Utilities                                 │
└─────────────────────────────────────────────┘
```

### 3. Smart/Container/Presentational Pattern

**Container Components** (Pages/Smart):
- Connect to data sources (React Query)
- Handle business logic
- Pass data to children

**Presentational Components** (UI):
- Receive data via props
- Render UI based on props
- Emit events via callbacks

---

## Directory Structure

```
frontend/
├── public/                          # Static assets
│   └── ...
├── src/
│   ├── main.tsx                     # Application entry point
│   ├── app/                         # Application layer
│   │   ├── router.tsx               # Route definitions
│   │   └── providers.tsx            # React providers
│   │
│   ├── config/                      # Configuration
│   │   ├── env.ts                   # Environment variables
│   │   ├── routes.ts                # Route constants
│   │   └── navigation.ts            # Navigation items
│   │
│   ├── core/                        # Core framework layer
│   │   ├── api/                     # HTTP infrastructure
│   │   │   ├── axios.ts             # Axios instance
│   │   │   └── api-client.ts        # API client wrapper
│   │   │
│   │   ├── auth/                    # Authentication
│   │   │   ├── auth-context.tsx     # Auth state management
│   │   │   ├── auth-service.ts      # Auth API calls
│   │   │   └── protected-route.tsx  # Route guards
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── DashboardLayout.tsx  # Main layout
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   └── Header.tsx           # Top header
│   │   │
│   │   ├── rbac/                    # Role-based access control
│   │   │   ├── permission-hook.ts   # Permission hooks
│   │   │   └── role-utils.ts        # Role utilities
│   │   │
│   │   └── types/                   # Core types
│   │       └── user.types.ts        # User type definitions
│   │
│   ├── modules/                     # Feature modules
│   │   ├── auth/                    # Authentication module
│   │   ├── employees/               # Employee management
│   │   ├── departments/             # Department management
│   │   ├── attendance/              # Attendance tracking
│   │   ├── executive/               # Executive dashboard
│   │   ├── leave/                   # Leave management
│   │   ├── payroll/                 # Payroll processing
│   │   ├── performance/             # Performance reviews
│   │   ├── recruitment/             # Hiring & candidates
│   │   ├── compliance/              # Compliance tracking
│   │   ├── analytics/               # Analytics & reporting
│   │   ├── workflow/                # Approval workflows
│   │   └── settings/                # System settings
│   │
│   └── shared/                      # Shared layer
│       ├── components/              # Shared UI components
│       │   ├── ui/                  # Base UI components
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Modal.tsx
│       │   │   └── Spinner.tsx
│       │   │
│       │   └── ComingSoon.tsx       # Placeholder component
│       │
│       └── utils/                   # Utility functions
│           └── cn.ts                # Class name utility
│
├── index.html                       # HTML entry
├── package.json                     # Dependencies
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── vite.config.ts                   # Vite configuration
```

---

## Layered Architecture Deep Dive

### Layer 1: Application Layer (`/app/`)

**Purpose**: Application bootstrap and routing

**Files**:
- `router.tsx` - Route definitions with lazy loading
- `providers.tsx` - React context providers composition

**Key Patterns**:
```typescript
// Lazy loading for code splitting
const EmployeeListPage = lazy(() => import('../modules/employees/pages/EmployeeListPage'));

// Route configuration
createBrowserRouter([
  {
    path: '/employees',
    element: <ProtectedRoute><EmployeeListPage /></ProtectedRoute>
  }
])
```

### Layer 2: Core Layer (`/core/`)

**Purpose**: Framework-level infrastructure

#### API Infrastructure (`/core/api/`)

**axios.ts** - HTTP client with interceptors:
```typescript
// Request interceptor: Attach JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // Retry original request with new token
    }
    return Promise.reject(error);
  }
);
```

**api-client.ts** - High-level API client:
```typescript
class ApiClient {
  private unwrapResponse<T>(response: AxiosResponse<BackendResponse<T>>): T {
    // Backend wraps responses: { data: T }
    return response.data.data;
  }

  async get<T>(url: string): Promise<T> {
    const response = await axiosInstance.get<BackendResponse<T>>(url);
    return this.unwrapResponse(response);
  }
}
```

#### Authentication (`/core/auth/`)

**Auth Flow**:
1. User logs in → API returns tokens
2. Tokens stored in localStorage
3. AuthContext updates with user info
4. Axios interceptor attaches token to requests
5. ProtectedRoute checks authentication

**auth-context.tsx**:
```typescript
interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
```

#### RBAC System (`/core/rbac/`)

**Permission Format**: `resource:action`
- `employees:read` - View employees
- `employees:create` - Create employees
- `employees:update` - Update employees
- `employees:delete` - Delete employees

**Role Hierarchy**:
```
ADMIN (100) > HR (75) > MANAGER (50) > EMPLOYEE (25)
```

### Layer 3: Feature Modules (`/modules/`)

Each module is self-contained with:
```
modules/[feature]/
├── index.ts           # Public API exports
├── types.ts           # TypeScript interfaces
├── services/
│   └── [feature].api.ts   # API calls
├── hooks/
│   └── use[Feature].ts    # React Query hooks
├── components/
│   └── [Feature]List.tsx  # UI components
└── pages/
    └── [Feature]Page.tsx  # Route components
```

**Example: Employee Module**:
```typescript
// types.ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
}

// services/employee.api.ts
export const employeeApi = {
  list: (params: ListParams) => apiClient.get<Employee[]>('/employees', { params }),
  get: (id: string) => apiClient.get<Employee>(`/employees/${id}`),
  create: (data: CreateEmployeeDto) => apiClient.post<Employee>('/employees', data),
  update: (id: string, data: UpdateEmployeeDto) => apiClient.patch<Employee>(`/employees/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/employees/${id}`),
};

// hooks/useEmployees.ts
export function useEmployees(params: ListParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// pages/EmployeeListPage.tsx
export default function EmployeeListPage() {
  const { data, isLoading } = useEmployees();
  if (isLoading) return <Spinner />;
  return <EmployeeList employees={data} />;
}
```

### Layer 4: Shared Layer (`/shared/`)

**Purpose**: Reusable UI components and utilities

**UI Components** (Design System):
- Button - Polymorphic with variants
- Card - Container + StatCard variant
- Badge - Status indicators
- Modal - Dialogs
- Spinner - Loading states

**Utilities**:
- `cn()` - Tailwind class merging

---

## State Management

### Server State (React Query)

**Pattern**: Custom hooks wrapping React Query

**Query Keys Strategy**:
```typescript
// Query keys for cache management
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: ListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: employeeKeys.list({ page: 1, limit: 10 }),
  queryFn: () => employeeApi.list({ page: 1, limit: 10 }),
});
```

**Cache Invalidation**:
```typescript
// After create/update/delete
queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
```

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Client State (React Context)

**Auth Context** - Global authentication state:
```typescript
// Holds: user, permissions, isLoading
// Methods: login(), logout(), hasPermission()
```

**When to Use Context**:
- Authentication state (global)
- Theme preferences
- UI state that needs to persist

**When NOT to Use Context**:
- Server state (use React Query)
- Local component state (use useState)
- Form state (use form libraries)

---

## Routing

### Route Structure

```typescript
// Public routes
/login          - Login page
/register       - Registration page

// Protected routes (require authentication)
/dashboard                      - Executive dashboard
/employees                      - Employee list
/employees/:id                  - Employee details
/departments                    - Department list
/attendance                     - Attendance dashboard
/attendance/list                - Attendance records
/leave                          - Leave dashboard
/leave/requests                 - Leave requests
/payroll                        - Payroll dashboard
/payroll/runs                   - Payroll runs
/payroll/runs/:id               - Payroll details
/settings/roles                 - Role management
/settings/permissions           - Permission management
```

### Route Guards

**ProtectedRoute** - Requires authentication:
```typescript
function ProtectedRoute({ children, requiredPermissions }) {
  const { user, isLoading, hasAnyPermission } = useAuthContext();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

**PublicRoute** - Redirects authenticated users:
```typescript
function PublicRoute({ children }) {
  const { user, isLoading } = useAuthContext();
  
  if (isLoading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" />;
  
  return children;
}
```

### Lazy Loading

```typescript
// All routes use lazy loading for code splitting
const EmployeeListPage = lazy(() => import('../modules/employees/pages/EmployeeListPage'));

// Suspense wrapper for loading states
<Suspense fallback={<LoadingFallback />}>
  <EmployeeListPage />
</Suspense>
```

---

## API Integration

### API Client Usage

**Two approaches observed**:

1. **Via apiClient** (Recommended):
```typescript
import { apiClient } from '../../../core/api/api-client';

export const executiveApi = {
  getExecutiveSummary: () => apiClient.get<ExecutiveSummary>('/analytics/executive-summary'),
};
```

2. **Via raw axios** (Legacy):
```typescript
import api from '../../../core/api/axios';

export const employeeApi = {
  list: async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
};
```

**Recommendation**: Use `apiClient` consistently - it handles response unwrapping.

### Error Handling

```typescript
// API errors are thrown as exceptions
try {
  await createEmployee(data);
} catch (error) {
  if (error.response?.status === 422) {
    // Validation error - show field errors
  } else if (error.response?.status === 403) {
    // Forbidden - show access denied
  } else {
    // Generic error
  }
}
```

---

## Authentication Flow

### Login Flow

```
1. User enters credentials
   │
   ▼
2. LoginForm calls authContext.login(email, password)
   │
   ▼
3. authService.login() POST /auth/login
   │
   ▼
4. Backend validates, returns tokens + user
   │
   ▼
5. Store tokens in localStorage
   │
   ▼
6. Update AuthContext with user + permissions
   │
   ▼
7. Navigate to /dashboard
```

### Token Refresh Flow

```
1. API call returns 401 (token expired)
   │
   ▼
2. Axios interceptor catches 401
   │
   ▼
3. POST /auth/refresh with refreshToken
   │
   ▼
4. Backend validates, returns new tokens
   │
   ▼
5. Update localStorage with new tokens
   │
   ▼
6. Retry original request with new token
   │
   ▼
7. If refresh fails, redirect to login
```

### Page Refresh Flow

```
1. Page loads / refreshes
   │
   ▼
2. AuthProvider checks localStorage for token
   │
   ▼
3. If token exists, GET /auth/me
   │
   ▼
4. Backend validates token, returns user + permissions
   │
   ▼
5. Update AuthContext
   │
   ▼
6. Set isLoading = false
   │
   ▼
7. App renders with auth state
```

---

## Module Architecture

### Module Structure Standards

Every module follows this structure:

```
modules/[name]/
├── index.ts              # Public API (exports only)
├── types.ts              # TypeScript interfaces
├── services/
│   └── [name].api.ts     # API calls (axios)
├── hooks/
│   ├── use[Name].ts      # React Query hooks
│   └── use[Name]List.ts  # List-specific hooks
├── components/
│   ├── [Name]List.tsx    # List component
│   ├── [Name]Form.tsx    # Form component
│   └── [Name]Card.tsx    # Card component
└── pages/
    ├── [Name]ListPage.tsx
    ├── [Name]DetailPage.tsx
    └── [Name]FormPage.tsx
```

### Module Public API

Each module exposes its interface via `index.ts`:

```typescript
// modules/employees/index.ts

// Pages (for routing)
export { default as EmployeeListPage } from './pages/EmployeeListPage';
export { default as EmployeeDetailPage } from './pages/EmployeeDetailPage';

// Components (for reuse)
export { EmployeeList } from './components/EmployeeList';
export { EmployeeForm } from './components/EmployeeForm';

// Hooks
export { useEmployees, useEmployee, useCreateEmployee } from './hooks/useEmployees';

// Services
export { employeeApi } from './services/employee.api';

// Types
export type { Employee, CreateEmployeeDto } from './types';
```

### Module Dependencies

**Allowed Dependencies**:
- Core layer (`core/*`)
- Shared layer (`shared/*`)
- Config layer (`config/*`)

**Avoid**:
- Direct imports from other modules
- Circular dependencies

**Cross-module Communication**:
- Use API layer for data sharing
- Use URL parameters for passing IDs

---

## Component Patterns

### Component Hierarchy

```
Router (Lazy Loaded)
  └── ProtectedRoute
        └── DashboardLayout
              ├── Sidebar
              ├── Header
              └── Outlet (Page Content)
                    └── ModulePage
                          ├── Container Components
                          │     └── useQuery hooks
                          └── UI Components
                                └── Pure rendering
```

### Page Components

**Responsibilities**:
- Route-level component
- Data fetching
- Layout composition
- Error handling

```typescript
// pages/EmployeeListPage.tsx
export default function EmployeeListPage() {
  const { data, isLoading, error } = useEmployees();
  const navigate = useNavigate();

  if (isLoading) return <Spinner size="lg" />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="space-y-6">
      <PageHeader title="Employees" />
      <EmployeeList 
        employees={data} 
        onView={(id) => navigate(`/employees/${id}`)}
      />
    </div>
  );
}
```

### Smart Components

**Responsibilities**:
- Connect to data (React Query)
- Handle user interactions
- Manage local state (filters, pagination)

```typescript
// components/EmployeeList.tsx
export function EmployeeList({ employees, onView }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <DataTable data={filtered} onRowClick={onView} />
      <Pagination page={page} onChange={setPage} />
    </>
  );
}
```

### UI Components

**Responsibilities**:
- Pure rendering
- Props-based configuration
- No side effects

```typescript
// shared/components/ui/Button.tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  isLoading,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

---

## Testing Strategy

### Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Critical flows)
        │   (10%)     │
       ┌┴─────────────┴┐
       │  Integration  │  (API + Components)
       │    (20%)      │
      ┌┴───────────────┴┐
      │   Unit Tests    │  (Hooks, Utils)
      │     (70%)       │
      └─────────────────┘
```

### What to Test

**Unit Tests**:
- Utility functions
- Hook logic
- Component rendering
- State transformations

**Integration Tests**:
- API calls
- Component interactions
- Form submissions
- Navigation flows

**E2E Tests**:
- Login flow
- CRUD operations
- Permission-based access
- Critical business workflows

### Testing Tools

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Vitest | Fast unit testing |
| Component | React Testing Library | Component testing |
| E2E | Playwright | End-to-end testing |
| Mock | MSW | API mocking |

---

## Best Practices

### 1. Component Design

**DO**:
- Keep components small and focused
- Use TypeScript for all props
- Extract reusable logic into hooks
- Use composition over inheritance

**DON'T**:
- Create god components
- Mix presentation and business logic
- Use `any` type
- Mutate props directly

### 2. State Management

**DO**:
- Use React Query for server state
- Use Context for global client state
- Use useState for local component state
- Keep state as close to usage as possible

**DON'T**:
- Put server state in Context
- Use Redux without good reason
- Prop drill deeply (use Context)
- Have multiple sources of truth

### 3. Performance

**DO**:
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers passed to children
- Lazy load routes
- Virtualize long lists

**DON'T**:
- Prematurely optimize
- Memoize everything
- Ignore React Query caching
- Fetch data in render without useEffect

### 4. TypeScript

**DO**:
- Enable strict mode
- Define interfaces for all data structures
- Use discriminated unions for complex states
- Avoid `any` and `unknown` without guards

**DON'T**:
- Use `as` type assertions
- Skip return type annotations on public APIs
- Create overly complex types
- Ignore TypeScript errors

### 5. Code Organization

**DO**:
- Co-locate related files
- Use index.ts for public APIs
- Keep imports shallow
- Follow naming conventions

**DON'T**:
- Create deep folder hierarchies
- Import from other modules' internals
- Mix concerns in files
- Leave unused imports

---

## Common Patterns

### Loading States

```typescript
// Pattern: Skeleton Loading
function EmployeeList() {
  const { data, isLoading } = useEmployees();
  
  if (isLoading) return <EmployeeListSkeleton />;
  return <EmployeeList data={data} />;
}
```

### Error Handling

```typescript
// Pattern: Error Boundary + Retry
function EmployeeList() {
  const { data, error, refetch } = useEmployees();
  
  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={refetch}
      />
    );
  }
  
  return <EmployeeList data={data} />;
}
```

### Optimistic Updates

```typescript
// Pattern: Update UI before API confirms
const { mutate } = useMutation({
  mutationFn: updateEmployee,
  onMutate: async (newEmployee) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['employees'] });
    
    // Snapshot previous value
    const previousEmployees = queryClient.getQueryData(['employees']);
    
    // Optimistically update
    queryClient.setQueryData(['employees'], (old) => 
      old.map(e => e.id === newEmployee.id ? newEmployee : e)
    );
    
    return { previousEmployees };
  },
  onError: (err, newEmployee, context) => {
    // Rollback on error
    queryClient.setQueryData(['employees'], context.previousEmployees);
  },
});
```

---

## Migration Guide

### Adding a New Module

1. **Create folder structure**:
   ```bash
   mkdir -p src/modules/feature/{pages,components,hooks,services}
   touch src/modules/feature/{index.ts,types.ts}
   ```

2. **Define types**:
   ```typescript
   // types.ts
   export interface Feature {
     id: string;
     name: string;
   }
   ```

3. **Create API service**:
   ```typescript
   // services/feature.api.ts
   export const featureApi = {
     list: () => apiClient.get<Feature[]>('/features'),
   };
   ```

4. **Create hooks**:
   ```typescript
   // hooks/useFeature.ts
   export function useFeatures() {
     return useQuery({
       queryKey: ['features'],
       queryFn: () => featureApi.list(),
     });
   }
   ```

5. **Create page**:
   ```typescript
   // pages/FeaturePage.tsx
   export default function FeaturePage() {
     const { data } = useFeatures();
     return <div>{/* render */}</div>;
   }
   ```

6. **Add route**:
   ```typescript
   // router.tsx
   const FeaturePage = lazy(() => import('../modules/feature/pages/FeaturePage'));
   
   {
     path: '/features',
     element: <FeaturePage />
   }
   ```

7. **Export from index.ts**:
   ```typescript
   // index.ts
   export { default as FeaturePage } from './pages/FeaturePage';
   ```

---

## Troubleshooting

### Common Issues

1. **401 Errors After Login**
   - Check localStorage for tokens
   - Verify token refresh is working
   - Check CORS configuration

2. **Data Not Updating After Mutation**
   - Ensure cache invalidation is working
   - Check query keys match
   - Verify onSuccess callback

3. **Type Errors**
   - Run `tsc --noEmit` to check
   - Ensure all dependencies installed
   - Check for version mismatches

4. **Build Failures**
   - Check for circular dependencies
   - Verify all imports resolve
   - Check TypeScript strict mode

---

## Resources

- [React Documentation](https://react.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Version**: 1.0  
**Last Updated**: 2026-02-14  
**Status**: Active
