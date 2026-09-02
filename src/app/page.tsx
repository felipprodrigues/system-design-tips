import Link from "next/link";
import { modules } from "@/lib/lessons";

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
        gridTemplateColumns: "1fr",
        gap: 16,
        width: "100%",
        maxWidth: 480,
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
    </div>
  );
}
