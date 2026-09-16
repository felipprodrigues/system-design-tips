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
    question: "Why should you never use the arithmetic mean to report latency?",
    answers: ["The mean hides outliers — a small number of very slow requests can be masked by the fast majority, making the system appear healthier than it is."],
  },
  {
    question: "What does p99 latency represent?",
    answers: ['The response time experienced by the slowest 1% of requests — "tail latency".'],
  },
  {
    question: "What does it mean when p99 is significantly higher than p50?",
    answers: ["The system has jitter — common causes include Garbage Collection pauses, lock contention, or slow database queries."],
    note: "Horizontal scaling will not fix jitter. The root cause must be addressed at the code or query level.",
  },
  {
    question: "What are the three additive components of total latency?",
    answers: ["Network transit (physics and routing hops), queue wait time (time spent waiting for a free worker), and execution time (CPU and I/O)."],
    note: "Queue wait time is the only dynamic component. As a system approaches saturation it dominates the other two.",
  },
  {
    question: "Why is throughput not simply 1 / latency?",
    answers: ["That identity only holds for a single synchronous worker processing one request at a time. Real systems multiply capacity through concurrency across threads, event loops, cores, and nodes."],
  },
  {
    question: "What does Little's Law tell you about a saturating system?",
    answers: ["L = λ × W. Concurrency equals throughput times latency, so if latency rises while arrival rate stays flat, the number of in-flight requests grows until the worker pool is exhausted."],
  },
  {
    question: "Can a system have high throughput and high latency at the same time?",
    answers: ["Yes — a heavily queued system can process many requests per second while individual users wait a long time in the queue before being served."],
  },
  {
    question: "What is the saturation point in throughput?",
    answers: ["The point at which throughput plateaus — adding more load beyond this causes exponential latency spikes rather than more processed requests."],
  },
  {
    question: "How is availability calculated?",
    answers: ["Uptime ÷ (Uptime + Downtime), expressed as a percentage."],
  },
  {
    question: "How much downtime per year does 99.9% availability allow?",
    answers: ["~8.76 hours per year (~43.8 minutes per month)."],
  },
  {
    question: "Why does five nines require removing humans from the recovery path?",
    answers: ["Five nines allows 5.26 minutes of downtime per year. A human takes 15 to 30 minutes just to acknowledge a page and open a terminal, so any manual step blows the budget on its own."],
  },
  {
    question: "How does availability compound across a request path?",
    answers: ["Dependencies in series multiply: five services at 99.9% each give 0.999^5 ≈ 99.5%. Redundant replicas in parallel invert the failure probability: 1 - (1 - 0.99)² = 99.99%."],
  },
  {
    question: "Does high availability guarantee a fast system?",
    answers: ['No — a system that takes 30 seconds to respond but eventually succeeds is technically "available." Availability measures uptime, not speed.'],
  },
];

