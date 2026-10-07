"use client";

import {
  Breadcrumb,
  QuizCarousel,
  PageNav,
  LearnedToggle,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "A team keeps saying they should move to microservices because that's what the companies they admire run. What is wrong with that reasoning?",
    answers: ["Company size is not the signal. Those companies moved because a specific pain forced them to, usually one team's deploy breaking another team's feature, or parts of the product needing to scale at wildly different rates. Adopting the destination without the pain buys network latency, service discovery, and per-service pipelines while earning nothing, because a single team that can already ship fast gets no benefit from paying those costs."],
  },
  {
    question: "Tracing a single request across your services has become guesswork. Is that a signal to change architecture?",
    answers: ["No. That is a tooling gap, not an architectural one. Distributed tracing is the fix, and restructuring the system will not produce it. This matters because the symptom feels architectural, and teams have rewritten working systems chasing a problem that an instrumentation library would have solved."],
  },
  {
    question: "What is a distributed monolith, and why is it worse than the monolith it replaced?",
    answers: ["Services that were split apart but still deploy together, share one database, or break the moment another service changes its schema. It is worse because you now pay every cost of a distributed system, network calls that can fail, service discovery, per-service pipelines, harder debugging, while keeping every constraint of the monolith, since nothing can actually ship or fail independently. You bought the bill without the benefit."],
  },
  {
    question: "Serverless bills only for execution rather than idle uptime. Why is that not automatically the cheaper or better choice for a user-facing endpoint?",
    answers: ["Because a function that has gone cold has to start before it can answer. That start runs a wide range, roughly 150 to 500 milliseconds for Python or Node, but multiple seconds for a heavy dependency tree or a VPC attachment. Invisible on a background image resize that nobody is waiting for, painful on a checkout button where a user is. The billing model is only an advantage when the workload is genuinely spiky or infrequent."],
  },
  {
    question: "Both SOA and event-driven architecture decouple services. What actually differs between them, and where does each one hurt when something fails?",
    answers: ["Direction of knowledge. In SOA a central bus routes messages, so the bus knows about every service and every routing rule, and a bus outage stalls all traffic through it. In event-driven, a service publishes a fact to a stream without knowing who listens, so new consumers can be added without touching it, and a slow consumer only falls behind on its own, without affecting the stream or anyone else reading it."],
  },
  {
    question: "The cheat sheet insists nobody skips a stage for free. What does that actually mean in practice?",
    answers: ["That every migration is a trade, not an upgrade. Moving off a monolith buys independent deploys and failure isolation, and hands you network latency, eventual consistency, and distributed debugging in exchange. Moving to event-driven buys independent consumers and hands you harder ordering guarantees and request tracing. There is no step that is strictly better, which is why the honest question is always which set of problems you would rather have."],
  },
];

const whyThisExists = [
  "Teams reach for microservices because it is what the companies they admire run, then discover they have bought network latency, service discovery, and per-service pipelines without ever having had the pain that justified any of it.",
  "Company size is the signal most people use for when to move, and it is the wrong one. The real signals are specific symptoms, like a deploy touching unrelated code, or one team's bug taking down a feature owned by someone else.",
  "Some problems that feel architectural are not. If tracing a request across services has become guesswork, that is a tooling gap, and no amount of restructuring will produce the tracing you actually needed.",
];

