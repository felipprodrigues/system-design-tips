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
];

const patterns = [
  {
    name: "Short Polling",
    tag: "Simple",
    tagColor: "var(--sd-accent)",
    tagBg: "rgba(108,99,255,0.15)",
    body: "The client asks \"anything new?\" on a fixed interval, whether or not anything changed. Trivial to implement, but wastes requests when nothing's happened and caps freshness at the interval length.",
  },
  {
    name: "Long Polling",
    tag: "Efficient",
    tagColor: "var(--sd-teal)",
    tagBg: "rgba(62,207,207,0.12)",
    body: "The server holds the connection open until new data exists or a timeout elapses, then the client immediately reopens it. Cuts out empty round-trips, but each waiting client ties up a server connection.",
  },
  {
    name: "Webhooks",
    tag: "Push-based",
    tagColor: "var(--sd-amber)",
    tagBg: "rgba(251,191,36,0.1)",
    body: "The server calls a URL you registered the instant an event happens. No client-side loop at all — but the receiver must run public, always-on HTTP infrastructure, and any single delivery can be missed.",
  },
  {
    name: "WebSockets / SSE",
    tag: "Real-time",
    tagColor: "var(--sd-green)",
    tagBg: "rgba(52,211,153,0.12)",
    body: "A persistent connection stays open and the server pushes messages the moment they occur. WebSockets are bidirectional; SSE is one-way over plain HTTP. Best latency, but connection state must survive scaling and restarts.",
  },
];

const comparisonRows = [
  { strategy: "Short Polling", use: "Low-frequency updates, simple dashboards", downside: "Wastes requests, freshness bounded by interval" },
  { strategy: "Long Polling", use: "Client can't accept inbound connections, needs near-real-time", downside: "Ties up a server connection per waiting client" },
  { strategy: "Webhooks", use: "Server-to-server integrations (payments, CI/CD, SaaS events)", downside: "Receiver must be publicly reachable; delivery can be missed" },
  { strategy: "WebSockets", use: "Bidirectional real-time apps (chat, multiplayer, live cursors)", downside: "Connection state must survive scaling and load balancer restarts" },
  { strategy: "SSE", use: "One-way live feeds (notifications, live scores)", downside: "No client-to-server messages on the same channel; some proxies buffer streams" },
];

