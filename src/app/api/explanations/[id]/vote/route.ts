import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  checkVoteRateLimit,
  hasVoted,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(request);

  // Check if explanation exists
  const explanation = await prisma.explanation.findUnique({
    where: { id },
  });

  if (!explanation) {
    return NextResponse.json(
      { error: "Explanation not found" },
      { status: 404 }
    );
  }

  // Parse request body
  const body = await request.json();
  const { voteType } = body;

  if (!voteType || !["helpful", "notHelpful"].includes(voteType)) {
    return NextResponse.json(
      { error: "Invalid vote type. Must be 'helpful' or 'notHelpful'" },
      { status: 400 }
    );
  }

  // Check if user has already voted on this explanation
  const { hasVoted: alreadyVoted, voteType: previousVoteType } = await hasVoted(ip, id);
  if (alreadyVoted) {
    return NextResponse.json(
      {
        error: "You have already voted on this explanation",
        previousVoteType,
      },
      { status: 409 }
    );
  }

  // Check vote rate limit
  const { allowed, remaining, resetAt } = await checkVoteRateLimit(ip);
  if (!allowed) {
    return rateLimitResponse(
      remaining,
      resetAt,
      "Too many votes. Please wait before voting again."
    );
  }

  // Update the explanation with the new vote and log it
  const updateField = voteType === "helpful" ? "helpful" : "notHelpful";

  const [updatedExplanation] = await prisma.$transaction([
    prisma.explanation.update({
      where: { id },
      data: {
        [updateField]: { increment: 1 },
      },
    }),
    prisma.voteLog.create({
      data: {
        ip,
        explanationId: id,
        voteType,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    helpful: updatedExplanation.helpful,
    notHelpful: updatedExplanation.notHelpful,
    rateLimit: {
      remaining: remaining - 1,
      resetAt: resetAt.toISOString(),
    },
  });
}
