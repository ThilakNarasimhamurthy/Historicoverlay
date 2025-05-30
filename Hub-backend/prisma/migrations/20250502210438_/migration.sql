/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateOfBirth";

-- CreateTable
CREATE TABLE "Student" (
    "userId" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "specialization" TEXT[],
    "careerGoals" TEXT[],
    "dateOfBirth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "foundationYear" INTEGER NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "foundationYear" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
