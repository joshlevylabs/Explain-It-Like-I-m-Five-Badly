import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { generateBadExplanation } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to use AI generation" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length === 0) {
      return NextResponse.json(
        { error: "Topic cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedTopic.length > 200) {
      return NextResponse.json(
        { error: "Topic is too long (max 200 characters)" },
        { status: 400 }
      );
    }

    // Get user's API key
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true },
    });

    if (!user?.openaiApiKey) {
      return NextResponse.json(
        { error: "Please add your OpenAI API key in Account Settings to use AI generation" },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(user.openaiApiKey);

    // Generate the bad explanation
    const explanation = await generateBadExplanation(trimmedTopic, apiKey);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Generate explanation error:", error);

    // Check for OpenAI-specific errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid API Key") || error.message.includes("Incorrect API key")) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your key in Account Settings." },
          { status: 400 }
        );
      }
      if (error.message.includes("Rate limit")) {
        return NextResponse.json(
          { error: "OpenAI rate limit reached. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes("insufficient_quota")) {
        return NextResponse.json(
          { error: "Your OpenAI account has insufficient credits." },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate explanation. Please try again." },
      { status: 500 }
    );
  }
}