const styles = [
  {
    label: "Monolith",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    analogy: "One cook running the whole kitchen. Nothing to coordinate, nothing to route, and nobody eats if that cook is out sick.",
    points: [
      { role: "How it works", body: "One codebase, one build, one deployment. Database logic, business logic, and the website are glued into a single unit that ships together. *Early Amazon.com ran exactly like this*, and it worked until every small change meant redeploying the entire site and one bug could take down the whole store." },
      { role: "Use it when", body: "You are a small team validating a product, and *the overhead of distributed systems would slow you down more than a redeploy ever will*." },
      { role: "Avoid", body: "Splitting into microservices before the monolith has actually caused pain. *Premature decomposition buys you network latency, service discovery, and per-service deploys*, none of which earns you anything if one team can already ship fast." },
    ],
  },
  {
    label: "SOA",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    analogy: "Stations in the kitchen, but every order passes through one head chef who decides where it goes. Coordinated, until that chef becomes the queue.",
    points: [
      { role: "How it works", body: "The system breaks into services, but they all talk through a shared middleman called an enterprise service bus, *a central switchboard routing messages between departments*. In 2002 Jeff Bezos mandated that every Amazon team expose its functionality through a service interface, no exceptions. Clunky next to what came later, but the direct ancestor of AWS." },
      { role: "Use it when", body: "Many internal teams need to expose functionality to each other and *you need centralized control over how services communicate*." },
      { role: "Avoid", body: "Letting the bus become a dumping ground of untested transformation logic. *If nobody can explain what happens to a message between send and receive*, you have built a black box, not an integration layer." },
    ],
  },
  {
    label: "Microservices",
    color: "var(--sd-green)",
    wash: "rgba(157, 176, 247,0.12)",
    analogy: "Every station takes its own orders and owns its own supplies. Genuinely independent, and now somebody has to be able to say where an order actually is.",
    points: [
      { role: "How it works", body: "Small, independently deployable services, *each one owning its own database*. Each can be updated, scaled, or crashed without taking down the others. Netflix is the textbook case: after a 2008 database outage took their whole service down, they spent years breaking the monolith apart so a failure in recommendations never touches billing." },
      { role: "Use it when", body: "Different parts of your product *scale at different rates*, and a failure in one should not be allowed to take down the rest." },
      { role: "Avoid", body: "The distributed monolith: services that all deploy together, share one database, or break the moment another service's schema changes. That is *a monolith with network latency*, not microservices." },
    ],
  },
  {
    label: "Serverless",
    color: "var(--sd-accent)",
    wash: "rgba(76, 110, 245,0.12)",
    analogy: "A caterer you call only when there is an event. No kitchen sitting idle, and they need a moment to arrive.",
    points: [
      { role: "How it works", body: "You stop thinking about servers. You write a function, it runs only when triggered by an event, then disappears, and *you are billed per execution rather than for idle uptime*. Upload an image, a function fires, resizes it, and shuts down. No server was sitting around waiting for that to happen." },
      { role: "Use it when", body: "The workload is *spiky or infrequent*, and paying for idle servers between events would be wasted spend." },
      { role: "Avoid", body: "Putting a latency-sensitive, user-facing endpoint on functions you have never load-tested. *Cold starts run a wide range*, roughly 150 to 500ms for Python or Node, but multiple seconds for a heavy dependency tree or a VPC attachment. Fine for a background resize, painful for a checkout button." },
    ],
  },
  {
    label: "Event-driven",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    analogy: "A board where “table 6 ordered” gets posted, and every station that cares reacts without being told to. Nobody waits to be asked, and nobody can say exactly when the whole order is done.",
    points: [
      { role: "How it works", body: "Services publish events into a stream and listeners react independently. *The publisher does not know who is listening*, which is what lets a new consumer be added without touching the service that produced the event." },
      { role: "Use it when", body: "*Several unrelated systems all need to react to the same fact* in real time, without blocking each other or the thing that produced it." },
      { role: "Avoid", body: "Assuming the decoupling is free. *Tracing one request across many asynchronous consumers is genuinely harder*, and ordering guarantees stop being something you get for nothing." },
    ],
  },
];

const moveSignals = [
  ["Every deploy touches unrelated code and Friday releases are dreaded", "SOA or microservices"],
  ["Multiple teams keep re-implementing the same internal integration", "SOA"],
  ["One team's bug takes down a feature owned by a different team", "Microservices"],
  ["You're paying for servers that sit idle most of the day", "Serverless"],
  ["Five unrelated services all need to react to the same business event", "Event-driven"],
  ["Tracing one request across services is now guesswork", "Add tracing. That's a tooling gap, not a new architecture"],
];

const monolithVsMicro = {
  left: "Monolith",
  right: "Microservices",
  rows: [
    ["What it is", "One deployable unit", "Many independently deployable services"],
    ["You manage", "A single build and deploy pipeline", "Per-service pipelines, service discovery, networking"],
    ["Billed by", "Server uptime, regardless of load", "Usage per service, scaled independently"],
    ["Failure blast radius", "Whole application", "Isolated to the failing service"],
  ],
};

const soaVsEvent = {
  left: "SOA",
  right: "Event-driven",
  rows: [
    ["What it is", "Services routed through a central bus", "Services reacting to a shared event stream"],
    ["You manage", "The enterprise service bus and its routing rules", "Topics, consumers, and event schemas"],
    ["Billed by", "Bus throughput and middleware licensing", "Stream throughput and retention"],
    ["Failure blast radius", "Bus outage stalls all routed traffic", "A slow consumer only lags itself, not the stream"],
  ],
};

