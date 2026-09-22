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
    question: "A candidate says 'we'll use NoSQL because it's more scalable.' What follow-up question exposes whether they actually understand the trade-off?",
    answers: ["Ask what access pattern the data has: does the system need to join this data against other entities, and does it need strict cross-record consistency? If the answer is yes to either, NoSQL's scalability advantage may come at the cost of pushing hard consistency and relational logic into the application layer, which can be a worse trade than a well-sharded relational database."],
  },
  {
    question: "Why might a system use both a relational database and a NoSQL store together?",
    answers: ["Because different parts of the system have different natural access patterns. Core transactional data like orders or account balances benefits from ACID guarantees and JOINs, so it fits relational. A high-volume, simple-lookup use case like session storage or a real-time activity feed benefits from a NoSQL store's horizontal scalability and flexible schema. Using one database per use case (polyglot persistence) is often better than forcing one database to serve both well."],
  },
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


const terms = [
  { title: "ACID", def: "Atomicity, Consistency, Isolation, Durability, the four guarantees a relational transaction typically provides, ensuring data stays correct even under concurrent access or a crash." },
  { title: "Schema", def: "The defined structure (tables, columns, types, relationships) that data must conform to, strictly enforced in relational databases and loosely enforced or unenforced in most NoSQL databases." },
  { title: "JOIN", def: "A relational query operation that combines rows from two or more tables based on a related column, the mechanism that makes normalized, non-duplicated data practical to query." },
  { title: "Document store", def: "A NoSQL database that stores data as flexible, JSON-like documents rather than fixed rows, allowing different records in the same collection to have different fields." },
  { title: "Polyglot persistence", def: "Using multiple different databases within one system, each chosen for the access pattern it fits best, instead of forcing every use case into a single database." },
];

const seenInTheWild = [
  "Banks and payment processors like Stripe run their core ledger on relational databases (typically PostgreSQL or a similar system) specifically because ACID guarantees are non-negotiable when money is involved.",
  "Amazon built DynamoDB, a key-value/document NoSQL store, to handle its shopping cart and product catalog at a scale where relational sharding became a bigger operational burden than giving up cross-table JOINs.",
  "Facebook uses a graph-shaped data model (originally TAO, built on top of MySQL) because the social graph, who's friends with whom, is naturally a traversal problem that graph-style access patterns fit better than deeply normalized relational tables.",
  "Discord migrated parts of its message storage to Cassandra, a wide-column store, specifically to handle enormous write volume across billions of messages that would have required extensive sharding to sustain on a single relational cluster.",
];

const keyPoints = [
  "SQL means fixed schema, strong relational guarantees (ACID), and native support for JOINs across tables.",
  "NoSQL is an umbrella term covering document, key-value, wide-column, and graph databases, each with a different natural shape and access pattern.",
  "NoSQL's schema flexibility moves consistency responsibility from the database to the application, it doesn't remove the need for structure.",
  "NoSQL databases are usually built for horizontal scale from the start, which is the real reason they often win at very high write volume, not raw per-query speed.",
  "The right choice depends on the access pattern: relational data with strict consistency needs fits SQL, high-volume flexible-shape data with simple access patterns often fits NoSQL better.",
  "Polyglot persistence, using different databases for different parts of one system, is normal at real scale, not a sign of indecision.",
];

