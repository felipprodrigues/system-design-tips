export interface ConceptEntry {
  slug: string;
  number: number;
  title: string;
  /** Meta description for the concept page, also what search results show. */
  description: string;
  /** Read time in minutes, from the rendered word count at ~200 wpm. Stored rather
      than computed: fourteen numbers beat a build-time parser, and they only move
      when a page is substantially rewritten. */
  minutes: number;
}

/** A context, not a numbered module — concepts are grouped by what they're about. */
export interface ConceptGroup {
  title: string;
  concepts: ConceptEntry[];
}

// Kept in sync with what's actually live under src/app/concepts — the
// ship-next-concept workflow appends an entry here the moment a concept ships.
export const groups: ConceptGroup[] = [
  {
    title: "Fundamentals",
    concepts: [
      { slug: "request-lifecycle", number: 1, minutes: 16, title: "The Lifecycle of a Software Request", description: "How an HTTP request works end to end: DNS lookup, TCP and TLS handshake, load balancer, server, database, and where the round trip time goes." },
      { slug: "architectural-styles", number: 2, minutes: 13, title: "Architectural Styles: Monolith to Event-Driven", description: "Monolith vs microservices vs event-driven architecture: the modular monolith in between, when to move, and what each step actually costs." },
    ],
  },
  {
    title: "Scaling and Trade-offs",
    concepts: [
      // CONCEPT_ENTRIES_START
      { slug: "horizontal-vs-vertical-scaling", number: 1, minutes: 12, title: "Scalability: Vertical vs Horizontal Scaling", description: "Horizontal vs vertical scaling explained: scale out versus scale up, stateless servers behind a load balancer, and how real systems choose." },
      { slug: "latency-throughput-availability", number: 2, minutes: 11, title: "Latency, Throughput & Availability", description: "Latency, throughput and availability explained: what each metric measures, p99 percentiles, how they trade off, and what nines of uptime cost." },
      { slug: "cap-theorem", number: 3, minutes: 23, title: "CAP Theorem & Trade-offs", description: "CAP theorem explained: consistency vs availability during a network partition, CP vs AP systems, eventual consistency, quorums, and PACELC." },
      { slug: "load-balancing", number: 4, minutes: 13, title: "Core Concepts of Load Balancing", description: "Load balancing explained: layer 4 vs layer 7, round robin and least connections, health checks and failover, and sticky sessions." },
      { slug: "requirements-and-estimation", number: 5, minutes: 9, title: "Design Requirements & Estimating Resource Needs", description: "Back of the envelope estimation for system design: functional vs non-functional requirements, QPS, storage capacity, and bandwidth sizing." },
      { slug: "caching-strategies", number: 6, minutes: 14, title: "Caching Strategies & Cache Invalidation", description: "Caching strategies explained: cache-aside, write-through and write-back, TTL vs explicit invalidation, cache stampede, and cache penetration." },
      { slug: "content-delivery-networks", number: 7, minutes: 21, title: "Content Delivery Networks (CDNs)", description: "CDNs explained: edge servers and points of presence, origin pull vs origin push, cache hit ratio, content-hashed filenames, edge compute, and why personalized responses barely benefit." },
      // CONCEPT_ENTRIES_END
    ],
  },
  {
    title: "Communication and APIs",
    concepts: [
      { slug: "communication-patterns", number: 1, minutes: 12, title: "Choosing a Communication Pattern", description: "Polling vs webhooks vs WebSockets: long polling and server-sent events compared, and the update rate and latency each pattern really fits." },
      { slug: "api-design", number: 2, minutes: 14, title: "API Design: REST, GraphQL, and gRPC", description: "REST vs GraphQL vs gRPC compared: fixed response shapes, over-fetching and under-fetching, the N+1 problem, protobuf, and when to use each." },
      { slug: "rate-limiting", number: 3, minutes: 19, title: "Rate Limiting", description: "Rate limiting explained: token bucket, leaky bucket, fixed and sliding windows, 429 responses with Retry-After, per-IP vs per-key limits, and distributed enforcement with Redis." },
    ],
  },
  {
    title: "Data Storage and Management Strategies",
    concepts: [
      { slug: "relational-vs-nosql", number: 1, minutes: 15, title: "Selecting Relational vs NoSQL Database Models", description: "SQL vs NoSQL explained: ACID transactions and JOINs versus flexible schemas and horizontal scale, and how access patterns decide the choice." },
      { slug: "database-sharding-partitioning", number: 2, minutes: 9, title: "Implementing Database Sharding and Partitioning", description: "Database sharding and partitioning explained: shard keys, range vs hash sharding, hot shards, shard maps, and the cost of cross-shard joins." },
    ],
  },
];

/** Reading order across every group, so prev/next flows past a group boundary. */
export const reading = groups.flatMap((group) => group.concepts.map((concept) => ({ concept, group })));

/** Every concept by slug, for the dashboard and search. */
export const bySlug = new Map(reading.map(({ concept, group }) => [concept.slug, { concept, group }]));

export interface ConceptNav {
  conceptNumber: number;
  totalConcepts: number;
  /** The owning group's title, so pages never hardcode it. */
  sectionTitle: string;
  prevHref?: string;
  nextHref?: string;
}

export function getConceptNav(slug: string): ConceptNav {
  const index = reading.findIndex((r) => r.concept.slug === slug);
  if (index === -1) throw new Error(`Unknown concept slug: ${slug}`);

  const { group } = reading[index];
  return {
    conceptNumber: group.concepts.findIndex((l) => l.slug === slug) + 1,
    totalConcepts: group.concepts.length,
    sectionTitle: group.title,
    prevHref: index > 0 ? `/concepts/${reading[index - 1].concept.slug}` : undefined,
    nextHref: index < reading.length - 1 ? `/concepts/${reading[index + 1].concept.slug}` : undefined,
  };
}
