import { NextRequest, NextResponse } from "next/server";
import { summarizeContent } from "@/lib/ai/summarize";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { type, title, content, comments } = await request.json();

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, content" },
        { status: 400 }
      );
    }

    const summary = await summarizeContent(type, title, content, comments || []);
    return NextResponse.json({ summary });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("rate_limit")) {
      return NextResponse.json({ error: "Rate limit reached. Try again in a moment." }, { status: 429 });
    }
    if (msg.includes("authentication") || msg.includes("invalid x-api-key")) {
      return NextResponse.json({ error: "AI service not configured. Check ANTHROPIC_API_KEY." }, { status: 401 });
    }
    return NextResponse.json({ error: `Failed to summarize: ${msg}` }, { status: 500 });
  }
}
