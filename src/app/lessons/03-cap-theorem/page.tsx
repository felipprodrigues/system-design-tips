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
import { getLessonNav } from "@/lib/lessons";

const quizCards: QuizCard[] = [
  {
    question: 'What does the "C" in CAP mean, and what does it guarantee?',
    answers: [
      "Consistency — every read receives the most recent write or an error. The system behaves as if there is only one copy of the data, even when replicated across nodes.",
    ],
  },
  {
    question:
      "Why is Partition Tolerance considered non-negotiable in modern distributed systems?",
    answers: [
      "Networks are inherently unreliable — packets drop, cables fail, hardware crashes. Since you cannot prevent network partitions from occurring, you must design for them.",
    ],
    note: "This means the real CAP choice is always between Consistency (C) and Availability (A) during a partition — not whether to include P.",
  },
  {
    question: "In a CP system, what happens when a network partition occurs?",
    answers: [
      "The system returns an error or times out rather than risk serving stale or inconsistent data — it sacrifices availability to protect data integrity.",
    ],
  },
  {
    question: "In an AP system, what happens when a network partition occurs?",
    answers: [
      "The system continues accepting reads and writes using its local data — it sacrifices consistency to maintain uptime, and nodes may diverge during the partition.",
    ],
  },
  {
    question:
      "A 3-node CP datastore (etcd) is partitioned so that Node 1 is completely isolated from Nodes 2 and 3. A client sends a write directly to Node 1. What happens?",
    answers: [
      "Node 1 rejects or blocks the write. It can only reach itself, 1 of 3 nodes, which is short of the majority of 2 required to commit. Refusing is what prevents split-brain.",
    ],
    note: "Nodes 2 and 3 do hold a majority, so that side of the partition elects a leader and keeps serving normally.",
  },
  {
    question:
      "A banking system must prevent a user from withdrawing more money than they have, even across two data centers. Which CAP trade-off should it implement?",
    answers: [
      "CP — the system should return an error rather than risk allowing the same balance to be withdrawn twice. Data integrity is non-negotiable for financial state.",
    ],
  },
  {
    question:
      "A social media feed shows posts from 5 minutes ago during a network partition. Which CAP strategy does this system implement?",
    answers: [
      "AP — the system prioritizes availability, serving potentially stale content rather than returning an error. A slightly outdated feed is acceptable; an unavailable feed is not.",
    ],
  },
  {
    question:
      "When does the CAP theorem force you to choose between Consistency and Availability?",
    answers: [
      "Only during a network partition. During normal operation — when nodes can communicate — a system can provide both high consistency and high availability simultaneously.",
    ],
  },
  {
    question:
      "When choosing an AP system, what problem do you introduce and how is it typically resolved?",
    answers: [
      "Nodes may accept conflicting writes during a partition, producing divergent state. This is resolved through a reconciliation process — such as last-write-wins, vector clocks, or application-level merge logic — after the partition heals.",
    ],
  },
  {
    question:
      "Read-your-own-writes and monotonic reads are often treated as the same guarantee. What is the actual difference?",
    answers: [
      "Read-your-own-writes means a client always sees the effect of its own updates. Monotonic reads means a client never observes a value older than one it has already seen, including values written by other clients. A system can provide either one without the other.",
    ],
    note: "Bundling both — plus consistent prefix reads — and scoping them to a single client is what most databases call session consistency.",
  },
  {
    question:
      "Sequential consistency is weaker than linearizability. What exactly does it give up?",
    answers: [
      "Real-time ordering. Every client still observes all operations in the same relative order, but that order does not have to match wall-clock time — a write can appear to take effect later than it actually completed.",
    ],
  },
  {
    question:
      "Last-Write-Wins keeps the version with the higher timestamp. What is its failure mode, and why is that failure especially dangerous?",
    answers: [
      "Physical clocks drift, even under NTP. A node running slightly fast stamps its write with a higher timestamp and overwrites a genuinely newer write made on a slower node. The dangerous part is that it happens silently — no error, no log, no conflict surfaced. The write is simply gone.",
    ],
    note: "This is why LWW fits low-stakes fields like a display name, and not anything where losing an update actually matters.",
  },
  {
    question:
      "Two replicas hold versions with vector clocks [a:2, b:1] and [a:1, b:2]. What happened, and what does the database do about it?",
    answers: [
      "Neither vector dominates the other, since each leads on a different node's counter. The writes were concurrent rather than sequential, so the database cannot tell which one should win. It surfaces both versions to the application layer as siblings and lets domain logic decide.",
    ],
    note: "Vector clocks detect the conflict without losing data, but they hand the decision to you rather than making it for you.",
  },
  {
    question:
      "CRDT merges must be commutative, associative, and idempotent. Why those three properties specifically?",
    answers: [
      "They correspond to the three things an unreliable network does to messages: it reorders them, it regroups them, and it delivers some of them more than once. A merge immune to all three converges on identical state no matter what the network did, with no coordinator and no application-level conflict resolution.",
    ],
  },
];

