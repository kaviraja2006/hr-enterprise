# HR Enterprise - Data Flow Documentation

## Overview

This document describes the complete data flow across the HR Enterprise system, including how data moves between users, frontend, backend, and database. It covers data flows for existing modules and the new Engagement & Insights modules.

---

## System Architecture Data Flow

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW OVERVIEW                              │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐         HTTP/JSON         ┌──────────┐
     │          │ ◄───────────────────────► │          │
     │  Client  │     Authorization:        │  Backend │
     │ (React)  │        Bearer <token>     │ (NestJS) │
     │          │                           │          │
     └──────────┘                           └────┬─────┘
            │                                    │
            │ React Query                        │ Prisma
            │ Cache                              │ ORM
            ▼                                    ▼
     ┌──────────┐                           ┌──────────┐
     │  Browser │                           │PostgreSQL│
     │ LocalStorage                          │  Database│
     │  (JWT)   │                           │          │
     └──────────┘                           └──────────┘
```

---

## Authentication Data Flow

### Login Flow

```
Step 1: User Login Request
┌──────────┐                              ┌──────────┐
│  User    │ 1. POST /auth/login          │ Frontend │
│  Form    │ ───────────────────────────► │  React   │
│          │   {email, password}          │          │
└──────────┘                              └────┬─────┘
                                               │
Step 2: API Call to Backend                    │ Axios
                                               ▼
                                          ┌──────────┐
                                          │  Backend │
                                          │  NestJS  │
                                          └────┬─────┘
                                               │
Step 3: Backend Validation                     │
                                               │
  ┌────────────────────────────────────────────┼────────────┐
  │                                            │            │
  │  ┌──────────────┐    ┌──────────┐         │   ┌──────┐ │
  │  │  Validate    │    │  Check   │         │   │Query │ │
  │  │   Input      │───►│ Password │─────────┼──►│ User │ │
  │  └──────────────┘    └──────────┘         │   └──────┘ │
  │         │                                  │      │    │
  │         ▼                                  │      ▼    │
  │  ┌──────────────┐    ┌──────────┐         │  ┌──────┐ │
  │  │  Generate    │    │  Store   │         │  │Verify│ │
  │  │    Tokens    │───►│ Refresh  │         │  │Hash  │ │
  │  └──────────────┘    │  Token   │         │  └──────┘ │
  │                      └──────────┘         │           │
  └────────────────────────────────────────────┴───────────┘
                                               │
Step 4: Return Tokens                          │
                                               ▼
                                          ┌──────────┐
                                          │ Response │
                                          │ {access, │
                                          │ refresh, │
                                          │ user}    │
                                          └────┬─────┘
                                               │
Step 5: Frontend Storage                       │
                                               ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  Store   │    │ Update Auth  │    │ Set Axios    │
│  Tokens  │───►│   Context    │───►│  Interceptor │
│  Local   │    │ Set User     │    │ Attach Token │
│ Storage  │    └──────────────┘    └──────────────┘
└──────────┘

Step 6: Redirect
┌──────────┐
│ Navigate │
│   to     │
│ Dashboard│
└──────────┘
```

### Token Refresh Flow

```
Token Expired Scenario:

┌──────────┐              ┌──────────┐              ┌──────────┐
│  Axios   │              │  Axios   │              │ Backend  │
│ Request  │              │Response  │              │ /refresh │
│  (401)   │              │Handler   │              │          │
└────┬─────┘              └────┬─────┘              └────┬─────┘
     │                         │                         │
     │ 1. Request fails        │                         │
     │ with 401                │                         │
     │                         │                         │
     └────────────────────────►│                         │
                               │ 2. Try refresh          │
                               │ POST /auth/refresh      │
                               │ {refreshToken}          │
                               │                         │
                               ├────────────────────────►│
                               │                         │ 3. Validate
                               │                         │ refresh token
                               │                         │
                               │ 4. New tokens           │
                               │ {access, refresh}       │
                               │◄────────────────────────┤
                               │                         │
                               │ 5. Update storage       │
                               │ Retry original request  │
                               │ with new access token   │
                               │                         │
     │◄────────────────────────┤                         │
     │ 6. Success              │                         │
     │                         │                         │

Refresh Failed Scenario:
                               │
                               │ Refresh returns 401     │
                               │◄────────────────────────┤
                               │                         │
                               │ 7. Clear tokens         │
                               │ Redirect to /login      │
                               │                         │
