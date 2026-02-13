# HR Service

## 1️⃣ Header & Contract

**Purpose:** Employee management, attendance tracking, and leave request workflows.

**Classification:** OPTIONAL ADD-ON

**Authority:** This service is governed by [SYSTEM.README.md](/SYSTEM.README.md). All platform rules apply.

**⚠️ WARNING:** HR is an add-on. It can be disabled without breaking the platform. Never assume this service is running. Never call this service directly from other services.

---

## 2️⃣ Why This Service Exists

The HR Service exists to manage **human resources operations** within the platform:

- **Employee data management** — Core employee records
- **Attendance tracking** — Daily attendance and work hours
- **Leave management** — Leave requests with approval workflows

**Why responsibility is isolated:**

HR operations are distinct from:

- **Finance** — HR manages employees; Finance manages payroll
- **Inventory** — No relationship
- **Sales** — No relationship

**Why it is an add-on:**

- Small companies may not need HR features
- Can be enabled/disabled per tenant
- Standalone value without other modules

---

## 3️⃣ What This Service Owns (EXHAUSTIVE)

### Domain Concepts

| Concept          | Model          | Purpose                         |
| ---------------- | -------------- | ------------------------------- |
| **Employee**     | `Employee`     | Core employee record            |
| **Department**   | `Department`   | Organizational unit             |
| **Designation**  | `Designation`  | Job title/role                  |
| **Attendance**   | `Attendance`   | Daily attendance record         |
| **LeaveRequest** | `LeaveRequest` | Leave application with workflow |

### Data Owned

- Employee personal data (name, code, status)
- Department structure
- Designation hierarchy
- Daily attendance with check-in/out
- Leave requests with approval workflow

### IDs Generated

- All `Employee.id` (UUID v4)
- All `Department.id` (UUID v4)
- All `Designation.id` (UUID v4)
- All `Attendance.id` (UUID v4)
- All `LeaveRequest.id` (UUID v4)

### Workflows Controlled

- **Leave Request Workflow:**
  - `DRAFT` → `PENDING` → `APPROVED`/`REJECTED`
  - Approval/rejection by manager
  - Idempotency support

- **Attendance Workflow:**
  - Check-in / Check-out tracking
  - Manual entry for exceptions

### State Transitions

| Entity                       | States                                         | Transitions      |
| ---------------------------- | ---------------------------------------------- | ---------------- |
| `Employee.status`            | `active` / `inactive`                          | Manual change    |
| `LeaveRequest.status`        | `pending` / `approved` / `rejected`            | Manager approval |
| `LeaveRequest.workflowState` | `PENDING` / `APPROVED` / `REJECTED` / `FAILED` | Workflow         |

---

## 4️⃣ What This Service Does NOT Do (STRICT)

### Explicit Denials

| Denial                                     | Reason                       |
| ------------------------------------------ | ---------------------------- |
| ❌ Does NOT manage payroll                 | Belongs to Finance service   |
| ❌ Does NOT manage benefits                | Future Finance module        |
| ❌ Does NOT handle recruitment             | Future module                |
| ❌ Does NOT perform performance reviews    | Future module                |
| ❌ Does NOT know about user authentication | Auth owns identity           |
| ❌ Does NOT validate user permissions      | Gateway enforces permissions |
| ❌ Does NOT check module enablement        | Gateway enforces module      |

### Forbidden Assumptions

This service must NEVER assume:

- Auth service is running (but it always is)
- Finance service is running
- Any user has specific permissions
- Other services exist

---

## 5️⃣ Internal Architecture (DEEP)

### Layer Responsibilities

```
Request → Controller → Application → Domain → Repository → Schema
```

### Controller Layer

**Routes Handled:**

- `GET /hr/employees` — List employees
- `POST /hr/employees` — Create employee
- `GET /hr/attendance` — List attendance
- `POST /hr/attendance` — Record attendance
- `GET /hr/leave-requests` — List leave requests
- `POST /hr/leave-requests` — Submit leave request

### Application Service Layer

**Key Methods:**

- `createEmployee()` — Create employee record
- `recordAttendance()` — Check-in/out
- `submitLeaveRequest()` — Submit leave
- `approveLeaveRequest()` — Approve/reject leave
- `listEmployees()` — Query employees
- `listAttendance()` — Query attendance

