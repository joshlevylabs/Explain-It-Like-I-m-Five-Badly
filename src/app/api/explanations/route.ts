import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const explanations = await prisma.explanation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(explanations);
}

export async function POST(request: NextRequest) {
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

  const explanation = await prisma.explanation.create({
    data: {
      topic: topic.trim(),
      content: content.trim(),
    },
  });

  return NextResponse.json(explanation, { status: 201 });
}
