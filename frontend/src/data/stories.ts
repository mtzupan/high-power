export interface Slide {
  topText: string;
  bottomText: string;
  emoji: string;
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
        topText: "Wind is invisible — but its power is not.",
        bottomText: "A single turbine blade is longer than a Boeing 737 wing.",
        emoji: "🌬️",
      },
      {
        topText: "The Buzludzha valley channels wind like a natural funnel.",
        bottomText: "Average wind speeds here exceed 7 m/s — ideal for generation.",
        emoji: "🏔️",
      },
      {
        topText: "Your thumb just moved electrons.",
        bottomText: "That's physics. That's power. That's you.",
        emoji: "⚡",
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