export default function Lesson06() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Foundations of Distributed Architectures"
        lesson="Webhooks vs. Polling: Choosing a Communication Pattern"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 6 · Foundations
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          Webhooks vs. Polling: Choosing a Communication Pattern
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          How a system finds out about changes it didn't initiate.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            HTTP is fundamentally a{" "}
            <strong style={{ color: "#fff" }}>client-initiated protocol</strong> — a server can't just decide to send a client something. So whenever one system needs to know about a change happening in another, there are really only two shapes the answer can take:{" "}
            <span style={{ color: "var(--sd-teal)" }}>the client keeps asking</span>, or{" "}
            <span style={{ color: "var(--sd-teal)" }}>the server is given a way to reach out first</span>.
          </p>
          <p>
            Every "how do I get real-time updates" design question — order status, chat messages, CI build results, payment confirmations — reduces to picking a point on that spectrum, and accepting the trade-off that comes with it.
          </p>
        </div>

        {/* The Pattern */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            The Big Picture
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Pull vs. Push</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>In a <strong style={{ color: "#fff" }}>pull</strong> model, the client owns the schedule — it asks repeatedly and accepts that most answers will be "nothing changed." In a <strong style={{ color: "#fff" }}>push</strong> model, the server owns the timing — it calls the moment something happens, and the client's job is just to be reachable.</p>
            <p style={{ marginTop: 10 }}>
              Neither is strictly better. Pull is simple and works behind any firewall; push is efficient but demands infrastructure on the receiving end.{" "}
              <strong style={{ color: "#fff" }}>The right choice depends on who can be reached, and how fresh the data needs to be.</strong>
            </p>
          </div>

          {/* Pull vs push diagram */}
          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "28px 24px 24px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
              Two shapes for the same problem
            </p>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sd-accent)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Pull (Polling)</div>
                <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-accent)" }}>Client</div>
                <div style={{ fontSize: 16, color: "var(--sd-muted)" }}>⇄</div>
                <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)" }}>Server</div>
                <div style={{ fontSize: 10, color: "var(--sd-muted)", marginTop: 4, textAlign: "center", maxWidth: 160 }}>Client asks repeatedly, on its own clock</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sd-amber)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Push (Webhook)</div>
                <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)" }}>Server</div>
                <div style={{ fontSize: 16, color: "var(--sd-muted)" }}>→</div>
                <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid var(--sd-amber)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-amber)" }}>Client's endpoint</div>
                <div style={{ fontSize: 10, color: "var(--sd-muted)", marginTop: 4, textAlign: "center", maxWidth: 160 }}>Server calls in, the instant something happens</div>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            A webhook is really just <strong style={{ color: "#fff" }}>polling with the roles reversed</strong> — the "client" for that one HTTP call is the server that owns the event, and your endpoint is playing server.
          </div>
        </div>

        {/* Patterns */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            The Spectrum
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, marginRight: 10, verticalAlign: "middle", background: "rgba(108,99,255,0.15)", color: "var(--sd-accent)" }}>
              Patterns
            </span>
            Four Ways to Learn About a Change
          </h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>Each pattern trades implementation simplicity for freshness and efficiency. The right one depends on whether the receiver can accept inbound connections, how stale the data is allowed to get, and how much infrastructure you're willing to run.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {patterns.map((p) => (
              <div key={p.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  {p.name}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: p.tagBg, color: p.tagColor }}>
                    {p.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(108,99,255,0.07)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Notice the progression: each step trades a simpler client for a more demanding one — until, with WebSockets, the client has to maintain a live connection just like the server does.
          </div>
        </div>

        {/* Reliability */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Fault Tolerance
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Webhook Delivery Isn't Guaranteed</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              A webhook call is a single, best-effort HTTP request from someone else's server to yours. If your endpoint is down, slow, or returns a non-2xx status, that event can be{" "}
              <strong style={{ color: "#fff" }}>retried, delayed, or — eventually — dropped</strong>, depending on the sender's retry policy.
            </p>
            <p style={{ marginTop: 10 }}>
              Because retries happen, the same event can also arrive{" "}
              <strong style={{ color: "#fff" }}>more than once</strong>. Any receiver that isn't built to handle both of those failure modes will eventually miss an event or double-process one.
            </p>
          </div>

          <div style={{ background: "rgba(251,191,36,0.07)", borderLeft: "3px solid var(--sd-amber)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong style={{ color: "#fff" }}>Treat webhooks as at-most-once, best-effort delivery.</strong> Anything that must not be lost — a payment, an order state change — needs a reconciliation path that doesn't depend on the webhook having fired.
          </div>

          <div style={{ background: "rgba(52,211,153,0.07)", borderLeft: "3px solid var(--sd-green)", borderRadius: 10, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            That reconciliation path is usually just <span style={{ color: "var(--sd-teal)" }}>polling</span> — a periodic call to the provider's API that lists recent events and repairs anything the webhook silently missed. Push for speed, pull for correctness.
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Reference
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Comparison of Communication Patterns</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Strategy", "Best Use Case", "Downside"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.strategy}>
                    <td style={{ padding: "11px 14px", borderBottom: i < comparisonRows.length - 1 ? "1px solid var(--sd-border)" : "none", fontWeight: 600, color: "var(--sd-text)" }}>{row.strategy}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < comparisonRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-text)" }}>{row.use}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < comparisonRows.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)" }}>{row.downside}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>
            Quiz Review
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          Webhooks and polling both move the same information — they just disagree about who's responsible for noticing it changed, and when.
        </p>

        <PanelSection title="What happens when a webhook delivery fails, and how do good integrations handle it?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            A failed delivery is invisible to the receiver by default — nothing arrived, so nothing looks wrong.{" "}
            <strong style={{ color: "var(--sd-text)" }}>The sender's retry policy and the receiver's own safety nets are what stand between that and a silently lost event.</strong>
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Webhooks are at-most-once, best-effort push in practice.</strong> Every serious integration treats them as a fast path, not a guarantee, and pairs them with a slower poll-based source of truth.
          </div>
        </PanelSection>

        <PanelSection title="How do you verify a webhook actually came from who it claims to?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            A webhook endpoint is a public URL that accepts POST requests — anyone who finds it can send it fake events.{" "}
            <strong style={{ color: "var(--sd-text)" }}>The signature, not the URL, is the actual trust boundary.</strong>
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            An unverified webhook handler is an <strong style={{ color: "var(--sd-teal)" }}>unauthenticated write API</strong> wearing a different name. Sign, verify, and reject before you trust a single field in the payload.
          </div>
        </PanelSection>

        <PanelSection title="When does long polling actually beat both short polling and full webhooks?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Long polling occupies a specific niche: <strong style={{ color: "var(--sd-text)" }}>the client can't accept inbound connections, but a slow poll timer isn't good enough either.</strong>
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Long polling is the <strong style={{ color: "var(--sd-teal)" }}>"good enough" middle ground</strong> when you can't push but can't afford a slow poll timer either.
          </div>
        </PanelSection>

        <PanelSection title="Why do production systems that use webhooks almost always also poll?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Webhooks give you speed; polling gives you a correctness backstop.</strong> Production-grade integrations use both, not one instead of the other.
          </div>
        </PanelSection>

        <PanelSection title="WebSockets vs. SSE vs. webhooks — how do you actually choose?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            All three are "push," but they differ in <strong style={{ color: "var(--sd-text)" }}>direction and who the receiver is</strong> — and that alone usually decides it.
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
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--sd-accent)", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            Pick based on <strong style={{ color: "var(--sd-teal)" }}>who needs to talk to whom, and in which direction</strong> — not on which one sounds most "real-time."
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        lessonNumber={6}
        totalLessons={8}
        prevHref="/lessons/05-requirements-and-estimation"
        nextHref="/lessons/01-relational-vs-nosql"
        sectionTitle="Foundations of Distributed Architectures"
      />
    </>
  );
}
