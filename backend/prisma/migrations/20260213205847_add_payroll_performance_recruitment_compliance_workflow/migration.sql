-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basic" DECIMAL(12,2) NOT NULL,
    "hra" DECIMAL(12,2) NOT NULL,
    "conveyance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "medical_allowance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "special_allowance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "professional_tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pf" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "esi" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_entries" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "gross_salary" DECIMAL(12,2) NOT NULL,
    "lop_days" INTEGER NOT NULL DEFAULT 0,
    "lop_deduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(12,2) NOT NULL,
    "net_salary" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_value" DECIMAL(10,2) NOT NULL,
    "achieved_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weightage" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "review_period" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "comments" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "review_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department_id" TEXT,
    "requirements" TEXT,
    "location" TEXT,
    "employment_type" TEXT,
    "min_salary" DECIMAL(12,2),
    "max_salary" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'open',
    "openings" INTEGER NOT NULL DEFAULT 1,
    "posted_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "resume_url" TEXT,
    "cover_letter" TEXT,
    "source" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing_records" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "filed_at" TIMESTAMP(3),
    "filed_by" TEXT,
    "amount" DECIMAL(12,2),
    "receipt_no" TEXT,
    "notes" TEXT,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_acknowledgements" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "policy_version" TEXT,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_acknowledgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "approver_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL DEFAULT 1,
    "comments" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "approval_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "approver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_name_key" ON "salary_structures"("name");

-- CreateIndex
CREATE INDEX "payroll_runs_status_idx" ON "payroll_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_month_year_key" ON "payroll_runs"("month", "year");

-- CreateIndex
CREATE INDEX "payroll_entries_employee_id_idx" ON "payroll_entries"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_entries_payroll_run_id_employee_id_key" ON "payroll_entries"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE INDEX "goals_employee_id_idx" ON "goals"("employee_id");

-- CreateIndex
CREATE INDEX "goals_status_idx" ON "goals"("status");

-- CreateIndex
CREATE INDEX "performance_reviews_employee_id_idx" ON "performance_reviews"("employee_id");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewer_id_idx" ON "performance_reviews"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_reviews_employee_id_review_period_key" ON "performance_reviews"("employee_id", "review_period");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_department_id_idx" ON "jobs"("department_id");

-- CreateIndex
CREATE INDEX "candidates_job_id_idx" ON "candidates"("job_id");

-- CreateIndex
CREATE INDEX "candidates_stage_idx" ON "candidates"("stage");

-- CreateIndex
CREATE INDEX "filing_records_type_idx" ON "filing_records"("type");

-- CreateIndex
CREATE INDEX "filing_records_status_idx" ON "filing_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "filing_records_type_period_key" ON "filing_records"("type", "period");

-- CreateIndex
CREATE INDEX "policy_acknowledgements_employee_id_idx" ON "policy_acknowledgements"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "policy_acknowledgements_employee_id_policy_name_key" ON "policy_acknowledgements"("employee_id", "policy_name");

-- CreateIndex
CREATE INDEX "approvals_requester_id_idx" ON "approvals"("requester_id");

-- CreateIndex
CREATE INDEX "approvals_approver_id_idx" ON "approvals"("approver_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_entity_type_entity_id_key" ON "approvals"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approval_steps_approver_id_idx" ON "approval_steps"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_steps_approval_id_step_number_key" ON "approval_steps"("approval_id", "step_number");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_salary_structure_id_fkey" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_records" ADD CONSTRAINT "filing_records_filed_by_fkey" FOREIGN KEY ("filed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