const terms = [
  { title: "Enterprise service bus", def: "The central switchboard in SOA that routes messages between services, holding the routing rules so individual services do not have to know about each other." },
  { title: "Circuit breaker", def: "Stops calling a failing service after repeated errors, so one bad dependency doesn't cascade through everything that depends on it." },
  { title: "Saga pattern", def: "Coordinates a multi-step transaction across services using compensating actions instead of one database transaction, because no single database owns all the data any more." },
  { title: "Bulkhead", def: "Isolates resources like thread pools or connections per dependency, so one slow service can't starve the others of capacity." },
  { title: "Idempotency key", def: "A unique ID attached to a request so retrying it doesn't repeat the side effect, like charging a customer twice." },
  { title: "Dead-letter queue", def: "Where a message goes after repeated processing failures, so it doesn't block the rest of the stream behind it." },
  { title: "Eventual consistency", def: "Data across services converges to correct over time rather than instantly, which means reads may briefly be stale." },
  { title: "Service mesh", def: "An infrastructure layer that handles retries, timeouts, and observability between microservices, so each service doesn't reinvent them." },
  { title: "API gateway", def: "A single entry point that routes, authenticates, and rate-limits requests to backend services." },
];

const seenInTheWild = [
  "Early Amazon.com ran as one monolithic application handling everything. It worked until it didn't: every small change meant redeploying the entire site, and one bug could take down the whole store.",
  "In 2002 Jeff Bezos issued an internal mandate that every Amazon team must expose its functionality through a service interface, no exceptions. It was clunky and heavyweight next to what came later, and it was the direct ancestor of AWS.",
  "Netflix spent years breaking its monolith into hundreds of microservices after a 2008 database outage took the whole service down, specifically so a failure in one area like recommendations never touches another like billing.",
  "Amazon today runs microservices, event streams, and serverless functions side by side. Not one pure architecture, which is the normal end state rather than a compromise.",
];

const keyPoints = [
  "*These five are not a ladder you climb and leave behind.* A modern system usually layers several of them together, and running more than one is normal rather than a sign of indecision.",
  "*Every migration trades one set of problems for another.* Nobody skips a stage for free, and no step is strictly better than the one before it.",
  "*Company size is not the signal.* Specific symptoms are: deploys touching unrelated code, one team's bug breaking another team's feature, servers idle most of the day.",
  "A distributed monolith is the common failure: services split apart that still deploy together or share a database, *paying every cost of distribution with none of the independence*.",
  "Serverless bills per execution instead of per idle hour, but *cold starts make it a poor fit for latency-sensitive user-facing paths* unless you have measured them.",
  "SOA centralizes knowledge in a bus, event-driven distributes it into a stream. *The publisher not knowing its listeners* is what makes new consumers cheap to add.",
];

const commonMistakes = [
  "Splitting a monolith into microservices before the monolith has actually caused pain, buying network latency and per-service pipelines that earn nothing while one team can still ship fast.",
  "Building a distributed monolith: services that deploy together, share one database, or break when another service changes its schema, which is every cost of distribution with none of the benefit.",
  "Letting the enterprise service bus accumulate untested transformation logic until nobody can explain what happens to a message between send and receive.",
  "Putting a latency-sensitive endpoint on serverless functions without load-testing cold starts, which range from barely noticeable to multiple seconds depending on runtime and dependencies.",
  "Treating a tooling gap as an architecture problem, most often rewriting a system because requests are hard to trace when distributed tracing was the actual answer.",
  "Assuming event-driven decoupling is free, and discovering afterwards that ordering guarantees and cross-service debugging both got harder.",
];

const stages = [
  "One team, one deploy, nobody has been paged at 3am yet. Stay on the *monolith*.",
  "Multiple internal teams need to call each other's functionality through one gateway. Move to *SOA*.",
  "Different parts of the product need to scale, deploy, and fail independently. Break out *microservices*.",
  "The workload is spiky, infrequent, or event-triggered, and idle servers would be wasted spend. Go *serverless*.",
  "Many independent systems need to react to the same fact in real time without blocking each other. Adopt *event-driven* architecture.",
];

