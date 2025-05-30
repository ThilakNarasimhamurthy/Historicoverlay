-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'DELETED';

-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'IN_APP';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'EVENT_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'WELCOME';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELED';

-- AlterEnum
ALTER TYPE "PlanType" ADD VALUE 'BASIC';

-- AlterEnum
ALTER TYPE "RegistrationStatus" ADD VALUE 'WAITLISTED';

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "department" TEXT,
ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "size" "CompanySize";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "EventParticipation" ADD COLUMN     "checkInTime" TIMESTAMP(3),
ADD COLUMN     "feedback" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "studentId" TEXT,
ALTER COLUMN "specialization" SET NOT NULL,
ALTER COLUMN "specialization" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "accreditations" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo" TEXT;

-- CreateIndex
CREATE INDEX "Company_companyName_idx" ON "Company"("companyName");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Event_creatorId_idx" ON "Event"("creatorId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "EventParticipation_userId_idx" ON "EventParticipation"("userId");

-- CreateIndex
CREATE INDEX "EventParticipation_eventId_idx" ON "EventParticipation"("eventId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_readStatus_idx" ON "Notification"("readStatus");

-- CreateIndex
CREATE INDEX "Notification_timestamp_idx" ON "Notification"("timestamp");

-- CreateIndex
CREATE INDEX "Student_specialization_idx" ON "Student"("specialization");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "University_institutionName_idx" ON "University"("institutionName");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
