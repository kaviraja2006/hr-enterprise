# HR Enterprise - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the HR Enterprise system, covering unit tests, integration tests, and end-to-end tests for both existing and new modules.

**Testing Philosophy**: Test behavior, not implementation. Focus on user workflows and business logic.

---

## Testing Pyramid

```
                    ┌─────────────────────┐
                    │   E2E Tests         │  (10%)
                    │   - User journeys   │
                    │   - Critical flows  │
                   ┌┴─────────────────────┴┐
                   │  Integration Tests     │  (20%)
                   │  - API endpoints       │
                   │  - Database operations │
                  ┌┴────────────────────────┴┐
                  │    Unit Tests             │  (70%)
                  │    - Services             │
                  │    - Utilities            │
                  │    - Hooks                │
                  └───────────────────────────┘
```

---

## Backend Testing Strategy

### 1. Unit Tests (70%)

**Scope**: Services, utilities, DTOs, business logic

**Tools**:
- **Jest**: Test runner and assertion library
- **@nestjs/testing**: NestJS testing utilities
- **jest-mock-extended**: Type-safe mocking

**Coverage Targets**:
- Services: 90%+ coverage
- Utilities: 100% coverage
- DTOs: Validation logic covered

**Example Test Structure**:

```typescript
// engagement.service.spec.ts
describe('EngagementService', () => {
  let service: EngagementService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<EngagementService>(EngagementService);
    prisma = module.get(PrismaService);
  });

  describe('calculateEngagementScore', () => {
    it('should calculate score from survey responses', async () => {
      // Arrange
      const mockResponses = [
        { ratingValue: 4 },
        { ratingValue: 5 },
        { ratingValue: 3 },
      ];
      prisma.surveyResponse.findMany.mockResolvedValue(mockResponses as any);

      // Act
      const score = await service.calculateEngagementScore('employee-uuid');

      // Assert
      expect(score).toBe(80); // (4+5+3)/3 * 20
    });

    it('should handle no responses', async () => {
      prisma.surveyResponse.findMany.mockResolvedValue([]);

      const score = await service.calculateEngagementScore('employee-uuid');

      expect(score).toBe(0);
    });
  });

  describe('predictRetentionRisk', () => {
    it('should flag high risk for low satisfaction + no raise', async () => {
      // Arrange
      const mockEmployee = {
        id: 'emp-1',
        lastRaiseDate: new Date('2022-01-01'),
        salary: 50000,
      };
      const mockMetrics = { satisfactionScore: 30 };
      
      prisma.employee.findUnique.mockResolvedValue(mockEmployee as any);
      prisma.engagementMetric.findFirst.mockResolvedValue(mockMetrics as any);

      // Act
      const risk = await service.predictRetentionRisk('emp-1');

      // Assert
      expect(risk.score).toBeGreaterThan(70);
      expect(risk.level).toBe('high');
    });
  });
});
```

### 2. Integration Tests (20%)

**Scope**: API endpoints, database operations, external services

**Tools**:
- **@nestjs/testing**: Module testing
- **supertest**: HTTP assertions
- **testcontainers**: PostgreSQL for integration tests

**Test Database Setup**:

```typescript
// test/setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withDatabase('hr_test')
    .start();
  
  process.env.DATABASE_URL = container.getConnectionUri();
});

afterAll(async () => {
  await container.stop();
});
```

**API Integration Test Example**:

```typescript
// engagement.controller.spec.ts
describe('EngagementController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  describe('POST /engagement/surveys', () => {
    it('should create a new survey', async () => {
      const surveyData = {
        title: 'Test Survey',
        type: 'satisfaction',
        questions: [
          { question: 'Q1?', type: 'rating', category: 'test' }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/engagement/surveys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(surveyData)
        .expect(201);

      expect(response.body.data.title).toBe('Test Survey');
      expect(response.body.data.questions).toHaveLength(1);

      // Verify database
      const dbSurvey = await prisma.survey.findUnique({
        where: { id: response.body.data.id }
      });
      expect(dbSurvey).toBeDefined();
    });

    it('should reject invalid survey data', async () => {
      await request(app.getHttpServer())
        .post('/engagement/surveys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '' }) // Invalid: empty title
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/engagement/surveys')
        .send({ title: 'Test' })
        .expect(401);
    });

    it('should check permissions', async () => {
      await request(app.getHttpServer())
        .post('/engagement/surveys')
        .set('Authorization', `Bearer ${employeeToken}`) // No permission
        .send({ title: 'Test' })
        .expect(403);
    });
  });

  describe('Survey response submission', () => {
    it('should allow anonymous response', async () => {
      const survey = await prisma.survey.create({
        data: { /* ... */ }
      });

      const response = await request(app.getHttpServer())
        .post(`/engagement/surveys/${survey.id}/responses`)
        .send({
          answers: [
            { questionId: 'q1', answer: '5', ratingValue: 5 }
          ]
        })
        .expect(201);

      expect(response.body.data.completed).toBe(true);
    });

    it('should prevent duplicate responses for identified survey', async () => {
      // Submit once
      await request(app.getHttpServer())
        .post(`/engagement/surveys/${survey.id}/responses`)
        .set('Authorization', `Bearer ${token}`)
        .send({ answers: [...] })
        .expect(201);

      // Try to submit again
      await request(app.getHttpServer())
        .post(`/engagement/surveys/${survey.id}/responses`)
        .set('Authorization', `Bearer ${token}`) // Same user
        .send({ answers: [...] })
        .expect(409); // Conflict
    });
  });
});
```

