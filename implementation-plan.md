# HR Enterprise - New Modules Implementation Plan

## Document Overview
This document provides a detailed implementation plan for adding:
1. **Employee Engagement & Culture Module**
2. **Advanced HR Analytics Module**

**Status**: Planning Phase  
**Last Updated**: 2026-02-14  
**Target Completion**: TBD

---

## Executive Summary

### What We're Adding

Two completely new modules that don't currently exist in the system:

**Module 1: Employee Engagement & Culture**
- Purpose: Track employee satisfaction, culture health, retention metrics
- Current Status: ❌ **Does not exist** - needs full implementation

**Module 2: Advanced HR Analytics**
- Purpose: Predictive analytics, forecasting, AI-driven insights
- Current Status: ❌ **Does not exist** - needs full implementation

### Implementation Scope

**Backend Changes Required:**
- ✅ 9 new database tables (Prisma schema)
- ✅ 2 new NestJS modules (engagement, insights)
- ✅ ~25 new API endpoints
- ✅ Background job for engagement scoring
- ✅ Analytics service enhancements

**Frontend Changes Required:**
- ✅ 2 new module folders with structure
- ✅ ~15 new dashboard pages
- ✅ ~25 new chart/visualization components
- ✅ New hooks for data fetching
- ✅ Navigation menu updates

---

## MODULE 1: Employee Engagement & Culture

### 1.1 Purpose & Objectives

**Business Goals:**
- Measure and improve employee satisfaction
- Track culture health indicators
- Identify retention risks early
- Monitor internal mobility (promotions/transfers)
- Track grievances and resolutions

**Key Stakeholders:**
- HR Directors (overall metrics)
- Managers (team-specific insights)
- Executives (strategic trends)

### 1.2 Dashboard Requirements

Based on requirements document, this module needs **6 dashboards**:

#### Dashboard 1: Employee Satisfaction Dashboard
**Purpose**: Overall satisfaction tracking

**Metrics to Display:**
- Overall Satisfaction Score (0-100)
- Satisfaction Trend (Last 12 Months)
- Score by Department (Bar Chart)
- Score by Tenure (Line Chart)
- Satisfaction Drivers (Top 5 factors)
- Response Rate (% of employees surveyed)

**Visualizations:**
- Gauge chart for overall score
- Line chart for trends
- Horizontal bar chart for departments
- Radar chart for satisfaction drivers

#### Dashboard 2: Survey Management Dashboard
**Purpose**: Create and manage employee surveys

**Features:**
- Active Surveys List
- Survey Templates Library
- Response Analytics per Survey
- Question Performance Metrics
- Participation Rates

**Visualizations:**
- Survey completion funnel
- Question-wise response distribution
- Timeline of survey participation

#### Dashboard 3: Culture Health Dashboard
**Purpose**: Monitor organizational culture metrics

**Metrics:**
- Culture Score (composite metric)
- Value Alignment Score
- Communication Effectiveness
- Recognition Frequency
- Collaboration Index
- Innovation Score

**Visualizations:**
- Spider/radar chart for culture dimensions
- Trend lines for each metric
- Heatmap of culture scores by department

#### Dashboard 4: Retention & Turnover Dashboard
**Purpose**: Track retention metrics and predict turnover

**Metrics:**
- Retention Rate (%) - Overall
- Retention by Department
- Retention by Tenure
- Voluntary vs Involuntary Turnover
- Exit Interview Insights (Top reasons)
- High Performer Retention Rate

**Visualizations:**
- Retention trend line
- Turnover pie chart
- Cohort retention analysis
- Word cloud for exit reasons

#### Dashboard 5: Internal Mobility Dashboard
**Purpose**: Track promotions and internal transfers

**Metrics:**
- Promotion Rate (%)
- Promotions by Department
- Internal Transfer Rate
- Average Time to Promotion
- Promotion Demographics
- Internal Job Applications

**Visualizations:**
- Promotion trend bar chart
- Sankey diagram (transfers flow)
- Timeline of promotions

#### Dashboard 6: Grievance Management Dashboard
**Purpose**: Track and resolve employee grievances

**Metrics:**
- Open Grievances
- Resolution Rate (%)
- Average Resolution Time
- Grievances by Category
- Grievances by Department
- Escalation Rate

**Visualizations:**
- Grievance status pie chart
- Resolution time trend
- Category breakdown bar chart

### 1.3 Database Schema (Prisma)

Add these models to `backend/prisma/schema.prisma`:

