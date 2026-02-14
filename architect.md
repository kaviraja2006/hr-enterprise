# HR Enterprise - System Architecture Overview

## Executive Summary

HR Enterprise is a comprehensive Human Resource Management System built with modern enterprise architecture principles. The system follows a **Modular Monolith** pattern with clear separation between frontend and backend, implementing Domain-Driven Design (DDD) on the backend and Feature-Based Module architecture on the frontend.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HR ENTERPRISE SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐    │
│  │       FRONTEND (React)      │         │      BACKEND (NestJS)       │    │
│  │         Port: 5173          │◄───────►│         Port: 3002          │    │
│  └─────────────────────────────┘   CORS   └─────────────────────────────┘    │
│                                                                              │
│  Architecture: Feature-Based          Architecture: Domain-Driven           │
│  State: React Query + Context         State: Prisma + PostgreSQL            │
│  Routing: React Router v6             Auth: JWT + RBAC                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │   PostgreSQL DB     │
                          │     Port: 5432      │
                          └─────────────────────┘
```

---

## Technology Stack

### Frontend Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18+ | UI rendering |
| Language | TypeScript | Type safety |
| Routing | React Router v6 | Navigation |
| Styling | Tailwind CSS | Styling |
| State | React Query | Server state |
| Auth | JWT + Context | Authentication |
| HTTP | Axios | API client |
| Charts | Recharts | Data visualization |
| Build | Vite | Bundling |

### Backend Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | NestJS 11+ | API framework |
| Language | TypeScript | Type safety |
| Database | PostgreSQL | Data storage |
| ORM | Prisma 7+ | Database access |
| Auth | JWT + Passport | Authentication |
| Validation | class-validator | Input validation |
| Scheduling | @nestjs/schedule | Cron jobs |
| Security | Helmet, CORS | Security headers |

---

## Architectural Principles

### 1. Domain-Driven Design (Backend)
- **Bounded Contexts**: Each HR domain (Employees, Payroll, Leave) is isolated
- **Ubiquitous Language**: Domain terms used consistently across code
- **Aggregate Roots**: Clear ownership of entities
- **Repository Pattern**: Prisma as data access layer

### 2. Feature-Based Modules (Frontend)
- **Cohesion**: All related code in one module
- **Encapsulation**: Public API via `index.ts`
- **Scalability**: Easy to add new features
- **Maintainability**: Clear module boundaries

### 3. Separation of Concerns
- **API Layer**: HTTP communication isolated
- **Business Logic**: Services contain domain logic
- **Presentation**: Components handle UI only
- **Data Access**: Prisma/ORM handles persistence

---

## System Workflow

### Authentication Flow

```
┌──────────┐     Login      ┌──────────┐    Validate     ┌──────────┐
│  User    │ ─────────────► │ Frontend │ ──────────────► │  Backend │
└──────────┘                └──────────┘                 └──────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  JWT Tokens  │
                                       │  + User Data │
                                       └──────────────┘
                                              │
                                              ▼
┌──────────┐   Auto-attach   ┌──────────┐   Store    ┌──────────┐
│  Backend │ ◄────────────── │ Frontend │ ◄───────── │localStore│
└──────────┘   Bearer Token  └──────────┘            └──────────┘
```

**Steps:**
1. User submits credentials via login form
2. Frontend sends POST /auth/login
3. Backend validates, generates JWT tokens
4. Frontend stores tokens in localStorage
5. Axios interceptor auto-attaches tokens to requests
6. Token refresh happens automatically on 401

### API Request Flow

```
┌─────────────┐   1. Request    ┌──────────────┐
│   Client    │ ───────────────►│   Frontend   │
└─────────────┘                 └──────────────┘
                                       │
                                       │ 2. React Query
                                       ▼
                                ┌──────────────┐
                                │  API Client  │
                                └──────────────┘
                                       │
                                       │ 3. Axios + JWT
                                       ▼
┌─────────────┐   4. Validate   ┌──────────────┐
│   Backend   │ ◄───────────────│   Guards     │
└─────────────┘   JWT Token     └──────────────┘
       │
       │ 5. Business Logic
       ▼
┌──────────────┐
│   Services   │
└──────────────┘
       │
       │ 6. Database
       ▼
┌──────────────┐
│    Prisma    │
└──────────────┘
```

### Data Synchronization Flow

```
User Action
     │
     ▼
┌──────────────┐
│   Mutation   │ (React Query)
└──────────────┘
     │
     ▼
┌──────────────┐     ┌──────────────┐
│  API Call    │────►│   Backend    │
└──────────────┘     └──────────────┘
     │                      │
     │                      ▼
     │               ┌──────────────┐
     │               │   Database   │
     │               └──────────────┘
     │                      │
     ▼                      ▼
