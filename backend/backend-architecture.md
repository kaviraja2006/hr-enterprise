# HR Enterprise Backend Architecture

## Table of Contents
1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Directory Structure](#directory-structure)
4. [Domain Modules](#domain-modules)
5. [API Design](#api-design)
6. [Database Architecture](#database-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Security Architecture](#security-architecture)
9. [Background Jobs](#background-jobs)
10. [Error Handling](#error-handling)
11. [Testing Strategy](#testing-strategy)
12. [Best Practices](#best-practices)

---

## Overview

The HR Enterprise backend is built with **NestJS** and follows **Domain-Driven Design (DDD)** principles. It's organized as a **Modular Monolith** with clear domain boundaries, making it maintainable and scalable while keeping deployment simple.

### Key Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | NestJS | 11.x | API framework |
| Language | TypeScript | 5.x | Type safety |
| Database | PostgreSQL | 15+ | Data storage |
| ORM | Prisma | 7.x | Database access |
| Auth | Passport + JWT | - | Authentication |
| Validation | class-validator | - | Input validation |
| Scheduling | @nestjs/schedule | - | Cron jobs |
| Security | Helmet, CORS | - | Security |
| Testing | Jest | - | Testing |

---

## Architecture Patterns

### 1. Domain-Driven Design (DDD)

The application is organized around business domains, not technical layers.

```
┌─────────────────────────────────────────────────────────────┐
│                    Bounded Contexts                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Auth    │  │ Employees│  │ Payroll  │  │  Leave   │    │
│  │ Context  │  │ Context  │  │ Context  │  │ Context  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Attendance│  │  RBAC    │  │Recruit.  │  │Compliance│    │
│  │ Context  │  │ Context  │  │ Context  │  │ Context  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Modular Monolith Pattern

```
src/
├── Core Infrastructure (common/, database/, config/)
│
├── Domain Module 1 (auth/)
├── Domain Module 2 (employees/)
├── Domain Module 3 (payroll/)
├── Domain Module N (settings/)
│
└── Shared Kernel (shared/)
```

**Benefits:**
- Clear boundaries between domains
- Easy to understand and maintain
- Can migrate to microservices later
- Simpler deployment and testing

### 3. Layered Architecture

Each module follows Clean Architecture layers:

```
┌─────────────────────────────────────┐
│  Controller Layer (HTTP handling)    │
│  - Request/Response mapping          │
│  - Input validation (DTOs)           │
│  - Authorization checks              │
├─────────────────────────────────────┤
│  Service Layer (Business logic)      │
│  - Domain operations                 │
│  - Business rules                    │
│  - Transaction management            │
├─────────────────────────────────────┤
│  Repository Layer (Data access)      │
│  - Prisma ORM operations             │
│  - Query optimization                │
│  - Transaction boundaries            │
├─────────────────────────────────────┤
│  Database Layer (PostgreSQL)         │
│  - Tables, indexes, constraints      │
└─────────────────────────────────────┘
```

---

## Directory Structure

```
backend/
├── prisma/                          # Database schema & migrations
│   ├── schema.prisma                # Prisma schema (520+ lines)
│   ├── seed.ts                      # Database seeding script
│   └── migrations/                  # Migration files
│
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── config/                      # Configuration layer
│   │   ├── configuration.ts         # Config factory
│   │   └── validation.ts            # Env validation (Joi)
│   │
│   ├── database/                    # Database layer
│   │   ├── prisma.module.ts         # Global Prisma module
│   │   └── prisma.service.ts        # Prisma client wrapper
│   │
│   ├── common/                      # Cross-cutting concerns
│   │   ├── decorators/              # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   │
│   │   ├── guards/                  # Authentication guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── roles.guard.ts
│   │   │
│   │   ├── filters/                 # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   │
│   │   ├── interceptors/            # Request/response interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   │
│   │   ├── pipes/                   # Validation pipes
│   │   │   └── parse-uuid.pipe.ts
│   │   │
│   │   └── utils/                   # Utility functions
│   │       └── encryption.utils.ts  # bcrypt functions
│   │
│   ├── shared/                      # Shared kernel
│   │   ├── audit/                   # Audit logging
│   │   │   ├── audit.service.ts
│   │   │   └── audit.module.ts
│   │   │
│   │   └── errors/                  # Custom errors
│   │       ├── domain.error.ts
│   │       └── infrastructure.error.ts
│   │
│   └── Domain Modules (16 modules)  # Feature modules
│       ├── auth/                    # Authentication
│       ├── users/                   # User management
│       ├── rbac/                    # Role-based access control
│       ├── employees/               # Employee management
│       ├── departments/             # Department management
│       ├── attendance/              # Attendance tracking
│       ├── leave/                   # Leave management
│       ├── payroll/                 # Payroll processing
│       ├── performance/             # Performance reviews
│       ├── recruitment/             # Hiring & candidates
│       ├── compliance/              # Compliance tracking
│       ├── analytics/               # HR analytics
│       ├── workflow/                # Approval workflows
│       └── scheduler/               # Background jobs
│
├── test/                            # E2E tests
├── .env                             # Environment variables
├── nest-cli.json                    # NestJS CLI config
└── package.json                     # Dependencies
```

---

## Domain Modules

Each domain module follows a consistent structure:

```
modules/[domain]/
├── [domain].module.ts               # Module definition
├── [domain].controller.ts           # HTTP controller
├── [domain].service.ts              # Business logic
├── dto/                             # Data Transfer Objects
│   ├── create-[domain].dto.ts
│   ├── update-[domain].dto.ts
│   └── [other].dto.ts
└── [optional-sub-folders]
```

### Module Definition Pattern

```typescript
// employees.module.ts
@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
```

### Controller Pattern

```typescript
// employees.controller.ts
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)  // Class-level guards
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Permissions('employees:read')  // Method-level permission
  async findAll(@Query() query: ListEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @Permissions('employees:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Permissions('employees:create')
  async create(@Body() data: CreateEmployeeDto) {
    return this.employeesService.create(data);
  }

  @Patch(':id')
  @Permissions('employees:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, data);
  }

  @Delete(':id')
  @Permissions('employees:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.remove(id);
  }
}
```

### Service Pattern

```typescript
// employees.service.ts
@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: ListParams) {
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip: params.skip,
        take: params.take,
        include: { department: true, manager: true },
      }),
      this.prisma.employee.count(),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, manager: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(data: CreateEmployeeDto) {
    try {
      return await this.prisma.employee.create({
        data,
        include: { department: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Employee with this email already exists');
      }
      throw error;
    }
  }
}
```

### DTO Pattern

```typescript
// dto/create-employee.dto.ts
export class CreateEmployeeDto {
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  departmentId: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsDateString()
  dateOfJoining: string;
}
```

---

## API Design

### RESTful API Standards

**Resource Naming**:
```
GET    /employees              # List all employees
GET    /employees/:id          # Get single employee
POST   /employees              # Create employee
PATCH  /employees/:id          # Update employee
DELETE /employees/:id          # Delete employee

GET    /employees/:id/team     # Get team members
POST   /employees/:id/manager  # Assign manager
```

**HTTP Methods**:
- `GET` - Read operations
- `POST` - Create operations
- `PATCH` - Partial updates
- `PUT` - Full replacements (rarely used)
- `DELETE` - Remove operations

**Status Codes**:
- `200 OK` - Successful read
- `201 Created` - Successful creation
- `204 No Content` - Successful deletion
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

### Response Format

**Success Response** (via TransformInterceptor):
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    ...
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error Response** (via HttpExceptionFilter):
```json
{
  "statusCode": 404,
  "timestamp": "2026-02-14T12:00:00.000Z",
  "path": "/employees/invalid-id",
  "method": "GET",
  "message": "Employee with ID invalid-id not found",
  "code": "P2025"
}
```

### Pagination Pattern

All list endpoints support pagination:

**Request**:
```http
GET /employees?page=1&limit=10&search=john&department=engineering
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Implementation**:
```typescript
async findAll(@Query() query: ListQueryDto) {
  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    this.prisma.employee.findMany({ where, skip, take }),
    this.prisma.employee.count({ where }),
  ]);

  return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
```

---

## Database Architecture

### Prisma Schema Design

**Schema Organization** (18 models):

1. **User & Authentication**
   - `User` - System users
   - `RefreshToken` - JWT refresh tokens

2. **RBAC**
   - `Role` - User roles
   - `Permission` - Granular permissions
   - `RolePermission` - Role-permission mapping

3. **Core HR**
   - `Department` - Organizational departments
   - `Employee` - Employee records

4. **Attendance**
   - `Attendance` - Daily attendance records

5. **Leave Management**
   - `LeaveType` - Leave categories
   - `LeaveBalance` - Employee leave balances
   - `LeaveRequest` - Leave applications

6. **Payroll**
   - `SalaryStructure` - Salary components
   - `PayrollRun` - Monthly payroll runs
   - `PayrollEntry` - Individual payroll entries

7. **Performance**
   - `Goal` - Employee goals
   - `PerformanceReview` - Performance reviews

8. **Recruitment**
   - `Job` - Job postings
   - `Candidate` - Job candidates

9. **Compliance**
   - `FilingRecord` - Statutory filings
   - `PolicyAcknowledgement` - Policy acknowledgements

10. **Workflow**
    - `Approval` - Approval workflows
    - `ApprovalStep` - Workflow steps

11. **Audit**
    - `AuditLog` - System audit trail

### Key Design Patterns

**Naming Conventions**:
```prisma
model Employee {
  id            String   @id @default(uuid())
  firstName     String   @map("first_name")
  lastName      String   @map("last_name")
  email         String   @unique
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("employees")
}
```

**Relationships**:
```prisma
// Self-referencing (manager hierarchy)
model Employee {
  id        String  @id @default(uuid())
  managerId String? @map("manager_id")
  manager   Employee? @relation("EmployeeManager", fields: [managerId], references: [id])
  team      Employee[] @relation("EmployeeManager")
}

// Many-to-many through junction table
model Role {
  id          String           @id @default(uuid())
  permissions RolePermission[]
}

model Permission {
  id    String           @id @default(uuid())
  roles RolePermission[]
}

model RolePermission {
  roleId       String @map("role_id")
  permissionId String @map("permission_id")
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
  @@map("role_permissions")
}
```

**Indexes**:
```prisma
model Employee {
  id       String @id @default(uuid())
  email    String @unique
  departmentId String @map("department_id")

  @@index([departmentId])
  @@index([email])
}
```

### Prisma Service Configuration

```typescript
// database/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Query logging
    this.$on('query' as never, (e: any) => {
      this.logger.debug(`Query: ${e.query} - ${e.duration}ms`);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
```

---

## Authentication & Authorization

### JWT Authentication Flow

```
┌──────────┐     1. Login      ┌──────────┐     2. Validate    ┌──────────┐
│  Client  │ ────────────────► │  Auth    │ ────────────────►  │  User    │
│          │   {email, pass}   │ Service  │                    │  DB      │
└──────────┘                   └──────────┘                    └──────────┘
                                                                      │
       │                                                              │
       │ 3. Generate Tokens                                           │
       │◄─────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────┐
│{access,  │
│ refresh} │
└──────────┘
       │
       │ 4. Return Tokens + User
       ▼
┌──────────┐
│  Client  │
└──────────┘
```

### Token Structure

**Access Token** (15 minutes):
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roleId": "role-uuid",
  "roleName": "admin",
  "employeeId": "employee-uuid",
  "permissions": ["employees:read", "employees:write"],
  "iat": 1707912000,
  "exp": 1707912900
}
```

**Refresh Token** (7 days):
```json
{
  "sub": "user-uuid",
  "tokenId": "refresh-token-uuid",
  "iat": 1707912000,
  "exp": 1708516800
}
```

### Authentication Implementation

```typescript
// auth.service.ts
async login(loginDto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: loginDto.email },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  if (!user || !await comparePassword(loginDto.password, user.passwordHash)) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const tokens = await this.generateTokens(user);
  return { user: this.sanitizeUser(user), tokens };
}

private async generateTokens(user: User) {
  const permissions = user.role?.permissions.map(
    rp => `${rp.permission.resource}:${rp.permission.action}`
  ) || [];

  const payload = {
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role?.name,
    employeeId: user.employeeId,
    permissions,
  };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET, expiresIn: '15m' }),
    this.jwtService.signAsync({ sub: user.id }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }),
  ]);

  // Store refresh token in DB
  await this.prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, expiresIn: 900 };
}
```

### Authorization Guards

**JwtAuthGuard** - Validates JWT:
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

**PermissionsGuard** - Checks permissions:
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    const userPermissions: string[] = user.permissions || [];

    return requiredPermissions.every(permission =>
      userPermissions.includes(permission) || userPermissions.includes('*')
    );
  }
}
```

