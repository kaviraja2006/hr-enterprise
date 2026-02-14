# HR Enterprise Frontend Documentation

## 🧠 FRONTEND ARCHITECTURAL STYLE

**Pattern:** Modular Monolith (Feature-Based Frontend)

Organize by business domains, not by components first.

Each domain has:
- Pages
- Components
- API layer
- Types
- Hooks

---

## 🏗 FRONTEND ROOT STRUCTURE

```
frontend/
│
├── public/
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│
│   ├── app/
│   │   ├── router.tsx
│   │   ├── store.ts
│   │   ├── providers.tsx
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── routes.ts
│   │   ├── navigation.ts
│   │
│   ├── core/
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── api-client.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth-context.tsx
│   │   │   ├── auth-service.ts
│   │   │   ├── protected-route.tsx
│   │   │
│   │   ├── rbac/
│   │   │   ├── permission-hook.ts
│   │   │   ├── role-utils.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │
│   │   ├── types/
│   │   │   ├── user.types.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── AreaChart.tsx
│   │   │   │
│   │   │   ├── tables/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TablePagination.tsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormDatePicker.tsx
│   │   │   │
│   │   ├── hooks/
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── constants.ts
│   │   │
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   │
│   ├── modules/
│   │   ├── executive/
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   ├── performance/
│   │   ├── recruitment/
│   │   ├── compliance/
│   │   ├── analytics/
│   │   ├── workflow/
│   │   ├── settings/
│
└── tsconfig.json
```

---

## 🧩 DOMAIN MODULE STRUCTURE

Each domain follows:

```
modules/{module-name}/
│
├── pages/
│   ├── {Module}Dashboard.tsx
│   ├── {Module}List.tsx
│   ├── {Module}Details.tsx
│
├── components/
│   ├── {Module}Table.tsx
│   ├── {Module}Form.tsx
│   ├── {Module}Filters.tsx
│
├── hooks/
│   ├── use{Module}.ts
│
├── services/
│   ├── {module}.api.ts
│
├── types.ts
│
└── routes.ts
```

This makes every module isolated and scalable.

---

## 🔐 AUTH + RBAC FRONTEND ARCHITECTURE

### 🔹 Auth Flow

1. Login → store access token (memory)
2. Refresh token → httpOnly cookie
3. Store user profile + permissions in AuthContext

### 🔹 AuthContext

Holds:

```typescript
{
  user,
  roleName,
  permissions,
  login(),
  logout()
}
```

### 🔹 Permission Hook

```typescript
usePermission('employee:write')
```

Returns true/false.

Use to:
- Hide buttons
- Hide routes
- Disable UI controls

### 🔹 ProtectedRoute

```tsx
<ProtectedRoute requiredPermissions={['payroll:manage']} />
```

---

## 🧱 DASHBOARD ARCHITECTURE

Each dashboard page follows same layout pattern:

```
Filter Bar
↓
KPI Cards Grid
↓
Charts Section
↓
Data Tables
↓
Quick Actions Panel
```

Reusable components:
- `<KpiCard />`
- `<ChartCard />`
- `<MetricGrid />`
- `<FilterBar />`
- `<DataTable />`

---

## 📦 MODULE SPECIFICATIONS

### 🏠 1️⃣ EXECUTIVE MODULE

```
modules/executive/
│
├── pages/
│   ├── ExecutiveDashboard.tsx
│
├── components/
│   ├── ExecutiveKpis.tsx
│   ├── ExecutiveCharts.tsx
│
├── hooks/
│   ├── useExecutive.ts
│
├── services/
│   ├── executive.api.ts
│
├── types.ts
│
└── routes.ts
```

**API Endpoint:** `GET /analytics/executive-summary`

**Renders:**
- Total employees
- Attrition rate
- Payroll cost
- Compliance status
- Productivity score

**Charts:**
- Department breakdown (Pie)
- Attrition trend (Line)
- Payroll trend (Bar)

---

### 👥 2️⃣ EMPLOYEES MODULE