### 3. End-to-End Tests (10%)

**Scope**: Complete user workflows, cross-module interactions

**Tools**:
- **Playwright**: Browser automation
- **@playwright/test**: Test runner

**Critical Workflows to Test**:

```typescript
// e2e/engagement.spec.ts
test.describe('Engagement Module E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await loginAsHRManager(page);
  });

  test('complete survey workflow', async ({ page }) => {
    // 1. Create survey
    await page.click('text=Engagement');
    await page.click('text=Surveys');
    await page.click('text=Create Survey');
    
    await page.fill('[name="title"]', 'Q1 2024 Satisfaction');
    await page.selectOption('[name="type"]', 'satisfaction');
    
    // Add question
    await page.click('text=Add Question');
    await page.fill('[name="questions[0].question"]', 'How satisfied are you?');
    await page.selectOption('[name="questions[0].type"]', 'rating');
    
    await page.click('text=Create Survey');
    await expect(page.locator('text=Q1 2024 Satisfaction')).toBeVisible();

    // 2. Activate survey
    await page.click('text=Activate');
    await expect(page.locator('text=Active')).toBeVisible();

    // 3. Submit response as employee
    await logout(page);
    await loginAsEmployee(page);
    
    await page.click('text=Surveys');
    await page.click('text=Q1 2024 Satisfaction');
    await page.click('text=Start Survey');
    await page.click('[aria-label="Rate 5 stars"]');
    await page.click('text=Submit');
    
    await expect(page.locator('text=Thank you')).toBeVisible();

    // 4. View analytics as HR
    await logout(page);
    await loginAsHRManager(page);
    
    await page.click('text=Surveys');
    await page.click('text=Q1 2024 Satisfaction');
    await page.click('text=Analytics');
    
    await expect(page.locator('text=Response Rate')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
  });

  test('grievance resolution workflow', async ({ page }) => {
    // 1. Employee submits grievance
    await logout(page);
    await loginAsEmployee(page);
    
    await page.click('text=Engagement');
    await page.click('text=Grievances');
    await page.click('text=Submit Grievance');
    
    await page.selectOption('[name="category"]', 'workload');
    await page.selectOption('[name="severity"]', 'high');
    await page.fill('[name="description"]', 'Excessive workload affecting health');
    await page.click('text=Submit');
    
    await expect(page.locator('text=Submitted successfully')).toBeVisible();

    // 2. HR manager assigns and resolves
    await logout(page);
    await loginAsHRManager(page);
    
    await page.click('text=Grievances');
    await page.click('text=Excessive workload');
    await page.selectOption('[name="assignedTo"]', 'manager-uuid');
    await page.click('text=Assign');
    
    await page.fill('[name="resolution"]', 'Redistributed tasks across team');
    await page.click('text=Resolve');
    
    await expect(page.locator('text=Resolved')).toBeVisible();

    // 3. Employee sees resolution
    await logout(page);
    await loginAsEmployee(page);
    
    await page.click('text=Grievances');
    await expect(page.locator('text=Redistributed tasks')).toBeVisible();
  });
});
```

---

## Frontend Testing Strategy

### 1. Unit Tests (Components & Hooks)

**Tools**:
- **Vitest**: Test runner (faster than Jest)
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interactions
- **@testing-library/react-hooks**: Hook testing

**Component Test Example**:

