"use client";

import { useState } from "react";
import {
  Breadcrumb,
  QuizCarousel,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "You're handed \"design a URL shortener\" and you can already picture the architecture. Why is drawing it the wrong first move?",
    answers: ["Because the diagram you're picturing answers a problem nobody has stated yet. Is it ten thousand links or ten billion? Do custom aliases exist? Do links expire? Each of those changes the design, and if you draw before asking, you end up defending a picture instead of solving the actual problem. Requirements come first because every later step consumes them."],
  },
  {
    question: "What does capacity estimation actually buy you, given that every number in it is a guess?",
    answers: ["An order of magnitude, which is enough to make structural decisions. 200 requests per second and 200,000 requests per second are different systems, and you only find out which one you're building by doing the arithmetic. The guess doesn't have to be right, it has to be right-sized."],
  },
  {
    question: "Why does database design come after the high-level diagram rather than before it?",
    answers: ["Because the diagram is what tells you how the data is read and written. Until you know which components hit which store and on what path, choosing an engine is picking a tool before knowing the job. The access pattern decides the store, not the other way around."],
  },
  {
    question: "You add a cache in step 6. What has to be true for that to be a real improvement?",
    answers: ["There has to be a component that the numbers from step 2 show is actually under pressure, and a read pattern with enough repetition to hit. A cache in front of something that isn't loaded adds a second copy of the truth that can go stale, with no throughput gained. Optimization needs a named bottleneck."],
  },
  {
    question: "What is the difference between saying \"we'll add redundancy\" and actually addressing a single point of failure?",
    answers: ["Naming what fails, who takes over, and how long the gap is. Redundancy as a word costs nothing. A second database replica with no defined promotion process is still an outage, just one with a spare machine watching."],
  },
  {
    question: "Two steps produce a contract that other people build against. Which, and why does that matter?",
    answers: ["Database design and interface design. The schema and the API are the two artifacts that outlive the conversation, because other teams and services commit to them. A component can be rewritten quietly; a published endpoint or a shipped schema can't."],
  },
  {
    question: "The order is a sequence, but the process isn't a straight line. Where does it realistically loop back?",
    answers: ["Usually from step 6 to step 3. Once you size the load, a component you drew as one box turns out to need splitting, replicating, or fronting with a queue. Occasionally it loops all the way to step 1, when the numbers reveal that a requirement was never plausible at the scale you were given."],
  },
  {
    question: "What is the single most common way this framework gets misused?",
    answers: ["Treating it as seven topics to recite instead of seven outputs to produce. The value isn't in mentioning capacity estimation, it's in arriving at a number you then use. Each step exists to hand something concrete to the next one, and a step that produces nothing was skipped regardless of whether it was named."],
  },
];

const whyThisExists = [
  "Handed a vague prompt, most people *start drawing immediately*. The diagram arrives before anyone has said how many users there are, and the rest of the discussion becomes a defence of that first picture.",
  "The opposite failure is just as common: *designing for a scale nobody asked for*. Sharding, multi-region replication, and a message queue, for a system that will serve a few hundred requests a second.",
  "Without an order to work in, the hard parts get skipped silently. *Nobody forgets the database, everybody forgets what happens when it dies.*",
  "A sequence fixes all three, because each step *produces something the next step needs*. If a step produced nothing, you skipped it, whether or not you said its name out loud.",
];

interface Step {
  n: number;
  label: string;
  color: string;
  wash: string;
  asks: string;
  produces: string;
  trap: string;
  /** What just changed on the diagram, shown under the figure. */
  draws: string;
}

