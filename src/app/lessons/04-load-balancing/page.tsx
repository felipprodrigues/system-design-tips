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
    question: "What is the primary purpose of a load balancer in a distributed system?",
    answers: [
      "To distribute incoming traffic across multiple backend servers, preventing any single server from being overwhelmed, eliminating single points of failure, and enabling seamless horizontal scaling.",
    ],
  },
  {
    question:
      "Which load balancing algorithm is most appropriate for WebSocket connections where sessions remain open for extended periods?",
    answers: [
      "Least Connections — it routes new connections to the server with the fewest active connections, accounting for the fact that long-lived connections occupy a server for much longer than short HTTP requests.",
    ],
    note: "Round Robin would be inappropriate here because it ignores the current load on each server, potentially overloading servers that hold many open connections.",
  },
  {
    question: "What is the purpose of IP Hash, and when does it become a liability?",
    answers: [
      "IP Hash ensures session stickiness — a client consistently lands on the same server, useful when servers cache user-specific data in memory. It becomes a liability when a small number of IPs generate disproportionate traffic, causing uneven load distribution.",
    ],
  },
  {
    question:
      "What is the fundamental difference between Layer 4 and Layer 7 load balancing?",
    answers: [
      "Layer 4 routes based on network-level data (IP addresses and ports) without inspecting packet contents. Layer 7 inspects the actual request content — HTTP headers, cookies, URL paths — enabling content-based routing to different backend pools.",
    ],
  },
  {
    question: "Why does Layer 7 load balancing introduce higher latency than Layer 4?",
    answers: [
      "Because the balancer must fully parse and inspect the HTTP request — including headers, cookies, and URL — before it can make a routing decision. This processing overhead is absent in Layer 4, which makes decisions purely from network packet headers.",
    ],
  },
  {
    question: "What happens when a backend server fails a health check?",
    answers: [
      "The load balancer marks the server as unhealthy and stops routing traffic to it. Once the server passes health checks again, it is automatically reinstated into rotation — hiding the failure from end-users in real-time.",
    ],
  },
  {
    question:
      "You have a fleet with two servers — one with 16GB RAM and one with 64GB RAM. Which algorithm should you use?",
    answers: [
      "Weighted load balancing — assign the higher-capacity server a proportionally higher weight so it receives more traffic, matching distribution to actual capacity rather than treating all servers equally.",
    ],
  },
  {
    question: "Why does Round Robin fail when request processing times vary significantly?",
    answers: [
      "Round Robin distributes requests sequentially without regard to how long each server is spending on its current work. A server processing a slow database query will accumulate more in-flight work than others, becoming overloaded while Round Robin continues sending it new requests at the same rate.",
    ],
  },
];

const algorithms = [
  {
    name: "Round Robin",
    tag: "Simple",
    tagColor: "var(--sd-accent)",
    tagBg: "rgba(76, 110, 245,0.15)",
    body: "Requests are distributed sequentially across available servers. Works well when all servers have identical hardware and request processing times are uniform. Breaks down when requests have variable processing costs.",
  },
  {
    name: "Least Connections",
    tag: "Adaptive",
    tagColor: "var(--sd-teal)",
    tagBg: "rgba(127, 147, 242,0.12)",
    body: "The balancer tracks active connections and sends new requests to the server with the fewest. Superior for long-lived connections (WebSockets, streaming) or scenarios where request processing times vary significantly.",
  },
  {
    name: "IP Hash",
    tag: "Sticky",
    tagColor: "var(--sd-amber)",
    tagBg: "rgba(106, 118, 163,0.1)",
    body: "The client's IP address is hashed to deterministically map it to a specific server. Ensures session stickiness — useful if the server caches user-specific data in memory. Can cause uneven load if a small number of IPs drive disproportionate traffic.",
  },
  {
    name: "Weighted",
    tag: "Capacity-aware",
    tagColor: "var(--sd-green)",
    tagBg: "rgba(157, 176, 247,0.12)",
    body: "Each server is assigned a weight proportional to its capacity. A server with twice the RAM and CPU might receive weight 2, getting twice the traffic. Use when your server fleet is heterogeneous.",
  },
];