```prisma
// ============================================
// EMPLOYEE ENGAGEMENT MODELS
// ============================================

model Survey {
  id            String   @id @default(uuid())
  title         String
  description   String?
  type          String   // satisfaction, culture, engagement, exit
  status        String   @default("draft") // draft, active, closed
  frequency     String?  // once, monthly, quarterly, annual
  startDate     DateTime? @map("start_date")
  endDate       DateTime? @map("end_date")
  isAnonymous   Boolean  @default(true) @map("is_anonymous")
  createdBy     String   @map("created_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  questions     SurveyQuestion[]
  responses     SurveyResponse[]
  creator       User     @relation(fields: [createdBy], references: [id])

  @@index([status])
  @@index([type])
  @@map("surveys")
}

model SurveyQuestion {
  id            String   @id @default(uuid())
  surveyId      String   @map("survey_id")
  question      String
  type          String   // rating, text, multiple_choice, boolean
  category      String?  // work_environment, management, growth, compensation
  order         Int      @default(0)
  isRequired    Boolean  @default(true) @map("is_required")
  options       Json?    // For multiple choice: ["option1", "option2"]
  weight        Int      @default(1) // For scoring
  createdAt     DateTime @default(now()) @map("created_at")

  survey        Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  answers       SurveyAnswer[]

  @@index([surveyId])
  @@map("survey_questions")
}

model SurveyResponse {
  id            String   @id @default(uuid())
  surveyId      String   @map("survey_id")
  employeeId    String?  @map("employee_id") // Nullable for anonymous
  submittedAt   DateTime @default(now()) @map("submitted_at")
  ipAddress     String?  @map("ip_address")
  completed     Boolean  @default(false)

  survey        Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  employee      Employee? @relation(fields: [employeeId], references: [id])
  answers       SurveyAnswer[]

  @@index([surveyId])
  @@index([employeeId])
  @@map("survey_responses")
}

model SurveyAnswer {
  id            String   @id @default(uuid())
  responseId    String   @map("response_id")
  questionId    String   @map("question_id")
  answer        String   // Stores rating value or text
  ratingValue   Int?     @map("rating_value") // Normalized 1-5 for ratings

  response      SurveyResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  question      SurveyQuestion @relation(fields: [questionId], references: [id])

  @@unique([responseId, questionId])
  @@map("survey_answers")
}

model EngagementMetric {
  id                  String   @id @default(uuid())
  employeeId          String   @map("employee_id")
  metricDate          DateTime @map("metric_date") @db.Date
  satisfactionScore   Decimal? @map("satisfaction_score") @db.Decimal(4, 2) // 0-100
  engagementScore     Decimal? @map("engagement_score") @db.Decimal(4, 2) // 0-100
  cultureScore        Decimal? @map("culture_score") @db.Decimal(4, 2) // 0-100
  recognitionCount    Int      @default(0) @map("recognition_count")
  collaborationScore  Decimal? @map("collaboration_score") @db.Decimal(4, 2)
  burnoutRisk         String?  @map("burnout_risk") // low, medium, high
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  employee    Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@unique([employeeId, metricDate])
  @@index([employeeId])
  @@index([metricDate])
  @@map("engagement_metrics")
}

model Grievance {
  id              String   @id @default(uuid())
  employeeId      String   @map("employee_id")
  category        String   // harassment, discrimination, workload, compensation, other
  severity        String   // low, medium, high, critical
  description     String   @db.Text
  status          String   @default("open") // open, investigating, resolved, closed
  assignedTo      String?  @map("assigned_to")
  resolution      String?  @db.Text
  resolvedAt      DateTime? @map("resolved_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  employee        Employee @relation(fields: [employeeId], references: [id])
  assignee        Employee? @relation("GrievanceAssignee", fields: [assignedTo], references: [id])
  notes           GrievanceNote[]

  @@index([employeeId])
  @@index([status])
  @@index([category])
  @@map("grievances")
}

model GrievanceNote {
  id            String   @id @default(uuid())
  grievanceId   String   @map("grievance_id")
  note          String   @db.Text
  createdBy     String   @map("created_by")
  createdAt     DateTime @default(now()) @map("created_at")

  grievance     Grievance @relation(fields: [grievanceId], references: [id], onDelete: Cascade)

  @@index([grievanceId])
  @@map("grievance_notes")
}

model InternalTransfer {
  id              String   @id @default(uuid())
  employeeId      String   @map("employee_id")
  fromDepartmentId String  @map("from_department_id")
  toDepartmentId  String   @map("to_department_id")
  fromDesignation String?  @map("from_designation")
  toDesignation   String?  @map("to_designation")
  transferType    String   @map("transfer_type") // promotion, lateral, demotion
  transferDate    DateTime @map("transfer_date")
  reason          String?
  approvedBy      String?  @map("approved_by")
  createdAt       DateTime @default(now()) @map("created_at")

  employee        Employee @relation(fields: [employeeId], references: [id])
  fromDepartment  Department @relation("TransferFrom", fields: [fromDepartmentId], references: [id])
  toDepartment    Department @relation("TransferTo", fields: [toDepartmentId], references: [id])

  @@index([employeeId])
  @@index([transferDate])
  @@map("internal_transfers")
}

model Recognition {
  id              String   @id @default(uuid())
  recipientId     String   @map("recipient_id")
  giverId         String   @map("giver_id")
  type            String   // peer_to_peer, manager_to_employee, team_award
  category        String   // excellence, teamwork, innovation, leadership
  message         String   @db.Text
  points          Int      @default(0)
  isPublic        Boolean  @default(true) @map("is_public")
  createdAt       DateTime @default(now()) @map("created_at")

  recipient       Employee @relation("RecognitionRecipient", fields: [recipientId], references: [id])
  giver           Employee @relation("RecognitionGiver", fields: [giverId], references: [id])

  @@index([recipientId])
  @@index([giverId])
  @@map("recognitions")
}
```