const steps: Step[] = [
  {
    n: 1,
    label: "Clarify Requirements",
    color: "var(--sd-accent)",
    wash: "rgba(76, 110, 245, 0.12)",
    asks: "Who uses this, for what, and how many of them are there?",
    produces: "A written split between what the system must *do* and what it must *hold up under*: features on one side, scale, latency, and availability targets on the other.",
    trap: "Treating the one-line prompt as the spec. *\"Design Twitter\" is a prompt, not a requirement*, and every ambiguity you leave in it becomes a design you can't defend.",
    draws: "Nothing yet. The canvas stays empty on purpose, because everything you would draw now would be a guess.",
  },
  {
    n: 2,
    label: "Estimate Capacity",
    color: "var(--sd-teal)",
    wash: "rgba(56, 178, 172, 0.12)",
    asks: "Is this a single-server problem or a fleet problem?",
    produces: "Rough numbers for *traffic, storage, and bandwidth*: requests per second at peak, bytes written per day, how much data exists after a year.",
    trap: "Chasing precision. *You need the order of magnitude*, not the third digit. The decisions this unlocks are structural, and structure doesn't change between 940 and 1,100 requests per second.",
    draws: "Still nothing. You're doing arithmetic, and the arithmetic is what decides how many boxes step 3 is allowed to have.",
  },
  {
    n: 3,
    label: "High-Level Design",
    color: "var(--sd-green)",
    wash: "rgba(72, 187, 120, 0.12)",
    asks: "What are the boxes, and how does a request move between them?",
    produces: "A block diagram: *clients, entry points, services, and stores*, with the arrows that say what calls what.",
    trap: "Drawing every component you know. *Draw the ones the requirements demand*, and let the steps after this one add the rest with a reason attached.",
    draws: "The spine appears: a way in, something that spreads load, something that does work, somewhere the truth lives. Four boxes, nothing else earned yet.",
  },
  {
    n: 4,
    label: "Database Design",
    color: "var(--sd-amber)",
    wash: "rgba(214, 158, 46, 0.14)",
    asks: "What shape is the data, and how is it actually read?",
    produces: "The data model, plus *a store chosen per access pattern* rather than one engine for everything.",
    trap: "Picking the engine first and bending the data to fit it. *The access pattern decides the store*, which is why this step cannot come before the diagram that shows the access patterns.",
    draws: "No new boxes. One box stops being generic: the store gets an engine, a schema, and a reason for both.",
  },
  {
    n: 5,
    label: "Interface Design",
    color: "var(--sd-accent)",
    wash: "rgba(76, 110, 245, 0.12)",
    asks: "What does a caller send, and what comes back?",
    produces: "The *endpoints or events* other systems use, with the request and response shapes spelled out.",
    trap: "Designing for the diagram instead of the caller. *An interface is a promise you can't quietly rewrite later*, because somebody else has already built against it.",
    draws: "A boundary is drawn around the work. Everything inside it can be rewritten freely; everything crossing it is now a promise.",
  },
  {
    n: 6,
    label: "Scalability and Performance",
    color: "var(--sd-teal)",
    wash: "rgba(56, 178, 172, 0.12)",
    asks: "Which specific box breaks first under the load from step 2?",
    produces: "Placement decisions for *caching, indexing, replication, sharding, and CDNs*, each attached to a component that the numbers say is under pressure.",
    trap: "Adding a cache everywhere. *A cache in front of an unloaded service is a second copy of the truth that can go stale*, bought for nothing.",
    draws: "Now the extras land, and each one has to name the pressure it relieves: a CDN, a cache, a second worker, and a queue for work nobody is waiting on.",
  },
  {
    n: 7,
    label: "Reliability and Resiliency",
    color: "var(--sd-danger)",
    wash: "rgba(229, 89, 93, 0.10)",
    asks: "What breaks, and does the user notice?",
    produces: "A list of *single points of failure*, and for each one, what takes over and how long the gap lasts.",
    trap: "Saying \"we'll add redundancy\" and stopping there. *A replica with no promotion process is still an outage*, just one with a spare machine watching it happen.",
    draws: "The last pass is adversarial: a replica behind the store, and a red ring around the box that still takes the whole system down with it.",
  },
];

