-- AlterTable
ALTER TABLE "Application" ADD COLUMN "cvVersion" TEXT;

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "fullName" TEXT,
    "headline" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "defaultCountry" TEXT,
    "defaultCity" TEXT,
    "defaultSource" TEXT,
    "followUpDays" INTEGER NOT NULL DEFAULT 14,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 10,
    "cvList" TEXT,
    "updatedAt" DATETIME NOT NULL
);
