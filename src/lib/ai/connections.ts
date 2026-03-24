import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function suggestConnections(
  currentItem: { type: string; title: string; description: string },
  allItems: { type: string; title: string; id: string; plant_name?: string }[]
): Promise<string> {
  const itemList = allItems
    .map((item) => `- [${item.type}] "${item.title}"${item.plant_name ? ` (${item.plant_name})` : ""} (id: ${item.id})`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an AI assistant for "First Team," a plant leadership collaboration platform. Find connections between this item and others in the system.

Current ${currentItem.type}:
Title: ${currentItem.title}
Description: ${currentItem.description}

Other items in the system:
${itemList}

Identify 2-4 related items and explain why they're connected. Focus on similar challenges, applicable best practices, or relevant brainstorm ideas. Format as bullet points with the item title and explanation of the connection.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "Unable to find connections.";
}
