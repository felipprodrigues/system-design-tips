"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  LearnedToggle,
  MarkerList,
  PageLayout,
  QuizCarousel,
} from "@/components";
import { hl } from "@/lib/highlight";
/* The scrolling chip track is defined once, in the /frontend module, and shared
   from here rather than copied: two stylesheets drifting apart is how the same
   control ends up looking like two. */
import track from "../frontend/Frontend.module.css";
import {
  commonMistakes,
  earlyWarning,
  findings,
  keyPoints,
  lifecycle,
  ownership,
  quizCards,
  strategies,
  terms,
  testing,
  tryIt,
  type Finding,
} from "./data";

/** One Q&A question, resolved against the document at build time by the route. */
export interface Deeper {
  id: string;
  title: string;
  topic: string;
}

const code = {
  background: "var(--sd-bg)",
  border: "1px solid var(--sd-border)",
  borderRadius: 10,
  padding: "16px 18px",
  marginBottom: 16,
  overflowX: "auto",
  fontSize: 12.5,
  lineHeight: 1.85,
} as const;

/* Four kinds of statement, told apart by colour before they are read. Nothing on
   this page came from source code, so a guess has to stay visibly a guess: the
   labels are first person on purpose, because one person clicking around a UI is
   the entire basis for all of it. */
const CLAIM = {
  saw: { label: "What I saw", colour: "var(--sd-warm)", bg: "var(--sd-warm-wash)" },
  expected: { label: "What I expected", colour: "var(--sd-accent)", bg: "var(--sd-accent-wash)" },
  unsure: { label: "What I cannot tell", colour: "var(--sd-danger)", bg: "var(--sd-danger-wash)" },
  build: { label: "How I would build it", colour: "var(--sd-green)", bg: "var(--sd-surface2)" },
} as const;

