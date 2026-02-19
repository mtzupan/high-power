export interface Slide {
  topText: string;
  bottomText: string;
  emoji: string;
  svgKey?: string;
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
        svgKey: "lightning",
      },
      {
        topText: "STEM education trains you to work alone.",
        bottomText: "Nearly half of engineering work is collaborative.",
        emoji: "🔗",
        svgKey: "chain",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "Day 1: you simulate the full turbine.",
        bottomText: "See how each component affects the whole.",
        emoji: "💻",
        svgKey: "laptop",
      },
      {
        topText: "Days 2 and 3: your team builds.",
        bottomText: "Building a small-scale turbine from industrial components.",
        emoji: "🔧",
        svgKey: "wrench",
      },
      {
        topText: "Day 4: all four teams come together.",
        bottomText: "Run in front of a fan. Every decision defended.",
        emoji: "🌬️",
        svgKey: "wind",
      },
      {
        topText: "High Power is what real engineering looks like.",
        bottomText: "Collaborative, hands-on, built around real stakes.",
        emoji: "🏆",
        svgKey: "trophy",
      },
    ],
  },
  parents: {
    id: "parents",
    title: "For Parents",
    slides: [
      {
        topText: "High Power is a four-day STEM program.",
        bottomText: "Built around collaboration, not individual achievement.",
        emoji: "⚡",
        svgKey: "lightning",
      },
      {
        topText: "School prepares students to work alone.",
        bottomText: "Most STEM careers require daily team collaboration.",
        emoji: "📊",
        svgKey: "chart",
      },
      {
        topText: "Students join one of four engineering teams.",
        bottomText: "Each team owns one component of the turbine.",
        emoji: "⚙️",
        svgKey: "gear",
      },
      {
        topText: "They simulate, design, build, and document.",
        bottomText: "Assembling industrial components into a working turbine.",
        emoji: "🔧",
        svgKey: "wrench",
      },
      {
        topText: "On day four, all teams present together.",
        bottomText: "A working turbine, run on a box fan, fully theirs.",
        emoji: "🎯",
        svgKey: "target",
      },
      {
        topText: "Your student leaves with real team experience.",
        bottomText: "Prepared for the collaboration that STEM careers demand.",
        emoji: "🌱",
        svgKey: "growth",
      },
    ],
  },
  educators: {
    id: "educators",
    title: "For Educators",
    slides: [
      {
        topText: "High Power complements your existing STEM curriculum.",
        bottomText: "A four-day program in team-based engineering design.",
        emoji: "📚",
        svgKey: "books",
      },
      {
        topText: "Students learn to work alone. Jobs require teams.",
        bottomText: "High Power bridges that gap before graduation.",
        emoji: "📊",
        svgKey: "chart",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "Students divide into four subject-matter teams.",
        bottomText: "Location, Blades, Gearbox, Generator — each team owns one.",
        emoji: "⚙️",
        svgKey: "gear",
      },
      {
        topText: "Teams simulate, design, build, and present.",
        bottomText: "Every decision documented and defended on day four.",
        emoji: "🔧",
        svgKey: "wrench",
      },
      {
        topText: "The result: a working small-scale wind turbine.",
        bottomText: "Built from industrial components, run on a box fan.",
        emoji: "🌬️",
        svgKey: "wind",
      },
      {
        topText: "High Power is flexible and partner-ready.",
        bottomText: "Now seeking pilot schools and teachers to join.",
        emoji: "🤝",
        svgKey: "handshake",
      },
    ],
  },
  "engineers-community": {
    id: "engineers-community",
    title: "Community Involvement",
    slides: [
      {
        topText: "STEM graduates arrive unprepared to collaborate.",
        bottomText: "School trains for individual work. Jobs don't.",
        emoji: "📊",
        svgKey: "chart",
      },
      {
        topText: "Nearly half of all work time is collaborative.",
        bottomText: "Students have almost no preparation for this.",
        emoji: "🔗",
        svgKey: "chain",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "High Power is a four-day student curriculum.",
        bottomText: "Teams build a small-scale, industrial-grade turbine.",
        emoji: "⚡",
        svgKey: "lightning",
      },
      {
        topText: "Technical volunteers mentor one subject-matter team.",
        bottomText: "Two or more years of collaborative work required.",
        emoji: "🤝",
        svgKey: "handshake",
      },
      {
        topText: "Four teams: Location, Blades, Gearbox, Generator.",
        bottomText: "You bring the expertise. Students bring the energy.",
        emoji: "⚙️",
        svgKey: "gear",
      },
      {
        topText: "High Power is seeking technical volunteers now.",
        bottomText: "Help close the gap you experienced firsthand.",
        emoji: "🏗️",
        svgKey: "construction",
      },
    ],
  },
  "engineers-built": {
    id: "engineers-built",
    title: "How this was built",
    slides: [
      {
        topText: "The curriculum centers on a real wind turbine.",
        bottomText: "Industrial components. Box fan-operated. Student-built.",
        emoji: "🌬️",
        svgKey: "wind",
      },
      {
        topText: "Located in the Buzludzha valley, Bulgaria.",
        bottomText: "Average wind speeds exceed 7 m/s year-round.",
        emoji: "🏔️",
        svgKey: "mountain",
      },
      {
        topText: "Four subsystems: Location, Blades, Gearbox, Generator.",
        bottomText: "Each student team owns one from start to finish.",
        emoji: "⚙️",
        svgKey: "gear",
      },
      {
        topText: "The curriculum mirrors real engineering workflow.",
        bottomText: "Simulate, specify, build, document, present, and defend.",
        emoji: "📋",
        svgKey: "clipboard",
      },
      {
        topText: "The turbine must last five years in the field.",
        bottomText: "Students are held to industrial design standards.",
        emoji: "🔩",
        svgKey: "bolt",
      },
      {
        topText: "Every design choice is made and documented.",
        bottomText: "Then presented to the room on day four.",
        emoji: "🏗️",
        svgKey: "construction",
      },
    ],
  },
};

export function getStory(id: string): Story | undefined {
  return STORIES[id];
}