```

---

## Employee Module Data Flow

### Create Employee Flow

```
Step 1: User Submits Form
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Fill    │    │ Validate │    │  Click   │               │
│  │   Form   │───►│   Form   │───►│ Submit   │               │
│  └──────────┘    └──────────┘    └────┬─────┘               │
│                                        │                     │
│                                        │ React Hook Form     │
│                                        ▼                     │
│  ┌──────────────────────────────────────────┐               │
│  │      useCreateEmployee Hook              │               │
│  │  - React Query mutation                  │               │
│  │  - Validates input                       │               │
│  │  - Calls employeeApi.create()            │               │
│  └────────────────────┬─────────────────────┘               │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ Axios POST /employees
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                                                              │
│  ┌──────────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Controller  │    │  DTO     │    │ Validation│         │
│  │  @Post()     │───►│ Transform│───►│  Pipe     │         │
│  └──────┬───────┘    └──────────┘    └────┬─────┘          │
│         │                                   │                │
│         │                                   │ class-validator│
│         │                                   ▼                │
│         │                         ┌──────────────────┐      │
│         │                         │ ValidationError? │      │
│         │                         └────────┬─────────┘      │
│         │                                  │                 │
│         │                    ┌─────────────┴─────────┐      │
│         │                    │                       │      │
│         │              Valid │                 Invalid│     │
│         │                    │                       │      │
│         │                    ▼                       ▼      │
│         │            ┌──────────┐           ┌──────────┐   │
│         │            │ Service  │           │ 422 Error│   │
│         │            └────┬─────┘           └──────────┘   │
│         │                 │                                  │
│         │                 │ Business Logic                   │
│         │                 ▼                                  │
│         │         ┌──────────────┐                          │
│         │         │ Prisma Query │                          │
│         │         │ Create Employee                       │
│         │         └──────┬───────┘                          │
│         │                │                                   │
│         │                ▼                                   │
│         │         ┌──────────────┐                          │
│         │         │ Check Unique │                          │
│         │         │ Constraint   │                          │
│         │         └──────┬───────┘                          │
│         │                │                                   │
│         │           ┌────┴────┐                              │
│         │      Unique    Duplicate                             │
│         │           │         │                              │
│         │           ▼         ▼                              │
│         │      ┌──────┐   ┌──────────┐                      │
│         │      │Insert│   │ 409 Error│                      │
│         │      └──┬───┘   └──────────┘                      │
│         │         │                                         │
│         │         ▼                                         │
│         │    ┌──────────┐                                   │
│         │    │  Audit   │                                   │
│         │    │   Log    │                                   │
│         │    └──────────┘                                   │
│         │                                                   │
│         └───────────────────────────────────────────────────│
                        │
                        │ Response 201 Created
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Callback)                       │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │      useCreateEmployee onSuccess         │               │
│  │                                          │               │
│  │  1. Show success toast                   │               │
│  │  2. Invalidate employee list cache       │               │
│  │  3. Redirect to employee detail page     │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Employee List Data Flow

```
Initial Load:

┌──────────┐              ┌──────────┐              ┌──────────┐
│  Page    │              │  React   │              │  React   │
│ Mounts   │─────────────►│  Query   │─────────────►│   Cache  │
│          │              │  Check   │              │  Check   │
└──────────┘              └────┬─────┘              └────┬─────┘
                               │                         │
                          Cache Hit               Cache Miss
                               │                         │
                          Return Data                  API Call
                               │                         │
                               │◄────────────────────────┘
                               │
                               ▼
                         ┌──────────┐
                         │ Render   │
                         │   UI     │
                         └──────────┘

Pagination/Filter Change:

User Changes        React Query          Different
   Page      ───────► Detects     ───────► Cache Key
Filter        Params Change             from Before
                              │
                              ▼
                        ┌──────────┐
                        │  Fetch   │
                        │  New Data│
                        └──────────┘
```

---

## NEW MODULES: Engagement Data Flows

### Survey Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SURVEY CREATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

