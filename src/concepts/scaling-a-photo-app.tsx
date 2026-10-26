"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Cpu,
  Database,
  Gauge,
  Globe,
  LifeBuoy,
  ListOrdered,
  Network,
  Server,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ConceptHeader,
  LearnedToggle,
  MarkerList,
  QuizCarousel,
} from "@/components";
import type { QuizCard } from "@/components";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "An app has 10,000 users and the database is pinned at 90% CPU. Why is sharding the wrong first move?",
    answers: ["Because sharding is the fix for writes outgrowing one machine, and at 10,000 users almost nothing is write-bound. The load is reads, which a cache or a read replica absorbs without changing the data model at all. Sharding buys write capacity you will not use for years, and charges for it immediately: every query that spans users gets harder, joins and transactions stop being free, and a shard key chosen this early is chosen before you know the access patterns that have to live with it."],
  },
  {
    question: "Reads and writes both outgrow a single database eventually. Why do read replicas fix only one of them?",
    answers: ["Because a replica is a copy that receives every write the primary accepts, so it adds capacity for reading that copy and none for accepting new writes. Ten replicas still means one machine committing every insert, and each of them has to apply that same write stream to keep up. Splitting the writes needs the data itself split across machines, which is sharding. Replicas scale the reading of one dataset; shards scale the dataset."],
  },
  {
    question: "You already run a cache in front of the database. Why does a CDN still help, and why doesn't it remove the need for the cache?",
    answers: ["They shorten different parts of the same wait. The cache removes repeated work: a query that was already answered is not run again. The CDN removes distance: bytes that already exist come from a machine in the user's city instead of one continent away. A photo request is almost entirely distance and almost no work, so the CDN is what fixes it, and a feed query is almost entirely work, so the cache is what fixes that. Neither covers the other's case."],
  },
  {
    question: "Emma posts a photo, refreshes, and it isn't there. Every machine is healthy and no write was lost. What happened, and what is the cheapest fix that keeps the replicas useful?",
    answers: ["Her write went to the primary and her refresh was served by a replica that had not received the copy yet, which is replication lag doing exactly what it does. The cheap fix is not to make every read strongly consistent, it is to route only the reads that are about to expose the lag to the primary: a user's own content right after that user wrote it. Everything else, other people's feeds, like counts, follower totals, stays on the replicas and stays a moment behind, which nobody can see."],
  },
  {
    question: "A limit of 100 requests per minute is configured on each of 8 servers behind a round-robin load balancer. What limit does a client actually hit?",
    answers: ["Roughly 800 per minute, because round robin spreads one client's requests across all 8 servers and each server counts only the ones it personally saw. Every server is correctly enforcing 100 and the fleet is enforcing 800. The limit only means what it says if the counter is shared, usually in something like Redis that all servers increment, so the decision is made against one number rather than eight."],
  },
  {
    question: "Failover is automatic and completes in 90 seconds. Why is that still an outage, and what has to exist outside the database for those 90 seconds not to lose work?",
    answers: ["Because for 90 seconds there is nothing accepting writes, so every upload, comment and like attempted in that window fails. Automatic failover protects the data, not the requests in flight. For the work to survive, something has to hold it and try again: a queue that keeps the job until a worker succeeds, retries with backoff on the write path, and operations that are safe to repeat so a retry after a partial failure does not create the same row twice."],
  },
];

const whyThisExists = [
  "These ten terms are usually taught as a list of components, which makes them look like a checklist to apply. Each one is really a response to a specific symptom, and reaching for it before the symptom exists buys the cost with *none of the benefit*.",
  "A real system and an interview question ask the same thing: *what breaks first, and what does fixing it cost*. Someone who shards a 10,000-user database has answered a question nobody asked, and has given up cross-shard queries to do it.",
  "Growing one app from a single server to a million users puts the pieces in the only order that explains them, *the order the breaks actually arrive in*, so the reason for each one is still attached to it when you meet it again on its own.",
];

/* The ten stages, each one a break followed by the fix it calls for. `nearest` marks
   a stage whose deep dive is the closest concept rather than a dedicated one — read
   replicas and message queues do not have their own page yet. */