export default function Lesson03() {
  const [panelOpen, setPanelOpen] = useState(false);
  const nav = getLessonNav("03-cap-theorem");

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="CAP Theorem & Trade-offs"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">
          CAP Theorem &amp; Trade-offs
        </h1>
        <p className="sd-lede">
          When the network fails, you must choose — and there is no middle ground.
        </p>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            The CAP theorem states that in the presence of a network partition, a distributed system can only provide either{" "}
            <strong className="sd-strong">Consistency</strong> or{" "}
            <strong className="sd-strong">Availability</strong> — but not both. It defines the constraints every distributed data store must accept by forcing a choice about how the system behaves when its components cannot communicate.
          </p>
          <p>
            This is the first theorem in distributed systems that architects internalize as a hard constraint, not a preference. Understanding it doesn't give you a recipe — it gives you a{" "}
            <span className="sd-hl">lens for evaluating trade-offs</span>{" "}
            every time you choose a data store or design a failure mode.
          </p>
        </div>

        {/* Three pillars */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Framework
          </p>
          <h2 className="sd-h2">Defining the Three Pillars</h2>

          <div className="sd-grid-3">
            {[
              {
                letter: "C",
                name: "Consistency",
                color: "var(--sd-accent)",
                bg: "rgba(76, 110, 245,0.15)",
                desc: "Every read receives the most recent write or an error. The system acts as if there is only one copy of the data — even if replicated across nodes. C here means linearizability, not the C in ACID.",
              },
              {
                letter: "A",
                name: "Availability",
                color: "var(--sd-teal)",
                bg: "rgba(127, 147, 242,0.12)",
                desc: "Every request receives a non-error response, without the guarantee it contains the most recent write. The system stays operational even if nodes fail.",
              },
              {
                letter: "P",
                name: "Partition Tolerance",
                color: "var(--sd-green)",
                bg: "rgba(157, 176, 247,0.12)",
                desc: "The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.",
              },
            ].map((p) => (
              <div
                key={p.letter}
                style={{
                  background: "var(--sd-surface2)",
                  border: "1px solid var(--sd-border)",
                  borderRadius: 10,
                  padding: "18px 16px",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, color: p.color, marginBottom: 6 }}>{p.letter}</div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: p.color, marginBottom: 8 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--sd-muted)" }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <div className="sd-callout">
            <strong className="sd-strong">Partition Tolerance (P) is non-negotiable.</strong> Networks are unreliable — packets drop, cables get cut, hardware fails. Because you cannot prevent partitions, the real choice is between{" "}
            <span className="sd-hl">C</span> and{" "}
            <span className="sd-hl">A</span> when a partition occurs.
          </div>
        </div>

        {/* CP vs AP */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Trade-off
          </p>
          <h2 className="sd-h2">CP vs. AP — Choosing Your Failure Mode</h2>

          <div className="sd-prose">
            <p>
              When a network partition splits your nodes into isolated groups, they can no longer coordinate. At that point, you must decide: does the system{" "}
              <strong className="sd-strong">stop serving requests</strong> to avoid returning incorrect data, or does it{" "}
              <strong className="sd-strong">continue serving requests</strong> with whatever data it currently holds?
            </p>
            <p style={{ marginTop: 10 }}>
              This is not an engineering oversight — it is a fundamental constraint of distributed computing. The choice you make defines your system's behavior under failure.
            </p>
          </div>

          <div className="sd-grid-2">
            {[
              {
                badge: "CP",
                color: "var(--sd-accent)",
                bg: "rgba(76, 110, 245,0.15)",
                tagline: "Prioritize data integrity over uptime",
                body: "If a node cannot verify its data is current with the other side of the partition, it returns an error or times out rather than risk serving stale information.",
                use: "financial systems, inventory management, distributed locks",
              },
              {
                badge: "AP",
                color: "var(--sd-teal)",
                bg: "rgba(127, 147, 242,0.12)",
                tagline: "Prioritize uptime over data integrity",
                body: "If a node is partitioned, it continues accepting writes and serving reads using whatever data it has. Nodes may diverge and must reconcile once the partition heals.",
                use: "social feeds, recommendations, shopping carts, DNS",
              },
            ].map((t) => (
              <div
                key={t.badge}
                style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18 }}
              >
                <div style={{ display: "inline-block", background: t.bg, color: t.color, fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 5, marginBottom: 10 }}>
                  {t.badge}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 8 }}>{t.tagline}</div>
                <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65, marginBottom: 8 }}>{t.body}</p>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--sd-muted)" }}>
                  Use for: <span style={{ color: "var(--sd-text)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.use}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Decision diagram */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 22px", marginBottom: 16 }}>
            <p className="sd-figure-caption">
              Decision tree during a network partition
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: "rgba(106, 118, 163,0.07)", border: "1px solid var(--sd-amber)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "var(--sd-amber)" }}>
                Network Partition Occurs
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)", margin: "4px 0" }}>↓</div>
              <div style={{ background: "rgba(76, 110, 245,0.07)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "var(--sd-accent)" }}>
                Choose Your Strategy
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)", margin: "4px 0" }}>↓</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
                {[
                  { label: "Prioritize Integrity", badge: "CP System", color: "var(--sd-accent)", desc: "Reject read/write requests if sync with other nodes cannot be confirmed" },
                  { label: "Prioritize Uptime", badge: "AP System", color: "var(--sd-teal)", desc: "Accept read/write requests using local, potentially stale data" },
                ].map((b) => (
                  <div key={b.badge} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 11, color: "var(--sd-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.label}</div>
                    <div className="sd-arrow">↓</div>
                    <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--sd-muted)", textAlign: "center", lineHeight: 1.5, width: "100%" }}>
                      <strong style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4, color: b.color }}>{b.badge}</strong>
                      {b.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Consistency spectrum */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Refining the C
          </p>
          <h2 className="sd-h2">The Spectrum of Consistency Models</h2>

          <div className="sd-prose">
            <p>
              CP and AP describe a decision made at the moment a partition hits. But{" "}
              <strong className="sd-strong">consistency itself is not a single property</strong>. It is the contract between a data store and its clients about the ordering and visibility of writes, and that contract comes in degrees.
            </p>
            <p style={{ marginTop: 10 }}>
              The C in CAP names the strictest point on that gradient. Real systems rarely apply one point across an entire application — they run{" "}
              <span className="sd-hl">different guarantees for different workflows</span>, paying for strictness only where the business actually needs it.
            </p>
          </div>

          <p className="sd-eyebrow-sub">
            The strict end
          </p>
          <div className="sd-grid-2">
            {[
              {
                name: "Linearizability",
                color: "var(--sd-accent)",
                body: "The strongest single-object model. Every operation appears to take effect atomically at one instant between its invocation and its completion. Once a write completes, any later read — no matter which node serves it — returns that value or a newer one.",
              },
              {
                name: "Sequential Consistency",
                color: "var(--sd-teal)",
                body: "Relaxes real time. Operations do not have to line up with a global clock, but every client observes all operations in the same relative order. Cheaper to maintain, and enough for many coordination problems.",
              },
            ].map((m) => (
              <div key={m.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.color, marginBottom: 8 }}>{m.name}</div>
                <p className="sd-text-xs">{m.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            <strong className="sd-strong">Both models force the CP choice.</strong> To hold either one during a network failure, a node cut off from the coordinator has to reject reads and writes rather than answer from state it cannot verify. That refusal is exactly what prevents split-brain.
          </div>

          <p className="sd-eyebrow-sub">
            The loose end
          </p>
          <div className="sd-prose">
            <p>
              Eventual consistency guarantees only that{" "}
              <strong className="sd-strong">if writes stop, all replicas converge</strong> on the same value. Until then, concurrent reads sent to different nodes can return stale data, mutations out of order, or values that flatly contradict each other.
            </p>
            <p style={{ marginTop: 10 }}>
              Between full linearizability and raw eventual convergence sit the{" "}
              <strong className="sd-strong">client-centric guarantees</strong>. Each is far cheaper than linearizability, and each buys one specific property that users actually notice when it is missing.
            </p>
          </div>

          <div className="sd-grid-3">
            {[
              {
                name: "Read-Your-Own-Writes",
                color: "var(--sd-accent)",
                body: "A client always sees its own updates. Change your profile photo and a reload shows the new one, even while other users still see the old one.",
              },
              {
                name: "Monotonic Reads",
                color: "var(--sd-teal)",
                body: "A client never moves backwards in time. Once it has observed a value, later queries never hand back an older one.",
              },
              {
                name: "Consistent Prefix Reads",
                color: "var(--sd-green)",
                body: "Nobody sees a write without the writes it depends on. A reply never appears before the question it answers.",
              },
            ].map((g) => (
              <div key={g.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: g.color, marginBottom: 8 }}>{g.name}</div>
                <p className="sd-text-xs">{g.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            <strong className="sd-strong">These three are independent, not synonyms.</strong> A store can give you read-your-own-writes and still walk time backwards on the next query. Bundling all three and scoping them to a single client is what most databases label{" "}
            <span className="sd-hl">session consistency</span>.
          </div>

          {/* Comparison table */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Model", "Under partition", "Normal latency", "Replication requirement", "Common use case"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Linearizable", "Rejects reads and writes", "Highest — multi-node round trips", "Synchronous consensus (Raft / Paxos)", "Financial ledgers, seat booking, inventory holds"],
                  ["Causal", "Stays available", "Low — asynchronous propagation", "Vector clocks, dependency tracking", "Comment threads, collaborative editing"],
                  ["Eventual", "Stays available", "Lowest — local read and write", "Asynchronous background repair", "Social feeds, analytics counters, DNS"],
                ].map(([model, partition, latency, repl, use], i, arr) => (
                  <tr key={model}>
                    <td style={{ padding: "12px 14px", color: "var(--sd-text)", fontWeight: 700, borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{model}</td>
                    <td style={{ padding: "12px 14px", color: i === 0 ? "var(--sd-amber)" : "var(--sd-teal)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{partition}</td>
                    <td style={{ padding: "12px 14px", color: "var(--sd-muted)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{latency}</td>
                    <td style={{ padding: "12px 14px", color: "var(--sd-muted)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{repl}</td>
                    <td style={{ padding: "12px 14px", color: "var(--sd-muted)", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Replication behavior diagram */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 22px" }}>
            <p className="sd-figure-caption">
              Replication behavior under network partition
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: "rgba(76, 110, 245,0.07)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-accent)" }}>Client Write Request</div>
                <div style={{ fontSize: 11.5, fontFamily: "var(--sd-font-mono)", color: "var(--sd-muted)", marginTop: 3 }}>set balance = 150</div>
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)", margin: "4px 0" }}>↓</div>
              <div style={{ fontSize: 11, color: "var(--sd-amber)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Network Partition
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%" }}>
                {[
                  {
                    node: "Node A (Isolated)",
                    mode: "CP mode",
                    color: "var(--sd-accent)",
                    outcome: "Write Rejected (503)",
                    detail: "cannot reach consensus quorum",
                  },
                  {
                    node: "Node B (Isolated)",
                    mode: "AP mode",
                    color: "var(--sd-teal)",
                    outcome: "Write Accepted Locally",
                    detail: "divergence risks split-brain",
                  },
                ].map((s, i) => (
                  <div
                    key={s.node}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      borderLeft: i === 1 ? "1px dashed var(--sd-amber)" : "none",
                      paddingLeft: i === 1 ? 20 : 0,
                    }}
                  >
                    <div className="sd-arrow">↓</div>
                    <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "10px 14px", textAlign: "center", width: "100%" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)" }}>{s.node}</div>
                      <div style={{ fontSize: 11.5, fontFamily: "var(--sd-font-mono)", color: "var(--sd-muted)", marginTop: 3 }}>current state: balance = 100</div>
                    </div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{s.mode}</div>
                    <div className="sd-arrow">↓</div>
                    <div style={{ background: "var(--sd-surface2)", border: `1px solid ${s.color}`, borderRadius: 8, padding: "10px 14px", textAlign: "center", width: "100%" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>{s.outcome}</div>
                      <div style={{ fontSize: 11.5, color: "var(--sd-muted)", marginTop: 3, lineHeight: 1.5 }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quorum & split-brain */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Under the Hood
          </p>
          <h2 className="sd-h2">Quorum: How a Node Knows to Say No</h2>

          <div className="sd-prose">
            <p>
              A partitioned node cannot tell whether the other side is dead or merely unreachable, so it never tries to guess. Consensus protocols such as{" "}
              <strong className="sd-strong">Raft</strong> and{" "}
              <strong className="sd-strong">Paxos</strong> require a strict majority of the cluster,{" "}
              <span style={{ fontFamily: "var(--sd-font-mono)", color: "var(--sd-teal)" }}>⌊N/2⌋ + 1</span>{" "}
              out of N nodes, to agree before a write is committed. A node that cannot reach that many peers refuses to act.
            </p>
            <p style={{ marginTop: 10 }}>
              This is what prevents <strong className="sd-strong">split-brain</strong>, the failure mode where two disconnected halves of a cluster both believe they are in charge, both accept writes, and diverge into two irreconcilable versions of the truth. Since only one side of a partition can hold a majority, only one side is ever allowed to make progress.
            </p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "24px 24px 22px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
              A 5-node cluster split across two data centers
            </p>
            <p style={{ fontSize: 12.5, color: "var(--sd-muted)", textAlign: "center", marginBottom: 22, lineHeight: 1.6 }}>
              Quorum is ⌊5/2⌋ + 1 = 3 nodes. The link between the two sites goes down.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                {
                  dc: "DC East",
                  nodes: ["N1", "N2", "N3"],
                  color: "var(--sd-accent)",
                  count: "3 of 5 nodes",
                  verdict: "Majority reached",
                  body: "Elects a leader and keeps serving reads and writes. This side holds the authoritative state.",
                  active: true,
                },
                {
                  dc: "DC West",
                  nodes: ["N4", "N5"],
                  color: "var(--sd-amber)",
                  count: "2 of 5 nodes",
                  verdict: "No quorum",
                  body: "Every write and every linearizable read sent to N4 or N5 is rejected or blocked until the partition heals.",
                  active: false,
                },
              ].map((s) => (
                <div key={s.dc} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: s.color, marginBottom: 12 }}>
                    {s.dc}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {s.nodes.map((n) => (
                      <div
                        key={n}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "var(--sd-font-mono)",
                          color: s.color,
                          border: `1px solid ${s.color}`,
                          background: s.active ? "rgba(76, 110, 245,0.1)" : "transparent",
                          opacity: s.active ? 1 : 0.65,
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "var(--sd-font-mono)", color: "var(--sd-muted)", marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 8 }}>{s.verdict}</div>
                  <p className="sd-text-xs">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sd-callout">
            <strong className="sd-strong">Pitfall: always deploy an odd number of voting nodes.</strong> With an even cluster, say 4 nodes partitioned 2 and 2, neither side holds a strict majority. Both halves stop accepting writes and the cluster goes fully unavailable, even though every single node is healthy.
          </div>
        </div>

        {/* Real-world example */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Real-World Example
          </p>
          <h2 className="sd-h2">A Banking Application Under Partition</h2>

          <div className="sd-prose">
            <p>
              A user has <strong className="sd-strong">$100</strong> in their account. The system replicates this balance across two data centers. A network partition cuts off communication between them. The user attempts a withdrawal.
            </p>
          </div>

          <div className="sd-grid-2">
            {[
              {
                label: "CP — Consistency chosen",
                color: "var(--sd-accent)",
                headerBg: "rgba(76, 110, 245,0.1)",
                body: (
                  <>
                    The system <strong className="sd-strong">stops accepting withdrawals</strong>. It cannot guarantee the user hasn't already withdrawn $100 from the other data center, so it errors out to ensure the balance remains correct.
                    <br /><br />
                    The user sees a "Service Unavailable" message — but the data remains accurate.
                  </>
                ),
              },
              {
                label: "AP — Availability chosen",
                color: "var(--sd-teal)",
                headerBg: "rgba(127, 147, 242,0.1)",
                body: (
                  <>
                    The system <strong className="sd-strong">allows the withdrawal at both data centers simultaneously</strong>. It prioritizes the user's ability to complete the task, even though internal state is now inconsistent — the user effectively withdrew $200 from a $100 balance.
                    <br /><br />
                    A reconciliation process must resolve this once the partition heals.
                  </>
                ),
              },
            ].map((e) => (
              <div key={e.label} style={{ border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: e.headerBg, color: e.color, padding: "10px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {e.label}
                </div>
                <div style={{ padding: 14, fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{e.body}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong className="sd-strong">CAP is a framework for failure, not normal operation.</strong> During normal operation — when there is no partition — systems can generally provide both high consistency and high availability. The trade-off only forces your hand when the network degrades.
          </div>
        </div>

        {/* Conflict resolution */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The AP Side
          </p>
          <h2 className="sd-h2">Conflict Resolution When Replicas Diverge</h2>

          <div className="sd-prose">
            <p>
              Choosing AP is not the end of a decision — it is the start of a second one. Node B accepted the write while it was isolated, so once the link comes back there are{" "}
              <strong className="sd-strong">two versions of the same record and no node that witnessed both</strong>.
            </p>
            <p style={{ marginTop: 10 }}>
              Every highly available store therefore ships a reconciliation strategy. Which one it picks decides whether divergence costs you{" "}
              <span className="sd-hl">data</span> or merely costs you{" "}
              <span className="sd-hl">code</span>.
            </p>
          </div>

          {/* LWW */}
          <p className="sd-eyebrow-sub">
            Approach 1 — Last-Write-Wins
          </p>
          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18, marginBottom: 12, fontSize: 13, lineHeight: 1.7, color: "var(--sd-muted)" }}>
            The database stamps every write with a physical wall-clock timestamp. When two conflicting versions meet during reconciliation, the higher timestamp overwrites the lower one. It is simple, deterministic, and adds almost no storage overhead — one timestamp per record.
          </div>
          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            <strong className="sd-hl-amber">The cost is silent data loss.</strong> LWW trusts physical clocks, and physical clocks drift even under NTP. A node running a few milliseconds fast stamps its write with a higher timestamp and quietly discards a genuinely newer write made elsewhere. Nothing errors and nothing logs — the write is simply gone.
          </div>

          {/* Vector clocks */}
          <p className="sd-eyebrow-sub">
            Approach 2 — Vector Clocks and Version Vectors
          </p>
          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18, marginBottom: 12, fontSize: 13, lineHeight: 1.7, color: "var(--sd-muted)" }}>
            Rather than trusting wall clocks, vector clocks record causal history. A vector clock is a set of logical counters, one per node, where each entry counts the operations that node has applied. Comparing two vectors answers a question a timestamp cannot: did one version actually descend from the other, or did they happen independently?
          </div>
          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflowX: "auto", fontSize: 12.5, lineHeight: 1.8 }}>
            <code className="sd-strong">
              <span className="sd-hl-muted">{"// One version descends from the other"}</span>{"\n"}
              V1 = [ a:<span className="sd-hl-amber">1</span>, b:<span className="sd-hl-amber">1</span> ]{"   "}V2 = [ a:<span className="sd-hl-amber">2</span>, b:<span className="sd-hl-amber">1</span> ]{"\n"}
              {"  "}every entry in V1 is ≤ V2, and one is strictly less{"\n"}
              {"  "}→ <span className="sd-hl">V1 happened before V2</span>, so V2 wins and V1 is safe to drop{"\n\n"}
              <span className="sd-hl-muted">{"// Neither descends from the other"}</span>{"\n"}
              V1 = [ a:<span className="sd-hl-amber">2</span>, b:<span className="sd-hl-amber">1</span> ]{"   "}V2 = [ a:<span className="sd-hl-amber">1</span>, b:<span className="sd-hl-amber">2</span> ]{"\n"}
              {"  "}neither vector dominates the other{"\n"}
              {"  "}→ <span className="sd-hl-accent">concurrent write</span>, unresolvable without domain knowledge{"\n"}
              {"  "}→ both versions surface to the application as siblings
            </code>
          </pre>
          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            <strong className="sd-strong">Vector clocks never lose a write, but they never decide for you either.</strong> They convert silent data loss into an explicit conflict that the application layer has to resolve — strictly more work, and strictly safer.
          </div>

          {/* CRDTs */}
          <p className="sd-eyebrow-sub">
            Approach 3 — Conflict-Free Replicated Data Types
          </p>
          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 18, marginBottom: 12, fontSize: 13, lineHeight: 1.7, color: "var(--sd-muted)" }}>
            CRDTs sidestep reconciliation entirely by choosing data structures whose merge operation cannot conflict. Every replica merges whatever it receives, in whatever order it arrives, and they all land on identical state — no coordinator, no arbitration, no application-level decision.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
            {[
              { name: "Commutative", expr: "A ∪ B = B ∪ A", body: "Arrival order does not change the result." },
              { name: "Associative", expr: "(A ∪ B) ∪ C = A ∪ (B ∪ C)", body: "Grouping of merges does not change the result." },
              { name: "Idempotent", expr: "A ∪ A = A", body: "Applying the same update twice changes nothing." },
            ].map((p) => (
              <div key={p.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, fontFamily: "var(--sd-font-mono)", color: "var(--sd-amber)", marginBottom: 8 }}>{p.expr}</div>
                <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.6 }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            Those three properties are precisely what make{" "}
            <strong className="sd-strong">reordering, regrouping, and duplicate delivery</strong> harmless — which is exactly the list of things an unreliable network does to your messages.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { name: "PN-Counter", body: "A counter supporting increments and decrements, by keeping one grow-only tally per node for each direction and summing them." },
              { name: "LWW-Element-Set", body: "A set supporting adds and removes, where each element carries a timestamp that settles membership conflicts." },
              { name: "OR-Set", body: "An observed-removed set, where each add is tagged with a unique id so a concurrent add always beats a concurrent delete." },
            ].map((p) => (
              <div key={p.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-green)", marginBottom: 6 }}>{p.name}</div>
                <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.6 }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong className="sd-strong">Choosing between them is a question about the field, not the database.</strong> Use LWW where the last edit genuinely should win and losing one is survivable, such as a display name. Use vector clocks where no write may be lost and something can arbitrate, such as a shopping cart. Use a CRDT where convergence must happen with no arbitration at all, such as a like counter or a collaborative document.
          </div>

          <div className="sd-callout sd-callout-green">
            These constraints form the basis for understanding database replication strategies and distributed transaction patterns — topics covered in the lessons ahead.
          </div>
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">
            Quiz Review
          </p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="Why is Partition Tolerance truly non-negotiable?">
          <p className="sd-text-sm">
            The theorem's name implies a three-way choice, but Partition Tolerance is{" "}
            <strong className="sd-strong">not actually optional</strong>. Abandoning it would mean assuming a perfectly reliable network — which does not exist at any scale.
          </p>
          {[
            {
              title: "Physical Reality",
              body: "Networks fail at every level: NICs drop packets, switches lose routing tables, data center interconnects get saturated, fiber cables get cut. Any sufficiently complex system will experience a partition if it runs long enough.",
            },
            {
              title: "The CA Myth",
              body: 'A "CA system" — one that sacrifices P — can only exist as a single-node system. The moment you add replication or multiple nodes, you have introduced the possibility of a partition. A distributed system that claims to be CA is a system that hasn\'t failed yet.',
            },
            {
              title: "Partial Failures Are the Norm",
              body: "In distributed systems, partial failures — where some nodes are reachable and others are not — are far more common than total failures. Your system must be designed to handle asymmetric reachability.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            The practical restatement of CAP: <strong className="sd-hl">when a partition occurs, does your system choose to stop serving requests (CP) or serve potentially stale data (AP)?</strong> There is no third option.
          </div>
        </PanelSection>

        <PanelSection title='What does "eventual consistency" actually mean in AP systems?'>
          <p className="sd-text-sm">
            AP systems are typically described as "eventually consistent" — meaning all nodes will eventually converge to the same value,{" "}
            <strong className="sd-strong">given enough time and no new writes</strong>. But "eventually" is often misunderstood.
          </p>
          {[
            {
              title: "What It Means",
              body: 'After a partition heals and no new conflicting writes arrive, all replicas will converge to an agreed-upon value. The system guarantees convergence, not timing. "Eventually" could be milliseconds or minutes depending on replication lag.',
            },
            {
              title: "What Actually Drives Convergence",
              body: "Nothing converges by itself. Read repair fixes a stale replica when a read notices the mismatch, hinted handoff replays writes a node missed while it was down, and anti-entropy compares replicas in the background on a schedule. Replication lag is a number you can measure and alert on, which is what turns \"eventually\" from a hope into an SLO.",
            },
            {
              title: "The Operational Reality",
              body: "Eventual consistency shifts the burden from the database to the application and operations team. You must reason about read-your-own-writes consistency, monotonic reads, and what happens when a user sees a write disappear after a page refresh.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Eventual consistency is not weak consistency by default</strong> — many AP databases offer tunable consistency levels (e.g., QUORUM reads in Cassandra) that provide stronger guarantees at the cost of latency.
          </div>
        </PanelSection>

        <PanelSection title="How do real databases implement CP vs AP?">
          <p className="sd-text-sm">
            Real databases don't simply flip a "CP" or "AP" switch — they implement{" "}
            <strong className="sd-strong">specific replication and quorum mechanisms</strong>{" "}
            that land them on one side of the trade-off by default, often with tunable knobs.
          </p>
          {[
            {
              title: "CP: etcd, ZooKeeper, Consul, CockroachDB",
              body: "These systems use consensus protocols (Raft, Paxos, or ZAB) that require a majority quorum to confirm a write before acknowledging it. If quorum cannot be reached, writes are rejected. Used for distributed coordination, leader election, and configuration management.",
            },
            {
              title: "AP: Cassandra, CouchDB, DynamoDB (default)",
              body: "These use leaderless replication with configurable read/write quorums. By default, writes are accepted by any available replica and propagated asynchronously. Reads may return stale data. They excel at high-write-throughput use cases: analytics, time-series, user activity logs.",
            },
            {
              title: "Tunable: MongoDB, PostgreSQL with Patroni",
              body: "MongoDB defaults to reading from the primary (CP-like) but can be configured for secondary reads (AP-like). Many modern systems blur the strict CP/AP boundary by offering configurable consistency levels.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            The right question when choosing a database is not "which theorem does this implement?" but:{" "}
            <strong className="sd-hl">what is the worst thing that can happen if two nodes disagree, and how will I detect and resolve it?</strong>
          </div>
        </PanelSection>

        <PanelSection title="Does one application have to pick one consistency model?">
          <p className="sd-text-sm">
            No, and treating it as a single global switch is the most common way this trade-off gets applied badly. Mature systems decide{" "}
            <strong className="sd-strong">per workflow</strong>, because the business penalty for a stale read is wildly different from one endpoint to the next.
          </p>
          {[
            {
              title: "Weigh Stale Reads Against Downtime",
              body: "In double-entry accounting, serving a balance that misses a pending withdrawal risks an illegal overdraft, so refusing the request is strictly better than accepting it. In an ad-click or video-view counter, dropping the event destroys the data outright, so accepting locally and reconciling later is strictly better. Same company, opposite answers.",
            },
            {
              title: "Invariants Decide, Not Preferences",
              body: "Updating a display name touches one row and depends on nothing, so eventual consistency and LWW are fine. Reserving a unique username or decrementing the last unit of stock spans an invariant, and if two nodes independently take that last unit from 1 to 0 you have oversold. Cross-node invariants are what force strong quorums, not the importance of the feature.",
            },
            {
              title: "Let the Read/Write Ratio Bias the Cost",
              body: "Write-heavy telemetry can acknowledge locally and push the synchronization cost onto rare analytical reads. A read-heavy product catalog can do the reverse, paying more on every write so reads can be served from the nearest replica. Put the expensive side on whichever operation happens least.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            The unit of decision is the{" "}
            <strong className="sd-hl">endpoint or workflow, not the database</strong>. A single product can run strict serializability for payments and an eventually consistent counter for view counts, and it should.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} />
    </>
  );
}