**Relationships to add to existing models:**

```prisma
// Add to Employee model:
surveyResponses     SurveyResponse[]
engagementMetrics   EngagementMetric[]
grievances          Grievance[]
transfersFrom       InternalTransfer[] @relation("TransferFrom")
transfersTo         InternalTransfer[] @relation("TransferTo")
recognitionsReceived Recognition[] @relation("RecognitionRecipient")
recognitionsGiven   Recognition[] @relation("RecognitionGiver")
```

### 1.4 Backend Module Structure

Create folder: `backend/src/engagement/`

```
engagement/
├── engagement.module.ts
├── engagement.controller.ts
├── engagement.service.ts
├── dto/
│   ├── create-survey.dto.ts
│   ├── update-survey.dto.ts
│   ├── create-grievance.dto.ts
│   ├── update-grievance.dto.ts
│   ├── submit-survey-response.dto.ts
│   ├── create-recognition.dto.ts
│   └── engagement-query.dto.ts
└── entities/
    └── [if needed, but Prisma models are preferred]
```

**Controller Endpoints:**

```typescript
// Survey Management
POST   /engagement/surveys                    // Create survey
GET    /engagement/surveys                    // List surveys
GET    /engagement/surveys/:id                // Get survey details
PATCH  /engagement/surveys/:id                // Update survey
DELETE /engagement/surveys/:id                // Delete survey
POST   /engagement/surveys/:id/activate       // Activate survey
POST   /engagement/surveys/:id/close          // Close survey

// Survey Responses
POST   /engagement/surveys/:id/responses      // Submit response
GET    /engagement/surveys/:id/responses      // Get responses
GET    /engagement/surveys/:id/analytics      // Survey analytics

// Engagement Metrics
GET    /engagement/metrics                    // Get engagement metrics
GET    /engagement/metrics/summary            // Summary for dashboard
GET    /engagement/metrics/employee/:id       // Employee-specific metrics
POST   /engagement/metrics/calculate          // Trigger calculation

// Grievances
POST   /engagement/grievances                 // Create grievance
GET    /engagement/grievances                 // List grievances
GET    /engagement/grievances/:id             // Get grievance details
PATCH  /engagement/grievances/:id             // Update grievance
POST   /engagement/grievances/:id/resolve     // Resolve grievance
POST   /engagement/grievances/:id/notes       // Add note

// Internal Transfers
POST   /engagement/transfers                  // Create transfer
GET    /engagement/transfers                  // List transfers
GET    /engagement/transfers/:id              // Get transfer details

// Recognition
POST   /engagement/recognitions               // Give recognition
GET    /engagement/recognitions               // List recognitions
GET    /engagement/recognitions/leaderboard   // Recognition leaderboard

// Dashboard Data
GET    /engagement/dashboard/satisfaction     // Satisfaction dashboard data
GET    /engagement/dashboard/culture          // Culture health data
GET    /engagement/dashboard/retention        // Retention metrics
GET    /engagement/dashboard/mobility         // Internal mobility data
```

### 1.5 Frontend Module Structure

Create folder: `frontend/src/modules/engagement/`

