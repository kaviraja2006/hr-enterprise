# HR Enterprise - API Documentation

## Overview

This document provides comprehensive API documentation for the HR Enterprise system, including existing endpoints and planned endpoints for the new Engagement and Insights modules.

**Base URL**: `http://localhost:3002/api`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

---

## Authentication

All API requests (except login/register) require authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

### Token Refresh

When access token expires (401 response), use refresh token to get new tokens:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

---

## Response Format

All successful responses follow this structure:

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

Error responses:

```json
{
  "statusCode": 404,
  "timestamp": "2026-02-14T12:00:00.000Z",
  "path": "/api/employees/123",
  "method": "GET",
  "message": "Employee not found",
  "code": "P2025"
}
```

---

## Existing API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/login | User login | No |
| POST | /auth/register | User registration | No |
| POST | /auth/refresh | Refresh tokens | No |
| POST | /auth/logout | Logout | Yes |
| POST | /auth/logout-all | Logout all sessions | Yes |
| GET | /auth/me | Get current user | Yes |

### Employees

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /employees | List employees | employees:read |
| GET | /employees/:id | Get employee | employees:read |
| POST | /employees | Create employee | employees:create |
| PATCH | /employees/:id | Update employee | employees:update |
| DELETE | /employees/:id | Delete employee | employees:delete |
| GET | /employees/:id/team | Get team members | employees:read |

### Departments

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /departments | List departments | departments:read |
| GET | /departments/:id | Get department | departments:read |
| POST | /departments | Create department | departments:create |
| PATCH | /departments/:id | Update department | departments:update |
| DELETE | /departments/:id | Delete department | departments:delete |

### Attendance

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /attendance | List attendance | attendance:read |
| POST | /attendance/check-in | Check in | attendance:write |
| POST | /attendance/check-out | Check out | attendance:write |
| GET | /attendance/summary/:id | Get summary | attendance:read |

### Leave

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /leave/requests | List requests | leave:read |
| POST | /leave/requests | Create request | leave:create |
| POST | /leave/requests/:id/approve | Approve | leave:approve |

### Payroll

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /payroll/runs | List runs | payroll:read |
| POST | /payroll/runs | Create run | payroll:create |
| POST | /payroll/runs/:id/process | Process | payroll:process |

### Analytics

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | /analytics/executive-summary | Executive data | analytics:read |
| GET | /analytics/attendance | Attendance metrics | analytics:read |
| GET | /analytics/attrition | Attrition rate | analytics:read |

---

## NEW API ENDPOINTS

## Employee Engagement Module

### Surveys