function Claim({ kind, children }: { kind: keyof typeof CLAIM; children: ReactNode }) {
  const { label, colour, bg } = CLAIM[kind];
  return (
    <div style={{ background: bg, border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 16px" }}>
      <p className="sd-eyebrow-sub" style={{ color: colour, marginBottom: 6 }}>{label}</p>
      <p className="sd-text-sm-tight">{children}</p>
    </div>
  );
}

/* Deep links into the Q&A rather than a retelling of it. Each question already
   answers the mechanic a finding runs into, so the finding points at it instead
   of explaining it a second time in slightly different words. */
function QaLinks({ questions }: { questions: Deeper[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="sd-card" style={{ marginTop: 12 }}>
      <p className="sd-eyebrow-sub" style={{ color: "var(--sd-teal)" }}>Already answered in the Q&amp;A</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {questions.map((question) => (
          <a
            key={question.id}
            href={`/interview-qa?q=${question.id}&topic=${encodeURIComponent(question.topic)}`}
            style={{ display: "inline-block", padding: "5px 10px", background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 7, color: "var(--sd-text)", fontSize: 12.5, lineHeight: 1.4 }}
          >
            {question.title}
          </a>
        ))}
      </div>
    </div>
  );
}

/* Each finding's own material, rendered inside its panel. Finding 1 carries the
   offset arithmetic and the in-flight guard; finding 2 the ownership model and
   the mutation lifecycle; findings 3 and 4 are genuinely thinner, and padding
   them out to match would be inventing material to fill a grid. */
function DeepDiveOne() {
  return (
    <div id="offset" style={{ marginTop: 26 }}>
      <h2 className="sd-h2">Why That Fix Has A Second Half</h2>

      <div className="sd-prose">
        <p>
          Finding 1 ends on a clause that looks like a detail:{" "}
          <em>and pull the next offset back by one</em>. This section is here to earn
          it, because the obvious fix without that clause is worse than the bug.
        </p>
        <p style={{ marginTop: 12 }}>
          A list that resets after a delete looks like it is resetting too much, so the
          obvious move is to stop resetting it: take the deleted row out of the pages
          already loaded and leave everything else alone. Do exactly that and you trade
          a loud bug for a silent one. The list keeps loading, nobody files anything,
          and <strong className="sd-strong">one skill quietly stops existing</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          Unlike the rest of this page, none of what follows is a guess about anyone. It
          is arithmetic, and it holds for any list that asks for records{" "}
          <strong className="sd-strong">by position</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          Think of the list as a book, and of the browser as a reader with a bookmark.
          You read the first four pages and leave the bookmark on page 5, because that
          is where you will carry on. Then somebody tears page 2 out. Every page after
          it slides forward by one, but your bookmark still says{" "}
          <strong className="sd-strong">page 5</strong>, and page 5 is no longer the
          page you meant. You carry on from the wrong place and skip one, and the book
          still opens perfectly, which is why you never notice.
        </p>
      </div>

      <p className="sd-eyebrow-sub">The same thing, with eight skills and a page size of four</p>

      <div className="sd-figure" style={{ overflowX: "auto" }}>
        <OffsetShift />
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginTop: 18, fontSize: 11.5, color: "var(--sd-muted)", fontFamily: "var(--sd-font-mono)" }}>
          <Swatch colour="var(--sd-accent)" wash="var(--sd-accent-wash)">already in the browser</Swatch>
          <Swatch colour="var(--sd-teal)" wash="var(--sd-surface2)">the next request returns</Swatch>
          <Swatch colour="var(--sd-danger)" wash="var(--sd-danger-wash)">asked for by nobody</Swatch>
        </div>
      </div>

      <div className="sd-callout sd-callout-accent">
        Read the middle row twice. <strong className="sd-strong">E has not been
        deleted</strong>, and it has not failed to load. It simply moved from spot 4 to
        spot 3, and spot 3 is behind where the browser is reading from. Nothing in the
        request or the response is an error, and nobody is ever told.
      </div>

      <p className="sd-eyebrow-sub" style={{ marginTop: 22 }}>
        Line by line, in plain JavaScript
      </p>
      <pre style={code}>
        <code className="sd-strong">
          <span className="sd-hl-muted">{"// The server has eight skills. The page size is four."}</span>{"\n"}
          <span className="sd-hl-accent">const</span> server = [<span className="sd-hl-amber">&quot;A&quot;</span>,<span className="sd-hl-amber">&quot;B&quot;</span>,<span className="sd-hl-amber">&quot;C&quot;</span>,<span className="sd-hl-amber">&quot;D&quot;</span>,<span className="sd-hl-amber">&quot;E&quot;</span>,<span className="sd-hl-amber">&quot;F&quot;</span>,<span className="sd-hl-amber">&quot;G&quot;</span>,<span className="sd-hl-amber">&quot;H&quot;</span>];{"\n\n"}
          <span className="sd-hl-muted">{"// The browser asked for the first four and kept them."}</span>{"\n"}
          <span className="sd-hl-accent">let</span> loaded = [<span className="sd-hl-amber">&quot;A&quot;</span>,<span className="sd-hl-amber">&quot;B&quot;</span>,<span className="sd-hl-amber">&quot;C&quot;</span>,<span className="sd-hl-amber">&quot;D&quot;</span>];{"\n"}
          <span className="sd-hl-accent">let</span> bookmark = <span className="sd-hl-accent">4</span>;{"              "}<span className="sd-hl-muted">{"// where the NEXT request starts"}</span>{"\n\n"}
          <span className="sd-hl-muted">{"// Now B is deleted. On the server, everyone after B moves up:"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   before   A B C D E F G H     E was at spot 4"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   after    A C D E F G H       E is at spot 3"}</span>{"\n\n"}
          loaded = loaded.<span className="sd-hl">filter</span>((s) =&gt; s !== <span className="sd-hl-amber">&quot;B&quot;</span>);{"\n"}
          <span className="sd-hl-muted">{"//   loaded is now [\"A\",\"C\",\"D\"], three instead of four,"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   and nobody touched the bookmark"}</span>{"\n\n"}
          <span className="sd-hl-muted">{"// The next scroll fires and asks for four, starting at spot 4:"}</span>{"\n"}
          server.<span className="sd-hl">slice</span>(bookmark, bookmark + <span className="sd-hl-accent">4</span>);{"\n"}
          <span className="sd-hl-muted">{"//   → [\"F\",\"G\",\"H\"]"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   E is not in there, and it never will be. It sits at spot 3,"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   which the browser believes it has already read."}</span>
        </code>
      </pre>

      <p className="sd-eyebrow-sub">The fix is one line, and it is the whole lesson</p>
      <pre style={code}>
        <code className="sd-strong">
          <span className="sd-hl-accent">function</span> <span className="sd-hl">onDeleted</span>(name) {"{"}{"\n"}
          {"  "}<span className="sd-hl-accent">const</span> spot = loaded.<span className="sd-hl">indexOf</span>(name);{"\n\n"}
          {"  "}<span className="sd-hl-muted">{"// Was the deleted row inside the part we already read?"}</span>{"\n"}
          {"  "}<span className="sd-hl-accent">if</span> (spot === <span className="sd-hl-accent">-1</span>) <span className="sd-hl-accent">return</span>;{"       "}<span className="sd-hl-muted">{"// No. Our count is unaffected."}</span>{"\n\n"}
          {"  "}loaded.<span className="sd-hl">splice</span>(spot, <span className="sd-hl-accent">1</span>);{"       "}<span className="sd-hl-muted">{"// Yes. Drop it from our copy,"}</span>{"\n"}
          {"  "}bookmark -= <span className="sd-hl-accent">1</span>;{"             "}<span className="sd-hl-muted">{"// and move the bookmark back with it."}</span>{"\n"}
          {"}"}{"\n\n"}
          <span className="sd-hl-muted">{"// bookmark is 3 now, so the next request returns:"}</span>{"\n"}
          <span className="sd-hl-muted">{"//   [\"E\",\"F\",\"G\",\"H\"]   nothing skipped"}</span>
        </code>
      </pre>

      <div className="sd-callout sd-callout-accent">
        That <code style={{ color: "var(--sd-teal)" }}>if (spot === -1) return</code> is
        doing more work than it looks. If you delete a row the browser never loaded, it
        was never in front of the bookmark, so moving the bookmark would skip a
        different record instead. A good number of deletion bugs in a paginated list are
        this one condition, written the wrong way round.
      </div>

      <div className="sd-grid-2" style={{ marginTop: 16 }}>
        <div className="sd-card">
          <p className="sd-eyebrow-sub" style={{ color: "var(--sd-amber)" }}>Asking by position</p>
          <p className="sd-text-sm-tight">
            &ldquo;Give me four, starting at spot 4.&rdquo; Trivial to implement, works
            on any query, and every deletion in front of the bookmark quietly breaks the
            arithmetic. Fine for a list nothing changes.
          </p>
        </div>
        <div className="sd-card">
          <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>Asking by record</p>
          <p className="sd-text-sm-tight">
            &ldquo;Give me four, starting after D.&rdquo; Deleting B does not move D, so
            this cannot happen at all. Known as cursor pagination. Costs a stable sort
            key and a cursor the server can resolve.
          </p>
        </div>
      </div>

      <p className="sd-text-sm" style={{ marginTop: 14 }}>
        {hl(
          "A list people can change wants the second one. If the first is already shipped, the deletion path has to keep the arithmetic honest by hand, *and that is a thing to decide once, not in every handler that happens to remove a row*.",
        )}
      </p>

      <div className="sd-callout" style={{ marginTop: 18 }}>
        <strong className="sd-strong">Back to finding 1.</strong> A list that stops
        loading is annoying and obvious, and somebody reports it within a day. A list
        that drops one row out of forty is neither, and the usual way to get one is to
        fix the other carelessly. That is the only reason this section exists: not to
        explain what I saw, but to explain what I would have shipped if I had fixed what
        I saw without thinking about the bookmark.
      </div>

      <p className="sd-eyebrow-sub">A late response is not a valid response</p>
      <pre style={code}>
        <code className="sd-strong">
          <span className="sd-hl-muted">{"// issued against spot 4; a delete landed while it was in flight"}</span>{"\n"}
          <span className="sd-hl-accent">function</span> <span className="sd-hl">onPageResponse</span>(request, response) {"{"}{"\n"}
          {"  "}<span className="sd-hl-accent">const</span> entry = cache[request.filter];{"\n\n"}
          {"  "}<span className="sd-hl-muted">{"// the bookmark moved while this was on its way, so this page"}</span>{"\n"}
          {"  "}<span className="sd-hl-muted">{"// describes a list that no longer exists. writing it back"}</span>{"\n"}
          {"  "}<span className="sd-hl-muted">{"// would put the deleted row on screen again."}</span>{"\n"}
          {"  "}<span className="sd-hl-accent">if</span> (request.start !== entry.bookmark) <span className="sd-hl-accent">return</span>;{"\n\n"}
          {"  "}<span className="sd-hl">append</span>(entry, response.items);{"\n"}
          {"}"}
        </code>
      </pre>
    </div>
  );
}

function DeepDiveTwo() {
  return (
    <div id="design" style={{ marginTop: 26 }}>
      <h2 className="sd-h2">Who Owns What, And What Changes When It Changes</h2>

      <div className="sd-prose">
        <p>
          Findings 1 and 2 rhyme. Both are what a second copy of something that already
          had an owner looks like from the outside. The design I would reach for is not
          a cleverer delete handler, it is{" "}
          <strong className="sd-strong">one owner per piece of state</strong> and
          everything else derived.
        </p>
      </div>

      <div className="sd-grid-3">
        {ownership.map((row) => (
          <div key={row.owner} className="sd-card">
            <p className="sd-eyebrow-sub" style={{ color: row.colour }}>{row.owner}</p>
            <p className="sd-text-sm-tight">{row.holds}</p>
          </div>
        ))}
      </div>

      <p className="sd-eyebrow-sub">The model, and the one field everything turns on</p>
      <pre style={code}>
        <code className="sd-strong">
          <span className="sd-hl-accent">type</span> <span className="sd-hl">Skill</span> = {"{"}{"\n"}
          {"  "}id: <span className="sd-hl-accent">string</span>;{"\n"}
          {"  "}name: <span className="sd-hl-accent">string</span>;{"\n"}
          {"  "}category: <span className="sd-hl-accent">string</span>;{"\n"}
          {"  "}endorsements: <span className="sd-hl-accent">number</span>;{"\n"}
          {"  "}priority: <span className="sd-hl-accent">number</span>;{"      "}<span className="sd-hl-muted">{"// the user's rank. nothing else writes it"}</span>{"\n"}
          {"}"};{"\n\n"}
          <span className="sd-hl-accent">type</span> <span className="sd-hl">SkillsUIState</span> = {"{"}{"\n"}
          {"  "}selectedCategory: <span className="sd-hl-accent">string</span>;{"   "}<span className="sd-hl-muted">{"// never reconciled by a mutation"}</span>{"\n"}
          {"  "}editingSkillId: <span className="sd-hl-accent">string</span> | <span className="sd-hl-accent">null</span>;{"\n"}
          {"}"};{"\n\n"}
          <span className="sd-hl-muted">{"// the filter is part of the identity, or two views share one slot"}</span>{"\n"}
          <span className="sd-hl-accent">const</span> key = [<span className="sd-hl-amber">&quot;skills&quot;</span>, {"{"} category: <span className="sd-hl-amber">&quot;Frontend&quot;</span> {"}"}];
        </code>
      </pre>

      <p className="sd-eyebrow-sub" style={{ marginTop: 20 }}>The mutation lifecycle, in six steps</p>
      <div className="sd-grid-3">
        {lifecycle.map((step, i) => (
          <div key={step.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, alignSelf: "stretch", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(76, 110, 245, 0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sd-text)" }}>{step.name}</span>
              </div>
              <p className="sd-text-sm-tight">{step.sub}</p>
            </div>
            {i % 3 !== 2 && i !== lifecycle.length - 1 && (
              <span aria-hidden style={{ flexShrink: 0, color: "var(--sd-muted)", fontSize: 12 }}>&#8594;</span>
            )}
          </div>
        ))}
      </div>

      <div className="sd-callout" style={{ marginTop: 14 }}>
        Step 6 is the one that gets left out, and finding 1 is what leaving it out would
        look like from outside. Steps 4 and 5 are where finding 2 would live:
        reconciling only the collection on screen, or updating a copy instead of
        re-deriving.
      </div>

      <p className="sd-eyebrow-sub" style={{ marginTop: 22 }}>Optimistic update vs refetch after success</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
        <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: strategies[0].wash, color: strategies[0].colour, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {strategies[0].label}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {strategies[0].points.map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: strategies[0].colour, fontSize: 11, lineHeight: 1.7 }}>&#9679;</span>
                <p className="sd-text-sm-tight">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
        </div>

        <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: strategies[1].wash, color: strategies[1].colour, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {strategies[1].label}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {strategies[1].points.map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: strategies[1].colour, fontSize: 11, lineHeight: 1.7 }}>&#9679;</span>
                <p className="sd-text-sm-tight">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
        For a destructive action on a list, the honest default is{" "}
        <strong className="sd-strong">optimistic with a snapshot</strong>: copy the
        cached collections before the edit, restore the copy if the server says no.
        Reversing the edit by hand means reinserting the row at the right index and
        undoing the bookmark arithmetic, and that reverse path is the one nobody tests.
      </div>
    </div>
  );
}

function DeepDiveFour() {
  return (
    <div style={{ marginTop: 26 }}>
      <p className="sd-eyebrow-sub">The rank a new record gets</p>
      <pre style={code}>
        <code className="sd-strong">
          <span className="sd-hl-muted">{"// Puts every new skill first, and quietly renumbers nothing,"}</span>{"\n"}
          <span className="sd-hl-muted">{"// which is why it looks harmless until someone has an order."}</span>{"\n"}
          <span className="sd-hl-accent">const</span> rank = <span className="sd-hl">Math</span>.<span className="sd-hl">min</span>(...ranks) - <span className="sd-hl-accent">1</span>;{"\n\n"}
          <span className="sd-hl-muted">{"// Puts it last, and leaves every rank the user set alone."}</span>{"\n"}
          <span className="sd-hl-accent">const</span> rank = <span className="sd-hl">Math</span>.<span className="sd-hl">max</span>(...ranks) + <span className="sd-hl-accent">1</span>;
        </code>
      </pre>

      <div className="sd-callout sd-callout-accent">
        Either is defensible. What is not defensible is picking one by accident, which
        is what happens when there is no rank field and the order falls out of whatever
        the database returns. And if ranks can tie,{" "}
        <strong className="sd-strong">sort stably</strong>, or equal records will swap
        places between renders for no reason anyone can see.
      </div>
    </div>
  );
}

/* One tier at a time. Three of these stacked was the single longest stretch of
   uninterrupted text on the page, and nobody reads the third one. */
function TestTiers() {
  const [active, setActive] = useState(0);
  const tier = testing[active];

  return (
    <div className="sd-figure" style={{ padding: 0, overflow: "hidden" }}>
      <div role="group" aria-label="Test tier" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--sd-border)" }}>
        {testing.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.tier}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              style={{
                cursor: "pointer",
                fontFamily: "var(--sd-font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "9px 13px",
                textAlign: "center",
                borderRadius: 7,
                background: on ? t.wash : "transparent",
                border: `1px solid ${on ? t.colour : "var(--sd-border)"}`,
                color: on ? t.colour : "var(--sd-muted)",
              }}
            >
              {t.tier}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "14px 16px" }} aria-live="polite">
        <p className="sd-text-xs" style={{ marginBottom: 12 }}>{tier.runs}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
          {tier.cases.map((item) => (
            <div key={item} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "10px 12px" }}>
              <p className="sd-text-sm-tight">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sd-callout" style={{ margin: 0 }}>
        <strong className="sd-strong">What only this tier catches.</strong> {tier.catches}
      </div>
    </div>
  );
}