```
modules/engagement/
├── index.ts                              # Public API exports
├── types.ts                              # TypeScript interfaces
├── services/
│   └── engagement.api.ts                 # API calls
├── hooks/
│   ├── useSurveys.ts                     # Survey management hooks
│   ├── useSurveyResponses.ts             # Response hooks
│   ├── useGrievances.ts                  # Grievance hooks
│   ├── useEngagementMetrics.ts           # Metrics hooks
│   ├── useInternalTransfers.ts           # Transfer hooks
│   └── useRecognitions.ts                # Recognition hooks
├── components/
│   ├── SurveyCard.tsx                    # Survey list item
│   ├── SurveyForm.tsx                    # Create/edit survey
│   ├── SurveyResponseForm.tsx            # Submit response
│   ├── SurveyAnalytics.tsx               # Response analytics
│   ├── GrievanceList.tsx                 # Grievance table
│   ├── GrievanceForm.tsx                 # Create grievance
│   ├── GrievanceDetail.tsx               # View grievance
│   ├── RecognitionCard.tsx               # Recognition display
│   ├── RecognitionForm.tsx               # Give recognition
│   ├── SatisfactionGauge.tsx             # Gauge chart
│   ├── CultureRadar.tsx                  # Radar chart
│   ├── RetentionTrend.tsx                # Line chart
│   ├── MobilitySankey.tsx                # Flow diagram
│   └── EngagementKpiCards.tsx            # KPI cards
└── pages/
    ├── EngagementDashboard.tsx           # Main overview
    ├── SatisfactionDashboard.tsx         # Satisfaction metrics
    ├── SurveyManagementPage.tsx          // Manage surveys
    ├── SurveyResponsePage.tsx            // Respond to survey
    ├── CultureHealthDashboard.tsx        // Culture metrics
    ├── RetentionDashboard.tsx            // Retention analytics
    ├── MobilityDashboard.tsx             // Internal transfers
    └── GrievancesPage.tsx                // Grievance management
```

### 1.6 Required Frontend Components

**New Shared Components Needed:**

1. **Charts** (to add to `shared/components/charts/`):
   - `GaugeChart.tsx` - For satisfaction scores
   - `RadarChart.tsx` - For culture dimensions
   - `SankeyDiagram.tsx` - For transfer flows
   - `WordCloud.tsx` - For exit reasons
   - `FunnelChart.tsx` - For survey completion
   - `HeatmapChart.tsx` - For department comparisons

2. **Form Components** (if not already in `shared/components/forms/`):
   - `SurveyBuilder.tsx` - Drag-drop survey creator
   - `RatingInput.tsx` - Star rating component
   - `RichTextEditor.tsx` - For descriptions

3. **UI Components** (add to `shared/components/ui/`):
   - `Timeline.tsx` - For promotion/transfer history
   - `ProgressRing.tsx` - For circular progress
   - `StatWithTrend.tsx` - KPI card with trend indicator

### 1.7 Navigation Updates

Add to `frontend/src/config/navigation.ts`:

```typescript
{
  title: 'Engagement',
  icon: 'Heart',
  permission: 'engagement:read',
  children: [
    {
      title: 'Dashboard',
      path: '/engagement',
      permission: 'engagement:read',
    },
    {
      title: 'Satisfaction',
      path: '/engagement/satisfaction',
      permission: 'engagement:read',
    },
    {
      title: 'Surveys',
      path: '/engagement/surveys',
      permission: 'surveys:read',
    },
    {
      title: 'Culture Health',
      path: '/engagement/culture',
      permission: 'engagement:read',
    },
    {
      title: 'Retention',
      path: '/engagement/retention',
      permission: 'engagement:read',
    },
    {
      title: 'Mobility',
      path: '/engagement/mobility',
      permission: 'engagement:read',
    },
    {
      title: 'Grievances',
      path: '/engagement/grievances',
      permission: 'grievances:read',
    },
  ],
}
```

### 1.8 Background Jobs

Add to `backend/src/scheduler/scheduler.service.ts`:

```typescript
// Daily engagement metrics calculation
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async calculateEngagementMetrics() {
  // Calculate satisfaction scores
  // Update engagement metrics
  // Flag high-risk employees
}

// Weekly survey reminders
@Cron('0 9 * * 1') // Mondays at 9 AM
async sendSurveyReminders() {
  // Send reminders for incomplete surveys
}

// Monthly engagement report
@Cron('0 9 1 * *') // 1st of month at 9 AM
async generateEngagementReport() {
  // Generate and email engagement report
}
```

---

## MODULE 2: Advanced HR Analytics

### 2.1 Purpose & Objectives

**Business Goals:**
- Predict employee turnover before it happens
- Identify burnout risk indicators
- Optimize salary vs performance alignment
- Forecast hiring needs
- Measure workforce efficiency

**Key Stakeholders:**
- CHRO/HR Directors (strategic insights)
- CFO (financial impact)
- CEOs (workforce planning)
- Managers (team optimization)

### 2.2 Dashboard Requirements

This module needs **1 comprehensive dashboard** with multiple sections:

#### Dashboard: Advanced HR Analytics Dashboard

