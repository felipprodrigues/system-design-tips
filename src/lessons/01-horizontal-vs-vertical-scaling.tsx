"use client";

import { useState } from "react";
import {
  Breadcrumb,
  DeepDiveButton,
  SidePanel,
  PanelSection,
  QuizCarousel,
  PageNav,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";

const quizCards: QuizCard[] = [
  {
    question: "Why can't you just add more servers behind a load balancer to scale a system that stores user sessions in server memory?",
    answers: ["Because a session stored in one server's local memory only exists on that server. If the load balancer routes a later request from the same user to a different server, that server has no idea who the user is. Horizontal scaling requires moving that state somewhere shared, like a database or a distributed cache, so any server can serve any request."],
  },
  {
    question: "When would vertical scaling actually be the better choice over horizontal scaling?",
    answers: ["When the system is well within the capacity of available hardware, when the workload is genuinely hard to parallelize (like a single-threaded in-memory computation), or when the operational simplicity of one machine outweighs the benefits of elasticity and fault tolerance, common for smaller systems, internal tools, or as a first step before the added complexity of a distributed fleet is actually justified by real load."],
  },
  {
    question: "What is the definition of vertical scaling?",
    answers: ["Upgrading the hardware of an existing server — more CPU cores, more RAM, faster storage."],
  },
  {
    question: "What are the benefits of horizontal scaling?",
    answers: ["Theoretically infinite capacity", "Built-in redundancy through multiple nodes"],
    note: "Horizontal scaling has higher operational complexity — reduced complexity and elimination of load balancers are not benefits.",
  },
  {
    question: "What are the drawbacks of vertical scaling?",
    answers: ["Physical hardware ceiling", "Higher cost at high-performance tiers", "Single point of failure"],
  },
  {
    question: "What does statelessness require in horizontal scaling?",
    answers: ["State must be moved to an external, shared layer — such as a cache or distributed database."],
  },
  {
    question: "What contributes to the operational complexity of horizontal scaling?",
    answers: ["Requires managing distributed state", "Requires coordination between nodes"],
  },
  {
    question: "How do horizontal and vertical scaling differ in availability and reliability?",
    answers: [
      "Horizontal scaling provides high availability through redundancy",
      "Vertical scaling suffers from a single point of failure",
    ],
  },
  {
    question: 'What causes the "ceiling" in vertical scaling?',
    answers: ["It is limited by the physical limits of hardware — there is a maximum size machine that exists."],
  },
  {
    question: "What are the cost considerations for horizontal vs. vertical scaling?",
    answers: [
      "Vertical scaling is expensive at high-performance tiers",
      "Horizontal scaling is cost-effective using commodity hardware",
    ],
  },
  {
    question: "How should you choose a scaling strategy?",
    answers: [
      "Start with vertical scaling for simplicity during early stages",
      "Transition to horizontal scaling when throughput exceeds single-node capacity",
    ],
  },
  {
    question: "How is load balancing implemented in horizontal scaling?",
    answers: ["A load balancer sits in front of all nodes and distributes incoming traffic across them."],
  },
];

const terms = [
  { title: "Vertical scaling", def: "Increasing the capacity of a single machine by adding more CPU, memory, or faster storage, without changing how many machines are running." },
  { title: "Horizontal scaling", def: "Increasing total system capacity by adding more machines and distributing load across them, typically via a load balancer." },
  { title: "Statelessness", def: "A server design where no request-specific data is kept in that server's local memory between requests, so any server in the fleet can handle any request equally." },
  { title: "Elasticity", def: "The ability to automatically add or remove capacity in response to real-time demand, practical mainly with horizontal scaling of stateless components." },
  { title: "Single point of failure", def: "A component whose failure takes down the whole system, a risk that vertical scaling never removes since it's still one machine." },
];

const seenInTheWild = [
  "Stack Overflow famously ran on a relatively small number of powerful, vertically scaled servers for years, a case where vertical scaling was a deliberate, working choice, not a failure to modernize.",
  "Netflix's application tier runs as thousands of stateless horizontally scaled instances behind load balancers, auto-scaling up and down with viewing demand across time zones.",
  "AWS RDS offers both vertical scaling (resizing your database instance to a bigger type) and read replicas for a form of horizontal scaling on the read path, reflecting how databases resist horizontal writes far more than app servers do.",
  "Kubernetes' Horizontal Pod Autoscaler exists specifically to automate horizontal scaling for stateless services, adding and removing container instances based on CPU or custom metrics.",
];

const commonMistakes = [
  "Assuming horizontal scaling is always the right answer, when a well-tuned vertical scale is simpler, cheaper, and sufficient for many real systems.",
  "Adding more servers behind a load balancer without first removing local server state, which causes subtle bugs (like a user randomly getting logged out) instead of the intended capacity increase.",
  "Treating 'add more servers' as free, ignoring the real added complexity: network calls where there used to be function calls, coordination, and a load balancer that itself needs to be highly available.",
  "Forgetting that horizontal scaling for a database is a fundamentally harder problem than for a stateless app server, and reaching for sharding before exhausting simpler options like read replicas or vertical scaling.",
];

/* Boxes for the stateless-fleet figure. */
const fleetNodes = [
  { kind: "Client", name: "Client", x: 16, y: 195, w: 160, color: "var(--sd-border-strong)", label: "var(--sd-muted)" },
  { kind: "LB", name: "Load Balancer", x: 270, y: 195, w: 180, color: "var(--sd-accent)", label: "var(--sd-accent)" },
  { kind: "Server", name: "App Server 1", x: 540, y: 35, w: 170, color: "var(--sd-teal)", label: "var(--sd-teal)" },
  { kind: "Server", name: "App Server 2", x: 540, y: 195, w: 170, color: "var(--sd-teal)", label: "var(--sd-teal)" },
  { kind: "Server", name: "App Server 3", x: 540, y: 355, w: 170, color: "var(--sd-teal)", label: "var(--sd-teal)" },
  { kind: "Cache", name: "Shared Session", name2: "Store", x: 830, y: 195, w: 150, color: "var(--sd-green)", label: "var(--sd-green)" },
];

const whyThisExists = [
  "A system built for a thousand users doesn't automatically handle a million, at some point a single server runs out of CPU, memory, or disk I/O no matter how well it's tuned, and something has to change structurally, not just get faster code.",
  "The two ways to add capacity, a bigger machine or more machines, have very different costs, limits, and failure characteristics, and picking the wrong one for a given system leads to either wasted spend or an architecture that can't actually grow further.",
  "Adding more machines only helps if requests can actually be spread across them, which is not automatic: a server holding state in local memory (like an in-process session) breaks the moment a request can land on a different machine than the one before it.",
];

function PItem({
  num, title, body,
  numColor = "var(--sd-accent)",
  numBg = "rgba(76, 110, 245,0.15)",
}: {
  num: string; title: string; body: string;
  numColor?: string; numBg?: string;
}) {
  return (
    <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: numBg, color: numColor, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {num}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)" }}>{title}</span>
      </div>
      <p className="sd-text-xs">{body}</p>
    </div>
  );
}

