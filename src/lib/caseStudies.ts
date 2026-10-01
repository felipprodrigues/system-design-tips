import { groups } from "./lessons";

/** Filter themes, in the order the chips render. */
export const THEMES = [
  "Consistency",
  "Databases & sharding",
  "Caching",
  "Load balancing",
  "Availability & resilience",
  "Real-time",
  "API design",
  "Scaling",
] as const;

export type Theme = (typeof THEMES)[number];

export interface CaseStudy {
  title: string;
  company: string;
  url: string;
  /** What a reader takes away, in one sentence. */
  takeaway: string;
  themes: Theme[];
  /** Postmortems earn their own badge: they are the failures, not the designs. */
  kind?: "Postmortem" | "Paper";
  /** Slug of the lesson this backs. Rendered only if that lesson is published. */
  lesson?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    title: "October 2021 post-incident analysis",
    company: "GitHub",
    url: "https://github.blog/news-insights/company-news/oct21-post-incident-analysis/",
    takeaway:
      "A real network partition: automated failover promoted a cross-country database primary, both sides accepted writes the other never saw, and failing back stopped being safe.",
    themes: ["Availability & resilience", "Consistency"],
    kind: "Postmortem",
    lesson: "03-cap-theorem",
  },
  {
    title: "Amazon's Dynamo",
    company: "Amazon",
    url: "https://allthingsdistributed.com/2007/10/amazons_dynamo.html",
    takeaway:
      "The paper that made availability the default: eventual consistency, vector clocks, and a shopping cart that must stay writable while the network is broken.",
    themes: ["Consistency", "Databases & sharding"],
    kind: "Paper",
    lesson: "03-cap-theorem",
  },
  {
    title: "How multiplayer technology works",
    company: "Figma",
    url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    takeaway:
      "Concurrent edits from many clients converging on one document, and why they chose their own approach over off-the-shelf conflict resolution.",
    themes: ["Real-time", "Consistency"],
    lesson: "03-cap-theorem",
  },
  {
    title: "Avoiding double payments in a distributed payments system",
    company: "Airbnb",
    url: "https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb",
    takeaway:
      "What it takes to retry a payment safely when the first attempt might have succeeded and you cannot tell.",
    themes: ["Consistency", "API design"],
    lesson: "03-cap-theorem",
  },
  {
    title: "Scaling Memcache at Facebook",
    company: "Facebook",
    url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala",
    takeaway:
      "The canonical caching-at-scale paper: leases against stampedes, regional pools, and what happens when a cold cluster takes live traffic.",
    themes: ["Caching", "Scaling"],
    kind: "Paper",
  },
  {
    title: "Sharding Postgres",
    company: "Notion",
    url: "https://www.notion.com/blog/sharding-postgres-at-notion",
    takeaway:
      "Choosing a shard key for real data, and the migration it took to get there without downtime.",
    themes: ["Databases & sharding"],
    lesson: "02-database-sharding-partitioning",
  },
  {
    title: "Scaling PostgreSQL",
    company: "OpenAI",
    url: "https://openai.com/index/scaling-postgresql/",
    takeaway:
      "How far a single primary plus read replicas goes before sharding becomes unavoidable.",
    themes: ["Databases & sharding", "Scaling"],
    lesson: "01-relational-vs-nosql",
  },
  {
    title: "How Discord stores trillions of messages",
    company: "Discord",
    url: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
    takeaway:
      "Hot partitions, the limits they hit on Cassandra, and what moving the whole message store bought them.",
    themes: ["Databases & sharding", "Scaling"],
    lesson: "01-relational-vs-nosql",
  },
  {
    title: "Announcing Snowflake",
    company: "Twitter",
    url: "https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake",
    takeaway:
      "Unique IDs without a central counter, the problem you inherit the moment auto-increment stops working across shards.",
    themes: ["Databases & sharding"],
    lesson: "02-database-sharding-partitioning",
  },
  {
    title: "H3, a hexagonal hierarchical spatial index",
    company: "Uber",
    url: "https://www.uber.com/br/en/blog/h3/",
    takeaway:
      "Partitioning space instead of rows, so proximity queries stay cheap as the map fills up.",
    themes: ["Databases & sharding"],
    lesson: "02-database-sharding-partitioning",
  },
  {
    title: "DBLog, a generic change data capture framework",
    company: "Netflix",
    url: "https://netflixtechblog.com/dblog-a-generic-change-data-capture-framework-69351fb9099b",
    takeaway:
      "Keeping search indexes, caches, and derived stores in step with the database that owns the truth.",
    themes: ["Databases & sharding", "Real-time"],
  },
  {
    title: "GLB Director, an open source load balancer",
    company: "GitHub",
    url: "https://github.blog/engineering/infrastructure/glb-director-open-source-load-balancer/",
    takeaway:
      "A layer 4 load balancer designed in the open, including how connections survive a backend coming and going.",
    themes: ["Load balancing"],
    lesson: "04-load-balancing",
  },
  {
    title: "Fault tolerance in a high volume distributed system",
    company: "Netflix",
    url: "https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a",
    takeaway:
      "Circuit breakers, bulkheads, and fallbacks: how one failing dependency is stopped from taking the product with it.",
    themes: ["Availability & resilience"],
  },
  {
    title: "The 18 November 2025 outage",
    company: "Cloudflare",
    url: "https://blog.cloudflare.com/18-november-2025-outage/",
    takeaway:
      "A permissions change doubled the size of an internally generated config file, it blew past a fixed preallocation, and the proxy panicked. Internal input is still input.",
    themes: ["Availability & resilience"],
    kind: "Postmortem",
  },
  {
    title: "Designing robust and predictable APIs with idempotency",
    company: "Stripe",
    url: "https://stripe.com/blog/idempotency",
    takeaway:
      "Idempotency keys, and why any API a client will retry needs them before it needs anything else.",
    themes: ["API design", "Consistency"],
    lesson: "08-api-design",
  },
  {
    title: "Scaling your API with rate limiters",
    company: "Stripe",
    url: "https://stripe.com/blog/rate-limiters",
    takeaway:
      "Four different limiters, each protecting against a different way callers overwhelm you.",
    themes: ["API design", "Availability & resilience"],
    lesson: "08-api-design",
  },
  {
    title: "Real-time messaging",
    company: "Slack",
    url: "https://slack.engineering/real-time-messaging/",
    takeaway:
      "Holding millions of long-lived connections open, and what has to give when every client expects instant delivery.",
    themes: ["Real-time"],
    lesson: "06-communication-patterns",
  },
  {
    title: "Scaling with common sense",
    company: "Zerodha",
    url: "https://zerodha.tech/blog/scaling-with-common-sense/",
    takeaway:
      "Millions of trades a day on Postgres, Redis, and Go, as the counterweight to every design that assumes scale demands exotic infrastructure.",
    themes: ["Scaling"],
    lesson: "01-horizontal-vs-vertical-scaling",
  },
];

const publishedLessons = new Map(
  groups.flatMap((group) => group.lessons.map((lesson) => [lesson.slug, lesson.title] as const)),
);

/** Lesson title for a case study, or undefined when that lesson is not published yet. */
export function lessonTitleFor(study: CaseStudy) {
  return study.lesson ? publishedLessons.get(study.lesson) : undefined;
}
