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
    question: "What does horizontal scaling via sharding actually do to a dataset?",
    answers: [
      "It distributes data across multiple nodes in a cluster, rather than adding more power (CPU, RAM) to a single server the way vertical scaling does.",
    ],
  },
  {
    question: "What is the shard key, and why does it matter so much?",
    answers: [
      "The column (or set of columns) used to determine which shard a given row is routed to. It's the single most consequential design decision in a sharded architecture — get it wrong and you end up with hot shards.",
    ],
  },
  {
    question: "What problem does range-based sharding create as new rows are added?",
    answers: [
      "Uneven data distribution and hot shards — sequentially increasing values (like an incrementing user_id) concentrate new writes onto whichever shard holds the highest range.",
    ],
  },
  {
    question: "How does hash-based sharding decide which shard a row belongs on?",
    answers: [
      "It applies a hash function to the shard key, then takes the result modulo the number of shards: shard_id = hash(key) % total_shards.",
    ],
  },
  {
    question: "Why does range partitioning make deleting old data cheap?",
    answers: [
      "It simplifies data deletion by letting you drop an entire time-based partition as a metadata-level operation, instead of running a massive, locking row-by-row DELETE.",
    ],
  },
  {
    question: "What does a shard map actually do?",
    answers: [
      "It's a middleware look-up layer that maps shard keys or IDs to the physical connection string of the specific database instance that owns them.",
    ],
  },
  {
    question: "What operational cost does sharding add to JOIN operations?",
    answers: [
      "It increases their complexity significantly — related rows need to be co-located on the same shard using the same shard key, or the join has to be reconstructed across the network in application code.",
    ],
  },
  {
    question: "What is composite partitioning?",
    answers: [
      "Combining multiple strategies at once — for example, sharding by tenant_id across servers, then partitioning each shard locally by transaction_date.",
    ],
  },
  {
    question: "Why are cross-shard operations difficult to manage?",
    answers: [
      "They're inherently hard to keep atomic and often require two-phase commit or a distributed transaction manager to coordinate machines that don't otherwise know about each other.",
    ],
  },
  {
    question: "At the end of the day, what are sharding and partitioning strategies for?",
    answers: [
      "Data placement — deciding where each row physically lives. On their own, they don't address keeping that data consistent across nodes; that's the next problem to solve.",
    ],
  },
];

const strategyRows = [
  { requirement: "Distribution", range: "Uneven — skews toward newest range", hash: "Even — randomized by hash" },
  { requirement: "Range Queries", range: "Cheap — hits one contiguous shard", hash: "Expensive — broadcast to every shard" },
  { requirement: "Hot Spot Risk", range: "High, on sequentially-growing keys", hash: "Low, distribution is randomized" },
  { requirement: "Typical Use Case", range: "Time-series, ordered IDs", hash: "User/session data, high write volume" },
];

const partitionTypes = [
  {
    title: "List Partitioning",
    body: "Rows are assigned to a partition based on a specific list of values. A Logs table might be partitioned by region_code, with separate partitions for 'US', 'EU', and 'APAC'.",
  },
  {
    title: "Range Partitioning",
    body: "Commonly used for time-series data. A Transactions table partitioned by created_at date lets you purge old data by dropping the entire partition — a metadata operation — instead of running a massive, locking DELETE.",
  },
  {
    title: "Composite Partitioning",
    body: "A combination of strategies — for example, sharding by tenant_id across servers, then partitioning each shard locally by transaction_date.",
  },
];

const tradeoffs = [
  {
    title: "Join Complexity",
    body: "Performing a JOIN across shards is complex and slow. You have to ensure related data — Users and their Orders, for example — is co-located on the same shard using the same shard key.",
  },
  {
    title: "Rebalancing",
    body: "If one shard becomes too full, it has to be split and its data moved to a new server. This is time-consuming and often requires downtime or a complex background migration.",
  },
  {
    title: "Cross-Shard Transactions",
    body: "Operations spanning multiple shards are inherently difficult, often requiring two-phase commit protocols or a distributed transaction manager to keep them atomic.",
  },
];