### Domain Layer

**Invariants:**

- Employee must have valid `userId`
- Department/Designation must exist
- Attendance must be unique per employee per date
- Leave request must have valid dates

### Repository Layer

**Responsibilities:**

- Employee CRUD
- Attendance CRUD
- Leave request CRUD with idempotency

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     HR SERVICE INTERNAL                           │
├─────────────────────────────────────────────────────────────────┤
│  CONTROLLER LAYER                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ EmployeeController│ │ AttendanceController│ │ LeaveController│ │
│  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            HRApplicationService                         │   │
│  │  • createEmployee()  • submitLeaveRequest()          │   │
│  │  • recordAttendance()  • approveLeaveRequest()        │   │
│  └────────────────────────┬──────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ EmployeeDomain│  │ AttendanceDomain│ │ LeaveDomain    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORY LAYER                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │ EmployeeRepo │  │ AttendanceRepo │ │ LeaveRepo      │   │
│  └───────┬───────┘  └───────┬───────┘  └────────┬─────────┘   │
└───────────┼─────────────────┼───────────────────┼─────────────┘
            │                 │                   │
            ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  SCHEMA: hr                                                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐   │
│  │employees │  │attendance│  │ leave_requests           │   │
│  │departments│  └───────────┘  └───────────────────────────┘   │
│  │designations│                                                 │
│  └───────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ Database & Schema Contract

### Schema Name

```
hr
```

### Models and Purpose

| Model          | Purpose             | Key Fields                                                                                         |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| `Employee`     | Core employee       | `id`, `userId`, `employeeCode`, `firstName`, `lastName`, `status`, `departmentId`, `designationId` |
| `Department`   | Organizational unit | `id`, `name`, `description`                                                                        |
| `Designation`  | Job title           | `id`, `title`                                                                                      |
| `Attendance`   | Daily attendance    | `id`, `employeeId`, `attendanceDate`, `checkIn`, `checkOut`, `status`                              |
| `LeaveRequest` | Leave workflow      | `id`, `employeeId`, `startDate`, `endDate`, `workflowState`, `status`, `idempotencyKey`            |

### Append-Only Rules

| Model          | Append-Only? | Reason                     |
| -------------- | ------------ | -------------------------- |
| `Employee`     | No           | Updated for status changes |
| `Department`   | No           | Can be updated             |
| `Designation`  | No           | Can be updated             |
| `Attendance`   | Yes          | Historical record          |
| `LeaveRequest` | No           | Workflow state updates     |

### Workflow Fields

**LeaveRequest has workflow fields:**

```prisma
workflowId      String?   @map("workflow_id")
workflowState  String?   @map("workflow_state")
lastErrorCode  String?   @map("last_error_code")
idempotencyKey String?   @unique @map("idempotency_key")
```

**Attendance does NOT have workflow fields** (simple CRUD).

### UUID-Only References

| Reference                 | Target            | Type           |
| ------------------------- | ----------------- | -------------- |
| `Employee.userId`         | Auth.User.id      | String (no FK) |
| `Employee.departmentId`   | HR.Department.id  | UUID FK        |
| `Employee.designationId`  | HR.Designation.id | UUID FK        |
| `Attendance.employeeId`   | HR.Employee.id    | UUID FK        |
| `LeaveRequest.employeeId` | HR.Employee.id    | UUID FK        |

### Soft-Delete Rules

- `Employee.deletedAt` — Present (soft delete)
- `Department` — No soft delete
- `Designation` — No soft delete
- `Attendance` — No soft delete
- `LeaveRequest` — No soft delete

### What Must NEVER Be Stored

- ❌ User credentials (belongs in Auth)
- ❌ Payroll data (belongs in Finance)
- ❌ Cross-schema foreign keys
- ❌ Business data from other services

---

## 7️⃣ API Surface (LOGICAL, NOT HTTP)

### Capabilities Exposed

| Capability           | Type          | Description                        |
| -------------------- | ------------- | ---------------------------------- |
| **Manage Employees** | Command/Query | Create, read, update employees     |
| **Track Attendance** | Command       | Record check-in/check-out          |
| **Submit Leave**     | Command       | Create leave request               |
| **Approve Leave**    | Command       | Manager approval workflow          |
| **Query Reports**    | Query         | List employees, attendance, leaves |

### Commands vs Queries

