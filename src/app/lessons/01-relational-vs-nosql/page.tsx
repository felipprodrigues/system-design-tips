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
    question: "What mathematical foundation is the relational model built on, and what does it prioritize?",
    answers: [
      "Set theory and the relational model — it prioritizes data integrity and consistency through strict schema enforcement.",
    ],
  },
  {
    question: "What does \"NoSQL\" actually stand for, and what's the core trade-off it makes?",
    answers: [
      "\"Not Only SQL.\" It trades strict, rigid consistency for horizontal scale, flexible data structures, and read/write performance optimized for specific access patterns.",
    ],
  },
  {
    question: "In the banking transfer example, what guarantees a debit and credit either both succeed or both fail?",
    answers: [
      "A database transaction (BEGIN…COMMIT) under ACID compliance — if the system crashes mid-transaction, the engine uses the transaction log to roll back the incomplete change.",
    ],
  },
  {
    question: "Why does a rigid, predefined schema make sense for a banking application specifically?",
    answers: [
      "The primary requirement is avoiding anomalies and guaranteeing transactional integrity — an account balance can never be left in an invalid or partially-updated state.",
    ],
  },
  {
    question:
      "Why can a NoSQL document store add a field like ai_assistant_enabled without downtime, while an RDBMS often can't?",
    answers: [
      "A document store doesn't enforce one fixed schema across all rows, so new fields can just appear on new documents. An RDBMS needs an ALTER TABLE, which can lock a billion-row table for hours.",
    ],
  },
  {
    question: "According to the decision matrix, what should push you toward horizontal scale-out instead of vertical scale-up?",
    answers: [
      "High write throughput or the need for massive horizontal scale — situations where a single, vertically-scaled instance becomes the bottleneck.",
    ],
  },
  {
    question: "What are the three questions the decision flow asks, in order, to choose between relational and NoSQL?",
    answers: [
      "(1) Are relationships complex and critical? (2) Do you need high write throughput or massive horizontal scale? (3) Is the schema highly volatile? A \"yes\" to the first favors relational; a \"yes\" to either of the last two favors NoSQL.",
    ],
  },
  {
    question: "Why is the choice between relational and NoSQL \"rarely about which technology is better\"?",
    answers: [
      "Because the right choice depends on which constraints you need to satisfy — data integrity and complex relationships versus schema flexibility and horizontal scale — not on one technology being objectively superior.",
    ],
  },
];

const matrixRows = [
  { requirement: "Data Integrity", relational: "High (Financial / Auth)", nosql: "Eventual Consistency" },
  { requirement: "Schema", relational: "Rigid / Structured", nosql: "Flexible / Dynamic" },
  { requirement: "Relationships", relational: "Complex Joins", nosql: "Denormalized / Embedded" },
  { requirement: "Scale", relational: "Vertical (Scale-up)", nosql: "Horizontal (Scale-out)" },
];

const decisionSteps = [
  {
    question: "Are relationships complex and critical?",
    yesOutcome: "Choose Relational Database",
    yesColor: "var(--sd-accent)",
    yesBg: "rgba(76, 110, 245,0.12)",
  },
  {
    question: "Do you need high write throughput or massive horizontal scale?",
    yesOutcome: "Choose NoSQL",
    yesColor: "var(--sd-teal)",
    yesBg: "rgba(127, 147, 242,0.12)",
  },
  {
    question: "Is the schema highly volatile?",
    yesOutcome: "Choose NoSQL",
    yesColor: "var(--sd-teal)",
    yesBg: "rgba(127, 147, 242,0.12)",
  },
];

const exercises = [
  {
    number: "01",
    panelId: "exercise-cart",
    title: "The Shopping Cart System",
    prompt:
      "Would you store the \"current cart\" contents in a relational database or a key-value store? Justify your choice based on the latency requirements for adding/removing items versus the need for permanent order records.",
    hint: "Think about which stage of the flow needs sub-millisecond read/write latency, and which stage needs an unbreakable, auditable record.",
  },
  {
    number: "02",
    panelId: "exercise-comment-thread",
    title: "The Comment Thread Problem",
    prompt:
      "A social media platform needs to store user comments. Why might you choose a document store over a relational table if you're optimizing for retrieving a full thread in a single query?",
    hint: "Consider how many joins a relational schema would need to reconstruct a nested thread, versus what a single document read costs.",
  },
];

