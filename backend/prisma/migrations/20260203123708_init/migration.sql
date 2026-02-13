-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "leave_type" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "rejection_reason" TEXT;
