import Link from "next/link";

const references = [
  {
    label: "awesome-system-design-resources",
    description: "Curated list of system design resources and project ideas",
    url: "https://github.com/ashishps1/awesome-system-design-resources",
  },
  {
    label: "What is a Data Lake? — AWS",
    description: "Overview of data lake concepts, architecture, and use cases",
    url: "https://aws.amazon.com/what-is/data-lake/",
  },
];

const concepts = [
  {
    id: "data-lake-vs-warehouse",
    topic: "Data Storage",
    question:
      "One team wants to cheaply land raw clickstream JSON, logs, and images now and decide how to use them later. Another team needs cleaned, modeled tables for fast BI reporting. Which pairing of systems fits?",
    answer:
      "A data lake for the raw files, applying structure only when read, and a warehouse for the modeled tables that reporting queries hit.",
    rationale:
      "A lake stores raw, heterogeneous files cheaply and applies schema only on read — suited for data whose future use is unknown. A warehouse stores modeled, cleaned tables optimized for fast SQL — suited for BI. Most companies run both, with pipelines promoting data from the lake into the warehouse.",
    url: "https://aws.amazon.com/what-is/data-lake/",
    urlLabel: "What is a Data Lake? — AWS",
  },
];

const modules = [
  {
    number: "01",
    title: "Foundations of Distributed Architecture",
    lessons: [
      // LESSON_ENTRIES_START
      // LESSON_ENTRIES_END
    ],
  },
  {
    number: "02",
    title: "Data Storage and Management Strategies",
    lessons: [
      { slug: "01-relational-vs-nosql", number: 1, title: "Selecting Relational vs NoSQL Database Models" },
      { slug: "02-database-sharding-partitioning", number: 2, title: "Implementing Database Sharding and Partitioning" },
    ],
  },
];

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 80px",
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 8,
      }}>
        Course
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
        Foundations of Distributed Architectures
      </h1>
      <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 48, textAlign: "center" }}>
        A structured guide to system design fundamentals.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
        width: "100%",
        maxWidth: 960,
      }}>
        {modules.map((mod) => (
          <div
            key={mod.number}
            style={{
              background: "var(--sd-surface)",
              border: "1px solid var(--sd-border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* Module header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderBottom: "1px solid var(--sd-border)",
            }}>
              <span style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                background: "rgba(108,99,255,0.15)", color: "var(--sd-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>
                {mod.number}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--sd-text)", lineHeight: 1.3 }}>
                {mod.title}
              </span>
              <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 11, color: "var(--sd-muted)", fontWeight: 500 }}>
                {mod.lessons.length} lessons
              </span>
            </div>

            {/* Lesson list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {mod.lessons.map((l, i) => (
                <Link
                  key={l.slug}
                  href={`/lessons/${l.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 20px",
                    textDecoration: "none",
                    color: "var(--sd-text)",
                    borderTop: i === 0 ? "none" : "1px solid var(--sd-border)",
                  }}
                >
                  <span style={{
                    flexShrink: 0,
                    fontSize: 11, fontWeight: 600,
                    color: "var(--sd-muted)",
                    width: 20,
                    textAlign: "right",
                  }}>
                    {String(l.number).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l.title}</span>
                  <span style={{ marginLeft: "auto", color: "var(--sd-muted)", fontSize: 13 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Concepts */}
      <div style={{ marginTop: 48, width: "100%", maxWidth: 960 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 12,
        }}>
          Concepts
        </p>
        {concepts.map((c) => (
          <div
            key={c.id}
            style={{
              background: "var(--sd-surface)",
              border: "1px solid var(--sd-border)",
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 10,
            }}
          >
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--sd-accent)",
              background: "rgba(108,99,255,0.12)",
              borderRadius: 4, padding: "2px 8px",
              marginBottom: 10,
            }}>
              {c.topic}
            </span>
            <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.6, marginBottom: 10 }}>
              {c.question}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--sd-text)", lineHeight: 1.5, marginBottom: 8 }}>
              {c.answer}
            </p>
            <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65, borderLeft: "2px solid var(--sd-border)", paddingLeft: 10, marginBottom: c.url ? 12 : 0 }}>
              {c.rationale}
            </p>
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "var(--sd-accent)",
                  textDecoration: "none", fontWeight: 500,
                }}
              >
                {c.urlLabel} ↗
              </a>
            )}
          </div>
        ))}
      </div>

      {/* References */}
      <div style={{ marginTop: 48, width: "100%", maxWidth: 960 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 12,
        }}>
          References
        </p>
        {references.map((ref) => (
          <a
            key={ref.url}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--sd-surface)",
              border: "1px solid var(--sd-border)",
              borderRadius: 10,
              padding: "13px 18px",
              textDecoration: "none",
              color: "var(--sd-text)",
            }}
          >
            <span style={{ fontSize: 16, color: "var(--sd-muted)" }}>⎘</span>
            <span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{ref.label}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--sd-muted)", marginTop: 2 }}>
                {ref.description}
              </span>
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--sd-muted)" }}>↗</span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 56, paddingTop: 24, width: "100%", maxWidth: 960,
        borderTop: "1px solid var(--sd-border)", textAlign: "center",
      }}>
        <a
          href="https://github.com/nilbuild/developer-roadmap"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12, color: "var(--sd-muted)",
            textDecoration: "none", fontWeight: 500,
          }}
        >
          developer-roadmap ↗
        </a>
      </footer>
    </div>
  );
}