**Usage**:
```typescript
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  @Get()
  @Permissions('employees:read')
  findAll() { ... }

  @Post()
  @Permissions('employees:create')
  create() { ... }
}
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                   │
│  - HTTPS/TLS encryption                                      │
│  - CORS configuration                                        │
│  - Rate limiting                                             │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Application Security                               │
│  - Helmet security headers                                   │
│  - Input validation                                          │
│  - SQL injection prevention (Prisma)                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Authentication                                     │
│  - JWT token validation                                      │
│  - Password hashing (bcrypt)                                 │
│  - Token refresh rotation                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Authorization                                      │
│  - RBAC permission checks                                    │
│  - Resource-level access control                             │
│  - Audit logging                                             │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Data Security                                      │
│  - Database encryption at rest                               │
│  - Sensitive data masking                                    │
│  - Backup encryption                                         │
└─────────────────────────────────────────────────────────────┘
```

### Security Implementation

**Helmet Configuration**:
```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

**CORS Configuration**:
```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Rate Limiting**:
```typescript
// app.module.ts
ThrottlerModule.forRoot({
  throttlers: [
    {
      ttl: 60,
      limit: 100,
    },
  ],
})
```

**Input Validation**:
```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

---

## Background Jobs

### Scheduler Service

```typescript
// scheduler.service.ts
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_11_59PM, { timeZone: 'Asia/Kolkata' })
  async markAbsentees() {
    this.logger.log('Running absentee marking job');
    // Mark employees without attendance as absent
  }

  @Cron('0 5 1 * *', { timeZone: 'Asia/Kolkata' })  // 1st of month at 12:05 AM IST
  async accrueLeave() {
    this.logger.log('Running leave accrual job');
    // Add monthly leave balance to all employees
  }

  @Cron('0 10 1 1 *', { timeZone: 'Asia/Kolkata' })  // Jan 1st at 12:10 AM IST
  async carryForwardLeave() {
    this.logger.log('Running leave carry forward job');
    // Carry forward unused leave to new year
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { timeZone: 'Asia/Kolkata' })
  async sendApprovalReminders() {
    this.logger.log('Running approval reminder job');
    // Send reminders for pending approvals
  }
}
```

### Cron Job Schedule

| Job | Schedule | Description |
|-----|----------|-------------|
| Mark Absentees | Daily 11:59 PM IST | Auto-mark employees without check-in |
| Leave Accrual | Monthly 1st 12:05 AM IST | Add monthly leave balance |
| Leave Carry Forward | Yearly Jan 1 12:10 AM IST | Carry forward remaining leaves |
| Approval Reminders | Daily 9:00 AM IST | Notify approvers |
| Compliance Checks | Daily 8:00 AM IST | Check filing due dates |

---

## Error Handling

### Exception Filter Hierarchy

```
Error Occurs
    │
    ├──► Prisma Error ─────► PrismaExceptionFilter
    │                         - P2002: 409 Conflict
    │                         - P2003: 400 Bad Request
    │                         - P2025: 404 Not Found
    │
    ├──► Validation Error ─► ValidationPipe
    │                         - Returns 422 with field errors
    │
    ├──► Domain Error ─────► Custom Exception
    │                         - NotFoundException
    │                         - ConflictException
    │                         - BadRequestException
    │
    └──► Unknown Error ────► HttpExceptionFilter
                              - Returns 500 Internal Server Error
