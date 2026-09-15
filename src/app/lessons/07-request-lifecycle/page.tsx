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
  Term,
} from "@/components";
import type { QuizCard } from "@/components";
import { modules } from "@/lib/lessons";

const tcpDefinition =
  "Transmission Control Protocol. The reliable, ordered connection two machines establish before exchanging any data — a three-way handshake (SYN, SYN-ACK, ACK) that happens before a single byte of the actual request is sent.";
const tlsDefinition =
  "Transport Layer Security. The encryption wrapped around that TCP connection so the request and response can’t be read or tampered with in transit — negotiated via its own handshake, on top of TCP’s.";

const quizCards: QuizCard[] = [
  {
    question: "What does the client do during Client Initiation?",
    answers: ["It constructs an HTTP request, including a method, headers, and a payload."],
  },
  {
    question: "What happens during DNS Resolution?",
    answers: ["It resolves the domain name into an IP address."],
  },
  {
    question: "What is the role of the load balancer?",
    answers: ["It determines which specific server instance should handle the work."],
  },
  {
    question: "What does application logic execution involve?",
    answers: ["Validating input, checking authentication, and performing calculations."],
  },
  {
    question: "What happens during the Data Persistence phase?",
    answers: ["If required, the app queries a database, waits for the result, and processes the record."],
  },
  {
    question: "How does the load balancer factor into the anatomy of a request path?",
    answers: ["It may route requests to specific service pools based on the path."],
  },
  {
    question: "What is head-of-line blocking?",
    answers: ["A single slow database query can occupy all available worker threads, causing subsequent requests to queue up."],
  },
  {
    question: "What contributes to network latency?",
    answers: ["Physical distance between the client and server, plus every hop — DNS lookup, TCP handshake, and TLS negotiation."],
  },
  {
    question: "Why do synchronous hops matter for system design?",
    answers: ["A system is at the mercy of the cumulative latency of all synchronous database queries required to complete a request."],
  },
];

const lifecycleSteps = [
  { name: "Client Initiation", body: "The client constructs an HTTP request, including a method (GET, POST, etc.), headers, and a payload." },
  { name: "DNS Resolution", body: "Before the client can send data, it must resolve the domain name (e.g., api.example.com) into an IP address using the Domain Name System." },
  { name: "Transmission", body: <>The client opens a <Term label="TCP">{tcpDefinition}</Term> connection (often upgraded to <Term label="TLS">{tlsDefinition}</Term> for encryption) and sends the request to the destination IP.</> },
  { name: "Gateway / Load Balancing", body: "The request hits an entry point — often a load balancer — that determines which specific server instance should handle the work." },
  { name: "Application Logic", body: "The server executes business logic: validating input, checking authentication, and performing calculations." },
  { name: "Data Persistence", body: "If the application requires stored data, it queries a database, waits for the result, and processes the record." },
  { name: "Response Generation", body: "The application constructs a response (typically JSON or HTML) and sends it back through the stack to the client." },
];

const anatomySteps = [
  { name: "The Request", body: <>A <code style={{ fontFamily: "var(--sd-font-mono)", color: "var(--sd-teal)" }}>GET /search?q=mechanical+keyboard</code> request arrives.</> },
  { name: "The Routing", body: "The load balancer inspects the request. If the /search path is under heavy load, it might route this request to a pool of \"Search Services\" optimized for read-heavy operations, rather than the \"User Account\" service." },
  { name: "The Processing", body: "The application server receives the request. It doesn't just pass the query directly to the database — it validates that the search string isn't malicious, checks if the user is authenticated, and verifies if the result is already available in memory." },
  { name: "The Data Fetch", body: "If the database is hit, the request creates a \"connection session.\" The database interprets the SQL/NoSQL command, optimizes the execution plan, and returns the rows." },
];

const requestPath = [
  { label: "Client", value: "HTTP Request" },
  { label: "Load Balancer", value: "Forward Request" },
  { label: "App Server", value: "Query Data" },
  { label: "Database", value: "" },
];

const responsePath = [
  { label: "Database", value: "" },
  { label: "App Server", value: "Return Result" },
  { label: "Load Balancer", value: "HTTP Response" },
  { label: "Client", value: "Render Result" },
];