```
modules/employees/
│
├── pages/
│   ├── EmployeesList.tsx
│   ├── EmployeeDetails.tsx
│
├── components/
│   ├── EmployeeTable.tsx
│   ├── EmployeeForm.tsx
│   ├── EmployeeFilters.tsx
│
├── hooks/
│   ├── useEmployees.ts
│
├── services/
│   ├── employees.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 🏢 3️⃣ DEPARTMENTS MODULE

```
modules/departments/
│
├── pages/
│   ├── DepartmentsList.tsx
│
├── components/
│   ├── DepartmentForm.tsx
│   ├── DepartmentCard.tsx
│
├── hooks/
│   ├── useDepartments.ts
│
├── services/
│   ├── departments.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 🕒 4️⃣ ATTENDANCE MODULE

```
modules/attendance/
│
├── pages/
│   ├── AttendanceDashboard.tsx
│   ├── AttendanceList.tsx
│
├── components/
│   ├── AttendanceSummaryCard.tsx
│   ├── AttendanceTable.tsx
│   ├── AttendanceHeatmap.tsx
│   ├── LateLoginCard.tsx
│   ├── OvertimeChart.tsx
│
├── hooks/
│   ├── useAttendance.ts
│
├── services/
│   ├── attendance.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 🏖 5️⃣ LEAVE MODULE

```
modules/leave/
│
├── pages/
│   ├── LeaveDashboard.tsx
│   ├── LeaveRequests.tsx
│
├── components/
│   ├── LeaveBalanceCard.tsx
│   ├── LeaveRequestTable.tsx
│   ├── LeaveTrendChart.tsx
│   ├── ApprovalList.tsx
│
├── hooks/
│   ├── useLeave.ts
│
├── services/
│   ├── leave.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 💰 6️⃣ PAYROLL MODULE

```
modules/payroll/
│
├── pages/
│   ├── PayrollDashboard.tsx
│   ├── PayrollRuns.tsx
│   ├── PayrollRunDetails.tsx
│
├── components/
│   ├── PayrollTrendChart.tsx
│   ├── PayrollEntriesTable.tsx
│   ├── GrossNetBreakdown.tsx
│   ├── ApprovePayrollModal.tsx
│
├── hooks/
│   ├── usePayroll.ts
│
├── services/
│   ├── payroll.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 📈 7️⃣ PERFORMANCE MODULE

```
modules/performance/
│
├── pages/
│   ├── PerformanceDashboard.tsx
│   ├── GoalsPage.tsx
│   ├── ReviewsPage.tsx
│
├── components/
│   ├── GoalProgressBar.tsx
│   ├── RatingChart.tsx
│   ├── PerformanceTable.tsx
│   ├── RatingDistributionChart.tsx
│
├── hooks/
│   ├── usePerformance.ts
│
├── services/
│   ├── performance.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 👥 8️⃣ RECRUITMENT MODULE

