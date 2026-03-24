import { NextRequest, NextResponse } from "next/server";
import { suggestConnections } from "@/lib/ai/connections";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { currentItem, allItems } = await request.json();

    if (!currentItem || !allItems) {
      return NextResponse.json(
        { error: "Missing required fields: currentItem, allItems" },
        { status: 400 }
      );
    }

    const connections = await suggestConnections(currentItem, allItems);
    return NextResponse.json({ connections });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("rate_limit")) {
      return NextResponse.json({ error: "Rate limit reached. Try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: `Failed to find connections: ${msg}` }, { status: 500 });
  }
}
