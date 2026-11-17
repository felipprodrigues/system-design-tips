import { groups } from "./concepts";

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
  "Frontend at scale",
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
  /** Slug of the concept this backs. Rendered only if that concept is published. */
  concept?: string;
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
    concept: "cap-theorem",
  },
  {
    title: "Amazon's Dynamo",
    company: "Amazon",
    url: "https://allthingsdistributed.com/2007/10/amazons_dynamo.html",
    takeaway:
      "The paper that made availability the default: eventual consistency, vector clocks, and a shopping cart that must stay writable while the network is broken.",
    themes: ["Consistency", "Databases & sharding"],
    kind: "Paper",
    concept: "cap-theorem",
  },
  {
    title: "How multiplayer technology works",
    company: "Figma",
    url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    takeaway:
      "Concurrent edits from many clients converging on one document, and why they chose their own approach over off-the-shelf conflict resolution.",
    themes: ["Real-time", "Consistency", "Frontend at scale"],
    concept: "cap-theorem",
  },
  {
    title: "Avoiding double payments in a distributed payments system",
    company: "Airbnb",
    url: "https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb",
    takeaway:
      "What it takes to retry a payment safely when the first attempt might have succeeded and you cannot tell.",
    themes: ["Consistency", "API design"],
    concept: "cap-theorem",
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
    concept: "database-sharding-partitioning",
  },
  {
    title: "Scaling PostgreSQL",
    company: "OpenAI",
    url: "https://openai.com/index/scaling-postgresql/",
    takeaway:
      "How far a single primary plus read replicas goes before sharding becomes unavoidable.",
    themes: ["Databases & sharding", "Scaling"],
    concept: "relational-vs-nosql",
  },
  {
    title: "How Discord stores trillions of messages",
    company: "Discord",
    url: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
    takeaway:
      "Hot partitions, the limits they hit on Cassandra, and what moving the whole message store bought them.",
    themes: ["Databases & sharding", "Scaling"],
    concept: "relational-vs-nosql",
  },
  {
    title: "Announcing Snowflake",
    company: "Twitter",
    url: "https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake",
    takeaway:
      "Unique IDs without a central counter, the problem you inherit the moment auto-increment stops working across shards.",
    themes: ["Databases & sharding"],
    concept: "database-sharding-partitioning",
  },
  {
    title: "H3, a hexagonal hierarchical spatial index",
    company: "Uber",
    url: "https://www.uber.com/br/en/blog/h3/",
    takeaway:
      "Partitioning space instead of rows, so proximity queries stay cheap as the map fills up.",
    themes: ["Databases & sharding"],
    concept: "database-sharding-partitioning",
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
    title: "Turbocharging Solr index replication with BitTorrent",
    company: "Etsy",
    url: "https://web.archive.org/web/20211201033341/https://codeascraft.com/2012/01/23/solr-bittorrent-index-replication/",
    takeaway:
      "Copying a 28 GB search index from one primary to every replica made replication time grow linearly with the fleet and pinned the primary's network card. Letting the replicas seed each other over BitTorrent decoupled the two.",
    themes: ["Databases & sharding", "Scaling"],
  },
  {
    title: "GLB Director, an open source load balancer",
    company: "GitHub",
    url: "https://github.blog/engineering/infrastructure/glb-director-open-source-load-balancer/",
    takeaway:
      "A layer 4 load balancer designed in the open, including how connections survive a backend coming and going.",
    themes: ["Load balancing"],
    concept: "load-balancing",
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
    title: "Incident review: API and dashboard outage on 10 October 2017",
    company: "GoCardless",
    url: "https://gocardless.com/blog/incident-review-api-and-dashboard-outage-on-10th-october",
    takeaway:
      "A primary database node failed and the cluster manager declined to promote any replica, because one Pacemaker colocation rule ranked every candidate at negative infinity. A failover budgeted at two minutes ran for nearly two hours.",
    themes: ["Availability & resilience", "Databases & sharding"],
    kind: "Postmortem",
    concept: "latency-throughput-availability",
  },
  {
    title: "Summary of the EC2 and RDS service disruption in US East",
    company: "AWS",
    url: "https://aws.amazon.com/message/65648/",
    takeaway:
      "A network change routed EBS traffic onto a secondary network that could not carry it. When connectivity returned, the isolated nodes all tried to re-mirror at once, and the storm filled one zone and then the region's control plane.",
    themes: ["Availability & resilience", "Scaling"],
    kind: "Postmortem",
    concept: "latency-throughput-availability",
  },
  {
    title: "Designing robust and predictable APIs with idempotency",
    company: "Stripe",
    url: "https://stripe.com/blog/idempotency",
    takeaway:
      "Idempotency keys, and why any API a client will retry needs them before it needs anything else.",
    themes: ["API design", "Consistency"],
    concept: "api-design",
  },
  {
    title: "Scaling your API with rate limiters",
    company: "Stripe",
    url: "https://stripe.com/blog/rate-limiters",
    takeaway:
      "Four different limiters, each protecting against a different way callers overwhelm you.",
    themes: ["API design", "Availability & resilience"],
    concept: "api-design",
  },
  {
    title: "Real-time messaging",
    company: "Slack",
    url: "https://slack.engineering/real-time-messaging/",
    takeaway:
      "Holding millions of long-lived connections open, and what has to give when every client expects instant delivery.",
    themes: ["Real-time"],
    concept: "communication-patterns",
  },
  {
    title: "Scaling with common sense",
    company: "Zerodha",
    url: "https://zerodha.tech/blog/scaling-with-common-sense/",
    takeaway:
      "Millions of trades a day on Postgres, Redis, and Go, as the counterweight to every design that assumes scale demands exotic infrastructure.",
    themes: ["Scaling"],
    concept: "horizontal-vs-vertical-scaling",
  },
  {
    title: "Making Netflix.com faster",
    company: "Netflix",
    url: "https://netflixtechblog.com/making-netflix-com-faster-f95d15f2e972",
    takeaway:
      "Shipping the signed-out homepage without the client framework, then prefetching the next page during the time the visitor spends reading this one.",
    themes: ["Frontend at scale", "Caching"],
  },
  {
    title: "Rearchitecting Airbnb's frontend",
    company: "Airbnb",
    url: "https://medium.com/airbnb-engineering/rearchitecting-airbnbs-frontend-5e213efc24d2",
    takeaway:
      "Pulling the view layer out of a Rails monolith into a server-rendered React tier, and the data and routing boundaries that had to be drawn before any of it could move.",
    themes: ["Frontend at scale", "Scaling"],
  },
  {
    title: "React Fiber architecture",
    company: "Meta",
    url: "https://github.com/acdlite/react-fiber-architecture",
    takeaway:
      "Why the reconciler was rebuilt around interruptible units of work, the deep dive on what a scheduler buys an interface that a recursive render cannot.",
    themes: ["Frontend at scale"],
  },
  {
    title: "How Shopify reduced storefront response times with a rewrite",
    company: "Shopify",
    url: "https://shopify.engineering/how-shopify-reduced-storefront-response-times-rewrite",
    takeaway:
      "Replacing the software behind every storefront with no downtime, by running the new renderer in the shadow of the old one and comparing responses until they matched.",
    themes: ["Frontend at scale", "Availability & resilience"],
  },
  {
    title: "When a rewrite isn't: rebuilding Slack on the desktop",
    company: "Slack",
    url: "https://slack.engineering/rebuilding-slack-on-the-desktop/",
    takeaway:
      "Migrating a desktop client people leave open all day, piece by piece behind the running product, because the big-bang rewrite was never going to ship.",
    themes: ["Frontend at scale"],
  },
  {
    title: "Counting calories: the UberEats.com web app rewrite",
    company: "Uber",
    url: "https://www.uber.com/us/en/blog/uber-eats-com-web-app-rewrite/",
    takeaway:
      "Treating page weight as a budget the team spends rather than a number it reports, and what that constraint forced out of the rewrite.",
    themes: ["Frontend at scale"],
  },
  {
    title: "A Pinterest progressive web app performance case study",
    company: "Pinterest",
    url: "https://medium.com/dev-channel/a-pinterest-progressive-web-app-performance-case-study-3bd6ed2e6154",
    takeaway:
      "A mobile web rebuild measured against the old site on real devices and real networks, with the engagement numbers that followed the load time down.",
    themes: ["Frontend at scale"],
    concept: "latency-throughput-availability",
  },
  {
    title: "From development to real users: creating a web performance story",
    company: "Spotify",
    url: "https://engineering.atspotify.com/2022/09/from-development-to-real-users-how-to-create-a-web-performance-story",
    takeaway:
      "How to prove a performance investment is worth making and that it landed, by pairing lab numbers with what real users actually experienced.",
    themes: ["Frontend at scale"],
    concept: "latency-throughput-availability",
  },
  {
    title: "Measuring and optimizing performance of single-page applications",
    company: "LinkedIn",
    url: "https://www.linkedin.com/blog/engineering/optimization/measuring-and-optimizing-performance-of-single-page-applications",
    takeaway:
      "A single-page app has no page load to measure, so they defined what finished means from real user monitoring and optimized against that instead.",
    themes: ["Frontend at scale"],
    concept: "latency-throughput-availability",
  },
  {
    title: "Edison: a faster, more powerful Dropbox on the web",
    company: "Dropbox",
    url: "https://dropbox.tech/frontend/edison-webserver-a-faster-more-powerful-dropbox-on-the-web",
    takeaway:
      "Replacing the web serving tier so the browser gets markup early and streams the rest, rather than waiting on one slow backend call before anything renders.",
    themes: ["Frontend at scale", "Scaling"],
  },
  {
    title: "How we use web components at GitHub",
    company: "GitHub",
    url: "https://github.blog/engineering/architecture-optimization/how-we-use-web-components-at-github/",
    takeaway:
      "Betting the shared component layer on the platform instead of a framework, so behaviour survives the next rendering stack the app moves to.",
    themes: ["Frontend at scale"],
  },
  {
    title: "How Stripe builds interactive docs with Markdoc",
    company: "Stripe",
    url: "https://stripe.dev/blog/markdoc",
    takeaway:
      "A content format that gives writers interactivity and page logic without letting application code into the content, so the docs stay editable by people who do not ship code.",
    themes: ["Frontend at scale", "API design"],
  },
  {
    title: "Building Cloudflare on Cloudflare",
    company: "Cloudflare",
    url: "https://blog.cloudflare.com/building-cloudflare-on-cloudflare/",
    takeaway:
      "Moving the dashboard and its APIs onto the same edge platform they sell, and what running your own product as its biggest customer exposes.",
    themes: ["Frontend at scale", "Scaling"],
    concept: "content-delivery-networks",
  },
  {
    title: "Framework-defined infrastructure",
    company: "Vercel",
    url: "https://vercel.com/blog/framework-defined-infrastructure",
    takeaway:
      "Deriving the infrastructure a deploy needs from the framework's own code, instead of writing it a second time by hand as configuration.",
    themes: ["Frontend at scale"],
  },
];

