"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BellRing,
  Code,
  Cpu,
  Database,
  Film,
  ListOrdered,
  Network,
  Radio,
  Server,
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
    question: "A chat app keeps messages in a list in memory and delivers them over WebSockets. Everything passes in testing. What does the first real deploy break, and which piece fixes which half of it?",
    answers: ["Both halves of the same restart. The list in memory is gone, which deletes every conversation on the service, and that is what a database fixes: the data outlives the process. The open sockets are also gone, and no storage layer helps there, because a socket cannot be persisted. That half is fixed on the edges of the restart instead: drain connections before the process stops, and have the client reconnect with backoff and ask for anything it missed while it was disconnected. Durability and connectivity look like one bug here and are two different pieces."],
  },
  {
    question: "Polling every three seconds already works. What does a WebSocket actually save, and what does it cost that polling never did?",
    answers: ["It saves two things: the empty round trips, which are the overwhelming majority of polls, and up to three seconds of latency, since the push happens when the message is stored rather than when the next poll happens to land. What it costs is statelessness. A poll is a request any server can answer, so polling servers are interchangeable. A socket is held open by exactly one process, so that process now knows something no other one does, which makes restarts, deploys and load balancing all harder than they were five minutes ago."],
  },
  {
    question: "The database write stays on the request path and the push notification moves onto a queue. Both are work. Why does only one of them get deferred?",
    answers: ["Because of who is waiting and who can fail. The write is fast, local, and the thing the sender is actually waiting to hear about: if it fails, the send failed, and saying otherwise would be a lie. The push is an outbound call to Apple or Google, hundreds of milliseconds on a good day, a timeout on a bad one, with rate limits you do not control, and its outcome is about someone else's phone. Putting it on a queue converts another company's slow afternoon from a failed send into a retry, which is the whole trade."],
  },
  {
    question: "Ten servers each hold WebSockets. The sender's request lands on server 1 and the recipient's socket is on server 7. Why doesn't the load balancer solve this, and what does?",
    answers: ["The load balancer only decides where new inbound connections go. It has no idea which process is holding a given socket, and an already-open connection is not something it can forward a message into. The piece that solves it is a shared Pub/Sub channel, in Redis, NATS or Kafka: server 1 publishes the message, every subscribed server receives it, and the one holding that socket writes to it while the other nine drop it. The cost is that fan-out: every server now sees every message, so the internal traffic grows with the size of the fleet, not with the number of recipients."],
  },
  {
    question: "Messages arrive thirty seconds late. API p99 is 60ms, the error rate is zero, every service is green. What are those dashboards structurally unable to show?",
    answers: ["The time between the pieces. Each metric measures one component answering for itself, and nothing was slow inside any component — the message sat in a queue, which is not a service and does not report latency. Two things would have caught it: queue depth as a metric, which is the one number that describes a backlog rather than a request, and a trace, which follows that single message across every hop and attributes the twenty-nine seconds to the wait rather than to the work. The lesson is to instrument the boundaries, not only the boxes."],
  },
  {
    question: "The app is one codebase handling login, chat, media and notifications. When is that still the right answer, and what is the one honest reason to pull media out first?",
    answers: ["It stays right until some piece has pressure of its own that the shared deployable cannot serve. The honest reason for media is that it wants different hardware and a different release cadence: transcoding is CPU-bound and bursty and can fail without touching a conversation, while chat is latency-sensitive and memory-hungry and must not be blocked by a transcoding fix waiting to ship. That is a measurable reason. Wanting microservices, or matching the team structure, is not, and the modular monolith gets most of the benefit for the price of a folder boundary."],
  },
];

/* Ten stages, each a limit followed by the piece that answers it. `nearest` marks a
   stage whose deep dive is the closest existing concept rather than a dedicated one —
   queues, containers and observability have no page of their own yet. */