```
modules/recruitment/
│
├── pages/
│   ├── RecruitmentDashboard.tsx
│   ├── JobsPage.tsx
│   ├── CandidatesPage.tsx
│
├── components/
│   ├── HiringFunnelChart.tsx
│   ├── CandidateDrawer.tsx
│   ├── StageProgressBar.tsx
│   ├── JobTable.tsx
│
├── hooks/
│   ├── useRecruitment.ts
│
├── services/
│   ├── recruitment.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### ⚖ 9️⃣ COMPLIANCE MODULE

```
modules/compliance/
│
├── pages/
│   ├── ComplianceDashboard.tsx
│   ├── FilingsPage.tsx
│
├── components/
│   ├── FilingStatusCard.tsx
│   ├── ComplianceTimeline.tsx
│   ├── ExpiryAlertBanner.tsx
│
├── hooks/
│   ├── useCompliance.ts
│
├── services/
│   ├── compliance.api.ts
│
├── types.ts
│
└── routes.ts
```

---

### 📊 🔟 ANALYTICS MODULE

```
modules/analytics/
│
├── pages/
│   ├── AttritionAnalytics.tsx
│   ├── DepartmentAnalytics.tsx
│
├── components/
│   ├── AnalyticsCharts.tsx
│
├── hooks/
│   ├── useAnalytics.ts
│
├── services/
│   ├── analytics.api.ts
│
├── types.ts
│
└── routes.ts
```

Advanced metrics only. Charts-heavy pages.

---

### 🔄 1️⃣1️⃣ WORKFLOW MODULE

```
modules/workflow/
│
├── pages/
│   ├── ApprovalsPage.tsx
│
├── components/
│   ├── PendingApprovalsList.tsx
│   ├── ApprovalHistoryModal.tsx
│
├── hooks/
│   ├── useWorkflow.ts
│
├── services/
│   ├── workflow.api.ts
│
├── types.ts
│
└── routes.ts
```

**API Endpoint:** `GET /workflow/approvals/pending`

Accessible from notification bell in header.

---

### ⚙ 1️⃣2️⃣ SETTINGS MODULE

```
modules/settings/
│
├── pages/
│   ├── RolesPage.tsx
│   ├── PermissionsPage.tsx
│   ├── SystemSettings.tsx
│
├── components/
│   ├── RoleForm.tsx
│
├── hooks/
│   ├── useSettings.ts
│
├── services/
│   ├── settings.api.ts
│
├── types.ts
│
└── routes.ts
```

---

## 🧠 STATE MANAGEMENT STRATEGY

Do NOT overcomplicate.

Use:
- ✔ React Query → Server state
- ✔ Context → Auth
- ✔ Local state → UI

Avoid Redux unless necessary.

---

## 📦 API LAYER DESIGN

```
core/api/api-client.ts

axios instance
- attach JWT
- intercept 401
- auto refresh token
```

Each module defines its own API file:
- `attendance.api.ts`
- `payroll.api.ts`

Keeps boundaries clean.

---

## 🧭 ROUTING STRUCTURE

```
/
  /dashboard (executive)
  /employees
  /departments
  /attendance
  /leave
  /payroll
  /performance
  /recruitment
  /compliance
  /analytics
  /settings
