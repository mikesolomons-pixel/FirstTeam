import { NextRequest } from "next/server";
import { generateFeedback, ROLE_MAP } from "@/lib/ai/roleplay";
import type { PracticeMessage } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { roleKey, scenarioTitle, messages } = await request.json();

    const role = ROLE_MAP[roleKey];
    if (!role) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const feedback = await generateFeedback(
      role,
      scenarioTitle,
      messages as PracticeMessage[]
    );

    return Response.json({ feedback });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    if (message.includes("rate_limit")) {
      return Response.json(
        { error: "Rate limited. Please wait a moment." },
        { status: 429 }
      );
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