```typescript
// SurveyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyCard } from './SurveyCard';

describe('SurveyCard', () => {
  const mockSurvey = {
    id: '1',
    title: 'Q1 Satisfaction Survey',
    status: 'active',
    responseCount: 45,
    totalEmployees: 60,
    responseRate: 75,
    endDate: '2024-01-31',
  };

  it('renders survey information correctly', () => {
    render(<SurveyCard survey={mockSurvey} />);
    
    expect(screen.getByText('Q1 Satisfaction Survey')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('45/60 responses')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('calls onActivate when activate button clicked', () => {
    const mockActivate = vi.fn();
    const draftSurvey = { ...mockSurvey, status: 'draft' };
    
    render(<SurveyCard survey={draftSurvey} onActivate={mockActivate} />);
    
    fireEvent.click(screen.getByText('Activate'));
    expect(mockActivate).toHaveBeenCalledWith('1');
  });

  it('displays closed status for past end date', () => {
    const closedSurvey = { 
      ...mockSurvey, 
      status: 'active',
      endDate: '2023-01-01' // Past date
    };
    
    render(<SurveyCard survey={closedSurvey} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
```

**Hook Test Example**:

```typescript
// useSurveys.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSurveys } from './useSurveys';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSurveys', () => {
  it('fetches surveys successfully', async () => {
    const { result } = renderHook(() => useSurveys(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].title).toBe('Q1 Survey');
  });

  it('handles error state', async () => {
    server.use(
      rest.get('/api/engagement/surveys', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useSurveys(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('caches data correctly', async () => {
    const queryClient = new QueryClient();
    const wrapper = createWrapperWithClient(queryClient);

    const { result } = renderHook(() => useSurveys(), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Second render should use cache
    const { result: result2 } = renderHook(() => useSurveys(), { wrapper });
    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.data).toEqual(result.current.data);
  });
});
```

### 2. Integration Tests

**Scope**: Component interactions, context providers, routing

```typescript
// SurveyManagement.integration.test.tsx
describe('Survey Management Integration', () => {
  it('completes full survey creation flow', async () => {
    render(
      <TestProviders>
        <SurveyManagementPage />
      </TestProviders>
    );

    // Open create modal
    await userEvent.click(screen.getByText('Create Survey'));
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Title'), 'New Survey');
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'satisfaction');
    
    // Add question
    await userEvent.click(screen.getByText('Add Question'));
    await userEvent.type(screen.getByPlaceholderText('Question text'), 'How are you?');
    
    // Submit
    await userEvent.click(screen.getByText('Create'));
    
    // Verify in list
    await waitFor(() => {
      expect(screen.getByText('New Survey')).toBeInTheDocument();
    });
  });
});
```

### 3. Visual Regression Tests

**Tools**: Chromatic, Storybook

**Components to Visual Test**:
- SurveyCard (different states)
- EngagementKpiCards
- RiskMeter
- CultureRadar
- All chart components

---

## Test Data Management

### Fixtures

```typescript
// test/fixtures/surveys.ts
export const surveyFixtures = {
  draft: {
    id: 'survey-1',
    title: 'Draft Survey',
    status: 'draft',
    questions: [],
  },
  active: {
    id: 'survey-2',
    title: 'Active Survey',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    questions: [
      {
        id: 'q1',
        question: 'How satisfied?',
        type: 'rating',
        category: 'satisfaction',
      }
    ],
  },
  completed: {
    id: 'survey-3',
    title: 'Completed Survey',
    status: 'closed',
    responseCount: 50,
    totalEmployees: 60,
  },
};

export const engagementMetricFixtures = {
  highPerformer: {
    employeeId: 'emp-1',
    satisfactionScore: 90,
    engagementScore: 85,
    burnoutRisk: 'low',
  },
  atRisk: {
    employeeId: 'emp-2',
    satisfactionScore: 40,
    engagementScore: 35,
    burnoutRisk: 'high',
  },
};
```

### Database Seeding for Tests

```typescript
// test/seed.ts
export async function seedTestData(prisma: PrismaClient) {
  // Create test departments
  const engineering = await prisma.department.create({
    data: { name: 'Engineering' }
  });

  // Create test employees
  const employees = await prisma.employee.createMany({
    data: [
      { firstName: 'John', lastName: 'Doe', departmentId: engineering.id },
      { firstName: 'Jane', lastName: 'Smith', departmentId: engineering.id },
    ]
  });

  // Create test surveys
  await prisma.survey.create({
    data: {
      title: 'Test Survey',
      type: 'satisfaction',
      status: 'active',
      questions: {
        create: [
          { question: 'Q1', type: 'rating', category: 'test' }
        ]
      }
    }
  });

  return { engineering, employees };
}
```

---

## Performance Testing

### Backend Performance

