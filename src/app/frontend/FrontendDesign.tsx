"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LearnedToggle } from "@/components";
import {
  ArrowMarker,
  Breadcrumb,
  Callout,
  Card,
  DeepDiveButton,
  Diagram,
  Eyebrow,
  Figure,
  Heading,
  MarkerList,
  PageLayout,
  PanelNote,
  PanelSection,
  Prose,
  Section,
  SidePanel,
  Strong,
  Term,
  Text,
} from "@/design-system";
import { hl } from "@/lib/highlight";
import { prepHref, type PrepLink } from "@/lib/interviewPrep";
import { setStageView, toggleFrontendCard, useFrontendCards, useStageView } from "@/lib/progress";
import styles from "./Frontend.module.css";
import type { Stage } from "./data";
import {
  commonMistakes,
  crossCutting,
  differences,
  keyPoints,
  layers,
  ownBudgets,
  phases,
  quadrants,
  stages,
  stateItems,
  terms,
  uiStates,
  vitals,
  whyThisExists,
} from "./data";

function StageLink({ n, onJump }: { n: number; onJump: (n: number) => void }) {
  const target = stages[n - 1];
  const colour = phases.find((p) => p.id === target.phase)!.color;
  return (
    <button
      type="button"
      className={styles.stageLink}
      style={{ color: colour, borderColor: colour }}
      onClick={() => onJump(n)}
    >
      {`↑ Stage ${n} · ${target.label}`}
    </button>
  );
}

function rich(text: string) {
  return text.split(/(\*[^*]+\*|\[[^\]]+\]|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <Strong key={i}>{part.slice(1, -1)}</Strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code key={i} className={code.includes("\n") ? styles.codeBlock : styles.code}>
          {code}
        </code>
      );
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      const label = part.slice(1, -1);
      const def = terms[label];
      return def ? <Term key={i} label={label}>{def}</Term> : label;
    }
    return part;
  });
}

/* One id per decision card, used for both the URL and the read list. Verified
   unique across all nine stages, so neither has to be qualified by stage. */
const idOf = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* Read through useSyncExternalStore rather than an effect: hydration takes the
   server's empty snapshot and the real query string arrives on the next render,
   so there is no setState in an effect and no mismatch to paper over. */
const searchListeners = new Set<() => void>();

