"use client";

import { useState } from "react";
import {
  Breadcrumb,
  DeepDiveButton,
  SidePanel,
  PanelSection,
  QuizCarousel,
  PageNav,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";

const quizCards: QuizCard[] = [
  {
    question: "Why doesn't GraphQL simply replace REST everywhere, given that it removes over-fetching and under-fetching?",
    answers: ["GraphQL trades those wins for real costs: a single flexible endpoint is harder to cache with standard HTTP caching, harder to rate-limit sensibly since queries vary in cost, and requires server-side protections against expensive nested queries that a fixed-shape REST endpoint never needs. For simple, cacheable, widely-consumed public APIs, REST's constraints are often a feature, not a limitation."],
  },
  {
    question: "Why is gRPC a poor fit for a public API that any third-party developer might call?",
    answers: ["gRPC requires the client to have the same .proto schema compiled in, isn't natively callable from a browser without a proxying layer, and produces binary payloads that are hard to inspect with generic tools like curl or a browser's network tab. Public APIs prioritize broad compatibility and easy debugging by unknown developers, which is exactly what REST's plain-text, universally-supported HTTP model provides."],
  },
  {
    question: "What's a concrete example of the N+1 problem in GraphQL, and how is it typically fixed?",
    answers: ["A query asking for 50 posts, each with its author, can naively trigger 1 query for the posts plus 50 separate queries, one per post, to fetch each author. It's typically fixed with a batching layer like DataLoader, which collects all the author IDs requested during one tick and issues a single batched query for all of them instead of one query per item."],
  },
  {
    question: "A GraphQL gateway sitting in front of gRPC services looks like two competing choices in one system. Why is it neither a contradiction nor a compromise?",
    answers: ["Because each side has a different caller. Outward, client shapes vary (a mobile screen and a web screen need different slices of the same data), so GraphQL lets each client name its own fields without the backend growing an endpoint per screen. Inward, both ends are services the same organization controls and deploys together, so gRPC's shared .proto and binary encoding buy speed and compile-time safety at no compatibility cost. The style follows the caller, and there are two different callers."],
  },
  {
    question: "A team's REST API keeps growing endpoints like /home-screen, /profile-screen, and /settings-screen. What is that a symptom of, and what does it suggest?",
    answers: ["It's the fixed response shape problem surfacing. Each screen needs a different combination of fields, and rather than pay for several round trips the backend grows a bespoke endpoint per screen. Every one of those is another thing to version, document, and maintain, and they multiply with the UI rather than with the data. That accumulating pain is exactly the signal that GraphQL might fit, since a client-specified query removes the reason those endpoints exist."],
  },
  {
    question: "What does a schema-first contract buy you, and what is REST giving up by not requiring one?",
    answers: ["GraphQL and gRPC both require the contract to be declared up front, so a mismatch between what a client expects and what the server sends is caught at compile or validation time rather than in production. Under REST's looser contract, a renamed or removed field usually surfaces as a runtime failure inside a client you do not control and cannot redeploy. What REST buys with that looseness is reach: with no shared schema to distribute, anything that speaks HTTP can call it on day one."],
  },
];

const whyThisExists = [
  "A team defaults to REST for everything because it's what they know, then discovers their mobile app makes six round trips to assemble one screen because no single REST endpoint returns exactly what the screen needs.",
  "Another team wires two internal microservices together with hand-rolled JSON over HTTP, then spends real engineering time on serialization bugs and slow parsing that a typed, binary protocol would have avoided from day one.",
  "Without a clear model of what each API style is actually for, engineers argue about which one is 'better' in the abstract, when the real question is always: who is calling this, over what network, and how often does the shape of the request change.",
];

const styles = [
  {
    label: "REST",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    analogy: "A fixed menu: you pick item number 7, and you get exactly what\u2019s on the card for item 7, no more, no less, if you want something different you order another item.",
    points: [
      { role: "How it works", body: "REST models a system as resources, nouns like /users/42 or /orders/17, and uses HTTP verbs (GET, POST, PUT, DELETE) to act on them. The URL structure and status codes carry meaning, which makes REST easy to cache, easy to reason about, and understood by essentially every HTTP client and tool that exists." },
      { role: "The cost", body: "REST's core weakness is fixed response shapes: a single endpoint returns a fixed set of fields, so a client that needs data from three resources either makes three requests or the backend grows a special-purpose endpoint just for that one screen, and that pattern repeats until the API is full of one-off endpoints." },
      { role: "Where it fits", body: "REST fits public and partner-facing APIs where wide compatibility, cacheability, and simplicity matter more than squeezing out the last bit of performance, think a payments API or a public product catalog API that many unrelated clients consume." },
    ],
  },
  {
    label: "GraphQL",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    analogy: "A buffet where you build your own plate, naming precisely which sides and how much of each you want in one trip, at the cost of the kitchen having to support arbitrary combinations.",
    points: [
      { role: "How it works", body: "GraphQL exposes a single endpoint backed by a schema describing every type and relationship in the data graph, and the client sends a query naming exactly the fields it wants, nested across relationships, in one round trip. This kills both over-fetching (getting fields you don't need) and under-fetching (needing a second request to get related data)." },
      { role: "The cost", body: "GraphQL moves real complexity to the server: resolving a deeply nested query can silently trigger many expensive database calls (the N+1 problem) unless the server batches them deliberately, and a naive GraphQL server can be trivially asked for a query so large it becomes a denial-of-service vector, which means query cost analysis and depth limiting aren't optional extras." },
      { role: "Where it fits", body: "GraphQL fits products with many different client shapes pulling from the same underlying graph of data, like a mobile app and a web app that need different slices of the same user/post/comment graph, and where the frontend team wants to move fast without waiting on backend endpoint changes." },
    ],
  },
  {
    label: "gRPC",
    color: "var(--sd-green)",
    wash: "rgba(157, 176, 247,0.12)",
    analogy: "Calling the chef directly on a private phone line with a script you both already agree on word for word, extremely fast and precise, but only useful between people who share that script, not something you hand to a random customer off the street.",
    points: [
      { role: "How it works", body: "gRPC uses Protocol Buffers, a compact binary format with a strict schema, and HTTP/2 as transport, to call a remote function almost as if it were local: client.getUser(id) instead of assembling a URL and parsing JSON text. Binary encoding and HTTP/2 multiplexing make it substantially faster and lower-bandwidth than JSON-over-HTTP for high-volume service-to-service traffic." },
      { role: "The cost", body: "gRPC's strict schema (the .proto file) is enforced at compile time on both client and server, catching type mismatches before deployment instead of at runtime like a loosely typed JSON API would. The cost is that gRPC is much less friendly to a browser calling it directly and far less human-readable when you're debugging with a plain text tool." },
      { role: "Where it fits", body: "gRPC fits internal service-to-service calls inside one organization's infrastructure, where both ends are services you control, the schema evolves together, and call volume and latency actually matter, not calls made by an arbitrary third-party developer." },
    ],
  },
];


const terms = [
  { title: "Resource", def: "In REST, a noun the API exposes and lets you act on with HTTP verbs, like a user, an order, or a post, identified by a stable URL." },
  { title: "Over-fetching", def: "Getting more fields in a response than the client actually needs, wasting bandwidth and parsing time, a common REST symptom when one endpoint serves many different callers." },
  { title: "Under-fetching", def: "Not getting enough data in one response, forcing the client to make additional requests to assemble what it needed, another common REST symptom that GraphQL is specifically designed to remove." },
  { title: "N+1 problem", def: "A performance bug, common in naive GraphQL resolvers, where fetching a list of N items triggers N additional individual queries for related data instead of one batched query." },
  { title: "Protocol Buffers (protobuf)", def: "The binary, strictly typed serialization format gRPC uses, defined in a .proto schema file shared by client and server, compiled into native code for each language." },
  { title: "Schema-first API", def: "An API design approach where the contract (types, fields, operations) is defined explicitly up front, as GraphQL and gRPC both require, catching mismatches before runtime rather than after." },
];

const seenInTheWild = [
  "Facebook created GraphQL specifically to solve mobile over-fetching and under-fetching across News Feed, Marketplace, and other products that all pull from the same enormous social graph with very different client needs.",
  "Stripe's public payments API is REST, deliberately, because millions of unrelated developers integrate with it and REST's ubiquity, cacheability, and simple mental model matter far more than shaving milliseconds off a request.",
  "Google, which invented gRPC, uses it pervasively for internal service-to-service communication across its own infrastructure, where every caller and callee is a service Google itself controls and both ends can be updated together.",
  "Netflix uses gRPC extensively between its hundreds of internal microservices for exactly the same reason: high call volume, controlled endpoints, and a strong need for low latency and strict typing.",
];

const keyPoints = [
  "REST models resources with HTTP verbs, is cacheable and universally understood, but suffers from fixed response shapes that cause over-fetching and under-fetching.",
  "GraphQL lets the client ask for exactly the fields it needs across a graph of relationships in a single round trip, at the cost of server-side complexity like the N+1 problem and query cost limiting.",
  "gRPC uses binary Protocol Buffers over HTTP/2 for fast, strictly typed calls, ideal between services you control, but is a poor fit for public or browser-facing APIs.",
  "The right choice depends on the caller: public/partner APIs lean REST, many-shaped frontend clients lean GraphQL, internal service-to-service calls lean gRPC.",
  "Schema-first designs (GraphQL, gRPC) catch mismatches before runtime; REST's looser contract trades that safety for simplicity and reach.",
  "Real systems often use more than one style at once, a GraphQL gateway in front of internal gRPC services is a common combination, not a contradiction.",
];

const commonMistakes = [
  "Treating this as a single 'best API style' debate instead of matching the style to who is calling the API and how often the required data shape changes.",
  "Adopting GraphQL without building query depth limits or cost analysis, leaving the server open to a single expensive nested query taking down the database.",
  "Using gRPC for a public-facing API that third-party developers or browsers need to call directly, ignoring that most browsers and casual integrators can't easily consume it.",
  "Designing a REST API with dozens of screen-specific endpoints to work around fixed response shapes, when that pain is exactly the signal that GraphQL might fit better.",
  "Assuming GraphQL is automatically faster than REST, when a poorly resolved GraphQL query can be far slower than a well-cached REST endpoint for the same data.",
];

const restVsGraphql = [
  {
    label: "REST",
    color: "var(--sd-amber)",
    points: [
      "GET /users/42 returns the user",
      "GET /users/42/posts?limit=3 returns the posts, a second round trip",
      "Response shape is fixed by the server, client takes what it's given",
    ],
  },
  {
    label: "GraphQL",
    color: "var(--sd-teal)",
    points: [
      "One query asks for user { name, posts(limit: 3) { title } }",
      "One round trip returns exactly those fields, nothing more",
      "Server resolves the nested relationship internally",
    ],
  },
];

/* Boxes for the "where each style sits" figure. */
const topologyNodes = [
  { kind: "Client", name: "Mobile app", x: 20, y: 30, w: 180, accent: false },
  { kind: "Client", name: "Web app", x: 20, y: 140, w: 180, accent: false },
  { kind: "Gateway", name: "GraphQL gateway", x: 360, y: 85, w: 210, accent: true },
  { kind: "Server", name: "User service", x: 730, y: 30, w: 190, accent: true },
  { kind: "Server", name: "Post service", x: 730, y: 140, w: 190, accent: true },
  { kind: "Client", name: "Partner integration", x: 20, y: 300, w: 180, accent: false },
  { kind: "Server", name: "Public REST API", x: 360, y: 300, w: 210, accent: true },
];

export default function Lesson08() {
  const [panelOpen, setPanelOpen] = useState(false);
  const nav = getLessonNav("08-api-design");

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="API Design: REST, GraphQL, and gRPC"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">API Design: REST, GraphQL, and gRPC</h1>
        <p className="sd-lede">
          Three ways to expose a system, and the caller each one is built for.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              REST, GraphQL, and gRPC are not competing on quality, they&rsquo;re built for different shapes of problem: <strong className="sd-strong">resources you fetch and mutate</strong>, <strong className="sd-strong">flexible queries across a graph of data</strong>, and <strong className="sd-strong">fast typed calls between internal services</strong>. Picking one is really picking which caller you&rsquo;re optimizing for.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">The Argument This Lesson Ends</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">Three Ways To Order Food</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "stretch" }}>
            {styles.map((st) => (
              <div key={st.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: st.wash, color: st.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {st.label}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p className="sd-text-sm-tight">{st.analogy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The concept */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">What Each Style Actually Does</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {styles.map((st) => (
              <div key={st.label}>
                <p className="sd-eyebrow-sub" style={{ color: st.color }}>{st.label}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "stretch" }}>
                  {st.points.map((pt) => (
                    <div key={pt.role} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: st.color, marginBottom: 5 }}>
                        {pt.role}
                      </div>
                      <p className="sd-text-sm-tight">{pt.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Terms</p>
          <h2 className="sd-h2">The Vocabulary Of An API Contract</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* REST vs GraphQL, worked */}
        <div className="sd-section">
          <p className="sd-eyebrow">Worked Example</p>
          <h2 className="sd-h2">Fetching A User&rsquo;s Profile With Their Last 3 Posts</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "rgba(106, 118, 163,0.12)", color: restVsGraphql[0].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {restVsGraphql[0].label}
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {restVsGraphql[0].points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, color: restVsGraphql[0].color, fontSize: 11, lineHeight: 1.7 }}>●</span>
                    <p className="sd-text-sm-tight">{pt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
            </div>

            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "rgba(127, 147, 242,0.12)", color: restVsGraphql[1].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {restVsGraphql[1].label}
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {restVsGraphql[1].points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, color: restVsGraphql[1].color, fontSize: 11, lineHeight: 1.7 }}>●</span>
                    <p className="sd-text-sm-tight">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Topology */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Where Each Style Typically Sits In One System</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 950 400"
              role="img"
              aria-label="Mobile and web apps send GraphQL queries to a GraphQL gateway, which makes gRPC calls to a user service and a post service. Separately, a partner integration calls a public REST API over plain HTTP."
              style={{ width: "100%", minWidth: 640, display: "block" }}
            >
              <title>Where each API style sits in one system</title>
              <defs>
                <marker id="sd-api-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              <path d="M 200 65 C 270 65, 300 100, 352 105" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow)" />
              <path d="M 200 175 C 270 175, 300 140, 352 135" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow)" />
              <path d="M 570 105 C 640 105, 670 70, 722 65" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow)" />
              <path d="M 570 135 C 640 135, 670 170, 722 175" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow)" />
              <path d="M 200 335 H 352" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow)" />

              <text x="276" y="52" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">GraphQL query</text>
              <text x="276" y="200" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">GraphQL query</text>
              <text x="646" y="52" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">gRPC call</text>
              <text x="646" y="200" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">gRPC call</text>
              <text x="276" y="322" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">HTTP GET/POST</text>

              {topologyNodes.map((n) => (
                <g key={n.name}>
                  <rect x={n.x} y={n.y} width={n.w} height={70} rx={10} fill="var(--sd-surface2)" stroke={n.accent ? "var(--sd-teal)" : "var(--sd-border-strong)"} strokeWidth="1.5" />
                  <text x={n.x + n.w / 2} y={n.y + 28} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" letterSpacing="1" fill={n.accent ? "var(--sd-teal)" : "var(--sd-muted)"}>
                    {n.kind.toUpperCase()}
                  </text>
                  <text x={n.x + n.w / 2} y={n.y + 49} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">
                    {n.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            Notice this system uses <strong className="sd-strong">all three</strong>. The gateway speaks GraphQL outward because client shapes vary, gRPC inward because both ends are services the same team controls, and the partner path stays REST because a third party has to integrate with it.
          </div>
        </div>

        {/* Decision tree */}
        <div className="sd-section">
          <p className="sd-eyebrow">Putting It Together</p>
          <h2 className="sd-h2">Which API Style Fits Your Caller?</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 1000 720"
              role="img"
              aria-label="A decision tree. Start from who is calling the API. If it is an internal service you control, use gRPC. Otherwise, ask whether client shapes vary a lot: if yes use GraphQL, if no use REST."
              style={{ width: "100%", minWidth: 620, display: "block" }}
            >
              <title>Which API style fits your caller</title>
              <defs>
                <marker id="sd-api-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              <path d="M 470 80 V 105" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow2)" />
              <path d="M 385 245 C 310 320, 210 360, 180 412" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow2)" />
              <path d="M 555 245 C 630 300, 680 330, 700 354" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow2)" />
              <path d="M 607 496 C 570 560, 545 590, 545 632" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow2)" />
              <path d="M 793 496 C 830 560, 850 590, 850 632" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-api-arrow2)" />

              <text x="295" y="330" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-muted)">yes</text>
              <text x="628" y="320" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-muted)">no</text>
              <text x="470" y="590" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">yes, many apps/screens</text>
              <text x="930" y="590" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">no, fixed resources</text>

              <rect x="330" y="16" width="280" height="64" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="470" y="53" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="14" fill="var(--sd-text)">Who is calling this API?</text>

              <polygon points="470,113 640,200 470,287 300,200" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="470" y="194" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-text)">Internal service</text>
              <text x="470" y="214" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-text)">you control?</text>

              <polygon points="700,362 885,450 700,538 515,450" fill="var(--sd-surface2)" stroke="var(--sd-teal)" strokeWidth="1.5" />
              <text x="700" y="444" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-text)">Do client shapes</text>
              <text x="700" y="464" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fill="var(--sd-text)">vary a lot?</text>

              <rect x="30" y="420" width="300" height="60" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-accent)" strokeWidth="1.5" />
              <text x="180" y="456" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="13" fontWeight="700" fill="var(--sd-text)">gRPC: fast, typed, binary</text>

              <rect x="410" y="640" width="270" height="58" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-green)" strokeWidth="1.5" />
              <text x="545" y="675" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">GraphQL: client picks fields</text>

              <rect x="715" y="640" width="255" height="58" rx="8" fill="var(--sd-surface2)" stroke="var(--sd-green)" strokeWidth="1.5" />
              <text x="842" y="675" textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">REST: cacheable, universal</text>
            </svg>
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">Who Picked What, And Why</h2>
          <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
        </div>

        {/* Key points */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Points</p>
          <h2 className="sd-h2">What To Carry Forward</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints} columns={2} />
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">Common Mistakes</p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;One bark is water. Two is outside. A long stare is treat. My human and I have never needed words. Then the dog-sitter arrived, and I barked twice at her for an hour. Turns out a private language is only fast if both ends already speak it.&rdquo;
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Count The Round Trips</h2>

          <div className="sd-callout sd-callout-accent">
            Pick a screen in an app you use that clearly combines data from more than one resource, like a profile page showing a user plus their recent activity. Sketch what the <strong className="sd-strong">REST version</strong> would need (how many endpoints, how many round trips) versus a <strong className="sd-strong">single GraphQL query</strong> for the same screen, and name one reason an internal team building that same feature&rsquo;s backend services might use <strong className="sd-strong">gRPC</strong> between them instead of either.
          </div>
        </div>
        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Quiz Review</p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          Three things the lesson names but does not unpack: a word people use loosely, a format people call fast without saying why, and the pattern GraphQL is usually competing with.
        </p>

        <PanelSection title="REST vs RESTful: what is the actual difference?" defaultOpen>
          <p className="sd-text-sm">
            <strong className="sd-strong">REST is a set of rules. RESTful means you followed most of them.</strong> When someone says &ldquo;our REST API&rdquo;, they almost always mean the second thing.
          </p>
          {[
            {
              title: "REST is the rulebook",
              body: "In 2000, Roy Fielding wrote down what makes the web itself work well and called the result REST. It is six rules. Follow all six and you have REST. It is a description of how to design something, not a technology you install, and it never mentions JSON.",
            },
            {
              title: "RESTful is what people actually build",
              body: "Nearly every API called RESTful follows about four of the six: URLs named after things (/users/42), standard verbs (GET, POST, PUT, DELETE), meaningful status codes, and no memory of previous requests. That is usually the right amount.",
            },
            {
              title: "The rule almost everyone drops",
              body: "One rule says every response should include links telling the client what it can do next, so the client discovers the API instead of hardcoding URLs. Hardly anyone does this, because documentation is cheaper and works. The term for it is HATEOAS, and you can safely go years without needing it.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Short version: REST is the full recipe, RESTful is the version people cook.</strong> The gap between them almost never changes a design decision, so it is not worth an argument.
          </div>
        </PanelSection>

        <PanelSection title="What is Protocol Buffers, really?">
          <p className="sd-text-sm">
            Think of a form. <strong className="sd-strong">JSON mails the whole form back every time, questions and all. Protobuf mails only the answers</strong>, because both sides already have the same blank form.
          </p>
          {[
            {
              title: "JSON repeats itself constantly",
              body: "Every JSON message carries its own field names as text. Send a million messages with a userId field and you have sent the word \"userId\" a million times. Readable, but a lot of the bytes are labels rather than data.",
            },
            {
              title: "Protobuf agrees the names once, up front",
              body: "The .proto file is that shared blank form. Both sides compile it before anything runs, so the wire only has to carry the values plus a small number saying which field each value belongs to. Smaller messages, and far less work to read them.",
            },
            {
              title: "What you give up is legibility",
              body: "Open a protobuf message in a text editor and it is meaningless bytes. You need the .proto to make sense of anything. That is a fine trade inside your own systems, where both ends ship together, and a bad one for a public API where a stranger has to debug it with curl.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Protobuf is not a faster JSON.</strong> It is JSON with the labels stripped out, because both ends already know what the labels were.
          </div>
        </PanelSection>

        <PanelSection title="What is a BFF, and how does it relate to GraphQL?">
          <p className="sd-text-sm">
            BFF stands for <strong className="sd-strong">Backend For Frontend</strong>. It solves the same problem GraphQL does, mismatched data shapes, but from the opposite side.
          </p>
          {[
            {
              title: "One small backend per frontend",
              body: "The iOS app, the web app and the TV app each get their own thin service. Its only job is to call the internal services, assemble exactly what that client's screens need, and return it. Three clients, three little backends, each owned by the team that owns the client.",
            },
            {
              title: "Same problem, opposite side",
              body: "A BFF fixes the shape mismatch on the server, by hand-writing a layer per client. GraphQL fixes it on the client, by letting each one write its own query against one schema. Both exist because one fixed API cannot serve very different screens well.",
            },
            {
              title: "Which one fits",
              body: "A BFF suits a few known clients with genuinely different needs, and keeps normal HTTP caching and per-endpoint rate limits. GraphQL suits many clients or fast-changing ones, where you do not want to ship a backend change for every screen tweak, and you accept query cost limiting in exchange.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">A GraphQL gateway is a BFF for every client at once.</strong> That is why teams collapse several BFFs into one gateway, and why some go back the other way when the gateway turns into the bottleneck everyone has to queue behind.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} />
    </>
  );
}
