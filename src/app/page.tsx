import Link from "next/link";
import { modules, prologue } from "@/lib/lessons";
import { ThemeToggle } from "@/components";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "96px 24px 96px",
      position: "relative",
    }}>
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300 }}>
        <ThemeToggle />
      </div>
      <div style={{ width: "100%", maxWidth: 960 }}>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", fontFamily: "var(--sd-font-mono)",
          textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 20,
        }}>
          Course
        </p>

        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
          System Design Roadmap
        </h1>

        <p style={{ color: "var(--sd-muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 72, maxWidth: 520 }}>
          Concepts in the order you actually need them, from a single request to a system that serves millions.
        </p>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)" }}>
              Fundamentals
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link
              href={`/lessons/${prologue.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 20px",
                alignItems: "center",
                gap: 20,
                padding: "22px 4px",
                textDecoration: "none",
                color: "var(--sd-text)",
                borderTop: "1px solid var(--sd-border)",
                borderBottom: "1px solid var(--sd-border)",
              }}
              className="sd-row"
            >
              <span className="sd-row-title" style={{ gridColumn: 2, fontFamily: "var(--sd-font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {prologue.title}
              </span>
              <span className="sd-row-arrow" style={{ color: "var(--sd-accent)", fontSize: 13, fontFamily: "var(--sd-font-mono)" }}>→</span>
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 40 }}>
        {modules.map((mod) => (
          <div key={mod.number} style={{ flex: "1 1 50%", minWidth: 0, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)" }}>
                {mod.title}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {mod.lessons.map((l) => (
                <Link
                  key={l.slug}
                  href={`/lessons/${l.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 20px",
                    alignItems: "center",
                    gap: 20,
                    padding: "22px 4px",
                    textDecoration: "none",
                    color: "var(--sd-text)",
                    borderTop: "1px solid var(--sd-border)",
                  }}
                  className="sd-row"
                >
                  <span style={{
                    fontFamily: "var(--sd-font-mono)",
                    fontSize: 12, color: "var(--sd-muted)",
                  }}>
                    {String(l.number).padStart(2, "0")}
                  </span>
                  <span className="sd-row-title" style={{ fontFamily: "var(--sd-font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    {l.title}
                  </span>
                  <span className="sd-row-arrow" style={{ color: "var(--sd-accent)", fontSize: 13, fontFamily: "var(--sd-font-mono)" }}>→</span>
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--sd-border)" }} />
            </div>
          </div>
        ))}
        </div>

      </div>
    </div>
  );
}