┌──────────────┐     ┌──────────────┐
│Cache Invalid │     │  Audit Log   │
└──────────────┘     └──────────────┘
```

---

## Communication Patterns

### Frontend ↔ Backend

**Protocol**: HTTP/REST
**Format**: JSON
**Authentication**: Bearer Token (JWT)
**CORS**: Configured for localhost:5173

**Request Example:**
```http
GET /api/employees?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Response Format:**
```json
{
  "data": {
    "employees": [...],
    "total": 100
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Backend ↔ Database

**Protocol**: PostgreSQL wire protocol
**ORM**: Prisma Client
**Connection**: Pooled (pg driver adapter)
**Transactions**: Prisma implicit transactions

---

## Module Integration Matrix

| Frontend Module | Backend Module | API Base | Status |
|----------------|----------------|----------|---------|
| auth | auth | /auth | Complete |
| employees | employees | /employees | Complete |
| departments | departments | /departments | Complete |
| attendance | attendance | /attendance | Complete |
| executive | analytics | /analytics | Complete |
| leave | leave | /leave | Planned |
| payroll | payroll | /payroll | Planned |
| performance | performance | /performance | Planned |
| recruitment | recruitment | /recruitment | Planned |
| compliance | compliance | /compliance | Planned |
| settings | rbac | /rbac | Planned |

---

## Security Architecture

### Authentication Layers

1. **JWT Access Token** (15 min expiry)
   - Stored in localStorage
   - Sent in Authorization header
   - Contains userId, email, role, permissions

2. **JWT Refresh Token** (7 day expiry)
   - Stored in localStorage
   - Used to get new access tokens
   - Stored in database for revocation

3. **Token Refresh Flow**
   - Automatic on 401 responses
   - Uses axios response interceptor
   - Refreshes both tokens

### Authorization Layers

1. **Route Guards** (Frontend)
   - ProtectedRoute checks authentication
   - Redirects to login if not authenticated
   - Redirects authenticated users from login

2. **JWT Validation** (Backend)
   - JwtAuthGuard validates token signature
   - Extracts user from token payload
   - Attaches to request object

3. **Permission Checks** (Backend)
   - PermissionsGuard validates permissions
   - Checks against @Permissions() decorator
   - Returns 403 Forbidden if unauthorized

### Data Security

- **Passwords**: bcrypt hashed (12 rounds)
- **API Payloads**: JSON over HTTPS
- **CORS**: Whitelist-based origin validation
- **Rate Limiting**: 100 req/min per IP
- **Audit Logging**: All mutations logged

---

## Data Flow Architecture

### Server State (React Query)

```
┌─────────────────────────────────────────────────────────┐
│                    React Query Cache                     │
├─────────────────────────────────────────────────────────┤
│  ['employees', 'list', {page: 1}]  │  Employee[]       │
│  ['employees', 'detail', '123']    │  Employee         │
│  ['departments', 'list']           │  Department[]     │
│  ['executive-summary']             │  ExecutiveSummary │
└─────────────────────────────────────────────────────────┘
```

**Cache Strategy:**
- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes
- **Refetch**: On window focus (disabled)
- **Invalidation**: On mutations

### Client State (React Context)

```
┌─────────────────────────────────────────┐
│           Auth Context                   │
├─────────────────────────────────────────┤
│  user: User | null                      │
│  permissions: string[]                  │
│  isLoading: boolean                     │
│  isAuthenticated: boolean               │
└─────────────────────────────────────────┘
```

**State Updates:**
- Login: Sets user, permissions, tokens
- Logout: Clears all auth state
- Profile Fetch: Updates user & permissions

---

## Error Handling Strategy

### Frontend Error Handling

```
API Error
    │
    ├──► 401 Unauthorized ──► Token Refresh ──► Retry
    │
    ├──► 403 Forbidden ─────► Show Access Denied
    │
    ├──► 404 Not Found ─────► Show Not Found Page
    │
    ├──► 422 Validation ────► Show Field Errors
    │
    └──► 500 Server Error ──► Show Error Message
```

### Backend Error Handling

```
Error Occurs
    │
    ├──► PrismaError ──► PrismaExceptionFilter ──► 400/404/409
    │
    ├──► ValidationError ──► ValidationPipe ──► 422
    │
    ├──► DomainError ──► Custom Response ──► 400/403
    │
    └──► Unknown ──► HttpExceptionFilter ──► 500