```

### Exception Filters

**PrismaExceptionFilter**:
```typescript
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Unique constraint violation';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
    });
  }
}
```

**HttpExceptionFilter**:
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
      method: request.method,
      message: exception.message,
    });
  }
}
```

### Error Response Format

```json
{
  "statusCode": 404,
  "timestamp": "2026-02-14T12:00:00.000Z",
  "path": "/employees/invalid-id",
  "method": "GET",
  "message": "Employee with ID invalid-id not found",
  "code": "P2025"
}
```

---

## Testing Strategy

### Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Critical flows)
        │    (10%)    │
       ┌┴─────────────┴┐
       │  Integration  │  (API + DB)
       │    (20%)      │
      ┌┴───────────────┴┐
      │   Unit Tests    │  (Services, Utils)
      │     (70%)       │
      └─────────────────┘
```

### Unit Testing

```typescript
// employees.service.spec.ts
describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get(EmployeesService);
    prisma = module.get(PrismaService);
  });

  describe('findOne', () => {
    it('should return an employee', async () => {
      const employee = { id: '1', firstName: 'John', lastName: 'Doe' };
      prisma.employee.findUnique.mockResolvedValue(employee as any);

      const result = await service.findOne('1');

      expect(result).toEqual(employee);
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { department: true },
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### E2E Testing

```typescript
// test/employees.e2e-spec.ts
describe('EmployeesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.data).toBeDefined();
        expect(res.body.meta).toBeDefined();
      });
  });
});
```

---

## Best Practices

### 1. Module Design

**DO**:
- Keep modules focused on single domain
- Export only what's needed via index.ts
- Use dependency injection
- Follow consistent naming

**DON'T**:
- Create god modules
- Have circular dependencies
- Mix concerns in services
- Bypass the module system

### 2. Database Access

**DO**:
- Use Prisma transactions for multi-table operations
- Include related data with `include` when needed
- Use `select` to limit returned fields
- Create indexes on frequently queried fields

**DON'T**:
- Use raw SQL unless necessary
- Load entire tables into memory
- Skip transactions for related updates
- Ignore query performance

### 3. API Design

**DO**:
- Use RESTful conventions
- Return consistent response formats
- Implement proper HTTP status codes
- Document APIs with Swagger/OpenAPI

**DON'T**:
- Mix HTTP methods inappropriately
- Return sensitive data
- Ignore pagination for lists
- Break backward compatibility

### 4. Security

**DO**:
- Validate all inputs
- Use parameterized queries
- Hash passwords with bcrypt
- Implement rate limiting
- Log security events

**DON'T**:
- Trust client input
- Log sensitive data
- Use weak passwords
- Skip authentication
- Ignore CORS

### 5. Error Handling

**DO**:
- Use specific exceptions
- Provide helpful error messages
- Log errors with context
- Return consistent error format

**DON'T**:
- Swallow exceptions silently
- Return stack traces in production
- Use generic error messages
- Ignore edge cases

### 6. Performance

**DO**:
- Use database indexes
- Implement caching where needed
- Optimize Prisma queries
- Use pagination
- Profile slow queries

**DON'T**:
- Load unnecessary data
- Ignore N+1 queries
- Skip pagination
- Use synchronous operations in loops

### 7. Testing

**DO**:
- Write unit tests for services
- Test error scenarios
- Mock external dependencies
- Test database interactions

**DON'T**:
- Skip testing
- Test implementation details
- Mock everything
- Ignore integration testing

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/login | User login | No |
| POST | /auth/register | User registration | No |
| POST | /auth/refresh | Refresh tokens | No |
| POST | /auth/logout | Logout | Yes |
| POST | /auth/logout-all | Logout all sessions | Yes |
| POST | /auth/change-password | Change password | Yes |
| GET | /auth/me | Get current user | Yes |

### Employee Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /employees | List employees | employees:read |
| GET | /employees/:id | Get employee | employees:read |
| POST | /employees | Create employee | employees:create |
| PATCH | /employees/:id | Update employee | employees:update |
| DELETE | /employees/:id | Delete employee | employees:delete |
| GET | /employees/:id/team | Get team members | employees:read |
| POST | /employees/:id/manager | Assign manager | employees:update |

### Department Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /departments | List departments | departments:read |
| GET | /departments/:id | Get department | departments:read |
| POST | /departments | Create department | departments:create |
| PATCH | /departments/:id | Update department | departments:update |
| DELETE | /departments/:id | Delete department | departments:delete |

### Analytics Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /analytics/executive-summary | Executive dashboard data | analytics:read |
| GET | /analytics/attendance | Attendance metrics | analytics:read |
| GET | /analytics/leave | Leave metrics | analytics:read |
| GET | /analytics/payroll | Payroll metrics | analytics:read |
| GET | /analytics/attrition | Attrition rate | analytics:read |
| GET | /analytics/departments | Department analytics | analytics:read |

---

## Environment Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/hr_enterprise

# JWT Configuration
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
JWT_REFRESH_EXPIRATION=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Application Configuration
APP_NAME=HR Enterprise
APP_VERSION=1.0.0
```

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] JWT secrets are strong and unique
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health checks implemented
- [ ] SSL/TLS configured
- [ ] Backup strategy in place
- [ ] Monitoring setup

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hr_enterprise
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=hr_enterprise
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Monitoring & Logging

### Application Logging

```typescript
// Uses NestJS Logger
private readonly logger = new Logger(ServiceName.name);

// Log levels
this.logger.log('Information message');
this.logger.error('Error message', error.stack);
this.logger.warn('Warning message');
this.logger.debug('Debug message');
this.logger.verbose('Verbose message');
```

### Request Logging

```typescript
// LoggingInterceptor logs all requests
[LoggingInterceptor] GET /employees 200 - 45ms
[LoggingInterceptor] POST /employees 201 - 120ms
```

### Audit Logging

All mutations are logged via AuditService:
```typescript
{
  userId: "user-uuid",
  action: "UPDATE",
  entity: "Employee",
  entityId: "employee-uuid",
  oldValues: { salary: 50000 },
  newValues: { salary: 55000 },
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  timestamp: "2026-02-14T12:00:00Z"
}
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/)

---

**Version**: 1.0  
**Last Updated**: 2026-02-14  
**Status**: Active
