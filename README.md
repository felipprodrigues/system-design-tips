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

- [The Lifecycle of a Software Request](https://systemdesignbits.vercel.app/lessons/07-request-lifecycle) — follow one HTTP request end to end: DNS, TCP and TLS, the load balancer, the server, the database, and where the time in a round trip actually goes.
- Architectural Styles: Monolith to Event-Driven *(coming soon)* — monolith, modular monolith, microservices, and event-driven: the progression teams get forced through, what triggers each move, and what each step costs.
- A 7-Step Walkthrough for Any System Design *(coming soon)* — a repeatable seven-step order for any system design problem, what each step hands the next, and the ways the framework gets misused in interviews.

## Scaling and Trade-offs

What breaks as traffic grows, and what each fix costs you.

<!-- LESSON_LINKS_START -->
- [Scalability: Vertical vs Horizontal Scaling](https://systemdesignbits.vercel.app/lessons/01-horizontal-vs-vertical-scaling) — vertical scaling buys a bigger machine, horizontal scaling buys more of them. What each costs, why state is the hard part, and how real systems choose.
- [Latency, Throughput & Availability](https://systemdesignbits.vercel.app/lessons/02-latency-throughput-availability) — the three numbers every system is judged by: what each actually measures, and how improving one degrades another.
- [CAP Theorem & Trade-offs](https://systemdesignbits.vercel.app/lessons/03-cap-theorem) — during a network partition a system stays consistent or stays available, never both. CP versus AP, the consistency spectrum, quorums, and PACELC.
- [Core Concepts of Load Balancing](https://systemdesignbits.vercel.app/lessons/04-load-balancing) — how traffic gets spread across servers: layer 4 versus layer 7, routing algorithms, health checks and failover, and removing the single point of failure.
- [Design Requirements & Estimating Resource Needs](https://systemdesignbits.vercel.app/lessons/05-requirements-and-estimation) — turn a vague product goal into numbers: functional versus non-functional requirements, back-of-the-envelope estimation, storage, and bandwidth sizing.
<!-- LESSON_LINKS_END -->
- Caching Strategies & Cache Invalidation *(coming soon)* — cache-aside, write-through, and write-back, plus TTLs, explicit invalidation, stampedes, and penetration: keeping a second copy of the truth honest.

## Communication and APIs

How parts of a system talk to each other, and how you expose one to the outside.

- [Choosing a Communication Pattern](https://systemdesignbits.vercel.app/lessons/06-communication-patterns) — polling, long polling, webhooks, SSE, and WebSockets: how a system learns about changes it did not initiate, and which pattern fits which update rate.
- [API Design: REST, GraphQL, and gRPC](https://systemdesignbits.vercel.app/lessons/08-api-design) — the three styles compared by the caller each is built for: fixed response shapes, over-fetching, the N+1 problem, and where each one fits.

## Data Storage and Management Strategies

Choosing a database, then surviving the size of it.

- [Selecting Relational vs NoSQL Database Models](https://systemdesignbits.vercel.app/lessons/01-relational-vs-nosql) — when to choose SQL and when to choose NoSQL: ACID guarantees and JOINs versus flexible schemas and horizontal scale, decided by your access patterns.
- [Implementing Database Sharding and Partitioning](https://systemdesignbits.vercel.app/lessons/02-database-sharding-partitioning) — range and hash sharding, shard keys and hot shards, partitioning inside one node, shard maps, and the cost sharding adds to joins and transactions.

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
