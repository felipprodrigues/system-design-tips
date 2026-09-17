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
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";

const quizCards: QuizCard[] = [
  {
    question: "What's the core difference between polling and webhooks in terms of who initiates the exchange?",
    answers: [
      "With polling, the client repeatedly asks the server \"anything new?\" on its own schedule. With webhooks, the server calls the client's endpoint the moment something happens — the client never has to ask.",
    ],
  },
  {
    question: "Why does short polling waste resources even in a perfectly healthy system?",
    answers: [
      "The client sends a request on every fixed interval regardless of whether anything changed, so most requests come back \"no new data\" — burning server capacity, battery, and bandwidth for zero information gain.",
    ],
  },
  {
    question: "How does long polling reduce that waste compared to short polling?",
    answers: [
      "The server holds the request open instead of responding immediately, replying only once new data actually exists or a timeout is reached — collapsing many empty round-trips into one connection that resolves right when there's something worth sending.",
    ],
    note: "The client still has to reopen a new long-poll request immediately after each response, so it's a hybrid, not a full push model.",
  },
  {
    question: "What has to be true about a client for a webhook to reach it at all?",
    answers: [
      "It must expose a publicly reachable HTTPS endpoint the sending server can call — which rules out client devices behind NAT, mobile apps, or anything without a stable, always-on public URL.",
    ],
  },
  {
    question:
      "A payment provider's webhook fires, but your server is mid-deploy and returns a 502 for 90 seconds. What happens to that event?",
    answers: [
      "Most providers retry with exponential backoff for a bounded window (often 24–72 hours) and then give up. Integrations have to assume any single delivery can be lost and build reconciliation — a periodic poll against the provider's API — as a safety net.",
    ],
  },
  {
    question: "Why do webhook endpoints need to be idempotent?",
    answers: [
      "Providers often redeliver the same event on retry or after an ambiguous timeout. If the handler isn't idempotent, a single event — like \"payment succeeded\" — can be processed twice, double-charging a customer or duplicating a side effect.",
    ],
  },
  {
    question: "What's the practical difference between WebSockets and Server-Sent Events (SSE)?",
    answers: [
      "WebSockets are a bidirectional, full-duplex connection — either side can send at any time. SSE is a one-way stream from server to client over plain HTTP, which makes it simpler to deploy through existing infrastructure but unable to carry client-to-server messages on the same channel.",
    ],
  },
  {
    question:
      "Your app needs to notify a mobile client the instant a friend request arrives, and the client is often on a spotty connection. Why not just use a webhook?",
    answers: [
      "Webhooks require the receiver to be reachable at a stable public address — a mobile device on a spotty connection isn't. A push notification service (APNs/FCM) or a reconnecting socket is the right fit instead.",
    ],
  },
  {
    question:
      "A plain REST API call and a short-polling request are the identical HTTP request. So what actually separates the two patterns?",
    answers: [
      "Nothing about the request itself — polling is just that same API call placed on a loop. What differs is who decides when it fires and how often. That is why the plain API is the baseline the other four patterns are measured against: each one is an attempt to stop having to ask repeatedly.",
    ],
    note: "It also explains why polling needs no new infrastructure. If you already have the API, you already have polling.",
  },
  {
    question:
      "Across all five patterns, which two properties determine every other trade-off?",
    answers: [
      "Who opens the connection, and how long it stays open. A client-opened short connection is an API call; a client-opened one held open is long polling; a server-opened one is a webhook; a client-opened persistent one is a WebSocket or SSE. Freshness, cost, and the infrastructure each side has to run all fall out of those two answers.",
    ],
  },
  {
    question:
      "Webhooks, WebSockets, and SSE all deliver updates immediately while polling cannot. Why is that a structural limit rather than something you can tune away?",
    answers: [
      "Polling only learns about a change the next time it asks, so its freshness can never be better than its interval. Shortening the interval buys freshness by burning more empty requests, and it still never reaches zero delay. The push patterns have no interval at all — the connection is already in place when the event happens.",
    ],
    note: "Long polling is the hybrid: the client still does the asking, but the server holds the request open, so the answer arrives when the event does.",
  },
];