| Command               | Effect                | Idempotent?                |
| --------------------- | --------------------- | -------------------------- |
| `createEmployee`      | Creates employee      | No (code unique)           |
| `recordAttendance`    | Records check-in/out  | Yes (date+employee unique) |
| `submitLeaveRequest`  | Creates leave request | Yes (idempotency key)      |
| `approveLeaveRequest` | Approves/rejects      | No (state change)          |
| `updateEmployee`      | Updates employee      | No                         |

| Query               | Returns            |
| ------------------- | ------------------ |
| `listEmployees`     | Employee list      |
| `listAttendance`    | Attendance records |
| `listLeaveRequests` | Leave requests     |

### Expected Inputs/Outputs (Conceptual)

**Create Employee Input:**

```typescript
{
  userId: string,           // From Auth
  employeeCode: string,
  firstName: string,
  lastName: string,
  departmentId?: string,
  designationId?: string,
  joinDate: Date
}
```

**Leave Request Workflow Output:**

```typescript
{
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  workflowState: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED',
  lastErrorCode?: string,  // If FAILED
  idempotencyKey?: string
}
```

### Failure Modes

| Failure                | Response                 | Meaning           |
| ---------------------- | ------------------------ | ----------------- |
| Employee not found     | `EMPLOYEE_NOT_FOUND`     | Invalid reference |
| Leave dates invalid    | `INVALID_LEAVE_DATES`    | Business rule     |
| Attendance duplicate   | `ATTENDANCE_EXISTS`      | Already recorded  |
| Unauthorized approval  | `PERMISSION_DENIED`      | Not manager       |
| Workflow invalid state | `INVALID_WORKFLOW_STATE` | Can't approve     |

---

## 8️⃣ Error & Failure Model

### Error Types

| Type                     | Examples                                    | Handling            |
| ------------------------ | ------------------------------------------- | ------------------- |
| **Domain Error**         | `EMPLOYEE_NOT_FOUND`, `INVALID_LEAVE_DATES` | Returned to client  |
| **Infrastructure Error** | `DB_WRITE_FAILURE`                          | Retried, return 500 |

### Domain Errors

| Code                     | Message                    | When                  |
| ------------------------ | -------------------------- | --------------------- |
| `EMPLOYEE_NOT_FOUND`     | Employee does not exist    | Invalid reference     |
| `INVALID_LEAVE_DATES`    | End date before start date | Business rule         |
| `ATTENDANCE_EXISTS`      | Already recorded for date  | Duplicate             |
| `INVALID_WORKFLOW_STATE` | Cannot approve pending     | State machine         |
| `PERMISSION_DENIED`      | Not authorized             | Approval without role |

### Error-as-Data Implementation

**LeaveRequest stores errors:**

```typescript
{
  workflowState: 'FAILED',
  lastErrorCode: 'INVALID_LEAVE_DATES',
  lastErrorAt: Date
}
```

### Idempotency

| Operation            | Idempotent? | Key                       |
| -------------------- | ----------- | ------------------------- |
| `submitLeaveRequest` | Yes         | `idempotencyKey`          |
| `recordAttendance`   | Yes         | (employeeId, date) unique |
| `createEmployee`     | No          | -                         |

### Failure Guarantees

- **On DB failure:** Request fails with 500
- **On validation failure:** Request fails with 400, no partial state
- **On workflow failure:** State set to `FAILED`, error code stored

---

## 9️⃣ Interaction With Other Services

### External ID References

**This service references:**

- `User.id` — As `Employee.userId` (from Auth)
- No other external references

### Blind-to-Others Guarantees

| Guarantee          | Description                         |
| ------------------ | ----------------------------------- |
| Blind to Auth      | Doesn't know about sessions, tokens |
| Blind to Finance   | Doesn't know about payroll          |
| Blind to Inventory | No relationship                     |
| Blind to Sales     | No relationship                     |

### Future Workflow Possibilities

| Workflow            | Trigger          | Effect                         |
| ------------------- | ---------------- | ------------------------------ |
| Auto-provision user | Employee created | Future: Event to Auth          |
| Sync to Finance     | Employee active  | Future: Event to Finance       |
| Notify manager      | Leave request    | Future: Event to Notifications |

### Forbidden Integrations

