import { NextRequest, NextResponse } from "next/server";
import { draftWriteup } from "@/lib/ai/drafts";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { roughNotes, context } = await request.json();

    if (!roughNotes || !context) {
      return NextResponse.json(
        { error: "Missing required fields: roughNotes, context" },
        { status: 400 }
      );
    }

    const draft = await draftWriteup(roughNotes, context);
    return NextResponse.json({ draft });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("rate_limit")) {
      return NextResponse.json({ error: "Rate limit reached. Try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: `Failed to generate draft: ${msg}` }, { status: 500 });
  }
}