/** Diagram pieces, each tagged with the step that earns it. */
const nodes = [
  { id: "client", from: 3, x: 20, y: 120, w: 120, h: 75, kind: "Entry", name: "Client" },
  { id: "lb", from: 3, x: 195, y: 205, w: 150, h: 75, kind: "Spread", name: "Load Balancer" },
  { id: "app1", from: 3, x: 405, y: 125, w: 150, h: 70, kind: "Work", name: "App Server" },
  { id: "db", from: 3, spotlight: 4, x: 645, y: 140, w: 150, h: 70, kind: "Truth", name: "Database" },
  { id: "cdn", from: 6, x: 195, y: 30, w: 150, h: 60, kind: "Static", name: "CDN" },
  { id: "app2", from: 6, x: 405, y: 250, w: 150, h: 70, kind: "Work", name: "App Server" },
  { id: "cache", from: 6, x: 645, y: 35, w: 150, h: 70, kind: "Hot reads", name: "Cache" },
  { id: "queue", from: 6, x: 645, y: 250, w: 150, h: 70, kind: "Defer", name: "Queue" },
  { id: "worker", from: 6, x: 830, y: 250, w: 90, h: 70, kind: "Async", name: "Worker" },
  { id: "replica", from: 7, x: 830, y: 140, w: 90, h: 70, kind: "Standby", name: "Replica" },
];

const edges = [
  { id: "c-lb", from: 3, d: "M 140 165 H 165 V 235 H 195" },
  { id: "lb-a1", from: 3, d: "M 345 220 H 375 V 160 H 405" },
  { id: "a1-db", from: 3, d: "M 555 170 H 600 V 175 H 645", label: "read / write", lx: 600, ly: 162 },
  { id: "c-cdn", from: 6, d: "M 140 150 H 165 V 60 H 195" },
  { id: "lb-a2", from: 6, d: "M 345 250 H 375 V 285 H 405" },
  { id: "a1-cache", from: 6, d: "M 555 150 H 600 V 70 H 645", label: "read", lx: 600, ly: 60 },
  { id: "a2-q", from: 6, d: "M 555 285 H 645", label: "publish", lx: 600, ly: 277 },
  { id: "q-w", from: 6, d: "M 795 285 H 830" },
  { id: "db-rep", from: 7, d: "M 795 175 H 830", label: "replicate", lx: 812, ly: 133 },
];

const handoffs = [
  ["1 → 2", "Feature list and scale targets", "There is something to count"],
  ["2 → 3", "Requests per second, storage growth", "You know whether one box or a fleet"],
  ["3 → 4", "Which components read and write data", "The access patterns are visible"],
  ["4 → 5", "The entities and their relationships", "Endpoints have something to return"],
  ["5 → 6", "The paths callers actually hit", "You know what to optimise, and what to leave alone"],
  ["6 → 7", "Where load concentrates", "The failure points are now identifiable"],
  ["7 → 3", "What has to survive a failure", "The diagram gets revised, honestly"],
];

const courseLinks = [
  ["Clarify Requirements", "Design Requirements & Estimating Resource Needs", "/lessons/05-requirements-and-estimation"],
  ["Estimate Capacity", "Latency, Throughput & Availability", "/lessons/02-latency-throughput-availability"],
  ["High-Level Design", "Architectural Styles: Monolith to Event-Driven", "/lessons/10-architectural-styles"],
  ["Database Design", "Selecting Relational vs NoSQL Database Models", "/lessons/01-relational-vs-nosql"],
  ["Interface Design", "API Design: REST, GraphQL, and gRPC", "/lessons/08-api-design"],
  ["Scalability and Performance", "Caching Strategies & Cache Invalidation", "/lessons/09-caching-strategies"],
  ["Reliability and Resiliency", "CAP Theorem & Trade-offs", "/lessons/03-cap-theorem"],
];

