import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  checkSubmissionRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const explanations = await prisma.explanation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(explanations);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Check submission rate limit
  const { allowed, remaining, resetAt } = await checkSubmissionRateLimit(ip);
  if (!allowed) {
    return rateLimitResponse(
      remaining,
      resetAt,
      "Too many submissions today. Please try again tomorrow."
    );
  }

  const body = await request.json();
  const { topic, content } = body;

  if (!topic || !content) {
    return NextResponse.json(
      { error: "Topic and content are required" },
      { status: 400 }
    );
  }

  if (typeof topic !== "string" || typeof content !== "string") {
    return NextResponse.json(
      { error: "Topic and content must be strings" },
      { status: 400 }
    );
  }

  // Create explanation and log the submission in a transaction
  const [explanation] = await prisma.$transaction([
    prisma.explanation.create({
      data: {
        topic: topic.trim(),
        content: content.trim(),
      },
    }),
    prisma.submissionLog.create({
      data: { ip },
    }),
  ]);

  return NextResponse.json(
    {
      ...explanation,
      rateLimit: {
        remaining: remaining - 1,
        resetAt: resetAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