**Section 1: Retention Risk Analysis**
- High Performer Retention Risk Score
- At-Risk Employees List (with risk %)
- Risk Factors Breakdown
- Retention Probability Trend
- Recommended Actions per Employee

**Section 2: Burnout Detection**
- Burnout Risk Indicators (workload, overtime, absenteeism)
- Employees with High Burnout Risk
- Burnout Trend by Department
- Work-Life Balance Score

**Section 3: Compensation Analysis**
- Performance vs Salary Ratio
- Salary Benchmarking (internal comparison)
- Pay Equity Analysis
- High Performers Below Market Rate

**Section 4: Workforce Planning**
- Hiring Forecast (Next 6 months)
- Revenue per Headcount
- Department Efficiency Index
- Optimal Team Size Analysis

**Section 5: Predictive Insights**
- Next Quarter Attrition Prediction
- High-Potential Employee Identification
- Succession Planning Gaps
- Skills Gap Analysis

### 2.3 Database Schema (Prisma)

Add these models to `backend/prisma/schema.prisma`:

```prisma
// ============================================
// ADVANCED ANALYTICS MODELS
// ============================================

model PredictiveMetric {
  id                    String   @id @default(uuid())
  employeeId            String   @map("employee_id")
  calculatedAt          DateTime @default(now()) @map("calculated_at")
  
  // Retention Risk (0-100)
  retentionRiskScore    Int      @map("retention_risk_score")
  riskLevel             String   @map("risk_level") // low, medium, high, critical
  riskFactors           Json?    @map("risk_factors") // ["compensation", "workload", "manager"]
  
  // Burnout Indicators
  burnoutRiskScore      Int      @map("burnout_risk_score")
  workloadIndex         Decimal? @map("workload_index") @db.Decimal(5, 2)
  overtimeFrequency     Int      @default(0) @map("overtime_frequency") // days/month
  workLifeBalanceScore  Decimal? @map("work_life_balance_score") @db.Decimal(4, 2)
  
  // Performance vs Compensation
  performanceScore      Decimal? @map("performance_score") @db.Decimal(4, 2)
  compensationRatio     Decimal? @map("compensation_ratio") @db.Decimal(5, 2) // vs market
  salaryPercentile      Int?     @map("salary_percentile") // internal ranking
  
  // Efficiency Metrics
  productivityIndex     Decimal? @map("productivity_index") @db.Decimal(5, 2)
  revenueContribution   Decimal? @map("revenue_contribution") @db.Decimal(12, 2)
  
  // Predictions
  predictedAttrition    Boolean? @map("predicted_attrition")
  predictedDeparture    DateTime? @map("predicted_departure")
  confidenceScore       Decimal? @map("confidence_score") @db.Decimal(4, 2)
  
  employee              Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([calculatedAt])
  @@index([retentionRiskScore])
  @@index([riskLevel])
  @@map("predictive_metrics")
}

model WorkforceForecast {
  id              String   @id @default(uuid())
  forecastDate    DateTime @map("forecast_date")
  forecastType    String   @map("forecast_type") // hiring, attrition, skills
  departmentId    String?  @map("department_id")
  
  // Forecast Data
  currentHeadcount Int     @map("current_headcount")
  predictedChange  Int     @map("predicted_change")
  predictedHeadcount Int   @map("predicted_headcount")
  confidenceLevel  String  @map("confidence_level") // high, medium, low
  
  // Drivers
  workloadTrend    Decimal? @map("workload_trend") @db.Decimal(5, 2)
  projectPipeline  Int?     @map("project_pipeline")
  budgetAllocated  Decimal? @map("budget_allocated") @db.Decimal(12, 2)
  
  // Recommendations
  recommendedHires Int?     @map("recommended_hires")
  recommendedSkills Json?  @map("recommended_skills")
  notes            String?  @db.Text
  
  createdAt        DateTime @default(now()) @map("created_at")
  
  department       Department? @relation(fields: [departmentId], references: [id])

  @@index([forecastDate])
  @@index([departmentId])
  @@map("workforce_forecasts")
}

model EfficiencyMetric {
  id                  String   @id @default(uuid())
  departmentId        String   @map("department_id")
  metricDate          DateTime @map("metric_date") @db.Date
  
  // Efficiency Metrics
  efficiencyIndex     Decimal  @map("efficiency_index") @db.Decimal(5, 2) // 0-100
  revenuePerEmployee  Decimal  @map("revenue_per_employee") @db.Decimal(12, 2)
  costPerEmployee     Decimal  @map("cost_per_employee") @db.Decimal(12, 2)
  profitPerEmployee   Decimal  @map("profit_per_employee") @db.Decimal(12, 2)
  
  // Operational Metrics
  outputVolume        Decimal? @map("output_volume") @db.Decimal(10, 2)
  qualityScore        Decimal? @map("quality_score") @db.Decimal(4, 2)
  utilizationRate     Decimal? @map("utilization_rate") @db.Decimal(5, 2)
  
  // Comparisons
  vsLastMonth         Decimal? @map("vs_last_month") @db.Decimal(5, 2)
  vsLastQuarter       Decimal? @map("vs_last_quarter") @db.Decimal(5, 2)
  vsCompanyAverage    Decimal? @map("vs_company_average") @db.Decimal(5, 2)
  
  createdAt           DateTime @default(now()) @map("created_at")
  
  department          Department @relation(fields: [departmentId], references: [id])

  @@unique([departmentId, metricDate])
  @@index([departmentId])
  @@index([metricDate])
  @@map("efficiency_metrics")
}

model SkillsGap {
  id                String   @id @default(uuid())
  departmentId      String?  @map("department_id")
  skillName         String   @map("skill_name")
  requiredLevel     Int      @map("required_level") // 1-5
  currentLevel      Decimal  @map("current_level") @db.Decimal(3, 2) // avg across dept
  
  gapSize           Decimal  @map("gap_size") @db.Decimal(3, 2)
  employeesWithSkill Int     @map("employees_with_skill")
  totalEmployees    Int      @map("total_employees")
  
  priority          String   @map("priority") // critical, high, medium, low
  impact            String?  @map("impact") // description of business impact
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  department        Department? @relation(fields: [departmentId], references: [id])

  @@unique([departmentId, skillName])
  @@index([departmentId])
  @@map("skills_gaps")
}

model AnalyticsReport {
  id              String   @id @default(uuid())
  title           String
  description     String?
  type            String   // retention, performance, compensation, workforce
  format          String   // pdf, excel, dashboard
  
  // Filters applied
  dateRangeStart  DateTime? @map("date_range_start")
  dateRangeEnd    DateTime? @map("date_range_end")
  departmentId    String?   @map("department_id")
  filters         Json?     // additional filters
  
  // Report Data
  data            Json      // The actual report data
  summary         Json?     // Key insights/summary
  
  createdBy       String    @map("created_by")
  createdAt       DateTime  @default(now()) @map("created_at")
  
  creator         User      @relation(fields: [createdBy], references: [id])

  @@index([type])
  @@index([createdAt])
  @@map("analytics_reports")
}
```