#### Create Survey
```http
POST /engagement/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Q1 2024 Employee Satisfaction Survey",
  "description": "Quarterly satisfaction survey",
  "type": "satisfaction",
  "frequency": "quarterly",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "isAnonymous": true,
  "questions": [
    {
      "question": "How satisfied are you with your work environment?",
      "type": "rating",
      "category": "work_environment",
      "isRequired": true,
      "weight": 2
    },
    {
      "question": "What improvements would you suggest?",
      "type": "text",
      "category": "feedback",
      "isRequired": false
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "survey-uuid",
    "title": "Q1 2024 Employee Satisfaction Survey",
    "status": "draft",
    "questions": [...],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### List Surveys
```http
GET /engagement/surveys?status=active&type=satisfaction&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "survey-uuid",
      "title": "Q1 2024 Employee Satisfaction Survey",
      "type": "satisfaction",
      "status": "active",
      "responseCount": 45,
      "totalEmployees": 60,
      "responseRate": 75,
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Get Survey Details
```http
GET /engagement/surveys/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": "survey-uuid",
    "title": "Q1 2024 Employee Satisfaction Survey",
    "description": "Quarterly satisfaction survey",
    "type": "satisfaction",
    "status": "active",
    "isAnonymous": true,
    "questions": [
      {
        "id": "question-uuid",
        "question": "How satisfied are you?",
        "type": "rating",
        "category": "work_environment",
        "order": 1,
        "isRequired": true
      }
    ],
    "responseCount": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Survey
```http
PATCH /engagement/surveys/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Survey Title",
  "endDate": "2024-02-15T23:59:59Z"
}
```

#### Activate Survey
```http
POST /engagement/surveys/:id/activate
Authorization: Bearer <token>
```

#### Close Survey
```http
POST /engagement/surveys/:id/close
Authorization: Bearer <token>
```

#### Delete Survey
```http
DELETE /engagement/surveys/:id
Authorization: Bearer <token>
```

### Survey Responses

#### Submit Response
```http
POST /engagement/surveys/:id/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "question-uuid-1",
      "answer": "5",
      "ratingValue": 5
    },
    {
      "questionId": "question-uuid-2",
      "answer": "Better coffee in the break room"
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "response-uuid",
    "surveyId": "survey-uuid",
    "submittedAt": "2024-01-15T10:30:00Z",
    "completed": true
  }
}
```

#### Get Survey Analytics
```http
GET /engagement/surveys/:id/analytics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "surveyId": "survey-uuid",
    "totalResponses": 45,
    "responseRate": 75,
    "averageCompletionTime": 300,
    "overallScore": 4.2,
    "questionAnalytics": [
      {
        "questionId": "question-uuid",
        "question": "How satisfied are you?",
        "type": "rating",
        "responseCount": 45,
        "averageRating": 4.2,
        "distribution": {
          "5": 20,
          "4": 15,
          "3": 7,
          "2": 2,
          "1": 1
        }
      }
    ],
    "departmentBreakdown": [
      {
        "department": "Engineering",
        "responseCount": 20,
        "averageScore": 4.5
      }
    ]
  }
}
```

### Engagement Metrics

#### Get Engagement Metrics
```http
GET /engagement/metrics?employeeId=uuid&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "metric-uuid",
      "employeeId": "employee-uuid",
      "metricDate": "2024-01-15",
      "satisfactionScore": 85.5,
      "engagementScore": 78.2,
      "cultureScore": 82.0,
      "recognitionCount": 3,
      "collaborationScore": 88.5,
      "burnoutRisk": "low"
    }
  ]
}
```

#### Get Engagement Summary
```http
GET /engagement/metrics/summary?departmentId=uuid&period=monthly
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "period": "2024-01",
    "overallSatisfaction": 82.5,
    "overallEngagement": 76.3,
    "overallCulture": 80.1,
    "totalRecognitions": 145,
    "burnoutRiskDistribution": {
      "low": 45,
      "medium": 12,
      "high": 3
    },
    "trend": {
      "satisfaction": 2.5,
      "engagement": -1.2,
      "culture": 0.8
    }
  }
}
```

#### Trigger Metrics Calculation
```http
POST /engagement/metrics/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "departmentId": "optional-department-uuid"
}
```

### Grievances

#### Create Grievance
```http
POST /engagement/grievances
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "workload",
  "severity": "high",
  "description": "Unreasonable workload expectations affecting work-life balance",
  "isAnonymous": false
}
```

**Response (201):**
```json
{
  "data": {
    "id": "grievance-uuid",
    "employeeId": "employee-uuid",
    "category": "workload",
    "severity": "high",
    "status": "open",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Grievances
```http
GET /engagement/grievances?status=open&category=workload&severity=high&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "grievance-uuid",
      "employee": {
        "id": "employee-uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "category": "workload",
      "severity": "high",
      "status": "open",
      "description": "Unreasonable workload...",
      "createdAt": "2024-01-15T10:30:00Z",
      "daysOpen": 5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

#### Get Grievance Details
```http
GET /engagement/grievances/:id
Authorization: Bearer <token>
```

#### Update Grievance
```http
PATCH /engagement/grievances/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignedTo": "manager-uuid",
  "status": "investigating"
}
```

#### Resolve Grievance
```http
POST /engagement/grievances/:id/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution": "Workload redistributed across team. Employee will report on progress in 2 weeks.",
  "status": "resolved"
}
```

#### Add Grievance Note
```http
POST /engagement/grievances/:id/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Spoke with employee. Issue stems from recent project deadline pressure."
}
```

### Internal Transfers

#### Create Transfer
```http
POST /engagement/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "employee-uuid",
  "fromDepartmentId": "dept-uuid-1",
  "toDepartmentId": "dept-uuid-2",
  "fromDesignation": "Software Engineer",
  "toDesignation": "Senior Software Engineer",
  "transferType": "promotion",
  "transferDate": "2024-02-01",
  "reason": "Performance-based promotion after annual review"
}
```

#### List Transfers
```http
GET /engagement/transfers?transferType=promotion&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer <token>
```

### Recognition

#### Give Recognition
```http
POST /engagement/recognitions
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "employee-uuid",
  "type": "peer_to_peer",
  "category": "excellence",
  "message": "Outstanding work on the Q4 project delivery! Your attention to detail saved us from critical bugs.",
  "points": 50,
  "isPublic": true
}
```

**Response (201):**
```json
{
  "data": {
    "id": "recognition-uuid",
    "recipient": {
      "id": "employee-uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "giver": {
      "id": "giver-uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "category": "excellence",
    "message": "Outstanding work...",
    "points": 50,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Recognitions
```http
GET /engagement/recognitions?recipientId=uuid&category=excellence&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Recognition Leaderboard
```http
GET /engagement/recognitions/leaderboard?period=monthly&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "period": "2024-01",
    "topReceivers": [
      {
        "employee": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "recognitionCount": 12,
        "totalPoints": 580
      }
    ],
    "topGivers": [
      {
        "employee": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe"
        },
        "recognitionCount": 8
      }
    ]
  }
}
```

### Dashboard Endpoints

#### Satisfaction Dashboard Data
```http
GET /engagement/dashboard/satisfaction?period=monthly&departmentId=optional
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "overallScore": 82.5,
    "trend": [78, 80, 82, 82.5, 83, 84],
    "byDepartment": [
      {"department": "Engineering", "score": 85},
      {"department": "Sales", "score": 78}
    ],
    "byTenure": [
      {"tenure": "0-1 years", "score": 88},
      {"tenure": "1-3 years", "score": 82},
      {"tenure": "3+ years", "score": 79}
    ],
    "drivers": [
      {"factor": "Work-Life Balance", "score": 85},
      {"factor": "Compensation", "score": 78},
      {"factor": "Management", "score": 82}
    ],
    "responseRate": 76
  }
}
```

#### Culture Health Dashboard Data
```http
GET /engagement/dashboard/culture?period=quarterly
Authorization: Bearer <token>
```

#### Retention Dashboard Data
```http
GET /engagement/dashboard/retention?period=annual
Authorization: Bearer <token>
```

#### Mobility Dashboard Data
```http
GET /engagement/dashboard/mobility?fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer <token>
```

---

## Advanced HR Analytics Module

### Retention Risk

#### List At-Risk Employees
```http
GET /insights/retention-risk?riskLevel=high&departmentId=optional&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "employee": {
        "id": "employee-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "department": "Engineering",
        "designation": "Software Engineer",
        "tenure": "2.5 years"
      },
      "retentionRiskScore": 78,
      "riskLevel": "high",
      "riskFactors": [
        { "factor": "No salary increase in 18 months", "weight": 0.35 },
        { "factor": "Declining satisfaction score", "weight": 0.25 },
        { "factor": "High overtime frequency", "weight": 0.20 },
        { "factor": "Limited growth opportunities", "weight": 0.20 }
      ],
      "predictedAttrition": true,
      "predictedDeparture": "2024-06-15",
      "confidenceScore": 0.72,
      "recommendedActions": [
        "Schedule retention conversation",
        "Review compensation against market",
        "Discuss career development plan"
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Get Individual Risk Profile
```http
GET /insights/retention-risk/:employeeId
Authorization: Bearer <token>
```

#### Get Retention Risk Summary
```http
GET /insights/retention-risk/summary
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "totalEmployees": 150,
    "atRiskCount": 12,
    "riskDistribution": {
      "low": 125,
      "medium": 13,
      "high": 8,
      "critical": 4
    },
    "byDepartment": [
      {
        "department": "Engineering",
        "totalEmployees": 50,
        "atRiskCount": 5,
        "averageRiskScore": 35
      }
    ],
    "trend": [10, 11, 12, 11, 12],
    "estimatedTurnoverCost": 450000
  }
}
```

### Burnout Analysis

#### Get Burnout Indicators
```http
GET /insights/burnout-indicators?departmentId=optional&period=monthly
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "period": "2024-01",
    "averageBurnoutScore": 42,
    "highRiskCount": 8,
    "indicators": {
      "overtimeFrequency": {
        "average": 5.2,
        "trend": "increasing"
      },
      "workLifeBalance": {
        "average": 3.2,
        "trend": "decreasing"
      },
      "absenteeism": {
        "rate": 4.5,
        "trend": "stable"
      }
    },
    "byDepartment": [
      {
        "department": "Sales",
        "burnoutScore": 58,
        "highRiskCount": 4
      }
    ]
  }
}
```

#### Get High Risk Employees
```http
GET /insights/burnout-risk/employees?threshold=60&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Work-Life Balance Scores
```http
GET /insights/work-life-balance?departmentId=optional&period=quarterly
Authorization: Bearer <token>
```

### Compensation Analysis

#### Get Compensation Alignment
```http
GET /insights/compensation/alignment?departmentId=optional&threshold=0.8
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "averageAlignmentRatio": 0.92,
    "misalignedCount": 15,
    "highPerformersBelowMarket": [
      {
        "employee": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "performanceScore": 4.8,
        "currentSalary": 75000,
        "marketRate": 85000,
        "gap": -10000,
        "alignmentRatio": 0.88
      }
    ],
    "byDepartment": [
      {
        "department": "Engineering",
        "averageRatio": 0.95,
        "misalignedCount": 5
      }
    ]
  }
}
```

#### Get Compensation Benchmarks
```http
GET /insights/compensation/benchmarks?jobTitle=Software%20Engineer&experience=3-5
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "jobTitle": "Software Engineer",
    "experienceRange": "3-5 years",
    "internal": {
      "average": 78000,
      "median": 75000,
      "p25": 70000,
      "p75": 85000
    },
    "market": {
      "average": 85000,
      "median": 82000,
      "p25": 75000,
      "p75": 95000,
      "source": "Industry survey 2024"
    },
    "comparison": "-8.2% vs market"
  }
}
```

#### Get Pay Equity Analysis
```http
GET /insights/compensation/equity?by=gender&departmentId=optional
Authorization: Bearer <token>
```

### Workforce Planning

#### Get Hiring Forecasts
```http
GET /insights/workforce/forecast?period=6months&departmentId=optional
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "forecastPeriod": "6 months",
    "currentHeadcount": 150,
    "predictedChange": 12,
    "predictedHeadcount": 162,
    "confidenceLevel": "high",
    "monthlyBreakdown": [
      {
        "month": "2024-02",
        "predictedHeadcount": 152,
        "attrition": 2,
        "recommendedHires": 4
      }
    ],
    "drivers": {
      "workloadTrend": 1.15,
      "projectPipeline": 8,
      "budgetAllocated": 2500000
    },
    "recommendedSkills": ["React", "Node.js", "AWS"],
    "riskFactors": ["Competitive market for senior engineers"]
  }
}
```

#### Create Forecast
```http
POST /insights/workforce/forecast
Authorization: Bearer <token>
Content-Type: application/json