const stages = [
  {
    piece: "Server",
    scale: "A message with nowhere to go",
    shows: "One always-on process, with both phones talking to it instead of to each other.",
    trigger: "Nadia's phone holds the message and Theo's phone has to receive it. A phone is the worst delivery target there is: it sits behind carrier NAT with no address anyone can reach, it changes IP the moment it changes network, and it is asleep most of the day.",
    fix: "A server: a process on a machine that stays on, listening on a port, accepting requests and returning responses. Both phones talk to it and never to each other. Your backend code runs there, in Go, Java, Python, Node or Elixir, and the choice of language changes nothing about this shape.",
    cost: "Something now has to stay up, and it is yours: deploys, patches, restarts, and a bill per hour whether anyone sends a message or not. On day one it is also a single point of failure, and every piece below exists because this one process cannot do everything well.",
    dive: { slug: "request-lifecycle", title: "The Lifecycle of a Software Request" },
  },
  {
    piece: "API",
    scale: "What may be asked",
    shows: "A fixed surface in front of the code: a named list of requests, and nothing else.",
    trigger: "The phone can reach the server and could send it literally anything. The server cannot branch on arbitrary data, and a client that guesses the shape wrong gets a 500 instead of a usable answer.",
    fix: "An API: a fixed set of named operations with defined inputs, outputs and auth rules. POST /messages, GET /chats, POST /auth/login. Both sides agree on the list, so the server validates one shape per route and the phone knows in advance what it will get back.",
    cost: "A contract you no longer control alone. A build from eight months ago is still calling the old shape and cannot be made to update, so fields get added rather than changed, and the one route you regret ships forever.",
    dive: { slug: "api-design", title: "API Design: REST, GraphQL, and gRPC" },
  },
  {
    piece: "Database",
    scale: "Surviving a restart",
    shows: "Storage beside the code, holding what the process is not allowed to forget.",
    trigger: "Messages live in a list in memory, so the next deploy, crash or routine restart takes every conversation on the service with it. Not corrupts them: deletes them, with no trace that they were ever there.",
    fix: "A database, Postgres or MySQL or MongoDB, writing to disk and indexing what you actually search by, so 'the messages in this chat, newest first' is a lookup instead of a scan over everything ever sent.",
    cost: "The data now sits across a network from the code, with a connection pool, a schema to migrate, and a disk that can fill up at 3am. It is also the one piece whose loss cannot be papered over, because everything else in this list can be rebuilt by deploying again.",
    dive: { slug: "relational-vs-nosql", title: "Selecting Relational vs NoSQL Database Models" },
  },
  {
    piece: "Cache",
    scale: "The same read, a thousand times",
    shows: "A memory layer in front of the database, answering the reads that keep repeating.",
    trigger: "Every app launch asks for the same things: recent chats, unread counts, display names. A group of forty people runs the identical query forty times a minute, and the database sits at 90% CPU while the app servers are half idle.",
    fix: "Redis between the code and the database, holding hot answers in memory under a short TTL. Most reads stop there, a miss falls through to the database, and the result is written into the cache on the way back out.",
    cost: "A second copy of the truth, which every write path now has to invalidate. When one path forgets, nothing errors and nothing pages: the system keeps serving a wrong answer quickly, which is the hardest class of bug to see from the outside.",
    dive: { slug: "caching-strategies", title: "Caching Strategies & Cache Invalidation" },
  },
  {
    piece: "WebSockets",
    scale: "Telling Theo",
    shows: "One connection held open in both directions, so the server can speak first.",
    trigger: "Theo's app has no idea the message exists. Asking the server every three seconds works, and is almost entirely waste: nearly every answer is empty, the radio wakes for each one, and a message still lands up to three seconds after it was sent.",
    fix: "A WebSocket: one connection, opened once and kept open, carrying frames in both directions. The server pushes the message the instant it is stored, and nobody has to ask for anything.",
    cost: "The connection is state, and state has an address. Theo's socket is held by exactly one process, so that process can no longer be restarted casually, a deploy drops every socket it was holding, and the client needs reconnect-with-backoff plus a way to fetch whatever arrived while it was gone.",
    dive: { slug: "communication-patterns", title: "Choosing a Communication Pattern" },
  },
  {
    piece: "Message queue",
    scale: "The phone is locked",
    shows: "A queue off to the side, and workers doing the slow part after the response went out.",
    trigger: "There is no socket, because the app is not running. Reaching Theo now means an outbound call to Apple's or Google's push service: a few hundred milliseconds on a good day, a timeout on a bad one, under rate limits you do not control. Nadia is watching a spinner for all of it.",
    fix: "The server stores the message, drops a job onto a queue, and returns immediately. A background worker picks the job up, calls the push service, and retries with backoff when that call fails. The slow, failure-prone dependency comes off the path the sender is waiting on.",
    cost: "Delivery is no longer finished when the response says so, which the interface has to admit: Sent is not Delivered. Queues are at-least-once, so a worker that dies after sending will send again, which means every job has to be safe to run twice. And a job that keeps failing needs somewhere to go other than the retry loop.",
    dive: { slug: "architectural-styles", title: "Architectural Styles: Monolith to Event-Driven", nearest: true },
  },
  {
    piece: "Load balancer and Pub/Sub",
    scale: "More sockets than one box holds",
    shows: "Ten app servers behind a balancer, and a channel every one of them is listening to.",
    trigger: "A single machine runs out of memory and file descriptors long before it runs out of users, and every socket is held for hours rather than milliseconds. Ten machines fix the capacity and break the delivery: Nadia's request lands on server 1, Theo's socket is on server 7, and server 1 has no way to write to it.",
    fix: "A load balancer in front, spreading connections across the ten and health-checking each one so a dead server stops receiving traffic. Then a shared Pub/Sub channel, in Redis or NATS or Kafka: server 1 publishes the message, all ten receive it, and the one holding that socket delivers it.",
    cost: "Two more pieces that must not die, and a fan-out that grows with the fleet rather than with the recipients: every server sees every message and discards the ones it has no socket for. Deploys now need connection draining, because restarting the fleet means disconnecting everybody.",
    dive: { slug: "load-balancing", title: "Core Concepts of Load Balancing" },
  },
  {
    piece: "Containers",
    scale: "Ten machines, one setup",
    shows: "The app packaged as an image, and a scheduler running copies of it.",
    trigger: "Server 4 has a different runtime version than the other nine and fails a request they all handle. Nothing is wrong with the code. The machines drifted apart over six months of manual fixes, and the fix that matters only exists in one engineer's shell history.",
    fix: "Docker: the code plus its runtime, libraries and config, built once into an image that runs the same anywhere. A scheduler then places copies of that image across machines, restarts the ones that die, and replaces them a few at a time on deploy.",
    cost: "An orchestrator is itself a distributed system, so now you operate two of them: images, registries, resource limits, rollout strategy, and a new class of incident where the app is perfectly healthy and the scheduler is not. For most teams the honest version of this stage is a managed platform that runs the image for you.",
    dive: { slug: "horizontal-vs-vertical-scaling", title: "Scalability: Vertical vs Horizontal Scaling", nearest: true },
  },
  {
    piece: "Architecture",
    scale: "One codebase, four jobs",
    shows: "The piece with its own pressure pulled out, and everything else left together.",
    trigger: "Login, chat, media and notifications all live in one deployable, which was an advantage for years. It stops being one the day video transcoding needs CPU-heavy machines while chat needs cheap memory-heavy ones, and a transcoding fix has to wait for a chat release to be safe.",
    fix: "Split the piece that has its own pressure, not the org chart. Media becomes its own service with its own hardware and release cadence. Login, chat and presence stay in one codebase, because a function call between them was never the problem.",
    cost: "Every split turns a call that could not fail into a network call that can: timeouts, retries, partial failures, and a transaction that no longer exists. Local development needs more than one thing running. The modular monolith, clear internal boundaries inside one deployable, is where most of this benefit lives without the bill.",
    dive: { slug: "architectural-styles", title: "Architectural Styles: Monolith to Event-Driven" },
  },
  {
    piece: "Observability",
    scale: "Thirty seconds late",
    shows: "No new capability. Timings and identifiers coming out of every piece above.",
    trigger: "Messages are arriving half a minute after they were sent. Every service reports healthy, API p99 is 60ms, the error rate is zero, and not one person in the incident channel can say which of the nine pieces above is holding the message.",
    fix: "Three different things that are not interchangeable. Metrics are numbers over time, latency percentiles and error rate and queue depth, and they tell you something is wrong. Logs record what happened in one place, tied together by a request ID. A trace follows one message across every hop and shows where the time actually sat.",
    cost: "The only piece here that adds no capability at all, and it still charges: storage per log line, cardinality limits on metrics, sampling decisions, and instrumentation in code that was working fine without it. It is also what makes the other nine debuggable, which is why it is the worst one to defer.",
    dive: { slug: "latency-throughput-availability", title: "Latency, Throughput & Availability", nearest: true },
  },
];

