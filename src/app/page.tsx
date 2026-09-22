import Link from "next/link";
import { groups, type LessonGroup } from "@/lib/lessons";

const GRID_GAP = 20;

/* Centre of column `i` in a grid of `count` equal tracks separated by GRID_GAP.
   Derived rather than hardcoded so the connector keeps aligning as groups are
   added. Equal tracks are symmetric, so the last centre mirrors the first. */
function columnCentre(i: number, count: number) {
  const track = `((100% - ${(count - 1) * GRID_GAP}px) / ${count})`;
  return `calc(${track} * ${i + 0.5} + ${i * GRID_GAP}px)`;
}
import { ThemeToggle } from "@/components";

function GroupRows({ group }: { group: LessonGroup }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "0 20px 8px" }}>
      {group.lessons.map((l) => (
        <Link
          key={l.slug}
          href={`/lessons/${l.slug}`}
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 20px",
            alignItems: "center",
            gap: 14,
            padding: "16px 0",
            textDecoration: "none",
            color: "var(--sd-text)",
            borderTop: "1px solid var(--sd-border)",
          }}
          className="sd-row"
        >
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: "var(--sd-muted)" }}>
            {String(l.number).padStart(2, "0")}
          </span>
          <span className="sd-row-title" style={{ fontFamily: "var(--sd-font-display)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {l.title}
          </span>
          <span className="sd-row-arrow" style={{ color: "var(--sd-accent)", fontSize: 13, fontFamily: "var(--sd-font-mono)" }}>→</span>
        </Link>
      ))}
    </div>
  );
}

/** The on-ramp is always open; the topic tracks collapse. */
function GroupCard({ group }: { group: LessonGroup }) {
  return (
    <div className="sd-group">
      <div className="sd-group-head">{group.title}</div>
      <GroupRows group={group} />
    </div>
  );
}

function CollapsibleGroupCard({ group }: { group: LessonGroup }) {
  return (
    <details open className="sd-group">
      <summary className="sd-group-head sd-group-summary">
        <span>{group.title}</span>
        <span className="sd-group-chevron" aria-hidden="true">▼</span>
      </summary>
      <GroupRows group={group} />
    </details>
  );
}

export default function Home() {
  const topics = groups.slice(1);

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

        <GroupCard group={groups[0]} />


        {/* Connector: the root branches down into each topic track below. */}
        <div style={{ position: "relative", height: 52 }} aria-hidden="true">
          <span style={{ position: "absolute", left: "50%", top: 0, width: 1, height: 27, background: "var(--sd-border-strong)" }} />
          <span style={{ position: "absolute", left: columnCentre(0, topics.length), right: columnCentre(0, topics.length), top: 26, height: 1, background: "var(--sd-border-strong)" }} />
          {topics.map((group, i) => (
            <span
              key={group.title}
              style={{ position: "absolute", left: columnCentre(i, topics.length), top: 26, width: 1, height: 26, background: "var(--sd-border-strong)" }}
            />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${topics.length}, 1fr)`, gap: GRID_GAP, alignItems: "start" }}>
          {topics.map((group) => (
            <CollapsibleGroupCard key={group.title} group={group} />
          ))}
        </div>

      </div>
    </div>
  );
}