{
  "forecastPeriod": "6months",
  "departmentId": "optional-dept-uuid",
  "assumptions": {
    "projectPipeline": 8,
    "budgetGrowth": 0.10
  }
}
```

#### Get Department Efficiency
```http
GET /insights/workforce/efficiency?departmentId=optional&period=quarterly
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "period": "Q4 2023",
    "overallEfficiency": 87.5,
    "byDepartment": [
      {
        "department": "Engineering",
        "efficiencyIndex": 92.0,
        "revenuePerEmployee": 185000,
        "costPerEmployee": 95000,
        "utilizationRate": 0.88,
        "vsLastQuarter": 3.2,
        "vsCompanyAverage": 5.1
      }
    ]
  }
}
```

#### Get Revenue per Headcount
```http
GET /insights/workforce/revenue-per-head?period=annual&departmentId=optional
Authorization: Bearer <token>
```

### Skills Analysis

#### Get Skills Gap Analysis
```http
GET /insights/skills/gaps?departmentId=optional&criticalOnly=true
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "skillName": "Machine Learning",
      "department": "Engineering",
      "requiredLevel": 4,
      "currentLevel": 2.3,
      "gapSize": 1.7,
      "employeesWithSkill": 3,
      "totalEmployees": 45,
      "coverage": 6.7,
      "priority": "critical",
      "impact": "Blocking AI product roadmap",
      "recommendedTraining": "ML Bootcamp Q2 2024"
    }
  ]
}
```

#### Get Skills Matrix
```http
GET /insights/skills/matrix?departmentId=required&skillCategories=technical,leadership
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "department": "Engineering",
    "skills": ["React", "Node.js", "Python", "AWS", "Leadership"],
    "employeeSkills": [
      {
        "employee": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe"
        },
        "skills": {
          "React": 4,
          "Node.js": 5,
          "Python": 3,
          "AWS": 4,
          "Leadership": 2
        }
      }
    ]
  }
}
```

#### Get Training Recommendations
```http
GET /insights/skills/recommendations?departmentId=optional&limit=10
Authorization: Bearer <token>
```

### Predictive Models

#### Run Attrition Prediction
```http
POST /insights/predict/attrition
Authorization: Bearer <token>
Content-Type: application/json