function CompareTable({ spec }: { spec: { left: string; right: string; rows: string[][] } }) {
  return (
    <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {["", spec.left, spec.right].map((h, i) => (
              <th key={i} style={{ padding: "12px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map(([label, a, b], i, arr) => (
            <tr key={label}>
              <td style={{ padding: "12px 16px", color: "var(--sd-muted)", fontWeight: 500, borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{label}</td>
              <td style={{ padding: "12px 16px", color: "var(--sd-amber)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{a}</td>
              <td style={{ padding: "12px 16px", color: "var(--sd-teal)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Lesson10() {
  const nav = getLessonNav("architectural-styles");

  return (
    <>
      <Breadcrumb section={nav.sectionTitle} lesson="Architectural Styles: Monolith to Event-Driven" />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">Architectural Styles: Monolith to Event-Driven</h1>
        <LearnedToggle />
        <p className="sd-lede">
          The progression companies actually get forced through, and what each step costs.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              These five styles are <strong className="sd-strong">not a ranking, and moving between them is not an upgrade</strong>. Every migration trades one set of problems for another, nobody skips a stage for free, and real systems end up running several at once rather than picking a winner.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">Why Teams Move Too Early</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists.map(hl)} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">A Kitchen That Keeps Outgrowing Itself</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, alignItems: "stretch" }}>
            {styles.map((st) => (
              <div key={st.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: st.wash, color: st.color, padding: "9px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {st.label}
                </div>
                <div style={{ padding: "12px" }}>
                  <p className="sd-text-xs">{st.analogy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The five styles */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">What Each Style Actually Does</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {styles.map((st) => (
              <div key={st.label}>
                <p className="sd-eyebrow-sub" style={{ color: st.color }}>{st.label}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "stretch" }}>
                  {st.points.map((pt) => (
                    <div key={pt.role} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: st.color, marginBottom: 5 }}>
                        {pt.role}
                      </div>
                      <p className="sd-text-sm-tight">{hl(pt.body)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* When to move */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Real Signal</p>
          <h2 className="sd-h2">When To Actually Move</h2>

          <div className="sd-prose">
            <p>
              Company size isn&rsquo;t the real signal, <strong className="sd-strong">these symptoms are</strong>. Match what you&rsquo;re feeling to what fixes it, and notice that the last row is not an architecture at all.
            </p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Signal you're seeing", "Move to"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {moveSignals.map(([signal, move], i, arr) => (
                  <tr key={signal}>
                    <td style={{ padding: "12px 16px", color: "var(--sd-muted)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{signal}</td>
                    <td style={{ padding: "12px 16px", color: i === arr.length - 1 ? "var(--sd-amber)" : "var(--sd-teal)", fontWeight: 500, borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{move}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sd-callout sd-callout-accent">
            That last row is the one worth remembering. <strong className="sd-strong">Some problems that feel architectural are not</strong>, and a system rewritten to fix a missing instrumentation library still won&rsquo;t have the tracing it needed.
          </div>
        </div>

        {/* Comparisons */}
        <div className="sd-section">
          <p className="sd-eyebrow">Side By Side</p>
          <h2 className="sd-h2">What You Actually Trade</h2>

          <p className="sd-eyebrow-sub">Monolith vs microservices</p>
          <CompareTable spec={monolithVsMicro} />

          <p className="sd-eyebrow-sub" style={{ marginTop: 20 }}>SOA vs event-driven</p>
          <CompareTable spec={soaVsEvent} />

          <div className="sd-callout">
            Read the <strong className="sd-strong">failure blast radius</strong> row of both tables together. That single line is most of the reason anyone takes on the extra machinery: not speed, but limiting how much goes down when something does.
          </div>
        </div>

        {/* Nobody runs just one */}
        <div className="sd-section">
          <p className="sd-eyebrow">In Practice</p>
          <h2 className="sd-h2">Nobody Runs Just One</h2>

          <div className="sd-prose">
            <p>
              These patterns aren&rsquo;t a ladder you climb and leave behind, <strong className="sd-strong">they compose</strong>. A modern system is usually several of them layered together: microservices that communicate through events instead of direct calls, a few spiky workloads pulled out into serverless functions, and an API gateway or service mesh handling the cross-cutting concerns like auth, retries, and rate limits so no single service has to reinvent them.
            </p>
            <p style={{ marginTop: 12 }}>
              Amazon today runs microservices, event streams, and serverless functions side by side. <strong className="sd-strong">Not one pure architecture</strong>, and that is the normal end state rather than a compromise.
            </p>
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Terms</p>
          <h2 className="sd-h2">Jargon You&rsquo;ll Hit Next</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">The Progression, As It Actually Happened</h2>
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
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Which Stage Are You Actually At?</h2>

          <div className="sd-stack">
            {stages.map((stage, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 16px" }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <p className="sd-text-sm-tight">{hl(stage)}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
            Read those five against a system you actually work on, and be honest about which line describes it today rather than which one you would like to be answering. <strong className="sd-strong">If none of the symptoms are present, the answer is to stay where you are.</strong>
          </div>
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Quiz Review</p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <PageNav {...nav} />
    </>
  );
}
