import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check which activity badges a user qualifies for based on their actions.
 * Returns an array of badge keys they've earned.
 */
export async function getEarnedActivityBadgeKeys(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const earned: string[] = [];

  // Run all count queries in parallel
  const [
    challengeCount,
    storyCount,
    commentCount,
    voteSessionCount,
    brainstormCount,
    ideaCount,
    reactionCount,
    plantCount,
  ] = await Promise.all([
    supabase
      .from("challenges")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("stories")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("challenge_votes")
      .select("session_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("brainstorm_sessions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .then((r) => r.count ?? 0),

    supabase
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .then((r) => r.count ?? 0),

    // Cross-plant: count distinct plant_names from authors of content the user commented on
    supabase
      .from("comments")
      .select("parent_id, parent_type")
      .eq("author_id", userId)
      .then(async (r) => {
        if (!r.data || r.data.length === 0) return 0;
        const challengeIds = r.data
          .filter((c) => c.parent_type === "challenge")
          .map((c) => c.parent_id);
        const storyIds = r.data
          .filter((c) => c.parent_type === "story")
          .map((c) => c.parent_id);

        const plants = new Set<string>();

        if (challengeIds.length > 0) {
          const { data: challenges } = await supabase
            .from("challenges")
            .select("author_id, author:profiles(plant_name)")
            .in("id", challengeIds);
          challenges?.forEach((c) => {
            const author = c.author as unknown as { plant_name: string };
            if (author?.plant_name) plants.add(author.plant_name);
          });
        }

        if (storyIds.length > 0) {
          const { data: stories } = await supabase
            .from("stories")
            .select("author_id, author:profiles(plant_name)")
            .in("id", storyIds);
          stories?.forEach((s) => {
            const author = s.author as unknown as { plant_name: string };
            if (author?.plant_name) plants.add(author.plant_name);
          });
        }

        return plants.size;
      }),
  ]);

  // Check criteria
  if (challengeCount >= 1) earned.push("first-challenge");
  if (storyCount >= 5) earned.push("5-stories");
  if (commentCount >= 10) earned.push("10-comments");
  if (voteSessionCount >= 3) earned.push("3-votes");
  if (brainstormCount >= 1) earned.push("first-brainstorm");
  if (ideaCount >= 10) earned.push("10-ideas");
  if (reactionCount >= 5) earned.push("5-reactions");
  if (plantCount >= 3) earned.push("cross-plant");

  return earned;
}