const patterns = [
  {
    name: "Short Polling",
    tag: "Simple",
    tagColor: "var(--sd-accent)",
    tagBg: "rgba(76, 110, 245,0.15)",
    body: "The client asks \"anything new?\" on a fixed interval, whether or not anything changed. Trivial to implement, but wastes requests when nothing's happened and caps freshness at the interval length.",
  },
  {
    name: "Long Polling",
    tag: "Efficient",
    tagColor: "var(--sd-teal)",
    tagBg: "rgba(127, 147, 242,0.12)",
    body: "The server holds the connection open until new data exists or a timeout elapses, then the client immediately reopens it. Cuts out empty round-trips, but each waiting client ties up a server connection.",
  },
  {
    name: "Webhooks",
    tag: "Push-based",
    tagColor: "var(--sd-amber)",
    tagBg: "rgba(106, 118, 163,0.1)",
    body: "The server calls a URL you registered the instant an event happens. No client-side loop at all — but the receiver must run public, always-on HTTP infrastructure, and any single delivery can be missed.",
  },
  {
    name: "WebSockets",
    tag: "Real-time",
    tagColor: "var(--sd-green)",
    tagBg: "rgba(157, 176, 247,0.12)",
    body: "A persistent connection stays open and either side can send the moment it needs to. Best latency available, but connection state must survive scaling and restarts.",
  },
  {
    name: "SSE",
    tag: "Real-time",
    tagColor: "var(--sd-teal)",
    tagBg: "rgba(127, 147, 242,0.12)",
    body: "A persistent one-way stream from server to client over plain HTTP. Simpler to deploy than WebSockets and passes through existing infrastructure more easily, but carries no client-to-server messages on the same channel.",
  },
];

// The five shapes, in the order the lesson introduces them. Short and long
// polling share one shape here; the timing difference is covered above.
const shapes = [
  { name: "API", mode: "Pull", color: "var(--sd-muted)", top: "Client", arrow: "\u2192", bottom: "Server", note: "One question, one answer", example: "Opening an order page. You see its status right then, nothing after." },
  { name: "Polling", mode: "Pull", color: "var(--sd-accent)", top: "Client", arrow: "\u21c4", bottom: "Server", note: "Ask again, and again", example: "An order page asking \u201cshipped yet?\u201d every 5 seconds, over and over." },
  { name: "Webhook", mode: "Push", color: "var(--sd-amber)", top: "Server", arrow: "\u2192", bottom: "Your URL", note: "Server calls you", example: "A customer pays, and Stripe calls your server to say it went through." },
  { name: "WebSocket", mode: "Push", color: "var(--sd-green)", top: "Client", arrow: "\u21c5", bottom: "Server", note: "Both talk, stays open", example: "In Figma, you move your cursor, everyone sees it, and you see theirs." },
  { name: "SSE", mode: "Push", color: "var(--sd-teal)", top: "Server", arrow: "\u21ca", bottom: "Client", note: "Server streams, client listens", example: "An AI answer appearing word by word. The server sends, you only read." },
];

const comparisonRows = [
  { strategy: "Request/Response API", fresh: "On demand only", reachable: false, use: "Reading current state at the moment the client asks", cost: "Learns nothing until it asks again" },
  { strategy: "Short Polling", fresh: "Bounded by the interval", reachable: false, use: "Low-frequency updates, simple dashboards", cost: "Most requests come back empty" },
  { strategy: "Long Polling", fresh: "Near real-time", reachable: false, use: "Near-live updates when inbound calls are blocked", cost: "Ties up a server connection per waiting client" },
  { strategy: "Webhooks", fresh: "Immediate", reachable: true, use: "Server-to-server integrations (payments, CI/CD, SaaS)", cost: "A delivery can be missed or arrive twice" },
  { strategy: "WebSockets", fresh: "Immediate", reachable: false, use: "Bidirectional real-time apps (chat, multiplayer, cursors)", cost: "Connection state must survive scaling and restarts" },
  { strategy: "SSE", fresh: "Immediate", reachable: false, use: "One-way live feeds (notifications, live scores)", cost: "No client-to-server channel; some proxies buffer streams" },
];

