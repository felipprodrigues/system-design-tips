export interface LessonEntry {
  slug: string;
  number: number;
  title: string;
}

/** A context, not a numbered module — lessons are grouped by what they're about. */
export interface LessonGroup {
  title: string;
  lessons: LessonEntry[];
}

// Kept in sync with what's actually live under src/app/lessons — the
// ship-next-lesson workflow appends an entry here the moment a lesson ships.
export const groups: LessonGroup[] = [
  {
    title: "Fundamentals",
    lessons: [
      { slug: "07-request-lifecycle", number: 1, title: "The Lifecycle of a Software Request" },
    ],
  },
  {
    title: "Scaling and Trade-offs",
    lessons: [
      // LESSON_ENTRIES_START
      { slug: "01-horizontal-vs-vertical-scaling", number: 1, title: "Scalability: Vertical vs Horizontal Scaling" },
      { slug: "02-latency-throughput-availability", number: 2, title: "Latency, Throughput & Availability" },
      { slug: "03-cap-theorem", number: 3, title: "CAP Theorem & Trade-offs" },
      { slug: "04-load-balancing", number: 4, title: "Core Concepts of Load Balancing" },
      { slug: "05-requirements-and-estimation", number: 5, title: "Design Requirements & Estimating Resource Needs" },
      // LESSON_ENTRIES_END
    ],
  },
  {
    title: "Communication and APIs",
    lessons: [
      { slug: "06-communication-patterns", number: 1, title: "Choosing a Communication Pattern" },
    ],
  },
  {
    title: "Data Storage and Management Strategies",
    lessons: [
      { slug: "01-relational-vs-nosql", number: 1, title: "Selecting Relational vs NoSQL Database Models" },
      { slug: "02-database-sharding-partitioning", number: 2, title: "Implementing Database Sharding and Partitioning" },
    ],
  },
];

/** Reading order across every group, so prev/next flows past a group boundary. */
const reading = groups.flatMap((group) => group.lessons.map((lesson) => ({ lesson, group })));

export interface LessonNav {
  lessonNumber: number;
  totalLessons: number;
  /** The owning group's title, so pages never hardcode it. */
  sectionTitle: string;
  prevHref?: string;
  nextHref?: string;
}

export function getLessonNav(slug: string): LessonNav {
  const index = reading.findIndex((r) => r.lesson.slug === slug);
  if (index === -1) throw new Error(`Unknown lesson slug: ${slug}`);

  const { group } = reading[index];
  return {
    lessonNumber: group.lessons.findIndex((l) => l.slug === slug) + 1,
    totalLessons: group.lessons.length,
    sectionTitle: group.title,
    prevHref: index > 0 ? `/lessons/${reading[index - 1].lesson.slug}` : undefined,
    nextHref: index < reading.length - 1 ? `/lessons/${reading[index + 1].lesson.slug}` : undefined,
  };
}