const stages = [
  {
    piece: "Scaling",
    scale: "10,000 users",
    shows: "One server became three identical ones, each holding nothing of its own.",
    trigger: "The single server sits at 100% CPU through the evening peak and response times climb from 80ms to four seconds. Nothing is broken, there is simply not enough machine.",
    fix: "Scale up first: a bigger instance, one restart, no code change. When the biggest available machine still isn't enough, scale out instead, running several identical servers that share the work.",
    cost: "Scaling up has a hard ceiling and leaves one machine whose death is the whole outage. Scaling out means the servers can no longer keep anything of their own, so sessions and uploaded files have to move off local disk before it works at all.",
    dive: { slug: "horizontal-vs-vertical-scaling", title: "Scalability: Vertical vs Horizontal Scaling" },
  },
  {
    piece: "Load balancing",
    scale: "3 app servers",
    shows: "A balancer in front, so a request has something choosing for it.",
    trigger: "Three servers now exist and nothing decides which of them answers a request. One gets all the traffic, the other two idle, and when one dies requests keep being sent to it.",
    fix: "A load balancer in front of the three, spreading requests across them and health-checking each one, so a server that stops responding stops receiving traffic until it recovers.",
    cost: "The balancer is now the piece that must not die, so it needs its own redundancy. It also makes sticky sessions tempting, which quietly undoes the statelessness the previous stage paid for.",
    dive: { slug: "load-balancing", title: "Core Concepts of Load Balancing" },
  },
  {
    piece: "Caching",
    scale: "60,000 users",
    shows: "A cache beside the database, catching the reads that keep repeating.",
    trigger: "Everyone opens the same trending posts. Every refresh runs the same query against the same rows, and the database is at 90% CPU while the app servers are half idle.",
    fix: "Redis between the app and the database, holding the popular results in memory. Most reads stop at the cache, and entries expire after a short while so the feed does not freeze in place.",
    cost: "A second copy of the truth. Every path that writes those rows now has to invalidate the cached version, and when one forgets, the failure is silent: the system keeps serving a wrong answer, fast.",
    dive: { slug: "caching-strategies", title: "Caching Strategies & Cache Invalidation" },
  },
  {
    piece: "CDNs",
    scale: "Users in 40 countries",
    shows: "Edge nodes holding the photos, so the bytes start near the user.",
    trigger: "A user in Sydney waits four seconds for a photo that travels from Virginia. The query took 20ms. The other 3,900 was the image crossing the planet.",
    fix: "A CDN: servers in many cities, each keeping copies of your photos, so every download comes from the nearest one instead of from your origin.",
    cost: "Now two caches have an opinion about every file. A long expiry plus a filename that never changes serves last week's image for a week, which is why uploaded and built assets get content-hashed names.",
    dive: { slug: "content-delivery-networks", title: "Content Delivery Networks (CDNs)" },
  },
  {
    piece: "Replication",
    scale: "250,000 users",
    shows: "The database split in two roles: a primary that takes writes, replicas that take reads.",
    trigger: "The database is the bottleneck again, and the cache cannot absorb this part: most traffic is people scrolling their own feeds, and a personal feed is a different query for every user, so there is nothing popular to reuse.",
    fix: "Read replicas, which are read-only copies. New posts go to the main database, the primary, which copies them to the replicas, and the replicas take the reading.",
    cost: "Replication lag. A replica is always a moment behind, so a read can return a version of the world from just before the write that is already committed. That is stage nine's problem, bought here.",
    dive: { slug: "database-sharding-partitioning", title: "Implementing Database Sharding and Partitioning", nearest: true },
  },
  {
    piece: "Sharding",
    scale: "1,000,000 users",
    shows: "Split again, this time across shards, so writes have more than one machine.",
    trigger: "Reads are handled, but every write still lands on the primary, and at peak the uploads alone exceed what one machine can commit. There is no bigger instance left to buy.",
    fix: "Shard: split the rows across several databases using a shard key, usually the user ID, so each database owns a slice of the users and takes only that slice of the writes.",
    cost: "Anything that spans the slices gets harder. A search across all users, a join, a transaction touching two users: each now needs several databases and code to stitch the answers together. A poorly chosen key puts the busiest users on one shard, which runs hot while the rest idle.",
    dive: { slug: "database-sharding-partitioning", title: "Implementing Database Sharding and Partitioning" },
  },
  {
    piece: "Message queues",
    scale: "Every upload",
    shows: "A queue off to the side, and workers doing the slow part after the response went out.",
    trigger: "Each upload resizes the photo into five sizes and notifies a few thousand followers. All of it happens before the response returns, so the person who pressed Share watches a spinner for nine seconds.",
    fix: "The server stores the photo, drops a job onto a queue, and replies immediately. Background workers pick the job up and do the slow part, and if a worker crashes halfway the job goes back on the queue for another one.",
    cost: "The work is no longer finished when the response says so, which the interface has to admit: a photo that exists but has no thumbnail yet is a state that must be designed. And since a job can run twice, running it twice has to be harmless.",
    dive: { slug: "architectural-styles", title: "Architectural Styles: Monolith to Event-Driven", nearest: true },
  },
  {
    piece: "Rate limiting",
    scale: "One bad client",
    shows: "A limiter in front of everything, counting requests per client.",
    trigger: "A script hits the API three thousand times a second. It is not malicious, it is a scraper with no sleep in its loop, and it takes the p99 for every real user with it.",
    fix: "A limit per client, checked before the expensive work runs: so many requests per minute, with everything over the line rejected outright and told when to come back.",
    cost: "The counter has to be shared across the fleet. Enforced per server, the real limit is your number multiplied by the number of servers, and a legitimate burst from a large customer now looks identical to abuse.",
    dive: { slug: "rate-limiting", title: "Rate Limiting" },
  },
  {
    piece: "Consistency",
    scale: "One visible staleness",
    shows: "No new box. This stage is a routing decision: whose reads may be a moment behind.",
    trigger: "Emma posts a photo, pulls to refresh, and it is gone. Nothing failed. Her read landed on a replica that had not received the copy yet, so it answered honestly with a world that did not contain her post.",
    fix: "Decide per feature rather than globally. A like count can lag by a second and nobody notices. Emma's own post cannot, so a read about a user's own content, just after that user wrote it, goes to the primary.",
    cost: "Every strongly consistent read gives up the replica capacity you added in stage five and pays the primary's latency instead, so they are spent only where the staleness would actually be seen.",
    dive: { slug: "cap-theorem", title: "CAP Theorem & Trade-offs" },
  },
  {
    piece: "Failover",
    scale: "3 in the morning",
    shows: "A standby beside the shards, synced and waiting to be promoted.",
    trigger: "The primary's machine dies. Reads keep working off the replicas and cache, which makes it worse: the app looks alive while every upload, comment and like fails.",
    fix: "A standby kept in sync with the primary, and automatic promotion when the primary stops answering. On Amazon RDS Multi-AZ this typically takes one to two minutes.",
    cost: "Those one to two minutes are an outage for every write. The standby costs as much as the primary while doing nothing, and a promotion that fires on a brief network blip instead of a real death is its own kind of incident.",
    dive: { slug: "latency-throughput-availability", title: "Latency, Throughput & Availability" },
  },
];

