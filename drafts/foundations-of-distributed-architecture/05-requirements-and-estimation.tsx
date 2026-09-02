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
    question: "What is the difference between functional and non-functional requirements?",
    answers: [
      "Functional requirements define what the system does (e.g., \"users can upload photos\"). Non-functional requirements (NFRs) define how the system performs — latency, throughput, availability.",
    ],
  },
  {
    question: "What are the three levers to focus on when establishing NFRs?",
    answers: [
      "Traffic patterns (read-heavy vs write-heavy), data retention (how much data, for how long), and availability targets (maximum acceptable downtime).",
    ],
  },
  {
    question: "What is the \"Rule of 86,400\", and why that number?",
    answers: [
      "There are 86,400 seconds in a day, so dividing total daily requests by 86,400 converts a daily volume into an average requests-per-second figure — the starting point for capacity planning.",
    ],
  },
  {
    question:
      "100M DAU perform 10 requests/day each. What's the average RPS, and why isn't that the number you design for?",
    answers: [
      "1B requests/day ÷ 86,400 ≈ 11,574 RPS average. You design for peak, not average — traffic is diurnal, so peak load can run 3-5x the average, meaning infrastructure should target roughly 35,000-58,000 RPS.",
    ],
    note: "The reading's example uses a ~3.5x peak factor to land on ~40,000 RPS.",
  },
  {
    question: "Why should raw data size never be treated as final storage size?",
    answers: [
      "Indexing, replication, and metadata add overhead — typically 20% to 50% on top of raw data size. Skipping this step causes storage and cost projections to be significantly underestimated.",
    ],
  },
  {
    question:
      "100M users each write one 50KB post per day. What's the annual storage growth, and what does that number imply?",
    answers: [
      "5TB/day → ~1.8PB/year. A single-node database cannot hold this. The magnitude alone tells you the design needs distributed storage and a partitioning strategy from day one.",
    ],
  },
  {
    question: "Why is bandwidth often the hidden bottleneck in a system design?",
    answers: [
      "Teams size CPU and storage but forget that response payloads must physically move across the network. At high RPS with even modest response sizes, required throughput can exceed what a single network link provides.",
    ],
  },
  {
    question:
      "At 40,000 RPS with 100KB average responses, you need ~4GB/s of bandwidth. A single 10Gbps link handles ~1.25GB/s. What does this tell you about the design?",
    answers: [
      "You'd need at least four saturated links just for this traffic, before inter-service overhead — a strong signal to introduce caching or edge delivery rather than scaling raw bandwidth linearly.",
    ],
  },
];

const nfrLevers = [
  {
    name: "Traffic Patterns",
    tag: "Shape",
    tagColor: "var(--sd-accent)",
    tagBg: "rgba(108,99,255,0.15)",
    body: "Is the load read-heavy, like a news feed serving far more views than posts, or write-heavy, like a logging or telemetry pipeline? This determines whether you optimize for caching and read replicas or for write throughput and ingestion buffering.",
  },
  {
    name: "Data Retention",
    tag: "Volume",
    tagColor: "var(--sd-teal)",
    tagBg: "rgba(62,207,207,0.12)",
    body: "How much data must be stored, and for how long? A chat app retaining messages forever has fundamentally different storage economics than one that purges after 30 days.",
  },
  {
    name: "Availability Targets",
    tag: "Uptime",
    tagColor: "var(--sd-green)",
    tagBg: "rgba(52,211,153,0.12)",
    body: "What is the maximum acceptable downtime? A target of 99.9% versus 99.99% changes your redundancy strategy, deployment process, and infrastructure cost by orders of magnitude.",
  },
];

const botePipeline = [
  { label: "DAU", value: "100,000,000" },
  { label: "Requests / user / day", value: "10" },
  { label: "Daily requests", value: "1,000,000,000" },
  { label: "÷ seconds/day", value: "86,400" },
  { label: "Average RPS", value: "≈ 11,574" },
];