const commonMistakes = [
  "Choosing NoSQL purely because it sounds more scalable, without checking whether the actual access pattern needs relational JOINs and strict consistency.",
  "Assuming a flexible schema means no schema, when in practice the application still needs a consistent shape, it's just unenforced by the database.",
  "Believing relational databases can't scale, when in reality read replicas, connection pooling, and even sharding can take a well-designed relational system very far before it becomes the bottleneck.",
  "Using a single NoSQL database for everything in a system, including data that's deeply relational, instead of considering polyglot persistence for the parts that genuinely need different guarantees.",
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
  const nav = getLessonNav("01-relational-vs-nosql");
  const [activePanelSection, setActivePanelSection] = useState<string | null>(null);

  function openPanelSection(id: string) {
    setActivePanelSection(id);
    setPanelOpen(true);
  }

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="Selecting Relational vs NoSQL Database Models"
        action={<DeepDiveButton onClick={() => { setActivePanelSection(null); setPanelOpen(true); }} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">
          Selecting Relational vs NoSQL Database Models
        </h1>
        <p className="sd-lede">
          Two philosophies for storing data — integrity-first structure versus flexible, horizontally scalable performance.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Big Idea
          </p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              SQL and NoSQL aren&rsquo;t &lsquo;old vs new&rsquo; or &lsquo;slow vs fast&rsquo;, they&rsquo;re different bets about which is more expensive to give up: <strong className="sd-strong">strict structure and cross-table consistency</strong>, or <strong className="sd-strong">flexible schema and effortless horizontal scale</strong>.
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            Relational databases (RDBMS) are built on the mathematical foundation of{" "}
            <strong className="sd-strong">set theory and the relational model</strong>, prioritizing data integrity and consistency through strict schema enforcement.
          </p>
          <p>
            NoSQL databases (<span className="sd-hl">Not Only SQL</span>) trade off that rigid consistency for{" "}
            <strong className="sd-strong">horizontal scale, flexible data structures</strong>, and optimized read/write performance for specific data access patterns.
          </p>
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Think Of It Like
          </p>
          <h2 className="sd-h2">A Filing Cabinet Or A Shelf Of Boxes</h2>

          <div className="sd-prose">
            <p>
              A <strong className="sd-strong">relational database</strong> is like a well-organized filing cabinet with strict labeled folders, every document has to fit a defined form, but you can cross-reference any folder against any other instantly and trust the filing is internally consistent.
            </p>
            <p style={{ marginTop: 12 }}>
              A <strong className="sd-strong">NoSQL database</strong> is more like a set of labeled boxes where each box can hold whatever shape of thing makes sense for what&rsquo;s in it, faster to just toss something in without redesigning the whole cabinet, but you give up the guarantee that everything follows one strict, cross-checkable format.
            </p>
          </div>
        </div>

        {/* Relational Model */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Model 01
          </p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", marginRight: 10, verticalAlign: "middle" }}>
              Relational
            </span>
            Integrity First
          </h2>

          <div className="sd-prose">
            <p>
              Relational databases like PostgreSQL or MySQL rely on a{" "}
              <strong className="sd-strong">predefined schema</strong>. Every row in a table must adhere to the same structure, and relationships between tables are enforced via{" "}
              <strong className="sd-strong">Foreign Keys</strong>. This structure is ideal for transactional integrity ({" "}
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
            <code className="sd-strong">
              <span className="sd-hl-accent">BEGIN TRANSACTION</span>;{"\n"}
              <span className="sd-hl">UPDATE</span> accounts <span className="sd-hl">SET</span> balance = balance - 100 <span className="sd-hl">WHERE</span> id = 1;{"\n"}
              <span className="sd-hl">UPDATE</span> accounts <span className="sd-hl">SET</span> balance = balance + 100 <span className="sd-hl">WHERE</span> id = 2;{"\n"}
              <span className="sd-hl-accent">COMMIT</span>;
            </code>
          </pre>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            If the system crashes halfway through, the database engine uses the{" "}
            <strong className="sd-strong">transaction log</strong> to roll back the changes, ensuring no money vanishes into thin air.
          </div>

          <div className="sd-callout sd-callout-green">
            Use RDBMS when your data has <strong className="sd-strong">clear, predictable relationships</strong> and your primary requirement is avoiding anomalies.
          </div>
        </div>

        {/* NoSQL Model */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Model 02
          </p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, background: "rgba(127, 147, 242,0.12)", color: "var(--sd-teal)", marginRight: 10, verticalAlign: "middle" }}>
              NoSQL
            </span>
            Scaling and Performance
          </h2>

          <div className="sd-prose">
            <p>
              NoSQL databases — such as MongoDB (Document), Cassandra (Wide-Column), or DynamoDB (Key-Value) — are designed for scenarios where the &quot;one size fits all&quot; schema of an RDBMS becomes a bottleneck. By relaxing the requirement for complex joins and strict cross-table constraints, these systems can distribute data across many nodes more easily.
            </p>
            <p style={{ marginTop: 10 }}>
              If you are building a system that tracks user session data or real-time sensor readings, your schema might change frequently as new features are added. A document store allows you to store a flexible JSON object:
            </p>
          </div>

          <pre style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16, overflowX: "auto", fontSize: 12.5, lineHeight: 1.7 }}>
            <code className="sd-strong">
              <span className="sd-hl-muted">{"// User Profile Document"}</span>{"\n"}
              {"{\n"}
              {"  "}<span className="sd-hl">&quot;user_id&quot;</span>: <span className="sd-hl-amber">&quot;u123&quot;</span>,{"\n"}
              {"  "}<span className="sd-hl">&quot;preferences&quot;</span>: {"{\n"}
              {"    "}<span className="sd-hl">&quot;theme&quot;</span>: <span className="sd-hl-amber">&quot;dark&quot;</span>,{"\n"}
              {"    "}<span className="sd-hl">&quot;notifications&quot;</span>: [<span className="sd-hl-amber">&quot;email&quot;</span>, <span className="sd-hl-amber">&quot;push&quot;</span>]{"\n"}
              {"  },\n"}
              {"  "}<span className="sd-hl">&quot;last_login&quot;</span>: <span className="sd-hl-amber">&quot;2023-10-27T10:00:00Z&quot;</span>{"\n"}
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

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Key Terms
          </p>
          <h2 className="sd-h2">The Vocabulary Of The Trade-off</h2>

          <div className="sd-stack">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Matrix */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Reference
          </p>
          <h2 className="sd-h2">Deciding Between Models</h2>

          <div className="sd-prose">
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
        <div className="sd-section">
          <p className="sd-eyebrow">
            Putting It Together
          </p>
          <h2 className="sd-h2">Choosing SQL vs NoSQL By Access Pattern</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 1060 760"
              role="img"
              aria-label="A decision tree. Start from the access pattern. If it needs JOINs and strict ACID, choose relational SQL. Otherwise, ask whether it is mostly lookup by known key: huge volume leads to key-value or wide-column, a flexible evolving shape leads to a document store, and traversal-heavy access leads to a graph database."
              style={{ width: "100%", minWidth: 640, display: "block" }}
            >
              <title>Choosing SQL vs NoSQL by access pattern</title>
              <defs>
                <marker id="sd-db-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              {/* edges */}
              <path d="M 460 80 V 105" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />
              <path d="M 383 251 C 320 330, 200 360, 175 432" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />
              <path d="M 537 251 C 620 300, 670 330, 700 370" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />
              <path d="M 612 516 C 540 580, 470 600, 455 652" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />
              <path d="M 700 562 C 700 600, 705 612, 705 652" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />
              <path d="M 787 516 C 860 580, 915 600, 927 652" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-db-arrow)" />

              {/* branch labels */}
              <text x="318" y="340" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-muted)">Yes</text>
              <text x="636" y="336" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-muted)">No</text>
              <text x="372" y="608" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)">Yes, huge volume</text>
              <text x="705" y="600" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)">Flexible, evolving</text>
              <text x="705" y="617" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)">shape</text>
              <text x="988" y="608" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)">Traversal-heavy</text>

              {/* start */}
              <rect x="330" y="16" width="260" height="64" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="460" y="42" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">What&apos;s the access</text>
              <text x="460" y="62" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">pattern?</text>

              {/* decision 1 */}
              <polygon points="460,113 615,205 460,297 305,205" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="460" y="199" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">Need JOINs and</text>
              <text x="460" y="219" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">strict ACID?</text>

              {/* decision 2 */}
              <polygon points="700,378 875,470 700,562 525,470" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="700" y="464" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">Mostly lookup by</text>
              <text x="700" y="484" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">known key?</text>

              {/* outcomes */}
              <rect x="60" y="440" width="230" height="60" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-accent)" strokeWidth="1.5" />
              <text x="175" y="476" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fontWeight="700" fill="var(--sd-text)">Relational (SQL)</text>

              <rect x="330" y="660" width="250" height="58" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-green)" strokeWidth="1.5" />
              <text x="455" y="695" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">Key-value / wide-column</text>

              <rect x="615" y="660" width="180" height="58" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-green)" strokeWidth="1.5" />
              <text x="705" y="695" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">Document store</text>

              <rect x="830" y="660" width="195" height="58" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-green)" strokeWidth="1.5" />
              <text x="927" y="695" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">Graph database</text>
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            The first question is the only one that decides <strong className="sd-strong">SQL or not</strong>. Everything below it is choosing <em>which</em> NoSQL, which is why &ldquo;we&rsquo;ll use NoSQL&rdquo; is an unfinished answer: it names the branch, not the destination.
          </div>

          <div className="sd-callout" style={{ marginTop: 12 }}>
            When data grows beyond a single instance, your choice of database dictates how you handle future complexity. In upcoming modules, we&rsquo;ll examine how to apply{" "}
            <span className="sd-hl">partitioning</span> and{" "}
            <span className="sd-hl">sharding</span> to these models to manage massive datasets.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Seen In The Wild
          </p>
          <h2 className="sd-h2">How Real Systems Actually Choose</h2>
          <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
        </div>

        {/* Key points */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Key Points
          </p>
          <h2 className="sd-h2">What To Carry Forward</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints} columns={2} />
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Common Mistakes
          </p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;I tried filing my toys in flexible unlabeled boxes once. Efficient at throw-in time, a nightmare at find-it-again time. Turns out that&rsquo;s the whole SQL versus NoSQL argument in miniature.&rdquo;
            <footer style={{ marginTop: 10, fontSize: 12, color: "var(--sd-muted)", fontStyle: "normal" }}>
              <span className="sd-strong">Madhumitha Kolkar</span>
              <span style={{ fontFamily: "var(--sd-font-mono)", margin: "0 6px" }}>·</span>
              <span style={{ fontFamily: "var(--sd-font-mono)" }}>Index 0</span>
            </footer>
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Try It Yourself
          </p>
          <h2 className="sd-h2">Two Features, Two Shapes</h2>

          <div className="sd-callout sd-callout-accent">
            Pick an app you use daily and guess its data model for two features: the core <strong className="sd-strong">account and billing data</strong> (would you want strict consistency there?) and its <strong className="sd-strong">activity feed or notifications</strong> (does that need cross-entity JOINs, or mostly fast lookups by a known key?). Notice how the two features probably want different database shapes, even inside the same product.
          </div>
        </div>

        {/* Exercises */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Practice
          </p>
          <h2 className="sd-h2">Exercises</h2>

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
                  <strong className="sd-hl">Think about:</strong> {ex.hint}
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
        <div className="sd-section">
          <p className="sd-eyebrow">
            Summary
          </p>
          <h2 className="sd-h2">Structure vs. Flexibility</h2>

          <div className="sd-callout sd-callout-green">
            Relational databases prioritize the correctness of complex data relationships, while NoSQL databases prioritize performance and flexibility for specific, high-velocity use cases. Choosing between them requires a clear understanding of your read/write patterns and the degree of consistency your system demands. We&rsquo;ll build on this by exploring how to{" "}
            <strong className="sd-strong">distribute these datasets effectively</strong> in the next lesson.
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
      <SidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setActivePanelSection(null); }} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          The trade-offs in this lesson rarely have one correct answer. Here&rsquo;s a deeper walkthrough of the trickier ones.
        </p>

        <PanelSection
          id="acid-compliance"
          activeId={activePanelSection}
          title="What does ACID compliance actually guarantee?"
        >
          <p className="sd-text-sm">
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">ACID is what makes the BEGIN…COMMIT block above trustworthy.</strong> Drop any one of the four guarantees and the transfer example stops being safe — most NoSQL systems deliberately relax one or more of them to buy back horizontal scale.
          </div>
        </PanelSection>

        <PanelSection
          id="exercise-cart"
          activeId={activePanelSection}
          title="Should the shopping cart live in a relational database or a key-value store?"
        >
          <p className="sd-text-sm">
            Most production e-commerce systems answer this by{" "}
            <strong className="sd-strong">splitting the lifecycle in two</strong>, rather than picking one store for the whole flow.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">The cart and the order are different data, with different guarantees</strong> — even though they look like &quot;the same feature&quot; from a product perspective.
          </div>
        </PanelSection>

        <PanelSection
          id="exercise-comment-thread"
          activeId={activePanelSection}
          title="Why does a document store win for retrieving a full comment thread?"
        >
          <p className="sd-text-sm">
            The answer comes down to{" "}
            <strong className="sd-strong">how many round-trips it takes to reconstruct the shape you&rsquo;re actually going to render</strong>.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Model data around how it&rsquo;s read, not just how it&rsquo;s created.</strong> The document store isn&rsquo;t &quot;better&quot; here — it&rsquo;s shaped to match the access pattern.
          </div>
        </PanelSection>

        <PanelSection title={'What does "eventual consistency" actually cost you in practice?'}>
          <p className="sd-text-sm">
            It&rsquo;s not free flexibility — it&rsquo;s a real, user-visible trade-off, and it&rsquo;s the same tension formalized by the{" "}
            <strong className="sd-strong">CAP theorem</strong> from earlier in this course.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Eventual consistency shifts risk from the database to your application code.</strong> Someone still has to handle the stale read or the write conflict — it just isn&rsquo;t the database anymore.
          </div>
        </PanelSection>

        <PanelSection title="If NoSQL scales better, why doesn't everyone just use it for everything?">
          <p className="sd-text-sm">
            Because scale is only one axis. Relational databases give up scale-out simplicity in exchange for guarantees that{" "}
            <strong className="sd-strong">most NoSQL systems can&rsquo;t cheaply replicate</strong>.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">&quot;Scales better&quot; is not the same as &quot;better.&quot;</strong> It&rsquo;s better at the specific thing it optimizes for, at the cost of the thing an RDBMS optimizes for.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} />
    </>
  );
}
