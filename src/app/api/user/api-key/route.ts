import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true },
    });

    return NextResponse.json({
      hasApiKey: !!user?.openaiApiKey,
    });
  } catch (error) {
    console.error("API key fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Basic validation for OpenAI API key format
    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid API key format. OpenAI keys start with 'sk-'" },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedKey = encrypt(apiKey);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { openaiApiKey: encryptedKey },
    });

    return NextResponse.json({ message: "API key saved successfully" });
  } catch (error) {
    console.error("API key update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { openaiApiKey: null },
    });

    return NextResponse.json({ message: "API key removed successfully" });
  } catch (error) {
    console.error("API key delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