**Relationships to add to existing models:**

```prisma
// Add to Employee model:
predictiveMetrics   PredictiveMetric[]

// Add to Department model:
efficiencyMetrics   EfficiencyMetric[]
workforceForecasts  WorkforceForecast[]
skillsGaps          SkillsGap[]

// Add to User model:
analyticsReports    AnalyticsReport[]
```

### 2.4 Backend Module Structure

Create folder: `backend/src/insights/` (or `advanced-analytics/`)

```
insights/
├── insights.module.ts
├── insights.controller.ts
├── insights.service.ts
├── dto/
│   ├── create-forecast.dto.ts
│   ├── analytics-query.dto.ts
│   └── generate-report.dto.ts
└── services/
    ├── predictive-analytics.service.ts    // ML/statistical calculations
    ├── workforce-planning.service.ts      // Forecasting logic
    └── efficiency-calculator.service.ts   // Efficiency metrics
```

**Controller Endpoints:**

```typescript
// Retention Risk
GET    /insights/retention-risk              // List at-risk employees
GET    /insights/retention-risk/:employeeId  // Individual risk profile
GET    /insights/retention-risk/summary      // Risk summary dashboard

// Burnout Analysis
GET    /insights/burnout-indicators          // Burnout metrics
GET    /insights/burnout-risk/employees      // High-risk employees
GET    /insights/work-life-balance           // Balance scores

// Compensation Analysis
GET    /insights/compensation/alignment      // Performance vs salary
GET    /insights/compensation/benchmarks     // Internal benchmarking
GET    /insights/compensation/equity         // Pay equity analysis

// Workforce Planning
GET    /insights/workforce/forecast          // Hiring forecasts
POST   /insights/workforce/forecast          // Create forecast
GET    /insights/workforce/efficiency        // Department efficiency
GET    /insights/workforce/revenue-per-head  // Revenue metrics

// Skills Analysis
GET    /insights/skills/gaps                 // Skills gap analysis
GET    /insights/skills/matrix               // Skills matrix
GET    /insights/skills/recommendations      // Training recommendations

// Predictive Models
POST   /insights/predict/attrition           // Run attrition prediction
POST   /insights/predict/high-performers     // Identify high potentials
GET    /insights/predict/succession          // Succession planning gaps

// Reports
POST   /insights/reports                     // Generate report
GET    /insights/reports                     // List reports
GET    /insights/reports/:id                 // Get report
DELETE /insights/reports/:id                 // Delete report

// Dashboard Data
GET    /insights/dashboard/advanced          // Main dashboard data
GET    /insights/dashboard/retention-risk    // Retention section
GET    /insights/dashboard/burnout           // Burnout section
GET    /insights/dashboard/compensation      // Compensation section
GET    /insights/dashboard/workforce         // Workforce section
```

