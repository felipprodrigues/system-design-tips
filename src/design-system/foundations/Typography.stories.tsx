import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpecLabel } from "./SpecLabel";
import styles from "./Foundations.module.css";

const FAMILIES = [
  { token: "--sd-font-display", sample: "Scaling a Photo App to a Million Users" },
  { token: "--sd-font", sample: "Every concept is one self-contained page, read in any order." },
  { token: "--sd-font-mono", sample: "CONCEPT 3 · SCALING AND TRADE-OFFS · 11 MIN READ" },
];

const SCALE = [
  { where: "Hero title", style: { fontFamily: "var(--sd-font-display)", fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }, spec: "44 / 700 / display" },
  { where: "Roadmap page title", style: { fontFamily: "var(--sd-font-display)", fontSize: 34, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.025em" }, spec: "34 / 600 / display" },
  { where: ".sd-h1 concept title", className: "sd-h1", spec: "28 / 700 / display" },
  { where: "Interview answer title", style: { fontFamily: "var(--sd-font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em" }, spec: "20 / 600 / display" },
  { where: ".sd-h2 section title", className: "sd-h2", as: "h2", spec: "19 / 700 / display" },
  { where: ".sd-quiz-title", className: "sd-quiz-title", spec: "18 / 700 / body" },
  { where: "Body", style: { fontSize: 15.5, lineHeight: 1.7 }, spec: "15.5 / 400 / body (body default)" },
  { where: ".sd-prose", style: { fontSize: 14, lineHeight: 1.75 }, spec: "14 / 400 / body" },
  { where: ".sd-text-sm", className: "sd-text-sm", spec: "13 / muted / 1.7" },
  { where: ".sd-text-xs", className: "sd-text-xs", spec: "12 / muted / 1.65" },
] as const;

const EYEBROWS = [
  { className: "sd-eyebrow", spec: "10 / 700 / 0.1em / muted: above a section title" },
  { className: "sd-eyebrow-accent", spec: "11 / 700 / 0.1em / accent: concept number, quiz heading" },
  { className: "sd-eyebrow-sub", spec: "11 / 700 / 0.06em / muted: above a card grid" },
];

const EMPHASIS = [
  { className: "sd-strong", label: "sd-strong", note: "lifts a phrase from muted to text" },
  { className: "sd-hl", label: "sd-hl", note: "teal" },
  { className: "sd-hl-accent", label: "sd-hl-accent", note: "accent" },
  { className: "sd-hl-amber", label: "sd-hl-amber", note: "amber" },
  { className: "sd-hl-muted", label: "sd-hl-muted", note: "muted" },
];

function Typography() {
  return (
    <div className={styles.page}>
      <section>
        <h2 className={styles.groupTitle}>Families</h2>
        <div className={styles.rows}>
          {FAMILIES.map((family) => (
            <div key={family.token} className={styles.row}>
              <SpecLabel title={family.token} detail="set by next/font in the app" />
              <span style={{ fontFamily: `var(${family.token})`, fontSize: 20 }}>{family.sample}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Scale in use</h2>
        <div className={styles.rows}>
          {SCALE.map((step) => {
            const Tag = "as" in step ? step.as : "p";
            return (
              <div key={step.where} className={styles.row}>
                <SpecLabel title={step.where} detail={step.spec} />
                <Tag
                  className={"className" in step ? step.className : undefined}
                  style={"style" in step ? step.style : { marginBottom: 0 }}
                >
                  The trade-offs behind every distributed system
                </Tag>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Eyebrows</h2>
        <div className={styles.rows}>
          {EYEBROWS.map((eyebrow) => (
            <div key={eyebrow.className} className={styles.row}>
              <SpecLabel title={`.${eyebrow.className}`} detail={eyebrow.spec} />
              <p className={eyebrow.className} style={{ marginBottom: 0 }}>
                Why this exists
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Emphasis inside muted copy</h2>
        <div className={styles.rows}>
          {EMPHASIS.map((item) => (
            <div key={item.className} className={styles.row}>
              <SpecLabel title={`.${item.label}`} detail={item.note} />
              <p className="sd-text-sm">
                Horizontal scaling only works once <span className={item.className}>no server remembers anything</span> the others don&rsquo;t.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Design System/Foundations/Typography",
  component: Typography,
} satisfies Meta<typeof Typography>;

export default meta;

export const Scale: StoryObj<typeof meta> = {};