export default function Lesson02() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="Latency, Throughput & Availability"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 2 · Foundations
        </p>
        <h1 className="sd-h1">
          Latency, Throughput &amp; Availability
        </h1>
        <p className="sd-lede">
          The three pillars of system observability — if you can't measure these, you can't operate.
        </p>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            Before you can reason about scaling, consistency, or fault tolerance, you need a shared language for measuring system health. These three metrics are that language.{" "}
            <strong className="sd-strong">Latency</strong> tells you how fast the system responds.{" "}
            <strong className="sd-strong">Throughput</strong> tells you how much work it can handle.{" "}
            <strong className="sd-strong">Availability</strong> tells you how often it's actually reachable.
          </p>
          <p>
            They are related but not interchangeable — and optimizing for one often creates pressure on another. Understanding their definitions, how they're measured, and where they conflict is the prerequisite to every architectural decision that follows.
          </p>
          <p>
            When an architecture buckles under load or degrades in production, it is almost never because of an obscure syntax bug. It fails because someone miscalculated the relationship between how fast an operation completes, how many operations can run concurrently, and what proportion of them succeed over time. Treat these three as <strong className="sd-strong">mathematical constraints that push against one another</strong>, not as isolated target numbers on a dashboard.
          </p>
        </div>

        {/* ── LATENCY ── */}
        <div className="sd-section">
          <p className="sd-eyebrow">Metric 01</p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", marginRight: 10, verticalAlign: "middle" }}>Latency</span>
            Time to complete a request
          </h2>

          <div className="sd-prose">
            <p>Latency is the time it takes for a single request to complete. In a distributed architecture, this is not a single number — it's a <strong className="sd-strong">distribution</strong>. The most common mistake is reporting latency as an arithmetic mean.</p>
            <p style={{ marginTop: 10 }}>If 99% of requests take 10ms but 1% take 5 seconds, your average looks healthy while a real slice of users hits timeouts. The mean hides outliers entirely.</p>
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong className="sd-strong">Never use the mean for latency.</strong> Use percentiles. The mean is mathematically valid but operationally misleading in skewed distributions — which is exactly what request latency produces.
          </div>

          <div className="sd-grid-3">
            {[
              { label: "p50", name: "Median", color: "var(--sd-green)", desc: "Half your users experience this or better. Your \"typical\" user's experience." },
              { label: "p95", name: "95th Percentile", color: "var(--sd-amber)", desc: "The slowest 5% of requests. Start of the \"bad day\" zone for users." },
              { label: "p99", name: "Tail Latency", color: "var(--sd-red)", desc: "The unluckiest 1% of requests. Your SLA should be defined here, not at p50." },
            ].map((p) => (
              <div key={p.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sd-muted)", marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--sd-muted)" }}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Latency diagram */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 22px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 22, textAlign: "center" }}>Latency = Total Round-Trip Time</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Client", color: "var(--sd-accent)" },
                { arrow: true },
                { label: "Gateway", color: "var(--sd-amber)" },
                { arrow: true },
                { label: "Service", color: "var(--sd-teal)" },
              ].map((item, i) =>
                "arrow" in item ? (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4px", gap: 2 }}>
                    <div style={{ fontSize: 10, color: "var(--sd-muted)" }}>Request →</div>
                    <div style={{ fontSize: 16, color: "var(--sd-muted)", lineHeight: 1 }}>──────</div>
                    <div style={{ fontSize: 10, color: "var(--sd-muted)" }}>← Response</div>
                  </div>
                ) : (
                  <div key={i} style={{ background: "var(--sd-surface2)", border: `1px solid ${"color" in item ? item.color : ""}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "color" in item ? item.color : "" }}>
                    {"label" in item ? item.label : ""}
                  </div>
                )
              )}
            </div>
            <p style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: "var(--sd-muted)" }}>
              <strong className="sd-hl-accent">Latency</strong> = time from client sends request → client receives response
            </p>
          </div>

          {/* Latency anatomy */}
          <div className="sd-prose">
            <p>Latency is often confused with <strong className="sd-strong">response time</strong>. Response time is the total elapsed time the client experiences. Latency is the portion of it introduced by network transit, queuing, and compute along the path. Those three pieces are additive:</p>
            <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "var(--sd-teal)", margin: "14px 0", fontFamily: "var(--sd-font-mono)" }}>
              Total Latency = Network Transit + Queue Wait + Execution
            </p>
            <p>Knowing which term dominates tells you which fix is worth attempting. Adding a CDN does nothing for a request stuck in a connection pool, and a faster query does nothing for a client three continents away.</p>
          </div>

          <div className="sd-grid-3">
            {[
              { title: "Network Transit", color: "var(--sd-accent)", body: "Bounded by physics. Light travels roughly 200 km per millisecond through fiber, and every routing hop adds more. You cannot optimize this away, you can only move the data closer." },
              { title: "Queue Wait", color: "var(--sd-amber)", body: "Time spent sitting in thread pools, TCP buffers, and database connection pools waiting for a free worker. The only dynamic term, and it dominates as the system approaches saturation." },
              { title: "Execution", color: "var(--sd-teal)", body: "Raw CPU and I/O: parsing payloads, running business logic, reading from storage engines. This is what profilers measure and what most engineers instinctively try to fix first." },
            ].map((c) => (
              <div key={c.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong className="sd-strong">A healthy system spends its latency on execution.</strong> When queue wait becomes the largest term, you are no longer looking at a slow service, you are looking at an under-provisioned one. The fix is capacity or shedding, not micro-optimization.
          </div>

          <div className="sd-callout sd-callout-accent">
            <strong className="sd-strong">Jitter</strong> — a significantly higher p99 than p50 — indicates inconsistency in your system. Common causes: GC pauses, lock contention, or slow database queries.{" "}
            <span className="sd-hl">Horizontal scaling will not fix jitter.</span>
          </div>
        </div>

        {/* ── THROUGHPUT ── */}
        <div className="sd-section">
          <p className="sd-eyebrow">Metric 02</p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(127, 147, 242,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>Throughput</span>
            Rate of work processed
          </h2>

          <div className="sd-prose">
            <p>Throughput is the rate at which your system processes requests — measured in <strong className="sd-strong">Requests Per Second (RPS)</strong> or <strong className="sd-strong">Transactions Per Second (TPS)</strong>.</p>
            <p style={{ marginTop: 10 }}>Units follow the workload. Web services report RPS or <strong className="sd-strong">QPS</strong> (queries per second), while data pipelines report records per second or MB/s. The unit changes, the reasoning does not.</p>
            <p style={{ marginTop: 10 }}>High throughput does <strong className="sd-strong">not</strong> imply low latency. A system can process 10,000 RPS while taking 2 seconds to respond to each. This happens when a system is heavily queued — work is being accepted, but users wait in line before processing begins.</p>
          </div>

          <div className="sd-prose">
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--sd-font-mono)" }}>Common mistake</p>
            <p>Engineers often assume throughput is simply the inverse of latency. That identity holds for exactly one case: a strictly synchronous, single-threaded worker handling one request at a time. At 50ms per request:</p>
            <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "var(--sd-teal)", margin: "14px 0", fontFamily: "var(--sd-font-mono)" }}>
              1 request ÷ 0.05s = 20 RPS
            </p>
            <p>Real architectures break that ceiling with concurrency: multiple threads, event loops, CPU cores, and distributed nodes. A 50ms endpoint on 64 concurrent workers serves 1,280 RPS without getting a single millisecond faster.</p>
          </div>

          <div style={{ background: "rgba(127, 147, 242,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong className="sd-strong">Little's Law</strong> ties the two together: <span style={{ fontFamily: "var(--sd-font-mono)", color: "var(--sd-teal)" }}>L = λW</span>, where concurrency (L) equals arrival rate (λ) times latency (W). Hold arrival rate steady and double latency, and the number of in-flight requests doubles. That is why rising latency silently drains a worker pool until the pool itself becomes the outage.
          </div>

          <div className="sd-grid-2">
            {[
              { title: "Identify the Bottleneck", body: "Is the system CPU-bound (compute exhausted), memory-bound (heap pressure / GC), or I/O-bound (disk or network saturated)? Each bottleneck type demands a different fix." },
              { title: "Saturation Point", body: "The point at which throughput plateaus. Beyond it, adding more load causes exponential latency spikes rather than more processed requests. This is your effective capacity ceiling." },
            ].map((c) => (
              <div key={c.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 8 }}>{c.title}</div>
                <p className="sd-text-sm-tight">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout">
            <strong className="sd-strong">Throughput ≠ Latency.</strong> A heavily queued system can look healthy on throughput dashboards while individual users experience degraded performance. Always monitor both together.
          </div>
        </div>

        {/* ── AVAILABILITY ── */}
        <div className="sd-section">
          <p className="sd-eyebrow">Metric 03</p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(157, 176, 247,0.12)", color: "var(--sd-green)", marginRight: 10, verticalAlign: "middle" }}>Availability</span>
            Percentage of time the system is reachable
          </h2>

          <div className="sd-prose">
            <p>Availability is the percentage of time a system is functional and reachable, expressed in <strong className="sd-strong">"nines"</strong>. It is calculated as:</p>
            <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "var(--sd-teal)", margin: "14px 0" }}>
              Availability = Uptime ÷ (Uptime + Downtime)
            </p>
            <p>In distributed systems, availability is rarely binary. A system can be "up" while returning 500 errors to 5% of users. The inverse metric is <strong className="sd-strong">Error Rate</strong> — Failed Requests ÷ Total Requests.</p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Availability", "Downtime / year", "Downtime / month", "Typical architecture required"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { nines: "99%", label: "2 nines", color: "var(--sd-red)", year: "~3.65 days", month: "~43.8 hours", arch: "Single server with manual recovery" },
                  { nines: "99.9%", label: "3 nines", color: "var(--sd-amber)", year: "~8.76 hours", month: "~43.8 minutes", arch: "Redundant app servers, managed database failover" },
                  { nines: "99.99%", label: "4 nines", color: "var(--sd-teal)", year: "~52.6 minutes", month: "~4.38 minutes", arch: "Multi-zone redundancy, automated health checks, zero-downtime deploys" },
                  { nines: "99.999%", label: "5 nines", color: "var(--sd-green)", year: "~5.26 minutes", month: "~26.3 seconds", arch: "Multi-region active-active, automated chaos engineering" },
                ].map((row, i, arr) => (
                  <tr key={row.nines}>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.nines}</span>{" "}
                      <span style={{ color: "var(--sd-muted)", fontSize: 12 }}>{row.label}</span>
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none", whiteSpace: "nowrap" }}>{row.year}</td>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none", whiteSpace: "nowrap" }}>{row.month}</td>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)", fontSize: 13 }}>{row.arch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Each additional nine is an <strong className="sd-strong">order of magnitude</strong> less allowable downtime, not an incremental improvement. Five nines means eliminating every manual operational step, because a human takes 15 to 30 minutes just to acknowledge a page and open a terminal. That alone is six years of a five-nines budget.
          </div>

          <div className="sd-grid-2">
            {[
              { title: "In series, availability multiplies", color: "var(--sd-red)", formula: "0.999⁵ ≈ 99.5%", body: "A request that must touch five services, each at 99.9%, succeeds only 99.5% of the time. Every hard dependency you add subtracts uptime, which is why deep synchronous call chains are so expensive." },
              { title: "In parallel, failure multiplies", color: "var(--sd-green)", formula: "1 − (1 − 0.99)² = 99.99%", body: "Two redundant 99% replicas fail together only 0.01% of the time. Redundancy is the only structural move that buys nines, and it only works if the replicas do not share a failure domain." },
            ].map((c) => (
              <div key={c.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--sd-font-mono)", color: "var(--sd-text)", marginBottom: 8 }}>{c.formula}</div>
                <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-accent">
            <strong className="sd-strong">High availability ≠ fast.</strong> A system that takes 30 seconds to respond but eventually succeeds is technically "available." Availability measures uptime, not speed. You need all three metrics to describe system health accurately.
          </div>
        </div>

        {/* ── TENSION ── */}
        <div className="sd-section">
          <p className="sd-eyebrow">Putting it together</p>
          <h2 className="sd-h2">The Tension Between Metrics</h2>

          <div className="sd-prose">
            <p>These metrics don't exist in isolation — optimizing for one creates pressure on the others.</p>
            <p style={{ marginTop: 10 }}>
              To improve <strong className="sd-strong">latency</strong>, you might cache results — increasing memory usage and cache consistency complexity. To improve <strong className="sd-strong">availability</strong>, you add redundant nodes — which increases consistency complexity. To improve <strong className="sd-strong">throughput</strong>, you scale horizontally — which introduces distributed state challenges covered in the previous lesson.
            </p>
          </div>

          <div className="sd-grid-3">
            {[
              { icon: "⚡", name: "Latency", color: "var(--sd-accent)", desc: "Improve via caching. Trade-off: memory pressure and consistency risk." },
              { icon: "⇌", name: "Throughput", color: "var(--sd-teal)", desc: "Improve via horizontal scaling. Trade-off: distributed state complexity." },
              { icon: "◎", name: "Availability", color: "var(--sd-green)", desc: "Improve via redundancy. Trade-off: consistency model complexity." },
            ].map((c) => (
              <div key={c.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {[
              { pair: "Throughput vs Latency", mech: "Batching & queues", color: "var(--sd-teal)", body: "Grouping 1,000 individual inserts into one bulk write collapses connection and disk sync overhead, so database throughput climbs sharply. Each individual record pays for it by waiting in a memory buffer until the batch window closes." },
              { pair: "Availability vs Latency", mech: "Multi-region replication", color: "var(--sd-green)", body: "Writing synchronously to two regions means a total loss of Region A costs zero data. It also adds a cross-region round trip of 50ms to 150ms to every single write, forever, including the 99.99% of days nothing fails." },
              { pair: "Availability vs Throughput", mech: "Retries & load shedding", color: "var(--sd-accent)", body: "Aggressive client retries mask transient blips and improve perceived availability. Under sustained saturation those same retries become a thundering herd that multiplies load against an already struggling system, turning a partial slowdown into a full outage." },
            ].map((c) => (
              <div key={c.pair} className="sd-card">
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.pair}</span>
                  <span style={{ fontSize: 11, color: "var(--sd-muted)", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.mech}</span>
                </div>
                <p className="sd-text-sm-tight">{c.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong className="sd-strong">Recap.</strong> Latency is governed by network physics, execution cycles, and queuing, with percentiles exposing the tail the mean hides. Throughput is bounded by concurrency under Little's Law, where rising latency quietly drains the worker pool. Availability is decided by topology, since dependencies in series multiply risk while redundancy in parallel absorbs it. Every architecture ahead is a negotiation between these three.
          </div>

          <div className="sd-callout sd-callout-green">
            These metrics form the foundation for evaluating every architectural trade-off ahead — starting with the <strong className="sd-strong">CAP Theorem</strong>, which formalizes exactly this tension between consistency and availability in distributed systems.
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
        <PanelSection title="How can a system have high throughput but poor latency?">
          <p className="sd-text-sm">
            High throughput with poor latency is the hallmark of a system optimized for <strong className="sd-strong">batch processing or deep pipelining</strong> rather than request-response responsiveness.
          </p>
          {[
            { title: "Massive Parallelism", body: "Even if every individual task takes 5 seconds (high latency), running 1,000 concurrently yields a throughput of 200 tasks/sec. Concurrency compensates for slow individual responses." },
            { title: "Request Batching", body: "Systems buffer individual requests into larger chunks to optimize I/O or network overhead. This maximizes total volume but introduces a deliberate wait for the first element in the batch." },
            { title: "Heavy Resource Utilization", body: "Processes queue waiting for CPU or database locks. The system completes all work (throughput intact) but individual requests sit in queues, extending round-trip time." },
            { title: "Deep Pipelining", body: "Architectures like MapReduce or ETL pipelines are throughput-oriented — they accept significant latency in exchange for the ability to process massive datasets in the background." },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            Poor latency occurs when the system is <strong className="sd-hl">congested</strong> — processing at capacity while requests wait in buffers. The "pipes" are full so throughput is high, but the transit time for any specific request is sacrificed.
          </div>
        </PanelSection>

        <PanelSection title="Does adding more hardware always improve availability?">
          <p className="sd-text-sm">
            Horizontal scaling improves availability <strong className="sd-strong">only if the architecture is fault-tolerant and stateless</strong>. Simply adding nodes creates a false sense of security.
          </p>
          {[
            { title: "Shared Bottlenecks", body: "If scaling is gated by a single unscaled resource — a primary database, a global lock, a single gateway — that resource is a SPOF. More app nodes just increase contention on it, potentially accelerating a system-wide crash." },
            { title: "State Management", body: "Nodes coordinating state introduce communication overhead and distributed consensus risks. More nodes = higher probability of network partitions or split-brain scenarios." },
            { title: "Complexity & Blast Radius", body: "Each additional node is a new potential failure point. A propagated configuration error at scale means a larger portion of infrastructure fails simultaneously." },
            { title: "Load Balancer Reliability", body: "If the load balancer is a single instance, scaling the backend is moot. Redundancy must exist at every layer — DNS round-robin, Anycast, or redundant LBs." },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            Horizontal scaling provides <strong className="sd-hl">capacity</strong>, not necessarily <strong className="sd-hl">availability</strong>. True availability requires combining scaling with partitioning, redundancy, and isolation.
          </div>
        </PanelSection>

        <PanelSection title="Does 99.9% availability mean every user gets 99.9% uptime?">
          <p className="sd-text-sm">
            <strong className="sd-strong">No.</strong> Availability metrics represent system-level uptime, not individual user experience.
          </p>
          {[
            { title: "Individual vs. Aggregate", body: "A user who only interacts with the system during the 0.1% downtime window experiences 0% availability. A user whose usage never overlaps with an outage experiences 100%. The reported figure is an aggregate." },
            { title: "Compounded Microservice Availability", body: "If a user's request touches five microservices each at 99.9%, the probability of full success is 0.999^5 ≈ 99.5%. Availability compounds multiplicatively across the request path." },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            Always distinguish <strong className="sd-hl">Service Availability</strong> (infrastructure uptime) from <strong className="sd-hl">User-Perceived Availability</strong> (individual request success rate).
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        {...getLessonNav("02-latency-throughput-availability")}
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
