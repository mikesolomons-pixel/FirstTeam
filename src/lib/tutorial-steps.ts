export interface TutorialStep {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  icon: string;
  color: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to First Team",
    subtitle: "One team. Every plant. No walls.",
    body: `This isn't just an app — it's a living product that your cohort will design, build, and own together.

The idea is simple: what does it actually mean for plant leaders across the organization to operate as one team? Not in theory — in practice. This platform is where you'll make that real.

Everything you see here was built to demonstrate what a First Team platform could look like. But here's the key: in your cohort, you'll build your own version from scratch — designed around what matters most to your group.`,
    icon: "Rocket",
    color: "steel",
  },
  {
    id: "context",
    title: "How This Works with Your Cohort",
    subtitle: "A 3-month sprint-based program",
    body: `Your leadership development cohort will work through three sprints over roughly three months. Each sprint includes:

• A Leadership Lab — an intensive working session (in person or virtual) where the cohort tackles real problems together
• Sprint work — between labs, you'll use this platform to collaborate, share, and drive outcomes
• Coaching — individual coaching and 360 feedback run on a parallel track

In Sprint 1, you'll design this platform together. What should be in it? What connects you as a first team? What do you need from each other?

In Sprint 2, the platform comes alive with real content — your challenges, your stories, your benchmarks. You'll start seeing patterns and driving cross-plant collaboration.

By Sprint 3, you'll have concrete examples of where working as a first team has driven real outcomes. The cultural shift will already be underway.`,
    icon: "Calendar",
    color: "forge",
  },
  {
    id: "why",
    title: "Why Build a Product Together?",
    subtitle: "It's not about the tech — it's about the thinking",
    body: `Building this platform together does three things at once:

1. AI Fluency — You'll gain hands-on experience with AI tools in a practical, low-stakes environment. This fluency transfers directly to how you drive efficiency and innovation at your plants.

2. Product Design Mindset — More and more, leaders need to think like product designers: Who is this for? What problem does it solve? Is it working? Should we iterate? These skills apply far beyond this app.

3. Collective Intelligence — The real magic happens when ideas flow across plants. Your challenges become shared challenges. Your wins become shared playbooks. Your benchmarks create healthy transparency.

The app isn't the goal — the collaboration it enables is. Think of it as a physical representation of what your first team does together.`,
    icon: "Lightbulb",
    color: "ember",
  },
  {
    id: "floor",
    title: "The Floor",
    subtitle: "Your team's home base",
    body: `The Floor is your dashboard — the first thing you see when you log in. It shows:

• The team's mission and shared targets at the top
• Quick actions to raise a challenge, share a win, or start a brainstorm
• Live stats on open challenges, stories this month, and active brainstorms
• A real-time activity feed showing what's happening across the team
• Who's online right now — because knowing who's active builds connection

Think of The Floor as the digital equivalent of walking onto a factory floor and instantly seeing the pulse of operations.`,
    icon: "LayoutDashboard",
    color: "steel",
  },
  {
    id: "challenges",
    title: "Challenges",
    subtitle: "Tackle problems together — no plant is an island",
    body: `This is where plant leaders raise the real problems they're facing — not operational fire-fighting, but the enterprise-level leadership challenges that cross plant boundaries.

Think: How do we implement AI responsibly across diverse regulatory environments? How do we build a unified engagement strategy when every plant has different cultural norms? How do we accelerate knowledge transfer when experienced leaders retire?

Each challenge becomes a discussion board where leaders can submit ideas, ask questions, and build on each other's thinking. Admins can start priority votes to let the team collectively rank which challenges matter most.

The power is in the cross-pollination. A solution that worked in one plant might transform another.`,
    icon: "Target",
    color: "steel",
  },
  {
    id: "stories",
    title: "Stories",
    subtitle: "Celebrate wins and share what you've learned",
    body: `Stories are where leaders share what's working — best practices, wins, lessons learned, and case studies from the field.

This isn't a corporate newsletter. It's leaders telling other leaders: "Here's what we tried, here's what happened, and here's what I'd do differently."

Categories include Best Practices, Wins, Lessons Learned, and Case Studies. Each story can be tagged, commented on, and reacted to. The best stories become shared playbooks that any plant can adapt.

Vulnerability matters here. The most valuable stories are often the ones where things didn't go perfectly — because that's where the deepest learning lives.`,
    icon: "BookOpen",
    color: "forge",
  },
  {
    id: "news",
    title: "News",
    subtitle: "Share what's happening in the world that matters to the team",
    body: `The News section is where leaders share articles, innovations, and external content that's relevant to the group — industry trends, new technologies, regulatory changes, leadership insights.

When you share a news item, include why it matters and what the team should think about. This turns passive reading into active discussion.`,
    icon: "Newspaper",
    color: "ember",
  },
  {
    id: "practice",
    title: "Practice Communication",
    subtitle: "Rehearse difficult conversations with AI",
    body: `Leadership is communication. This section lets you practice the conversations that matter most — and that most leaders avoid rehearsing.

Choose a role to practice with: a Senior Leader delivering budget cuts, a Customer escalating a complaint, a Top Talent with a competing offer, a Factory Floor Worker raising a safety concern.

The AI stays fully in character — it pushes back, gets emotional, and doesn't make it easy. After the conversation, you get coaching feedback with specific ratings on clarity, empathy, assertiveness, active listening, and outcome focus.

You can even use your voice — speech input and output are built in. Practice as many times as you want. The scenarios are designed around real situations plant leaders face every day.`,
    icon: "MessageCircle",
    color: "steel",
  },
  {
    id: "site-plan",
    title: "Site Master Plan",
    subtitle: "Define what your plant is trying to achieve",
    body: `Every plant has a master plan — strategic goals across Safety, Quality, Delivery, Cost, People, and Growth. This section makes those plans visible across the team.

For each goal, you set a target and track current progress. You can share updates (progress, learnings, blockers) that other leaders can learn from.

The cross-plant view is where it gets powerful. When you can see what every other plant is targeting, you can ask: "How do my stretch targets compare? What have they put in that I haven't considered? Who's solving the same problem I am?"

This is the focal point from which everything else cascades. Your site master plan should drive what challenges you raise, what stories you share, and what benchmarks you track.`,
    icon: "ClipboardList",
    color: "forge",
  },
  {
    id: "benchmarking",
    title: "Benchmarking",
    subtitle: "Compare, understand, and improve — together",
    body: `Benchmarking makes performance transparent across plants. Seven key metrics are tracked: OEE, Forecast Variance, Changeover Time, Safety (TRIR), First Pass Yield, On-Time Delivery, and Cost per Unit.

Each metric shows a ranked bar chart of all plants — your plant highlighted — so you can instantly see where you stand. But the ranking isn't the point.

The real value is in the commentary. For each metric, leaders share what's driving their performance — uplifts (what's working) and downlifts (what's hurting). This turns a number into a conversation.

When you see that the Stamping Plant's OEE is 91% and they attribute it to operator-led TPM, you can ask: "How did you get operators to own maintenance? What did the first 90 days look like?" That's the conversation that drives improvement.`,
    icon: "BarChart3",
    color: "steel",
  },
  {
    id: "achievements",
    title: "Achievements & Recognition",
    subtitle: "Celebrate each other — because culture is built in the small moments",
    body: `The Achievements section has two parts:

Activity Badges are earned automatically as you engage — your first challenge, sharing 5 stories, commenting across 3+ different plants, voting in priority sessions. These reward participation.

Peer Recognition is where leaders award badges to each other: Great Mentor, Problem Solver, Cross-Plant Champion, Culture Builder, Innovation Driver. Each comes with a personal note explaining why.

There's a leaderboard showing who's most active and most recognized. But more importantly, there's a Recent Recognition feed that tells the story of how this team is showing up for each other.

Recognition is the connective tissue of a first team. It makes invisible contributions visible.`,
    icon: "Award",
    color: "ember",
  },
  {
    id: "process",
    title: "The Design Process",
    subtitle: "How the cohort builds this — together",
    body: `Here's how building this platform fits into the cohort experience:

Session 1: Design Sprint
The cohort starts by answering: "What does it mean to be a first team? What do we need from each other? What would a platform look like that brings that to life?" They sketch features, debate priorities, and align on what matters. Then — using AI-assisted coding tools — the facilitator helps the group build a working prototype in real time.

Between Sessions: Sprint Work
Leaders start using the platform. They populate their site master plans, raise their first challenges, share stories. Usage patterns tell us what's working and what's not.

Session 2: Iterate & Deepen
The cohort reviews how the platform is being used. What features get traction? What's missing? They iterate the design, go deeper on benchmarking and cross-plant challenges, and reinforce the behaviors that drive collaboration.

Session 3: Outcomes & Next Steps
By now, the team has concrete examples of cross-plant value creation. They present outcomes, celebrate wins, and decide how to sustain the first team beyond the program.

Throughout: leaders receive individual coaching, complete 360 assessments, and participate in Gemba walks at each other's plants.

The platform is disposable — what matters is the team and the capability it builds. But many cohorts choose to keep it running because it becomes genuinely useful.`,
    icon: "Wrench",
    color: "forge",
  },
  {
    id: "ready",
    title: "You're Ready",
    subtitle: "Jump in — the team is waiting",
    body: `That's the tour. Here's what to do next:

1. Check out The Floor to see what's happening
2. Visit the Site Plan to add your plant's strategic goals
3. Raise a challenge or share a story
4. Recognize a teammate who's making a difference
5. Try a practice conversation — pick a scenario that feels real

Remember: this platform is yours. If something's missing, say so. If something isn't working, flag it. The whole point is that you shape this together.

One team. Every plant. No walls. Let's go.`,
    icon: "Zap",
    color: "ember",
  },
];