Step 1: HR Creates Survey
┌──────────┐         ┌──────────┐         ┌──────────┐
│   HR     │         │ Survey   │         │ Backend  │
│ Manager  │────────►│ Builder  │────────►│   API    │
│          │  Form   │  Form    │  POST   │          │
│          │ Input   │ Validation       │ /surveys │
└──────────┘         └──────────┘         └────┬─────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND PROCESSING                                          │
│                                                              │
│  1. Validate DTO (title, questions array)                   │
│  2. Validate each question (type, required, etc.)           │
│  3. Create Survey record                                    │
│  4. Create SurveyQuestion records (bulk insert)             │
│  5. Return created survey with questions                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Success  │◄────────│  Cache   │◄────────│ Response │
│  Toast   │         │ Invalidate        │  201     │
└──────────┘         └──────────┘         └──────────┘
```

### Survey Response Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 SURVEY RESPONSE FLOW                         │
└─────────────────────────────────────────────────────────────┘

Anonymous Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───►│  Survey  │───►│ Submit   │───►│ Backend  │
│  (No Auth)   │   Form   │    │ Answers  │    │   API    │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                                                      │ 1. Validate survey active
                                                      │ 2. Store response anonymously
                                                      │ 3. Store answers
                                                      │ 4. Update engagement metrics
                                                      │ 5. Recalculate satisfaction score
                                                      ▼
                                               ┌──────────┐
                                               │ Thank You│
                                               │  Page    │
                                               └──────────┘

Identified Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───►│  Survey  │───►│ Submit   │───►│ Backend  │
│  (Auth)  │    │   Form   │    │ Answers  │    │   API    │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                                                      │ 1. Link to employeeId
                                                      │ 2. Check not already submitted
                                                      │ 3. Store response
                                                      │ 4. Update employee engagement metric
                                                      ▼
                                               ┌──────────┐
                                               │ Dashboard│
                                               │  Update  │
                                               └──────────┘
```

### Engagement Metrics Calculation Flow

```
┌─────────────────────────────────────────────────────────────┐
│           ENGAGEMENT METRICS CALCULATION FLOW                │
└─────────────────────────────────────────────────────────────┘

Daily Cron Job (2 AM):

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Cron    │         │ Scheduler│         │  Data    │
│ Trigger  │────────►│ Service  │────────►│ Collector│
│          │         │          │         │          │
└──────────┘         └──────────┘         └────┬─────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA COLLECTION                                             │
│                                                              │
│  For each employee:                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Attendance  │  │   Survey    │  │    Leave    │         │
│  │   Data      │  │  Responses  │  │   Balance   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                 │
│                          ▼                                 │
│  ┌──────────────────────────────────────────────────┐     │
│  │            ENGAGEMENT SCORE CALCULATION          │     │
│  │                                                  │     │
│  │  Satisfaction: avg(survey ratings) * 20         │     │
│  │  Engagement: attendance_rate * 0.3 +            │     │
│  │            recognition_count * 0.2 +            │     │
│  │            collaboration_score * 0.5            │     │
│  │  Culture: survey culture questions avg * 20     │     │
│  │  Burnout Risk: overtime_freq * 0.4 +            │     │
│  │               absenteeism * 0.3 +               │     │
│  │               work_life_score_inverse * 0.3     │     │
│  └──────────────────────┬───────────────────────────┘     │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Store   │◄────────│  Bulk    │◄────────│ Calculate│
│  Metrics │         │  Insert  │         │  Scores  │
│  in DB   │         │          │         │          │
└──────────┘         └──────────┘         └──────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ALERT GENERATION                                            │
│                                                              │
│  If burnout_score > 60:                                     │
│    → Create alert for HR                                    │
│    → Notify manager                                         │
│                                                              │
│  If satisfaction < 50:                                      │
│    → Flag for retention risk                                │
│    → Add to watch list                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Grievance Resolution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 GRIEVANCE LIFECYCLE FLOW                     │
└─────────────────────────────────────────────────────────────┘

Creation:
Employee ──► Submit Grievance ──► Backend ──► Create Record
                                    │
                                    ▼
                              ┌──────────┐
                              │  Status: │
                              │   OPEN   │
                              └──────────┘

Assignment:
HR Manager ──► View Open ──► Assign to ──► Update Status
Grievances      List         Manager         INVESTIGATING

Investigation:
Assigned ──► Add Notes ──► Interview ──► Document
Manager      (Timeline)    Parties       Findings
               │
               ▼
        ┌──────────────┐
        │ Escalate?    │
        │ (Severity)   │
        └───────┬──────┘
                │
           Yes /   \ No
              /     \
             ▼       ▼
    ┌──────────┐  ┌──────────┐
    │ Escalate │  │ Continue │
    │ to Legal │  │ Investigation
    └──────────┘  └──────────┘

Resolution:
┌──────────┐         ┌──────────┐         ┌──────────┐
│Investigation      │ Complete │         │  Status  │
│   Done    │──────►│ Resolution      │──────►│ RESOLVED │
│           │       │ Write-up │         │          │
└──────────┘         └──────────┘         └──────────┘
                                               │
                                               ▼
                                        ┌──────────┐
                                        │ Employee │
                                        │ Notified │
                                        └──────────┘

Follow-up (7 days later):
Cron Job ──► Check Resolved ──► Send Follow-up ──► Update
             Grievances         Survey to         Metrics
             > 7 days           Employee
```

