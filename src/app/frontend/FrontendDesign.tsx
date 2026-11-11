"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Breadcrumb,
  DeepDiveButton,
  LearnedToggle,
  MarkerList,
  PageLayout,
  PanelSection,
  SidePanel,
  Term,
} from "@/components";
import { hl } from "@/lib/highlight";
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
      return <strong key={i} className="sd-strong">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      /* A snippet with a line break is a block, not a phrase in a sentence. */
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

/* A topic names two things where it covers two ("Next.js & build"), and the tags
   are what the card is about, so each half is its own label. */
function labelsIn(questions: Deeper["questions"]) {
  const parts = questions.flatMap((q) => q.topic.split(" & "));
  return [...new Set(parts)].map((part) => part[0].toUpperCase() + part.slice(1));
}

export interface Deeper {
  n: number;
  questions: { id: string; title: string; topic: string }[];
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
        <p className="sd-eyebrow">Frontend Design</p>
        <LearnedToggle />
        <h1 className="sd-h1">A 9-step walkthrough to Frontend System Design</h1>
        <p className="sd-lede">
          The same discipline as backend system design, pointed at a machine you don&rsquo;t own.
        </p>

        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              A backend design grows outward: each step earns another box on the diagram. A frontend
              design doesn&rsquo;t. <strong className="sd-strong">The stack is the same nine times over</strong>:
              shell, router, components, store, cache, transport, storage. What each stage changes is
              who owns which part of it, how long the data inside it lives, and what the user is looking at
              while it&rsquo;s still arriving.
            </p>
            <p>
              So these nine stages are nine passes over one picture, not nine additions to it.
            </p>
          </div>
        </div>

        <div className="sd-section" ref={deckRef}>
          <p className="sd-eyebrow">Walk It</p>
          <h2 className="sd-h2">Nine Stages, One Stack</h2>

          <div className="sd-prose">
            <p>
              Step through it. <strong className="sd-strong">No stage adds a box after stage 3</strong>.
              Each one lights up the layers it governs, and the ones left grey are somebody else&rsquo;s
              problem for now.
            </p>
          </div>

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

          <div className="sd-figure" style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
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
                <svg
                  viewBox="0 0 760 526"
                  role="img"
                  aria-label={`The client stack at stage ${active}, ${stage.label}. ${stage.draws}`}
                  className={styles.stack}
                  style={{ width: "100%", minWidth: 560, display: "block" }}
                >
                  <title>{`The client stack at stage ${active}`}</title>
                  <defs>
                    <marker
                      id="sd-fe-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-border-strong)" />
                    </marker>
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
                </svg>
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
          </div>

