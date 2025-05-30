/*
  Warnings:

  - The values [UNIVERSITY_ADMIN,COMPANY_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `foundationYear` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `Organizer` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'UNIVERSITY', 'COMPANY', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Organizer" DROP CONSTRAINT "Organizer_userId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "foundationYear",
DROP COLUMN "organizationName",
ADD COLUMN     "accessLevel" TEXT NOT NULL DEFAULT 'FULL',
ADD COLUMN     "adminSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Organizer";

-- CreateTable
CREATE TABLE "University" (
    "userId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "foundationYear" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "website" TEXT,

    CONSTRAINT "University_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Company" (
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "foundationYear" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "website" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