---

## NEW MODULES: Insights Data Flows

### Retention Risk Prediction Flow

```
┌─────────────────────────────────────────────────────────────┐
│           RETENTION RISK PREDICTION FLOW                     │
└─────────────────────────────────────────────────────────────┘

Data Collection (Daily 3 AM):

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Attendance│    │  Payroll │    │Performance      │Engagement│
│   Data   │    │   Data   │    │   Data   │    │   Data   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     └───────────────┴───────┬───────┴───────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Feature        │
                    │  Extraction     │
                    │                 │
                    │ - tenure_months │
                    │ - salary_percentile
                    │ - last_raise_days
                    │ - satisfaction_trend
                    │ - overtime_freq │
                    │ - promotion_years│
                    └────────┬────────┘
                             │
                             ▼
Model Inference:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Input Features ───► ML Model ───► Risk Score (0-100)     │
│                                                            │
│  Model: Gradient Boosting / Random Forest                 │
│  Version: v1.2.3                                          │
│  Training: Quarterly retraining                           │
│                                                            │
│  Output:                                                  │
│  - Risk Score: 78                                         │
│  - Risk Level: HIGH                                       │
│  - Confidence: 0.72                                       │
│  - Top Factors: [                                         │
│      {factor: "salary", weight: 0.35},                   │
│      {factor: "satisfaction", weight: 0.25},             │
│      {factor: "overtime", weight: 0.20}                  │
│    ]                                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
Store & Alert:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Store   │    │  Check   │    │ Generate │    │  Send    │
│  Score   │───►│ Threshold│───►│  Alert   │───►│  Email   │
│  in DB   │    │  > 70?   │    │          │    │  to HR   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Burnout Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│              BURNOUT DETECTION DATA FLOW                     │
└─────────────────────────────────────────────────────────────┘

Real-time Data Collection:

        ┌──────────┐
        │ Employee │
        │  Activity│
        └────┬─────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐
│Check- │ │Check- │ │Survey │
│  in   │ │  out  │ │Response
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
    ┌─────────────────┐
    │  Burnout        │
    │  Indicators     │
    │                 │
    │ - Daily hours   │
    │ - Weekly total  │
    │ - Weekend work  │
    │ - Late logins   │
    │ - Early logins  │
    │ - Skip breaks   │
    └────────┬────────┘
             │
             ▼
Score Calculation:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  workload_index = (actual_hours / expected_hours)         │
│                                                            │
│  overtime_freq = count(overtime_days_last_30)             │
│                                                            │
│  work_life_score = survey_work_life_question_avg          │
│                                                            │
│  burnout_risk = (                                        │
│    workload_index * 0.4 +                                │
│    overtime_freq_normalized * 0.3 +                      │
│    (10 - work_life_score) * 0.3                          │
│  ) * 10                                                   │
│                                                            │
│  Risk Levels:                                             │
│  0-30: LOW (Green)                                       │
│  31-60: MEDIUM (Yellow)                                  │
│  61-80: HIGH (Orange)                                    │
│  81-100: CRITICAL (Red)                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
             │
             ▼
Actions:
┌──────────┐
│ Risk < 60│──────► Update Dashboard Only
└──────────┘
    │
    │ Risk >= 60
    ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Flag for │───►│ Notify   │───►│ Suggest  │
│ Manager  │    │ Manager  │    │ Actions  │
│ Review   │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘
```

### Workforce Forecasting Flow