/* The closing recap, in the shape the whole page argues for: what each piece does,
   and between every pair, the thing it still could not do. Read straight down, the
   gaps are the story — each piece arrives exactly when the one above hits its limit. */
const wholePath = [
  { piece: "Server", does: "runs the code", limit: "but it will take literally anything the phone sends" },
  { piece: "API", does: "defines the requests", limit: "but a restart wipes every conversation" },
  { piece: "Database", does: "saves the message", limit: "but the same handful of reads keeps repeating" },
  { piece: "Cache", does: "speeds up reads", limit: "but nobody has told Theo anything yet" },
  { piece: "WebSockets", does: "deliver it live", limit: "but his phone is locked, and Apple is slow to answer" },
  { piece: "Message queue", does: "handles slow work", limit: "but one machine cannot hold every connection" },
  { piece: "Load balancers", does: "spread traffic", limit: "but ten machines drift apart from each other" },
  { piece: "Containers", does: "run it everywhere", limit: "but one codebase is now doing four different jobs" },
  { piece: "Architecture", does: "splits it up", limit: "and now nobody can say which piece is slow" },
  { piece: "Observability", does: "shows what\u2019s happening" },
];
const keyPoints = [
  "Each piece answers exactly one question: *where does the code run, what may be asked, what survives a restart, what repeats, who gets told, what can wait, which machine, which environment, which codebase, where did the time go*.",
  "A database makes a message *durable* and a cache makes a read *cheap*. Neither of them delivers anything — *delivery is the socket's job*, and that separation is the whole reason both exist.",
  "Polling and WebSockets both work. One *pays per empty check*, the other *pays by holding state*, and that state is what stops an app server from being freely restartable.",
  "A queue does not make the push notification faster. It *moves it off the path the sender is waiting on*, and buys retries, duplicates, and a message that is 'sent' before it has been sent.",
  "The moment there are two servers, delivery becomes routing: *a socket lives on exactly one process*, so every other server needs a channel to reach it.",
  "Observability is the only piece that *adds no capability at all*. It is what makes the other nine debuggable, which is why it is the one that should never be last.",
];

const arrowDefs = (
  <defs>
    <marker id="sd-msg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
    </marker>
    <marker id="sd-msg-arrow-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-danger)" />
    </marker>
    <marker id="sd-msg-arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-green)" />
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
  /** Stamps the stage that introduced this node, which is what makes the full
      picture read as a history rather than as another architecture diagram. */
  n?: number;
  accent?: boolean;
  /** The piece this stage just added, ringed so the eye finds it. */
  isNew?: boolean;
  /** A lucide icon renders as a nested <svg>, positioned with x and y like any
      other SVG child. With one present the text left-aligns beside it. */
  icon?: LucideIcon;
}

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

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  /** Observability reads from the pieces rather than sitting in the traffic path,
      so its edges are dashed to say they carry telemetry, not requests. */
  dash?: boolean;
  accent?: boolean;
  /** Nudges off the default offset, for the few edges whose gap is too tight
      for a label to sit above-right of the midpoint without hitting a box. */
  labelDx?: number;
  labelDy?: number;
}

function Arrow({ x1, y1, x2, y2, label, dash, accent, labelDx = 8, labelDy = -5 }: ArrowProps) {
  const stroke = accent ? "var(--sd-accent)" : "var(--sd-border-strong)";
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray={dash ? "5 5" : undefined}
        markerEnd="url(#sd-msg-arrow)"
      />
      {label && (
        <text x={(x1 + x2) / 2 + labelDx} y={(y1 + y2) / 2 + labelDy} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{label}</text>
      )}
    </g>
  );
}

/* One canvas for all ten stages rather than ten pictures. Every node, frame and
   edge carries the stage it appears at, and `until` for the handful that get
   replaced later: the direct phone-to-server call becomes an API call at two, and
   the straight shot into the app servers goes through a balancer at seven.

   Nothing on the canvas ever moves, it only arrives, which is the claim the page
   is making. Positions are hand-placed for the full stage-ten layout, so the
   early stages read as sparse on purpose — that is what the backend was. */

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
  { id: "nadia", icon: Smartphone, label: "Nadia", sub: "sends", x: 120, y: 16, from: 1 },
  { id: "theo", icon: Smartphone, label: "Theo", sub: "receives", x: 610, y: 16, from: 1 },
  { id: "api", icon: Code, label: "API", sub: "POST /messages", x: 365, y: 100, from: 2 },
  { id: "lb", icon: Network, label: "Load balancer", sub: "health-checked", x: 365, y: 176, from: 7 },
  { id: "app", icon: Server, label: "App servers", sub: "hold the sockets", x: 365, y: 256, from: 1 },
  { id: "pubsub", icon: Radio, label: "Pub/Sub", sub: "every server listens", x: 110, y: 256, w: 170, from: 7 },
  { id: "media", icon: Film, label: "Media service", sub: "its own hardware", x: 575, y: 256, from: 9 },
  { id: "cache", icon: Zap, label: "Redis cache", sub: "hot reads, TTL", x: 100, y: 352, from: 4 },
  { id: "queue", icon: ListOrdered, label: "Message queue", sub: "retries, at-least-once", x: 655, y: 352, w: 170, from: 6 },
  { id: "db", icon: Database, label: "Database", sub: "survives a restart", x: 340, y: 440, w: 170, from: 3, accent: true },
  { id: "workers", icon: Cpu, label: "Workers", sub: "off the request path", x: 655, y: 440, w: 170, from: 6 },
  { id: "push", icon: BellRing, label: "APNs / FCM", sub: "someone else's API", x: 655, y: 524, w: 170, from: 6 },
  { id: "obs", icon: Activity, label: "Observability", sub: "metrics, logs, traces", x: 90, y: 524, w: 190, from: 10 },
];