```

---

## Deployment Architecture

### Development Environment

```
┌──────────────────────────────────────────┐
│           Local Development               │
├──────────────────────────────────────────┤
│                                          │
│  Frontend (Vite)    Backend (NestJS)     │
│  Port: 5173    ◄──► Port: 3002          │
│       │                  │              │
│       └──────────────────┘              │
│                │                        │
│                ▼                        │
│        PostgreSQL (local)               │
│        Port: 5432                       │
│                                          │
└──────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌───────────────────────────────────────────────────────┐
│                    Production                          │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐      ┌─────────────┐                │
│  │   Nginx     │◄────►│   Frontend  │                │
│  │   (SSL)     │      │   (Static)  │                │
│  └──────┬──────┘      └─────────────┘                │
│         │                                             │
│         ▼                                             │
│  ┌─────────────┐      ┌─────────────┐                │
│  │   Backend   │◄────►│   Redis     │                │
│  │   (API)     │      │   (Cache)   │                │
│  └──────┬──────┘      └─────────────┘                │
│         │                                             │
│         ▼                                             │
│  ┌─────────────┐      ┌─────────────┐                │
│  │ PostgreSQL  │      │   MinIO     │                │
│  │  (Primary)  │      │  (Files)    │                │
│  └─────────────┘      └─────────────┘                │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling Ready

- **Stateless Backend**: No server-side sessions
- **JWT Authentication**: Tokens contain all auth info
- **Database**: PostgreSQL supports read replicas
- **Caching**: Redis can be added for query caching

### Performance Optimizations

1. **Frontend**
   - Code splitting by route
   - React Query caching
   - Lazy loading images
   - Memoization of expensive computations

2. **Backend**
   - Database indexes on foreign keys
   - Pagination on all list endpoints
   - Connection pooling (Prisma)
   - Query optimization with Prisma includes

3. **Database**
   - Proper indexes on search fields
   - Foreign key constraints
   - Efficient queries with Prisma

---

## Monitoring & Observability

### Logging

- **Frontend**: Console logs in development only
- **Backend**: Structured logging with NestJS Logger
- **Database**: Query logging in development
- **Audit**: All mutations logged with user context

### Key Metrics to Track

1. **API Performance**
   - Response times
   - Error rates
   - Request volume

2. **Database**
   - Query performance
   - Connection pool usage
   - Slow query logs

3. **Business Metrics**
   - User login/logout
   - Feature usage
   - Error patterns

---

## Development Guidelines

### Adding a New Feature

1. **Backend**
   ```
   Create module: nest g resource modules/feature
   Define DTOs in dto/ folder
   Implement service methods
   Add controller endpoints
   Update app.module.ts
   ```

2. **Frontend**
   ```
   Create folder: src/modules/feature/
   Create types: types.ts
   Create API: services/feature.api.ts
   Create hooks: hooks/useFeature.ts
   Create pages: pages/FeaturePage.tsx
   Add route: router.tsx
   ```

### API Design Standards

- Use RESTful naming: `/resources` and `/resources/:id`
- Use HTTP methods appropriately: GET, POST, PATCH, DELETE
- Return consistent response format with `data` wrapper
- Use proper HTTP status codes
- Implement pagination for lists
- Use query parameters for filtering

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with recommended rules
- **Prettier**: Consistent code formatting
- **Tests**: Unit tests for services, E2E for critical paths
- **Documentation**: JSDoc for public APIs

---

## Future Architecture Enhancements

### Phase 2: Microservices (Optional)

If scale requires, domains can be split:
- **Core HR Service**: Employees, Departments, Attendance
- **Payroll Service**: Payroll, Salary Structures
- **Leave Service**: Leave management
- **Notification Service**: Email, SMS, Push

### Phase 3: Event-Driven

- Use message queue (RabbitMQ/AWS SQS) for async operations
- Events: EmployeeCreated, PayrollProcessed, LeaveApproved
- Enables better decoupling and scalability

### Phase 4: Real-time Features

- WebSockets for live updates
- Server-Sent Events for notifications
- Real-time dashboard updates

---

## Conclusion

The HR Enterprise architecture provides a solid foundation for enterprise HR management with:

- **Clean separation** of concerns between frontend and backend
- **Domain-driven design** for maintainable backend code
- **Feature-based modules** for scalable frontend development
- **Robust security** with JWT and RBAC
- **Type safety** throughout the stack
- **Scalable patterns** ready for growth

The modular monolith approach allows for rapid development while maintaining the flexibility to evolve into microservices if needed in the future.

---

## Document Information

- **Version**: 1.0
- **Last Updated**: 2026-02-14
- **Author**: System Architect
- **Status**: Active
- **Related Documents**:
  - frontend.md (Detailed Frontend Architecture)
  - backend.md (Detailed Backend Architecture)
