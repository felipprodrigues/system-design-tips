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
      { slug: "07-request-lifecycle", number: 1, title: "The Lifecycle of a Software Request", description: "How an HTTP request works end to end: DNS lookup, TCP and TLS handshake, load balancer, server, database, and where the round trip time goes." },
    ],
  },
  {
    title: "Scaling and Trade-offs",
    lessons: [
      // LESSON_ENTRIES_START
      { slug: "01-horizontal-vs-vertical-scaling", number: 1, title: "Scalability: Vertical vs Horizontal Scaling", description: "Horizontal vs vertical scaling explained: scale out versus scale up, stateless servers behind a load balancer, and how real systems choose." },
      { slug: "02-latency-throughput-availability", number: 2, title: "Latency, Throughput & Availability", description: "Latency, throughput and availability explained: what each metric measures, p99 percentiles, how they trade off, and what nines of uptime cost." },
      { slug: "03-cap-theorem", number: 3, title: "CAP Theorem & Trade-offs", description: "CAP theorem explained: consistency vs availability during a network partition, CP vs AP systems, eventual consistency, quorums, and PACELC." },
      { slug: "04-load-balancing", number: 4, title: "Core Concepts of Load Balancing", description: "Load balancing explained: layer 4 vs layer 7, round robin and least connections, health checks and failover, and sticky sessions." },
      { slug: "05-requirements-and-estimation", number: 5, title: "Design Requirements & Estimating Resource Needs", description: "Back of the envelope estimation for system design: functional vs non-functional requirements, QPS, storage capacity, and bandwidth sizing." },
      // LESSON_ENTRIES_END
    ],
  },
  {
    title: "Communication and APIs",
    lessons: [
      { slug: "06-communication-patterns", number: 1, title: "Choosing a Communication Pattern", description: "Polling vs webhooks vs WebSockets: long polling and server-sent events compared, and the update rate and latency each pattern really fits." },
      { slug: "08-api-design", number: 2, title: "API Design: REST, GraphQL, and gRPC", description: "REST vs GraphQL vs gRPC compared: fixed response shapes, over-fetching and under-fetching, the N+1 problem, protobuf, and when to use each." },
    ],
  },
  {
    title: "Data Storage and Management Strategies",
    lessons: [
      { slug: "01-relational-vs-nosql", number: 1, title: "Selecting Relational vs NoSQL Database Models", description: "SQL vs NoSQL explained: ACID transactions and JOINs versus flexible schemas and horizontal scale, and how access patterns decide the choice." },
      { slug: "02-database-sharding-partitioning", number: 2, title: "Implementing Database Sharding and Partitioning", description: "Database sharding and partitioning explained: shard keys, range vs hash sharding, hot shards, shard maps, and the cost of cross-shard joins." },
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