export default function Lesson06() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="Choosing a Communication Pattern"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 6 · Foundations
        </p>
        <h1 className="sd-h1">
          Choosing a Communication Pattern
        </h1>
        <p className="sd-lede">
          How a system finds out about changes it didn't initiate.
        </p>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            HTTP is fundamentally a{" "}
            <strong className="sd-strong">client-initiated protocol</strong> — a server can't just decide to send a client something. So whenever one system needs to know about a change happening in another, there are really only two shapes the answer can take:{" "}
            <span className="sd-hl">the client keeps asking</span>, or{" "}
            <span className="sd-hl">the server is given a way to reach out first</span>.
          </p>
          <p>
            Every "how do I get real-time updates" design question — order status, chat messages, CI build results, payment confirmations — reduces to picking a point on that spectrum, and accepting the trade-off that comes with it.
          </p>
        </div>

        {/* The Pattern */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Big Picture
          </p>
          <h2 className="sd-h2">Pull vs. Push</h2>

          <div className="sd-prose">
            <p>In a <strong className="sd-strong">pull</strong> model, the client owns the schedule — it asks repeatedly and accepts that most answers will be "nothing changed." In a <strong className="sd-strong">push</strong> model, the server owns the timing — it calls the moment something happens, and the client's job is just to be reachable.</p>
            <p style={{ marginTop: 10 }}>
              Neither is strictly better. Pull is simple and works behind any firewall; push is efficient but demands infrastructure on the receiving end.{" "}
              <strong className="sd-strong">The right choice depends on who can be reached, and how fresh the data needs to be.</strong>
            </p>
          </div>

          {/* Pull vs push diagram */}
          <div className="sd-figure">
            <p className="sd-figure-caption">
              Two shapes for the same problem
            </p>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              <div className="sd-stack-center">
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sd-accent)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Pull (Polling)</div>
                <div style={{ background: "rgba(76, 110, 245,0.1)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-accent)" }}>Client</div>
                <div className="sd-arrow-sm">⇄</div>
                <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)" }}>Server</div>
                <div style={{ fontSize: 10, color: "var(--sd-muted)", marginTop: 4, textAlign: "center", maxWidth: 160 }}>Client asks repeatedly, on its own clock</div>
              </div>
              <div className="sd-stack-center">
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sd-amber)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Push (Webhook)</div>
                <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)" }}>Server</div>
                <div className="sd-arrow-sm">→</div>
                <div style={{ background: "rgba(106, 118, 163,0.1)", border: "1px solid var(--sd-amber)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-amber)" }}>Client's endpoint</div>
                <div style={{ fontSize: 10, color: "var(--sd-muted)", marginTop: 4, textAlign: "center", maxWidth: 160 }}>Server calls in, the instant something happens</div>
              </div>
            </div>
          </div>

          <div className="sd-callout sd-callout-accent">
            A webhook is really just <strong className="sd-strong">polling with the roles reversed</strong> — the "client" for that one HTTP call is the server that owns the event, and your endpoint is playing server.
          </div>
        </div>

        {/* Patterns */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Spectrum
          </p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, marginRight: 10, verticalAlign: "middle", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)" }}>
              Patterns
            </span>
            Five Ways to Learn About a Change
          </h2>

          <div className="sd-prose">
            <p>Each pattern trades implementation simplicity for freshness and efficiency. The right one depends on whether the receiver can accept inbound connections, how stale the data is allowed to get, and how much infrastructure you're willing to run.</p>
          </div>

          <div className="sd-grid-2">
            {patterns.map((p) => (
              <div key={p.name} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  {p.name}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: p.tagBg, color: p.tagColor }}>
                    {p.tag}
                  </span>
                </div>
                <p className="sd-text-sm-tight">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-accent">
            Notice the progression: each step trades a simpler client for a more demanding one — until, with WebSockets, the client has to maintain a live connection just like the server does.
          </div>
        </div>

        {/* Comparison */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Reference
          </p>
          <h2 className="sd-h2">Every Option, Side by Side</h2>

          <div className="sd-prose">
            <p>
              Five patterns, and the whole comparison comes down to{" "}
              <strong className="sd-strong">who opens the connection, and how long it stays open</strong>. Everything else — freshness, cost, what infrastructure you need — falls out of those two answers.
            </p>
          </div>

          {/* Shape strip */}
          <div className="sd-figure">
            <p className="sd-figure-caption">
              The shape of each exchange
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {shapes.map((s) => (
                <div key={s.name} className="sd-stack-center" style={{ gap: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 2 }}>
                    {s.mode}
                  </div>
                  <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: "var(--sd-text)", width: "100%", textAlign: "center" }}>
                    {s.top}
                  </div>
                  <div style={{ fontSize: 17, color: s.color, lineHeight: 1 }}>{s.arrow}</div>
                  <div style={{ background: "var(--sd-surface2)", border: `1px solid ${s.color}`, borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: s.color, width: "100%", textAlign: "center" }}>
                    {s.bottom}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--sd-muted)", textAlign: "center", lineHeight: 1.45, marginTop: 2 }}>
                    {s.note}
                  </div>
                  <div style={{ width: "100%", marginTop: "auto", paddingTop: 5, background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 6, padding: "7px 8px", textAlign: "center", minHeight: 74, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 3 }}>
                      Example
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: s.color, lineHeight: 1.45 }}>
                      {s.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Axes table */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 640 }}>
              <thead>
                <tr>
                  {["Pattern", "Freshness", "Needs public endpoint", "Best for", "Main cost"].map((h) => (
                    <th key={h} style={{ padding: "11px 12px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => {
                  const border = i < comparisonRows.length - 1 ? "1px solid var(--sd-border)" : "none";
                  return (
                    <tr key={row.strategy}>
                      <td style={{ padding: "11px 12px", borderBottom: border, fontWeight: 700, color: "var(--sd-text)" }}>{row.strategy}</td>
                      <td style={{ padding: "11px 12px", borderBottom: border, color: "var(--sd-text)" }}>{row.fresh}</td>
                      <td style={{ padding: "11px 12px", borderBottom: border, fontWeight: 600, color: row.reachable ? "var(--sd-amber)" : "var(--sd-teal)" }}>
                        {row.reachable ? "Yes" : "No"}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: border, color: "var(--sd-muted)" }}>{row.use}</td>
                      <td style={{ padding: "11px 12px", borderBottom: border, color: "var(--sd-muted)" }}>{row.cost}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginBottom: 12 }}>
            <strong className="sd-strong">Webhooks are the only row that says Yes.</strong> That single column is what usually decides the design: a browser tab or a mobile app has no stable public URL, so webhooks are off the table before any other trade-off gets discussed.
          </div>

          <div className="sd-callout sd-callout-green">
            Two questions get you to the answer.{" "}
            <span className="sd-hl">Can the receiver accept inbound connections?</span> If no, webhooks are out.{" "}
            <span className="sd-hl">Does the client need to send messages back on the same channel?</span> If yes, WebSockets; if no, SSE is simpler and survives proxies better.
          </div>
        </div>

        {/* Reliability */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Fault Tolerance
          </p>
          <h2 className="sd-h2">Webhook Delivery Isn't Guaranteed</h2>

          <div className="sd-prose">
            <p>
              A webhook call is a single, best-effort HTTP request from someone else's server to yours. If your endpoint is down, slow, or returns a non-2xx status, that event can be{" "}
              <strong className="sd-strong">retried, delayed, or — eventually — dropped</strong>, depending on the sender's retry policy.
            </p>
            <p style={{ marginTop: 10 }}>
              Because retries happen, the same event can also arrive{" "}
              <strong className="sd-strong">more than once</strong>. Any receiver that isn't built to handle both of those failure modes will eventually miss an event or double-process one.
            </p>
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong className="sd-strong">Treat webhooks as at-most-once, best-effort delivery.</strong> Anything that must not be lost — a payment, an order state change — needs a reconciliation path that doesn't depend on the webhook having fired.
          </div>

          <div className="sd-callout sd-callout-green">
            That reconciliation path is usually just <span className="sd-hl">polling</span> — a periodic call to the provider's API that lists recent events and repairs anything the webhook silently missed. Push for speed, pull for correctness.
          </div>
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">
            Quiz Review
          </p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          Webhooks and polling both move the same information — they just disagree about who's responsible for noticing it changed, and when.
        </p>

        <PanelSection title="What happens when a webhook delivery fails, and how do good integrations handle it?">
          <p className="sd-text-sm">
            A failed delivery is invisible to the receiver by default — nothing arrived, so nothing looks wrong.{" "}
            <strong className="sd-strong">The sender's retry policy and the receiver's own safety nets are what stand between that and a silently lost event.</strong>
          </p>
          {[
            {
              title: "Retry with Backoff",
              body: "Senders typically retry a failed delivery with exponential backoff over a bounded window (hours to a few days), then stop. Your endpoint just needs to return 2xx quickly and do the real work asynchronously — a slow handler looks identical to a dead one.",
            },
            {
              title: "Idempotency Keys",
              body: "Every event carries a unique ID. The receiver records which IDs it has already processed and skips duplicates. Without this, a single retried delivery can double-charge a customer or duplicate a database write.",
            },
            {
              title: "Dead Letter / Manual Replay",
              body: "Events that exhaust all retries land in a dead-letter queue or an events log the sender exposes, so a human or a batch job can replay them later instead of the data being gone for good.",
            },
            {
              title: "Reconciliation Polling",
              body: "A periodic job pulls the sender's canonical list of recent events (most APIs expose one) and diffs it against what actually got processed — catching anything the webhook layer missed entirely, including outages neither side logged.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Webhooks are at-most-once, best-effort push in practice.</strong> Every serious integration treats them as a fast path, not a guarantee, and pairs them with a slower poll-based source of truth.
          </div>
        </PanelSection>

        <PanelSection title="How do you verify a webhook actually came from who it claims to?">
          <p className="sd-text-sm">
            A webhook endpoint is a public URL that accepts POST requests — anyone who finds it can send it fake events.{" "}
            <strong className="sd-strong">The signature, not the URL, is the actual trust boundary.</strong>
          </p>
          {[
            {
              title: "HMAC Signature Verification",
              body: "The sender signs the request body with a shared secret and includes the signature in a header. Your endpoint recomputes the signature from the raw body and compares — if it doesn't match, the request is rejected before any business logic runs.",
            },
            {
              title: "Timestamp + Replay Protection",
              body: "A captured, validly-signed request could be replayed later. Senders include a timestamp in the signed payload so receivers can reject anything older than a few minutes, closing that window.",
            },
            {
              title: "IP Allowlisting",
              body: "Some providers publish a fixed set of sending IPs. Useful as a second layer, but weak on its own — IP ranges change, and it does nothing against a compromised secret.",
            },
            {
              title: "mTLS for High-Security Integrations",
              body: "Banking and payment rails sometimes require mutual TLS, where both sides present certificates — stronger than a shared secret, but heavier to operate and rarely needed outside regulated integrations.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            An unverified webhook handler is an <strong className="sd-hl">unauthenticated write API</strong> wearing a different name. Sign, verify, and reject before you trust a single field in the payload.
          </div>
        </PanelSection>

        <PanelSection title="When does long polling actually beat both short polling and full webhooks?">
          <p className="sd-text-sm">
            Long polling occupies a specific niche: <strong className="sd-strong">the client can't accept inbound connections, but a slow poll timer isn't good enough either.</strong>
          </p>
          {[
            {
              title: "Client Behind NAT or a Firewall",
              body: "A browser tab or a device on a corporate network has no way to receive an inbound call — a webhook is off the table. Long polling still works because the client always initiates the connection.",
            },
            {
              title: "Avoiding Persistent-Connection Infrastructure",
              body: "WebSockets require load balancers, proxies, and servers to all support long-lived connections and sticky routing. Long polling rides on plain HTTP request/response, so it works through infrastructure that was never built for real-time traffic.",
            },
            {
              title: "Historical Precedent",
              body: "Before WebSockets had broad browser support, long polling (\"Comet\") was how chat apps like early Facebook Chat and Gmail's notification stream approximated real-time delivery.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            Long polling is the <strong className="sd-hl">"good enough" middle ground</strong> when you can't push but can't afford a slow poll timer either.
          </div>
        </PanelSection>

        <PanelSection title="Why do production systems that use webhooks almost always also poll?">
          <p className="sd-text-sm">
            A webhook tells you about an event <em>if</em> it fires and <em>if</em> it's delivered. Neither is certain, and the receiver has no way to detect the gap on its own.
          </p>
          {[
            {
              title: "Silent Gaps",
              body: "A brief outage, a misconfigured retry policy, or a provider-side bug can mean an event simply never arrives — with no error, no log, nothing for the receiver to notice.",
            },
            {
              title: "Reconciliation Closes the Gap",
              body: "A periodic poll against the provider's canonical event list (or current state) catches anything that fell through. Stripe, for example, explicitly recommends listing recent events via its API even when webhooks are configured.",
            },
            {
              title: "Different Jobs, Same System",
              body: "The webhook optimizes for latency — act within seconds. The poll optimizes for correctness — never silently drift out of sync. Neither one is redundant with the other.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Webhooks give you speed; polling gives you a correctness backstop.</strong> Production-grade integrations use both, not one instead of the other.
          </div>
        </PanelSection>

        <PanelSection title="WebSockets vs. SSE vs. webhooks — how do you actually choose?">
          <p className="sd-text-sm">
            All three are "push," but they differ in <strong className="sd-strong">direction and who the receiver is</strong> — and that alone usually decides it.
          </p>
          {[
            {
              title: "Direction of Traffic",
              body: "Need the client to send messages back on the same channel (chat, multiplayer, live cursors)? WebSocket. Only need one-way updates flowing to a browser (notifications, live scores)? SSE is simpler and rides plain HTTP.",
            },
            {
              title: "Who's Actually Reachable",
              body: "Webhooks assume the receiver is a server with a public endpoint. If the receiver is a browser tab or a mobile app instead, it can't accept inbound calls — so the choice narrows to WebSocket, SSE, or a push notification service.",
            },
            {
              title: "Infrastructure Budget",
              body: "SSE and webhooks both work over standard HTTP, so they pass through existing proxies and load balancers untouched. WebSockets need infrastructure that supports long-lived connections and sticky routing at scale — a real operational cost.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            Pick based on <strong className="sd-hl">who needs to talk to whom, and in which direction</strong> — not on which one sounds most "real-time."
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        {...getLessonNav("06-communication-patterns")}
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
