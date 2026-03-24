import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function summarizeContent(
  type: string,
  title: string,
  content: string,
  comments: string[]
): Promise<string> {
  const commentSection =
    comments.length > 0
      ? `\n\nDiscussion (${comments.length} comments):\n${comments.join("\n")}`
      : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an AI assistant for "First Team," a collaboration platform for plant leaders in an industrial organization. Summarize the following ${type} concisely for busy leaders. Focus on key points, decisions made, and action items.

Title: ${title}

Content:
${content}${commentSection}

Provide a clear, actionable summary in 3-5 bullet points. Use plain language. If there are unresolved questions or disagreements, note them.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "Unable to generate summary.";
}