/* The one piece that is not a box in the traffic path: it is the boundary the app
   servers run inside, so it is drawn as a frame around them. */
interface DiagramFrame extends Placed {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const diagramFrames: DiagramFrame[] = [
  { id: "platform", label: "Container platform · one image", x: 334, y: 226, w: 406, h: 112, from: 8 },
];

const diagramEdges: (ArrowProps & Placed)[] = [
  /* Stage 1 is the phone talking straight to the process. Stage 2 puts a named
     surface in between, and stage 7 puts a balancer under that. */
  { x1: 195, y1: 64, x2: 380, y2: 252, label: "send", from: 1, until: 1 },
  { x1: 195, y1: 64, x2: 400, y2: 96, label: "send", from: 2 },
  { x1: 440, y1: 148, x2: 440, y2: 252, from: 2, until: 6 },
  { x1: 440, y1: 148, x2: 440, y2: 172, from: 7 },
  { x1: 440, y1: 224, x2: 440, y2: 252, from: 7 },
  { x1: 425, y1: 304, x2: 415, y2: 436, from: 3 },
  { x1: 380, y1: 300, x2: 258, y2: 352, label: "reads", labelDx: -46, from: 4 },
  { x1: 175, y1: 400, x2: 336, y2: 452, label: "on a miss", from: 4 },
  /* The only arrow pointing back up at a phone: the server speaking first. */
  { x1: 520, y1: 282, x2: 690, y2: 66, label: "push over a socket", from: 5, accent: true },
  { x1: 528, y1: 296, x2: 651, y2: 366, label: "job", labelDy: 20, from: 6 },
  { x1: 740, y1: 400, x2: 740, y2: 436, from: 6 },
  { x1: 740, y1: 488, x2: 740, y2: 520, label: "notify", from: 6 },
  { x1: 284, y1: 280, x2: 361, y2: 280, label: "fan-out", labelDx: -28, from: 7 },
  { x1: 532, y1: 276, x2: 571, y2: 276, from: 9 },
  { x1: 380, y1: 310, x2: 205, y2: 520, dash: true, from: 10 },
  { x1: 340, y1: 480, x2: 284, y2: 536, dash: true, from: 10 },
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

function GrowingBackend() {
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

  /* What this stage added on top, the canvas in the middle, controls along the
     bottom. sd-figure supplies the frame, its padding is dropped so each band can
     run edge to edge. */
  return (
    <div className="sd-figure" style={{ padding: 0, overflow: "hidden" }}>
      <div aria-live="polite" style={{ padding: "14px 18px", borderBottom: "1px solid var(--sd-border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, color: "var(--sd-accent)" }}>
            Piece {stage}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--sd-text)" }}>{current.piece}</span>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>
            {current.scale}
          </span>
        </div>
        <p className="sd-text-sm-tight">{current.shows}</p>
      </div>

      <div style={{ overflowX: "auto", padding: "22px 18px" }}>
        <svg viewBox="0 0 880 600" role="img" aria-label="The backend at piece ten: Nadia's phone calls an API, which goes through a load balancer to app servers running as containers. The servers read a Redis cache that falls through to the database, publish to a shared Pub/Sub channel so any server can reach a socket, push over a WebSocket to Theo's phone, and hand slow work to a queue whose workers call Apple's and Google's push services. A media service runs beside them, and observability collects from all of it." style={{ width: "100%", minWidth: 680, display: "block" }}>
          <title>{`The backend after piece ${stage}, ${current.piece}`}</title>
          {arrowDefs}

          {diagramFrames.map((frame) => {
            const on = shown(frame, stage);
            return (
              <g key={frame.id} className="sd-reveal" data-on={on} aria-hidden={!on}>
                <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx={12} fill="none" stroke={frame.from === stage ? "var(--sd-accent)" : "var(--sd-border)"} strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={frame.x + frame.w - 10} y={frame.y + 18} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{frame.label}</text>
              </g>
            );
          })}

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
                {/* Ten servers, drawn as a stack behind the labelled one. */}
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
            {playing ? "■ Pause" : stage >= last ? "↻ Replay" : "▶ Play"}
          </button>

          <div role="group" aria-label="Piece" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {stages.map((s, i) => {
              const active = i + 1 === stage;
              return (
                <button
                  key={s.piece + i}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Piece ${i + 1}, ${s.piece}`}
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

/* The same ten pieces as the canvas above, one at a time. All ten stay in the DOM
   and only the current one is displayed, so the text is still findable and
   crawlable without costing ten cards of page height. */
function PieceCarousel() {
  const [index, setIndex] = useState(0);
  const last = stages.length - 1;

  return (
    <div className="sd-figure" style={{ padding: 0, overflow: "hidden" }}>
      {/* ponytail: a floor rather than a measured height, so the controls stop
          jumping between a short piece and a long one. */}
      <div style={{ padding: "16px 18px", minHeight: 340 }} aria-label="Piece detail">
        {stages.map((stage, i) => (
          <div key={stage.piece + i} style={{ display: i === index ? "block" : "none" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--sd-text)" }}>{stage.piece}</span>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>{stage.scale}</span>
            </div>

            {/* auto-fit rather than a fixed 1fr 1fr: the pair drops to one column on
                a narrow screen without a breakpoint. Washes stay inside the palette's
                rules — danger for the limit, accent for the piece, and a plain
                surface for the cost, which is a ledger line, not a hue. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              <div style={{ background: "var(--sd-danger-wash)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px" }}>
                <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)" }}>What it can&rsquo;t do yet</p>
                <p className="sd-text-sm-tight">{stage.trigger}</p>
              </div>
              <div style={{ background: "var(--sd-accent-wash)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px" }}>
                <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>The piece</p>
                <p className="sd-text-sm-tight">{stage.fix}</p>
              </div>
            </div>

            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 15px", marginTop: 10 }}>
              <p className="sd-eyebrow-sub" style={{ color: "var(--sd-amber)" }}>What it costs</p>
              <p className="sd-text-sm-tight">{stage.cost}</p>
            </div>

            {/* Opens away from the page: the carousel keeps its place, and the piece
                you were reading is still here when the tab is closed. */}
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
        <div role="group" aria-label="Piece" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {stages.map((stage, i) => {
            const active = i === index;
            return (
              <button
                key={stage.piece + i}
                type="button"
                aria-pressed={active}
                aria-label={`Piece ${i + 1}, ${stage.piece}`}
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

interface Lane {
  label: string;
  x: number;
  icon: LucideIcon;
  accent?: boolean;
}

/* The headed, dashed vertical lines every message hangs off. Taken as a prop
   rather than hardcoded, because the four sequences below have four casts. */
function Lifelines({ lanes, bottom }: { lanes: Lane[]; bottom: number }) {
  return (
    <>
      {lanes.map((l) => {
        const Icon = l.icon;
        const w = 142;
        return (
          <g key={l.label}>
            <rect x={l.x - w / 2} y={10} width={w} height={36} rx={8} fill="var(--sd-surface2)" stroke={l.accent ? "var(--sd-teal)" : "var(--sd-border-strong)"} strokeWidth="1.5" />
            <Icon x={l.x - w / 2 + 12} y={19} width={18} height={18} strokeWidth={1.7} stroke={l.accent ? "var(--sd-teal)" : "var(--sd-accent)"} />
            <text x={l.x - w / 2 + 36} y={33} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="11.5" fontWeight="700" fill="var(--sd-text)">{l.label}</text>
            <line x1={l.x} y1={46} x2={l.x} y2={bottom} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
          </g>
        );
      })}
    </>
  );
}

type Tone = "plain" | "danger" | "green";

const toneColor: Record<Tone, string> = {
  plain: "var(--sd-border-strong)",
  danger: "var(--sd-danger)",
  green: "var(--sd-green)",
};

const toneMarker: Record<Tone, string> = {
  plain: "url(#sd-msg-arrow)",
  danger: "url(#sd-msg-arrow-danger)",
  green: "url(#sd-msg-arrow-green)",
};

const toneText: Record<Tone, string> = {
  plain: "var(--sd-muted)",
  danger: "var(--sd-danger)",
  green: "var(--sd-green)",
};

function Msg({ from, to, y, label, tone = "plain", dash }: { from: number; to: number; y: number; label: string; tone?: Tone; dash?: boolean }) {
  const dir = to > from ? -6 : 6;
  return (
    <g>
      <line x1={from} y1={y} x2={to + dir} y2={y} stroke={toneColor[tone]} strokeWidth="1.5" strokeDasharray={dash ? "5 4" : undefined} markerEnd={toneMarker[tone]} />
      <text x={(from + to) / 2} y={y - 8} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill={toneText[tone]}>{label}</text>
    </g>
  );
}

/** A note on one lifeline: time passing, or a decision taken with nobody to talk to. */
function Note({ x, y, text, tone = "plain" }: { x: number; y: number; text: string; tone?: Tone }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontStyle="italic" fill={toneText[tone]}>{text}</text>
  );
}

/* The observability piece, as the one picture that answers the question metrics
   structurally cannot: not "is anything slow" but "which hop held it". Spans are
   placed from ms offsets on a fixed 32-second scale, so the queue wait dwarfing
   every real unit of work is a property of the data, not of the drawing. */

const traceSpans = [
  { label: "POST /messages", start: 0, ms: 61, depth: 0 },
  { label: "auth check (cache hit)", start: 2, ms: 3, depth: 1 },
  { label: "insert message", start: 6, ms: 14, depth: 1 },
  { label: "publish to Pub/Sub", start: 21, ms: 4, depth: 1 },
  { label: "enqueue notify job", start: 26, ms: 5, depth: 1 },
  { label: "waiting in queue", start: 31, ms: 29_400, depth: 1, blame: true },
  { label: "worker: call APNs", start: 29_431, ms: 280, depth: 2 },
  { label: "push delivered to Theo", start: 29_711, ms: 90, depth: 2 },
];

const TRACE_SCALE = 30_200;

function fmt(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function TraceWaterfall() {
  const left = 236;
  const width = 600;
  const rowH = 34;

  return (
    <div className="sd-figure" style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 880 ${traceSpans.length * rowH + 58}`}
        role="img"
        aria-label="A trace of one message. The API request itself takes 61 milliseconds, split between an auth cache hit, the database insert, a publish and an enqueue. The notification job then waits 29.4 seconds in the queue before a worker picks it up, calls Apple's push service in 280 milliseconds and delivers it. Almost all of the delay is the wait, not the work."
        style={{ width: "100%", minWidth: 660, display: "block" }}
      >
        <title>One message, traced across every hop</title>

        {[0, 7_500, 15_000, 22_500, 30_000].map((t) => {
          const x = left + (t / TRACE_SCALE) * width;
          return (
            <g key={t}>
              <line x1={x} y1={26} x2={x} y2={traceSpans.length * rowH + 34} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="2 5" />
              <text x={x} y={18} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{t / 1000}s</text>
            </g>
          );
        })}

        {traceSpans.map((span, i) => {
          const y = 36 + i * rowH;
          const x = left + (span.start / TRACE_SCALE) * width;
          /* A 3ms span on a 30-second scale is sub-pixel, so a floor keeps the fast
             hops visible — the point is which bar is long, not pixel-true widths. */
          const w = Math.max(3, (span.ms / TRACE_SCALE) * width);
          return (
            <g key={span.label}>
              <text x={16 + span.depth * 14} y={y + 15} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill={span.blame ? "var(--sd-danger)" : "var(--sd-text)"}>{span.label}</text>
              <rect x={x} y={y + 4} width={w} height={14} rx={4} fill={span.blame ? "var(--sd-danger)" : "var(--sd-accent)"} opacity={span.blame ? 0.55 : 0.75} stroke={span.blame ? "var(--sd-danger)" : "var(--sd-accent)"} strokeWidth="1" />
              <text x={x + w + 7} y={y + 15} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="10" fill={span.blame ? "var(--sd-danger)" : "var(--sd-muted)"}>{fmt(span.ms)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const pollLanes: Lane[] = [
  { label: "Nadia", x: 140, icon: Smartphone },
  { label: "Theo", x: 420, icon: Smartphone },
  { label: "App server", x: 720, icon: Server },
];

const inlineLanes: Lane[] = [
  { label: "Nadia", x: 130, icon: Smartphone },
  { label: "App server", x: 400, icon: Server },
  { label: "APNs / FCM", x: 700, icon: BellRing, accent: true },
];

const queuedLanes: Lane[] = [
  { label: "Nadia", x: 110, icon: Smartphone },
  { label: "App server", x: 350, icon: Server },
  { label: "Queue", x: 580, icon: ListOrdered, accent: true },
  { label: "Worker", x: 800, icon: Cpu },
];

const fanoutLanes: Lane[] = [
  { label: "Nadia", x: 92, icon: Smartphone },
  { label: "Server 1", x: 266, icon: Server },
  { label: "Pub/Sub", x: 440, icon: Radio, accent: true },
  { label: "Server 7", x: 614, icon: Server },
  { label: "Theo", x: 788, icon: Smartphone },
];

export default function Concept02BackendAroundOneMessage() {
  return (
    <>
      <ConceptHeader slug="backend-around-one-message" />
      <LearnedToggle />
      <p className="sd-lede">
        Ten backend pieces, one chat message, and the exact thing each piece is the
        only one that can do.
      </p>

      <div className="sd-section">
        <p className="sd-eyebrow">Big Idea</p>
        <div className="sd-prose" style={{ fontSize: 16 }}>
          <p>
            Servers, APIs, databases, caches, WebSockets, queues, load balancers, containers,
            architecture, observability. Drawn as a stack they look like the parts list for a
            real backend. They are not a list, they are{" "}
            <strong className="sd-strong">ten answers to ten different questions</strong>, and
            one message moving from one phone to another asks all ten in order. Nadia types{" "}
            <em>running ten minutes late</em> and hits send. Everything below is what has to
            exist for Theo to read it, and nothing below exists until the version before it
            runs out.
          </p>
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">The Shape Of It</p>
        <h2 className="sd-h2">Why The Phones Can&rsquo;t Just Talk To Each Other</h2>

        <div className="sd-prose">
          <p>
            The obvious design is the one that does not work: Nadia&rsquo;s phone handing
            the message straight to Theo&rsquo;s. Phones make terrible delivery targets.
            Neither one has an address the other could dial, both get a new one every time
            they move between wifi and cellular, and Theo&rsquo;s is locked in a pocket most
            of the day.
          </p>
          <p style={{ marginTop: 12 }}>
            So neither phone tries. They both talk to{" "}
            <strong className="sd-strong">one machine that is none of those things</strong>,
            and that machine is the entire backend on day one.
          </p>
        </div>

        <div className="sd-figure" style={{ overflowX: "auto", marginTop: 16 }}>
          <svg viewBox="0 0 860 232" role="img" aria-label="A crossed-out dashed line between Nadia's phone and Theo's phone shows that direct delivery is impossible: neither has an address the other can reach, both change IP whenever they change network, and both are asleep most of the day. Below, both phones instead connect to one always-listening server, which takes the message from Nadia and delivers it to Theo." style={{ width: "100%", minWidth: 560, display: "block" }}>
            <title>Why both phones talk to a server instead of to each other</title>
            {arrowDefs}

            <Box x={40} y={20} w={170} label={"Nadia\u2019s phone"} sub="has the message" icon={Smartphone} />
            <Box x={650} y={20} w={170} label={"Theo\u2019s phone"} sub="needs the message" icon={Smartphone} />

            {/* The crossed-out path, with its three reasons spelled out underneath —
                this one picture is the entire argument for piece one. */}
            <text x={430} y={26} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-danger)">direct delivery</text>
            <line x1={210} y1={44} x2={650} y2={44} stroke="var(--sd-danger)" strokeWidth="1.5" strokeDasharray="6 5" />
            <line x1={419} y1={33} x2={441} y2={55} stroke="var(--sd-danger)" strokeWidth="2" />
            <line x1={441} y1={33} x2={419} y2={55} stroke="var(--sd-danger)" strokeWidth="2" />

            <rect x={278} y={76} width={304} height={62} rx={10} fill="var(--sd-surface2)" stroke="var(--sd-border)" strokeWidth="1.5" />
            {[
              "neither has an address the other can reach",
              "both get a new IP on every network they join",
              "both are asleep most of the day",
            ].map((reason, i) => (
              <text key={reason} x={430} y={96 + i * 18} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{reason}</text>
            ))}

            {/* Elbows rather than diagonals, so the two paths run down the outside and
                leave the middle of the canvas to the reasons. */}
            <path d="M125 68 V194 H341" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-msg-arrow)" />
            <text x={135} y={128} textAnchor="start" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">send</text>
            <path d="M519 194 H735 V74" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-msg-arrow)" />
            <text x={725} y={128} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">deliver</text>

            <Box x={345} y={170} w={170} label="One server" sub="always listening" accent icon={Server} />
          </svg>
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          At two users that single box is the whole backend, and it is{" "}
          <strong className="sd-strong">the right one</strong>: one process to deploy, one
          place to look when something breaks, and no second machine that can disagree with
          it. Everything else on this page is what gets added when that stops being enough,
          in the order it stops being enough.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Interactive</p>
        <h2 className="sd-h2">Watch The Backend Grow, One Piece At A Time</h2>

        <div className="sd-prose" style={{ marginBottom: 16 }}>
          <p>
            One canvas, ten pieces. Press play, or step through it. Nothing ever moves,
            it only arrives, and the badge on each box is the piece that put it there.
          </p>
        </div>

        <GrowingBackend />

        <div className="sd-callout" style={{ marginTop: 16 }}>
          Piece ten is what a backend diagram usually is: not a design, but{" "}
          <strong className="sd-strong">a record of ten questions somebody had to answer</strong>,
          drawn all at once so the order is no longer visible. The ten cards below are
          that order.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">The Walkthrough</p>
        <h2 className="sd-h2">Ten Pieces, And What Each One Charges</h2>

        <PieceCarousel />

        <div className="sd-callout" style={{ marginTop: 16 }}>
          Message queues, containers and observability do not have a page of their own
          here yet, so pieces six, eight and ten point at{" "}
          <strong className="sd-strong">the nearest concept</strong> rather than a
          dedicated one.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Worked Example</p>
        <h2 className="sd-h2">Asking, Versus Being Told</h2>

        <div className="sd-prose">
          <p>
            Theo&rsquo;s app has to find out the message exists. Both versions below work.
            The difference is{" "}
            <strong className="sd-strong">who speaks first</strong>, and that one change
            removes the empty round trips and the delay at the same time.
          </p>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)", marginTop: 16 }}>Polling: the client asks, over and over</p>
        <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 20 }}>
          <svg viewBox="0 0 880 340" role="img" aria-label="Theo's app asks the server for new messages every three seconds and gets an empty answer each time. Nadia's message is stored in between two polls, sits there with nobody asking, and is only returned on the next poll, up to three seconds later." style={{ width: "100%", minWidth: 640, display: "block" }}>
            <title>Polling: mostly empty answers, and up to three seconds of delay</title>
            {arrowDefs}
            <Lifelines lanes={pollLanes} bottom={318} />
            <Msg from={420} to={720} y={84} label="GET /messages" />
            <Msg from={720} to={420} y={110} label="[] nothing" />
            <Note x={570} y={136} text="3 seconds" />
            <Msg from={420} to={720} y={164} label="GET /messages" />
            <Msg from={720} to={420} y={190} label="[] nothing" />
            <Msg from={140} to={720} y={222} label="send, stored" tone="green" />
            <Note x={570} y={248} text="it sits here, nobody is asking" tone="danger" />
            <Msg from={420} to={720} y={278} label="GET /messages" />
            <Msg from={720} to={420} y={304} label="1 message" />
            <Note x={420} y={330} text="one useful poll in four, and up to 3s late" tone="danger" />
          </svg>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>WebSocket: the server speaks first</p>
        <div className="sd-figure" style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 880 300" role="img" aria-label="Theo's app opens one WebSocket and keeps it open. When Nadia sends a message the server stores it and immediately pushes it down that connection, arriving in tens of milliseconds with no empty requests at all." style={{ width: "100%", minWidth: 640, display: "block" }}>
            <title>One open connection, and a push the moment the message is stored</title>
            {arrowDefs}
            <Lifelines lanes={pollLanes} bottom={280} />
            <Msg from={420} to={720} y={84} label="open socket, once" />
            <Note x={570} y={110} text="held open, both directions" />
            <Msg from={140} to={720} y={148} label="send" />
            <Note x={720} y={174} text="stored, 14ms" />
            <Msg from={720} to={420} y={204} label="push: 1 message" tone="green" />
            <Msg from={720} to={140} y={236} label="200 OK" />
            <Note x={420} y={270} text="arrives in ~40ms, zero empty round trips" tone="green" />
          </svg>
        </div>

        <div className="sd-callout" style={{ marginTop: 16 }}>
          What the socket costs is on the server, not the phone. That connection is held
          by <strong className="sd-strong">one specific process</strong>, so an app server
          is no longer a thing you can restart whenever you like, and a deploy drops every
          connection it was holding. Which is the next two problems on this page.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Worked Example</p>
        <h2 className="sd-h2">The Locked Phone, And Whose Outage It Is</h2>

        <div className="sd-prose">
          <p>
            There is no socket, because Theo&rsquo;s app is not running. Reaching him means
            calling Apple or Google, which means a request to{" "}
            <strong className="sd-strong">a company you do not operate</strong>. Leaving
            that call on the request path hands them your send button.
          </p>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)", marginTop: 16 }}>Inline: Nadia waits for Apple</p>
        <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 20 }}>
          <svg viewBox="0 0 880 290" role="img" aria-label="The server stores Nadia's message in 14 milliseconds, then calls Apple's push service inline. That call hangs for 840 milliseconds and times out, so the request fails and Nadia is told the send failed, even though the message is safely stored." style={{ width: "100%", minWidth: 640, display: "block" }}>
            <title>A third-party timeout turning a stored message into a failed send</title>
            {arrowDefs}
            <Lifelines lanes={inlineLanes} bottom={270} />
            <Msg from={130} to={400} y={84} label="send" />
            <Note x={400} y={110} text="stored, 14ms" tone="green" />
            <Msg from={400} to={700} y={140} label="notify Theo" />
            <Note x={700} y={166} text="840ms, then a timeout" tone="danger" />
            <Msg from={700} to={400} y={196} label="504" tone="danger" />
            <Msg from={400} to={130} y={228} label="send failed" tone="danger" />
            <Note x={330} y={262} text="the message is stored. Nadia was told it wasn't." tone="danger" />
          </svg>
        </div>

        <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>Queued: the slow dependency moves off the request</p>
        <div className="sd-figure" style={{ overflowX: "auto" }}>
          <svg viewBox="0 0 880 310" role="img" aria-label="The server stores the message, puts a notify job on a queue, and returns success to Nadia in 40 milliseconds. A background worker then picks the job up, hits the same timeout, and retries with backoff until the notification is delivered, with nobody waiting on it." style={{ width: "100%", minWidth: 680, display: "block" }}>
            <title>The same timeout, absorbed by a retry instead of a failed send</title>
            {arrowDefs}
            <Lifelines lanes={queuedLanes} bottom={290} />
            <Msg from={110} to={350} y={84} label="send" />
            <Note x={350} y={110} text="stored, 14ms" tone="green" />
            <Msg from={350} to={580} y={140} label="enqueue notify" />
            <Msg from={350} to={110} y={172} label="200 OK, 40ms" tone="green" />
            <Note x={230} y={198} text="Nadia is done here" tone="green" />
            <Msg from={580} to={800} y={228} label="job" />
            <Note x={800} y={254} text="same timeout, retry in 2s" />
            <Note x={690} y={282} text="delivered on the retry. Nobody waited." tone="green" />
          </svg>
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          The queue did not make the push faster, it{" "}
          <strong className="sd-strong">changed what a slow push means</strong>: a retry
          instead of a failed send. The bill arrives in two places. The interface now has
          to distinguish <em>sent</em> from <em>delivered</em>, because they happen at
          different times. And queues are at-least-once, so that worker{" "}
          <strong className="sd-strong">will</strong> eventually run twice on the same job,
          which has to be harmless rather than a duplicate notification at 3am.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Worked Example</p>
        <h2 className="sd-h2">Ten Servers, And The One Holding The Socket</h2>

        <div className="sd-prose">
          <p>
            One machine runs out of memory and file descriptors long before it runs out of
            users, because every socket is held for hours rather than milliseconds. Ten
            machines fix that and break delivery:{" "}
            <strong className="sd-strong">a connection lives on exactly one process</strong>,
            and the server handling Nadia&rsquo;s send is almost never the one holding
            Theo&rsquo;s socket.
          </p>
          <p style={{ marginTop: 12 }}>
            The load balancer does not help here. It decides where{" "}
            <em>new</em> connections go, and has no way to write into one that is already
            open somewhere else.
          </p>
        </div>

        <div className="sd-figure" style={{ overflowX: "auto", marginTop: 16 }}>
          <svg viewBox="0 0 880 300" role="img" aria-label="Nadia's send lands on server 1, which holds no socket for Theo. Server 1 publishes the message to a shared Pub/Sub channel, all ten servers receive it, server 7 recognises that it holds Theo's socket and pushes the message, and the other nine discard it." style={{ width: "100%", minWidth: 700, display: "block" }}>
            <title>Reaching a socket held by a different server, through a shared channel</title>
            {arrowDefs}
            <Lifelines lanes={fanoutLanes} bottom={280} />
            <Msg from={92} to={266} y={84} label="send" />
            <Note x={266} y={110} text="no socket for Theo here" tone="danger" />
            <Msg from={266} to={440} y={140} label="publish" />
            <Msg from={440} to={614} y={170} label="all 10 receive it" />
            <Note x={614} y={196} text="this one holds it" tone="green" />
            <Msg from={614} to={788} y={226} label="push" tone="green" />
            <Note x={430} y={254} text="the other nine drop it on the floor" />
            <Note x={430} y={276} text="every server sees every message: that is the price" tone="danger" />
          </svg>
        </div>

        <div className="sd-callout" style={{ marginTop: 16 }}>
          Notice what grows. The fan-out scales with{" "}
          <strong className="sd-strong">the size of your fleet</strong>, not with the number
          of recipients, so adding servers makes each message cost more internally. Teams
          past a certain size stop broadcasting and keep a registry of which server holds
          which connection, which is faster and is now one more piece of state that can be
          wrong.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Worked Example</p>
        <h2 className="sd-h2">Thirty Seconds Late, And Every Dashboard Green</h2>

        <div className="sd-prose">
          <p>
            Messages are arriving half a minute after they were sent. API p99 is 60ms, the
            error rate is zero, every service reports healthy, and all of that is{" "}
            <strong className="sd-strong">true</strong>. Per-service metrics measure
            components answering for themselves, and nothing was slow inside a component.
            The message was waiting <em>between</em> them, and a queue is not a service with
            a latency number.
          </p>
          <p style={{ marginTop: 12 }}>
            A trace follows the one message across every hop and puts the time where it
            actually went:
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <TraceWaterfall />
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          Every unit of real work on this trace adds up to under a second. The other{" "}
          <strong className="sd-strong">29.4 seconds is a wait</strong>, and the fix is not
          faster code, it is more workers or fewer jobs. Two things would have caught it
          without a trace, and neither is a latency percentile:{" "}
          <strong className="sd-strong">queue depth</strong>, the one metric that describes a
          backlog, and a request ID carried through every log line so the hops can be lined
          up after the fact. Instrument the gaps between the boxes, not just the boxes.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Recap</p>
        <h2 className="sd-h2">The Whole Path</h2>

        <div className="sd-prose" style={{ marginBottom: 16 }}>
          <p>
            Read straight down. Each line is what that piece does, and the line between is
            what it still could not do &mdash; which is the piece underneath it.
          </p>
        </div>

        <div style={{ border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          {wholePath.map((row, i) => (
            <Fragment key={row.piece}>
              <div style={{ display: "grid", gridTemplateColumns: "26px minmax(110px, 160px) 1fr", gap: 12, alignItems: "baseline", padding: "13px 16px", background: "var(--sd-surface2)", borderTop: i ? "1px solid var(--sd-border)" : undefined }}>
                <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, color: "var(--sd-accent)" }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)" }}>{row.piece}</span>
                <span className="sd-text-sm-tight">{row.does}</span>
              </div>
              {/* The gap between two pieces, which is the only reason the next one
                  exists. Indented under the number so the chain reads as one column. */}
              {row.limit && (
                <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12, padding: "9px 16px", borderTop: "1px solid var(--sd-border)" }}>
                  <span aria-hidden="true" style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: "var(--sd-danger)" }}>&darr;</span>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-muted)" }}>{row.limit}</span>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
          A backend grows <strong className="sd-strong">one piece at a time</strong>. Each new
          piece gets added right when the last one hits its limit.
        </div>
      </div>

      <div className="sd-section">
        <p className="sd-eyebrow">Key Points</p>
        <h2 className="sd-h2">What To Carry Forward</h2>
        <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} columns={2} />
      </div>

      <div className="sd-quiz">
        <p className="sd-eyebrow-accent">Quiz Review</p>
        <p className="sd-quiz-title">Check your understanding</p>
        <QuizCarousel cards={quizCards} />
      </div>
    </>
  );
}
