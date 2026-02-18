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
  professionals: {
    id: "professionals",
    title: "For Professionals",
    slides: [
      {
        topText: "Rated capacity: 2.0 MW at 13 m/s wind speed.",
        bottomText: "Power curve follows a cubic relationship below rated wind.",
        emoji: "📊",
      },
      {
        topText: "Cut-in at 4 m/s. Cut-out at 25 m/s.",
        bottomText: "Rotor diameter: approximately 80 m. Hub height: 80 m.",
        emoji: "🔩",
      },
      {
        topText: "Capacity factor in Buzludzha: ~35–40%.",
        bottomText: "Annual energy production estimate: 6,000–7,000 MWh.",
        emoji: "🗂️",
      },
    ],
  },
};

export function getStory(id: string): Story | undefined {
  return STORIES[id];
}