```
┌─────────────────────────────────────────────────────────────┐
│            WORKFORCE FORECASTING DATA FLOW                   │
└─────────────────────────────────────────────────────────────┘

Input Data Collection:

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Historical│  │ Current  │  │ Project  │  │  Budget  │  │ External │
│Headcount │  │ Workload │  │ Pipeline │  │   Data   │  │  Market  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FORECAST MODEL                                              │
│                                                              │
│  Time Series Analysis + Regression                          │
│                                                              │
│  Factors:                                                    │
│  - Historical growth rate (last 12 months)                  │
│  - Current utilization rate                                 │
│  - Upcoming projects (count * avg team size)                │
│  - Budget allocation changes                                │
│  - Expected attrition (from retention model)                │
│  - Market hiring trends                                     │
│                                                              │
│  Output: 6-month hiring forecast                            │
│                                                              │
│  Example:                                                   │
│  Current: 150 employees                                     │
│  Predicted Attrition: 8                                     │
│  New Projects Need: 15                                      │
│  Budget Allows: 20                                          │
│  ─────────────────────────                                  │
│  Recommended Hires: 12                                      │
│  Predicted Headcount: 154                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
Output Generation:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Monthly  │    │ Skills   │    │ Risk     │    │ Budget   │
│ Breakdown│    │ Needed   │    │ Factors  │    │ Impact   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     └───────────────┴───────┬───────┴───────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Forecast       │
                    │  Report         │
                    │  Generated      │
                    └─────────────────┘
```

### Skills Gap Analysis Flow

```
┌─────────────────────────────────────────────────────────────┐
│              SKILLS GAP ANALYSIS FLOW                        │
└─────────────────────────────────────────────────────────────┘

Data Sources:

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Project    │  │  Employee    │  │   Training   │  │    Market    │
│ Requirements │  │    Skills    │  │   Records    │  │   Demand     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       │ Required Skills │ Current Skills  │ Certifications  │ Trending
       │ by Project      │ by Employee     │ Earned          │ Skills
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                           │
                           ▼
Gap Calculation:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  For each department:                                        │
│                                                              │
│  Required Skills (from upcoming projects)                   │
│  - React: Level 4, needed by Q2                            │
│  - AWS: Level 3, needed by Q3                              │
│  - Machine Learning: Level 4, needed immediately           │
│                                                              │
│  Current Skills (average across team)                       │
│  - React: Level 4.2 ✓                                      │
│  - AWS: Level 2.8 ⚠️                                       │
│  - ML: Level 2.1 ❌                                        │
│                                                              │
│  Gap Analysis:                                              │
│  - React: No gap                                           │
│  - AWS: Gap = 0.2, Priority: MEDIUM                        │
│  - ML: Gap = 1.9, Priority: CRITICAL                       │
│                                                              │
│  Coverage:                                                  │
│  - Employees with ML skill: 3/45 (6.7%)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Recommendations:
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Critical │    │ Training │    │ Hiring   │
│  Gaps    │───►│ Plan     │───►│ Strategy │
│  Found   │    │ Created  │    │ Adjusted │
└──────────┘    └──────────┘    └──────────┘

Recommendation Examples:
- URGENT: Hire 2 Senior ML Engineers or contract consultants
- MEDIUM: AWS certification program for 15 engineers
- LOW: Continue React skill development
```

---

## Cache Invalidation Data Flows

### Survey Response Cache Flow

```
When Survey Response Submitted:

┌──────────┐         ┌──────────┐         ┌──────────┐
│ Response │────────►│  React   │────────►│  Update  │
│ Submitted│         │  Query   │         │  Cache   │
│          │         │ Invalidate        │          │
└──────────┘         └────┬─────┘         └──────────┘
                          │
                          │ Invalidate:
                          │ - ['surveys', id, 'responses']
                          │ - ['engagement', 'metrics']
                          │ - ['engagement', 'dashboard']
                          ▼
                   ┌──────────────┐
                   │ Refetch Data │
                   │ on Next View │
                   └──────────────┘
```

### Predictive Metrics Cache

```
Daily Recalculation:

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Cron    │────────►│ Calculate│────────►│  Update  │
│  Job     │         │  Metrics │         │  Cache   │
│  (3 AM)  │         │          │         │          │
└──────────┘         └────┬─────┘         └──────────┘
                          │
                          │ Invalidate Redis Cache:
                          │ - retention:risk:employee:id
                          │ - burnout:score:employee:id
                          │ - insights:dashboard:*
                          ▼
                   ┌──────────────┐
                   │ Frontend Gets│
                   │ Fresh Data   │
                   │ on Next Load │
                   └──────────────┘
```

---

## Audit Trail Data Flow

