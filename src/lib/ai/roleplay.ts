import Anthropic from "@anthropic-ai/sdk";
import type { RoleDefinition, PracticeMessage } from "@/types";

// Re-export for API routes that need both data + AI functions
export { PRACTICE_ROLES, ROLE_MAP } from "@/lib/practice-roles";

const anthropic = new Anthropic();

export function buildRoleplaySystemPrompt(
  role: RoleDefinition,
  scenario: { title: string; systemContext: string },
  userName?: string
): string {
  return `You are roleplaying as a character in a communication practice exercise for plant leaders in an industrial/manufacturing organization.

YOUR ROLE: ${role.label}
SCENARIO: ${scenario.title}

CHARACTER INSTRUCTIONS:
${scenario.systemContext}

BEHAVIORAL GUIDELINES:
- Stay fully in character at ALL times. Never break character.
- React realistically — push back, get emotional, be skeptical, or be difficult as your character would.
- Do NOT be overly agreeable or easy to convince. Make them work for it.
- Use language and concerns natural to someone in this role.
- Keep responses conversational — typically 2-4 sentences. Don't monologue.
- Respond to what was actually said, not what you think they meant.
- If they make a good point, acknowledge it naturally but don't cave immediately.
${userName ? `- The person you are speaking with is named ${userName}. Use their name occasionally.` : ""}

CRITICAL RULES:
- NEVER provide coaching, tips, or meta-commentary about the conversation.
- NEVER say things like "That's a good approach" or "You're handling this well."
- NEVER break the fourth wall or reference that this is a practice exercise.
- NEVER use asterisks for actions like *sighs* or *pauses*.
- Just BE the character and respond naturally.

Start by setting the scene briefly from your character's perspective, then wait for their response.`;
}

export function buildFeedbackPrompt(
  role: RoleDefinition,
  scenarioTitle: string,
  messages: PracticeMessage[]
): string {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "PLANT LEADER" : role.label.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  return `You are an executive communication coach analyzing a practice conversation.

The plant leader was practicing: "${scenarioTitle}"
They were speaking with someone playing the role of: ${role.label}

Here is the full transcript:

---
${transcript}
---

Provide coaching feedback in the following JSON format:
{
  "overall": "1-2 sentence overall assessment",
  "strengths": ["strength 1 with a specific quote example", "strength 2 with example"],
  "improvements": ["area 1 with specific suggestion", "area 2 with suggestion"],
  "ratings": {
    "clarity": <1-5>,
    "empathy": <1-5>,
    "assertiveness": <1-5>,
    "listening": <1-5>,
    "outcome_focus": <1-5>
  },
  "tip": "One powerful tip they can apply immediately in real conversations"
}

Be specific. Quote actual things they said. Be encouraging but honest. Rate generously for shorter conversations. Return ONLY valid JSON, no markdown.`;
}

export async function streamRoleplayResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  return anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });
}

export async function generateFeedback(
  role: RoleDefinition,
  scenarioTitle: string,
  messages: PracticeMessage[]
) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildFeedbackPrompt(role, scenarioTitle, messages),
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}