          <div key={active} className={stepped ? styles.slide : undefined} data-dir={dir}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: phase.wash, border: "1px solid var(--sd-border)", borderRadius: 8, padding: "13px 16px", marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12, color: phase.color, flexShrink: 0, lineHeight: 1.65 }}>
              {`0${stage.n}`}
            </span>
            <p className="sd-text-sm-tight">{stage.draws}</p>
          </div>

          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <p className="sd-text-sm-tight" style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5 }}>
              {stage.decides}
            </p>
          </div>

          {stage.analogy && (
            <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: phase.color, marginBottom: 6 }}>
                Think of it like
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sd-text)", marginBottom: 7 }}>
                {stage.analogy.title}
              </div>
              <p className="sd-text-sm-tight">{stage.analogy.body}</p>
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
                        <span className="sd-text-xs">{rich(c.a)}</span>
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
                    <p className="sd-text-sm-tight">
                      <button
                        type="button"
                        className={styles.qaInline}
                        onClick={() => setParams({ card: idOf(c.q) })}
                        title={`What does "${c.q}" mean?`}
                      >
                        {c.q}
                      </button>
                      {rich(c.a)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: phase.color, marginBottom: 5 }}>
              The tell that it&rsquo;s done
            </div>
            <p className="sd-text-sm-tight">{stage.tell}</p>
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

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 18 }}>
            Stages 1 and 2 light almost nothing, and that is the argument. {" "}
            <strong className="sd-strong">
              Neither one produces code, and they are the two that get skipped
            </strong>
            , because skipping them is the only way to start building immediately.
          </div>
        </div>

        <p className={styles.deckEnd}>End of the nine stages</p>

        <div className="sd-section">
          <p className="sd-eyebrow">The Two Axes</p>
          <h2 className="sd-h2">Where Every Value On Screen Lives</h2>

          <div className="sd-prose">
            <p>
              Stage 4 is the one most designs lose, and it only ever asks two things:{" "}
              <strong className="sd-strong">who owns this</strong> and{" "}
              <strong className="sd-strong">how long does it live</strong>. Two questions make a plane, and
              each quadrant of it comes with its own instruction.
            </p>
          </div>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 680 410"
              role="img"
              aria-label="A plane with ownership from client to server on the horizontal axis and lifetime from ephemeral to durable on the vertical. Hover state and scroll position are ephemeral and owned by the client; theme preference and URL state are owned by the client and durable; a fetched list is owned by the server and ephemeral; cached results and session identity are owned by the server and durable."
              style={{ width: "100%", minWidth: 560, display: "block" }}
            >
              <title>Ownership against lifetime</title>

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
            </svg>
            <p className="sd-figure-caption" style={{ marginBottom: 0, marginTop: 18 }}>
              The quadrant decides the mechanism, not your preference for a library
            </p>
          </div>

          <div className="sd-callout">
            Nothing here is a type of state. They are{" "}
            <strong className="sd-strong">positions</strong>, and a value can move: an unsaved draft that
            starts in the bottom left and gets autosaved has crossed into the top left, which is the moment it
            becomes your job to keep it.
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">The Deliverable</p>
          <h2 className="sd-h2">Eight States, Not One</h2>
          <StageLink n={5} onJump={jumpToStage} />

          <div className="sd-prose">
            <p>
              Stage 5 asks what is on screen before the data is. This grid is the whole answer to it:{" "}
              <strong className="sd-strong">eight states, answered for every screen you ship</strong>, and
              a screen with one of them designed is a screen that isn&rsquo;t finished.
            </p>
            <p>
              A mockup only ever shows the first one &mdash; the data arrived, the list had items,
              nobody lost their connection. The other seven have no picture to copy, which is why they
              get discovered in production, one support ticket at a time.
            </p>
          </div>

          <div className="sd-grid-2">
            {uiStates.map((s) => (
              <div key={s.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-violet)", marginBottom: 3, fontFamily: "var(--sd-font-mono)" }}>
                  {s.label}
                </div>
                <p className="sd-text-xs">{s.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">The Budget</p>
          <h2 className="sd-h2">What &ldquo;Fast Enough&rdquo; Actually Means</h2>
          <StageLink n={7} onJump={jumpToStage} />

          <div className="sd-prose">
            <p>
              A budget is a number you agree on <em>before</em> you build, so that &ldquo;is it fast
              enough&rdquo; has an answer instead of an argument.{" "}
              <strong className="sd-strong">Without one, every performance technique is optional and
              nothing can ever be called done</strong>, because there is nothing to be done against.
            </p>
            <p>
              Four of stage 7&rsquo;s numbers come with the line already drawn. These are the published
              Core Web Vitals thresholds, the same ones search engines and Lighthouse score you on, so
              the only question left is which side of them you land on.
            </p>
          </div>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 680 282"
              role="img"
              aria-label="Core Web Vitals thresholds. LCP good at or under 2.5 seconds, poor over 4. INP good at or under 200 milliseconds, poor over 500. CLS good at or under 0.1, poor over 0.25. TTFB good at or under 0.8 seconds, poor over 1.8."
              style={{ width: "100%", minWidth: 540, display: "block" }}
            >
              <title>Core Web Vitals thresholds</title>

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
            </svg>
            <p className="sd-figure-caption" style={{ marginBottom: 0, marginTop: 18 }}>
              Good, needs work, poor. The boundaries are published, not chosen by you
            </p>
          </div>

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
                <p className="sd-text-xs">{v.means}</p>
              </div>
            ))}
          </div>

          <div className="sd-prose" style={{ marginTop: 22 }}>
            <p>
              The other five have no published threshold, so{" "}
              <strong className="sd-strong">you have to pick a number and write it down</strong>. A budget
              you chose arbitrarily still beats no budget, because only one of the two can be exceeded.
              These are reasonable places to start arguing from.
            </p>
          </div>

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
                <p className="sd-text-xs">{b.note}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-green" style={{ marginTop: 18 }}>
            Measure them on the device from stage 1, not on your laptop.{" "}
            <strong className="sd-strong">A budget met on a machine nobody in your requirements owns
            is not a budget</strong>, it is a screenshot.
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">Why Frontend Design Needs Its Own Order</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists.map(hl)} />
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">The Difference</p>
          <h2 className="sd-h2">Same Discipline, Different Physics</h2>

          <div className="sd-prose">
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
          </div>

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
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Common Mistakes</p>
          <h2 className="sd-h2">Ways These Nine Stages Get Misused</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} />
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Key Points</p>
          <h2 className="sd-h2">What To Carry Out Of This</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} />
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Answered In Full</p>
          <h2 className="sd-h2">The Same Decisions, As Interview Questions</h2>

          <div className="sd-prose">
            <p>
              A stage names the decision; these are the mechanisms underneath it, each written out
              the way you would say it in the room. They open on the Q&amp;A page and come back here
              when you close them.
            </p>
          </div>

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
                          href={`/interview-qa?q=${q.id}&topic=${encodeURIComponent(q.topic)}`}
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
        </div>
      </PageLayout>

      <SidePanel
        open={openCheck !== null}
        onClose={() => setParams({ card: null })}
        title={openCheck?.q ?? ""}
        eyebrow="In plain words"
      >
        {openCheck && (
          <>
            <div className="sd-panel-card">
              <div className="sd-panel-card-title">What it is</div>
              <p className="sd-text-xs">{rich(openCheck.explain.plain)}</p>
            </div>
            <div className="sd-panel-card">
              <div className="sd-panel-card-title">Where you have met it</div>
              {openCheck.explain.seen.length > 1 ? (
                <ul className={styles.seenList}>
                  {openCheck.explain.seen.map((line) => (
                    <li key={line} className="sd-text-xs">{rich(line)}</li>
                  ))}
                </ul>
              ) : (
                <p className="sd-text-xs">{rich(openCheck.explain.seen[0])}</p>
              )}
            </div>
            <div className="sd-panel-card">
              <div className="sd-panel-card-title">What you decide here</div>
              <p className="sd-text-xs">{rich(openCheck.a)}</p>
            </div>
            <div className="sd-panel-note">
              <strong className="sd-strong">How to answer it: </strong>
              {rich(openCheck.explain.say)}
            </div>
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
            <p className="sd-text-sm">{dive.intro}</p>
            {dive.cards.map((card) => (
              <div key={card.title} className="sd-panel-card">
                <div className="sd-panel-card-title">{card.title}</div>
                <p className="sd-text-xs">{card.body}</p>
              </div>
            ))}
            <div className="sd-panel-note">{dive.note}</div>
          </PanelSection>
        ))}
      </SidePanel>
    </>
  );
}
