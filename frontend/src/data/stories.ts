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
        bottomText: "Building a small-scale turbine from industrial components.",
        emoji: "🔧",
      },
      {
        topText: "Day 4: all four teams come together.",
        bottomText: "Run in front of a fan. Every decision defended.",
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
        topText: "High Power is a four-day STEM program.",
        bottomText: "Built around collaboration, not individual achievement.",
        emoji: "⚡",
      },
      {
        topText: "School prepares students to work alone.",
        bottomText: "Most STEM careers require daily team collaboration.",
        emoji: "📊",
      },
      {
        topText: "Students join one of four engineering teams.",
        bottomText: "Each team owns one component of the turbine.",
        emoji: "⚙️",
      },
      {
        topText: "They simulate, design, build, and document.",
        bottomText: "Assembling industrial components into a working turbine.",
        emoji: "🔧",
      },
      {
        topText: "On day four, all teams present together.",
        bottomText: "A working turbine, run on a box fan, fully theirs.",
        emoji: "🎯",
      },
      {
        topText: "Your student leaves with real team experience.",
        bottomText: "Prepared for the collaboration that STEM careers demand.",
        emoji: "🌱",
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
      },
      {
        topText: "Students learn to work alone. Jobs require teams.",
        bottomText: "High Power bridges that gap before graduation.",
        emoji: "📊",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "Students divide into four subject-matter teams.",
        bottomText: "Location, Blades, Gearbox, Generator — each team owns one.",
        emoji: "⚙️",
      },
      {
        topText: "Teams simulate, design, build, and present.",
        bottomText: "Every decision documented and defended on day four.",
        emoji: "🔧",
      },
      {
        topText: "The result: a working small-scale wind turbine.",
        bottomText: "Built from industrial components, run on a box fan.",
        emoji: "🌬️",
      },
      {
        topText: "High Power is flexible and partner-ready.",
        bottomText: "Now seeking pilot schools and teachers to join.",
        emoji: "🤝",
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
      },
      {
        topText: "Nearly half of all work time is collaborative.",
        bottomText: "Students have almost no preparation for this.",
        emoji: "🔗",
        citation: {
          label: "Gensler Workplace Survey 2024",
          url: "https://www.gensler.com/gri/global-workplace-survey-2024",
        },
      },
      {
        topText: "High Power is a four-day student curriculum.",
        bottomText: "Teams build a small-scale, industrial-grade turbine.",
        emoji: "⚡",
      },
      {
        topText: "Technical volunteers mentor one subject-matter team.",
        bottomText: "Two or more years of collaborative work required.",
        emoji: "🤝",
      },
      {
        topText: "Four teams: Location, Blades, Gearbox, Generator.",
        bottomText: "You bring the expertise. Students bring the energy.",
        emoji: "⚙️",
      },
      {
        topText: "High Power is seeking technical volunteers now.",
        bottomText: "Help close the gap you experienced firsthand.",
        emoji: "🏗️",
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
      },
      {
        topText: "Located in the Buzludzha valley, Bulgaria.",
        bottomText: "Average wind speeds exceed 7 m/s year-round.",
        emoji: "🏔️",
      },
      {
        topText: "Four subsystems: Location, Blades, Gearbox, Generator.",
        bottomText: "Each student team owns one from start to finish.",
        emoji: "⚙️",
      },
      {
        topText: "The curriculum mirrors real engineering workflow.",
        bottomText: "Simulate, specify, build, document, present, and defend.",
        emoji: "📋",
      },
      {
        topText: "The turbine must last five years in the field.",
        bottomText: "Students are held to industrial design standards.",
        emoji: "🔩",
      },
      {
        topText: "Every design choice is made and documented.",
        bottomText: "Then presented to the room on day four.",
        emoji: "🏗️",
      },
    ],
  },
};

export function getStory(id: string): Story | undefined {
  return STORIES[id];
}
