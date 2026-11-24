"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { LearnedToggle } from "@/components";
import {
  ArrowMarker,
  Breadcrumb,
  Callout,
  Card,
  Diagram,
  Eyebrow,
  Figure,
  Heading,
  Highlight,
  MarkerList,
  PageLayout,
  Prose,
  QuizCarousel,
  QuizSection,
  Section,
  Strong,
  Text,
  type DiagramEdgeProps,
  type Point,
} from "@/design-system";
import { hl } from "@/lib/highlight";
import type { PrepLink } from "@/lib/interviewPrep";
import type { Hue } from "@/types/content";
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
  type FindingLinks,
} from "./data";

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
  saw: { label: "What I saw", color: "var(--sd-warm)", wash: "var(--sd-warm-wash)" },
  expected: { label: "What I expected", color: "var(--sd-accent)", wash: "var(--sd-accent-wash)" },
  unsure: { label: "What I cannot tell", color: "var(--sd-danger)", wash: "var(--sd-danger-wash)" },
  build: { label: "How I would build it", color: "var(--sd-green)", wash: "var(--sd-surface2)" },
} as const satisfies Record<string, Hue & { label: string }>;

function Claim({ kind, children }: { kind: keyof typeof CLAIM; children: ReactNode }) {
  const { label, color, wash } = CLAIM[kind];
  return (
    <div style={{ background: wash, border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 16px" }}>
      <Eyebrow variant="sub" style={{ color, marginBottom: 6 }}>{label}</Eyebrow>
      <Text variant="sm-tight">{children}</Text>
    </div>
  );
}

function QaLinks({ questions }: { questions: PrepLink[] }) {
  if (questions.length === 0) return null;
  return (
    <Card style={{ marginTop: 12 }}>
      <Eyebrow variant="sub" style={{ color: "var(--sd-teal)" }}>Already answered in the Q&amp;A</Eyebrow>
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
    </Card>
  );
}

/* Each finding's own material, rendered inside its panel. Finding 1 carries the
   offset arithmetic and the in-flight guard; finding 2 the ownership model and
   the mutation lifecycle; findings 3 and 4 are genuinely thinner, and padding
   them out to match would be inventing material to fill a grid. */
function DeepDiveOne() {
  return (
    <div id="offset" style={{ marginTop: 26 }}>
      <Heading>Why That Fix Has A Second Half</Heading>

      <Prose>
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
          and <Strong>one skill quietly stops existing</Strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          Unlike the rest of this page, none of what follows is a guess about anyone. It
          is arithmetic, and it holds for any list that asks for records{" "}
          <Strong>by position</Strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          Think of the list as a book, and of the browser as a reader with a bookmark.
          You read the first four pages and leave the bookmark on page 5, because that
          is where you will carry on. Then somebody tears page 2 out. Every page after
          it slides forward by one, but your bookmark still says{" "}
          <Strong>page 5</Strong>, and page 5 is no longer the
          page you meant. You carry on from the wrong place and skip one, and the book
          still opens perfectly, which is why you never notice.
        </p>
      </Prose>

      <Eyebrow variant="sub">The same thing, with eight skills and a page size of four</Eyebrow>

      <Figure scroll>
        <OffsetShift />
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginTop: 18, fontSize: 11.5, color: "var(--sd-muted)", fontFamily: "var(--sd-font-mono)" }}>
          <Swatch color="var(--sd-accent)" wash="var(--sd-accent-wash)">already in the browser</Swatch>
          <Swatch color="var(--sd-teal)" wash="var(--sd-surface2)">the next request returns</Swatch>
          <Swatch color="var(--sd-danger)" wash="var(--sd-danger-wash)">asked for by nobody</Swatch>
        </div>
      </Figure>

      <Callout tone="accent">
        Read the middle row twice. <Strong>E has not been
        deleted</Strong>, and it has not failed to load. It simply moved from spot 4 to
        spot 3, and spot 3 is behind where the browser is reading from. Nothing in the
        request or the response is an error, and nobody is ever told.
      </Callout>

      <Eyebrow variant="sub" style={{ marginTop: 22 }}>
        Line by line, in plain JavaScript
      </Eyebrow>
      <pre style={code}>
        <code className="sd-strong">
          <Highlight tone="muted">{"// The server has eight skills. The page size is four."}</Highlight>{"\n"}
          <Highlight tone="accent">const</Highlight> server = [<Highlight tone="amber">&quot;A&quot;</Highlight>,<Highlight tone="amber">&quot;B&quot;</Highlight>,<Highlight tone="amber">&quot;C&quot;</Highlight>,<Highlight tone="amber">&quot;D&quot;</Highlight>,<Highlight tone="amber">&quot;E&quot;</Highlight>,<Highlight tone="amber">&quot;F&quot;</Highlight>,<Highlight tone="amber">&quot;G&quot;</Highlight>,<Highlight tone="amber">&quot;H&quot;</Highlight>];{"\n\n"}
          <Highlight tone="muted">{"// The browser asked for the first four and kept them."}</Highlight>{"\n"}
          <Highlight tone="accent">let</Highlight> loaded = [<Highlight tone="amber">&quot;A&quot;</Highlight>,<Highlight tone="amber">&quot;B&quot;</Highlight>,<Highlight tone="amber">&quot;C&quot;</Highlight>,<Highlight tone="amber">&quot;D&quot;</Highlight>];{"\n"}
          <Highlight tone="accent">let</Highlight> bookmark = <Highlight tone="accent">4</Highlight>;{"              "}<Highlight tone="muted">{"// where the NEXT request starts"}</Highlight>{"\n\n"}
          <Highlight tone="muted">{"// Now B is deleted. On the server, everyone after B moves up:"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   before   A B C D E F G H     E was at spot 4"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   after    A C D E F G H       E is at spot 3"}</Highlight>{"\n\n"}
          loaded = loaded.<Highlight>filter</Highlight>((s) =&gt; s !== <Highlight tone="amber">&quot;B&quot;</Highlight>);{"\n"}
          <Highlight tone="muted">{"//   loaded is now [\"A\",\"C\",\"D\"], three instead of four,"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   and nobody touched the bookmark"}</Highlight>{"\n\n"}
          <Highlight tone="muted">{"// The next scroll fires and asks for four, starting at spot 4:"}</Highlight>{"\n"}
          server.<Highlight>slice</Highlight>(bookmark, bookmark + <Highlight tone="accent">4</Highlight>);{"\n"}
          <Highlight tone="muted">{"//   → [\"F\",\"G\",\"H\"]"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   E is not in there, and it never will be. It sits at spot 3,"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   which the browser believes it has already read."}</Highlight>
        </code>
      </pre>

      <Eyebrow variant="sub">The fix is one line, and it is the whole lesson</Eyebrow>
      <pre style={code}>
        <code className="sd-strong">
          <Highlight tone="accent">function</Highlight> <Highlight>onDeleted</Highlight>(name) {"{"}{"\n"}
          {"  "}<Highlight tone="accent">const</Highlight> spot = loaded.<Highlight>indexOf</Highlight>(name);{"\n\n"}
          {"  "}<Highlight tone="muted">{"// Was the deleted row inside the part we already read?"}</Highlight>{"\n"}
          {"  "}<Highlight tone="accent">if</Highlight> (spot === <Highlight tone="accent">-1</Highlight>) <Highlight tone="accent">return</Highlight>;{"       "}<Highlight tone="muted">{"// No. Our count is unaffected."}</Highlight>{"\n\n"}
          {"  "}loaded.<Highlight>splice</Highlight>(spot, <Highlight tone="accent">1</Highlight>);{"       "}<Highlight tone="muted">{"// Yes. Drop it from our copy,"}</Highlight>{"\n"}
          {"  "}bookmark -= <Highlight tone="accent">1</Highlight>;{"             "}<Highlight tone="muted">{"// and move the bookmark back with it."}</Highlight>{"\n"}
          {"}"}{"\n\n"}
          <Highlight tone="muted">{"// bookmark is 3 now, so the next request returns:"}</Highlight>{"\n"}
          <Highlight tone="muted">{"//   [\"E\",\"F\",\"G\",\"H\"]   nothing skipped"}</Highlight>
        </code>
      </pre>

      <Callout tone="accent">
        That <code style={{ color: "var(--sd-teal)" }}>if (spot === -1) return</code> is
        doing more work than it looks. If you delete a row the browser never loaded, it
        was never in front of the bookmark, so moving the bookmark would skip a
        different record instead. A good number of deletion bugs in a paginated list are
        this one condition, written the wrong way round.
      </Callout>

      <div className="sd-grid-2" style={{ marginTop: 16 }}>
        <Card>
          <Eyebrow variant="sub" style={{ color: "var(--sd-amber)" }}>Asking by position</Eyebrow>
          <Text variant="sm-tight">
            &ldquo;Give me four, starting at spot 4.&rdquo; Trivial to implement, works
            on any query, and every deletion in front of the bookmark quietly breaks the
            arithmetic. Fine for a list nothing changes.
          </Text>
        </Card>
        <Card>
          <Eyebrow variant="sub" style={{ color: "var(--sd-green)" }}>Asking by record</Eyebrow>
          <Text variant="sm-tight">
            &ldquo;Give me four, starting after D.&rdquo; Deleting B does not move D, so
            this cannot happen at all. Known as cursor pagination. Costs a stable sort
            key and a cursor the server can resolve.
          </Text>
        </Card>
      </div>

      <Text variant="sm" style={{ marginTop: 14 }}>
        {hl(
          "A list people can change wants the second one. If the first is already shipped, the deletion path has to keep the arithmetic honest by hand, *and that is a thing to decide once, not in every handler that happens to remove a row*.",
        )}
      </Text>

      <Callout style={{ marginTop: 18 }}>
        <Strong>Back to finding 1.</Strong> A list that stops
        loading is annoying and obvious, and somebody reports it within a day. A list
        that drops one row out of forty is neither, and the usual way to get one is to
        fix the other carelessly. That is the only reason this section exists: not to
        explain what I saw, but to explain what I would have shipped if I had fixed what
        I saw without thinking about the bookmark.
      </Callout>

      <Eyebrow variant="sub">A late response is not a valid response</Eyebrow>
      <pre style={code}>
        <code className="sd-strong">
          <Highlight tone="muted">{"// issued against spot 4; a delete landed while it was in flight"}</Highlight>{"\n"}
          <Highlight tone="accent">function</Highlight> <Highlight>onPageResponse</Highlight>(request, response) {"{"}{"\n"}
          {"  "}<Highlight tone="accent">const</Highlight> entry = cache[request.filter];{"\n\n"}
          {"  "}<Highlight tone="muted">{"// the bookmark moved while this was on its way, so this page"}</Highlight>{"\n"}
          {"  "}<Highlight tone="muted">{"// describes a list that no longer exists. writing it back"}</Highlight>{"\n"}
          {"  "}<Highlight tone="muted">{"// would put the deleted row on screen again."}</Highlight>{"\n"}
          {"  "}<Highlight tone="accent">if</Highlight> (request.start !== entry.bookmark) <Highlight tone="accent">return</Highlight>;{"\n\n"}
          {"  "}<Highlight>append</Highlight>(entry, response.items);{"\n"}
          {"}"}
        </code>
      </pre>
    </div>
  );
}

function DeepDiveTwo() {
  return (
    <div id="design" style={{ marginTop: 26 }}>
      <Heading>Who Owns What, And What Changes When It Changes</Heading>

      <Prose>
        <p>
          Findings 1 and 2 rhyme. Both are what a second copy of something that already
          had an owner looks like from the outside. The design I would reach for is not
          a cleverer delete handler, it is{" "}
          <Strong>one owner per piece of state</Strong> and
          everything else derived.
        </p>
      </Prose>

      <div className="sd-grid-3">
        {ownership.map((row) => (
          <Card key={row.owner}>
            <Eyebrow variant="sub" style={{ color: row.color }}>{row.owner}</Eyebrow>
            <Text variant="sm-tight">{row.holds}</Text>
          </Card>
        ))}
      </div>

      <Eyebrow variant="sub">The model, and the one field everything turns on</Eyebrow>
      <pre style={code}>
        <code className="sd-strong">
          <Highlight tone="accent">type</Highlight> <Highlight>Skill</Highlight> = {"{"}{"\n"}
          {"  "}id: <Highlight tone="accent">string</Highlight>;{"\n"}
          {"  "}name: <Highlight tone="accent">string</Highlight>;{"\n"}
          {"  "}category: <Highlight tone="accent">string</Highlight>;{"\n"}
          {"  "}endorsements: <Highlight tone="accent">number</Highlight>;{"\n"}
          {"  "}priority: <Highlight tone="accent">number</Highlight>;{"      "}<Highlight tone="muted">{"// the user's rank. nothing else writes it"}</Highlight>{"\n"}
          {"}"};{"\n\n"}
          <Highlight tone="accent">type</Highlight> <Highlight>SkillsUIState</Highlight> = {"{"}{"\n"}
          {"  "}selectedCategory: <Highlight tone="accent">string</Highlight>;{"   "}<Highlight tone="muted">{"// never reconciled by a mutation"}</Highlight>{"\n"}
          {"  "}editingSkillId: <Highlight tone="accent">string</Highlight> | <Highlight tone="accent">null</Highlight>;{"\n"}
          {"}"};{"\n\n"}
          <Highlight tone="muted">{"// the filter is part of the identity, or two views share one slot"}</Highlight>{"\n"}
          <Highlight tone="accent">const</Highlight> key = [<Highlight tone="amber">&quot;skills&quot;</Highlight>, {"{"} category: <Highlight tone="amber">&quot;Frontend&quot;</Highlight> {"}"}];
        </code>
      </pre>

      <Eyebrow variant="sub" style={{ marginTop: 20 }}>The mutation lifecycle, in six steps</Eyebrow>
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
              <Text variant="sm-tight">{step.sub}</Text>
            </div>
            {i % 3 !== 2 && i !== lifecycle.length - 1 && (
              <span aria-hidden style={{ flexShrink: 0, color: "var(--sd-muted)", fontSize: 12 }}>&#8594;</span>
            )}
          </div>
        ))}
      </div>

      <Callout style={{ marginTop: 14 }}>
        Step 6 is the one that gets left out, and finding 1 is what leaving it out would
        look like from outside. Steps 4 and 5 are where finding 2 would live:
        reconciling only the collection on screen, or updating a copy instead of
        re-deriving.
      </Callout>

      <Eyebrow variant="sub" style={{ marginTop: 22 }}>Optimistic update vs refetch after success</Eyebrow>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
        <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: strategies[0].wash, color: strategies[0].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {strategies[0].label}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {strategies[0].points.map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: strategies[0].color, fontSize: 11, lineHeight: 1.7 }}>&#9679;</span>
                <Text variant="sm-tight">{point}</Text>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
        </div>

        <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: strategies[1].wash, color: strategies[1].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {strategies[1].label}
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {strategies[1].points.map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: strategies[1].color, fontSize: 11, lineHeight: 1.7 }}>&#9679;</span>
                <Text variant="sm-tight">{point}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Callout tone="accent" style={{ marginTop: 16 }}>
        For a destructive action on a list, the honest default is{" "}
        <Strong>optimistic with a snapshot</Strong>: copy the
        cached collections before the edit, restore the copy if the server says no.
        Reversing the edit by hand means reinserting the row at the right index and
        undoing the bookmark arithmetic, and that reverse path is the one nobody tests.
      </Callout>
    </div>
  );
}