{
  "period": "6months",
  "departmentId": "optional",
  "modelType": "ensemble"
}
```

**Response (200):**
```json
{
  "data": {
    "predictionDate": "2024-01-15",
    "modelVersion": "1.2.3",
    "predictions": [
      {
        "employeeId": "uuid",
        "probability": 0.75,
        "riskLevel": "high",
        "confidence": 0.82,
        "topFactors": ["salary", "satisfaction", "overtime"]
      }
    ],
    "summary": {
      "totalPredictions": 150,
      "highRiskCount": 12,
      "predictedTurnoverRate": 8.0
    }
  }
}
```

#### Identify High Performers
```http
POST /insights/predict/high-performers
Authorization: Bearer <token>
Content-Type: application/json

{
  "criteria": {
    "performanceThreshold": 4.5,
    "potentialThreshold": 4.0
  },
  "limit": 20
}
```

#### Get Succession Planning Gaps
```http
GET /insights/predict/succession?roleLevel=manager&departmentId=optional
Authorization: Bearer <token>
```

### Reports

#### Generate Report
```http
POST /insights/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Q1 2024 Retention Analysis",
  "type": "retention",
  "format": "pdf",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "departmentId": "optional",
  "includeCharts": true
}
```

#### List Reports
```http
GET /insights/reports?type=retention&createdBy=uuid&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Report
```http
GET /insights/reports/:id
Authorization: Bearer <token>
```

