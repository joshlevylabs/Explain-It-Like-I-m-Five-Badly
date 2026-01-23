/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Explanation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VoteLog` table. All the data in the column will be lost.

*/
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
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Explanation" ("content", "createdAt", "description", "id", "topic", "updatedAt", "upvotes") SELECT "content", "createdAt", "description", "id", "topic", "updatedAt", "upvotes" FROM "Explanation";
DROP TABLE "Explanation";
ALTER TABLE "new_Explanation" RENAME TO "Explanation";
CREATE TABLE "new_VoteLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "explanationId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteLog_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VoteLog" ("createdAt", "explanationId", "id", "ip", "voteType") SELECT "createdAt", "explanationId", "id", "ip", "voteType" FROM "VoteLog";
DROP TABLE "VoteLog";
ALTER TABLE "new_VoteLog" RENAME TO "VoteLog";
CREATE INDEX "VoteLog_ip_createdAt_idx" ON "VoteLog"("ip", "createdAt");
CREATE INDEX "VoteLog_ip_explanationId_idx" ON "VoteLog"("ip", "explanationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