export default function Lesson01Module02() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePanelSection, setActivePanelSection] = useState<string | null>(null);

  function openPanelSection(id: string) {
    setActivePanelSection(id);
    setPanelOpen(true);
  }

  return (
    <>
      <Breadcrumb
        section="Data Storage and Management Strategies"
        lesson="Selecting Relational vs NoSQL Database Models"
        action={<DeepDiveButton onClick={() => { setActivePanelSection(null); setPanelOpen(true); }} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 1 · Data Storage and Management Strategies
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Selecting Relational vs NoSQL Database Models
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          Two philosophies for storing data — integrity-first structure versus flexible, horizontally scalable performance.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            Relational databases (RDBMS) are built on the mathematical foundation of{" "}
            <strong style={{ color: "var(--sd-text)" }}>set theory and the relational model</strong>, prioritizing data integrity and consistency through strict schema enforcement.
          </p>
          <p>
            NoSQL databases (<span style={{ color: "var(--sd-teal)" }}>Not Only SQL</span>) trade off that rigid consistency for{" "}
            <strong style={{ color: "var(--sd-text)" }}>horizontal scale, flexible data structures</strong>, and optimized read/write performance for specific data access patterns.
          </p>
        </div>

        {/* Relational Model */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Model 01
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", marginRight: 10, verticalAlign: "middle" }}>
              Relational
            </span>
            Integrity First
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Relational databases like PostgreSQL or MySQL rely on a{" "}
              <strong style={{ color: "var(--sd-text)" }}>predefined schema</strong>. Every row in a table must adhere to the same structure, and relationships between tables are enforced via{" "}
              <strong style={{ color: "var(--sd-text)" }}>Foreign Keys</strong>. This structure is ideal for transactional integrity ({" "}
              <button
                type="button"
                onClick={() => openPanelSection("acid-compliance")}
                style={{
                  color: "var(--sd-teal)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                ACID compliance
              </button>
              ) where you cannot afford to lose data or leave it in an invalid state.
            </p>
            <p style={{ marginTop: 10 }}>
              Consider a banking application where you move money between two accounts. You need to ensure that the debit from Account A and the credit to Account B both succeed, or both fail.
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16, overflowX: "auto", fontSize: 12.5, lineHeight: 1.7 }}>
            <code style={{ color: "var(--sd-text)" }}>
              <span style={{ color: "var(--sd-accent)" }}>BEGIN TRANSACTION</span>;{"\n"}
              <span style={{ color: "var(--sd-teal)" }}>UPDATE</span> accounts <span style={{ color: "var(--sd-teal)" }}>SET</span> balance = balance - 100 <span style={{ color: "var(--sd-teal)" }}>WHERE</span> id = 1;{"\n"}
              <span style={{ color: "var(--sd-teal)" }}>UPDATE</span> accounts <span style={{ color: "var(--sd-teal)" }}>SET</span> balance = balance + 100 <span style={{ color: "var(--sd-teal)" }}>WHERE</span> id = 2;{"\n"}
              <span style={{ color: "var(--sd-accent)" }}>COMMIT</span>;
            </code>
          </pre>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            If the system crashes halfway through, the database engine uses the{" "}
            <strong style={{ color: "var(--sd-text)" }}>transaction log</strong> to roll back the changes, ensuring no money vanishes into thin air.
          </div>

          <div style={{ background: "rgba(157, 176, 247,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Use RDBMS when your data has <strong style={{ color: "var(--sd-text)" }}>clear, predictable relationships</strong> and your primary requirement is avoiding anomalies.
          </div>
        </div>

        {/* NoSQL Model */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Model 02
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(127, 147, 242,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>
              NoSQL
            </span>
            Scaling and Performance
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              NoSQL databases — such as MongoDB (Document), Cassandra (Wide-Column), or DynamoDB (Key-Value) — are designed for scenarios where the &quot;one size fits all&quot; schema of an RDBMS becomes a bottleneck. By relaxing the requirement for complex joins and strict cross-table constraints, these systems can distribute data across many nodes more easily.
            </p>
            <p style={{ marginTop: 10 }}>
              If you are building a system that tracks user session data or real-time sensor readings, your schema might change frequently as new features are added. A document store allows you to store a flexible JSON object:
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16, overflowX: "auto", fontSize: 12.5, lineHeight: 1.7 }}>
            <code style={{ color: "var(--sd-text)" }}>
              <span style={{ color: "var(--sd-muted)" }}>{"// User Profile Document"}</span>{"\n"}
              {"{\n"}
              {"  "}<span style={{ color: "var(--sd-teal)" }}>&quot;user_id&quot;</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;u123&quot;</span>,{"\n"}
              {"  "}<span style={{ color: "var(--sd-teal)" }}>&quot;preferences&quot;</span>: {"{\n"}
              {"    "}<span style={{ color: "var(--sd-teal)" }}>&quot;theme&quot;</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;dark&quot;</span>,{"\n"}
              {"    "}<span style={{ color: "var(--sd-teal)" }}>&quot;notifications&quot;</span>: [<span style={{ color: "var(--sd-amber)" }}>&quot;email&quot;</span>, <span style={{ color: "var(--sd-amber)" }}>&quot;push&quot;</span>]{"\n"}
              {"  },\n"}
              {"  "}<span style={{ color: "var(--sd-teal)" }}>&quot;last_login&quot;</span>: <span style={{ color: "var(--sd-amber)" }}>&quot;2023-10-27T10:00:00Z&quot;</span>{"\n"}
              {"}"}
            </code>
          </pre>

          <div style={{ background: "rgba(127, 147, 242,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Because the database doesn&rsquo;t care about the internal structure of that document, you can add new fields (like{" "}
            <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12, color: "var(--sd-teal)" }}>ai_assistant_enabled</code>) without executing an{" "}
            <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 12, color: "var(--sd-teal)" }}>ALTER TABLE</code>{" "}
            command that locks your database for hours on a billion-row table.
          </div>
        </div>

        {/* Decision Matrix */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Reference
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Deciding Between Models</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>The choice is rarely about &quot;which technology is better&quot; and always about &quot;what constraints are you trying to satisfy.&quot;</p>
          </div>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Requirement", "Prefer Relational (RDBMS)", "Prefer NoSQL"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row, i) => (
                  <tr key={row.requirement}>
                    <td style={{ padding: "11px 14px", borderBottom: i < matrixRows.length - 1 ? "1px solid var(--sd-border)" : "none", fontWeight: 600, color: "var(--sd-text)" }}>{row.requirement}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < matrixRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-accent)" }}>{row.relational}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < matrixRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-teal)" }}>{row.nosql}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision Flow */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Putting It Together
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Evaluate Your Storage Needs</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", maxWidth: 380, background: "rgba(76, 110, 245,0.1)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 20px", fontSize: 12.5, fontWeight: 600, color: "var(--sd-accent)", textAlign: "center" }}>
                Start: Define Data Access Patterns
              </div>

              {decisionSteps.map((step, i) => {
                const isLast = i === decisionSteps.length - 1;
                return (
                  <div key={step.question} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <div style={{ width: 1, height: 18, background: "var(--sd-border)" }} />

                    <div style={{ width: "100%", maxWidth: 380, background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
                        Question {i + 1}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sd-text)", lineHeight: 1.5, marginBottom: 12 }}>
                        {step.question}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: step.yesBg, border: `1px solid ${step.yesColor}`, borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: step.yesColor, marginBottom: 2 }}>Yes →</div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: step.yesColor }}>{step.yesOutcome}</div>
                        </div>
                        <div style={{ background: isLast ? "rgba(76, 110, 245,0.1)" : "var(--sd-bg)", border: `1px solid ${isLast ? "var(--sd-accent)" : "var(--sd-border)"}`, borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--sd-muted)", marginBottom: 2 }}>No →</div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: isLast ? "var(--sd-accent)" : "var(--sd-muted)" }}>
                            {isLast ? "Choose Relational Database" : "Next question"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            When data grows beyond a single instance, your choice of database dictates how you handle future complexity. In upcoming modules, we&rsquo;ll examine how to apply{" "}
            <span style={{ color: "var(--sd-teal)" }}>partitioning</span> and{" "}
            <span style={{ color: "var(--sd-teal)" }}>sharding</span> to these models to manage massive datasets.
          </div>
        </div>

        {/* Exercises */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Practice
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Exercises</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {exercises.map((ex) => (
              <button
                key={ex.number}
                type="button"
                onClick={() => openPanelSection(ex.panelId)}
                className="exerciseCard"
                style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "18px 20px", textAlign: "left", cursor: "pointer", width: "100%", font: "inherit", color: "inherit" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)" }}>
                    Exercise {ex.number}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)" }}>{ex.title}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7, marginBottom: 10 }}>{ex.prompt}</p>
                <div style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.6, marginBottom: 10 }}>
                  <strong style={{ color: "var(--sd-teal)" }}>Think about:</strong> {ex.hint}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--sd-accent)" }}>
                  See the walkthrough <span aria-hidden>→</span>
                </div>
              </button>
            ))}
          </div>
          <style jsx>{`
            .exerciseCard {
              transition: border-color 0.15s ease, transform 0.15s ease;
            }
            .exerciseCard:hover {
              border-color: var(--sd-accent);
              transform: translateY(-1px);
            }
          `}</style>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Summary
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Structure vs. Flexibility</h2>

          <div style={{ background: "rgba(157, 176, 247,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Relational databases prioritize the correctness of complex data relationships, while NoSQL databases prioritize performance and flexibility for specific, high-velocity use cases. Choosing between them requires a clear understanding of your read/write patterns and the degree of consistency your system demands. We&rsquo;ll build on this by exploring how to{" "}
            <strong style={{ color: "var(--sd-text)" }}>distribute these datasets effectively</strong> in the next lesson.
          </div>
        </div>

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>
            Quiz Review
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setActivePanelSection(null); }} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          The trade-offs in this lesson rarely have one correct answer. Here&rsquo;s a deeper walkthrough of the trickier ones.
        </p>

        <PanelSection
          id="acid-compliance"
          activeId={activePanelSection}
          title="What does ACID compliance actually guarantee?"
        >
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            ACID is four separate guarantees a relational transaction makes, all at once. Each one closes off a specific way the banking transfer above could go wrong.
          </p>
          {[
            {
              title: "Atomicity — all or nothing",
              body: "The debit and the credit are treated as one indivisible unit. If the credit fails after the debit already succeeded, the entire transaction is rolled back as if neither statement ever ran — there's no state where the money left Account A but never reached Account B.",
            },
            {
              title: "Consistency — valid state to valid state",
              body: "A transaction can only move the database from one state that satisfies every constraint (foreign keys, uniqueness, CHECK constraints) to another. A transaction that would leave a balance negative when a CHECK constraint forbids it is rejected outright, not partially applied.",
            },
            {
              title: "Isolation — concurrent transactions don't see each other's half-finished work",
              body: "If two transfers touch Account A at the same time, each one behaves as if it ran alone — one can't read the other's uncommitted balance change. Databases expose this as tunable isolation levels (Read Committed, Repeatable Read, Serializable), trading strictness for concurrency throughput.",
            },
            {
              title: "Durability — once committed, it survives a crash",
              body: "The instant COMMIT returns, the change is guaranteed to persist even if the server loses power a millisecond later. This is what the write-ahead transaction log is for: the change is flushed to disk before the engine acknowledges the commit.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>ACID is what makes the BEGIN…COMMIT block above trustworthy.</strong> Drop any one of the four guarantees and the transfer example stops being safe — most NoSQL systems deliberately relax one or more of them to buy back horizontal scale.
          </div>
        </PanelSection>

        <PanelSection
          id="exercise-cart"
          activeId={activePanelSection}
          title="Should the shopping cart live in a relational database or a key-value store?"
        >
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Most production e-commerce systems answer this by{" "}
            <strong style={{ color: "var(--sd-text)" }}>splitting the lifecycle in two</strong>, rather than picking one store for the whole flow.
          </p>
          {[
            {
              title: "The Active Cart: Key-Value Store",
              body: "Adding and removing items happens constantly, needs sub-millisecond latency, and doesn't need cross-item transactional guarantees. A key-value store (Redis, DynamoDB) keyed by user or session ID is a perfect fit — each write is a single, fast, isolated operation.",
            },
            {
              title: "The Completed Order: Relational Database",
              body: "The moment checkout happens, the requirements flip: you now need a permanent, auditable record — inventory must be decremented, payment must be charged, and the order confirmed, all consistently. That's exactly the ACID guarantee a relational database provides.",
            },
            {
              title: "The General Pattern",
              body: "Ephemeral, high-frequency, low-stakes state → fast key-value store. Permanent, low-frequency, high-stakes state → relational database. This split, using different databases for different parts of one system, is called polyglot persistence.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>The cart and the order are different data, with different guarantees</strong> — even though they look like &quot;the same feature&quot; from a product perspective.
          </div>
        </PanelSection>

        <PanelSection
          id="exercise-comment-thread"
          activeId={activePanelSection}
          title="Why does a document store win for retrieving a full comment thread?"
        >
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            The answer comes down to{" "}
            <strong style={{ color: "var(--sd-text)" }}>how many round-trips it takes to reconstruct the shape you&rsquo;re actually going to render</strong>.
          </p>
          {[
            {
              title: "The Relational Approach",
              body: "A normalized comments table stores each reply as a row with a parent_comment_id foreign key. Rendering a full nested thread means a recursive query or multiple joins to walk from the root comment down through every reply, and every reply-to-a-reply.",
            },
            {
              title: "The Document Approach",
              body: "A document store can embed the entire thread — root comment plus nested replies — as one nested JSON structure under a single thread_id. Fetching the thread is one read of one document, with the nesting already shaped exactly how the UI will render it.",
            },
            {
              title: "The Trade-off You're Accepting",
              body: "Embedding makes reads cheap but makes updates to a single deeply-nested reply more awkward, and duplicates data if the same comment needs to appear in more than one context. It's a bet that reads (viewing threads) vastly outnumber writes (posting a reply) — usually true for social platforms.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Model data around how it&rsquo;s read, not just how it&rsquo;s created.</strong> The document store isn&rsquo;t &quot;better&quot; here — it&rsquo;s shaped to match the access pattern.
          </div>
        </PanelSection>

        <PanelSection title={'What does "eventual consistency" actually cost you in practice?'}>
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            It&rsquo;s not free flexibility — it&rsquo;s a real, user-visible trade-off, and it&rsquo;s the same tension formalized by the{" "}
            <strong style={{ color: "var(--sd-text)" }}>CAP theorem</strong> from earlier in this course.
          </p>
          {[
            {
              title: "Stale Reads",
              body: "A write to one replica may not have propagated to the replica serving your next read. A user might update their profile picture and, for a brief window, still see the old one on a different device.",
            },
            {
              title: "Conflicting Writes",
              body: "Two clients writing to the same record on different replicas simultaneously can produce conflicting versions that the database must reconcile — often via last-write-wins or application-level merge logic, both of which can silently discard data.",
            },
            {
              title: "Where It's an Acceptable Trade",
              body: "Session data, view counts, activity feeds — cases where a slightly stale read causes no real harm. Where it's not acceptable: account balances, inventory counts, anything with a financial or safety consequence.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Eventual consistency shifts risk from the database to your application code.</strong> Someone still has to handle the stale read or the write conflict — it just isn&rsquo;t the database anymore.
          </div>
        </PanelSection>

        <PanelSection title="If NoSQL scales better, why doesn't everyone just use it for everything?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Because scale is only one axis. Relational databases give up scale-out simplicity in exchange for guarantees that{" "}
            <strong style={{ color: "var(--sd-text)" }}>most NoSQL systems can&rsquo;t cheaply replicate</strong>.
          </p>
          {[
            {
              title: "Multi-Record Transactions Are Hard",
              body: "The banking transfer example — debit one account, credit another, atomically — is trivial in an RDBMS and often awkward or unsupported across documents/partitions in a NoSQL store. Some now offer limited multi-document transactions, but usually with performance caveats.",
            },
            {
              title: "You Lose Ad-Hoc Joins",
              body: "Relational databases let you ask new questions of your data with a JOIN you didn't plan for. NoSQL access patterns are usually designed in advance around the queries you know you'll run — a new query shape can mean redesigning your data model.",
            },
            {
              title: "Most Real Systems Are Polyglot",
              body: "A typical production architecture uses an RDBMS for orders/billing/auth, a document store for flexible content, a key-value store for sessions/carts, and a wide-column store for time-series or logs — each chosen for the access pattern it serves, not as a single default.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>&quot;Scales better&quot; is not the same as &quot;better.&quot;</strong> It&rsquo;s better at the specific thing it optimizes for, at the cost of the thing an RDBMS optimizes for.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        lessonNumber={1}
        totalLessons={6}
        prevHref="/lessons/05-requirements-and-estimation"
        nextHref="/lessons/02-database-sharding-partitioning"
        sectionTitle="Data Storage and Management Strategies"
      />
    </>
  );
}
