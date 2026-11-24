import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokensIn } from "./tokens";
import { SpecLabel, type SpecLabelProps } from "./SpecLabel";
import styles from "./Foundations.module.css";

const SHADOWS = [
  { where: "Term definition card", value: "0 10px 30px rgba(0, 0, 0, 0.35)" },
  { where: "New-content toast", value: "0 16px 40px rgba(0, 0, 0, 0.3)" },
  { where: "Q&A cross-reference tip", value: "0 12px 30px rgba(0, 0, 0, 0.28)" },
  { where: "Side panel (from the right)", value: "-24px 0 48px rgba(0, 0, 0, 0.35)" },
  { where: "Highlighted panel section", value: "0 0 0 2px var(--sd-accent)" },
];

const MOTION = [
  { where: "Hover colour and border (the default)", duration: "0.15s", easing: "ease" },
  { where: "Ghost button background", duration: "0.2s", easing: "ease" },
  { where: "Term card pop", duration: "0.14s", easing: "cubic-bezier(0.2, 0.9, 0.3, 1.2)" },
  { where: "Side panel slide", duration: "0.32s", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  { where: "Toast entry", duration: "0.3s", easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  { where: "Q&A view transition", duration: "0.34s", easing: "cubic-bezier(0.2, 0, 0, 1)" },
  { where: "Progress ring and bar fill", duration: "0.4s", easing: "ease" },
];

const BREAKPOINTS = [
  { width: "1470px", effect: "Concept rail leaves the right gutter and becomes a band below the content" },
  { width: "1040px", effect: "Roadmap stats drop from three columns to two" },
  { width: "1000px", effect: "Interview Q&A contents rail stacks above the cards" },
  { width: "760px", effect: "App bar tabs move to their own row; About and concept layouts go single column" },
  { width: "680px", effect: "Roadmap stats and banners go single column" },
];

function Row({ children, ...label }: SpecLabelProps & { children?: ReactNode }) {
  return (
    <div className={styles.row}>
      <SpecLabel {...label} />
      <div>{children}</div>
    </div>
  );
}

function Surfaces() {
  return (
    <div className={styles.page}>
      <section>
        <h2 className={styles.groupTitle}>Layering: bg → surface → surface2</h2>
        <div className={styles.layer} style={{ background: "var(--sd-bg)" }}>
          <span className={styles.value}>--sd-bg</span>
          <div className={styles.layer} style={{ background: "var(--sd-surface)", marginTop: 12 }}>
            <span className={styles.value}>--sd-surface · .sd-prose, .sd-figure</span>
            <div className={styles.layer} style={{ background: "var(--sd-surface2)", marginTop: 12 }}>
              <span className={styles.value}>--sd-surface2 · .sd-card, .sd-panel-card</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Radii</h2>
        <div className={styles.rows}>
          {tokensIn("radius").map((token) => (
            <Row key={token.name} title={token.name} detail={token.usage}>
              <div className={styles.radius} style={{ borderRadius: `var(${token.name})` }} />
            </Row>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Elevation in use (no tokens yet)</h2>
        <div className={styles.grid}>
          {SHADOWS.map((shadow) => (
            <div key={shadow.where} className={styles.swatch}>
              <div style={{ padding: 18 }}>
                <div className={styles.shadow} style={{ boxShadow: shadow.value }} />
              </div>
              <div className={styles.meta}>
                <span className={styles.name}>{shadow.where}</span>
                <span className={styles.value}>{shadow.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Motion in use (hover a row). Every animation has a reduced-motion opt-out</h2>
        <div className={styles.rows}>
          {MOTION.map((item) => (
            <Row key={item.where} title={item.where} detail={`${item.duration} · ${item.easing}`}>
              <div
                className={styles.motion}
                style={{ transitionDuration: item.duration, transitionTimingFunction: item.easing }}
              />
            </Row>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.groupTitle}>Breakpoints (max-width unless noted)</h2>
        <div className={styles.rows}>
          {BREAKPOINTS.map((bp) => (
            <Row key={bp.width} title={bp.width} detail={bp.effect} />
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Design System/Foundations/Surfaces & Motion",
  component: Surfaces,
} satisfies Meta<typeof Surfaces>;

export default meta;

export const Overview: StoryObj<typeof meta> = {};
