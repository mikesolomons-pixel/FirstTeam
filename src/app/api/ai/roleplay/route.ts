import { NextRequest } from "next/server";
import {
  buildRoleplaySystemPrompt,
  ROLE_MAP,
  streamRoleplayResponse,
} from "@/lib/ai/roleplay";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, roleKey, scenario, userName } = await request.json();

    const role = ROLE_MAP[roleKey];
    if (!role) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const systemPrompt = buildRoleplaySystemPrompt(role, scenario, userName);

    const stream = await streamRoleplayResponse(
      systemPrompt,
      messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(
                  new TextEncoder().encode(event.delta.text)
                );
              }
            }
          } catch {
            // stream error
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
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