export default function Lesson07() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Breadcrumb
        section="Course"
        lesson="The Lifecycle of a Software Request"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Prologue
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          The Lifecycle of a Software Request
        </h1>
        <p style={{ color: "var(--sd-muted)", fontSize: 14, marginBottom: 40 }}>
          Tracing an HTTP request from client click to rendered response — and every hand-off in between.
        </p>

        {/* Intro */}
        <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", gap: 12, fontSize: 15, lineHeight: 1.8 }}>
          <p>
            A software request begins the moment a user interacts with an interface and ends when that user{" "}
            <strong style={{ color: "var(--sd-text)" }}>perceives the result</strong>. At its core, this journey is a series of hand-offs between specialized components, each responsible for transforming, routing, or retrieving information.
          </p>
          <p>
            When a user clicks &quot;Search&quot; or &quot;Login,&quot; they are triggering an{" "}
            <span style={{ color: "var(--sd-teal)" }}>HTTP request</span>. This signal moves from the client — a browser or mobile app — through several layers before a response is returned.
          </p>
        </div>

        {/* The Request Lifecycle */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            End to End
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>The Request Lifecycle</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lifecycleSteps.map((step, i) => (
              <div key={step.name} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 3 }}>{step.name}</div>
                  <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagram */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Request / Response
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Two Trips Through the Same Stack</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "24px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              Forward — request path
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0, marginBottom: 28 }}>
              {requestPath.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ background: "var(--sd-surface2)", border: `1px solid ${i === requestPath.length - 1 ? "var(--sd-accent)" : "var(--sd-border)"}`, borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 104 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === requestPath.length - 1 ? "var(--sd-accent)" : "var(--sd-text)" }}>{step.label}</div>
                  </div>
                  {i < requestPath.length - 1 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" }}>
                      <span style={{ fontSize: 10, color: "var(--sd-muted)", whiteSpace: "nowrap", marginBottom: 2 }}>{requestPath[i].value}</span>
                      <span style={{ fontSize: 16, color: "var(--sd-muted)" }}>→</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "var(--sd-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              Return — response path
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
              {responsePath.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ background: "var(--sd-surface2)", border: `1px solid ${i === responsePath.length - 1 ? "var(--sd-teal)" : "var(--sd-border)"}`, borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 104 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === responsePath.length - 1 ? "var(--sd-teal)" : "var(--sd-text)" }}>{step.label}</div>
                  </div>
                  {i < responsePath.length - 1 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" }}>
                      <span style={{ fontSize: 10, color: "var(--sd-muted)", whiteSpace: "nowrap", marginBottom: 2 }}>{responsePath[i + 1].value}</span>
                      <span style={{ fontSize: 16, color: "var(--sd-muted)" }}>→</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(76, 110, 245,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            Every hop on the way out has a matching hop on the way back. The load balancer that forwarded the request is the same one that relays the response — the client never talks to the app server or database directly.
          </div>
        </div>

        {/* Anatomy of a Request Path */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Worked Example
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>The Anatomy of a Request Path</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              Consider a user searching for a product on an e-commerce site. The lifecycle isn&rsquo;t just a straight line — it is a series of transformations.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {anatomySteps.map((step) => (
              <div key={step.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-teal)", marginBottom: 5 }}>{step.name}</div>
                <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations and Bottlenecks */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Trade-offs
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Limitations and Bottlenecks</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, padding: "22px 24px", marginBottom: 16, fontSize: 14, lineHeight: 1.75 }}>
            <p>
              A request is only as fast as its slowest component — often called the <strong style={{ color: "var(--sd-text)" }}>critical path</strong>. If the database is locked during a write operation, the application server hangs, which causes the load balancer to keep the connection open, which eventually leaves the user staring at a loading spinner.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              {
                label: "Head-of-Line Blocking",
                color: "var(--sd-amber)",
                headerBg: "rgba(157, 176, 247,0.12)",
                body: "If the application server has a limited number of worker threads, a single slow database query can occupy all available resources, causing subsequent requests to queue up behind it.",
              },
              {
                label: "Network Latency",
                color: "var(--sd-amber)",
                headerBg: "rgba(157, 176, 247,0.12)",
                body: <>The physical distance between the client and the server adds time. Every hop — DNS lookup, <Term label="TCP">{tcpDefinition}</Term> handshake, <Term label="TLS">{tlsDefinition}</Term> negotiation — compounds the total time until the first byte of data is received.</>,
              },
            ].map((l) => (
              <div key={l.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: l.headerBg, color: l.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {l.label}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.65 }}>{l.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(106, 118, 163,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            A well-designed system minimizes the number of <strong style={{ color: "var(--sd-text)" }}>synchronous</strong> hops in a request. If a request requires three different database queries to complete, the system is at the mercy of the cumulative latency of all three.
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 6 }}>
            Summary
          </p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>The Map Before the Scale</h2>

          <div style={{ background: "rgba(157, 176, 247,0.07)", borderRadius: 0, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
            The lifecycle of a request is the fundamental flow that every system designer must map out to identify potential points of failure. Understanding this flow is the prerequisite for designing systems that handle scale, which we will address next by analyzing{" "}
            <strong style={{ color: "var(--sd-text)" }}>how we measure system performance</strong> and{" "}
            <strong style={{ color: "var(--sd-text)" }}>distribute load</strong>.
          </div>
        </div>

        {/* Quiz */}
        <div style={{ marginTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 6 }}>
            Quiz Review
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      {/* Side Panel */}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.7, padding: "4px 2px 8px" }}>
          Mapping the lifecycle tells you where a request can break. These are the mechanisms behind three of its most consequential hops.
        </p>

        <PanelSection title="Why does TLS add extra round trips, and how is that cost reduced in practice?" defaultOpen>
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            A request first opens a{" "}
            <Term label="TCP">{tcpDefinition}</Term>{" "}
            connection, then layers{" "}
            <Term label="TLS">{tlsDefinition}</Term>{" "}
            on top of it. Encryption isn&rsquo;t free — negotiating it costs{" "}
            <strong style={{ color: "var(--sd-text)" }}>round trips before any application data moves</strong>, and shaving those off is a recurring theme in web performance work.
          </p>
          {[
            {
              title: "TLS 1.2: Two Round Trips",
              body: "A full handshake exchanges cipher preferences and certificates before either side can send encrypted application data — two full network round trips added on top of the TCP handshake itself.",
            },
            {
              title: "TLS 1.3: One Round Trip (or Zero)",
              body: "TLS 1.3 collapses the handshake to a single round trip, and session resumption via tickets lets a returning client skip it entirely with 0-RTT data.",
            },
            {
              title: "Connection Reuse Amortizes the Cost",
              body: "HTTP/2 and HTTP/3 multiplex many requests over one already-negotiated connection, so the handshake cost is paid once per session instead of once per request.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>The handshake is a fixed tax paid once per connection.</strong> Keeping connections alive is what keeps you from paying it on every request.
          </div>
        </PanelSection>

        <PanelSection title="How does the application server's threading model change how head-of-line blocking shows up?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            &quot;Limited worker threads&quot; means something <strong style={{ color: "var(--sd-text)" }}>different depending on the concurrency model</strong> the server was built on.
          </p>
          {[
            {
              title: "Thread-per-Request",
              body: "A fixed pool size directly caps how many concurrent slow requests the server can absorb — exhausting the pool queues everything behind it, blocked or not.",
            },
            {
              title: "Event Loop / Async",
              body: "A single thread juggles many in-flight I/O waits cheaply, but one CPU-bound or accidentally-blocking call on that thread stalls every request scheduled on it.",
            },
            {
              title: "Thread Pool + Async I/O",
              body: "Decouples \"waiting on the database\" from \"occupying a thread,\" raising the ceiling before blocking appears — but the database itself can still be the bottleneck underneath.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>The model changes the ceiling, not the physics.</strong> A slow enough database defeats any threading strategy eventually.
          </div>
        </PanelSection>

        <PanelSection title="What replaces a synchronous database round trip when it's too slow to do inline?">
          <p style={{ fontSize: 13, color: "var(--sd-muted)", lineHeight: 1.7 }}>
            Minimizing synchronous hops doesn&rsquo;t mean the work disappears — it means{" "}
            <strong style={{ color: "var(--sd-text)" }}>moving it off the request's critical path</strong>.
          </p>
          {[
            {
              title: "A Cache in Front of the Database",
              body: "An in-memory store absorbs read-heavy, repeated queries so most requests never reach persistence at all — the fastest hop is the one you skip.",
            },
            {
              title: "Asynchronous Processing",
              body: "The app server can acknowledge the request immediately and hand slow work to a queue or background worker, returning the result later via polling or a webhook.",
            },
            {
              title: "Read Replicas and Connection Pooling",
              body: "Spreading reads across replicas and reusing pooled connections reduces contention, so individual queries stop queuing behind each other on the same connection.",
            },
          ].map((item) => (
            <div key={item.title} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sd-text)", marginBottom: 5 }}>{item.title}</div>
              <p style={{ fontSize: 12, color: "var(--sd-muted)", lineHeight: 1.65 }}>{item.body}</p>
            </div>
          ))}
          <div style={{ background: "rgba(76, 110, 245,0.08)", borderRadius: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.65, color: "var(--sd-text)" }}>
            <strong style={{ color: "var(--sd-teal)" }}>Caching, queues, and replicas are the same idea three ways:</strong> keep the slow thing off the path the user is waiting on.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav
        lessonNumber={0}
        totalLessons={0}
        nextHref={`/lessons/${modules[0].lessons[0].slug}`}
        sectionTitle="Foundations of Distributed Architecture"
        label="Prologue"
      />
    </>
  );
}
