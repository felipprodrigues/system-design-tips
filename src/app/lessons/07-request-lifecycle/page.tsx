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
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";

/* Single source for every term on this page: the inline <T> tooltips and the
   Key terms glossary both read from here, so the two can't drift apart. */
const terms = {
  dns: {
    label: "DNS",
    title: "DNS (Domain Name System)",
    expands: "Domain Name System",
    def: "The distributed lookup system that translates human-readable domain names into the IP addresses machines actually use to route traffic.",
  },
  tcp: {
    label: "TCP",
    title: "TCP three-way handshake",
    expands: "Transmission Control Protocol",
    def: "The SYN, SYN-ACK, ACK exchange that establishes a reliable, ordered connection between client and server before any application data is sent.",
  },
  tls: {
    label: "TLS",
    title: "TLS handshake",
    expands: "Transport Layer Security",
    def: "The negotiation that establishes an encrypted channel over an existing TCP connection, including certificate verification and shared key derivation, which is what turns HTTP into HTTPS.",
  },
  stateless: {
    label: "stateless",
    title: "Statelessness",
    def: "The property of a protocol or server where each request is handled independently, with no memory of prior requests, so any request can be served by any capable server.",
  },
  roundTrip: {
    label: "round trip",
    title: "Round trip",
    def: "One full cycle of a message sent and its reply received, the basic unit of network latency, since several handshake steps each cost a full round trip before useful data moves.",
  },
  keepAlive: {
    label: "keep-alive",
    title: "Connection keep-alive",
    def: "Reusing an already-established (and already-secured) TCP connection for multiple requests instead of tearing it down and renegotiating for each one.",
  },
};

/* Acronyms lead with what their letters stand for, in the tooltip and the
   glossary alike, so both surfaces stay in sync. */
function termBody(t: { expands?: string; def: string }) {
  return t.expands ? <><strong className="sd-strong">{t.expands}.</strong> {t.def}</> : t.def;
}

function T({ k, as }: { k: keyof typeof terms; as?: string }) {
  return <Term label={as ?? terms[k].label}>{termBody(terms[k])}</Term>;
}