| Forbidden                        | Reason                         |
| -------------------------------- | ------------------------------ |
| Direct SQL to Auth schema        | Cross-schema access            |
| HTTP call to Finance             | Services don't call each other |
| FK to Finance tables             | Schema isolation               |
| Business validation from Finance | Separate services              |

---

## 🔟 Current Implementation Status (VERIFIED)

### ✅ Complete & Production-Safe

| Component           | Status      | Notes                           |
| ------------------- | ----------- | ------------------------------- |
| Employee management | ✅ Complete | CRUD, departments, designations |
| Attendance tracking | ✅ Complete | Check-in/out, manual entry      |
| Leave requests      | ✅ Complete | Workflow with approval          |
| Idempotency         | ✅ Complete | Leave requests                  |
| Error persistence   | ✅ Complete | `lastErrorCode` on leave        |

### ⚠️ Intentionally Deferred

| Feature              | Reason    | Future Plan                       |
| -------------------- | --------- | --------------------------------- |
| Leave approvals UI   | MVP scope | Future: Manager dashboard         |
| Leave policies       | MVP scope | Future: Carry-forward, accrual    |
| Overtime calculation | MVP scope | Future: Auto-calc from attendance |
| Integration events   | Future    | Event bus required                |

---

## 1️⃣1️⃣ Scalability & Evolution

### Horizontal Scaling

- Stateless service
- Database scales with read replicas
- No shared state

### Event-Driven Workflow Support

**Current:** Synchronous approval (manager reviews)

**Future Capabilities:**

- `LeaveRequestCreated` event → Notifications
- `EmployeeActivated` event → Finance provisioning
- `AttendanceRecorded` event → Payroll integration

### Multi-Tenant Readiness

**Current:** Single-tenant (all data in same schema)

**Future Capabilities:**

- Row-level security
- Tenant-scoped queries
- Per-tenant leave policies

---

## 1️⃣2️⃣ Add-On Removal Safety

### What Happens If HR Is Disabled

| Scenario               | Effect                         |
| ---------------------- | ------------------------------ |
| Gateway request to HR  | 403 `MODULE_NOT_ENABLED`       |
| Frontend HR navigation | Hidden (disabledModules check) |
| Other services         | Unaffected                     |
| HR service             | Still running (idle)           |
| HR data                | Preserved in `hr` schema       |

### Gateway Blocking Behavior

- `GET /hr/employees` → 403 if `HR` not in `enabledModules`
- `POST /hr/leave-requests` → 403 if `HR` not in `enabledModules`
- All HR routes blocked

### Other Services Unaffected

| Service   | Impact | Reason                   |
| --------- | ------ | ------------------------ |
| Auth      | None   | Independent              |
| Finance   | None   | Independent              |
| Inventory | None   | Independent              |
| Sales     | None   | Independent              |
| Frontend  | None   | Adapts to enabledModules |

---

## 1️⃣3️⃣ Absolute Rules (DO NOT BREAK)

### ⛔ NEVER DO THESE

1. **NEVER add cross-schema database access**
   - No joins to Auth schema
   - No FKs to other services
   - HR owns `hr` schema only

2. **NEVER call other services from here**
   - No HTTP calls to Finance
   - No HTTP calls to Auth
   - Services are independent

3. **NEVER assume services exist**
   - Finance may be disabled
   - Notifications may be disabled
   - Code must work without them

4. **NEVER store user credentials**
   - Only reference `userId` from Auth
   - No passwords, no tokens

5. **NEVER implement payment logic**
   - Payroll belongs to Finance
   - HR only manages employee data

6. **NEVER skip workflow fields**
   - LeaveRequest MUST have `workflowState`
   - LeaveRequest MUST have `lastErrorCode`
   - Failures are persisted facts

7. **NEVER bypass idempotency**
   - Leave requests MUST support idempotencyKey
   - Duplicate requests MUST be handled

---

## References

- **[SYSTEM.README.md](/SYSTEM.README.md)** — Platform architectural contract
- **[AGENTS.md](/AGENTS.md)** — Developer operational rules
- **HR Schema** — `apps/hr/prisma/schema.prisma`
- **HR Controllers** — `apps/hr/src/controllers/`
- **HR Application** — `apps/hr/src/application/`
- **HR Domain** — `apps/hr/src/domain/`
- **HR Repository** — `apps/hr/src/repository/`
