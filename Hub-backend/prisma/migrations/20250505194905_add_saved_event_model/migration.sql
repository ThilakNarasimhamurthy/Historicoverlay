-- CreateTable
CREATE TABLE "SavedEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedEvent_userId_idx" ON "SavedEvent"("userId");

-- CreateIndex
CREATE INDEX "SavedEvent_eventId_idx" ON "SavedEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedEvent_userId_eventId_key" ON "SavedEvent"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "SavedEvent" ADD CONSTRAINT "SavedEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
