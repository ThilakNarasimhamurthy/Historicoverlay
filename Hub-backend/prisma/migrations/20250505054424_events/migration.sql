-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "EventParticipation" ADD COLUMN     "rating" INTEGER;

-- CreateTable
CREATE TABLE "LikedEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LikedEvent_userId_idx" ON "LikedEvent"("userId");

-- CreateIndex
CREATE INDEX "LikedEvent_eventId_idx" ON "LikedEvent"("eventId");

-- CreateIndex
CREATE INDEX "LikedEvent_isExternal_idx" ON "LikedEvent"("isExternal");

-- CreateIndex
CREATE UNIQUE INDEX "LikedEvent_userId_eventId_key" ON "LikedEvent"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_tags_idx" ON "Event"("tags");

-- CreateIndex
CREATE INDEX "EventParticipation_rsvpStatus_idx" ON "EventParticipation"("rsvpStatus");

-- CreateIndex
CREATE INDEX "EventParticipation_registrationStatus_idx" ON "EventParticipation"("registrationStatus");

-- CreateIndex
CREATE INDEX "Student_university_idx" ON "Student"("university");

-- CreateIndex
CREATE INDEX "Student_graduationYear_idx" ON "Student"("graduationYear");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "LikedEvent" ADD CONSTRAINT "LikedEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