function subscribeSearch(onChange: () => void) {
  searchListeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    searchListeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function readSearch() {
  return window.location.search;
}

/* replace rather than push: the back button should leave the page, not walk back
   through every card that was opened on it. */
function writeSearch(params: URLSearchParams) {
  window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  for (const listener of searchListeners) listener();
}

const LAYER_X = 56;
const LAYER_W = 420;
const LAYER_H = 38;
const LAYER_TOP = 106;
const LAYER_STEP = 44;

function labelsIn(questions: PrepLink[]) {
  const parts = questions.flatMap((q) => q.topic.split(" & "));
  return [...new Set(parts)].map((part) => part[0].toUpperCase() + part.slice(1));
}

export interface Deeper {
  n: number;
  questions: PrepLink[];
}

export default function FrontendDesign({ deeper }: { deeper: Deeper[] }) {
  const search = useSyncExternalStore(subscribeSearch, readSearch, () => "");
  const params = new URLSearchParams(search);
  const asked = Number(params.get("stage"));
  const active = asked >= 1 && asked <= stages.length ? asked : 1;
  const stage = stages[active - 1];
  const openCheck = stage.checks.find((c) => idOf(c.q) === params.get("card")) ?? null;

  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  /* The slide is a response to stepping, so the first paint must not play it. */
  const [stepped, setStepped] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [decideView, setDecideView] = useState<"cards" | "list">("cards");
  const read = useFrontendCards();
  const view = useStageView();

  function setParams(next: { stage?: number; card?: string | null }) {
    const updated = new URLSearchParams(window.location.search);
    updated.set("stage", String(next.stage ?? active));
    if (next.card) updated.set("card", next.card);
    else updated.delete("card");
    writeSearch(updated);
  }

  const deckRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  /* Centre the active chip rather than calling scrollIntoView, which would also
     scroll the page to reach it. */
  useEffect(() => {
    if (view !== "strip") return;
    const track = trackRef.current;
    const chip = chipRefs.current[active];
    if (!track || !chip) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2,
      behavior: calm ? "auto" : "smooth",
    });
  }, [active, view]);

  function go(n: number) {
    if (n === active) return;
    setDir(n > active ? "fwd" : "back");
    setStepped(true);
    setPanelOpen(false);
    setParams({ stage: n, card: null });
  }

  function jumpToStage(n: number) {
    go(n);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    deckRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }

  const phase = phases.find((p) => p.id === stage.phase)!;
  const phaseOf = (id: Stage["phase"]) => phases.find((p) => p.id === id)!;
  const lit = (id: string) => stage.lit.includes(id);

  const ring = (id: string) => (lit(id) ? phase.color : "var(--sd-border)");
  const fill = (id: string) => (lit(id) ? phase.wash : "var(--sd-surface2)");
  const dim = (id: string) => (lit(id) ? 1 : 0.45);

  return (
    <>
      <Breadcrumb section="Frontend Design" concept="A 9-step walkthrough to Frontend System Design" />

      <PageLayout>
        <Eyebrow>Frontend Design</Eyebrow>
        <LearnedToggle />
        <Heading level="page">A 9-step walkthrough to Frontend System Design</Heading>
        <Text variant="lede">
          The same discipline as backend system design, pointed at a machine you don&rsquo;t own.
        </Text>

        <Section eyebrow="Big Idea">
          <Prose size="lg">
            <p>
              A backend design grows outward: each step earns another box on the diagram. A frontend
              design doesn&rsquo;t. <Strong>The stack is the same nine times over</Strong>:
              shell, router, components, store, cache, transport, storage. What each stage changes is
              who owns which part of it, how long the data inside it lives, and what the user is looking at
              while it&rsquo;s still arriving.
            </p>
            <p>
              So these nine stages are nine passes over one picture, not nine additions to it.
            </p>
          </Prose>
        </Section>

        <Section ref={deckRef} eyebrow="Walk It" title="Nine Stages, One Stack">

          <Prose>
            <p>
              Step through it. <Strong>No stage adds a box after stage 3</Strong>.
              Each one lights up the layers it governs, and the ones left grey are somebody else&rsquo;s
              problem for now.
            </p>
          </Prose>

          <div className={styles.viewBar}>
            <div className={styles.toggle} role="group" aria-label="Stage selector layout">
              {([["rows", "Rows"], ["strip", "One line"]] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={styles.toggleBtn}
                  aria-pressed={view === id}
                  onClick={() => setStageView(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {view === "strip" && (
            <div style={{ marginBottom: 16 }}>
              <p className={styles.phaseRule} style={{ color: phase.color }}>
                {phase.name}
              </p>
              <div className={styles.track} ref={trackRef}>
                {stages.map((s) => {
                  const p = phaseOf(s.phase);
                  const on = s.n === active;
                  return (
                    <button
                      key={s.n}
                      type="button"
                      ref={(el) => { chipRefs.current[s.n] = el; }}
                      onClick={() => go(s.n)}
                      aria-pressed={on}
                      className={styles.stripChip}
                      style={{
                        background: on ? p.wash : "var(--sd-surface2)",
                        border: `1px solid ${on ? p.color : "var(--sd-border)"}`,
                        opacity: on ? 1 : 0.72,
                      }}
                    >
                      <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: p.color }}>
                        {`0${s.n}`}
                      </span>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div hidden={view !== "rows"} style={{ display: view === "rows" ? "flex" : undefined, flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {phases.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "var(--sd-font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: p.color,
                    minWidth: 62,
                  }}
                >
                  {p.name}
                </span>
                {stages
                  .filter((s) => s.phase === p.id)
                  .map((s) => {
                    const on = s.n === active;
                    return (
                      <button
                        key={s.n}
                        type="button"
                        onClick={() => go(s.n)}
                        aria-pressed={on}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          background: on ? p.wash : "var(--sd-surface2)",
                          border: `1px solid ${on ? p.color : "var(--sd-border)"}`,
                          borderRadius: 8,
                          padding: "8px 12px",
                          cursor: "pointer",
                          color: "var(--sd-text)",
                          fontFamily: "inherit",
                          fontSize: 13,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: p.color }}>
                          {`0${s.n}`}
                        </span>
                        {s.label}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <Figure flush style={{ marginBottom: 14 }}>
            <div
              aria-live="polite"
              style={{
                borderBottom: "1px solid var(--sd-border)",
                background: "var(--sd-surface2)",
                padding: "9px 14px",
                textAlign: "center",
                fontFamily: "var(--sd-font-mono)",
                fontSize: 11.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--sd-muted)",
              }}
            >
              {`Stage ${active} of ${stages.length} · ${phase.name} · ${stage.label}`}
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ overflowX: "auto", padding: "24px 56px" }}>
                <Diagram
                  viewBox="0 0 760 526"
                  label={`The client stack at stage ${active}, ${stage.label}. ${stage.draws}`}
                  title={`The client stack at stage ${active}`}
                  className={styles.stack}
                  minWidth={560}
                >
                  <defs>
                    <ArrowMarker id="sd-fe-arrow" color="border-strong" />
                  </defs>

                  <g opacity={dim("user")}>
                    <rect x={300} y={8} width={160} height={40} rx={10} fill={fill("user")} stroke={ring("user")} strokeWidth={lit("user") ? 2.5 : 1.5} />
                    <text x={380} y={33} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">
                      A user, on a device
                    </text>
                  </g>
                  <path d="M 380 48 V 70" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-fe-arrow)" />

                  <g opacity={dim("boundary")}>
                    <rect
                      x={30}
                      y={74}
                      width={700}
                      height={352}
                      rx={12}
                      fill="none"
                      stroke={lit("boundary") ? phase.color : "var(--sd-border-strong)"}
                      strokeWidth={lit("boundary") ? 2.5 : 1.5}
                      strokeDasharray="6 5"
                    />
                    <text x={46} y={96} fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill={lit("boundary") ? phase.color : "var(--sd-muted)"}>
                      THE CLIENT: YOUR CODE, THEIR CPU
                    </text>
                  </g>

                  {layers.map((l, i) => {
                    const y = LAYER_TOP + i * LAYER_STEP;
                    return (
                      <g key={l.id} opacity={dim(l.id)}>
                        <rect x={LAYER_X} y={y} width={LAYER_W} height={LAYER_H} rx={8} fill={fill(l.id)} stroke={ring(l.id)} strokeWidth={lit(l.id) ? 2.5 : 1.5} />
                        <text x={LAYER_X + 14} y={y + 24} fontFamily="var(--sd-font-mono)" fontSize="13.5" fontWeight="700" fill="var(--sd-text)">
                          {l.name}
                        </text>
                        <text x={LAYER_X + LAYER_W - 14} y={y + 24} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" letterSpacing="1" fill={lit(l.id) ? phase.color : "var(--sd-muted)"}>
                          {l.kind}
                        </text>
                      </g>
                    );
                  })}

                  <text x={600} y={124} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" letterSpacing="1" fill="var(--sd-muted)">
                    CROSS CUTTING
                  </text>
                  {crossCutting.map((c, i) => (
                    <g key={c.id} opacity={dim(c.id)}>
                      <rect x={504} y={140 + i * 62} width={192} height={48} rx={8} fill={fill(c.id)} stroke={ring(c.id)} strokeWidth={lit(c.id) ? 2.5 : 1.5} />
                      <text x={600} y={169 + i * 62} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">
                        {c.name}
                      </text>
                    </g>
                  ))}
                  <text x={600} y={290} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">
                    touches every layer,
                  </text>
                  <text x={600} y={306} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">
                    owned by none of them
                  </text>

                  <g opacity={dim("net")}>
                    <text x={380} y={448} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill={lit("net") ? phase.color : "var(--sd-muted)"}>
                      NETWORK BOUNDARY: NOTHING ABOVE IT IS TRUSTED
                    </text>
                    <path
                      d="M 30 458 H 730"
                      fill="none"
                      stroke={lit("net") ? phase.color : "var(--sd-border-strong)"}
                      strokeWidth={lit("net") ? 2.5 : 1.5}
                      strokeDasharray="7 6"
                    />
                  </g>

                  <g opacity={dim("server")}>
                    <rect x={300} y={474} width={160} height={44} rx={10} fill={fill("server")} stroke={ring("server")} strokeWidth={lit("server") ? 2.5 : 1.5} />
                    <text x={380} y={501} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">
                      Server / APIs
                    </text>
                  </g>
                </Diagram>
              </div>

              <button
                type="button"
                onClick={() => go(Math.max(1, active - 1))}
                disabled={active === 1}
                aria-label="Previous stage"
                style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-text)", fontFamily: "var(--sd-font-mono)", fontSize: 15, left: 12, cursor: active === 1 ? "default" : "pointer", opacity: active === 1 ? 0.3 : 1 }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(Math.min(stages.length, active + 1))}
                disabled={active === stages.length}
                aria-label="Next stage"
                style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-text)", fontFamily: "var(--sd-font-mono)", fontSize: 15, right: 12, cursor: active === stages.length ? "default" : "pointer", opacity: active === stages.length ? 0.3 : 1 }}
              >
                →
              </button>
            </div>
          </Figure>

          <div key={active} className={stepped ? styles.slide : undefined} data-dir={dir}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: phase.wash, border: "1px solid var(--sd-border)", borderRadius: 8, padding: "13px 16px", marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: phase.color, flexShrink: 0, lineHeight: 1.65 }}>
              {`0${stage.n}`}
            </span>
            <Text variant="sm-tight">{stage.draws}</Text>
          </div>

          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <Text variant="sm-tight" style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5 }}>
              {stage.decides}
            </Text>
          </div>

          {stage.analogy && (
            <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: phase.color, marginBottom: 6 }}>
                Think of it like
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sd-text)", marginBottom: 7 }}>
                {stage.analogy.title}
              </div>
              <Text variant="sm-tight">{stage.analogy.body}</Text>
            </div>
          )}

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
            <div className={styles.decideHead}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: phase.color }}>
                What you decide here
              </div>
              <div className={styles.toggle} role="group" aria-label="Decision layout">
                {([["cards", "Cards"], ["list", "List"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.toggleBtn}
                    aria-pressed={decideView === id}
                    onClick={() => setDecideView(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {decideView === "cards" ? (
              <div className={styles.qaCards}>
                {stage.checks.map((c) => {
                  const id = idOf(c.q);
                  const ticked = read.includes(id);
                  return (
                    <div key={c.q} className={styles.qaCard} data-read={ticked || undefined}>
                      <button
                        type="button"
                        className={styles.qaOpen}
                        onClick={() => setParams({ card: id })}
                      >
                        <span className={styles.qaQ} style={{ color: phase.color }}>{c.q}</span>
                        <Text as="span" variant="xs">{rich(c.a)}</Text>
                        <span className={styles.qaMore}>Explain this &rarr;</span>
                      </button>
                      <button
                        type="button"
                        className={styles.qaSave}
                        aria-pressed={ticked}
                        aria-label={`Mark "${c.q}" as read`}
                        title={ticked ? "Marked as read" : "Mark as read"}
                        onClick={() => toggleFrontendCard(id)}
                      >
                        ✓
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {stage.checks.map((c) => (
                  <li key={c.q} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, fontFamily: "var(--sd-font-mono)", fontSize: 12, lineHeight: 1.65, color: phase.color }}>▸</span>
                    <Text variant="sm-tight">
                      <button
                        type="button"
                        className={styles.qaInline}
                        onClick={() => setParams({ card: idOf(c.q) })}
                        title={`What does "${c.q}" mean?`}
                      >
                        {c.q}
                      </button>
                      {rich(c.a)}
                    </Text>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: phase.color, marginBottom: 5 }}>
              The tell that it&rsquo;s done
            </div>
            <Text variant="sm-tight">{stage.tell}</Text>
          </div>

          {stage.deepDives && stage.deepDives.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <DeepDiveButton
                onClick={() => setPanelOpen(true)}
                label={`Deep dive into ${stage.label.toLowerCase()}`}
              />
            </div>
          )}
          </div>

          <Callout tone="accent" style={{ marginTop: 18 }}>
            Stages 1 and 2 light almost nothing, and that is the argument. {" "}
            <Strong>
              Neither one produces code, and they are the two that get skipped
            </Strong>
            , because skipping them is the only way to start building immediately.
          </Callout>
        </Section>

        <p className={styles.deckEnd}>End of the nine stages</p>

        <Section eyebrow="The Two Axes" title="Where Every Value On Screen Lives">

          <Prose>
            <p>
              Stage 4 is the one most designs lose, and it only ever asks two things:{" "}
              <Strong>who owns this</Strong> and{" "}
              <Strong>how long does it live</Strong>. Two questions make a plane, and
              each quadrant of it comes with its own instruction.
            </p>
          </Prose>

          <Figure scroll>
            <Diagram
              viewBox="0 0 680 410"
              label="A plane with ownership from client to server on the horizontal axis and lifetime from ephemeral to durable on the vertical. Hover state and scroll position are ephemeral and owned by the client; theme preference and URL state are owned by the client and durable; a fetched list is owned by the server and ephemeral; cached results and session identity are owned by the server and durable."
              title="Ownership against lifetime"
              minWidth={560}
            >

              <line x1={90} y1={350} x2={650} y2={350} stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <line x1={90} y1={350} x2={90} y2={70} stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <line x1={370} y1={70} x2={370} y2={350} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="4 5" />
              <line x1={90} y1={210} x2={650} y2={210} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="4 5" />

              <text x={90} y={374} fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill="var(--sd-muted)">
                &larr; CLIENT OWNS IT
              </text>
              <text x={650} y={374} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill="var(--sd-muted)">
                SERVER OWNS IT &rarr;
              </text>
              <text transform="translate(74 140) rotate(-90)" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill="var(--sd-muted)">
                DURABLE &uarr;
              </text>
              <text transform="translate(74 280) rotate(-90)" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" letterSpacing="1" fill="var(--sd-muted)">
                EPHEMERAL
              </text>

              {quadrants.map((q) => (
                <text key={q.id} x={q.x} y={q.y} textAnchor={q.anchor} fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">
                  {q.rule}
                </text>
              ))}

              {stateItems.map((item) => {
                const x = 90 + item.x * 560;
                const y = 350 - item.y * 280;
                const right = item.x > 0.5;
                return (
                  <g key={item.label}>
                    <circle cx={x} cy={y} r={5} fill="var(--sd-accent)" />
                    <text
                      x={right ? x - 11 : x + 11}
                      y={y + 4}
                      textAnchor={right ? "end" : "start"}
                      fontFamily="var(--sd-font-mono)"
                      fontSize="11.5"
                      fill="var(--sd-text)"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </Diagram>
            <p className="sd-figure-caption" style={{ marginBottom: 0, marginTop: 18 }}>
              The quadrant decides the mechanism, not your preference for a library
            </p>
          </Figure>

          <Callout>
            Nothing here is a type of state. They are{" "}
            <Strong>positions</Strong>, and a value can move: an unsaved draft that
            starts in the bottom left and gets autosaved has crossed into the top left, which is the moment it
            becomes your job to keep it.
          </Callout>
        </Section>

        <Section eyebrow="The Deliverable" title="Eight States, Not One">
          <StageLink n={5} onJump={jumpToStage} />

          <Prose>
            <p>
              Stage 5 asks what is on screen before the data is. This grid is the whole answer to it:{" "}
              <Strong>eight states, answered for every screen you ship</Strong>, and
              a screen with one of them designed is a screen that isn&rsquo;t finished.
            </p>
            <p>
              A mockup only ever shows the first one &mdash; the data arrived, the list had items,
              nobody lost their connection. The other seven have no picture to copy, which is why they
              get discovered in production, one support ticket at a time.
            </p>
          </Prose>

          <div className="sd-grid-2">
            {uiStates.map((s) => (
              <div key={s.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-violet)", marginBottom: 3, fontFamily: "var(--sd-font-mono)" }}>
                  {s.label}
                </div>
                <Text variant="xs">{s.note}</Text>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="The Budget" title="What &ldquo;Fast Enough&rdquo; Actually Means">
          <StageLink n={7} onJump={jumpToStage} />

          <Prose>
            <p>
              A budget is a number you agree on <em>before</em> you build, so that &ldquo;is it fast
              enough&rdquo; has an answer instead of an argument.{" "}
              <Strong>Without one, every performance technique is optional and
              nothing can ever be called done</Strong>, because there is nothing to be done against.
            </p>
            <p>
              Four of stage 7&rsquo;s numbers come with the line already drawn. These are the published
              Core Web Vitals thresholds, the same ones search engines and Lighthouse score you on, so
              the only question left is which side of them you land on.
            </p>
          </Prose>

          <Figure scroll>
            <Diagram
              viewBox="0 0 680 282"
              label="Core Web Vitals thresholds. LCP good at or under 2.5 seconds, poor over 4. INP good at or under 200 milliseconds, poor over 500. CLS good at or under 0.1, poor over 0.25. TTFB good at or under 0.8 seconds, poor over 1.8."
              title="Core Web Vitals thresholds"
              minWidth={540}
            >

              {vitals.map((v, i) => {
                const y = 30 + i * 56;
                const x0 = 60;
                const w = 380;
                const gw = (v.good / v.scale) * w;
                const mw = ((v.poor - v.good) / v.scale) * w;
                return (
                  <g key={v.name}>
                    <text x={x0 - 12} y={y + 15} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">
                      {v.name}
                    </text>
                    <rect x={x0} y={y} width={gw} height={20} fill="var(--sd-done-wash)" stroke="var(--sd-done)" strokeWidth="1" />
                    <rect x={x0 + gw} y={y} width={mw} height={20} fill="var(--sd-warm-wash)" stroke="var(--sd-warm)" strokeWidth="1" />
                    <rect x={x0 + gw + mw} y={y} width={w - gw - mw} height={20} fill="var(--sd-danger-wash)" stroke="var(--sd-danger)" strokeWidth="1" />

                    <text x={x0 + gw} y={y + 34} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-done)">
                      {`${v.good}${v.unit}`}
                    </text>
                    <text x={x0 + gw + mw} y={y + 34} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-danger)">
                      {`${v.poor}${v.unit}`}
                    </text>
                    <text x={x0 + w + 14} y={y + 15} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">
                      {v.full}
                    </text>
                  </g>
                );
              })}

              {[
                { label: "good", color: "var(--sd-done)" },
                { label: "needs work", color: "var(--sd-warm)" },
                { label: "poor", color: "var(--sd-danger)" },
              ].map((k, i) => (
                <g key={k.label}>
                  <rect x={60 + i * 110} y={262} width={10} height={10} fill={k.color} />
                  <text x={76 + i * 110} y={271} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">
                    {k.label}
                  </text>
                </g>
              ))}
            </Diagram>
            <p className="sd-figure-caption" style={{ marginBottom: 0, marginTop: 18 }}>
              Good, needs work, poor. The boundaries are published, not chosen by you
            </p>
          </Figure>

          <div className="sd-grid-2">
            {vitals.map((v) => (
              <div key={v.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)" }}>
                    {`${v.name} · ${v.full}`}
                  </span>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-done)", whiteSpace: "nowrap" }}>
                    {`good ≤ ${v.good}${v.unit}`}
                  </span>
                </div>
                <Text variant="xs">{v.means}</Text>
              </div>
            ))}
          </div>

          <Prose style={{ marginTop: 22 }}>
            <p>
              The other five have no published threshold, so{" "}
              <Strong>you have to pick a number and write it down</Strong>. A budget
              you chose arbitrarily still beats no budget, because only one of the two can be exceeded.
              These are reasonable places to start arguing from.
            </p>
          </Prose>

          <div className="sd-stack">
            {ownBudgets.map((b) => (
              <div key={b.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)" }}>
                    {b.name}
                  </span>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-warm)" }}>
                    {b.start}
                  </span>
                </div>
                <Text variant="xs">{b.note}</Text>
              </div>
            ))}
          </div>

          <Callout tone="green" style={{ marginTop: 18 }}>
            Measure them on the device from stage 1, not on your laptop.{" "}
            <Strong>A budget met on a machine nobody in your requirements owns
            is not a budget</Strong>, it is a screenshot.
          </Callout>
        </Section>

        <Section eyebrow="Why This Exists" title="Why Frontend Design Needs Its Own Order">
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists.map(hl)} />
        </Section>

        <Section eyebrow="The Difference" title="Same Discipline, Different Physics">

          <Prose>
            <p>
              The{" "}
              <Term label="seven step backend walkthrough" href="/walkthrough">
                Clarify requirements → estimate capacity → high-level design → database design →
                interface design → scalability → reliability. Seven steps for the server side, where
                each one hands something concrete to the next and the first two draw nothing at all.
              </Term>{" "}
              and these nine stages are the same instinct (work in an order, produce something at each
              step) applied to two problems that fail differently.
            </p>
          </Prose>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
                <thead>
                  <tr>
                    {["", "Backend", "Frontend"].map((h) => (
                      <th
                        key={h}
                        style={{ padding: "12px 16px", textAlign: "left", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--sd-border)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {differences.map(([axis, back, front]) => (
                    <tr key={axis}>
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", fontFamily: "var(--sd-font-mono)", fontSize: 12, color: "var(--sd-muted)" }}>{axis}</td>
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", color: "var(--sd-muted)" }}>{rich(back)}</td>
                      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--sd-border)", color: "var(--sd-text)" }}>{rich(front)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section eyebrow="Common Mistakes" title="Ways These Nine Stages Get Misused">
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} />
        </Section>

        <Section eyebrow="Key Points" title="What To Carry Out Of This">
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} />
        </Section>

        <Section eyebrow="Answered In Full" title="The Same Decisions, As Interview Questions">

          <Prose>
            <p>
              A stage names the decision; these are the mechanisms underneath it, each written out
              the way you would say it in the room. They open on the Q&amp;A page and come back here
              when you close them.
            </p>
          </Prose>

          <div className={styles.deeper}>
            {deeper.map(({ n, questions }) => {
              const target = stages[n - 1];
              const colour = phases.find((p) => p.id === target.phase)!.color;
              return (
                <div key={n} className={styles.deeperStage}>
                  <div className={styles.deeperTags}>
                    {labelsIn(questions).map((label) => (
                      <span key={label} className={styles.deeperTag}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className={styles.deeperHead} style={{ color: colour }}>
                    {`Stage ${n} · ${target.label}`}
                  </p>
                  <ul className={styles.deeperList}>
                    {questions.map((q) => (
                      <li key={q.id}>
                        <a
                          className={styles.deeperLink}
                          href={prepHref(q)}
                        >
                          {q.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Section>
      </PageLayout>

      <SidePanel
        open={openCheck !== null}
        onClose={() => setParams({ card: null })}
        title={openCheck?.q ?? ""}
        eyebrow="In plain words"
      >
        {openCheck && (
          <>
            <Card variant="panel" title="What it is">
              <Text variant="xs">{rich(openCheck.explain.plain)}</Text>
            </Card>
            <Card variant="panel" title="Where you have met it">
              {openCheck.explain.seen.length > 1 ? (
                <ul className={styles.seenList}>
                  {openCheck.explain.seen.map((line) => (
                    <li key={line} className="sd-text-xs">{rich(line)}</li>
                  ))}
                </ul>
              ) : (
                <Text variant="xs">{rich(openCheck.explain.seen[0])}</Text>
              )}
            </Card>
            <Card variant="panel" title="What you decide here">
              <Text variant="xs">{rich(openCheck.a)}</Text>
            </Card>
            <PanelNote>
              <Strong>How to answer it: </Strong>
              {rich(openCheck.explain.say)}
            </PanelNote>
          </>
        )}
      </SidePanel>

      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={stage.label}
        eyebrow={`Stage ${stage.n} deep dive`}
      >
        {(stage.deepDives ?? []).map((dive, i) => (
          <PanelSection key={dive.id} title={dive.question} defaultOpen={i === 0}>
            <Text variant="sm">{dive.intro}</Text>
            {dive.cards.map((card) => (
              <Card key={card.title} variant="panel" title={card.title}>
                <Text variant="xs">{card.body}</Text>
              </Card>
            ))}
            <PanelNote>{dive.note}</PanelNote>
          </PanelSection>
        ))}
      </SidePanel>
    </>
  );
}