#### Delete Report
```http
DELETE /insights/reports/:id
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Main Advanced Analytics Dashboard
```http
GET /insights/dashboard/advanced?period=quarterly
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "retentionRisk": {
      "atRiskCount": 12,
      "averageRiskScore": 42,
      "trend": [10, 11, 12],
      "highRiskEmployees": [...]
    },
    "burnout": {
      "highRiskCount": 8,
      "averageScore": 38,
      "trend": [35, 36, 38]
    },
    "compensation": {
      "misalignedCount": 15,
      "averageAlignment": 0.92
    },
    "workforce": {
      "forecastChange": 12,
      "efficiencyIndex": 87.5
    },
    "skills": {
      "criticalGaps": 3,
      "coverage": 72.5
    }
  }
}
```

#### Retention Risk Section
```http
GET /insights/dashboard/retention-risk
Authorization: Bearer <token>
```

#### Burnout Section
```http
GET /insights/dashboard/burnout
Authorization: Bearer <token>
```

#### Compensation Section
```http
GET /insights/dashboard/compensation
Authorization: Bearer <token>
```

#### Workforce Section
```http
GET /insights/dashboard/workforce
Authorization: Bearer <token>
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid JSON, missing required fields |
| 401 | Unauthorized | Missing/invalid token, expired session |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, unique constraint violation |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, database issue |

### Prisma Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| P2002 | Unique constraint violation | Use different value |
| P2003 | Foreign key constraint failed | Check referenced ID exists |
| P2025 | Record not found | Verify ID is correct |
| P2014 | Relation violation | Check relationship constraints |

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Burst**: 20 requests
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1644840000

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Filtering

Use query parameters for filtering:

```http
GET /engagement/grievances?status=open&severity=high&category=workload
GET /insights/retention-risk?riskLevel=high&departmentId=uuid
GET /employees?departmentId=uuid&employmentStatus=active
```

**Operators:**
- Exact match: `?status=active`
- Multiple values: `?status=active,pending`
- Date range: `?fromDate=2024-01-01&toDate=2024-01-31`
- Search: `?search=john` (fuzzy search)

---

## Sorting

Use `sort` parameter:

```http
GET /employees?sort=createdAt:desc
GET /engagement/surveys?sort=endDate:asc
```

**Format:** `field:direction`  
**Directions:** `asc`, `desc`

---

## Versioning

Current API version: **v1**

Version is included in URL:
```
/api/v1/employees
```

Future versions:
```
/api/v2/employees
```

---

## Webhooks (Future)

Planned webhook support for real-time updates:

**Events:**
- `employee.created`
- `survey.completed`
- `grievance.resolved`
- `retention.risk.detected`

**Payload:**
```json
{
  "event": "employee.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": { ... }
}
```

---

## SDKs (Future)

Planned SDK support:
- JavaScript/TypeScript
- Python
- Java
- Go

---

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Core HR modules

### v1.1.0 (Planned)
- Engagement module APIs
- Insights module APIs

### v1.2.0 (Future)
- Webhook support
- GraphQL endpoint
- Real-time subscriptions

---

**Last Updated**: 2026-02-14  
**Status**: Active Development
