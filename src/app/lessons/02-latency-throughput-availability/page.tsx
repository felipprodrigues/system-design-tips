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
    answers: ["~8.76 hours per year (~10.1 minutes per week)."],
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
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 2 · Foundations
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Latency, Throughput &amp; Availability
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          The three pillars of system observability — if you can't measure these, you can't operate.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            Before you can reason about scaling, consistency, or fault tolerance, you need a shared language for measuring system health. These three metrics are that language.{" "}
            <strong style={{ color: "#fff" }}>Latency</strong> tells you how fast the system responds.{" "}
            <strong style={{ color: "#fff" }}>Throughput</strong> tells you how much work it can handle.{" "}
            <strong style={{ color: "#fff" }}>Availability</strong> tells you how often it's actually reachable.
          </p>
          <p>
            They are related but not interchangeable — and optimizing for one often creates pressure on another. Understanding their definitions, how they're measured, and where they conflict is the prerequisite to every architectural decision that follows.
          </p>
        </div>

        {/* ── LATENCY ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>Metric 01</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(108,99,255,0.15)", color: "var(--sd-accent)", marginRight: 10, verticalAlign: "middle" }}>Latency</span>
            Time to complete a request
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Latency is the time it takes for a single request to complete. In a distributed architecture, this is not a single number — it's a <strong style={{ color: "#fff" }}>distribution</strong>. The most common mistake is reporting latency as an arithmetic mean.</p>
            <p style={{ marginTop: 10 }}>If 99% of requests take 10ms but 1% take 5 seconds, your average looks healthy while a real slice of users hits timeouts. The mean hides outliers entirely.</p>
          </div>

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: "#fff" }}>Never use the mean for latency.</strong> Use percentiles. The mean is mathematically valid but operationally misleading in skewed distributions — which is exactly what request latency produces.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
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
              <strong style={{ color: "var(--sd-accent)" }}>Latency</strong> = time from client sends request → client receives response
            </p>
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#fff" }}>Jitter</strong> — a significantly higher p99 than p50 — indicates inconsistency in your system. Common causes: GC pauses, lock contention, or slow database queries.{" "}
            <span style={{ color: "var(--sd-teal)" }}>Horizontal scaling will not fix jitter.</span>
          </div>
        </div>

        {/* ── THROUGHPUT ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>Metric 02</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(62,207,207,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>Throughput</span>
            Rate of work processed
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Throughput is the rate at which your system processes requests — measured in <strong style={{ color: "#fff" }}>Requests Per Second (RPS)</strong> or <strong style={{ color: "#fff" }}>Transactions Per Second (TPS)</strong>.</p>
            <p style={{ marginTop: 10 }}>High throughput does <strong style={{ color: "#fff" }}>not</strong> imply low latency. A system can process 10,000 RPS while taking 2 seconds to respond to each. This happens when a system is heavily queued — work is being accepted, but users wait in line before processing begins.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { title: "Identify the Bottleneck", body: "Is the system CPU-bound (compute exhausted), memory-bound (heap pressure / GC), or I/O-bound (disk or network saturated)? Each bottleneck type demands a different fix." },
              { title: "Saturation Point", body: "The point at which throughput plateaus. Beyond it, adding more load causes exponential latency spikes rather than more processed requests. This is your effective capacity ceiling." },
            ].map((c) => (
              <div key={c.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#fff" }}>Throughput ≠ Latency.</strong> A heavily queued system can look healthy on throughput dashboards while individual users experience degraded performance. Always monitor both together.
          </div>
        </div>

        {/* ── AVAILABILITY ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>Metric 03</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(52,211,153,0.12)", color: "var(--sd-green)", marginRight: 10, verticalAlign: "middle" }}>Availability</span>
            Percentage of time the system is reachable
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Availability is the percentage of time a system is functional and reachable, expressed in <strong style={{ color: "#fff" }}>"nines"</strong>. It is calculated as:</p>
            <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "var(--sd-teal)", margin: "14px 0" }}>
              Availability = Uptime ÷ (Uptime + Downtime)
            </p>
            <p>In distributed systems, availability is rarely binary. A system can be "up" while returning 500 errors to 5% of users. The inverse metric is <strong style={{ color: "#fff" }}>Error Rate</strong> — Failed Requests ÷ Total Requests.</p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Availability", "Downtime / year", "Downtime / week"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { nines: "99%", label: "2 nines", color: "var(--sd-red)", year: "~3.65 days", week: "~1.68 hours" },
                  { nines: "99.9%", label: "3 nines", color: "var(--sd-amber)", year: "~8.76 hours", week: "~10.1 minutes" },
                  { nines: "99.99%", label: "4 nines", color: "var(--sd-teal)", year: "~52.6 minutes", week: "~1 minute" },
                  { nines: "99.999%", label: "5 nines", color: "var(--sd-green)", year: "~5.26 minutes", week: "~6 seconds" },
                ].map((row, i, arr) => (
                  <tr key={row.nines}>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.nines}</span>{" "}
                      <span style={{ color: "var(--sd-muted)", fontSize: 12 }}>{row.label}</span>
                    </td>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{row.year}</td>
                    <td style={{ padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--sd-border)" : "none" }}>{row.week}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#fff" }}>High availability ≠ fast.</strong> A system that takes 30 seconds to respond but eventually succeeds is technically "available." Availability measures uptime, not speed. You need all three metrics to describe system health accurately.
          </div>
        </div>

        {/* ── TENSION ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>Putting it together</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>The Tension Between Metrics</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>These metrics don't exist in isolation — optimizing for one creates pressure on the others.</p>
            <p style={{ marginTop: 10 }}>
              To improve <strong style={{ color: "#fff" }}>latency</strong>, you might cache results — increasing memory usage and cache consistency complexity. To improve <strong style={{ color: "#fff" }}>availability</strong>, you add redundant nodes — which increases consistency complexity. To improve <strong style={{ color: "#fff" }}>throughput</strong>, you scale horizontally — which introduces distributed state challenges covered in the previous lesson.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
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

          <div style={{ background: "rgba(52,211,153,0.07)", borderLeft: "3px solid var(--sd-green)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            These metrics form the foundation for evaluating every architectural trade-off ahead — starting with the <strong style={{ color: "#fff" }}>CAP Theorem</strong>, which formalizes exactly this tension between consistency and availability in distributed systems.
          </div>
        </div>

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>Quiz Review</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="How can a system have high throughput but poor latency?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            High throughput with poor latency is the hallmark of a system optimized for <strong style={{ color: "var(--sd-text)" }}>batch processing or deep pipelining</strong> rather than request-response responsiveness.
          </p>
          {[
            { title: "Massive Parallelism", body: "Even if every individual task takes 5 seconds (high latency), running 1,000 concurrently yields a throughput of 200 tasks/sec. Concurrency compensates for slow individual responses." },
            { title: "Request Batching", body: "Systems buffer individual requests into larger chunks to optimize I/O or network overhead. This maximizes total volume but introduces a deliberate wait for the first element in the batch." },
            { title: "Heavy Resource Utilization", body: "Processes queue waiting for CPU or database locks. The system completes all work (throughput intact) but individual requests sit in queues, extending round-trip time." },
            { title: "Deep Pipelining", body: "Architectures like MapReduce or ETL pipelines are throughput-oriented — they accept significant latency in exchange for the ability to process massive datasets in the background." },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Poor latency occurs when the system is <strong style={{ color: "var(--sd-teal)" }}>congested</strong> — processing at capacity while requests wait in buffers. The "pipes" are full so throughput is high, but the transit time for any specific request is sacrificed.
          </div>
        </PanelSection>

        <PanelSection title="Does adding more hardware always improve availability?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Horizontal scaling improves availability <strong style={{ color: "var(--sd-text)" }}>only if the architecture is fault-tolerant and stateless</strong>. Simply adding nodes creates a false sense of security.
          </p>
          {[
            { title: "Shared Bottlenecks", body: "If scaling is gated by a single unscaled resource — a primary database, a global lock, a single gateway — that resource is a SPOF. More app nodes just increase contention on it, potentially accelerating a system-wide crash." },
            { title: "State Management", body: "Nodes coordinating state introduce communication overhead and distributed consensus risks. More nodes = higher probability of network partitions or split-brain scenarios." },
            { title: "Complexity & Blast Radius", body: "Each additional node is a new potential failure point. A propagated configuration error at scale means a larger portion of infrastructure fails simultaneously." },
            { title: "Load Balancer Reliability", body: "If the load balancer is a single instance, scaling the backend is moot. Redundancy must exist at every layer — DNS round-robin, Anycast, or redundant LBs." },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Horizontal scaling provides <strong style={{ color: "var(--sd-teal)" }}>capacity</strong>, not necessarily <strong style={{ color: "var(--sd-teal)" }}>availability</strong>. True availability requires combining scaling with partitioning, redundancy, and isolation.
          </div>
        </PanelSection>

        <PanelSection title="Does 99.9% availability mean every user gets 99.9% uptime?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--sd-text)" }}>No.</strong> Availability metrics represent system-level uptime, not individual user experience.
          </p>
          {[
            { title: "Individual vs. Aggregate", body: "A user who only interacts with the system during the 0.1% downtime window experiences 0% availability. A user whose usage never overlaps with an outage experiences 100%. The reported figure is an aggregate." },
            { title: "Compounded Microservice Availability", body: "If a user's request touches five microservices each at 99.9%, the probability of full success is 0.999^5 ≈ 99.5%. Availability compounds multiplicatively across the request path." },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Always distinguish <strong style={{ color: "var(--sd-teal)" }}>Service Availability</strong> (infrastructure uptime) from <strong style={{ color: "var(--sd-teal)" }}>User-Perceived Availability</strong> (individual request success rate).
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
