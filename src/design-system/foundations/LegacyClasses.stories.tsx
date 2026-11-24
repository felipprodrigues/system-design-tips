import type { Meta, StoryObj } from "@storybook/react-vite";
import { LEGACY_CLASSES } from "./legacyClasses";
import { SpecLabel } from "./SpecLabel";
import styles from "./Foundations.module.css";

const SAMPLE: Record<string, React.ReactNode> = {
  "sd-h1": <h1 className="sd-h1">Concept title</h1>,
  "sd-h2": <h2 className="sd-h2">Section title</h2>,
  "sd-section": <div className="sd-section" style={{ marginBottom: 0 }}>32px bottom rhythm between sections</div>,
  "sd-prose": <div className="sd-prose" style={{ marginBottom: 0 }}>The raised card that carries body prose.</div>,
  "sd-card": <div className="sd-card">Secondary card</div>,
  "sd-panel-card": (
    <div className="sd-panel-card">
      <div className="sd-panel-card-title">Panel card title</div>
      <p className="sd-text-xs">Body copy inside a side panel.</p>
    </div>
  ),
  "sd-figure": (
    <div className="sd-figure" style={{ marginBottom: 0 }}>
      <p className="sd-figure-caption" style={{ marginBottom: 0 }}>Figure caption</p>
    </div>
  ),
  "sd-callout": <div className="sd-callout">Neutral callout</div>,
  "sd-callout-accent": <div className="sd-callout sd-callout-accent">Accent callout</div>,
  "sd-callout-green": <div className="sd-callout sd-callout-green">Green callout</div>,
  "sd-panel-note": <div className="sd-panel-note">Closing takeaway of a panel section</div>,
  "sd-grid-2": (
    <div className="sd-grid-2" style={{ marginBottom: 0 }}>
      <div className="sd-card">1</div>
      <div className="sd-card">2</div>
    </div>
  ),
  "sd-grid-3": (
    <div className="sd-grid-3" style={{ marginBottom: 0 }}>
      <div className="sd-card">1</div>
      <div className="sd-card">2</div>
      <div className="sd-card">3</div>
    </div>
  ),
  "sd-stack": (
    <div className="sd-stack">
      <div className="sd-card">1</div>
      <div className="sd-card">2</div>
    </div>
  ),
  "sd-stack-center": (
    <div className="sd-stack-center">
      <span className="sd-card">Box</span>
      <span className="sd-arrow">↓</span>
      <span className="sd-card">Box</span>
    </div>
  ),
  "sd-arrow": <span className="sd-arrow">→</span>,
  "sd-arrow-sm": <span className="sd-arrow-sm">→</span>,
  "sd-quiz-title": <p className="sd-quiz-title">Check your understanding</p>,
  "sd-term": (
    <span className="sd-text-sm">
      An <span className="sd-term">idempotent</span> request is safe to retry.
    </span>
  ),
  "sd-reveal": <div className="sd-reveal sd-card" data-on="true">Revealed stage node</div>,
};

function sampleFor(className: string) {
  if (SAMPLE[className]) return SAMPLE[className];
  if (className.startsWith("sd-hl") || className === "sd-strong") {
    return (
      <p className="sd-text-sm">
        Muted copy with <span className={className}>one lifted phrase</span> in it.
      </p>
    );
  }
  if (className.startsWith("sd-eyebrow") || className === "sd-mono") {
    return <p className={className} style={{ marginBottom: 0 }}>Eyebrow label</p>;
  }
  if (className.startsWith("sd-text") || className === "sd-lede" || className === "sd-intro") {
    return <p className={className} style={{ marginBottom: 0 }}>A sentence of copy set in this class.</p>;
  }
  return <span className={styles.value}>rendered by its component, see Components</span>;
}

function LegacyClasses() {
  return (
    <div className={styles.page}>
      <section>
        <h2 className={styles.groupTitle}>
          Global classes from src/styles (still live: every concept page uses them) and what replaces each one
        </h2>
        <div className={styles.rows}>
          {LEGACY_CLASSES.map((entry) => (
            <div key={entry.className} className={styles.row}>
              <SpecLabel title={`.${entry.className}`} detail={entry.replacement} />
              <div>{sampleFor(entry.className)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Design System/Foundations/Legacy Classes",
  component: LegacyClasses,
} satisfies Meta<typeof LegacyClasses>;

export default meta;

export const Catalog: StoryObj<typeof meta> = {};