### 2.5 Frontend Module Structure

Create folder: `frontend/src/modules/insights/`

```
modules/insights/
├── index.ts
├── types.ts
├── services/
│   └── insights.api.ts
├── hooks/
│   ├── useRetentionRisk.ts
│   ├── useBurnoutIndicators.ts
│   ├── useCompensationAnalysis.ts
│   ├── useWorkforceForecast.ts
│   ├── useEfficiencyMetrics.ts
│   └── useSkillsGap.ts
├── components/
│   ├── RetentionRiskTable.tsx
│   ├── RiskScoreBadge.tsx
│   ├── BurnoutHeatmap.tsx
│   ├── CompensationScatter.tsx
│   ├── ForecastChart.tsx
│   ├── EfficiencyGauge.tsx
│   ├── SkillsGapChart.tsx
│   ├── PredictionConfidence.tsx
│   ├── RiskFactorsList.tsx
│   └── ActionRecommendations.tsx
└── pages/
    ├── AdvancedAnalyticsDashboard.tsx  // Main dashboard
    ├── RetentionRiskPage.tsx           // Detailed retention analysis
    ├── BurnoutAnalysisPage.tsx         // Burnout deep dive
    ├── CompensationAnalysisPage.tsx    // Compensation analytics
    ├── WorkforcePlanningPage.tsx       // Forecasting & planning
    └── SkillsGapPage.tsx               // Skills analysis
```

### 2.6 Required Frontend Components

**New Advanced Chart Components:**

1. **Predictive Visualizations:**
   - `RiskMeter.tsx` - Risk level gauge with colors
   - `ProbabilityTimeline.tsx` - Attrition probability over time
   - `ScatterPlot.tsx` - For performance vs compensation
   - `HeatmapGrid.tsx` - Department x Skill heatmap
   - `TrendForecast.tsx` - Historical + predicted line chart
   - `CohortRetention.tsx` - Cohort analysis chart

2. **AI/ML Result Displays:**
   - `ConfidenceBadge.tsx` - Show prediction confidence
   - `FactorImportance.tsx` - Bar chart of contributing factors
   - `RecommendationCard.tsx` - Actionable recommendations
   - `AnomalyDetector.tsx` - Highlight unusual patterns

3. **Interactive Filters:**
   - `DateRangePicker.tsx` - Advanced date selection
   - `MultiSelectFilter.tsx` - Department/skill selection
   - `ThresholdSlider.tsx` - Risk level filter

### 2.7 Navigation Updates

Add to `frontend/src/config/navigation.ts`:

```typescript
{
  title: 'Insights',
  icon: 'Brain',
  permission: 'insights:read',
  children: [
    {
      title: 'Advanced Analytics',
      path: '/insights',
      permission: 'insights:read',
    },
    {
      title: 'Retention Risk',
      path: '/insights/retention',
      permission: 'insights:read',
    },
    {
      title: 'Burnout Analysis',
      path: '/insights/burnout',
      permission: 'insights:read',
    },
    {
      title: 'Compensation',
      path: '/insights/compensation',
      permission: 'insights:read',
    },
    {
      title: 'Workforce Planning',
      path: '/insights/workforce',
      permission: 'insights:read',
    },
    {
      title: 'Skills Gap',
      path: '/insights/skills',
      permission: 'insights:read',
    },
  ],
}
```

### 2.8 Background Jobs

Add to scheduler:

```typescript
// Daily predictive metrics calculation
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async calculatePredictiveMetrics() {
  // Calculate retention risk scores
  // Update burnout indicators
  // Analyze performance vs compensation
  // Flag high-risk employees
}

// Weekly workforce planning update
@Cron('0 4 * * 1') // Mondays at 4 AM
async updateWorkforceForecasts() {
  // Update hiring forecasts
  // Recalculate department efficiency
  // Update skills gap analysis
}

// Monthly analytics report
@Cron('0 6 1 * *') // 1st of month at 6 AM
async generateMonthlyInsights() {
  // Generate comprehensive analytics report
  // Email to HR leadership
}
```

---

## INTEGRATION WITH EXISTING MODULES

### Data Dependencies