**Tools**: k6, Artillery

**Scenarios**:

```javascript
// load-test.js (k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:3002/api/engagement/surveys', {
    headers: {
      Authorization: `Bearer ${__ENV.API_TOKEN}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Metrics to Monitor**:
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Database query performance
- Memory usage
- CPU utilization

### Frontend Performance

**Tools**: Lighthouse, Web Vitals

**Metrics**:
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.8s
- Cumulative Layout Shift (CLS) < 0.1

---

## Security Testing

### Vulnerability Scanning

**Tools**:
- **npm audit**: Dependency vulnerabilities
- **Snyk**: Continuous security monitoring
- **OWASP ZAP**: Web application security scanner

### Penetration Testing

**Areas to Test**:
- Authentication bypass
- SQL injection (Prisma protects, but verify)
- XSS in survey responses
- CSRF protection
- IDOR (Insecure Direct Object Reference)
- Mass assignment vulnerabilities

```typescript
// security.test.ts
describe('Security Tests', () => {
  it('should prevent SQL injection in search', async () => {
    const maliciousQuery = "'; DROP TABLE employees; --";
    
    const response = await request(app.getHttpServer())
      .get(`/employees?search=${encodeURIComponent(maliciousQuery)}`)
      .set('Authorization', `Bearer ${token}`);
    
    // Should not crash or delete data
    expect(response.status).toBe(200);
    
    // Verify table still exists
    const count = await prisma.employee.count();
    expect(count).toBeGreaterThan(0);
  });

  it('should prevent XSS in survey responses', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    await request(app.getHttpServer())
      .post(`/engagement/surveys/${surveyId}/responses`)
      .send({
        answers: [{ questionId: 'q1', answer: xssPayload }]
      })
      .expect(201);
    
    // Verify stored answer is sanitized
    const response = await prisma.surveyAnswer.findFirst({
      where: { answer: xssPayload }
    });
    
    expect(response?.answer).not.toContain('<script>');
  });

  it('should enforce authorization on resources', async () => {
    // Employee A tries to access Employee B's grievance
    const grievance = await prisma.grievance.create({
      data: { employeeId: 'employee-b', ... }
    });
    
    await request(app.getHttpServer())
      .get(`/engagement/grievances/${grievance.id}`)
      .set('Authorization', `Bearer ${employeeAToken}`)
      .expect(403);
  });
});
```

---

## Accessibility Testing

**Tools**:
- **axe-core**: Automated accessibility testing
- **@testing-library/jest-dom**: Accessibility matchers
- Manual testing with screen readers

**Requirements**:
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

```typescript
// accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SurveyForm } from './SurveyForm';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('SurveyForm should have no accessibility violations', async () => {
    const { container } = render(<SurveyForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', async () => {
    render(<SurveyForm />);
    
    // Tab through form
    await userEvent.tab();
    expect(screen.getByLabelText('Title')).toHaveFocus();
    
    await userEvent.tab();
    expect(screen.getByLabelText('Type')).toHaveFocus();
    
    // Submit with Enter
    await userEvent.tab(); // Move to submit button
    await userEvent.keyboard('{Enter}');
    
    // Should trigger submit
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

---

## Test Environments

### Environment Matrix

| Environment | Purpose | Data | Frequency |
|------------|---------|------|-----------|
| Unit Test | Fast feedback | Mocked | Every commit |
| Integration | API testing | Test DB | Every commit |
| E2E | User workflows | Seeded DB | Every PR |
| Staging | Pre-prod | Anonymized prod | Pre-release |
| Performance | Load testing | Large dataset | Weekly |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run backend unit tests
        run: cd backend && pnpm test:unit
        
      - name: Run frontend unit tests
        run: cd frontend && pnpm test:unit
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
    steps:
      - uses: actions/checkout@v3
      
      - name: Run integration tests
        run: cd backend && pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/hr_test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Playwright
        run: cd frontend && pnpm exec playwright install
        
      - name: Run E2E tests
        run: cd frontend && pnpm test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## Test Coverage Goals

### Current vs Target

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| Auth | 85% | 90% | High |
| Employees | 80% | 90% | High |
| Engagement (New) | 0% | 85% | Critical |
| Insights (New) | 0% | 85% | Critical |
| Frontend Components | 60% | 80% | Medium |

---

## Testing Checklist

### Before Release

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing for critical paths
- [ ] No critical or high security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Test coverage meets targets
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness tested

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [k6 Load Testing](https://k6.io/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**Last Updated**: 2026-02-14  
**Status**: Active Development