const commonMistakes = [
  "Drawing the architecture before asking a single question, then spending the rest of the session defending a diagram that was a guess.",
  "Naming capacity estimation without producing a number, which leaves every later decision resting on nothing.",
  "Choosing the database engine from habit rather than from the access pattern the diagram just revealed.",
  "Designing endpoints that mirror your internal components instead of what a caller actually needs to accomplish.",
  "Sprinkling caches, queues, and shards over a design that has no measured pressure anywhere, which buys complexity and stale data with no throughput in return.",
  "Stopping at “we’ll replicate it” without saying what promotes, how failover is detected, or what the user sees during the gap.",
  "Marching through all seven and never looping back, when the whole reason step 6 exists is to send you back to step 3 with better information.",
];

const keyPoints = [
  "*The order is the point.* Each step produces the input the next one consumes, which is why skipping ahead leaves you making decisions without the facts that decide them.",
  "*Requirements before diagrams.* The prompt is not the spec, and every ambiguity you don't resolve turns into a design choice you can't justify.",
  "*Estimates only need an order of magnitude.* 200 requests per second and 200,000 are different systems, and arithmetic is how you find out which one you're in.",
  "*The access pattern picks the store.* That is why database design sits after the high-level diagram rather than before it.",
  "*Schemas and interfaces outlive the conversation*, because other people build against them. Components can be rewritten quietly, contracts cannot.",
  "*Optimisation needs a named bottleneck.* A cache with no pressure behind it is a stale copy you pay to maintain.",
  "*Redundancy is a claim until you say what fails over and how long it takes.* Step 7 is where a design stops being optimistic.",
];

/* Not a lesson: it's the order you work in when applying them, so it sits outside
   the numbered sequence — no group, no prev/next, nothing to mark complete. */