```
Every Data Modification:

User Action ──► Backend API ──► Prisma Mutation
                                    │
                                    ▼
                           ┌──────────────┐
                           │  Audit Hook  │
                           │  (Prisma     │
                           │  Middleware) │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ Capture:     │
                           │ - User ID    │
                           │ - Action     │
                           │ - Entity     │
                           │ - Old values │
                           │ - New values │
                           │ - Timestamp  │
                           │ - IP Address │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │  Async Store │
                           │  to AuditLog │
                           │  Table       │
                           └──────────────┘

Example Audit Record:
{
  "userId": "hr-manager-uuid",
  "action": "UPDATE",
  "entity": "Employee",
  "entityId": "emp-uuid",
  "oldValues": { "salary": 70000 },
  "newValues": { "salary": 75000 },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Error Recovery Data Flows

### API Failure Retry Logic

```
Request Fails:

┌──────────┐         ┌──────────┐         ┌──────────┐
│  API     │────────►│  Axios   │────────►│  Retry?  │
│  Error   │         │  Interceptor      │          │
└──────────┘         └────┬─────┘         └────┬─────┘
                          │                     │
                    Network Error               │
                    (No Retry)                  │ 5xx Error
                          │                     │ (Yes, 3x)
                          ▼                     ▼
                   ┌──────────┐         ┌──────────┐
                   │ Show     │         │ Exponential
                   │ Error    │         │ Backoff    │
                   │ Message  │         │ Retry      │
                   └──────────┘         └────┬───────┘
                                              │
                                              ▼
                                       ┌──────────┐
                                       │ Success? │
                                       └────┬─────┘
                                            │
                                    Yes /   \ No (3rd fail)
                                   /         \
                                  ▼           ▼
                           ┌──────────┐  ┌──────────┐
                           │ Continue │  │ Show     │
                           │          │  │ Final    │
                           │          │  │ Error    │
                           └──────────┘  └──────────┘
```

---

## Data Security Flow

```
Sensitive Data Handling:

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Survey  │         │ Backend  │         │ Database │
│ Response │────────►│ Encrypt  │────────►│  Store   │
│ (Anonymous)       │ PII      │         │ Encrypted│
└──────────┘         └────┬─────┘         └──────────┘
                          │
                          │ Survey responses
                          │ encrypted at field level
                          │ for anonymous surveys
                          ▼
                   ┌──────────────┐
                   │ Encryption   │
                   │ Key: AES-256 │
                   │ KMS Managed  │
                   └──────────────┘

Access Control:
Admin ──► View Aggregate ──► Allowed
        View Individual ───► Allowed (for investigation)

Manager ──► View Team ─────► Allowed
          View Individual ──► Allowed (own team only)

Employee ──► View Own ─────► Allowed
           View Others ────► Denied
```

---

## Real-time Data Flow (Future)

```
Planned WebSocket Implementation:

                    ┌──────────────┐
                    │   Client     │
                    │  (Browser)   │
                    └──────┬───────┘
                           │ WebSocket
                           │ Connection
                           ▼
                    ┌──────────────┐
                    │   Socket.io  │
                    │   Gateway    │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Survey   │   │ Retention│   │Grievance │
    │Complete  │   │Risk Alert│   │ Updated  │
    │Event     │   │Event     │   │ Event    │
    └──────────┘   └──────────┘   └──────────┘

Events to Push:
- Survey completion (aggregate count update)
- High retention risk detected
- Grievance status changed
- Recognition given
- New engagement metrics available
```

---

## Summary of Data Flows

### Engagement Module Flows
1. **Survey Creation**: Form → Validation → Database → Cache Invalidation
2. **Survey Response**: Submission → Validation → Storage → Metric Update
3. **Engagement Calculation**: Multi-source data → Algorithm → Scores → Alerts
4. **Grievance Lifecycle**: Creation → Assignment → Investigation → Resolution

### Insights Module Flows
1. **Retention Prediction**: Historical data → ML Model → Risk Score → Alerts
2. **Burnout Detection**: Activity tracking → Indicator calculation → Risk flagging
3. **Workforce Forecast**: Multi-factor analysis → Trend projection → Hiring plan
4. **Skills Gap**: Requirements vs Current → Gap analysis → Training plan

### Common Patterns
- **Caching**: React Query for frontend, Redis for backend
- **Audit**: All mutations logged with full context
- **Security**: Encryption for sensitive data, RBAC for access
- **Error Recovery**: Retry logic with exponential backoff
- **Real-time**: WebSocket for live updates (planned)

---

**Last Updated**: 2026-02-14  
**Status**: Documentation Complete