```

Lazy-load routes per module.

---

## 🎨 UI DESIGN PRINCIPLES

- Dark + light mode ready
- Card-based layout
- Consistent spacing scale
- Data density optimized
- Action buttons always top-right

---

## 📈 SCALABILITY PRINCIPLES

- ✔ Lazy-loaded modules
- ✔ Feature-based structure
- ✔ No shared business logic between modules
- ✔ Shared UI components only

---

## 🛠 FUTURE-READY EXTENSIONS

- Micro-frontend ready (if needed)
- Mobile app reuse via shared types
- Real-time dashboard via WebSockets
- Notification service integration

---

## 🧠 FINAL FRONTEND MENTAL MODEL

This is NOT just forms.

This is:
- Dashboard-driven
- Metric-first
- Role-aware
- Workflow-connected
- Enterprise UI

---

## 📁 COMPLETE FILE TREE

```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   ├── router.tsx
│   │   ├── store.ts
│   │   ├── providers.tsx
│   ├── config/
│   │   ├── env.ts
│   │   ├── routes.ts
│   │   ├── navigation.ts
│   ├── core/
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── api-client.ts
│   │   ├── auth/
│   │   │   ├── auth-context.tsx
│   │   │   ├── auth-service.ts
│   │   │   ├── protected-route.tsx
│   │   ├── rbac/
│   │   │   ├── permission-hook.ts
│   │   │   ├── role-utils.ts
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   ├── types/
│   │   │   ├── user.types.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── AreaChart.tsx
│   │   │   ├── tables/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TablePagination.tsx
│   │   │   ├── forms/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormDatePicker.tsx
│   │   ├── hooks/
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── constants.ts
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   ├── modules/
│   │   ├── executive/
│   │   │   ├── pages/
│   │   │   │   ├── ExecutiveDashboard.tsx
│   │   │   ├── components/
│   │   │   │   ├── ExecutiveKpis.tsx
│   │   │   │   ├── ExecutiveCharts.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useExecutive.ts
│   │   │   ├── services/
│   │   │   │   ├── executive.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── employees/
│   │   │   ├── pages/
│   │   │   │   ├── EmployeesList.tsx
│   │   │   │   ├── EmployeeDetails.tsx
│   │   │   ├── components/
│   │   │   │   ├── EmployeeTable.tsx
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useEmployees.ts
│   │   │   ├── services/
│   │   │   │   ├── employees.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── departments/
│   │   │   ├── pages/
│   │   │   │   ├── DepartmentsList.tsx
│   │   │   ├── components/
│   │   │   │   ├── DepartmentForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDepartments.ts
│   │   │   ├── services/
│   │   │   │   ├── departments.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── attendance/
│   │   │   ├── pages/
│   │   │   │   ├── AttendanceDashboard.tsx
│   │   │   │   ├── AttendanceList.tsx
│   │   │   ├── components/
│   │   │   │   ├── AttendanceSummaryCard.tsx
│   │   │   │   ├── AttendanceTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAttendance.ts
│   │   │   ├── services/
│   │   │   │   ├── attendance.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── leave/
│   │   │   ├── pages/
│   │   │   │   ├── LeaveDashboard.tsx
│   │   │   │   ├── LeaveRequests.tsx
│   │   │   ├── components/
│   │   │   │   ├── LeaveBalanceCard.tsx
│   │   │   │   ├── LeaveRequestTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLeave.ts
│   │   │   ├── services/
│   │   │   │   ├── leave.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── payroll/
│   │   │   ├── pages/
│   │   │   │   ├── PayrollDashboard.tsx
│   │   │   │   ├── PayrollRuns.tsx
│   │   │   │   ├── PayrollRunDetails.tsx
│   │   │   ├── components/
│   │   │   │   ├── PayrollTrendChart.tsx
│   │   │   │   ├── PayrollEntriesTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePayroll.ts
│   │   │   ├── services/
│   │   │   │   ├── payroll.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── performance/
│   │   │   ├── pages/
│   │   │   │   ├── PerformanceDashboard.tsx
│   │   │   │   ├── GoalsPage.tsx
│   │   │   │   ├── ReviewsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── GoalProgressBar.tsx
│   │   │   │   ├── RatingChart.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePerformance.ts
│   │   │   ├── services/
│   │   │   │   ├── performance.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── recruitment/
│   │   │   ├── pages/
│   │   │   │   ├── RecruitmentDashboard.tsx
│   │   │   │   ├── JobsPage.tsx
│   │   │   │   ├── CandidatesPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── HiringFunnelChart.tsx
│   │   │   │   ├── CandidateDrawer.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useRecruitment.ts
│   │   │   ├── services/
│   │   │   │   ├── recruitment.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── compliance/
│   │   │   ├── pages/
│   │   │   │   ├── ComplianceDashboard.tsx
│   │   │   │   ├── FilingsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── FilingStatusCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCompliance.ts
│   │   │   ├── services/
│   │   │   │   ├── compliance.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── analytics/
│   │   │   ├── pages/
│   │   │   │   ├── AttritionAnalytics.tsx
│   │   │   │   ├── DepartmentAnalytics.tsx
│   │   │   ├── components/
│   │   │   │   ├── AnalyticsCharts.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAnalytics.ts
│   │   │   ├── services/
│   │   │   │   ├── analytics.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── workflow/
│   │   │   ├── pages/
│   │   │   │   ├── ApprovalsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── PendingApprovalsList.tsx
│   │   │   │   ├── ApprovalHistoryModal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWorkflow.ts
│   │   │   ├── services/
│   │   │   │   ├── workflow.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
│   │   ├── settings/
│   │   │   ├── pages/
│   │   │   │   ├── RolesPage.tsx
│   │   │   │   ├── PermissionsPage.tsx
│   │   │   │   ├── SystemSettings.tsx
│   │   │   ├── components/
│   │   │   │   ├── RoleForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSettings.ts
│   │   │   ├── services/
│   │   │   │   ├── settings.api.ts
│   │   │   ├── types.ts
│   │   │   ├── routes.ts
└── tsconfig.json
```