const comparisonRows = [
  { strategy: "Round Robin", use: "Uniform, stateless requests on identical servers", downside: "Ignores actual server load" },
  { strategy: "Least Connections", use: "Variable request duration, WebSockets", downside: "Slightly higher balancer CPU overhead" },
  { strategy: "IP Hash", use: "Session-dependent applications", downside: "Uneven load from heavy-traffic IPs" },
  { strategy: "Weighted", use: "Heterogeneous server fleets", downside: "Requires manual weight tuning" },
  { strategy: "Layer 4", use: "Maximum throughput, static traffic routing", downside: "No content-based routing" },
  { strategy: "Layer 7", use: "Microservices, content-based routing", downside: "Higher latency due to packet inspection" },
];

export default function Lesson04() {
  const [panelOpen, setPanelOpen] = useState(false);
  const nav = getLessonNav("04-load-balancing");

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="Core Concepts of Load Balancing"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson 4 · Foundations
        </p>
        <h1 className="sd-h1">
          Core Concepts of Load Balancing
        </h1>
        <p className="sd-lede">
          Distribute traffic, eliminate single points of failure, and scale without downtime.
        </p>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            Load balancing is the process of{" "}
            <strong className="sd-strong">distributing incoming network traffic across a group of backend servers</strong>{" "}
            to ensure no single server bears too much demand. By acting as a reverse proxy, the load balancer prevents bottlenecks, eliminates single points of failure, and allows for the seamless addition or removal of resources — directly supporting the horizontal scaling patterns discussed in lesson one.
          </p>
          <p>
            The choice of{" "}
            <span className="sd-hl">where</span>{" "}
            the load balancer sits in the OSI model and{" "}
            <span className="sd-hl">how</span>{" "}
            it decides which server to use next are the two decisions that determine the trade-offs you accept.
          </p>
        </div>

        {/* The Pattern */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Big Picture
          </p>
          <h2 className="sd-h2">The Basic Shape of Every Web App</h2>

          <div className="sd-prose">
            <p>Clients make requests. Servers handle them. Put a load balancer in front and that traffic spreads across many identical servers, so one box going down doesn't take the whole app down with it.</p>
            <p style={{ marginTop: 10 }}>
              Pretty much every design question you'll ever see — from a chat app like WhatsApp to a live streaming platform like Twitch — starts with some version of this pattern. The more detail you layer on top, the more specialized the design gets, but{" "}
              <strong className="sd-strong">the skeleton stays the same</strong>.
            </p>
          </div>

          {/* Skeleton diagram */}
          <div className="sd-figure">
            <p className="sd-figure-caption">
              The skeleton every design starts from
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(76, 110, 245,0.1)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, color: "var(--sd-accent)" }}>
                Client
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ fontSize: 10, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Single address</div>
                <div className="sd-arrow">↓</div>
              </div>
              <div style={{ background: "rgba(76, 110, 245,0.12)", border: "1px solid var(--sd-accent)", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, color: "var(--sd-accent)", textAlign: "center" }}>
                Load Balancer
                <div style={{ fontSize: 10, fontWeight: 400, color: "var(--sd-muted)", marginTop: 2 }}>Routes each request</div>
              </div>
              <div className="sd-arrow">↓</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Server 1", "Server 2", "Server 3"].map((s) => (
                  <div key={s} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)" }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sd-callout sd-callout-accent">
            The client doesn't care how many servers exist. It talks to a single address and trusts the load balancer to route things.{" "}
            <strong className="sd-strong">That abstraction is the entire point.</strong>
          </div>
        </div>

        {/* Algorithms */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Distribution Logic
          </p>
          <h2 className="sd-h2">
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 4, marginRight: 10, verticalAlign: "middle", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)" }}>
              Algorithms
            </span>
            Traffic Distribution Strategies
          </h2>

          <div className="sd-prose">
            <p>The algorithm determines how the load balancer selects the "next" server for each incoming request. The right choice depends on whether your servers are homogeneous, whether connections are short- or long-lived, and whether clients need to consistently land on the same server.</p>
          </div>

          <div className="sd-grid-2">
            {algorithms.map((a) => (
              <div key={a.name} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  {a.name}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: a.tagBg, color: a.tagColor }}>
                    {a.tag}
                  </span>
                </div>
                <p className="sd-text-sm-tight">{a.body}</p>
              </div>
            ))}
          </div>

          {/* Traffic diagram */}
          <div className="sd-figure">
            <p className="sd-figure-caption">
              Load balancer as reverse proxy
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="sd-stack">
                {["Client A", "Client B", "Client C"].map((c) => (
                  <div key={c} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-accent)", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "var(--sd-accent)", whiteSpace: "nowrap" }}>
                    {c}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 12px", gap: 10 }}>
                {["→", "→", "→"].map((a, i) => (
                  <div key={i} style={{ fontSize: 14, color: "var(--sd-muted)" }}>{a}</div>
                ))}
              </div>
              <div style={{ background: "rgba(76, 110, 245,0.12)", border: "1px solid var(--sd-accent)", borderRadius: 10, padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "var(--sd-accent)", textAlign: "center" }}>
                Load Balancer
                <div style={{ fontSize: 10, fontWeight: 400, color: "var(--sd-muted)", marginTop: 3 }}>Algorithm routes each request</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 12px", gap: 10 }}>
                {["→", "→", "→"].map((a, i) => (
                  <div key={i} style={{ fontSize: 14, color: "var(--sd-muted)" }}>{a}</div>
                ))}
              </div>
              <div className="sd-stack">
                {["Server 1", "Server 2", "Server 3"].map((s) => (
                  <div key={s} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-teal)", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "var(--sd-teal)", whiteSpace: "nowrap" }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layer 4 vs 7 */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            OSI Model
          </p>
          <h2 className="sd-h2">Layer 4 vs. Layer 7 Balancing</h2>

          <div className="sd-prose">
            <p>Load balancers operate at different layers of the OSI model, which changes how routing decisions are made. The lower the layer, the less information the balancer has — and the faster it operates. The higher the layer, the more intelligent the routing — at the cost of inspection overhead.</p>
          </div>

          <div className="sd-grid-2">
            {[
              {
                label: "Layer 4 · Transport",
                color: "var(--sd-teal)",
                headerBg: "rgba(127, 147, 242,0.1)",
                body: "Routes traffic based on network-level data: IP addresses and TCP/UDP ports. The balancer does not inspect packet contents. Minimal processing means extremely high throughput and low latency.",
                example: "Route all traffic on port 80 to a cluster of web servers — regardless of URL path or HTTP headers.",
              },
              {
                label: "Layer 7 · Application",
                color: "var(--sd-green)",
                headerBg: "rgba(157, 176, 247,0.1)",
                body: "Inspects the actual content of the request: HTTP headers, cookies, URL paths, or even the request body. Enables content-based routing to different backend pools.",
                example: "Route /images to a media server cluster, while /billing routes to a PCI-compliant payment service.",
              },
            ].map((l) => (
              <div key={l.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: l.headerBg, color: l.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {l.label}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65, marginBottom: 10 }}>{l.body}</p>
                  <div style={{ background: "var(--sd-bg)", border: "1px solid var(--sd-border)", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.5 }}>
                    <strong className="sd-hl">Example:</strong> {l.example}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 0 }}>
            <strong className="sd-strong">Layer 7 introduces higher latency</strong> because the load balancer must fully parse the HTTP request before making a routing decision. The trade-off is worth it for microservices architectures where different services require specialized infrastructure.
          </div>
        </div>

        {/* Health checks */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Fault Tolerance
          </p>
          <h2 className="sd-h2">Health Checking and Failover</h2>

          <div className="sd-prose">
            <p>
              A load balancer is only useful if it knows which servers are actually alive. It performs continuous{" "}
              <strong className="sd-strong">health checks</strong> — periodically sending a probe request (typically an HTTP <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 13, color: "var(--sd-teal)" }}>HEAD</code> or <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 13, color: "var(--sd-teal)" }}>GET</code> to a <code style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 3, padding: "1px 5px", fontSize: 13, color: "var(--sd-teal)" }}>/health</code> endpoint) to every backend server.
            </p>
            <p style={{ marginTop: 10 }}>
              If a server fails to respond or returns a 5xx error, the balancer marks it as{" "}
              <strong className="sd-strong">unhealthy</strong> and stops routing traffic to it. Once it passes health checks again, it's automatically reinstated. This mechanism is the bedrock of system availability.
            </p>
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            <strong className="sd-strong">If your design requires high availability, you must assume servers will fail.</strong> The load balancer's job is to hide that failure from the end-user by redirecting traffic in real-time — before the user notices anything is wrong.
          </div>

          <div className="sd-callout sd-callout-green">
            Health checks also enable <span className="sd-hl">zero-downtime deployments</span>: drain a server, deploy, wait for it to pass health checks, then bring it back into rotation. No traffic is ever sent to a server that isn't ready.
          </div>
        </div>

        {/* Comparison table */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Reference
          </p>
          <h2 className="sd-h2">Comparison of Balancing Strategies</h2>

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
          A load balancer routes requests across servers and uses health checks to skip dead ones. It does not store data or render responses.
        </p>

        <PanelSection title="How is an API Gateway different from a Load Balancer?">
          <p className="sd-text-sm">
            They get grouped together because both sit in the request path before your services do, but they answer different questions.{" "}
            <strong className="sd-strong">A Load Balancer decides where a request goes. An API Gateway decides how it should be handled.</strong>
          </p>
          {[
            {
              title: "What a Load Balancer Handles",
              body: "Distributes incoming traffic across multiple servers or service instances so no single one becomes a bottleneck. Its job is availability, resilience, and making better use of the capacity you already have — not the meaning of the request.",
            },
            {
              title: "What an API Gateway Handles",
              body: "Acts as a single entry point between clients and backend services, managing API-level concerns: request routing by endpoint, authentication and authorization, rate limiting, request validation, protocol translation, service discovery, and circuit breaking. It gives microservices clients a consistent way to talk to many services.",
            },
            {
              title: "Which Layer They Operate At",
              body: "API Gateways typically operate at Layer 7, since routing by endpoint or header requires reading the request. Load Balancers can operate at Layer 4 or Layer 7 depending on the technology — the same split covered earlier in this lesson.",
            },
            {
              title: "How They Compose in Practice",
              body: "You rarely pick one over the other. A common path looks like Client → Load Balancer → API Gateway → Microservices: the Load Balancer spreads traffic and keeps the gateway itself available, then the Gateway routes each request to the right service and enforces API-level policy.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">The simple rule:</strong>
            <br />
            Need to spread traffic across servers? <strong className="sd-hl">Load Balancer.</strong>
            <br />
            Need centralized API management — auth, rate limits, routing by endpoint? <strong className="sd-hl">API Gateway.</strong>
            <br /><br />
            Building microservices at any real scale, you'll likely run both, each solving a different half of the problem.
          </div>
        </PanelSection>

        <PanelSection title="What happens when the load balancer itself is the single point of failure?">
          <p className="sd-text-sm">
            The load balancer solves the SPOF problem for your backend — but it introduces its own SPOF. A single load balancer going down takes down your entire system.{" "}
            <strong className="sd-strong">Making the load balancer itself highly available requires a separate strategy.</strong>
          </p>
          {[
            {
              title: "Active-Passive (Hot Standby)",
              body: "Two load balancers run simultaneously — one active, one standby. The standby receives a heartbeat signal from the active instance. If the heartbeat stops, the standby promotes itself and takes over via IP failover. Failover time is typically seconds.",
            },
            {
              title: "Active-Active (DNS Round Robin)",
              body: "Multiple load balancers all handle traffic simultaneously. DNS resolves the hostname to multiple IPs — each pointing to a different balancer. If one goes down, DNS stops returning its IP. Provides both redundancy and capacity but requires health-check-aware DNS (e.g., Route 53 health checks).",
            },
            {
              title: "Anycast Routing",
              body: "Multiple load balancers in different data centers share the same IP address. The network layer routes each client to the topologically nearest instance. If one data center fails, traffic is automatically routed to the next nearest. Used by Cloudflare, AWS Global Accelerator, and major CDNs.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Redundancy must exist at every layer.</strong> Scaling your backend to 100 servers is meaningless if a single load balancer instance is the entry point for all of them.
          </div>
        </PanelSection>

        <PanelSection title="When does IP Hash backfire, and what's the alternative?">
          <p className="sd-text-sm">
            IP Hash solves session stickiness by mapping a client's IP to a fixed server. But this guarantee has several failure modes that make it{" "}
            <strong className="sd-strong">unreliable for most modern applications</strong>.
          </p>
          {[
            {
              title: "NAT and Shared IPs",
              body: "Corporate offices, mobile networks, and ISPs often route thousands of users through a single public IP via NAT. IP Hash would map all of them to the same backend server, creating a massive imbalance.",
            },
            {
              title: "Server Removal Breaks Mapping",
              body: "If you remove a server from the pool, the hash table remaps. Users pinned to the removed server are reassigned — losing their in-memory session. This is equivalent to logging them all out simultaneously.",
            },
            {
              title: "Better Alternative: Sticky Sessions via Cookie",
              body: "The load balancer sets a session cookie on the first response, encoding which server the client was assigned to. Subsequent requests include this cookie for routing. This is deterministic, survives IP changes (mobile clients), and can be invalidated gracefully.",
            },
            {
              title: "Best Alternative: Stateless Architecture",
              body: "If session state lives in a shared external store (Redis, a database), any server can serve any client. You eliminate the need for sticky sessions entirely — and gain the ability to freely scale, replace, or restart servers without impacting users.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            IP Hash is a <strong className="sd-hl">workaround for a stateful architecture</strong>. If your system requires it, that's a signal to invest in externalizing session state rather than tightening the load balancer constraint.
          </div>
        </PanelSection>

        <PanelSection title="How do Layer 7 balancers enable zero-downtime deployments?">
          <p className="sd-text-sm">
            A Layer 7 load balancer's ability to inspect requests makes it a powerful tool for deployment strategies that eliminate downtime and reduce risk. These techniques are only possible because the balancer can route based on{" "}
            <strong className="sd-strong">request content, not just connection metadata</strong>.
          </p>
          {[
            {
              title: "Rolling Deployments",
              body: "Servers are updated one at a time. Before deploying to a server, it is drained — no new requests are sent to it, and in-flight requests complete. After deployment, the server is health-checked and reinstated. Zero downtime, but two versions are live simultaneously.",
            },
            {
              title: "Blue-Green Deployments",
              body: "Two identical environments run in parallel — blue (current) and green (new). The load balancer routes all traffic to blue. After green is deployed and verified, the balancer switches 100% of traffic to green in a single atomic change. Rollback is instant: flip traffic back to blue.",
            },
            {
              title: "Canary Releases",
              body: "A small percentage of traffic (e.g., 5%) is routed to the new version based on headers, cookies, or random sampling. This exposes the new version to real traffic while limiting blast radius. If error rates are acceptable, the percentage is gradually increased to 100%.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            These patterns are why <strong className="sd-hl">the load balancer is a deployment primitive</strong>, not just a traffic router. Kubernetes Ingress controllers, AWS ALB, and Nginx all expose these capabilities as first-class features.
          </div>
        </PanelSection>
        <PanelSection title="Why do most modern web apps prefer stateless servers?">
          <p className="sd-text-sm">
            With stateless servers, the load balancer can route any request to any server. That makes horizontal scaling, redeploys, and crash recovery clean.
          </p>
          {[
            {
              title: "Horizontal Scaling",
              body: "Adding a new server to the pool is immediate — it can serve any request without needing to acquire state from its neighbors. No warm-up, no data migration. Just register it with the load balancer and it starts taking traffic.",
            },
            {
              title: "Clean Crash Recovery",
              body: "When a stateless server crashes, no user data is lost — the session state lives in an external store. The load balancer's health check removes the crashed server from rotation and in-flight requests are retried on healthy servers with no user impact.",
            },
            {
              title: "Zero-Downtime Redeploys",
              body: "Rolling or blue-green deployments work cleanly because no server owns any session. You can drain, replace, and reinstate any server at any time without worrying about which users are mid-session on which node.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Any server can handle any request.</strong> That single property is what makes the rest of horizontal scaling, fault tolerance, and deployment strategy straightforward.
          </div>
        </PanelSection>

        <PanelSection title="What is the main downside of a stateless server design?">
          <p className="sd-text-sm">
            Stateless servers must reach an external store (DB, cache, JWT) for any per-user context. That extra hop is the cost of horizontal scalability.
          </p>
          {[
            {
              title: "The Extra Round-Trip",
              body: "Every request that requires user context — authentication state, preferences, cart contents — must fetch that data from a shared external store. This adds a network hop that didn't exist when the data lived in server memory.",
            },
            {
              title: "The External Store Becomes Critical",
              body: "You've moved the availability problem, not eliminated it. The session store (Redis, a database) is now a shared dependency for every server. If it goes down or becomes slow, every server is affected simultaneously — making it the new SPOF if not made redundant.",
            },
            {
              title: "Mitigations",
              body: "JWTs: encode session state in a signed token the client holds — no external store needed, at the cost of inability to invalidate sessions instantly. Edge caching: push session data closer to the server to reduce round-trip cost. Read replicas: fan out reads across multiple cache/DB replicas to prevent the store becoming a bottleneck.",
            },
          ].map((item) => (
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">The trade-off is explicit:</strong> you accept a latency cost on every request in exchange for the ability to scale, recover, and deploy without coordination between servers.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} />
    </>
  );
}
