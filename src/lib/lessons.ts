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

// Kept in sync with what's actually live under src/app/lessons — the
// ship-next-lesson workflow appends an entry here the moment a lesson ships.
export const modules: CourseModule[] = [
  {
    number: "01",
    title: "Foundations of Distributed Architecture",
    lessons: [
      // LESSON_ENTRIES_START
      { slug: "01-horizontal-vs-vertical-scaling", number: 1, title: "Horizontal vs Vertical Scaling" },
      { slug: "02-latency-throughput-availability", number: 2, title: "Latency, Throughput & Availability" },
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
