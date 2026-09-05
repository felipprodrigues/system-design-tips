import Link from "next/link";
import { modules } from "@/lib/lessons";
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
      <div style={{ width: "100%", maxWidth: 640 }}>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", fontFamily: "var(--sd-font-mono)",
          textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 20,
        }}>
          Course
        </p>

        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
          Foundations of Distributed Architecture
        </h1>

        <p style={{ color: "var(--sd-muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 72, maxWidth: 440 }}>
          A structured guide to system design fundamentals.
        </p>

        {modules.map((mod) => (
          <div key={mod.number} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)" }}>
                {mod.title}
              </span>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-muted)", border: "1px solid var(--sd-border)", borderRadius: 5, padding: "3px 8px" }}>
                MOD · {mod.number}
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
                  <span className="sd-row-title" style={{ fontFamily: "var(--sd-font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>
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
  );
}
