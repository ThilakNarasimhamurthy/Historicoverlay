/*
  Warnings:

  - You are about to drop the column `linkedEntity` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `linkedEntityId` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "linkedEntity",
DROP COLUMN "linkedEntityId";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "university" TEXT NOT NULL DEFAULT 'Unknown';

-- DropEnum
DROP TYPE "NotificationEntity";