function DeepDiveFour() {
  return (
    <div style={{ marginTop: 26 }}>
      <Eyebrow variant="sub">The rank a new record gets</Eyebrow>
      <pre style={code}>
        <code className="sd-strong">
          <Highlight tone="muted">{"// Puts every new skill first, and quietly renumbers nothing,"}</Highlight>{"\n"}
          <Highlight tone="muted">{"// which is why it looks harmless until someone has an order."}</Highlight>{"\n"}
          <Highlight tone="accent">const</Highlight> rank = <Highlight>Math</Highlight>.<Highlight>min</Highlight>(...ranks) - <Highlight tone="accent">1</Highlight>;{"\n\n"}
          <Highlight tone="muted">{"// Puts it last, and leaves every rank the user set alone."}</Highlight>{"\n"}
          <Highlight tone="accent">const</Highlight> rank = <Highlight>Math</Highlight>.<Highlight>max</Highlight>(...ranks) + <Highlight tone="accent">1</Highlight>;
        </code>
      </pre>

      <Callout tone="accent">
        Either is defensible. What is not defensible is picking one by accident, which
        is what happens when there is no rank field and the order falls out of whatever
        the database returns. And if ranks can tie,{" "}
        <Strong>sort stably</Strong>, or equal records will swap
        places between renders for no reason anyone can see.
      </Callout>
    </div>
  );
}

