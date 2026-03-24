export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  plant_name: string;
  role: string;
  joined_at: string;
}

export type ChallengeStatus = "open" | "in_progress" | "resolved";
export type ChallengePriority = "low" | "medium" | "high" | "critical";

export interface Challenge {
  id: string;
  author_id: string;
  title: string;
  description: string;
  status: ChallengeStatus;
  priority: ChallengePriority;
  tags: string[];
  resolution_summary: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  comment_count?: number;
  reaction_counts?: ReactionCounts;
}

export type StoryCategory =
  | "best_practice"
  | "win"
  | "lesson_learned"
  | "case_study";

export interface Story {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: StoryCategory;
  tags: string[];
  plant_name: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  comment_count?: number;
  reaction_counts?: ReactionCounts;
}

export type NewsType = "article" | "announcement" | "resource";

export interface NewsItem {
  id: string;
  author_id: string;
  title: string;
  url: string | null;
  body: string;
  type: NewsType;
  pinned: boolean;
  created_at: string;
  author?: Profile;
  reaction_counts?: ReactionCounts;
}

export type BrainstormStatus = "active" | "closed";

export interface BrainstormSession {
  id: string;
  author_id: string;
  title: string;
  description: string;
  status: BrainstormStatus;
  created_at: string;
  closed_at: string | null;
  author?: Profile;
  idea_count?: number;
  comment_count?: number;
}

export interface Idea {
  id: string;
  session_id: string;
  author_id: string;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
  votes: number;
  cluster_label: string | null;
  created_at: string;
  author?: Profile;
  voted_by_me?: boolean;
}

export type CommentParentType = "challenge" | "story" | "news" | "brainstorm";

export interface Comment {
  id: string;
  author_id: string;
  parent_type: CommentParentType;
  parent_id: string;
  body: string;
  reply_to_id: string | null;
  created_at: string;
  author?: Profile;
  replies?: Comment[];
}

export type ReactionEmoji =
  | "wrench"
  | "lightbulb"
  | "hardhat"
  | "fire"
  | "thumbsup";

export interface Reaction {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emoji: ReactionEmoji;
  created_at: string;
}

export type ReactionCounts = Partial<Record<ReactionEmoji, number>>;

export interface AISummary {
  id: string;
  target_type: string;
  target_id: string;
  summary: string;
  generated_at: string;
}

export interface ActivityItem {
  id: string;
  type: "challenge" | "story" | "news" | "brainstorm" | "comment";
  title: string;
  preview: string;
  author: Profile;
  created_at: string;
  link: string;
}

export interface PresenceUser {
  id: string;
  full_name: string;
  plant_name: string;
  avatar_url: string | null;
  current_page?: string;
  online_at: string;
}