export default function Lesson02DatabaseSharding() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Data Storage and Management Strategies"
        lesson="Implementing Database Sharding and Partitioning"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 2 · Data Storage and Management Strategies
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Implementing Database Sharding and Partitioning
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          Decomposing a single, massive dataset into smaller chunks spread across nodes — trading query simplicity for horizontal scale.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            Database sharding and partitioning are strategies used to{" "}
            <strong style={{ color: "#fff" }}>decompose a single, massive dataset</strong> into smaller, manageable chunks across multiple database nodes.
          </p>
          <p>
            Vertical scaling adds more power — CPU, RAM — to a single server. Horizontal scaling via sharding instead{" "}
            <strong style={{ color: "#fff" }}>distributes data across an entire cluster</strong>, theoretically overcoming the storage and throughput limits of one machine.
          </p>
        </div>

        {/* Horizontal Partitioning / Sharding */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Model 01
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(108,99,255,0.15)", color: "var(--sd-accent)", marginRight: 10, verticalAlign: "middle" }}>
              Sharding
            </span>
            Horizontal Partitioning
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Sharding is the process of splitting a logical dataset into horizontal fragments, where each fragment is stored on a{" "}
              <strong style={{ color: "#fff" }}>separate physical server</strong>. Unlike partitioning — often done on a single instance to improve local query performance — sharding explicitly addresses the scaling bottlenecks of one physical database server.
            </p>
            <p style={{ marginTop: 10 }}>
              The core of a sharded architecture is the{" "}
              <strong style={{ color: "#fff" }}>Shard Key</strong> — the column (or set of columns) used to determine which shard a row belongs to. Choosing this key is the most critical design decision.
            </p>
          </div>

          <div style={{ background: "rgba(248,113,113,0.07)", borderLeft: "3px solid var(--sd-red)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            A poor shard key choice leads to <strong style={{ color: "#fff" }}>&quot;hot shards&quot;</strong> — one server handling 90% of the traffic, defeating the purpose of the distribution.
          </div>
        </div>

        {/* Range-Based Sharding */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Strategy 01
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(52,211,153,0.12)", color: "var(--sd-green)", marginRight: 10, verticalAlign: "middle" }}>
              Range
            </span>
            Range-Based Sharding
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Data is partitioned based on ranges of values. For example, a{" "}
              <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12.5, color: "var(--sd-teal)" }}>Users</code>{" "}
              table could be sharded by{" "}
              <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12.5, color: "var(--sd-teal)" }}>user_id</code>:
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16, overflowX: "auto", fontSize: 12.5, lineHeight: 1.9 }}>
            <code style={{ color: "var(--sd-text)" }}>
              <span style={{ color: "var(--sd-green)" }}>Shard 1</span>: user_id <span style={{ color: "var(--sd-amber)" }}>1</span> to <span style={{ color: "var(--sd-amber)" }}>1,000,000</span>{"\n"}
              <span style={{ color: "var(--sd-green)" }}>Shard 2</span>: user_id <span style={{ color: "var(--sd-amber)" }}>1,000,001</span> to <span style={{ color: "var(--sd-amber)" }}>2,000,000</span>
            </code>
          </pre>

          <div style={{ background: "rgba(248,113,113,0.07)", borderLeft: "3px solid var(--sd-red)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            This is simple to implement but leads to <strong style={{ color: "#fff" }}>uneven distribution</strong>. If your application creates many new users, the shard holding the highest range experiences significantly more write pressure than the others.
          </div>
        </div>

        {/* Hash-Based Sharding */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Strategy 02
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(62,207,207,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>
              Hash
            </span>
            Hash-Based Sharding
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Data is partitioned by applying a hash function to the shard key, then taking the modulo of the number of shards:
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16, overflowX: "auto", fontSize: 12.5, lineHeight: 1.7 }}>
            <code style={{ color: "var(--sd-text)" }}>
              Shard ID = <span style={{ color: "var(--sd-teal)" }}>hash</span>(user_id) <span style={{ color: "var(--sd-accent)" }}>%</span> total_shards
            </code>
          </pre>

          {/* Hash routing diagram */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 24px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
              Routing a write with a hash-based shard key
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, color: "var(--sd-accent)" }}>
                Incoming Write Request
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)" }}>↓</div>
              <div style={{ background: "rgba(62,207,207,0.12)", border: "1px solid var(--sd-teal)", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", textAlign: "center" }}>
                Calculate Hash
                <div style={{ fontSize: 10, fontWeight: 400, color: "var(--sd-muted)", marginTop: 2 }}>shard_id = hash % 3</div>
              </div>
              <div style={{ fontSize: 18, color: "var(--sd-muted)" }}>↓</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { shard: "Shard 0", node: "Node A" },
                  { shard: "Shard 1", node: "Node B" },
                  { shard: "Shard 2", node: "Node C" },
                ].map((s) => (
                  <div key={s.shard} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "9px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)" }}>{s.shard}</div>
                    <div style={{ fontSize: 10.5, color: "var(--sd-muted)", marginTop: 2 }}>{s.node}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(62,207,207,0.07)", borderLeft: "3px solid var(--sd-teal)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            This effectively randomizes the data distribution, preventing hot spots. But it makes range-based queries — &quot;find all users created between Monday and Friday&quot; — extremely expensive, since you must{" "}
            <strong style={{ color: "#fff" }}>broadcast the query to every shard and aggregate the results</strong>.
          </div>
        </div>

        {/* Strategy comparison */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Reference
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Range vs. Hash at a Glance</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Requirement", "Range-Based", "Hash-Based"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {strategyRows.map((row, i) => (
                  <tr key={row.requirement}>
                    <td style={{ padding: "11px 14px", borderBottom: i < strategyRows.length - 1 ? "1px solid var(--sd-border)" : "none", fontWeight: 600, color: "var(--sd-text)" }}>{row.requirement}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < strategyRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-green)" }}>{row.range}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < strategyRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-teal)" }}>{row.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partitioning within a single node */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Single-Instance Technique
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Partitioning Strategies Within a Single Node</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Partitioning is often used within a single database engine to improve maintenance and query performance for massive tables{" "}
              <strong style={{ color: "#fff" }}>without the complexity of a distributed network</strong>.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {partitionTypes.map((item) => (
              <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
                <p style={{ fontSize: 12.5, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shard Map implementation */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Implementation
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Implementing a Shard Map</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              To route requests, the application or a middleware layer needs a{" "}
              <strong style={{ color: "#fff" }}>&quot;Shard Map&quot;</strong> — a look-up table that maintains the association between the shard key range and the physical connection string of the database instance.
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 0, overflowX: "auto", fontSize: 12.5, lineHeight: 1.7 }}>
            <code style={{ color: "var(--sd-text)" }}>
              <span style={{ color: "var(--sd-muted)" }}>{"# Simplified Shard Router"}</span>{"\n"}
              <span style={{ color: "var(--sd-accent)" }}>class</span> <span style={{ color: "var(--sd-teal)" }}>ShardRouter</span>:{"\n"}
              {"    "}<span style={{ color: "var(--sd-accent)" }}>def</span> <span style={{ color: "var(--sd-teal)" }}>__init__</span>(<span style={{ color: "var(--sd-amber)" }}>self</span>):{"\n"}
              {"        "}<span style={{ color: "var(--sd-muted)" }}>{"# Maps shard IDs to database connection strings"}</span>{"\n"}
              {"        "}<span style={{ color: "var(--sd-amber)" }}>self</span>.shard_map = {"{\n"}
              {"            "}<span style={{ color: "var(--sd-amber)" }}>0</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;db-node-0.internal:5432&quot;</span>,{"\n"}
              {"            "}<span style={{ color: "var(--sd-amber)" }}>1</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;db-node-1.internal:5432&quot;</span>,{"\n"}
              {"            "}<span style={{ color: "var(--sd-amber)" }}>2</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;db-node-2.internal:5432&quot;</span>{"\n"}
              {"        }\n\n"}
              {"    "}<span style={{ color: "var(--sd-accent)" }}>def</span> <span style={{ color: "var(--sd-teal)" }}>get_connection</span>(<span style={{ color: "var(--sd-amber)" }}>self</span>, user_id):{"\n"}
              {"        "}shard_id = <span style={{ color: "var(--sd-teal)" }}>hash</span>(user_id) <span style={{ color: "var(--sd-accent)" }}>%</span> <span style={{ color: "var(--sd-amber)" }}>3</span>{"\n"}
              {"        "}<span style={{ color: "var(--sd-accent)" }}>return</span> <span style={{ color: "var(--sd-amber)" }}>self</span>.shard_map[shard_id]{"\n\n"}
              <span style={{ color: "var(--sd-muted)" }}>{"# Usage"}</span>{"\n"}
              router = ShardRouter(){"\n"}
              conn = router.get_connection(user_id=<span style={{ color: "var(--sd-amber)" }}>89234</span>){"\n"}
              <span style={{ color: "var(--sd-muted)" }}>{"# Output: \"db-node-2.internal:5432\""}</span>
            </code>
          </pre>
        </div>

        {/* Trade-offs */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Costs
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Trade-offs and Operational Complexity</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Sharding introduces significant architectural overhead:</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tradeoffs.map((item) => (
              <div key={item.title} style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
                <p style={{ fontSize: 12.5, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Summary
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Data Placement, Not Data Consistency</h2>

          <div style={{ background: "rgba(52,211,153,0.07)", borderLeft: "3px solid var(--sd-green)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Sharding is a powerful technique for horizontal scaling, shifting the bottleneck from a single physical server to the logic of your partitioning strategy. Hash-based sharding gives the best load distribution but sacrifices efficient range queries — always aim for{" "}
            <strong style={{ color: "#fff" }}>data co-location</strong> to minimize the need for cross-shard operations. Partitioning and sharding are purely about data placement; next, we&rsquo;ll explore how to keep that data{" "}
            <strong style={{ color: "#fff" }}>consistent</strong> across those nodes.
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
        <PanelSection title="How do you rebalance a hash-sharded cluster without reshuffling everything?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Plain{" "}
            <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12, color: "var(--sd-teal)" }}>hash % N</code>{" "}
            has a nasty property: changing{" "}
            <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12, color: "var(--sd-teal)" }}>N</code>{" "}
            (adding or removing a shard) reshuffles almost every key&rsquo;s target shard, not just the ones that need to move.
          </p>
          {[
            {
              title: "Consistent Hashing",
              body: "Shards are placed as points on a fixed hash ring, and each key maps to the next shard clockwise from its hash. Adding or removing a shard only remaps the keys between it and its neighbor — a small, bounded slice of the data instead of nearly all of it.",
            },
            {
              title: "Virtual Nodes",
              body: "A physical shard is represented by many points on the ring instead of one, so load spreads more evenly and a single new shard doesn't absorb one disproportionately large arc.",
            },
            {
              title: "Why It Matters Operationally",
              body: "It turns rebalancing from \"migrate most of the dataset\" into \"migrate the fraction that actually belongs on the new shard\" — the difference between a routine operation and a maintenance window.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Plain modulo hashing and consistent hashing solve the same routing problem</strong> — the difference only shows up the moment the shard count changes.
          </div>
        </PanelSection>

        <PanelSection title="What is two-phase commit, and why do cross-shard transactions need it?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            A single-shard transaction gets ACID guarantees for free from the local database engine. The moment a transaction touches{" "}
            <strong style={{ color: "var(--sd-text)" }}>two different shards</strong>, there's no single engine watching both — something else has to coordinate.
          </p>
          {[
            {
              title: "Phase 1 — Prepare",
              body: "A coordinator asks every participating shard to do the work and confirm it's ready to commit, without actually committing yet. Each shard locks the affected rows and replies \"ready\" or \"abort.\"",
            },
            {
              title: "Phase 2 — Commit",
              body: "If every shard replied \"ready,\" the coordinator tells them all to commit for real. If any shard said \"abort,\" it tells them all to roll back instead — all or nothing, across machines that don't otherwise know about each other.",
            },
            {
              title: "The Painful Part",
              body: "Between the two phases, every participating shard is holding locks and waiting on the coordinator. If the coordinator crashes mid-protocol, those shards can be stuck blocked until it recovers — which is exactly why cross-shard transactions are avoided whenever data can instead be co-located.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Two-phase commit buys atomicity across shards at the cost of availability during the protocol.</strong> It's the CAP theorem's trade-off showing up again, one layer down.
          </div>
        </PanelSection>

        <PanelSection title="How do you keep JOINs cheap once data is sharded?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The database engine can only join rows it can see locally. Once related rows live on different physical servers, a &quot;join&quot; stops being one operation and becomes an{" "}
            <strong style={{ color: "var(--sd-text)" }}>application-level fan-out</strong> — unless you design around it.
          </p>
          {[
            {
              title: "Co-locate by the Same Shard Key",
              body: "If Users are sharded by user_id, shard Orders by the owning user's user_id too. Now a user's orders always live on the same physical node as the user, and the join never has to cross the network.",
            },
            {
              title: "Denormalize the Reference Data",
              body: "For small, slow-changing lookup data (like a product catalog), duplicate it onto every shard instead of joining to it remotely. You trade some storage and eventual staleness for a local, fast read.",
            },
            {
              title: "When You Genuinely Can't Co-locate",
              body: "The application has to run the query on each relevant shard and merge the results in code — the same broadcast-and-aggregate pattern range queries hit under hash-based sharding.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Co-location isn&rsquo;t a database feature — it&rsquo;s a modeling decision.</strong> You choose the shard key so the joins you actually run stay on one machine.
          </div>
        </PanelSection>

        <PanelSection title="Range vs. hash sharding — how do you actually decide?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Neither strategy is universally better — the right one follows directly from{" "}
            <strong style={{ color: "var(--sd-text)" }}>which queries you run most often</strong>.
          </p>
          {[
            {
              title: "Choose Range When Queries Are Range-Shaped",
              body: "Time-series dashboards, ordered pagination, and \"give me everything between X and Y\" access patterns all want the underlying data physically contiguous, which only range-based sharding gives you.",
            },
            {
              title: "Choose Hash When Writes Dominate",
              body: "High-volume, independently-keyed writes — user records, session data, event streams keyed by ID — benefit far more from even load distribution than from any range-scan capability.",
            },
            {
              title: "Some Systems Do Both",
              body: "Composite schemes hash on a coarse key (like tenant_id) to spread load evenly across shards, then range-partition within each shard by a time column — getting even write distribution and cheap local range scans at once.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Start from your access patterns, not the algorithm.</strong> The shard key is a bet on what you'll query — get it wrong and you're re-sharding in production.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        lessonNumber={2}
        totalLessons={6}
        prevHref="/lessons/01-relational-vs-nosql"
        sectionTitle="Data Storage and Management Strategies"
      />
    </>
  );
}
