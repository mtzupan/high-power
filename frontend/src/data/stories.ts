export interface Slide {
  topText: string;
  bottomText: string;
  emoji: string;
  citation?: { label: string; url: string };
}

export interface Story {
  id: string;
  title: string;
  slides: Slide[];
}

const STORIES: Record<string, Story> = {
  students: {
    id: "students",
    title: "For Students",
    slides: [
      {
        topText: "A hands-on curriculum in team-based engineering.",
        bottomText: "Real collaborative experience, before you need it.",
        emoji: "⚡",
      },
      {
        topText: "STEM education trains you to work alone.",
        bottomText: "Nearly half of engineering work is collaborative.",
        emoji: "🔗",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "Day 1: you simulate the full turbine.",
        bottomText: "See how each component affects the whole.",
        emoji: "💻",
      },
      {
        topText: "Days 2 and 3: your team builds.",
        bottomText: "Hands-on design, assembly, and real documentation.",
        emoji: "🔧",
      },
      {
        topText: "Day 4: all four teams come together.",
        bottomText: "One turbine. Every design decision defended.",
        emoji: "🌬️",
      },
      {
        topText: "High Power is what real engineering looks like.",
        bottomText: "Collaborative, hands-on, built around real stakes.",
        emoji: "🏆",
      },
    ],
  },
  parents: {
    id: "parents",
    title: "For Parents",
    slides: [
      {
        topText: "Coming soon.",
        bottomText: "Stories for parents are on the way.",
        emoji: "🌱",
      },
    ],
  },
  educators: {
    id: "educators",
    title: "For Educators",
    slides: [
      {
        topText: "Coming soon.",
        bottomText: "Stories for educators are on the way.",
        emoji: "📚",
      },
    ],
  },
  "engineers-community": {
    id: "engineers-community",
    title: "Community Involvement",
    slides: [
      {
        topText: "Coming soon.",
        bottomText: "Community involvement stories are on the way.",
        emoji: "🤝",
      },
    ],
  },
  "engineers-built": {
    id: "engineers-built",
    title: "How this was built",
    slides: [
      {
        topText: "Coming soon.",
        bottomText: "Behind-the-build stories are on the way.",
        emoji: "🔧",
      },
    ],
  },
};

export function getStory(id: string): Story | undefined {
  return STORIES[id];
}
