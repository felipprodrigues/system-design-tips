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
} from "@/components";
import type { QuizCard } from "@/components";

const quizCards: QuizCard[] = [
  {
    question: "What is the definition of vertical scaling?",
    answers: ["Upgrading the hardware of an existing server — more CPU cores, more RAM, faster storage."],
  },
  {
    question: "Which of the following are benefits of horizontal scaling?",
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
    question: "Which statements describe the operational complexity of horizontal scaling?",
    answers: ["Requires managing distributed state", "Requires coordination between nodes"],
  },
  {
    question: "Which statements about availability and reliability are correct?",
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
    question: "Which cost considerations are true?",
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

function PItem({
  num, title, body,
  numColor = "var(--sd-accent)",
  numBg = "rgba(108,99,255,0.15)",
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
      <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{body}</p>
    </div>
  );
}

export default function Lesson01() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="Horizontal vs Vertical Scaling"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 1 · Foundations
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Horizontal vs Vertical Scaling
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          Understanding how systems grow — and the trade-offs each approach demands.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            Every system eventually faces a growth problem: traffic increases, latency climbs, and the infrastructure that worked yesterday starts to buckle. The fundamental question becomes —{" "}
            <strong style={{ color: "#fff" }}>how do you give the system more capacity?</strong>
          </p>
          <p>
            There are two directions you can go. You can make the existing machine{" "}
            <span style={{ color: "var(--sd-teal)" }}>bigger</span>, or you can bring in{" "}
            <span style={{ color: "var(--sd-teal)" }}>more machines</span>. The first is{" "}
            <strong style={{ color: "#fff" }}>vertical scaling</strong> (scaling up); the second is{" "}
            <strong style={{ color: "#fff" }}>horizontal scaling</strong> (scaling out). Both solve the same problem, but they do so with very different architectures, cost curves, and failure modes.
          </p>
          <p>
            Most real-world systems don't pick one and ignore the other — they start vertical for simplicity, and shift horizontal as demand outgrows what a single box can handle. Understanding{" "}
            <span style={{ color: "var(--sd-teal)" }}>why</span> that transition happens, and what it costs, is what this lesson is about.
          </p>
        </div>

        {/* Two-column cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Vertical */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "var(--sd-amber)", marginRight: 10, verticalAlign: "middle" }}>Vertical</span>
              Scale Up
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10 }}>Upgrade the hardware of an existing server — more CPU cores, more RAM, faster storage.</p>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>Your application architecture stays <strong style={{ color: "#fff" }}>unchanged</strong>. A single node handles everything.</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { sign: "+", color: "var(--sd-green)", bg: "rgba(52,211,153,0.15)", text: <><strong style={{ color: "#fff" }}>Zero overhead</strong> — no inter-node communication, no load balancers, no distributed state.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(248,113,113,0.15)", text: <><strong style={{ color: "#fff" }}>Hard ceiling</strong> — hardware has physical limits. Cost grows non-linearly at high tiers.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(248,113,113,0.15)", text: <><strong style={{ color: "#fff" }}>Single point of failure</strong> — if the machine goes down, everything goes down.</> },
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
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: "rgba(62,207,207,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>Horizontal</span>
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
                { sign: "+", color: "var(--sd-green)", bg: "rgba(52,211,153,0.15)", text: <><strong style={{ color: "#fff" }}>Theoretically unlimited</strong> — add nodes as demand grows.</> },
                { sign: "+", color: "var(--sd-green)", bg: "rgba(52,211,153,0.15)", text: <><strong style={{ color: "#fff" }}>Built-in redundancy</strong> — one node fails, others keep serving.</> },
                { sign: "−", color: "var(--sd-red)", bg: "rgba(248,113,113,0.15)", text: <><strong style={{ color: "#fff" }}>Distributed complexity</strong> — state coordination, consistency, and inter-node communication.</> },
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginTop: 2, background: item.bg, color: item.color }}>{item.sign}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Flow diagram */}
        <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 20 }}>
            Horizontal Scaling — Traffic Flow
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--sd-accent)" }}>Client</div>
            <span style={{ color: "var(--sd-muted)", fontSize: 18, padding: "0 8px" }}>→</span>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-amber)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--sd-amber)" }}>Load Balancer</div>
            <span style={{ color: "var(--sd-muted)", fontSize: 18, padding: "0 8px" }}>→</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Node 1", "Node 2", "Node 3"].map((n) => (
                <div key={n} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-green)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--sd-green)" }}>{n}</div>
              ))}
            </div>
            <span style={{ color: "var(--sd-muted)", fontSize: 18, padding: "0 8px" }}>↔</span>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--sd-teal)", textAlign: "center" }}>
              Shared<br />Data Layer
            </div>
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

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>Quiz Review</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="When to make the switch">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Vertical scaling hits a ceiling defined by physical hardware constraints and the law of diminishing returns. These are the four signals that tell you it's time to go horizontal.
          </p>
          {[
            { num: "1", title: "Economic Efficiency Declines", body: "Vertical scaling follows an exponential cost curve. Top-tier hardware often costs more than running multiple commodity instances. When the cost-per-unit-of-performance exceeds a distributed cluster, pivot." },
            { num: "2", title: "Availability Requirements", body: "A vertical instance is a single point of failure. If your SLA demands high availability — measured in nines — you must adopt horizontal scaling to enable redundancy and failover." },
            { num: "3", title: "Throughput Saturation", body: "Once your application can't handle request volume due to thread contention, lock contention, or network I/O limits of a single machine, partitioning the load across nodes becomes mandatory." },
            { num: "4", title: "Managed Service Limits", body: "Cloud providers enforce hard limits on single-instance types — disk IOPS, bandwidth caps, connection limits. When you hit these quotas, you are forced to shard or replicate horizontally." },
          ].map((item) => <PItem key={item.num} {...item} />)}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Start vertical for simplicity. Once you're within <strong style={{ color: "var(--sd-teal)" }}>60–70% of maximum vertical capacity</strong>, begin the shift. Delaying forces a painful re-architecture under pressure.
          </div>
        </PanelSection>

        <PanelSection title="When you've hit the ceiling">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Hitting the limit of the largest available instance — the <strong style={{ color: "var(--sd-text)" }}>"God Machine" strategy</strong> — is a failure state for any system expecting growth. You have four architectural levers.
          </p>
          {[
            { num: "A", title: "Functional Decomposition (Microservices)", body: "Break a CPU/RAM-bound monolith into discrete services. Each runs in its own process space on its own cluster, bypassing the memory limit of a single host." },
            { num: "B", title: "Data Partitioning (Sharding)", body: "When a database hits IOPS or storage limits, implement sharding via a partition key (user_id, region). One bottleneck becomes an aggregate of nodes that scale linearly." },
            { num: "C", title: "Read/Write Splitting & Caching", body: "Caching (Redis) absorbs read-heavy workloads. Read replicas offload reads from the primary. If writes still choke, move to CockroachDB, TiDB, or Cassandra for native multi-node writes." },
            { num: "D", title: "Asynchronous Processing", body: "Move heavy work to background workers via a message queue (Kafka, RabbitMQ). Decoupling computation from the request-response cycle reclaims CPU and RAM for primary threads." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-teal)" numBg="rgba(62,207,207,0.12)" />)}
          <div style={{ background: "rgba(248,113,113,0.06)", borderLeft: "3px solid var(--sd-red)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Without these strategies prepared, hitting the ceiling triggers a <strong style={{ color: "var(--sd-red)" }}>"stop-the-world" emergency</strong> — forced read-replica rollouts while racing to refactor for a sharded architecture.
          </div>
        </PanelSection>

        <PanelSection title="The state problem">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Shared state is the primary inhibitor to horizontal scaling. Go horizontal and state becomes a <strong style={{ color: "var(--sd-text)" }}>distributed consistency problem</strong> — more nodes means harder to maintain a unified view.
          </p>
          {[
            { num: "1", title: "The Cost of Synchronization", body: "Strong consistency requires distributed locks or synchronous replication. This overhead often consumes the performance gains you intended to get from adding nodes." },
            { num: "2", title: "The Shift to Statelessness", body: "Data needed to process a request must travel with it (JWTs) or be fetched from a shared external store. In-memory state synchronized across nodes makes your scaling logarithmic, not linear." },
            { num: "3", title: "Database Bottlenecks", body: "App servers scale easily. The database remains the single point of shared state. Strict global consistency demands sharding logic and global coordinators, making horizontal scaling exponentially harder." },
            { num: "4", title: "Sticky Sessions vs. Global Context", body: "Server-side sessions force sticky sessions — load balancer affinity to a single node. If that node dies, users lose state. The fix (externalizing state) just makes your cache cluster the new bottleneck." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-amber)" numBg="rgba(251,191,36,0.12)" />)}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            If you can't externalize state, your "horizontal" cluster is just a group of nodes waiting on a single shared bottleneck — <strong style={{ color: "var(--sd-teal)" }}>zero throughput gain, multiplied complexity</strong>.
          </div>
        </PanelSection>

        <PanelSection title="Scaling vs. optimization">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Horizontal scaling does not fix inefficient algorithms — it masks them with brute force and often <strong style={{ color: "var(--sd-text)" }}>amplifies the problem</strong>.
          </p>
          {[
            { num: "1", title: "The Cost of Inefficiency", body: "An O(n²) algorithm taking 500ms on 1 node still takes 500ms on 10. You only increase throughput while keeping each user's experience equally slow." },
            { num: "2", title: "Linear vs. Algorithmic Scaling", body: "Hardware gives linear gains. An O(n³) algorithm makes a 10x compute increase useless against moderate input growth. Software optimization provides exponential gains." },
            { num: "3", title: "Resource Contention", body: 'Inefficient code scaled horizontally creates "noisy neighbor" effects — GC pressure, I/O thrashing — that destabilize Kubernetes and cause cascading failures across shared infrastructure.' },
            { num: "4", title: "Hidden Latency", body: "Distributed systems add network hops and serialization overhead. A slow algorithm plus cross-node coordination can make the system feel slower than the original monolith." },
          ].map((item) => <PItem key={item.num} {...item} numColor="var(--sd-green)" numBg="rgba(52,211,153,0.12)" />)}
          <div style={{ background: "rgba(52,211,153,0.06)", borderLeft: "3px solid var(--sd-green)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-green)" }}>Optimize before you distribute.</strong> Profile hot paths and fix time complexity first. If hardware can't solve your latency, you have an <strong style={{ color: "var(--sd-teal)" }}>algorithmic issue, not a scaling issue</strong>.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        lessonNumber={1}
        totalLessons={8}
        nextHref="/lessons/02-latency-throughput-availability"
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
