# System Design Roadmap

A free, structured course on system design fundamentals: scaling, databases, caching, APIs,
and the trade-offs behind every distributed system.

**Read it at [systemdesignbits.vercel.app](https://systemdesignbits.vercel.app)**

Lessons marked *(coming soon)* are written and in review, not yet published.

Every lesson is one self-contained page: the big idea, why the problem exists, an analogy, the
mechanism itself, worked examples and diagrams, what real systems do, common mistakes, and a
quiz to check what stuck. No prior background assumed, read them in any order.

---

## Fundamentals

Start here if you are new. How a request actually travels, how systems are shaped, and the
order to think in when handed a blank page.

- [The Lifecycle of a Software Request](https://systemdesignbits.vercel.app/lessons/07-request-lifecycle) — How an HTTP request works end to end: DNS lookup, TCP and TLS handshake, load balancer, server, database, and where the round trip time goes.
- [Architectural Styles: Monolith to Event-Driven](https://systemdesignbits.vercel.app/lessons/10-architectural-styles) — Monolith vs microservices vs event-driven architecture: the modular monolith in between, when to move, and what each step actually costs.
- A 7-Step Walkthrough for Any System Design *(coming soon)* — A 7-step system design framework: requirements, estimation, API design, data model, high level design, deep dives, and finding bottlenecks.

## Scaling and Trade-offs

What breaks as traffic grows, and what each fix costs you.

<!-- LESSON_LINKS_START -->
- [Scalability: Vertical vs Horizontal Scaling](https://systemdesignbits.vercel.app/lessons/01-horizontal-vs-vertical-scaling) — Horizontal vs vertical scaling explained: scale out versus scale up, stateless servers behind a load balancer, and how real systems choose.
- [Latency, Throughput & Availability](https://systemdesignbits.vercel.app/lessons/02-latency-throughput-availability) — Latency, throughput and availability explained: what each metric measures, p99 percentiles, how they trade off, and what nines of uptime cost.
- [CAP Theorem & Trade-offs](https://systemdesignbits.vercel.app/lessons/03-cap-theorem) — CAP theorem explained: consistency vs availability during a network partition, CP vs AP systems, eventual consistency, quorums, and PACELC.
- [Core Concepts of Load Balancing](https://systemdesignbits.vercel.app/lessons/04-load-balancing) — Load balancing explained: layer 4 vs layer 7, round robin and least connections, health checks and failover, and sticky sessions.
- [Design Requirements & Estimating Resource Needs](https://systemdesignbits.vercel.app/lessons/05-requirements-and-estimation) — Back of the envelope estimation for system design: functional vs non-functional requirements, QPS, storage capacity, and bandwidth sizing.
<!-- LESSON_LINKS_END -->
- Caching Strategies & Cache Invalidation *(coming soon)* — Caching strategies explained: cache-aside, write-through and write-back, TTL vs explicit invalidation, cache stampede, and cache penetration.

## Communication and APIs

How parts of a system talk to each other, and how you expose one to the outside.

- [Choosing a Communication Pattern](https://systemdesignbits.vercel.app/lessons/06-communication-patterns) — Polling vs webhooks vs WebSockets: long polling and server-sent events compared, and the update rate and latency each pattern really fits.
- [API Design: REST, GraphQL, and gRPC](https://systemdesignbits.vercel.app/lessons/08-api-design) — REST vs GraphQL vs gRPC compared: fixed response shapes, over-fetching and under-fetching, the N+1 problem, protobuf, and when to use each.

## Data Storage and Management Strategies

Choosing a database, then surviving the size of it.

- [Selecting Relational vs NoSQL Database Models](https://systemdesignbits.vercel.app/lessons/01-relational-vs-nosql) — SQL vs NoSQL explained: ACID transactions and JOINs versus flexible schemas and horizontal scale, and how access patterns decide the choice.
- [Implementing Database Sharding and Partitioning](https://systemdesignbits.vercel.app/lessons/02-database-sharding-partitioning) — Database sharding and partitioning explained: shard keys, range vs hash sharding, hot shards, shard maps, and the cost of cross-shard joins.

---

## Running it locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000). `pnpm build` runs the production build.

## How this repo is laid out

| Path | What lives there |
| --- | --- |
| `src/lessons/<slug>.tsx` | One lesson, one component |
| `src/app/lessons/[slug]/page.tsx` | The single route that renders and titles every lesson |
| `src/lib/lessons.ts` | The lesson index: slug, title, description, grouping, and prev/next order |
| `src/lib/seo.ts` | Canonical URL, site name, and per-lesson metadata |
| `src/components/` | Shared lesson UI: layout, breadcrumb, quiz carousel, side panel, marker lists |
| `drafts/` | Lesson drafts waiting to ship |
| `scripts/` | `lessons.json` (the queue) and `ship-next-lesson.mjs` (moves a draft into the app, lists it, and opens a PR) |

Lessons are grouped by topic, not numbered globally, so a new lesson can join the track it
belongs to without renumbering anything.
