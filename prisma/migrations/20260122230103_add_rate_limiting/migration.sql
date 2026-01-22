-- CreateTable
CREATE TABLE "SubmissionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VoteLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "explanationId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteLog_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SubmissionLog_ip_createdAt_idx" ON "SubmissionLog"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "VoteLog_ip_createdAt_idx" ON "VoteLog"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "VoteLog_ip_explanationId_idx" ON "VoteLog"("ip", "explanationId");