const recap = [
  { piece: "Scaling", when: "One machine is at its limit", cost: "A ceiling, or statelessness" },
  { piece: "Load balancers", when: "More than one server exists", cost: "A new piece that must not die" },
  { piece: "Caching", when: "The same read keeps repeating", cost: "A second copy to invalidate" },
  { piece: "CDNs", when: "Users are far from your files", cost: "Stale assets after a deploy" },
  { piece: "Replication", when: "Reads outgrow one database", cost: "Replication lag" },
  { piece: "Sharding", when: "Writes outgrow one database", cost: "Cross-shard queries and joins" },
  { piece: "Message queues", when: "A request waits on slow work", cost: "Unfinished state, and retries" },
  { piece: "Rate limiting", when: "One client can hurt the rest", cost: "A counter shared fleet-wide" },
  { piece: "Consistency", when: "A stale read becomes visible", cost: "Latency, paid per feature" },
  { piece: "Failover", when: "A dead machine stops writes", cost: "A standby, and a minute down" },
];

const seenInTheWild = [
  "Instagram reached tens of millions of users on sharded PostgreSQL, splitting rows across many logical shards keyed by user ID, with Memcached in front absorbing the read traffic. The order of the ladder above is close to the order they actually walked it.",
  "Netflix does not rent a CDN for video, it ships its own Open Connect appliances into ISP data centres. That is stage four taken to its conclusion: the bytes start in the same building as the viewer.",
  "Amazon RDS Multi-AZ keeps a synchronous standby in a second availability zone and promotes it automatically, typically in one to two minutes, which is the realistic shape of stage ten rather than the zero-downtime version people assume.",
  "Nearly every photo or video you have uploaded anywhere went onto a queue: the response came back the moment the file landed, while resizing, transcoding, moderation and notifications ran behind it.",
];

const keyPoints = [
  "Every piece here is *a response to a specific break*, not a rung on a maturity ladder. The skill is matching the symptom to the fix, not knowing the list.",
  "Reads and writes outgrow a database separately. *Replicas fix reads, sharding fixes writes*, and most applications need the first years before the second.",
  "A cache and a CDN both store copies but solve different waits: *one skips repeated work, the other shortens distance*.",
  "A queue does not make slow work fast, it *moves it off the request path*, which moves unfinished state into the interface.",
  "Consistency is a per-feature decision, not a database setting. *A like count can lag, somebody's own post cannot*.",
  "Every fix adds a cost, so system design is really *choosing which cost your app can live with*.",
];

const commonMistakes = [
  "Sharding at 10,000 users because the design doc said a million, paying for cross-shard queries years before one machine would have struggled with the writes.",
  "Scaling out before making the servers stateless, so sessions sit on local disk and a user who lands on a different server is silently signed out.",
  "Adding a cache with no invalidation plan, then chasing a 'random' wrong value that is really one write path nobody remembered to update.",
  "Reading from a replica immediately after writing to the primary, then filing the missing row as a database bug rather than the replication lag it is.",
  "Enforcing a rate limit per server instead of per client across the fleet, so the real limit is the configured number times the number of servers.",
  "Treating automatic failover as zero downtime, when a promotion still refuses writes for a minute or two and nothing in the stack retries them.",
];

const furtherReading = [
  {
    title: "The Amazon Builders' Library",
    source: "AWS",
    note: "How Amazon's own teams build and operate the pieces on this ladder: timeouts and retries, load shedding, health checks, and what failover looks like when it is written by the people paged for it.",
    href: "https://aws.amazon.com/builders-library/",
  },
  {
    title: "Amazon RDS Multi-AZ",
    source: "AWS documentation",
    note: "The standby-and-promotion model from stage ten, documented by the service most teams actually use for it, including the failover window you are buying.",
    href: "https://aws.amazon.com/rds/features/multi-az/",
  },
];

/* ---- Diagrams ---------------------------------------------------------- */

const arrowDefs = (
  <defs>
    <marker id="sd-101-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
    </marker>
    <marker id="sd-101-arrow-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-danger)" />
    </marker>
  </defs>
);

interface BoxProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  n?: number;
  accent?: boolean;
  /** The piece this stage just added, ringed so the eye finds it. */
  isNew?: boolean;
  /** A lucide icon renders as a nested <svg>, positioned with x and y like any
      other SVG child. With one present the text left-aligns beside it. */
  icon?: LucideIcon;
}

/* One labelled node. `n` stamps the stage number that introduced it, which is the
   only reason the big diagram reads as a summary rather than another architecture
   picture. */