/* The scrolling stage chips from /frontend: the track is the carousel, and the
   selected chip is the panel underneath. */
function Guards() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  /* Centre the active chip rather than calling scrollIntoView, which would also
     scroll the page to reach it. */
  useEffect(() => {
    const strip = trackRef.current;
    const chip = chipRefs.current[active];
    if (!strip || !chip) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo({
      left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2,
      behavior: calm ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div className={track.track} ref={trackRef} role="group" aria-label="Guard">
        {earlyWarning.map((guard, i) => {
          const on = i === active;
          return (
            <button
              key={guard.title}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              ref={(el) => { chipRefs.current[i] = el; }}
              className={track.stripChip}
              style={{
                background: on ? "var(--sd-accent-wash)" : "var(--sd-surface2)",
                border: `1px solid ${on ? "var(--sd-accent)" : "var(--sd-border)"}`,
                opacity: on ? 1 : 0.72,
              }}
            >
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, color: "var(--sd-accent)" }}>
                {`0${i + 1}`}
              </span>
              {guard.title}
            </button>
          );
        })}
      </div>

      <div className="sd-card" style={{ marginTop: 10 }} aria-live="polite">
        <p className="sd-text-sm-tight">{earlyWarning[active].body}</p>
      </div>
    </div>
  );
}