/** The two shelves the browser opens on. Carrying the frontend theme puts a study
    in that shelf and takes it out of the other one, so every study sits on exactly
    one of them. */
export const SHELVES = {
  frontend: {
    title: "Frontend at Scale",
    blurb:
      "The part of the system the user actually touches, rebuilt by the teams behind Netflix, Figma, Shopify and Slack. What they rewrote, what it cost, and what the numbers did afterwards.",
    studies: caseStudies.filter((study) => study.themes.includes("Frontend at scale")),
  },
  systems: {
    title: "Postmortem blueprints",
    blurb:
      "The backend behind the product: outages with the timeline attached, the papers the patterns came from, and write-ups of designs that held. Each one links to the concept it backs.",
    studies: caseStudies.filter((study) => !study.themes.includes("Frontend at scale")),
  },
} as const;

export type ShelfKey = keyof typeof SHELVES;

export const isShelfKey = (value: string | null): value is ShelfKey =>
  value !== null && value in SHELVES;

const publishedConcepts = new Map(
  groups.flatMap((group) => group.concepts.map((concept) => [concept.slug, concept.title] as const)),
);

/** Concept title for a case study, or undefined when that concept is not published yet. */
export function conceptTitleFor(study: CaseStudy) {
  return study.concept ? publishedConcepts.get(study.concept) : undefined;
}

/** The case studies backing one concept, for its page's rail. Most concepts have
    none — only seven of the fourteen are covered — so callers must handle empty. */
export function studiesForConcept(slug: string) {
  return caseStudies.filter((study) => study.concept === slug);
}