function Box({ x, y, w = 150, h = 48, label, sub, n, accent, isNew, icon: Icon }: BoxProps) {
  const textX = Icon ? x + 42 : x + w / 2;
  const anchor = Icon ? "start" : "middle";
  return (
    <g>
      {isNew && <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx={13} fill="none" stroke="var(--sd-accent)" strokeWidth="1.5" strokeDasharray="4 4" />}
      <rect x={x} y={y} width={w} height={h} rx={9} fill="var(--sd-surface2)" stroke={isNew ? "var(--sd-accent)" : accent ? "var(--sd-teal)" : "var(--sd-border-strong)"} strokeWidth={isNew ? 2 : 1.5} />
      {Icon && (
        <Icon
          x={x + 14}
          y={y + h / 2 - 10}
          width={20}
          height={20}
          strokeWidth={1.7}
          stroke={accent ? "var(--sd-teal)" : "var(--sd-accent)"}
        />
      )}
      <text x={textX} y={sub ? y + 21 : y + h / 2 + 4} textAnchor={anchor} fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">{label}</text>
      {sub && (
        <text x={textX} y={y + 36} textAnchor={anchor} fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{sub}</text>
      )}
      {n !== undefined && (
        <>
          <circle cx={x + w - 1} cy={y + 1} r={11} fill="var(--sd-bg)" stroke="var(--sd-accent)" strokeWidth="1.5" />
          <text x={x + w - 1} y={y + 5} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fontWeight="700" fill="var(--sd-accent)">{n}</text>
        </>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-101-arrow)" />
      {label && (
        <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 - 5} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{label}</text>
      )}
    </g>
  );
}

/* ---- The growing architecture ------------------------------------------

   One diagram for all ten stages rather than ten diagrams. Every node and edge
   carries the stage it appears at, and `until` for the two that get replaced
   later: the single database becomes a primary and replicas at stage five, and
   those become shards at six. Nothing ever moves, it only arrives, which is the
   point the page is making.

   Positions are hand-placed for the full stage-ten layout, so early stages read
   as sparse on purpose — that is what the architecture actually looked like. */

interface Placed {
  from: number;
  /** Last stage this exists for, when a later stage replaces it. */
  until?: number;
}

interface DiagramNode extends Placed {
  id: string;
  label: string;
  icon: LucideIcon;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  accent?: boolean;
}

const diagramNodes: DiagramNode[] = [
  { id: "phones", icon: Smartphone, label: "Phones", sub: "users", x: 365, y: 16, from: 1 },
  { id: "cdn", icon: Globe, label: "CDN", sub: "edge nodes", x: 100, y: 108, from: 4 },
  { id: "limiter", icon: ShieldCheck, label: "Rate limiter", sub: "per client", x: 365, y: 108, from: 8 },
  { id: "lb", icon: Network, label: "Load balancer", sub: "health-checked", x: 365, y: 192, from: 2 },
  { id: "app", icon: Server, label: "App servers", sub: "stateless, \u00d73", x: 365, y: 276, from: 1 },
  { id: "cache", icon: Zap, label: "Redis cache", sub: "hot results, TTL", x: 120, y: 366, from: 3 },
  { id: "queue", icon: ListOrdered, label: "Message queue", sub: "resize, notify", x: 700, y: 366, from: 7 },
  { id: "workers", icon: Cpu, label: "Workers", sub: "retry on crash", x: 700, y: 450, from: 7 },
  { id: "db", icon: Database, label: "Database", sub: "one machine", x: 365, y: 480, from: 1, until: 4, accent: true },
  { id: "primary", icon: Database, label: "Primary", sub: "all writes", x: 290, y: 480, w: 140, from: 5, until: 5, accent: true },
  { id: "replicas", icon: Copy, label: "Replicas \u00d72", sub: "reads only", x: 450, y: 480, w: 140, from: 5, until: 5, accent: true },
  { id: "shardA", icon: Database, label: "Shard A", sub: "primary + replicas", x: 160, y: 480, w: 175, from: 6, accent: true },
  { id: "shardB", icon: Database, label: "Shard B", sub: "primary + replicas", x: 350, y: 480, w: 175, from: 6, accent: true },
  { id: "standby", icon: LifeBuoy, label: "Standby", sub: "kept in sync", x: 540, y: 480, w: 140, from: 10 },
];