function FindingBody({ finding, questions }: { finding: Finding; questions: Deeper[] }) {
  return (
    <>
      <h3 className="sd-h2" style={{ marginTop: 18 }}>{finding.title}</h3>

      {/* auto-fit rather than three fixed columns: findings 3 and 4 have no
          expectation worth stating, so those lay out as two. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Claim kind="saw">{finding.saw}</Claim>
        {finding.expected && <Claim kind="expected">{finding.expected}</Claim>}
        {finding.unsure && <Claim kind="unsure">{finding.unsure}</Claim>}
      </div>

      <p className="sd-eyebrow-sub" style={{ color: "var(--sd-amber)" }}>{finding.guessLabel}</p>
      {/* Dashed, and every one ends in a question mark: these are leads to pull on,
          and the page has no way to settle any of them. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {finding.guesses.map((guess) => (
          <span
            key={guess}
            style={{ padding: "7px 13px", background: "var(--sd-surface2)", border: "1px dashed var(--sd-amber)", borderRadius: 999, color: "var(--sd-text)", fontSize: 12.5, lineHeight: 1.4 }}
          >
            {guess}
          </span>
        ))}
      </div>

      <div className="sd-stack" style={{ marginTop: 12 }}>
        <Claim kind="build">{finding.build}</Claim>
      </div>

      <QaLinks questions={questions} />

      {finding.n === 1 && <DeepDiveOne />}
      {finding.n === 2 && <DeepDiveTwo />}
      {finding.n === 4 && <DeepDiveFour />}
    </>
  );
}

/* Four tabs over four findings. Every panel stays in the DOM and only the active
   one is displayed, so the text is still findable and crawlable without costing
   four findings of page height. */
function Findings({ deeper }: { deeper: Record<number, Deeper[]> }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + findings.length) % findings.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="sd-section" id="findings">
      <p className="sd-eyebrow">The Findings</p>
      <h2 className="sd-h2">Four Things That Surprised Me</h2>

      <div
        role="tablist"
        aria-label="Findings"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}
      >
        {findings.map((finding, i) => {
          const on = i === active;
          return (
            <button
              key={finding.n}
              ref={(node) => { tabs.current[i] = node; }}
              type="button"
              role="tab"
              id={`finding-tab-${finding.n}`}
              aria-selected={on}
              aria-controls={`finding-panel-${finding.n}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => onKeyDown(event, i)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                background: on ? "var(--sd-accent-wash)" : "var(--sd-surface2)",
                border: `1px solid ${on ? "var(--sd-accent)" : "var(--sd-border)"}`,
                borderRadius: 10,
                padding: "13px 15px",
              }}
            >
              <span style={{ display: "block", fontFamily: "var(--sd-font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: on ? "var(--sd-accent)" : "var(--sd-muted)", marginBottom: 5 }}>
                Finding {finding.n}
              </span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--sd-text)", lineHeight: 1.3, marginBottom: 4 }}>
                {finding.short}
              </span>
              <span className="sd-text-xs" style={{ display: "block" }}>{finding.teaser}</span>
            </button>
          );
        })}
      </div>

      {findings.map((finding, i) => (
        <div
          key={finding.n}
          role="tabpanel"
          id={`finding-panel-${finding.n}`}
          aria-labelledby={`finding-tab-${finding.n}`}
          hidden={i !== active}
        >
          <FindingBody finding={finding} questions={deeper[finding.n] ?? []} />
        </div>
      ))}
    </div>
  );
}

const flowArrow = (
  <defs>
    <marker id="pls-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
    </marker>
  </defs>
);

function Node({ x, y, label, sub, tone }: { x: number; y: number; label: string; sub: string; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={200} height={46} rx={9} fill="var(--sd-surface2)" stroke={tone ?? "var(--sd-border-strong)"} strokeWidth="1.5" />
      <text x={x + 100} y={y + 20} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11.5" fontWeight="700" fill="var(--sd-text)">{label}</text>
      <text x={x + 100} y={y + 35} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{sub}</text>
    </g>
  );
}

function Edge({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#pls-arrow)" />
      {label && (
        <text x={lx} y={ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{label}</text>
      )}
    </g>
  );
}

/* The loop is the point: the trigger's request re-enters at the cache, so a
   mutation that moves the offset changes what the next scroll asks for. */
function StateFlow() {
  return (
    <svg viewBox="0 0 880 300" role="img" aria-label="A loop in seven parts. User actions feed a UI state and mutation layer, which calls the server API. The server API fills a paginated page cache, which a derived view reads, which renders the list, which is watched by a pagination trigger, whose next page request returns to the page cache." style={{ width: "100%", minWidth: 660, display: "block" }}>
      <title>Where each piece of the list&rsquo;s state could live</title>
      {flowArrow}

      <Node x={30} y={24} label="User actions" sub="filter · delete · add · reorder" />
      <Node x={290} y={24} label="UI state + mutations" sub="the browser's own state" />
      <Node x={550} y={24} label="Server API" sub="owns the records" tone="var(--sd-accent)" />

      <Node x={550} y={124} label="Paginated cache" sub="keyed by filter" tone="var(--sd-accent)" />
      <Node x={290} y={124} label="Derived view" sub="recomputed, never stored" tone="var(--sd-green)" />
      <Node x={30} y={124} label="Rendered list" sub="what the user sees" />

      <Node x={30} y={224} label="Pagination trigger" sub="watches the end of the list" />

      <Edge d="M 230 47 H 284" />
      <Edge d="M 490 47 H 544" />
      <Edge d="M 650 70 V 118" />
      <Edge d="M 550 147 H 496" />
      <Edge d="M 290 147 H 236" />
      <Edge d="M 130 170 V 218" />
      <Edge d="M 230 247 H 810 V 147 H 756" label="next page request" lx={520} ly={239} />
    </svg>
  );
}

const CELL = 62;
const GAP = 6;
const cellX = (i: number) => 20 + i * (CELL + GAP);
const centreOf = (i: number) => cellX(i) + CELL / 2;

/* `loaded` is how many records the browser still holds, `from` the spot its next
   request starts at. A cell between the two is a record nobody asks for. */
function Row({
  y,
  names,
  loaded,
  from,
}: {
  y: number;
  names: string[];
  loaded: number;
  from: number;
}) {
  return (
    <g>
      {names.map((name, i) => {
        const held = i < loaded;
        const missed = i >= loaded && i < from;
        const fill = missed ? "var(--sd-danger-wash)" : held ? "var(--sd-accent-wash)" : "var(--sd-surface2)";
        const stroke = missed ? "var(--sd-danger)" : held ? "var(--sd-accent)" : "var(--sd-teal)";
        return (
          <g key={name}>
            <rect x={cellX(i)} y={y} width={CELL} height={36} rx={7} fill={fill} stroke={stroke} strokeWidth="1.5" />
            <text x={centreOf(i)} y={y + 23} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill={missed ? "var(--sd-danger)" : "var(--sd-text)"}>{name}</text>
          </g>
        );
      })}
    </g>
  );
}

function Spots({ y, count }: { y: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <text key={i} x={centreOf(i)} y={y} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{i}</text>
      ))}
    </g>
  );
}

function BandLabel({ y, colour, children }: { y: number; colour: string; children: string }) {
  return (
    <text x={20} y={y} fontFamily="var(--sd-font-mono)" fontSize="11" fontWeight="700" fill={colour}>
      {children}
    </text>
  );
}

const BEFORE = ["A", "B", "C", "D", "E", "F", "G", "H"];
const AFTER = ["A", "C", "D", "E", "F", "G", "H"];

function OffsetShift() {
  return (
    <svg viewBox="0 0 580 402" role="img" aria-label="Eight skills in a row. The browser has loaded the first four and its bookmark sits on spot four. B is deleted, so everything after it slides forward one spot and E lands on spot three. The bookmark is still on spot four, so the next request returns F, G and H, and E is skipped. Moving the bookmark back to spot three returns E, F, G and H with nothing missed." style={{ width: "100%", minWidth: 500, display: "block" }}>
      <title>Why a deleted record can make the next page skip one</title>
      {flowArrow}

      <BandLabel y={14} colour="var(--sd-muted)">1. Eight skills. The browser has loaded the first four.</BandLabel>
      <Row y={26} names={BEFORE} loaded={4} from={4} />
      <Spots y={78} count={8} />
      <Edge d="M 323 102 V 66" />
      <text x={323} y={116} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-teal)">bookmark: spot 4</text>

      <BandLabel y={152} colour="var(--sd-danger)">2. B is deleted. Everything after it slides forward one spot.</BandLabel>
      <Row y={164} names={AFTER} loaded={3} from={4} />
      <Spots y={216} count={7} />
      <Edge d="M 323 240 V 204" />
      <text x={323} y={254} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-danger)">still spot 4, so E is skipped</text>

      <BandLabel y={290} colour="var(--sd-green)">3. Move the bookmark back one too, and nothing is missed.</BandLabel>
      <Row y={302} names={AFTER} loaded={3} from={3} />
      <Edge d="M 255 378 V 342" />
      <text x={255} y={392} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-green)">bookmark: spot 3</text>
    </svg>
  );
}

function Swatch({ colour, wash, children }: { colour: string; wash: string; children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: wash, border: `1.5px solid ${colour}` }} />
      {children}
    </span>
  );
}

export default function PaginatedListSync({ deeper }: { deeper: Record<number, Deeper[]> }) {
  return (
    <>
      <Breadcrumb section="Frontend Design" concept="LinkedIn Skills: My Own Experience" />

      <PageLayout>
        <p className="sd-eyebrow">Case Study</p>
        <LearnedToggle />
        <h1 className="sd-h1">LinkedIn Skills: My Own Experience</h1>
        <p className="sd-lede">
          Four things I noticed while updating the skills on my own profile, and the
          state problem they all point at.
        </p>

        <div className="sd-section">
          <p className="sd-eyebrow">What This Is</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              I was adding and removing skills on my LinkedIn profile and the list did a
              few things I did not expect. I hit most of them more than once, so these are
              not single misreadings, but I have{" "}
              <strong className="sd-strong">no access to their code</strong>, I only ever
              had my own account and browser to go on, and I am not the one who decides what
              that screen is supposed to do. So this is not a bug report. It is one person
              poking at a UI from the outside, writing down what happened, and then asking
              what it would take to build the same screen without the thing that surprised
              me.
            </p>
          </div>

          <Link
            href="/frontend"
            style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}
          >
            <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: "var(--sd-font-mono)", fontSize: 16, color: "var(--sd-accent)" }}>↗</span>
            <span>
              <span className="sd-eyebrow-sub" style={{ display: "block", color: "var(--sd-accent)" }}>
                Start here if you want the map first
              </span>
              <span className="sd-text-sm-tight" style={{ display: "block" }}>
                <strong className="sd-strong">Frontend System Design, in nine stages.</strong>{" "}
                Stage 4 is data ownership, stage 5 the UI states, stage 6 the network. This
                page is one stage 4 decision, seen from the outside, going sideways in four
                different ways.
              </span>
            </span>
          </Link>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">How To Read It</p>
          <h2 className="sd-h2">Guesses Kept Apart From Observations</h2>

          <div className="sd-prose">
            <p>
              The only reliable part of any of this is what appeared on screen. Everything
              after that is me reasoning about code I have never seen, which is worth doing
              as an exercise and worth nothing as a diagnosis. Repeating something does not
              make the explanation for it right: a finding can be perfectly real and still
              be deliberate, or depend on something no browser tab will show me.
            </p>
            <p style={{ marginTop: 12 }}>
              So the four kinds of statement are coloured differently and never blended:
            </p>
          </div>

          <div className="sd-grid-2">
            {(["saw", "expected", "unsure", "build"] as const).map((kind) => (
              <div key={kind} className="sd-card">
                <p className="sd-eyebrow-sub" style={{ color: CLAIM[kind].colour }}>{CLAIM[kind].label}</p>
                <p className="sd-text-sm-tight">
                  {kind === "saw" && "What appeared on screen, repeatedly, on one account in one browser. The only part that is not reasoning."}
                  {kind === "expected" && "What I assumed would happen. My assumption, not a contract anyone published."}
                  {kind === "unsure" && "What a browser tab cannot settle. Usually the most interesting part, and the easiest to skip."}
                  {kind === "build" && "What I would do on a screen of my own. A proposal, not a correction of anybody's work."}
                </p>
              </div>
            ))}
          </div>

          <div className="sd-callout" style={{ marginTop: 4 }}>
            Between them sits a fifth thing, marked separately wherever it appears: the{" "}
            <strong className="sd-strong">guess</strong>. Each one is a mechanism that could
            produce what I saw. Listing four of them per finding is the point, because the
            moment there is only one it starts to feel like an answer.
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">The Machine</p>
          <h2 className="sd-h2">What All Four Are About</h2>

          <div className="sd-prose">
            <p>
              Before the findings, the thing they all happen inside. Seven parts, and one
              loop worth staring at: the pagination trigger does not read the list it
              watches, it issues a request built from the cache&rsquo;s bookmark. So{" "}
              <strong className="sd-strong">any mutation that moves that bookmark changes
              what the next scroll fetches</strong>, and nothing in the trigger knows a
              mutation happened.
            </p>
          </div>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">A proposal, not a reconstruction of anyone&rsquo;s implementation</p>
            <StateFlow />
          </div>
        </div>

        <Findings deeper={deeper} />

        {/* Everything above is per-finding and hidden behind a tab. Everything
            below applies to all four and is always on screen. */}
        <hr style={{ border: 0, borderTop: "1px solid var(--sd-border-strong)", margin: "44px 0 40px" }} />

        <div className="sd-section">
          <p className="sd-eyebrow">Key Terms</p>
          <h2 className="sd-h2">The Vocabulary Of A List That Changes</h2>

          <div className="sd-grid-2">
            {terms.map((term) => (
              <div key={term.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{term.title}</div>
                <p className="sd-text-sm-tight">{term.def}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Final Considerations</p>
          <h2 className="sd-h2">How You Would Catch All Of This Early</h2>

          <div className="sd-prose">
            <p>
              Every finding on this page took a person clicking around to notice, which is
              the most expensive way there is to find a bug and the least reliable. All four
              are also{" "}
              <strong className="sd-strong">cheap to assert on</strong>, as long as the
              arithmetic lives somewhere a test can reach without starting a browser.
            </p>
            <p style={{ marginTop: 12 }}>
              Three tiers, cheapest first. The useful question for each one is not what it
              covers but what it is the only thing that can cover.
            </p>
          </div>

          <TestTiers />

          <p className="sd-eyebrow-sub" style={{ marginTop: 22 }}>And before any of those, five cheaper guards</p>
          <Guards />

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
            The through line is the same as the rest of the page.{" "}
            <strong className="sd-strong">A thing with one owner can be asserted on. A
            thing with two can only be noticed.</strong>{" "}
            Four findings that took scrolling and clicking to spot would each have been a
            failing assertion, if the state they disagree about had been somewhere a test
            could hold still.
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Key Points</p>
          <h2 className="sd-h2">What To Carry Forward</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} columns={2} />
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Common Mistakes</p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;They moved my bed to the other room and I still go and lie down in the old
            spot. Nobody told me. I am holding a copy of the floor plan and it is wrong.&rdquo;
          </blockquote>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Reflect</p>
          <h2 className="sd-h2">Who Owns The Data, And What Must Change When It Changes?</h2>

          <div className="sd-prose">
            <p>
              That question is the page compressed into one line. Run every piece of state
              on the screen you are building through it. If the answer is that the server
              owns it and three other places keep a copy, you already know which bug you are
              going to ship, and you can go and write the test for it now.
            </p>
          </div>
        </div>

        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Go And Break A List Somewhere Else</h2>

          <div className="sd-callout sd-callout-accent">
            <div className="sd-stack" style={{ gap: 10 }}>
              {tryIt.map((step) => (
                <p key={step} className="sd-text-sm-tight" style={{ color: "var(--sd-text)" }}>{step}</p>
              ))}
            </div>
          </div>

        </div>

        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Interview Prompts</p>
          <p className="sd-quiz-title">Seven questions this case study answers</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>
    </>
  );
}
