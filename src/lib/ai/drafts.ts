import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function draftWriteup(
  roughNotes: string,
  context: { type: string; title?: string }
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an AI assistant for "First Team," a plant leadership collaboration platform. Help draft a polished ${context.type} writeup from these rough notes.

${context.title ? `Title: ${context.title}\n` : ""}
Rough notes:
${roughNotes}

Write a clear, well-structured ${context.type} that:
- Opens with the key takeaway or problem statement
- Uses short paragraphs and clear headings if needed
- Includes specific details and outcomes where mentioned
- Ends with actionable next steps or recommendations
- Maintains a professional but approachable tone (these are plant leaders talking to peers)

Keep it concise — plant leaders are busy.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "Unable to generate draft.";
}