**Engagement Module needs data from:**
- ✅ employees (headcount, departments)
- ✅ performance (review scores, goals)
- ✅ attendance (presence, overtime)
- ✅ leave (absences, work-life balance)
- ✅ payroll (compensation data)

**Insights Module needs data from:**
- ✅ employees (tenure, department, salary)
- ✅ performance (ratings, achievements)
- ✅ attendance (overtime, late arrivals)
- ✅ engagement (satisfaction scores, survey responses)
- ✅ payroll (salary, bonuses)
- ✅ recruitment (hiring data for forecasting)

### Shared Services

**Create shared utilities:**

1. **Metrics Calculator Service** (`backend/src/shared/metrics/`):
   - Calculate satisfaction scores
   - Compute retention rates
   - Measure engagement levels

2. **Predictive Engine** (`backend/src/shared/ml/`):
   - Attrition prediction algorithm
   - Burnout detection logic
   - Forecasting models

3. **Analytics Utils** (`backend/src/shared/analytics/`):
   - Trend calculation
   - Statistical analysis
   - Data aggregation helpers

---

## PERMISSIONS & RBAC

### New Permissions to Add

**For Engagement Module:**
```typescript
// Surveys
'surveys:read'      - View surveys
'surveys:create'    - Create surveys
'surveys:update'    - Edit surveys
'surveys:delete'    - Delete surveys
'surveys:admin'     - Full survey management

// Grievances
'grievances:read'   - View grievances
'grievances:create' - Submit grievances
'grievances:manage' - Resolve grievances

// Engagement Data
'engagement:read'   - View engagement metrics
'engagement:export' - Export engagement data
```

**For Insights Module:**
```typescript
'insights:read'        - View analytics
'insights:export'      - Export reports
'insights:predict'     - Run predictions
'insights:configure'   - Configure models
'insights:admin'       - Full analytics access
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Database migrations (Prisma schema)
- [ ] Backend module setup (folders, basic structure)
- [ ] Frontend module setup (folders, routing)
- [ ] Navigation updates
- [ ] Permission seeding

### Phase 2: Engagement Module (Week 3-5)
- [ ] Survey CRUD APIs
- [ ] Survey response submission
- [ ] Grievance management
- [ ] Engagement metrics calculation
- [ ] Basic dashboard pages

### Phase 3: Insights Module (Week 6-8)
- [ ] Predictive metrics calculation
- [ ] Retention risk algorithm
- [ ] Burnout detection
- [ ] Compensation analysis
- [ ] Workforce forecasting

### Phase 4: Visualization (Week 9-10)
- [ ] Chart components library
- [ ] Dashboard layouts
- [ ] Interactive filters
- [ ] Export functionality

### Phase 5: Integration (Week 11-12)
- [ ] Background jobs
- [ ] Email notifications
- [ ] Report generation
- [ ] Performance optimization
- [ ] Testing

---

## RISK CONSIDERATIONS

### Technical Risks
1. **Performance**: Predictive calculations may be slow
   - Mitigation: Use background jobs, caching

2. **Data Privacy**: Survey responses must be secure
   - Mitigation: Encryption, access controls

3. **Accuracy**: Predictions may be wrong
   - Mitigation: Show confidence scores, don't auto-act

### Business Risks
1. **Employee Trust**: May feel "surveilled"
   - Mitigation: Transparent communication, focus on positive use

2. **Manager Resistance**: New metrics to manage
   - Mitigation: Training, show value

---

## SUMMARY

### What You're Getting

**Employee Engagement & Culture:**
- 9 new database tables
- 25+ API endpoints
- 7 dashboard pages
- Survey management system
- Grievance tracking
- Recognition system

**Advanced HR Analytics:**
- 5 new database tables
- 20+ API endpoints
- 6 dashboard pages
- Predictive attrition modeling
- Burnout detection
- Workforce forecasting
- Skills gap analysis

### Total Effort Estimate

**Backend:**
- ~3,000 lines of code
- 2 new modules
- 14 new tables
- 45+ API endpoints
- 3 background jobs

**Frontend:**
- ~5,000 lines of code
- 2 new modules
- 13 new pages
- 35+ components
- 12 new hooks

**Timeline:** 12 weeks with 2 full-stack developers

### Next Steps

1. Review and approve this plan
2. Prioritize Phase 1 (Foundation) implementation
3. Set up database migrations
4. Begin backend development
5. Create shared chart components first
6. Implement dashboards incrementally

---

**Questions or Clarifications Needed?**

1. Should survey responses be truly anonymous or trackable by admin?
2. What retention risk threshold should trigger alerts?
3. Which predictive model to use for attrition (simple scoring or ML)?
4. How frequently should metrics be recalculated?
5. Should employees see their own engagement scores?
