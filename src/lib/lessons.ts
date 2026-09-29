export interface LessonEntry {
  slug: string;
  number: number;
  title: string;
  /** Meta description for the lesson page, also what search results show. */
  description: string;
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
      { slug: "07-request-lifecycle", number: 1, title: "The Lifecycle of a Software Request", description: "Follow one HTTP request end to end: DNS, TCP and TLS, the load balancer, the server, the database, and where the time in a round trip actually goes." },
    ],
  },
  {
    title: "Scaling and Trade-offs",
    lessons: [
      // LESSON_ENTRIES_START
      { slug: "01-horizontal-vs-vertical-scaling", number: 1, title: "Scalability: Vertical vs Horizontal Scaling", description: "Vertical scaling buys a bigger machine, horizontal scaling buys more of them. What each costs, why state is the hard part, and how real systems choose." },
      { slug: "02-latency-throughput-availability", number: 2, title: "Latency, Throughput & Availability", description: "The three numbers every system is judged by: what latency, throughput, and availability actually measure, and how improving one degrades another." },
      { slug: "03-cap-theorem", number: 3, title: "CAP Theorem & Trade-offs", description: "During a network partition a system stays consistent or stays available, never both. CP versus AP, the consistency spectrum, quorums, and PACELC." },
      { slug: "04-load-balancing", number: 4, title: "Core Concepts of Load Balancing", description: "How traffic gets spread across servers: layer 4 versus layer 7, routing algorithms, health checks and failover, and removing the single point of failure." },
      { slug: "05-requirements-and-estimation", number: 5, title: "Design Requirements & Estimating Resource Needs", description: "Turn a vague product goal into numbers: functional versus non-functional requirements, back-of-the-envelope estimation, storage, and bandwidth sizing." },
      // LESSON_ENTRIES_END
    ],
  },
  {
    title: "Communication and APIs",
    lessons: [
      { slug: "06-communication-patterns", number: 1, title: "Choosing a Communication Pattern", description: "Polling, long polling, webhooks, SSE, and WebSockets: how a system learns about changes it did not initiate, and which pattern fits which update rate." },
      { slug: "08-api-design", number: 2, title: "API Design: REST, GraphQL, and gRPC", description: "REST, GraphQL, and gRPC compared by the caller each is built for: fixed response shapes, over-fetching, the N+1 problem, and where each style fits." },
    ],
  },
  {
    title: "Data Storage and Management Strategies",
    lessons: [
      { slug: "01-relational-vs-nosql", number: 1, title: "Selecting Relational vs NoSQL Database Models", description: "When to choose SQL and when to choose NoSQL: ACID guarantees and JOINs versus flexible schemas and horizontal scale, decided by your access patterns." },
      { slug: "02-database-sharding-partitioning", number: 2, title: "Implementing Database Sharding and Partitioning", description: "Range and hash sharding, shard keys and hot shards, partitioning inside one node, shard maps, and the cost sharding adds to joins and transactions." },
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
