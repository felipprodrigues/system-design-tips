export interface LessonEntry {
  slug: string;
  number: number;
  title: string;
}

export interface CourseModule {
  number: string;
  title: string;
  lessons: LessonEntry[];
}

// A single standalone lesson shown above MOD · 01 — the on-ramp before the
// module structure starts. Not part of any module's lesson count.
export const prologue: LessonEntry = {
  slug: "07-request-lifecycle",
  number: 0,
  title: "The Lifecycle of a Software Request",
};

// Kept in sync with what's actually live under src/app/lessons — the
// ship-next-lesson workflow appends an entry here the moment a lesson ships.
export const modules: CourseModule[] = [
  {
    number: "01",
    title: "Foundations of Distributed Architecture",
    lessons: [
      // LESSON_ENTRIES_START
      { slug: "01-horizontal-vs-vertical-scaling", number: 1, title: "Scalability: Vertical vs Horizontal Scaling" },
      { slug: "02-latency-throughput-availability", number: 2, title: "Latency, Throughput & Availability" },
      { slug: "03-cap-theorem", number: 3, title: "CAP Theorem & Trade-offs" },
      { slug: "04-load-balancing", number: 4, title: "Core Concepts of Load Balancing" },
      { slug: "05-requirements-and-estimation", number: 5, title: "Design Requirements & Estimating Resource Needs" },
      { slug: "06-communication-patterns", number: 6, title: "Choosing a Communication Pattern" },
      // LESSON_ENTRIES_END
    ],
  },
];

export interface LessonNav {
  lessonNumber: number;
  totalLessons: number;
  prevHref?: string;
  nextHref?: string;
}

export function getLessonNav(slug: string): LessonNav {
  for (const mod of modules) {
    const index = mod.lessons.findIndex((l) => l.slug === slug);
    if (index === -1) continue;

    const { lessons } = mod;
    return {
      lessonNumber: index + 1,
      totalLessons: lessons.length,
      prevHref: index > 0 ? `/lessons/${lessons[index - 1].slug}` : undefined,
      nextHref: index < lessons.length - 1 ? `/lessons/${lessons[index + 1].slug}` : undefined,
    };
  }

  throw new Error(`Unknown lesson slug: ${slug}`);
}