const storagePipeline = [
  { label: "Daily active writers", value: "100,000,000" },
  { label: "Avg. record size", value: "50 KB" },
  { label: "Daily storage", value: "5 TB / day" },
  { label: "× 365 days", value: "×365" },
  { label: "Annual storage", value: "≈ 1.8 PB / year" },
];

export default function Lesson05() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="Design Requirements & Estimating Resource Needs"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 5 · Foundations
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Design Requirements &amp; Estimating Resource Needs
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          Turning vague product goals into concrete, quantifiable engineering constraints.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            System design begins with translating vague product goals into{" "}
            <strong style={{ color: "#fff" }}>numerical boundaries</strong>. You cannot design for &quot;high scale&quot; or &quot;low latency&quot; until those terms are defined as concrete targets — a specific RPS figure, a specific latency percentile, a specific number of nines.
          </p>
          <p>
            This lesson covers two things: how to split requirements into{" "}
            <span style={{ color: "var(--sd-teal)" }}>functional</span> and{" "}
            <span style={{ color: "var(--sd-teal)" }}>non-functional</span> buckets, and how to turn a handful of business projections into{" "}
            <strong style={{ color: "#fff" }}>Back-of-the-Envelope (BOTE)</strong> numbers for throughput, storage, and bandwidth — the numbers that tell you whether your architecture is even feasible.
          </p>
        </div>

        {/* Functional vs Non-Functional */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Defining Requirements
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Functional vs. Non-Functional</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Every requirement you gather falls into one of two buckets. Confusing the two is a common source of designs that satisfy the product spec but fail under real load.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              {
                label: "Functional",
                color: "var(--sd-accent)",
                headerBg: "rgba(108,99,255,0.1)",
                body: "Defines what the system does — the features and capabilities visible to the user or another service.",
                example: "\"Users can upload photos.\" \"Users can search for a driver nearby.\"",
              },
              {
                label: "Non-Functional (NFR)",
                color: "var(--sd-teal)",
                headerBg: "rgba(62,207,207,0.1)",
                body: "Defines how the system performs — the quality attributes that determine whether the functional behavior holds up under real-world conditions.",
                example: "\"Photo retrieval must occur within 200ms at the 99th percentile.\"",
              },
            ].map((l) => (
              <div key={l.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: l.headerBg, color: l.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {l.label}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65, marginBottom: 10 }}>{l.body}</p>
                  <div style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--sd-teal)" }}>Example:</strong> {l.example}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            When establishing NFRs, focus on three specific levers: <strong style={{ color: "#fff" }}>traffic patterns</strong>, <strong style={{ color: "#fff" }}>data retention</strong>, and <strong style={{ color: "#fff" }}>availability targets</strong>.
          </div>
        </div>

        {/* NFR Levers */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Three Levers
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, marginRight: 10, verticalAlign: "middle", background: "rgba(108,99,255,0.15)", color: "var(--sd-accent)" }}>
              NFRs
            </span>
            What to Interrogate First
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {nfrLevers.map((l) => (
              <div key={l.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  {l.name}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: l.tagBg, color: l.tagColor }}>
                    {l.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{l.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rule of 86,400 */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Back-of-the-Envelope
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>The Rule of 86,400</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              There are 86,400 seconds in a day. Divide total daily requests by that constant and you get{" "}
              <strong style={{ color: "#fff" }}>average requests per second</strong> — the starting point for every capacity estimate.
            </p>
          </div>

          {/* BOTE pipeline */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "24px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
              100M DAU × 10 requests/day
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
              {botePipeline.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ background: "var(--sd-surface2)", border: `1px solid ${i === botePipeline.length - 1 ? "var(--sd-accent)" : "var(--sd-border)"}`, borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 96 }}>
                    <div style={{ fontSize: 10, color: "var(--sd-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: i === botePipeline.length - 1 ? "var(--sd-accent)" : "var(--sd-text)" }}>{step.value}</div>
                  </div>
                  {i < botePipeline.length - 1 && (
                    <div style={{ fontSize: 16, color: "var(--sd-muted)", padding: "0 8px" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#fff" }}>Always design for peak load, not average.</strong> Diurnal traffic patterns commonly push peak to 3-5x the average — so the ~11,574 average RPS above should translate to provisioning for roughly{" "}
            <strong style={{ color: "var(--sd-amber)" }}>~40,000 RPS</strong> at the top of the curve.
          </div>
        </div>

        {/* Storage */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Back-of-the-Envelope
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Storage Capacity Projection</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Storage calculations rely on the size of a single record multiplied by the frequency of creation. If a user creates one 50KB post daily, the numbers compound fast.</p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "24px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
              100M users × 50KB post/day
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
              {storagePipeline.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ background: "var(--sd-surface2)", border: `1px solid ${i === storagePipeline.length - 1 ? "var(--sd-teal)" : "var(--sd-border)"}`, borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 96 }}>
                    <div style={{ fontSize: 10, color: "var(--sd-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: i === storagePipeline.length - 1 ? "var(--sd-teal)" : "var(--sd-text)" }}>{step.value}</div>
                  </div>
                  {i < storagePipeline.length - 1 && (
                    <div style={{ fontSize: 16, color: "var(--sd-muted)", padding: "0 8px" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(62,207,207,0.07)", borderLeft: "3px solid var(--sd-teal)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            This magnitude instantly informs the design.{" "}
            <strong style={{ color: "#fff" }}>~1.8PB of growth per year</strong> dictates that you cannot store everything on a single server — you will need a distributed storage strategy and a partitioning plan.
          </div>
        </div>

        {/* Overhead */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Trade-offs
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Raw Size Is Never Final Size</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              When estimating, you must account for overhead. Indexing, replication, and metadata add{" "}
              <strong style={{ color: "#fff" }}>20% to 50%</strong> on top of raw data size. A 1.8PB/year projection can realistically land closer to{" "}
              <strong style={{ color: "#fff" }}>2.2-2.7PB/year</strong> once these are factored in — and that gap is exactly the kind of number that changes a budget conversation.
            </p>
          </div>
        </div>

        {/* Flow diagram */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Putting It Together
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>From Product Goal to Architecture Decision</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {[
                { text: "Define Product Goal", color: "var(--sd-accent)" },
                { text: "Identify Functional Requirements", color: "var(--sd-accent)" },
                { text: "Establish NFRs — Latency, Availability, Throughput", color: "var(--sd-accent)" },
              ].map((step) => (
                <div key={step.text} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ background: "rgba(108,99,255,0.1)", border: `1px solid ${step.color}`, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: step.color, textAlign: "center" }}>
                    {step.text}
                  </div>
                  <div style={{ fontSize: 16, color: "var(--sd-muted)" }}>↓</div>
                </div>
              ))}

              {/* Branch: calculate */}
              <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)", textAlign: "center" }}>
                    Calculate Throughput
                    <div style={{ fontSize: 10, fontWeight: 400, color: "var(--sd-muted)", marginTop: 2 }}>Peak RPS</div>
                  </div>
                  <div style={{ fontSize: 16, color: "var(--sd-muted)" }}>↓</div>
                  <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "var(--sd-text)", textAlign: "center" }}>
                    Load &gt; single instance?
                  </div>
                  <div style={{ fontSize: 11, color: "var(--sd-amber)" }}>Yes ↓</div>
                  <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid var(--sd-green)", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, color: "var(--sd-green)", textAlign: "center" }}>
                    Plan Horizontal Scaling
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)", textAlign: "center" }}>
                    Calculate Storage
                    <div style={{ fontSize: 10, fontWeight: 400, color: "var(--sd-muted)", marginTop: 2 }}>Growth Rate</div>
                  </div>
                  <div style={{ fontSize: 16, color: "var(--sd-muted)" }}>↓</div>
                  <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "var(--sd-text)", textAlign: "center" }}>
                    Data &gt; single disk/node?
                  </div>
                  <div style={{ fontSize: 11, color: "var(--sd-amber)" }}>Yes ↓</div>
                  <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid var(--sd-green)", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, color: "var(--sd-green)", textAlign: "center" }}>
                    Plan Partitioning Strategy
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Every design decision downstream — <span style={{ color: "var(--sd-teal)" }}>horizontal scaling</span>, <span style={{ color: "var(--sd-teal)" }}>partitioning</span>, <span style={{ color: "var(--sd-teal)" }}>caching</span> — traces back to whether these BOTE numbers exceed what a single instance or single node can handle.
          </div>
        </div>

        {/* Bandwidth */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Back-of-the-Envelope
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Bandwidth: The Hidden Bottleneck</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Beyond raw CPU and storage, bandwidth is often overlooked. Response payloads must physically move across the network, and that cost scales linearly with both request rate and payload size.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--sd-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Required bandwidth</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--sd-amber)", marginBottom: 4 }}>40,000 RPS × 100KB</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--sd-text)" }}>≈ 4 GB/s</div>
            </div>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--sd-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>10Gbps link capacity</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--sd-teal)", marginBottom: 4 }}>10 Gbps</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--sd-text)" }}>≈ 1.25 GB/s</div>
            </div>
          </div>

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            At 4GB/s of required throughput, you&rsquo;d need at least{" "}
            <strong style={{ color: "#fff" }}>four 10Gbps links saturated at 80%</strong> just to serve this traffic — before accounting for inter-service communication. When these numbers exceed your constraints, the fix is architectural: push toward{" "}
            <span style={{ color: "var(--sd-teal)" }}>caching</span> and{" "}
            <span style={{ color: "var(--sd-teal)" }}>edge computing</span> rather than scaling raw network capacity linearly.
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Summary
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Numbers Define the Boundaries</h2>

          <div style={{ background: "rgba(52,211,153,0.07)", borderLeft: "3px solid var(--sd-green)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Resource estimation transforms vague ambitions into architectural requirements. By calculating peak RPS, storage volume, and bandwidth consumption, you define the physical boundaries your system must overcome — boundaries that will directly guide your decisions on{" "}
            <strong style={{ color: "#fff" }}>data partitioning</strong> and{" "}
            <strong style={{ color: "#fff" }}>communication protocols</strong> in the lessons ahead.
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
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          BOTE math gives you a starting order of magnitude, not a guarantee. It tells you whether an architecture is plausible before you spend months building it.
        </p>

        <PanelSection title="Why is the peak-to-average ratio (3-5x) not a fixed constant?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The peak factor depends entirely on <strong style={{ color: "var(--sd-text)" }}>how concentrated your traffic actually is</strong> — treating 3-5x as a universal rule is itself an estimate that needs validating against real usage.
          </p>
          {[
            {
              title: "Diurnal Consumer Apps",
              body: "A social app used mostly in the evening across a single timezone can see peaks well above 5x the daily average — traffic is compressed into a few hours rather than spread evenly.",
            },
            {
              title: "Global, Follow-the-Sun Traffic",
              body: "A service with users spread across every timezone sees a much flatter curve — peak might only be 1.5-2x average, because someone's evening is always happening somewhere.",
            },
            {
              title: "Event-Driven Spikes",
              body: "Flash sales, viral moments, or scheduled events (a product launch, a live sports final) can produce peaks 10-50x average — far beyond what a diurnal multiplier captures. These require dedicated spike-handling strategies, not just a bigger baseline.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Use 3-5x as a default assumption, not a law.</strong> Real traffic graphs from analytics tooling should always override a rule-of-thumb multiplier once they&rsquo;re available.
          </div>
        </PanelSection>

        <PanelSection title="How do BOTE estimates relate to actual load testing?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            BOTE numbers and load tests answer <strong style={{ color: "var(--sd-text)" }}>different questions at different stages</strong> — confusing them leads either to over-engineering too early or under-provisioning too late.
          </p>
          {[
            {
              title: "BOTE: Feasibility, Pre-Build",
              body: "Answers \"is this architecture even in the right ballpark?\" before a line of infrastructure code is written. Cheap, fast, directional — meant to rule out designs that are obviously wrong by orders of magnitude.",
            },
            {
              title: "Load Testing: Validation, Pre-Launch",
              body: "Answers \"does the actual system, under actual traffic shapes, hit the actual latency and error targets?\" Expensive and slow relative to BOTE math, but it's the only way to catch real bottlenecks — connection pool exhaustion, GC pauses, lock contention — that back-of-envelope math can't model.",
            },
            {
              title: "The Gap Between Them",
              body: "A BOTE estimate assumes linear, uniform behavior. Real systems have non-linear failure modes near saturation. Treat BOTE numbers as the floor for your load test targets, not as a substitute for running the test.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>BOTE tells you what to build; load testing tells you if it works.</strong> Skipping straight from BOTE math to production is how &quot;the numbers said we&rsquo;d be fine&quot; outages happen.
          </div>
        </PanelSection>

        <PanelSection title="How does replication interact with the storage overhead calculation?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The 20-50% overhead figure covers indexing and metadata on a single copy of the data. Replication is a{" "}
            <strong style={{ color: "var(--sd-text)" }}>separate multiplier stacked on top</strong>, and it&rsquo;s easy to forget when sizing a cluster.
          </p>
          {[
            {
              title: "Replication Factor Multiplies the Whole Total",
              body: "A common replication factor of 3 (standard in systems like Cassandra or HDFS for durability) means your ~2.2-2.7PB/year figure — already inclusive of indexing overhead — becomes ~6.6-8.1PB/year of actual disk footprint across the cluster.",
            },
            {
              title: "Why Replicate at All",
              body: "Durability (surviving node loss without data loss) and availability (serving reads from a replica while the primary is down) are the two reasons. Both are non-negotiable at the multi-PB scale this lesson's example lands on.",
            },
            {
              title: "Sizing Order of Operations",
              body: "Raw size → add indexing/metadata overhead (20-50%) → multiply by replication factor. Doing this in the wrong order, or forgetting a step, is the single most common cause of a storage budget being off by 3-5x.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Replication factor and overhead percentage compound, they don&rsquo;t add.</strong> Always multiply them in sequence against the raw figure.
          </div>
        </PanelSection>

        <PanelSection title="When do BOTE numbers say 'don't build this yet'?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The real value of resource estimation is catching infeasible designs{" "}
            <strong style={{ color: "var(--sd-text)" }}>before</strong> engineering time is spent on them.
          </p>
          {[
            {
              title: "Bandwidth Exceeds Realistic Link Capacity",
              body: "If your projected bandwidth requires dozens of saturated links with no caching layer in the design, that's a signal the architecture needs a CDN or edge cache before implementation starts — not after a production incident.",
            },
            {
              title: "Storage Growth Outpaces Any Single Vendor's Managed Offering",
              body: "Multi-petabyte annual growth rules out naive use of a single managed relational database and points toward object storage, sharding, or a purpose-built distributed store from the outset.",
            },
            {
              title: "Peak RPS Implies an Unrealistic Fleet Size",
              body: "If peak load requires thousands of stateful application servers because each one can only hold a few hundred connections, that's a sign the architecture needs to move toward a different connection model, not just \"add more servers.\"",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>The magnitude of the number, not its precision, is the signal.</strong> BOTE math doesn&rsquo;t need to be exact — it needs to be right within an order of magnitude to steer the architecture correctly.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        {...getLessonNav("05-requirements-and-estimation")}
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
