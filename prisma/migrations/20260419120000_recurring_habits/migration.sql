-- CreateTable
CREATE TABLE "recurring_habits" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "repeatType" TEXT NOT NULL,
    "repeatDays" JSONB,
    "reminderTime" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_habits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_habits_userId_idx" ON "recurring_habits"("userId");

-- AddForeignKey
ALTER TABLE "recurring_habits" ADD CONSTRAINT "recurring_habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
