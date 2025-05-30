/*
  Warnings:

  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "LinkedEntityType" AS ENUM ('POST', 'COMMENT', 'USER', 'EVENT', 'COURSE', 'MESSAGE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LIKE';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT';
ALTER TYPE "NotificationType" ADD VALUE 'FOLLOW';
ALTER TYPE "NotificationType" ADD VALUE 'MENTION';
ALTER TYPE "NotificationType" ADD VALUE 'TAG';
ALTER TYPE "NotificationType" ADD VALUE 'SHARE';
ALTER TYPE "NotificationType" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "linkedEntityId" TEXT,
ADD COLUMN     "linkedEntityType" "LinkedEntityType",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "sender" JSONB,
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_linkedEntityId_idx" ON "Notification"("linkedEntityId");