interface DiagramEdge extends Placed {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

const diagramEdges: DiagramEdge[] = [
  { x1: 440, y1: 64, x2: 440, y2: 272, label: "requests", from: 1, until: 1 },
  { x1: 440, y1: 64, x2: 440, y2: 188, label: "requests", from: 2, until: 7 },
  { x1: 440, y1: 64, x2: 440, y2: 104, label: "API calls", from: 8 },
  { x1: 440, y1: 156, x2: 440, y2: 188, from: 8 },
  { x1: 365, y1: 46, x2: 186, y2: 104, label: "photos", from: 4 },
  { x1: 440, y1: 240, x2: 440, y2: 272, from: 2 },
  { x1: 380, y1: 324, x2: 270, y2: 362, label: "reads", from: 3 },
  { x1: 195, y1: 414, x2: 195, y2: 476, label: "on a miss", from: 3 },
  { x1: 515, y1: 324, x2: 700, y2: 362, label: "jobs", from: 7 },
  { x1: 775, y1: 414, x2: 775, y2: 446, from: 7 },
  { x1: 440, y1: 324, x2: 440, y2: 476, from: 1, until: 4 },
  { x1: 430, y1: 324, x2: 380, y2: 476, label: "writes", from: 5, until: 5 },
  { x1: 460, y1: 324, x2: 510, y2: 476, label: "reads", from: 5, until: 5 },
  { x1: 420, y1: 324, x2: 280, y2: 476, from: 6 },
  { x1: 460, y1: 324, x2: 440, y2: 476, from: 6 },
];

function shown(item: Placed, stage: number) {
  return stage >= item.from && stage <= (item.until ?? stages.length);
}

const stepBtn = {
  fontFamily: "var(--sd-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 7,
  padding: "6px 10px",
  cursor: "pointer",
  background: "var(--sd-surface2)",
  border: "1px solid var(--sd-border)",
  color: "var(--sd-muted)",
} as const;

function GrowingArchitecture() {
  const [stage, setStage] = useState(1);
  const [playing, setPlaying] = useState(false);
  const last = stages.length;

  useEffect(() => {
    if (!playing || stage >= last) return;
    const timer = setTimeout(() => {
      setStage(stage + 1);
      if (stage + 1 >= last) setPlaying(false);
    }, 1900);
    return () => clearTimeout(timer);
  }, [playing, stage, last]);

  const current = stages[stage - 1];

  function play() {
    if (stage >= last) setStage(1);
    setPlaying(true);
  }

  /* One box: what this stage added on top, the diagram in the middle, the
     controls along the bottom. sd-figure supplies the frame, its padding is
     dropped so each band can run edge to edge. */
  return (
    <div className="sd-figure" style={{ padding: 0, overflow: "hidden" }}>
      <div aria-live="polite" style={{ padding: "14px 18px", borderBottom: "1px solid var(--sd-border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, color: "var(--sd-accent)" }}>
            Stage {stage}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--sd-text)" }}>{current.piece}</span>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>
            {current.scale}
          </span>
        </div>
        <p className="sd-text-sm-tight">{current.shows}</p>
      </div>

      <div style={{ overflowX: "auto", padding: "22px 18px" }}>
        <svg viewBox="0 0 880 580" role="img" aria-label="The architecture at stage ten: phones fetch photos from a CDN and send API calls through a rate limiter to a load balancer, which spreads them across three stateless app servers. The servers read from a Redis cache that falls through to two database shards, each a primary with two read replicas, alongside a standby. Slow work goes onto a message queue consumed by background workers." style={{ width: "100%", minWidth: 660, display: "block" }}>
          <title>{`The architecture after stage ${stage}, ${current.piece}`}</title>
          {arrowDefs}

          {diagramEdges.map((edge, i) => {
            const on = shown(edge, stage);
            return (
              <g key={i} className="sd-reveal" data-on={on} aria-hidden={!on}>
                <Arrow {...edge} />
              </g>
            );
          })}

          {diagramNodes.map((node) => {
            const on = shown(node, stage);
            return (
              <g key={node.id} className="sd-reveal" data-on={on} aria-hidden={!on}>
                {node.id === "app" && (
                  <>
                    <rect x={node.x + 14} y={node.y + 10} width={150} height={48} rx={9} fill="var(--sd-surface2)" stroke="var(--sd-border)" strokeWidth="1.5" />
                    <rect x={node.x + 7} y={node.y + 6} width={150} height={48} rx={9} fill="var(--sd-surface2)" stroke="var(--sd-border)" strokeWidth="1.5" />
                  </>
                )}
                <Box {...node} n={node.from} isNew={node.from === stage} />
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--sd-border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            style={{ ...stepBtn, color: "var(--sd-accent)", borderColor: "var(--sd-accent)" }}
          >
            {playing ? "\u25a0 Pause" : stage >= last ? "\u21bb Replay" : "\u25b6 Play"}
          </button>

          <div role="group" aria-label="Stage" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {stages.map((s, i) => {
              const active = i + 1 === stage;
              return (
                <button
                  key={s.piece + i}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Stage ${i + 1}, ${s.piece}`}
                  onClick={() => {
                    setPlaying(false);
                    setStage(i + 1);
                  }}
                  style={{
                    ...stepBtn,
                    padding: "6px 9px",
                    background: active ? "var(--sd-accent-wash)" : "var(--sd-surface2)",
                    borderColor: active ? "var(--sd-accent)" : "var(--sd-border)",
                    color: active ? "var(--sd-accent)" : "var(--sd-muted)",
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => { setPlaying(false); setStage((n) => Math.max(1, n - 1)); }} disabled={stage === 1} style={{ ...stepBtn, opacity: stage === 1 ? 0.45 : 1, cursor: stage === 1 ? "default" : "pointer" }}>
            &larr; Back
          </button>
          <button type="button" onClick={() => { setPlaying(false); setStage((n) => Math.min(last, n + 1)); }} disabled={stage === last} style={{ ...stepBtn, opacity: stage === last ? 0.45 : 1, cursor: stage === last ? "default" : "pointer" }}>
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

/* The same ten stages as the diagram above, one at a time. All ten stay in the
   DOM and only the current one is displayed, so the text is still findable and
   crawlable without costing ten cards of page height. */
function StageCarousel() {
  const [index, setIndex] = useState(0);
  const last = stages.length - 1;

  return (
    <div className="sd-figure" style={{ padding: 0, overflow: "hidden" }}>
      {/* ponytail: a floor rather than a measured height, so the controls stop
          jumping between a short stage and a long one. */}
      <div style={{ padding: "16px 18px", minHeight: 320 }} aria-label="Stage detail">
        {stages.map((stage, i) => (
          <div key={stage.piece + i} style={{ display: i === index ? "block" : "none" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--sd-text)" }}>{stage.piece}</span>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>{stage.scale}</span>
            </div>

            {/* auto-fit rather than a fixed 1fr 1fr: the pair drops to one column
                on a narrow screen without a breakpoint. Washes stay inside the
                palette's rules — danger for the break, accent for the fix, and a
                plain surface for the cost, which is a ledger line, not a hue. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              <div style={{ background: "var(--sd-danger-wash)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px" }}>
                <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)" }}>What breaks</p>
                <p className="sd-text-sm-tight">{stage.trigger}</p>
              </div>
              <div style={{ background: "var(--sd-accent-wash)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px" }}>
                <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>The fix</p>
                <p className="sd-text-sm-tight">{stage.fix}</p>
              </div>
            </div>

            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px", marginTop: 10 }}>
              <p className="sd-eyebrow-sub" style={{ color: "var(--sd-amber)" }}>What it costs</p>
              <p className="sd-text-sm-tight">{stage.cost}</p>
            </div>

            {/* Opens away from the page: the carousel keeps its place, and the
                stage you were reading is still here when the tab is closed. */}
            <Link
              href={`/concepts/${stage.dive.slug}`}
              target="_blank"
              rel="noopener"
              aria-label={`${stage.dive.title} (opens in a new tab)`}
              style={{ display: "inline-flex", alignItems: "baseline", gap: 7, marginTop: 14, fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-accent)", textDecoration: "none" }}
            >
              <span>↗</span>
              <span>
                {stage.dive.nearest ? "Closest deep dive: " : "Deep dive: "}
                {stage.dive.title}
              </span>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--sd-border)" }}>
        <div role="group" aria-label="Stage" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {stages.map((stage, i) => {
            const active = i === index;
            return (
              <button
                key={stage.piece + i}
                type="button"
                aria-pressed={active}
                aria-label={`Stage ${i + 1}, ${stage.piece}`}
                onClick={() => setIndex(i)}
                style={{
                  ...stepBtn,
                  padding: "6px 9px",
                  background: active ? "var(--sd-accent-wash)" : "var(--sd-surface2)",
                  borderColor: active ? "var(--sd-accent)" : "var(--sd-border)",
                  color: active ? "var(--sd-accent)" : "var(--sd-muted)",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setIndex((n) => Math.max(0, n - 1))} disabled={index === 0} style={{ ...stepBtn, opacity: index === 0 ? 0.45 : 1, cursor: index === 0 ? "default" : "pointer" }}>
            &larr; Back
          </button>
          <button type="button" onClick={() => setIndex((n) => Math.min(last, n + 1))} disabled={index === last} style={{ ...stepBtn, opacity: index === last ? 0.45 : 1, cursor: index === last ? "default" : "pointer" }}>
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

/* Emma's missing photo, as two reads around one write. */
const lanes = [
  { label: "Emma", x: 90, icon: Smartphone },
  { label: "App server", x: 320, icon: Server },
  { label: "Primary", x: 560, icon: Database, accent: true },
  { label: "Replica", x: 780, icon: Copy, accent: true },
];

function Lifelines({ bottom }: { bottom: number }) {
  return (
    <>
      {lanes.map((l) => {
        const Icon = l.icon;
        return (
          <g key={l.label}>
            <rect x={l.x - 72} y={10} width={144} height={36} rx={8} fill="var(--sd-surface2)" stroke={l.accent ? "var(--sd-teal)" : "var(--sd-border-strong)"} strokeWidth="1.5" />
            <Icon x={l.x - 60} y={19} width={18} height={18} strokeWidth={1.7} stroke={l.accent ? "var(--sd-teal)" : "var(--sd-accent)"} />
            <text x={l.x - 36} y={33} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">{l.label}</text>
            <line x1={l.x} y1={46} x2={l.x} y2={bottom} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
          </g>
        );
      })}
    </>
  );
}

function Msg({ from, to, y, label, danger }: { from: number; to: number; y: number; label: string; danger?: boolean }) {
  const dir = to > from ? -6 : 6;
  return (
    <g>
      <line x1={from} y1={y} x2={to + dir} y2={y} stroke={danger ? "var(--sd-danger)" : "var(--sd-border-strong)"} strokeWidth="1.5" markerEnd={danger ? "url(#sd-101-arrow-danger)" : "url(#sd-101-arrow)"} />
      <text x={(from + to) / 2} y={y - 8} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill={danger ? "var(--sd-danger)" : "var(--sd-muted)"}>{label}</text>
    </g>
  );
}

export default function Concept01SystemDesign101() {
  return (
    <>
      <ConceptHeader slug="scaling-a-photo-app" />
      <LearnedToggle />
      <p className="sd-lede">
        Ten pieces, one photo-sharing app, and the exact break that makes each one necessary.
      </p>

      {/* Big idea */}
      <div className="sd-section">
        <p className="sd-eyebrow">Big Idea</p>
        <div className="sd-prose" style={{ fontSize: 16 }}>
          <p>
            Scaling, load balancers, caching, CDNs, replication, sharding, queues, rate limiting, consistency, failover. Every one of them was added to some real system <strong className="sd-strong">the moment something broke without it</strong>. Nobody designs the million-user architecture on day one, they grow into it one break at a time, and each fix buys capacity by taking on a cost. Knowing the list is not the skill. Knowing which break calls for which fix, and what it will charge you, is.
          </p>
        </div>
      </div>

      {/* Why this exists */}
      <div className="sd-section">
        <p className="sd-eyebrow">Why This Exists</p>
        <h2 className="sd-h2">Why A List Of Components Is Not A Design</h2>
        <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists.map(hl)} />
      </div>

      {/* Think of it like */}
      <div className="sd-section">
        <p className="sd-eyebrow">Think Of It Like</p>
        <h2 className="sd-h2">A Food Cart That Became A Chain</h2>

        <div className="sd-prose">
          <p>
            One cart, one cook, one griddle. A queue forms down the block, so you buy a bigger griddle, which is <strong className="sd-strong">scaling up</strong>. The griddle has a size limit, so you open a second cart, which is <strong className="sd-strong">scaling out</strong>, and now somebody has to stand on the corner pointing people at the shorter line, which is the <strong className="sd-strong">load balancer</strong>.
          </p>
          <p style={{ marginTop: 12 }}>
            Then the three dishes everyone orders start getting cooked in advance and kept warm, which is a <strong className="sd-strong">cache</strong>. Customers across town get a branch in their own neighbourhood instead of a long walk, which is a <strong className="sd-strong">CDN</strong>. The paperwork that used to happen at the counter while the customer waited moves to a back office, which is a <strong className="sd-strong">queue</strong>.
          </p>
          <p style={{ marginTop: 12 }}>
            None of it was planned at the cart. Every piece arrived the week the previous setup stopped coping, and <strong className="sd-strong">every piece added something new to go wrong</strong>: a corner with nobody on it, a warm tray of yesterday&rsquo;s special, a back office that lost an order.
          </p>
        </div>
      </div>

      {/* Day one */}
      <div className="sd-section">
        <p className="sd-eyebrow">The Shape Of It</p>
        <h2 className="sd-h2">Day One, And It Is Already Correct</h2>

        <div className="sd-figure" style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 860 110" role="img" aria-label="A phone sends a request to one server, which runs both the application code and the database, and returns the response." style={{ width: "100%", minWidth: 520, display: "block" }}>
            <title>One server running the app and its database</title>
            {arrowDefs}
            <Box x={40} y={30} label="Phones" sub="100 users" icon={Smartphone} />
            <Arrow x1={190} y1={54} x2={330} y2={54} />
            <Box x={330} y={30} w={200} label="One server" sub="app code + database" accent icon={Server} />
            <Arrow x1={530} y1={54} x2={670} y2={54} />
            <Box x={670} y={30} label="Response" sub="80ms" icon={Gauge} />
          </svg>
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          At a hundred users this is not a naive architecture, it is <strong className="sd-strong">the right one</strong>. One moving part, one place to look when something breaks, and no network between the app and its data. Everything below is what happens when this stops being true, in the order it stops being true.
        </div>
      </div>

      {/* Watch it grow */}
      <div className="sd-section">
        <p className="sd-eyebrow">Interactive</p>
        <h2 className="sd-h2">Watch It Grow, One Break At A Time</h2>

        <div className="sd-prose" style={{ marginBottom: 16 }}>
          <p>
            One diagram, ten stages. Press play, or step through it. Nothing on the canvas ever
            moves, it only arrives, and the badge on each box is the stage that put it there.
          </p>
        </div>

        <GrowingArchitecture />

        <div className="sd-callout" style={{ marginTop: 16 }}>
          Stage ten is what a large architecture diagram usually is: not a design, but{" "}
          <strong className="sd-strong">a list of things that once broke</strong>, drawn all at once
          so the order is no longer visible. The ten cards below are that order.
        </div>
      </div>

      {/* The ladder */}
      <div className="sd-section">
        <p className="sd-eyebrow">The Walkthrough</p>
        <h2 className="sd-h2">Ten Breaks, And What Each Fix Costs</h2>

        <StageCarousel />

        <div className="sd-callout" style={{ marginTop: 16 }}>
          Read replicas and message queues do not have a page of their own here yet, so stages five and seven point at <strong className="sd-strong">the nearest concept</strong> rather than a dedicated one.
        </div>
      </div>

      {/* Worked example */}
      <div className="sd-section">
        <p className="sd-eyebrow">Worked Example</p>
        <h2 className="sd-h2">Emma&rsquo;s Photo, And The Replica That Had Not Heard</h2>

        <div className="sd-prose">
          <p>
            Stage five bought read capacity and stage nine pays for it. Here is the whole bill, in six messages: the write commits on the primary, the refresh is routed to a replica for the good reason that replicas are there to take reads, and the replica answers <strong className="sd-strong">correctly and uselessly</strong> with a world from a few hundred milliseconds ago.
          </p>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)", marginTop: 16 }}>Read routed to a replica</p>
        <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 20 }}>
          <svg viewBox="0 0 880 300" role="img" aria-label="Emma uploads a photo, the app server writes it to the primary and confirms. Emma refreshes, the app server reads from the replica, and the replica answers without the new photo because the primary has not finished copying it yet." style={{ width: "100%", minWidth: 640, display: "block" }}>
            <title>Replication lag hiding a user&rsquo;s own write</title>
            {arrowDefs}
            <Lifelines bottom={280} />
            <Msg from={90} to={320} y={86} label="upload photo" />
            <Msg from={320} to={560} y={122} label="write, commit" />
            <text x={670} y={154} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">copy in flight...</text>
            <Msg from={90} to={320} y={190} label="refresh feed" />
            <Msg from={320} to={780} y={226} label="read" />
            <Msg from={780} to={320} y={262} label="no such photo" danger />
          </svg>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>Own content read from the primary</p>
        <div className="sd-figure" style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 880 300" role="img" aria-label="The same sequence, except the refresh is recognised as a read of Emma's own recent write and routed to the primary, which returns the photo. The replica keeps serving every other read." style={{ width: "100%", minWidth: 640, display: "block" }}>
            <title>Routing a read-your-own-write to the primary</title>
            {arrowDefs}
            <Lifelines bottom={280} />
            <Msg from={90} to={320} y={86} label="upload photo" />
            <Msg from={320} to={560} y={122} label="write, commit" />
            <Msg from={90} to={320} y={158} label="refresh feed" />
            <text x={320} y={190} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">her own, just written</text>
            <Msg from={320} to={560} y={226} label="read" />
            <Msg from={560} to={320} y={262} label="the photo" />
          </svg>
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          The fix is one routing rule, not a consistency setting. Everybody else&rsquo;s feed, every like count, every follower total <strong className="sd-strong">stays on the replicas and stays slightly behind</strong>, because nobody can tell. Only the reads that would expose the lag to the person who caused it go to the primary.
        </div>
      </div>

      {/* Recap */}
      <div className="sd-section">
        <p className="sd-eyebrow">Reference</p>
        <h2 className="sd-h2">The Whole Growth Path</h2>

        <div style={{ border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1.4fr", gap: 0, background: "rgba(106, 118, 163,0.1)", padding: "10px 16px" }}>
            {["Piece", "Needed the moment", "What it costs"].map((h) => (
              <span key={h} style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)" }}>{h}</span>
            ))}
          </div>
          {recap.map((row, i) => (
            <div key={row.piece} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1.4fr", gap: 0, padding: "11px 16px", borderTop: "1px solid var(--sd-border)", background: i % 2 ? "var(--sd-surface2)" : "transparent" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)" }}>{row.piece}</span>
              <span className="sd-text-xs" style={{ margin: 0 }}>{row.when}</span>
              <span className="sd-text-xs" style={{ margin: 0 }}>{row.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Counterpoint */}
      <div className="sd-section">
        <p className="sd-eyebrow">Counterpoint</p>
        <h2 className="sd-h2">Most Apps Never Leave Stage Three</h2>

        <div className="sd-prose">
          <p>
            The ladder above is ten stages long because the story ends at a million users. Almost nothing ends at a million users. A single well-sized database with a cache in front of it comfortably serves a business with real revenue, and the honest version of most roadmaps stops somewhere around stage four and stays there for years.
          </p>
          <p style={{ marginTop: 12 }}>
            Which makes the expensive mistake the opposite of the one people worry about. The risk is not <em>failing to scale</em>, it is <strong className="sd-strong">paying a scaling cost before the break arrives</strong>: sharding a database that one machine would have carried, splitting a service to solve a problem a function call did not have, choosing a shard key before you know how the data is read. Those costs are permanent, and they are paid in every feature built afterwards.
          </p>
          <p style={{ marginTop: 12 }}>
            The useful reading of this page is not top to bottom. It is: <strong className="sd-strong">find the symptom you actually have</strong>, apply that stage, and leave the rest on the shelf until something breaks.
          </p>
        </div>
      </div>

      {/* Seen in the wild */}
      <div className="sd-section">
        <p className="sd-eyebrow">Seen In The Wild</p>
        <h2 className="sd-h2">Teams That Walked This Exact Ladder</h2>
        <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
      </div>

      {/* Key points */}
      <div className="sd-section">
        <p className="sd-eyebrow">Key Points</p>
        <h2 className="sd-h2">What To Carry Forward</h2>
        <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} columns={2} />
      </div>

      {/* Common mistakes */}
      <div className="sd-section">
        <p className="sd-eyebrow">Common Mistakes</p>
        <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
        <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

        <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
          &ldquo;I buried four bones in the garden against a winter that has never once arrived. One under the shed, one by the wet patch, two I can no longer locate at all. I have dug up the wrong one twice. The bowl, meanwhile, has been filled every single day of my life. I am told this is planning ahead. The bones are not better for being buried, and the garden is now full of holes.&rdquo;
        </blockquote>
      </div>

      {/* Try it yourself */}
      <div className="sd-section">
        <p className="sd-eyebrow">Try It Yourself</p>
        <h2 className="sd-h2">Find Your Own Stage</h2>

        <div className="sd-callout sd-callout-accent">
          Take an app you work on or have built. Write down, in one sentence each, the symptom it has <strong className="sd-strong">right now</strong>, which of the ten stages that symptom calls for, and what that stage would cost you in code you would have to write or maintain. Then name the next stage after it, and the symptom you would have to see before it would be worth paying for. If the honest answer is &ldquo;stage one, and nothing is broken yet&rdquo;, that is the correct answer and worth writing down too.
        </div>
      </div>

      {/* Further reading */}
      <div className="sd-section">
        <p className="sd-eyebrow">Further Reading</p>
        <h2 className="sd-h2">Where To Go Deeper</h2>

        <div className="sd-stack">
          {furtherReading.map((r) => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" style={{ display: "block", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px", textDecoration: "none" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-accent)" }}>{r.title}</span>
                <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>{r.source}</span>
              </div>
              <p className="sd-text-sm-tight">{r.note}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div className="sd-quiz">
        <p className="sd-eyebrow-accent">Quiz Review</p>
        <p className="sd-quiz-title">Check your understanding</p>
        <QuizCarousel cards={quizCards} />
      </div>
    </>
  );
}