function TestTiers() {
  const [active, setActive] = useState(0);
  const tier = testing[active];

  return (
    <Figure flush>
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
                border: `1px solid ${on ? t.color : "var(--sd-border)"}`,
                color: on ? t.color : "var(--sd-muted)",
              }}
            >
              {t.tier}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "14px 16px" }} aria-live="polite">
        <Text variant="xs" style={{ marginBottom: 12 }}>{tier.runs}</Text>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
          {tier.cases.map((item) => (
            <div key={item} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "10px 12px" }}>
              <Text variant="sm-tight">{item}</Text>
            </div>
          ))}
        </div>
      </div>

      <Callout style={{ margin: 0 }}>
        <Strong>What only this tier catches.</Strong> {tier.catches}
      </Callout>
    </Figure>
  );
}

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

      <Card style={{ marginTop: 10 }} aria-live="polite">
        <Text variant="sm-tight">{earlyWarning[active].body}</Text>
      </Card>
    </div>
  );
}

function FindingBody({ finding, questions }: { finding: Finding; questions: PrepLink[] }) {
  return (
    <>
      <Heading as="h3" style={{ marginTop: 18 }}>{finding.title}</Heading>

      {/* auto-fit rather than three fixed columns: findings 3 and 4 have no
          expectation worth stating, so those lay out as two. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Claim kind="saw">{finding.saw}</Claim>
        {finding.expected && <Claim kind="expected">{finding.expected}</Claim>}
        {finding.unsure && <Claim kind="unsure">{finding.unsure}</Claim>}
      </div>

      <Eyebrow variant="sub" style={{ color: "var(--sd-amber)" }}>{finding.guessLabel}</Eyebrow>
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
interface DeeperProps {
  deeper: FindingLinks;
}

function Findings({ deeper }: DeeperProps) {
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
    <Section id="findings" eyebrow="The Findings" title="Four Things That Surprised Me">

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
              <Text as="span" variant="xs" style={{ display: "block" }}>{finding.teaser}</Text>
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
    </Section>
  );
}

const flowArrow = (
  <defs>
    <ArrowMarker id="pls-arrow" />
  </defs>
);

function Node({ x, y, label, sub, tone }: Point & { label: string; sub: string; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={200} height={46} rx={9} fill="var(--sd-surface2)" stroke={tone ?? "var(--sd-border-strong)"} strokeWidth="1.5" />
      <text x={x + 100} y={y + 20} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11.5" fontWeight="700" fill="var(--sd-text)">{label}</text>
      <text x={x + 100} y={y + 35} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{sub}</text>
    </g>
  );
}

function Edge({ d, label, lx, ly }: Pick<DiagramEdgeProps, "d" | "label" | "lx" | "ly">) {
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
    <Diagram viewBox="0 0 880 300" label="A loop in seven parts. User actions feed a UI state and mutation layer, which calls the server API. The server API fills a paginated page cache, which a derived view reads, which renders the list, which is watched by a pagination trigger, whose next page request returns to the page cache." title="Where each piece of the list’s state could live" minWidth={660}>
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
    </Diagram>
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

function BandLabel({ y, color, children }: Pick<Hue, "color"> & { y: number; children: string }) {
  return (
    <text x={20} y={y} fontFamily="var(--sd-font-mono)" fontSize="11" fontWeight="700" fill={color}>
      {children}
    </text>
  );
}

const BEFORE = ["A", "B", "C", "D", "E", "F", "G", "H"];
const AFTER = ["A", "C", "D", "E", "F", "G", "H"];

function OffsetShift() {
  return (
    <Diagram viewBox="0 0 580 402" label="Eight skills in a row. The browser has loaded the first four and its bookmark sits on spot four. B is deleted, so everything after it slides forward one spot and E lands on spot three. The bookmark is still on spot four, so the next request returns F, G and H, and E is skipped. Moving the bookmark back to spot three returns E, F, G and H with nothing missed." title="Why a deleted record can make the next page skip one" minWidth={500}>
      {flowArrow}

      <BandLabel y={14} color="var(--sd-muted)">1. Eight skills. The browser has loaded the first four.</BandLabel>
      <Row y={26} names={BEFORE} loaded={4} from={4} />
      <Spots y={78} count={8} />
      <Edge d="M 323 102 V 66" />
      <text x={323} y={116} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-teal)">bookmark: spot 4</text>

      <BandLabel y={152} color="var(--sd-danger)">2. B is deleted. Everything after it slides forward one spot.</BandLabel>
      <Row y={164} names={AFTER} loaded={3} from={4} />
      <Spots y={216} count={7} />
      <Edge d="M 323 240 V 204" />
      <text x={323} y={254} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-danger)">still spot 4, so E is skipped</text>

      <BandLabel y={290} color="var(--sd-green)">3. Move the bookmark back one too, and nothing is missed.</BandLabel>
      <Row y={302} names={AFTER} loaded={3} from={3} />
      <Edge d="M 255 378 V 342" />
      <text x={255} y={392} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fontWeight="700" fill="var(--sd-green)">bookmark: spot 3</text>
    </Diagram>
  );
}

function Swatch({ color, wash, children }: Hue & { children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: wash, border: `1.5px solid ${color}` }} />
      {children}
    </span>
  );
}

export default function PaginatedListSync({ deeper }: DeeperProps) {
  return (
    <>
      <Breadcrumb section="Frontend Design" concept="LinkedIn Skills: My Own Experience" />

      <PageLayout>
        <Eyebrow>Case Study</Eyebrow>
        <LearnedToggle />
        <Heading level="page">LinkedIn Skills: My Own Experience</Heading>
        <Text variant="lede">
          Four things I noticed while updating the skills on my own profile, and the
          state problem they all point at.
        </Text>

        <Section eyebrow="What This Is">
          <Prose size="lg">
            <p>
              I was adding and removing skills on my LinkedIn profile and the list did a
              few things I did not expect. I hit most of them more than once, so these are
              not single misreadings, but I have{" "}
              <Strong>no access to their code</Strong>, I only ever
              had my own account and browser to go on, and I am not the one who decides what
              that screen is supposed to do. So this is not a bug report. It is one person
              poking at a UI from the outside, writing down what happened, and then asking
              what it would take to build the same screen without the thing that surprised
              me.
            </p>
          </Prose>

          <Link
            href="/frontend"
            style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}
          >
            <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: "var(--sd-font-mono)", fontSize: 16, color: "var(--sd-accent)" }}>↗</span>
            <span>
              <Eyebrow as="span" variant="sub" style={{ display: "block", color: "var(--sd-accent)" }}>
                Start here if you want the map first
              </Eyebrow>
              <Text as="span" variant="sm-tight" style={{ display: "block" }}>
                <Strong>Frontend System Design, in nine stages.</Strong>{" "}
                Stage 4 is data ownership, stage 5 the UI states, stage 6 the network. This
                page is one stage 4 decision, seen from the outside, going sideways in four
                different ways.
              </Text>
            </span>
          </Link>
        </Section>

        <Section eyebrow="How To Read It" title="Guesses Kept Apart From Observations">

          <Prose>
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
          </Prose>

          <div className="sd-grid-2">
            {(["saw", "expected", "unsure", "build"] as const).map((kind) => (
              <Card key={kind}>
                <Eyebrow variant="sub" style={{ color: CLAIM[kind].color }}>{CLAIM[kind].label}</Eyebrow>
                <Text variant="sm-tight">
                  {kind === "saw" && "What appeared on screen, repeatedly, on one account in one browser. The only part that is not reasoning."}
                  {kind === "expected" && "What I assumed would happen. My assumption, not a contract anyone published."}
                  {kind === "unsure" && "What a browser tab cannot settle. Usually the most interesting part, and the easiest to skip."}
                  {kind === "build" && "What I would do on a screen of my own. A proposal, not a correction of anybody's work."}
                </Text>
              </Card>
            ))}
          </div>

          <Callout style={{ marginTop: 4 }}>
            Between them sits a fifth thing, marked separately wherever it appears: the{" "}
            <Strong>guess</Strong>. Each one is a mechanism that could
            produce what I saw. Listing four of them per finding is the point, because the
            moment there is only one it starts to feel like an answer.
          </Callout>
        </Section>

        <Section eyebrow="The Machine" title="What All Four Are About">

          <Prose>
            <p>
              Before the findings, the thing they all happen inside. Seven parts, and one
              loop worth staring at: the pagination trigger does not read the list it
              watches, it issues a request built from the cache&rsquo;s bookmark. So{" "}
              <Strong>any mutation that moves that bookmark changes
              what the next scroll fetches</Strong>, and nothing in the trigger knows a
              mutation happened.
            </p>
          </Prose>

          <Figure scroll caption={<>A proposal, not a reconstruction of anyone&rsquo;s implementation</>}>
            <StateFlow />
          </Figure>
        </Section>

        <Findings deeper={deeper} />

        {/* Everything above is per-finding and hidden behind a tab. Everything
            below applies to all four and is always on screen. */}
        <hr style={{ border: 0, borderTop: "1px solid var(--sd-border-strong)", margin: "44px 0 40px" }} />

        <Section eyebrow="Key Terms" title="The Vocabulary Of A List That Changes">

          <div className="sd-grid-2">
            {terms.map((term) => (
              <Card key={term.title} title={term.title} tone="teal">
                <Text variant="sm-tight">{term.def}</Text>
              </Card>
            ))}
          </div>
        </Section>

        <Section eyebrow="Final Considerations" title="How You Would Catch All Of This Early">

          <Prose>
            <p>
              Every finding on this page took a person clicking around to notice, which is
              the most expensive way there is to find a bug and the least reliable. All four
              are also{" "}
              <Strong>cheap to assert on</Strong>, as long as the
              arithmetic lives somewhere a test can reach without starting a browser.
            </p>
            <p style={{ marginTop: 12 }}>
              Three tiers, cheapest first. The useful question for each one is not what it
              covers but what it is the only thing that can cover.
            </p>
          </Prose>

          <TestTiers />

          <Eyebrow variant="sub" style={{ marginTop: 22 }}>And before any of those, five cheaper guards</Eyebrow>
          <Guards />

          <Callout tone="accent" style={{ marginTop: 16 }}>
            The through line is the same as the rest of the page.{" "}
            <Strong>A thing with one owner can be asserted on. A
            thing with two can only be noticed.</Strong>{" "}
            Four findings that took scrolling and clicking to spot would each have been a
            failing assertion, if the state they disagree about had been somewhere a test
            could hold still.
          </Callout>
        </Section>

        <Section eyebrow="Key Points" title="What To Carry Forward">
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} columns={2} />
        </Section>

        <Section eyebrow="Common Mistakes" title="Where This Usually Goes Wrong">
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;They moved my bed to the other room and I still go and lie down in the old
            spot. Nobody told me. I am holding a copy of the floor plan and it is wrong.&rdquo;
          </blockquote>
        </Section>

        <Section eyebrow="Reflect" title="Who Owns The Data, And What Must Change When It Changes?">

          <Prose>
            <p>
              That question is the page compressed into one line. Run every piece of state
              on the screen you are building through it. If the answer is that the server
              owns it and three other places keep a copy, you already know which bug you are
              going to ship, and you can go and write the test for it now.
            </p>
          </Prose>
        </Section>

        <Section eyebrow="Try It Yourself" title="Go And Break A List Somewhere Else">

          <Callout tone="accent">
            <div className="sd-stack" style={{ gap: 10 }}>
              {tryIt.map((step) => (
                <Text key={step} variant="sm-tight" style={{ color: "var(--sd-text)" }}>{step}</Text>
              ))}
            </div>
          </Callout>

        </Section>

        <QuizSection eyebrow="Interview Prompts" title="Seven questions this case study answers">
          <QuizCarousel cards={quizCards} />
        </QuizSection>
      </PageLayout>
    </>
  );
}