export default function Lesson01() {
  const [panelOpen, setPanelOpen] = useState(false);
  const nav = getLessonNav("01-horizontal-vs-vertical-scaling");

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="Scalability: Vertical vs Horizontal Scaling"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">
          Scalability: Vertical vs Horizontal Scaling
        </h1>
        <p className="sd-lede">
          Understanding how systems grow — and the trade-offs each approach demands.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Big Idea
          </p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              There are only two ways to serve more load: give one machine more power (<strong className="sd-strong">vertical scaling</strong>), or give the work to more machines (<strong className="sd-strong">horizontal scaling</strong>), and the second one only works if you first design your system so no machine has to remember anything the others don&rsquo;t.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Why This Exists
          </p>
          <h2 className="sd-h2">Why Capacity Is A Design Decision</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Intro */}
        <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            Every system eventually faces a growth problem: traffic increases, latency climbs, and the infrastructure that worked yesterday starts to buckle. The fundamental question becomes —{" "}
            <strong className="sd-strong">how do you give the system more capacity?</strong>
          </p>
          <p>
            There are two directions you can go. You can make the existing machine{" "}
            <span className="sd-hl">bigger</span>, or you can bring in{" "}
            <span className="sd-hl">more machines</span>. The first is{" "}
            <strong className="sd-strong">vertical scaling</strong> (scaling up); the second is{" "}
            <strong className="sd-strong">horizontal scaling</strong> (scaling out). Both solve the same problem, but they do so with very different architectures, cost curves, and failure modes.
          </p>
          <p>
            Most real-world systems don't pick one and ignore the other — they start vertical for simplicity, and shift horizontal as demand outgrows what a single box can handle. Understanding{" "}
            <span className="sd-hl">why</span> that transition happens, and what it costs, is what this lesson is about.
          </p>
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Think Of It Like
          </p>
          <h2 className="sd-h2">One Fast Cashier, Or Four Registers</h2>

          <div className="sd-prose">
            <p>
              Imagine a single cashier at a small shop who gets faster and faster at ringing people up, that&rsquo;s <strong className="sd-strong">vertical scaling</strong>: same one person, more capability. Now imagine the line is too long even for the fastest possible cashier, so you open three more registers, that&rsquo;s <strong className="sd-strong">horizontal scaling</strong>: more people doing the same job in parallel.
            </p>
            <p style={{ marginTop: 12 }}>
              But opening more registers only works if any cashier can help any customer. If each cashier only remembers their own customers and refuses to help someone who started at a different register, adding registers doesn&rsquo;t actually shorten the line, it just creates three separate confused lines.
            </p>
          </div>
        </div>

        {/* Two-column cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Vertical */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: "rgba(106, 118, 163,0.15)", color: "var(--sd-amber)", marginRight: 10, verticalAlign: "middle" }}>Vertical</span>
              Scale Up
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10 }}>Upgrade the hardware of an existing server — more CPU cores, more RAM, faster storage.</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>Your application architecture stays <strong className="sd-strong">unchanged</strong>. A single node handles everything.</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { sign: "+", color: "var(--sd-green)", bg: "rgba(157, 176, 247,0.15)", text: <><strong className="sd-strong">Zero overhead</strong> — no inter-node communication, no load balancers, no distributed state.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(74, 81, 112,0.15)", text: <><strong className="sd-strong">Hard ceiling</strong> — hardware has physical limits. Cost grows non-linearly at high tiers.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(74, 81, 112,0.15)", text: <><strong className="sd-strong">Single point of failure</strong> — if the machine goes down, everything goes down.</> },
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginTop: 2, background: item.bg, color: item.color }}>{item.sign}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Horizontal */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: "rgba(127, 147, 242,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>Horizontal</span>
              Scale Out
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10 }}>Add more machines to your resource pool. A load balancer distributes traffic across nodes.</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>
              State can't live in memory locally — you must go{" "}
              <span style={{ borderBottom: "1px dashed var(--sd-teal)", color: "var(--sd-teal)", cursor: "help" }} title="Each request carries all the info needed. No session stored on the server. Any node can handle any request.">
                stateless
              </span>.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { sign: "+", color: "var(--sd-green)", bg: "rgba(157, 176, 247,0.15)", text: <><strong className="sd-strong">Theoretically unlimited</strong> — add nodes as demand grows.</> },
                { sign: "+", color: "var(--sd-green)", bg: "rgba(157, 176, 247,0.15)", text: <><strong className="sd-strong">Built-in redundancy</strong> — one node fails, others keep serving.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(74, 81, 112,0.15)", text: <><strong className="sd-strong">Distributed complexity</strong> — state coordination, consistency, and inter-node communication.</> },
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginTop: 2, background: item.bg, color: item.color }}>{item.sign}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Key Terms
          </p>
          <h2 className="sd-h2">The Vocabulary Of Growth</h2>

          <div className="sd-stack">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flow diagram */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Shape Of It
          </p>
          <h2 className="sd-h2">Stateless Servers Behind A Load Balancer</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 990 470"
              role="img"
              aria-label="A client sends a request to a load balancer, which distributes it to any of three interchangeable app servers, each of which reads and writes session data in one shared session store."
              style={{ width: "100%", minWidth: 620, display: "block" }}
            >
              <title>Stateless servers behind a load balancer</title>
              <defs>
                <marker id="sd-fleet-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              {/* client to load balancer */}
              <path d="M 176 235 H 262" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />

              {/* load balancer fans out to every server */}
              <path d="M 450 235 H 500" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <path d="M 500 75 V 395" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <path d="M 500 75 H 532" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />
              <path d="M 500 235 H 532" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />
              <path d="M 500 395 H 532" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />

              {/* every server talks to the one shared store */}
              <path d="M 710 75 H 805 V 215 H 822" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />
              <path d="M 710 235 H 822" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />
              <path d="M 710 395 H 805 V 255 H 822" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fleet-arrow)" />

              <circle cx="219" cy="235" r="4" fill="var(--sd-teal)" />
              <circle cx="500" cy="235" r="4" fill="var(--sd-teal)" />

              <text x="219" y="222" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)" textAnchor="middle">request</text>
              <text x="765" y="226" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)" textAnchor="middle">reads / writes</text>

              {fleetNodes.map((n) => (
                <g key={n.name}>
                  <rect x={n.x} y={n.y} width={n.w} height={80} rx={10} fill="var(--sd-surface2)" stroke={n.color} strokeWidth="1.5" />
                  <text x={n.x + n.w / 2} y={n.y + (n.name2 ? 27 : 31)} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" letterSpacing="1" fill={n.label}>
                    {n.kind.toUpperCase()}
                  </text>
                  <text x={n.x + n.w / 2} y={n.y + (n.name2 ? 48 : 54)} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fontWeight="700" fill="var(--sd-text)">
                    {n.name}
                  </text>
                  {n.name2 && (
                    <text x={n.x + n.w / 2} y={n.y + 66} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fontWeight="700" fill="var(--sd-text)">
                      {n.name2}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            The three app servers are <strong className="sd-strong">interchangeable</strong>, which is the whole point. None of them remembers you, so the load balancer is free to send your next request anywhere. What makes that possible is the session store on the right: the state moved out of the servers and into one place they all share.
          </div>

          <div className="sd-callout" style={{ marginTop: 12 }}>
            Databases are usually the hardest part of a system to scale horizontally, which is why they often get scaled vertically first, or handled with replication and sharding as a separate, more involved technique.
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Feature", "Vertical", "Horizontal"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Complexity", "Low — single node", "High — distributed coordination"],
                ["Availability", "Low — single point of failure", "High — redundancy by design"],
                ["Cost", "Expensive at high tiers", "Cost-effective (commodity hardware)"],
                ["Growth Limit", "Physical hardware ceiling", "Theoretically unlimited"],
                ["When to use", "Early stages, simplicity first", "When throughput exceeds a single node"],
              ].map(([feat, v, h], i, arr) => (
                <tr key={feat}>
                  <td style={{ padding: "12px 16px", color: "var(--sd-muted)", fontWeight: 500, borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{feat}</td>
                  <td style={{ padding: "12px 16px", color: "var(--sd-amber)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{v}</td>
                  <td style={{ padding: "12px 16px", color: "var(--sd-teal)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Seen In The Wild
          </p>
          <h2 className="sd-h2">How Real Systems Pick A Direction</h2>
          <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Common Mistakes
          </p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Try It Yourself
          </p>
          <h2 className="sd-h2">Find The State That Has To Move</h2>

          <div className="sd-callout sd-callout-accent">
            Think of an app you use that clearly has millions of users, like a messaging app. Ask yourself: could this possibly be running on one giant machine? What would have to be true about how it stores your <strong className="sd-strong">logged-in state</strong> for it to spread your requests across many servers safely? Write down one thing you think has to live outside any single server for that to work.
          </div>
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Quiz Review</p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="When to make the switch">
          <p className="sd-text-sm">
            Vertical scaling hits a ceiling defined by physical hardware constraints and the law of diminishing returns. These are the four signals that tell you it's time to go horizontal.
          </p>
          {[
            { num: "1", title: "Economic Efficiency Declines", body: "Vertical scaling follows an exponential cost curve. Top-tier hardware often costs more than running multiple commodity instances. When the cost-per-unit-of-performance exceeds a distributed cluster, pivot." },
            { num: "2", title: "Availability Requirements", body: "A vertical instance is a single point of failure. If your SLA demands high availability — measured in nines — you must adopt horizontal scaling to enable redundancy and failover." },
            { num: "3", title: "Throughput Saturation", body: "Once your application can't handle request volume due to thread contention, lock contention, or network I/O limits of a single machine, partitioning the load across nodes becomes mandatory." },
            { num: "4", title: "Managed Service Limits", body: "Cloud providers enforce hard limits on single-instance types — disk IOPS, bandwidth caps, connection limits. When you hit these quotas, you are forced to shard or replicate horizontally." },
          ].map((item) => <PItem key={item.num} {...item} />)}
          <div className="sd-panel-note">
            Start vertical for simplicity. Once you're within <strong className="sd-hl">60–70% of maximum vertical capacity</strong>, begin the shift. Delaying forces a painful re-architecture under pressure.
          </div>
        </PanelSection>

        <PanelSection title="When you've hit the ceiling">
          <p className="sd-text-sm">
            Hitting the limit of the largest available instance — the <strong className="sd-strong">"God Machine" strategy</strong> — is a failure state for any system expecting growth. You have four architectural levers.
          </p>
          {[
            { num: "A", title: "Functional Decomposition (Microservices)", body: "Break a CPU/RAM-bound monolith into discrete services. Each runs in its own process space on its own cluster, bypassing the memory limit of a single host." },
            { num: "B", title: "Data Partitioning (Sharding)", body: "When a database hits IOPS or storage limits, implement sharding via a partition key (user_id, region). One bottleneck becomes an aggregate of nodes that scale linearly." },
            { num: "C", title: "Read/Write Splitting & Caching", body: "Caching (Redis) absorbs read-heavy workloads. Read replicas offload reads from the primary. If writes still choke, move to CockroachDB, TiDB, or Cassandra for native multi-node writes." },
            { num: "D", title: "Asynchronous Processing", body: "Move heavy work to background workers via a message queue (Kafka, RabbitMQ). Decoupling computation from the request-response cycle reclaims CPU and RAM for primary threads." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-teal)" numBg="rgba(127, 147, 242,0.12)" />)}
          <div style={{ background: "rgba(74, 81, 112,0.06)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Without these strategies prepared, hitting the ceiling triggers a <strong style={{ color: "var(--sd-red)" }}>"stop-the-world" emergency</strong> — forced read-replica rollouts while racing to refactor for a sharded architecture.
          </div>
        </PanelSection>

        <PanelSection title="The state problem">
          <p className="sd-text-sm">
            Shared state is the primary inhibitor to horizontal scaling. Go horizontal and state becomes a <strong className="sd-strong">distributed consistency problem</strong> — more nodes means harder to maintain a unified view.
          </p>
          {[
            { num: "1", title: "The Cost of Synchronization", body: "Strong consistency requires distributed locks or synchronous replication. This overhead often consumes the performance gains you intended to get from adding nodes." },
            { num: "2", title: "The Shift to Statelessness", body: "Data needed to process a request must travel with it (JWTs) or be fetched from a shared external store. In-memory state synchronized across nodes makes your scaling logarithmic, not linear." },
            { num: "3", title: "Database Bottlenecks", body: "App servers scale easily. The database remains the single point of shared state. Strict global consistency demands sharding logic and global coordinators, making horizontal scaling exponentially harder." },
            { num: "4", title: "Sticky Sessions vs. Global Context", body: "Server-side sessions force sticky sessions — load balancer affinity to a single node. If that node dies, users lose state. The fix (externalizing state) just makes your cache cluster the new bottleneck." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-amber)" numBg="rgba(106, 118, 163,0.12)" />)}
          <div className="sd-panel-note">
            If you can't externalize state, your "horizontal" cluster is just a group of nodes waiting on a single shared bottleneck — <strong className="sd-hl">zero throughput gain, multiplied complexity</strong>.
          </div>
        </PanelSection>

        <PanelSection title="Scaling vs. optimization">
          <p className="sd-text-sm">
            Horizontal scaling does not fix inefficient algorithms — it masks them with brute force and often <strong className="sd-strong">amplifies the problem</strong>.
          </p>
          {[
            { num: "1", title: "The Cost of Inefficiency", body: "An O(n²) algorithm taking 500ms on 1 node still takes 500ms on 10. You only increase throughput while keeping each user's experience equally slow." },
            { num: "2", title: "Linear vs. Algorithmic Scaling", body: "Hardware gives linear gains. An O(n³) algorithm makes a 10x compute increase useless against moderate input growth. Software optimization provides exponential gains." },
            { num: "3", title: "Resource Contention", body: 'Inefficient code scaled horizontally creates "noisy neighbor" effects — GC pressure, I/O thrashing — that destabilize Kubernetes and cause cascading failures across shared infrastructure.' },
            { num: "4", title: "Hidden Latency", body: "Distributed systems add network hops and serialization overhead. A slow algorithm plus cross-node coordination can make the system feel slower than the original monolith." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-green)" numBg="rgba(157, 176, 247,0.12)" />)}
          <div style={{ background: "rgba(157, 176, 247,0.06)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-green)" }}>Optimize before you distribute.</strong> Profile hot paths and fix time complexity first. If hardware can't solve your latency, you have an <strong className="sd-hl">algorithmic issue, not a scaling issue</strong>.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} />
    </>
  );
}
