import { prisma } from "./prisma";

// Rate limit configurations
export const RATE_LIMITS = {
  SUBMISSIONS_PER_DAY: 5,
  VOTES_PER_MINUTE: 10,
} as const;

// Get client IP from request headers
export function getClientIp(request: Request): string {
  // Check common proxy headers first
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback for development
  return "127.0.0.1";
}

// Check submission rate limit (per day)
export async function checkSubmissionRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Count submissions from this IP today
  const submissionCount = await prisma.submissionLog.count({
    where: {
      ip,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const remaining = Math.max(0, RATE_LIMITS.SUBMISSIONS_PER_DAY - submissionCount);
  const allowed = submissionCount < RATE_LIMITS.SUBMISSIONS_PER_DAY;

  return {
    allowed,
    remaining,
    resetAt: endOfDay,
  };
}

// Log a submission
export async function logSubmission(ip: string): Promise<void> {
  await prisma.submissionLog.create({
    data: { ip },
  });
}

// Check vote rate limit (per minute)
export async function checkVoteRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);

  // Count votes from this IP in the last minute
  const voteCount = await prisma.voteLog.count({
    where: {
      ip,
      createdAt: {
        gte: oneMinuteAgo,
      },
    },
  });

  const remaining = Math.max(0, RATE_LIMITS.VOTES_PER_MINUTE - voteCount);
  const allowed = voteCount < RATE_LIMITS.VOTES_PER_MINUTE;

  return {
    allowed,
    remaining,
    resetAt: oneMinuteFromNow,
  };
}

// Log a vote
export async function logVote(ip: string, explanationId: string, voteType: string): Promise<void> {
  await prisma.voteLog.create({
    data: { ip, explanationId, voteType },
  });
}

// Check if user has already voted on an explanation
export async function hasVoted(
  ip: string,
  explanationId: string
): Promise<{ hasVoted: boolean; voteType: string | null }> {
  const existingVote = await prisma.voteLog.findFirst({
    where: {
      ip,
      explanationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    hasVoted: !!existingVote,
    voteType: existingVote?.voteType || null,
  };
}

// Rate limit error response helper
export function rateLimitResponse(
  remaining: number,
  resetAt: Date,
  message: string
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      remaining,
      resetAt: resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetAt.toISOString(),
        "Retry-After": Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}
