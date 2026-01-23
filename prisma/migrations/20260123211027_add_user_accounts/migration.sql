/*
  Warnings:

  - Added the required column `updatedAt` to the `VoteLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "openaiApiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Explanation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    CONSTRAINT "Explanation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Explanation" ("content", "createdAt", "description", "helpful", "id", "notHelpful", "topic", "updatedAt", "upvotes") SELECT "content", "createdAt", "description", "helpful", "id", "notHelpful", "topic", "updatedAt", "upvotes" FROM "Explanation";
DROP TABLE "Explanation";
ALTER TABLE "new_Explanation" RENAME TO "Explanation";
CREATE TABLE "new_VoteLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "explanationId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoteLog_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VoteLog" ("createdAt", "explanationId", "id", "ip", "voteType") SELECT "createdAt", "explanationId", "id", "ip", "voteType" FROM "VoteLog";
DROP TABLE "VoteLog";
ALTER TABLE "new_VoteLog" RENAME TO "VoteLog";
CREATE INDEX "VoteLog_ip_createdAt_idx" ON "VoteLog"("ip", "createdAt");
CREATE UNIQUE INDEX "VoteLog_ip_explanationId_key" ON "VoteLog"("ip", "explanationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