const quizCards: QuizCard[] = [
  {
    question: "Why does connection reuse matter so much for a system serving many small API requests?",
    answers: ["Each new TCP connection costs a round trip, and each new TLS connection costs one or two more, before any actual data moves. If a client opens a new connection per request, it pays that fixed handshake cost every time, which can dwarf the cost of the actual request. Reusing connections (via keep-alive or HTTP/2 multiplexing) amortizes that cost across many requests instead."],
  },
  {
    question: "What does it mean for HTTP to be stateless, and why does that matter for scaling?",
    answers: ["Stateless means the server doesn't retain memory of previous requests from a client, every request must carry whatever context it needs (like an auth token). This matters for scaling because it means any request can be routed to any server behind a load balancer, no request has to go back to the specific server that handled a previous one, which is what makes horizontal scaling with a fleet of interchangeable servers possible in the first place."],
  },
  {
    question: "What does the client do during Client Initiation?",
    answers: ["It constructs an HTTP request, including a method, headers, and a payload."],
  },
  {
    question: "What happens during DNS Resolution?",
    answers: ["It resolves the domain name into an IP address."],
  },
  {
    question: "Why doesn't pointing a domain at a new server take effect for everyone instantly?",
    answers: ["DNS answers are cached at several levels, and each record carries a TTL saying how long a cached answer stays valid. Until those TTLs expire, resolvers keep handing out the old IP address."],
  },
  {
    question: "Why is the very first request to a server usually slower than the ones that follow it?",
    answers: ["The first one pays for DNS resolution, the TCP handshake, and the TLS handshake before any application data moves. Once the connection exists, keep-alive and HTTP/2 multiplexing let later requests reuse it and go straight to sending data."],
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

const whyThisExists = [
  <>Typing a URL and seeing a page feels instant and singular, but it&rsquo;s actually a sequence of separate network round trips to separate systems (<T k="dns" /> servers, routers, the destination server), each with its own latency, and treating it as one atomic step hides where a real system actually spends its time.</>,
  <>Without understanding the request lifecycle, it&rsquo;s easy to misplace blame for slowness, e.g. optimizing server code when the real cost is a slow DNS lookup or an unnecessary extra <T k="tls" /> handshake, or to design a system that repeats expensive steps (like re-resolving DNS or re-negotiating TLS) that could have been reused.</>,
  <>System design interviews frequently probe this directly (&lsquo;walk me through what happens when a user hits your API&rsquo;), and a shaky answer here reads as a gap in fundamentals no matter how good the higher-level architecture is.</>,
];

const lifecycleSteps = [
  { name: "Client Initiation", body: "The client constructs an HTTP request, including a method (GET, POST, etc.), headers, and a payload." },
  { name: "DNS Resolution", body: <>Before the client can send data, it must resolve the domain name (e.g., api.example.com) into an IP address using <T k="dns" as="DNS" />.</> },
  { name: "TCP Handshake", body: <>With an IP address in hand, client and server run the <T k="tcp" as="TCP handshake" /> to open a reliable, ordered connection. That is one full <T k="roundTrip" /> spent before any request data moves.</> },
  { name: "TLS Handshake", body: <>For HTTPS, encryption is negotiated on top of that connection: the server proves its identity with a certificate and both sides derive a shared key. The <T k="tls" as="TLS handshake" /> costs further round trips, and only once it finishes does the HTTP request itself go out.</> },
  { name: "Gateway / Load Balancing", body: "The request hits an entry point — often a load balancer — that determines which specific server instance should handle the work." },
  { name: "Application Logic", body: "The server executes business logic: validating input, checking authentication, and performing calculations." },
  { name: "Data Persistence", body: "If the application requires stored data, it queries a database, waits for the result, and processes the record." },
  { name: "Response Generation", body: "The application constructs a response (typically JSON or HTML) and sends it back through the stack to the client." },
];

const anatomySteps = [
  { name: "The Request", body: "A shopper types \"mechanical keyboard\" into the search box and hits enter." },
  { name: "The Routing", body: "The load balancer inspects the request. If search traffic is under heavy load, it might route this one to a pool of \"Search Services\" optimized for read-heavy operations, rather than the \"User Account\" service." },
  { name: "The Processing", body: "The application server receives the request. It doesn't just pass the query directly to the database — it validates that the search string isn't malicious, checks if the user is authenticated, and verifies if the result is already available in memory." },
  { name: "The Data Fetch", body: "If the database is hit, the request creates a \"connection session.\" The database interprets the SQL/NoSQL command, optimizes the execution plan, and returns the rows." },
];

const seenInTheWild = [
  "Cloudflare and Google's public DNS resolvers (1.1.1.1 and 8.8.8.8) exist specifically to make the DNS resolution step of this lifecycle faster and more reliable than relying on a default ISP resolver.",
  "Browsers implement HTTP/2 and HTTP/3 largely to reduce the cost of this lifecycle at scale, multiplexing many logical requests over one physical connection so a page with 80 assets doesn't pay 80 separate handshake costs.",
  "TLS certificate authorities like Let's Encrypt automated what used to be a slow, manual, paid step in this lifecycle (getting a trusted certificate), which is a major reason HTTPS became the web default rather than the exception.",
  "API gateways at companies like Stripe and Twilio terminate the TCP/TLS handshake at the edge, close to the client, specifically to shorten this lifecycle for API calls originating far from their origin servers.",
];

const keyPoints = [
  "A single request is really a chain: DNS, TCP handshake, TLS handshake, then HTTP request/response, each step a real round trip with real latency.",
  "DNS caching and connection reuse (keep-alive, HTTP/2 multiplexing) exist specifically to avoid repeating expensive steps in this chain on every request.",
  "HTTP is stateless by design, which is what makes it possible to route any request to any server, a prerequisite for horizontal scaling.",
  "TLS adds security but also adds round trips, a real latency cost that shows up disproportionately on the first request to a new connection.",
  "Physical distance and round-trip count are the two real drivers of network latency, which is why both CDNs (attack distance) and connection reuse (attack round trips) matter.",
];

const commonMistakes = [
  "Treating 'the request' as a single instantaneous step instead of a chain of separate network operations, which hides where latency actually comes from.",
  "Assuming HTTPS only adds encryption, when it also adds real latency from the TLS handshake, especially on the first connection before session resumption kicks in.",
  "Designing a client that opens a brand-new connection per request instead of reusing connections, paying the full DNS+TCP+TLS cost repeatedly for no reason.",
  "Forgetting that DNS has its own caching and TTL behavior, which means DNS changes (like pointing a domain at a new server) don't take effect everywhere instantly.",
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

/* Boxes for the opening figure. `kind` is the small mono label above the name. */
const chainNodes = [
  { kind: "Client", name: "Client (browser)", x: 16, y: 168, w: 180, accent: false },
  { kind: "Server", name: "DNS Resolver", x: 300, y: 28, w: 196, accent: true },
  { kind: "Server", name: "Web Server", x: 560, y: 168, w: 180, accent: true },
  { kind: "DB", name: "Database", x: 800, y: 168, w: 150, accent: true },
];

export default function Lesson07() {
  const [panelOpen, setPanelOpen] = useState(false);
  const nav = getLessonNav("07-request-lifecycle");

  return (
    <>
      <Breadcrumb
        section={nav.sectionTitle}
        lesson="The Lifecycle of a Software Request"
        action={<DeepDiveButton onClick={() => setPanelOpen(true)} />}
      />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Prologue
        </p>
        <h1 className="sd-h1">
          The Lifecycle of a Software Request
        </h1>
        <p className="sd-lede">
          Tracing an HTTP request from client click to rendered response — and every hand-off in between.
        </p>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Why This Exists
          </p>
          <h2 className="sd-h2">Why This Lesson Comes First</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Intro */}
        <div className="sd-intro">
          <p>
            A software request begins the moment a user interacts with an interface and ends when that user{" "}
            <strong className="sd-strong">perceives the result</strong>. At its core, this journey is a series of hand-offs between specialized components, each responsible for transforming, routing, or retrieving information.
          </p>
          <p>
            When a user clicks &quot;Search&quot; or &quot;Login,&quot; they are triggering an{" "}
            <span className="sd-hl">HTTP request</span>. This signal moves from the client — a browser or mobile app — through several layers before a response is returned.
          </p>
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Think Of It Like
          </p>
          <h2 className="sd-h2">An Office Building With No Directory</h2>

          <div className="sd-prose">
            <p>
              Getting a web page loaded is like ordering food through a chain of intermediaries in an old-fashioned office building with no directory. First you ask the front desk which floor the company you want is on (<T k="dns" />). Then you walk to that floor and knock, and someone has to confirm you&rsquo;re allowed in and agree on a shared language before you can talk business (the <T k="tcp" /> and <T k="tls" /> handshakes). Only after all of that do you actually hand over your order and get a response (the <strong className="sd-strong">HTTP request and response</strong>).
            </p>
            <p style={{ marginTop: 12 }}>
              Every one of those steps takes real time, and if you have to repeat the whole walk for every single question, you&rsquo;re wasting most of your visit on logistics instead of getting an answer.
            </p>
          </div>
        </div>

        {/* Opening figure — the separate systems involved */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            The Map
          </p>
          <h2 className="sd-h2">The Chain of Systems Behind One Request</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg
              viewBox="0 0 966 268"
              role="img"
              aria-label="A client resolves a domain against a DNS resolver, then opens a TCP and TLS connection to a web server, which queries a database."
              style={{ width: "100%", minWidth: 560, display: "block" }}
            >
              <title>The chain of systems behind one request</title>
              <defs>
                <marker id="sd-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
                </marker>
              </defs>

              {/* Client up to the DNS resolver, then on to the web server */}
              <path d="M 196 210 H 250 V 70 H 290" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-arrowhead)" />
              <path d="M 196 210 H 550" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-arrowhead)" />
              <path d="M 740 210 H 790" fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-arrowhead)" />

              <circle cx="400" cy="210" r="4" fill="var(--sd-teal)" />
              <circle cx="765" cy="210" r="4" fill="var(--sd-teal)" />

              <text x="258" y="140" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)">resolve domain</text>
              <text x="372" y="196" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)" textAnchor="middle">TCP + TLS, then HTTP</text>
              <text x="765" y="196" fontFamily="var(--sd-font-mono)" fontSize="12" fill="var(--sd-muted)" textAnchor="middle">query</text>

              {chainNodes.map((n) => (
                <g key={n.name}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={84}
                    rx={10}
                    fill="var(--sd-surface2)"
                    stroke={n.accent ? "var(--sd-teal)" : "var(--sd-border-strong)"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + 33}
                    textAnchor="middle"
                    fontFamily="var(--sd-font-mono)"
                    fontSize="11"
                    letterSpacing="1"
                    fill={n.accent ? "var(--sd-teal)" : "var(--sd-muted)"}
                  >
                    {n.kind.toUpperCase()}
                  </text>
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + 56}
                    textAnchor="middle"
                    fontFamily="var(--sd-font-mono)"
                    fontSize="15"
                    fontWeight="700"
                    fill="var(--sd-text)"
                  >
                    {n.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            The DNS lookup is a <strong className="sd-strong">side trip, not a link in the chain</strong>. The client asks a completely different server for an address, gets it back, and only then starts talking to the one it actually wanted. That detour is pure latency, which is why its answer gets cached so aggressively.
          </div>
        </div>

        {/* The Request Lifecycle */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            End to End
          </p>
          <h2 className="sd-h2">The Request Lifecycle</h2>

          <div className="sd-stack">
            {lifecycleSteps.map((step, i) => (
              <div key={step.name} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 3 }}>{step.name}</div>
                  <p className="sd-text-sm-tight">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-green" style={{ marginTop: 16 }}>
            Notice what none of these steps require: <strong className="sd-strong">memory of the last request</strong>. HTTP is <T k="stateless" /> by design, so every request carries everything needed to handle it. That is what lets the gateway send one request to server A and the next to server B without anything breaking, and it is the property every horizontal scaling strategy rests on.
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Key Terms
          </p>
          <h2 className="sd-h2">The Vocabulary of a Round Trip</h2>

          <div className="sd-stack">
            {Object.values(terms).map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{termBody(t)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagram */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Request / Response
          </p>
          <h2 className="sd-h2">Two Trips Through the Same Stack</h2>

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
                      <span className="sd-arrow-sm">→</span>
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
                      <span className="sd-arrow-sm">→</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sd-callout sd-callout-accent">
            Every hop on the way out has a matching hop on the way back. The load balancer that forwarded the request is the same one that relays the response — the client never talks to the app server or database directly.
          </div>
        </div>

        {/* Anatomy of a Request Path */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Worked Example
          </p>
          <h2 className="sd-h2">The Anatomy of a Request Path</h2>

          <div className="sd-prose">
            <p>
              Consider a user searching for a product on an e-commerce site. The lifecycle isn&rsquo;t just a straight line — it is a series of transformations.
            </p>
          </div>

          <div className="sd-stack">
            {anatomySteps.map((step) => (
              <div key={step.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-teal)", marginBottom: 5 }}>{step.name}</div>
                <p className="sd-text-sm-tight">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations and Bottlenecks */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Trade-offs
          </p>
          <h2 className="sd-h2">Limitations and Bottlenecks</h2>

          <div className="sd-prose">
            <p>
              A request is only as fast as its slowest component — often called the <strong className="sd-strong">critical path</strong>. If the database is locked during a write operation, the application server hangs, which causes the load balancer to keep the connection open, which eventually leaves the user staring at a loading spinner.
            </p>
          </div>

          <div className="sd-grid-2">
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
                body: <>The physical distance between the client and the server adds time. Every hop — DNS lookup, <T k="tcp" /> handshake, <T k="tls" /> negotiation — compounds the total time until the first byte of data is received.</>,
              },
            ].map((l) => (
              <div key={l.label} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: l.headerBg, color: l.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {l.label}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p className="sd-text-sm-tight">{l.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="sd-callout">
            A well-designed system minimizes the number of <strong className="sd-strong">synchronous</strong> hops in a request. If a request requires three different database queries to complete, the system is at the mercy of the cumulative latency of all three.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Seen In The Wild
          </p>
          <h2 className="sd-h2">Products Built To Shorten This Chain</h2>
          <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
        </div>

        {/* Key points */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Key Points
          </p>
          <h2 className="sd-h2">What To Carry Forward</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints} />
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Common Mistakes
          </p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;I used to think &lsquo;loading&rsquo; just meant the page was being lazy. Turns out it&rsquo;s four different systems passing notes before anyone says anything useful.&rdquo;
            <footer style={{ marginTop: 10, fontSize: 12, color: "var(--sd-muted)", fontStyle: "normal" }}>
              <span className="sd-strong">Madhumitha Kolkar</span>
              <span style={{ fontFamily: "var(--sd-font-mono)", margin: "0 6px" }}>·</span>
              <span style={{ fontFamily: "var(--sd-font-mono)" }}>Index 0</span>
            </footer>
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Try It Yourself
          </p>
          <h2 className="sd-h2">Watch The Chain In Your Own Browser</h2>

          <div className="sd-callout sd-callout-accent">
            Open your browser&rsquo;s developer tools, go to the Network tab, and reload any page. Click the very first request and look at the timing breakdown, you should see separate numbers for <strong className="sd-strong">DNS lookup</strong>, <strong className="sd-strong">initial connection</strong> (TCP), <strong className="sd-strong">SSL</strong> (TLS), and <strong className="sd-strong">waiting for the server</strong> (often labeled TTFB). Notice how much time is spent before the server even starts working on your request.
          </div>
        </div>

        {/* Summary */}
        <div className="sd-section">
          <p className="sd-eyebrow">
            Summary
          </p>
          <h2 className="sd-h2">The Map Before the Scale</h2>

          <div className="sd-callout sd-callout-green">
            The lifecycle of a request is the fundamental flow that every system designer must map out to identify potential points of failure. Understanding this flow is the prerequisite for designing systems that handle scale, which we will address next by analyzing{" "}
            <strong className="sd-strong">how we measure system performance</strong> and{" "}
            <strong className="sd-strong">distribute load</strong>.
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
          Mapping the lifecycle tells you where a request can break. These are the mechanisms behind three of its most consequential hops.
        </p>

        <PanelSection title="Why does TLS add extra round trips, and how is that cost reduced in practice?" defaultOpen>
          <p className="sd-text-sm">
            A request first opens a{" "}
            <T k="tcp" />{" "}
            connection, then layers{" "}
            <T k="tls" />{" "}
            on top of it. Encryption isn&rsquo;t free — negotiating it costs{" "}
            <strong className="sd-strong">round trips before any application data moves</strong>, and shaving those off is a recurring theme in web performance work.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">The handshake is a fixed tax paid once per connection.</strong> Keeping connections alive is what keeps you from paying it on every request.
          </div>
        </PanelSection>

        <PanelSection title="How does the application server's threading model change how head-of-line blocking shows up?">
          <p className="sd-text-sm">
            &quot;Limited worker threads&quot; means something <strong className="sd-strong">different depending on the concurrency model</strong> the server was built on.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">The model changes the ceiling, not the physics.</strong> A slow enough database defeats any threading strategy eventually.
          </div>
        </PanelSection>

        <PanelSection title="What replaces a synchronous database round trip when it's too slow to do inline?">
          <p className="sd-text-sm">
            Minimizing synchronous hops doesn&rsquo;t mean the work disappears — it means{" "}
            <strong className="sd-strong">moving it off the request&rsquo;s critical path</strong>.
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
            <div key={item.title} className="sd-panel-card">
              <div className="sd-panel-card-title">{item.title}</div>
              <p className="sd-text-xs">{item.body}</p>
            </div>
          ))}
          <div className="sd-panel-note">
            <strong className="sd-hl">Caching, queues, and replicas are the same idea three ways:</strong> keep the slow thing off the path the user is waiting on.
          </div>
        </PanelSection>
      </SidePanel>

      <PageNav {...nav} label="Prologue" />
    </>
  );
}