export default function Walkthrough() {
  const [active, setActive] = useState(1);
  const step = steps[active - 1];

  return (
    <>
      <Breadcrumb section="The Method" lesson="A 7-Step Walkthrough for Any System Design" />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          The Method
        </p>
        <h1 className="sd-h1">A 7-Step Walkthrough for Any System Design</h1>
        <p className="sd-lede">
          The order to work in when you&rsquo;re handed a blank page and a vague problem.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              These seven steps are <strong className="sd-strong">an order of operations, not a checklist of topics</strong>. Each one produces something concrete that the next one needs, so a step you named but didn&rsquo;t finish is a step you skipped. The sequence is what stops a design from being a picture you drew first and justified afterwards.
            </p>
          </div>
        </div>

        {/* Interactive walkthrough */}
        <div className="sd-section">
          <p className="sd-eyebrow">Walk It</p>
          <h2 className="sd-h2">Seven Steps, One Diagram</h2>

          <div className="sd-prose">
            <p>
              Step through it. <strong className="sd-strong">The diagram only gains a box when a step earns it</strong>, and the greyed-out pieces are what you have not justified yet.
            </p>
          </div>

          {/* Stepper */}
          <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 14 }}>
            <svg
              viewBox="0 0 980 210"
              role="group"
              aria-label="Seven-step walkthrough. Select a step to see what it produces and what it adds to the diagram."
              style={{ width: "100%", minWidth: 720, display: "block" }}
            >
              <title>The seven-step walkthrough</title>
              <defs>
                <marker id="sd-step-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-border-strong)" />
                </marker>
                <marker id="sd-loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              {steps.map((s, i) => {
                const x = 10 + i * 140;
                const on = s.n === active;
                const done = s.n < active;
                return (
                  <g key={s.n}>
                    {i > 0 && (
                      <path
                        d={`M ${x - 20} 80 H ${x - 4}`}
                        fill="none"
                        stroke={done || on ? s.color : "var(--sd-border-strong)"}
                        strokeWidth="1.5"
                        markerEnd="url(#sd-step-arrow)"
                      />
                    )}
                    <g
                      role="button"
                      tabIndex={0}
                      aria-pressed={on}
                      aria-label={`Step ${s.n}, ${s.label}`}
                      onClick={() => setActive(s.n)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActive(s.n);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        x={x}
                        y={30}
                        width={120}
                        height={100}
                        rx={10}
                        fill={on ? s.wash : "var(--sd-surface2)"}
                        stroke={on || done ? s.color : "var(--sd-border)"}
                        strokeWidth={on ? 2.5 : 1.5}
                        opacity={on || done ? 1 : 0.55}
                      />
                      <text x={x + 60} y={57} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill={s.color} opacity={on || done ? 1 : 0.6}>
                        {`0${s.n}`}
                      </text>
                      {s.label.split(" ").map((word, w) => (
                        <text
                          key={word + w}
                          x={x + 60}
                          y={80 + w * 15}
                          textAnchor="middle"
                          fontFamily="var(--sd-font-mono)"
                          fontSize="11.5"
                          fill="var(--sd-text)"
                          opacity={on || done ? 1 : 0.55}
                        >
                          {word}
                        </text>
                      ))}
                    </g>
                  </g>
                );
              })}

              {/* Load-shaped findings send you back to the diagram */}
              <path
                d="M 910 140 V 180 H 300 V 140"
                fill="none"
                stroke="var(--sd-muted)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                markerEnd="url(#sd-loop-arrow)"
              />
              <text x="605" y="199" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11.5" fill="var(--sd-muted)">
                what the numbers reveal sends you back to the diagram
              </text>
            </svg>
          </div>

          {/* The diagram, assembling */}
          <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 14 }}>
            <svg
              viewBox="0 0 940 340"
              role="img"
              aria-label={`The design after step ${active}. ${step.draws}`}
              style={{ width: "100%", minWidth: 640, display: "block" }}
            >
              <title>{`The design after step ${active}`}</title>
              <defs>
                <marker id="sd-hl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-border-strong)" />
                </marker>
              </defs>

              {active < 3 && (
                <text x="470" y="26" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-muted)">
                  nothing drawn yet
                </text>
              )}

              {edges.map((e) => {
                const shown = e.from <= active;
                return (
                  <g key={e.id} opacity={shown ? 1 : 0.12}>
                    <path
                      d={e.d}
                      fill="none"
                      stroke="var(--sd-border-strong)"
                      strokeWidth="1.5"
                      strokeDasharray={shown ? undefined : "4 4"}
                      markerEnd={shown ? "url(#sd-hl-arrow)" : undefined}
                    />
                    {e.label && shown && (
                      <text x={e.lx} y={e.ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Step 5 draws the contract, not a component */}
              <g opacity={active >= 5 ? 1 : 0.12}>
                <rect
                  x={385}
                  y={105}
                  width={190}
                  height={235}
                  rx={12}
                  fill="none"
                  stroke="var(--sd-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                />
                <text x={480} y={124} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill="var(--sd-accent)">
                  PUBLIC INTERFACE
                </text>
              </g>

              {nodes.map((n) => {
                const shown = n.from <= active;
                const justAdded = n.from === active;
                const lit = justAdded || n.spotlight === active;
                const ring = n.id === "lb" && active === 7 ? "var(--sd-danger)" : lit ? "var(--sd-teal)" : "var(--sd-border-strong)";
                return (
                  <g key={n.id} opacity={shown ? 1 : 0.12}>
                    <rect
                      x={n.x}
                      y={n.y}
                      width={n.w}
                      height={n.h}
                      rx={10}
                      fill="var(--sd-surface2)"
                      stroke={ring}
                      strokeWidth={lit || (n.id === "lb" && active === 7) ? 2.5 : 1.5}
                      strokeDasharray={shown ? undefined : "4 4"}
                    />
                    <text x={n.x + n.w / 2} y={n.y + 27} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill={lit ? "var(--sd-teal)" : "var(--sd-muted)"}>
                      {n.kind.toUpperCase()}
                    </text>
                    <text x={n.x + n.w / 2} y={n.y + 49} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fontWeight="700" fill="var(--sd-text)">
                      {n.name}
                    </text>
                  </g>
                );
              })}

              {active === 7 && (
                <text x={270} y={300} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11.5" fill="var(--sd-danger)">
                  still a single point of failure
                </text>
              )}
            </svg>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderLeft: `3px solid ${step.color}`, borderRadius: 8, padding: "13px 16px" }}>
            <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: step.color, flexShrink: 0, lineHeight: 1.65 }}>{`0${step.n}`}</span>
            <p className="sd-text-sm-tight">{step.draws}</p>
          </div>

          {/* Active step detail */}
          <div style={{ background: step.wash, border: "1px solid var(--sd-border)", borderRadius: 10, padding: "10px 14px", margin: "16px 0 10px" }}>
            <p className="sd-text-sm-tight" style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5 }}>
              {step.asks}
            </p>
          </div>

          <div className="sd-grid-2">
            {[
              { role: "You walk away with", body: step.produces },
              { role: "Where it goes wrong", body: step.trap },
            ].map((pt) => (
              <div key={pt.role} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: step.color, marginBottom: 5 }}>
                  {pt.role}
                </div>
                <p className="sd-text-sm-tight">{hl(pt.body)}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setActive((n) => Math.max(1, n - 1))}
              disabled={active === 1}
              style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-text)", cursor: active === 1 ? "default" : "pointer", opacity: active === 1 ? 0.4 : 1 }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActive((n) => Math.min(steps.length, n + 1))}
              disabled={active === steps.length}
              style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-text)", cursor: active === steps.length ? "default" : "pointer", opacity: active === steps.length ? 0.4 : 1 }}
            >
              Next step →
            </button>
            <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: "var(--sd-muted)" }}>
              {`${active} / ${steps.length}`}
            </span>
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 18 }}>
            Watch what steps 1 and 2 draw: <strong className="sd-strong">nothing</strong>. That is the whole argument. Two of the seven steps produce no picture at all, and they are the two most often skipped, because skipping them is the only way to start drawing immediately.
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">What Goes Wrong Without An Order</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists.map(hl)} />
        </div>

        {/* Hand-offs */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Mechanism</p>
          <h2 className="sd-h2">What Each Step Hands The Next</h2>

          <div className="sd-prose">
            <p>
              This is the test for whether a step is finished. <strong className="sd-strong">If you cannot say what it handed forward, it did not happen.</strong>
            </p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["", "What moves forward", "What it unblocks"].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {handoffs.map(([edge, carries, unblocks]) => (
                  <tr key={edge}>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", fontFamily: "var(--sd-font-mono)", fontSize: 12.5, color: "var(--sd-teal)", whiteSpace: "nowrap" }}>{edge}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", color: "var(--sd-text)" }}>{carries}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", color: "var(--sd-muted)" }}>{unblocks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Where each step lives in the course */}
        <div className="sd-section">
          <p className="sd-eyebrow">Going Deeper</p>
          <h2 className="sd-h2">Where Each Step Lives In This Course</h2>

          <div className="sd-prose">
            <p>This lesson is the map, not the territory. Each step has a lesson that does the actual work.</p>
          </div>

          <div className="sd-stack">
            {courseLinks.map(([stepName, title, href]) => (
              <a
                key={href}
                href={href}
                style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 16px", textDecoration: "none" }}
              >
                <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: "var(--sd-muted)", minWidth: 210 }}>{stepName}</span>
                <span style={{ color: "var(--sd-accent)", fontSize: 14 }}>{title}</span>
              </a>
            ))}
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 18 }}>
            The seven steps come from ByteByteGo&rsquo;s guide to system design interviews. Their{" "}
            <a href="https://github.com/ByteByteGoHq/system-design-101" target="_blank" rel="noreferrer" style={{ color: "var(--sd-accent)" }}>
              system-design-101 repository
            </a>{" "}
            is the wider reference behind it, and worth reading alongside this course.
          </div>
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">Common Mistakes</p>
          <h2 className="sd-h2">Ways This Framework Gets Misused</h2>
          <MarkerList mark="✕" color="var(--sd-red)" bg="var(--sd-danger-wash)" items={commonMistakes} />
        </div>

        {/* Key points */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Points</p>
          <h2 className="sd-h2">What To Carry Out Of This</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} />
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Quiz Review</p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>
    </>
  );
}
