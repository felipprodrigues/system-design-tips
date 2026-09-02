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
];

export default function Lesson03() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="CAP Theorem & Trade-offs"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 3 · Foundations
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          CAP Theorem &amp; Trade-offs
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          When the network fails, you must choose — and there is no middle ground.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            The CAP theorem states that in the presence of a network partition, a distributed system can only provide either{" "}
            <strong style={{ color: "#fff" }}>Consistency</strong> or{" "}
            <strong style={{ color: "#fff" }}>Availability</strong> — but not both. It defines the constraints every distributed data store must accept by forcing a choice about how the system behaves when its components cannot communicate.
          </p>
          <p>
            This is the first theorem in distributed systems that architects internalize as a hard constraint, not a preference. Understanding it doesn't give you a recipe — it gives you a{" "}
            <span style={{ color: "var(--sd-teal)" }}>lens for evaluating trade-offs</span>{" "}
            every time you choose a data store or design a failure mode.
          </p>
        </div>

        {/* Three pillars */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            The Framework
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Defining the Three Pillars</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              {
                letter: "C",
                name: "Consistency",
                color: "var(--sd-accent)",
                bg: "rgba(108,99,255,0.15)",
                desc: "Every read receives the most recent write or an error. The system acts as if there is only one copy of the data — even if replicated across nodes.",
              },
              {
                letter: "A",
                name: "Availability",
                color: "var(--sd-teal)",
                bg: "rgba(62,207,207,0.12)",
                desc: "Every request receives a non-error response, without the guarantee it contains the most recent write. The system stays operational even if nodes fail.",
              },
              {
                letter: "P",
                name: "Partition Tolerance",
                color: "var(--sd-green)",
                bg: "rgba(52,211,153,0.12)",
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

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#fff" }}>Partition Tolerance (P) is non-negotiable.</strong> Networks are unreliable — packets drop, cables get cut, hardware fails. Because you cannot prevent partitions, the real choice is between{" "}
            <span style={{ color: "var(--sd-teal)" }}>C</span> and{" "}
            <span style={{ color: "var(--sd-teal)" }}>A</span> when a partition occurs.
          </div>
        </div>

        {/* CP vs AP */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            The Trade-off
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>CP vs. AP — Choosing Your Failure Mode</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              When a network partition splits your nodes into isolated groups, they can no longer coordinate. At that point, you must decide: does the system{" "}
              <strong style={{ color: "#fff" }}>stop serving requests</strong> to avoid returning incorrect data, or does it{" "}
              <strong style={{ color: "#fff" }}>continue serving requests</strong> with whatever data it currently holds?
            </p>
            <p style={{ marginTop: 10 }}>
              This is not an engineering oversight — it is a fundamental constraint of distributed computing. The choice you make defines your system's behavior under failure.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              {
                badge: "CP",
                color: "var(--sd-accent)",
                bg: "rgba(108,99,255,0.15)",
                tagline: "Prioritize data integrity over uptime",
                body: "If a node cannot verify its data is current with the other side of the partition, it returns an error or times out rather than risk serving stale information.",
                use: "financial systems, inventory management, distributed locks",
              },
              {
                badge: "AP",
                color: "var(--sd-teal)",
                bg: "rgba(62,207,207,0.12)",
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
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
              Decision tree during a network partition
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid var(--sd-amber)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "var(--sd-amber)" }}>
                Network Partition Occurs
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)", margin: "4px 0" }}>↓</div>
              <div style={{ background: "rgba(108,99,255,0.07)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "var(--sd-accent)" }}>
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
                    <div style={{ fontSize: 18, color: "var(--sd-muted)" }}>↓</div>
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

        {/* Real-world example */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Real-World Example
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>A Banking Application Under Partition</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              A user has <strong style={{ color: "#fff" }}>$100</strong> in their account. The system replicates this balance across two data centers. A network partition cuts off communication between them. The user attempts a withdrawal.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              {
                label: "CP — Consistency chosen",
                color: "var(--sd-accent)",
                headerBg: "rgba(108,99,255,0.1)",
                body: (
                  <>
                    The system <strong style={{ color: "var(--sd-text)" }}>stops accepting withdrawals</strong>. It cannot guarantee the user hasn't already withdrawn $100 from the other data center, so it errors out to ensure the balance remains correct.
                    <br /><br />
                    The user sees a "Service Unavailable" message — but the data remains accurate.
                  </>
                ),
              },
              {
                label: "AP — Availability chosen",
                color: "var(--sd-teal)",
                headerBg: "rgba(62,207,207,0.1)",
                body: (
                  <>
                    The system <strong style={{ color: "var(--sd-text)" }}>allows the withdrawal at both data centers simultaneously</strong>. It prioritizes the user's ability to complete the task, even though internal state is now inconsistent — the user effectively withdrew $200 from a $100 balance.
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

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong style={{ color: "#fff" }}>CAP is a framework for failure, not normal operation.</strong> During normal operation — when there is no partition — systems can generally provide both high consistency and high availability. The trade-off only forces your hand when the network degrades.
          </div>

          <div style={{ background: "rgba(52,211,153,0.07)", borderLeft: "3px solid var(--sd-green)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            These constraints form the basis for understanding database replication strategies and distributed transaction patterns — topics covered in the lessons ahead.
          </div>
        </div>

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>
            Quiz Review
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="Why is Partition Tolerance truly non-negotiable?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The theorem's name implies a three-way choice, but Partition Tolerance is{" "}
            <strong style={{ color: "var(--sd-text)" }}>not actually optional</strong>. Abandoning it would mean assuming a perfectly reliable network — which does not exist at any scale.
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            The practical restatement of CAP: <strong style={{ color: "var(--sd-teal)" }}>when a partition occurs, does your system choose to stop serving requests (CP) or serve potentially stale data (AP)?</strong> There is no third option.
          </div>
        </PanelSection>

        <PanelSection title='What does "eventual consistency" actually mean in AP systems?'>
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            AP systems are typically described as "eventually consistent" — meaning all nodes will eventually converge to the same value,{" "}
            <strong style={{ color: "var(--sd-text)" }}>given enough time and no new writes</strong>. But "eventually" is often misunderstood.
          </p>
          {[
            {
              title: "What It Means",
              body: 'After a partition heals and no new conflicting writes arrive, all replicas will converge to an agreed-upon value. The system guarantees convergence, not timing. "Eventually" could be milliseconds or minutes depending on replication lag.',
            },
            {
              title: "Conflict Resolution Strategies",
              body: "Last-Write-Wins (LWW): the write with the most recent timestamp overwrites others — simple but can silently discard valid data. Vector Clocks: track causality between writes to detect true conflicts. CRDTs: data types designed so concurrent writes always merge without conflicts.",
            },
            {
              title: "The Operational Reality",
              body: "Eventual consistency shifts the burden from the database to the application and operations team. You must reason about read-your-own-writes consistency, monotonic reads, and what happens when a user sees a write disappear after a page refresh.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Eventual consistency is not weak consistency by default</strong> — many AP databases offer tunable consistency levels (e.g., QUORUM reads in Cassandra) that provide stronger guarantees at the cost of latency.
          </div>
        </PanelSection>

        <PanelSection title="How do real databases implement CP vs AP?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Real databases don't simply flip a "CP" or "AP" switch — they implement{" "}
            <strong style={{ color: "var(--sd-text)" }}>specific replication and quorum mechanisms</strong>{" "}
            that land them on one side of the trade-off by default, often with tunable knobs.
          </p>
          {[
            {
              title: "CP: HBase, ZooKeeper, etcd",
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            The right question when choosing a database is not "which theorem does this implement?" but:{" "}
            <strong style={{ color: "var(--sd-teal)" }}>what is the worst thing that can happen if two nodes disagree, and how will I detect and resolve it?</strong>
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        {...getLessonNav("03-cap-theorem")}
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
