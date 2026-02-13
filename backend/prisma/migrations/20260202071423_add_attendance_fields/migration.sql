/*
  Warnings:

  - Added the required column `updated_at` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "check_in" TIMESTAMP(3),
ADD COLUMN     "check_out" TIMESTAMP(3),
ADD COLUMN     "is_manual_entry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "overtime_hours" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "work_hours" DOUBLE PRECISION;
