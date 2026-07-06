-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
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
    "noResponseDays" INTEGER NOT NULL DEFAULT 7,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 10,
    "cvList" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("cvList", "defaultCity", "defaultCountry", "defaultSource", "email", "followUpDays", "fullName", "headline", "id", "linkedin", "phone", "portfolio", "updatedAt", "weeklyGoal") SELECT "cvList", "defaultCity", "defaultCountry", "defaultSource", "email", "followUpDays", "fullName", "headline", "id", "linkedin", "phone", "portfolio", "updatedAt", "weeklyGoal" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
