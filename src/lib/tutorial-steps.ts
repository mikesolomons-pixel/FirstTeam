export interface TutorialTip {
  id: string;
  page: string; // pathname to match
  title: string;
  body: string;
  nextPage?: string; // where to navigate next
}

export const TUTORIAL_TIPS: TutorialTip[] = [
  {
    id: "welcome",
    page: "/",
    title: "Welcome to First Team",
    body: "This is The Floor — your team's home base. See what's happening, jump into challenges, share wins, or start a brainstorm. Everything starts here.",
    nextPage: "/challenges",
  },
  {
    id: "challenges",
    page: "/challenges",
    title: "Challenges",
    body: "Raise the real problems your plants face — not day-to-day ops, but the enterprise-level leadership challenges that cross boundaries. The team votes on priorities and builds solutions together.",
    nextPage: "/stories",
  },
  {
    id: "stories",
    page: "/stories",
    title: "Stories",
    body: "Share what's working — best practices, wins, lessons learned. The most valuable stories are often where things didn't go perfectly. That's where the deepest learning lives.",
    nextPage: "/news",
  },
  {
    id: "news",
    page: "/news",
    title: "News",
    body: "Share articles and innovations that matter to the team. Include why it's relevant — turn passive reading into active discussion.",
    nextPage: "/practice",
  },
  {
    id: "practice",
    page: "/practice",
    title: "Practice Communication",
    body: "Rehearse difficult conversations with AI that stays in character — a tough VP, an upset customer, a top talent with a competing offer. Get coaching feedback on clarity, empathy, and assertiveness.",
    nextPage: "/site-plan",
  },
  {
    id: "site-plan",
    page: "/site-plan",
    title: "Site Master Plan",
    body: "Define what your plant is trying to achieve. Set goals across Safety, Quality, Delivery, Cost, People, and Growth. Share progress and learnings so others can benefit. Compare your stretch targets with peers.",
    nextPage: "/benchmarking",
  },
  {
    id: "benchmarking",
    page: "/benchmarking",
    title: "Benchmarking",
    body: "Compare OEE, safety, delivery, cost, and more across plants. The ranking isn't the point — the commentary is. Share what's driving your numbers so others can learn from it.",
    nextPage: "/achievements",
  },
  {
    id: "achievements",
    page: "/achievements",
    title: "Achievements & Recognition",
    body: "Earn badges through engagement. Recognize teammates who make a difference — Great Mentor, Problem Solver, Cross-Plant Champion. Recognition is the connective tissue of a first team.",
  },
];

export const TIP_MAP = Object.fromEntries(
  TUTORIAL_TIPS.map((t) => [t.page, t])
) as Record<string, TutorialTip>;

// Intro cards for the /tutorial overview page
export interface TutorialCard {
  title: string;
  body: string;
  icon: string;
  color: string;
}

export const TUTORIAL_OVERVIEW: TutorialCard[] = [
  {
    title: "What is First Team?",
    body: "A platform your cohort designs and owns together. It makes the idea of being 'one team' concrete — not conceptual. You'll shape it around what matters to your group.",
    icon: "Rocket",
    color: "steel",
  },
  {
    title: "How the Cohort Works",
    body: "Three sprints over three months. Sprint 1: design the platform together. Sprint 2: populate it with real content and start collaborating. Sprint 3: present outcomes and plan what's next.",
    icon: "Calendar",
    color: "forge",
  },
  {
    title: "Why Build It Together?",
    body: "Three outcomes at once — AI fluency, product design thinking, and collective intelligence. The app isn't the goal. The collaboration it enables is.",
    icon: "Lightbulb",
    color: "ember",
  },
  {
    title: "The Design Process",
    body: "Session 1: What does our first team need? Design it. Session 2: How is it working? Iterate. Session 3: What outcomes did we drive? Celebrate and sustain. Coaching and Gemba walks run in parallel throughout.",
    icon: "Wrench",
    color: "steel",
  },
];
