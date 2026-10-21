"use client";

import {
  Breadcrumb,
  QuizCarousel,
  PageNav,
  LearnedToggle,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "Why does a fixed window counter allow more than the stated limit in practice, and how does a sliding window fix it?",
    answers: ["A fixed window resets sharply at each boundary, so a client can send the full limit in the last moment of one window and the full limit again in the first moment of the next, achieving nearly double the intended rate in a short span around the boundary. A sliding window avoids this by never having a hard reset point, either tracking exact timestamps or smoothly weighting between the current and previous window, so no short span of time ever sees more than the intended limit."],
  },
  {
    question: "Why is per-IP rate limiting often insufficient on its own?",
    answers: ["Many real, distinct users can share one IP address behind a NAT, corporate network, or mobile carrier gateway, so limiting by IP alone can throttle legitimate unrelated users together as if they were one client. Conversely, a determined attacker can spread requests across many IPs to evade the limit entirely. Combining IP-based limits with per-account or per-API-key limits gives more accurate, fairer enforcement."],
  },
  {
    question: "In a system with many API server instances behind a load balancer, why can't each server just enforce the rate limit independently?",
    answers: ["If each server keeps its own local count, a client's requests get distributed across servers by the load balancer, and each server only sees a fraction of that client's total traffic, undercounting it. The client's effective allowed rate becomes the per-server limit multiplied by however many servers it happens to hit, defeating the intended cap. A shared store like Redis, tracked centrally, is needed to enforce one true limit across the whole fleet."],
  },
  {
    question: "You need to protect a downstream service that genuinely cannot handle any spike. Token bucket or leaky bucket?",
    answers: ["Leaky bucket. A token bucket deliberately permits a burst up to the bucket's capacity, which is exactly the thing the downstream service can't survive, so a client that has been idle could spend its whole accumulated balance in one instant. A leaky bucket queues arrivals and releases them at a strictly constant rate, so the downstream load is flat regardless of how bursty the input is. The cost is latency: queued requests wait, and the queue itself has a ceiling past which requests are dropped anyway."],
  },
  {
    question: "What does returning a bare rejection, with no 429 and no retry information, cost you?",
    answers: ["It turns a cooperative client into a guessing one. A client that is told it was throttled and when it may retry can back off precisely; a client that just sees a failure retries on its own schedule, usually immediately and usually all at once with every other rejected client, which adds load at the exact moment the limiter was trying to shed it. A 429 with Retry-After, plus remaining-quota headers, lets well-behaved clients pace themselves and makes the badly-behaved ones easy to identify."],
  },
];

const whyThisExists = [
  "A single misbehaving client, whether a buggy retry loop or a deliberate scraper, can send requests fast enough to consume the capacity that every other client needs, turning one bad actor's mistake into an outage for everyone.",
  "Without a limit, a spike in legitimate traffic, a sale going live or a post going viral, can overwhelm downstream databases and services that were sized for normal load, causing cascading failures well beyond the endpoint that got hit first.",
  "APIs that charge per request or offer tiered plans have no way to enforce those tiers, or to give paying customers a reliable share of capacity, without some mechanism that actually counts and caps usage per client.",
];

const concept = [
  { name: "Token bucket", body: "A bucket holds up to N tokens and refills at a steady rate; each request consumes one token, and requests are rejected once the bucket is empty. It naturally *allows short bursts up to the bucket's capacity* while enforcing a steady average rate over time, which is why it's the most commonly used algorithm in practice." },
  { name: "Leaky bucket", body: "Requests enter a queue, the bucket, and are processed, or leak out, at a *strictly constant rate* regardless of how bursty the incoming traffic is. It smooths bursts into a steady output stream, which protects downstream systems that genuinely can't handle spikes, at the cost of added latency for queued requests during a burst." },
  { name: "Fixed window counter", body: "Count requests in a fixed time window, like 'this minute', and reset the counter to zero at each window boundary. It's simple to implement and reason about, but has a real burst problem at the edges: a client can send the full limit right at the end of one window and the full limit again at the start of the next, *doubling the effective rate* for a brief moment." },
  { name: "Sliding window, log or counter", body: "Instead of resetting sharply at a boundary, the window slides continuously, either logging every request's timestamp or interpolating between the current and previous fixed windows. This *removes the boundary-doubling problem* at the cost of more memory, for the log, or a small approximation error, for the counter." },
  { name: "It protects two different things at once", body: "The server itself, from being overwhelmed past its capacity, and *other clients*, from one noisy or abusive client starving everyone else's fair share of a shared resource. A limit set only with the server's CPU in mind can still let one client monopolize the queue ahead of everybody else." },
  { name: "Where the limit is enforced matters", body: "Per-IP limiting is easy but *breaks down behind NATs* or shared corporate addresses where many real users look like one client. Per-API-key or per-user-account limiting is far more precise, but it requires authentication to already have happened before the limit can apply, which is why the two usually sit in layers rather than competing." },
  { name: "A limiter has to say so, out loud", body: "A well-designed limiter returns a clear signal rather than a silent drop: an *HTTP 429* status, plus headers like Retry-After or X-RateLimit-Remaining, so a well-behaved client knows it was throttled and exactly when it's safe to try again instead of guessing and retrying blindly." },
  { name: "Distributed enforcement needs a shared store", body: "When the limit has to hold across many API server instances rather than one process, counts or token balances live in a *fast shared store like Redis*. Each server enforcing its own local limit independently would let a client multiply the effective limit by the number of servers, which is the single most common way a correct-looking limiter turns out not to limit anything." },
  { name: "Limits are layered, not singular", body: "A coarse limit at the edge, a CDN or API gateway, blocks obvious abuse *cheaply, before it reaches application servers*. A finer per-endpoint or per-user limit deeper in the stack protects specific expensive operations, like search or file upload, far more tightly than a cheap health-check endpoint needs." },
];

const anatomy = [
  { title: "Limit", def: "The ceiling itself: how many requests are allowed. A number with no window attached means nothing." },
  { title: "Window", def: "The span the limit applies over, per second, per minute, per day. The limit and the window are one decision, not two." },
  { title: "Key", def: "What the counter is kept per: an IP, an API key, a user ID, often a pairing of one of those with a specific endpoint." },
  { title: "Counter store", def: "Where the count or token balance lives. A single process can hold it in memory; a fleet of servers needs a shared store." },
  { title: "Enforcement point", def: "Where the check actually runs: at the CDN, at the API gateway, or inside the service handling the request." },
  { title: "Response", def: "What a rejected client is told. A limit the client can't see is a limit it can't cooperate with." },
];

const terms = [
  { title: "Token bucket", def: "An algorithm where a bucket refills tokens at a steady rate and each request consumes one, allowing bursts up to the bucket's capacity while capping the long-run average rate." },
  { title: "Leaky bucket", def: "An algorithm that queues incoming requests and processes them at a strictly constant output rate, smoothing bursty input into steady downstream load." },
  { title: "Fixed window counter", def: "An approach that counts requests within a fixed time slice and resets to zero at each boundary, simple but vulnerable to a burst doubling right at the window edge." },
  { title: "Sliding window", def: "An approach that avoids the fixed window's edge-burst problem by continuously sliding the counted window forward, either by logging exact timestamps or interpolating between adjacent windows." },
  { title: "Rate limit key", def: "The identity a counter is tracked against. Choosing it is choosing who gets grouped together, and therefore who gets throttled together." },
  { title: "429 Too Many Requests", def: "The standard HTTP status returned when a client has exceeded its limit, ideally paired with a Retry-After header telling the client when to try again." },
  { title: "Retry-After", def: "The response header naming the delay, in seconds or as a date, before a retry will be accepted. It's the difference between a client backing off correctly and guessing." },
  { title: "Distributed rate limiting", def: "Enforcing a single limit consistently across many server instances by tracking counts in a shared store, instead of each server enforcing its own local, inconsistent limit." },
];

const bucketCompare = [
  {
    label: "Token bucket",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    points: [
      "Tokens refill at a steady rate, up to a maximum bucket size",
      "Allows bursts up to the bucket's capacity",
      "Rejects a request outright once the tokens run out",
    ],
    example: {
      title: "100 requests arrive at once",
      trace: [
        ["served from the bucket", "50"],
        ["rejected with 429", "50"],
        ["refill, the next second", "+10 served"],
      ],
      breaks: "A client that has been idle has a full bucket, so it can spend all 50 in a single instant. The long-run average holds at 10 a second, but the downstream service still sees a spike of 50.",
    },
  },
  {
    label: "Leaky bucket",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    points: [
      "Requests queue and are released at a constant output rate",
      "Smooths bursts into steady, predictable downstream load",
      "Queued requests wait, which adds latency during a burst",
    ],
    example: {
      title: "100 requests arrive at once",
      trace: [
        ["queued, the bucket holds 50", "50"],
        ["dropped, the queue is full", "50"],
        ["output rate", "10/s, flat"],
      ],
      breaks: "Downstream never sees more than 10 a second, which is the point. But the 50th queued request waits five seconds for a response the client may have already given up waiting for.",
    },
  },
];

const algorithms = [
  { name: "Token bucket", burst: "Yes, up to capacity", cost: "A balance and a timestamp per key", note: "The general-purpose default: steady average, forgiving of a short burst", use: "Most APIs you've used: a few calls in a row are fine, hammering it for a minute isn't" },
  { name: "Leaky bucket", burst: "No, smoothed flat", cost: "A queue per key", note: "Constant output rate; bursts wait rather than being rejected immediately", use: "Dropping twenty photos into an upload: they all go through, one at a time, at a steady pace" },
  { name: "Fixed window counter", burst: "Yes, at the boundary", cost: "One counter per key, per window", note: "Simplest thing that works, and up to 2x the limit around a reset", use: "Your card's daily cash limit: it resets at midnight, so late tonight plus early tomorrow is twice the cap" },
  { name: "Sliding window log", burst: "No", cost: "One timestamp per request", note: "Exact, and the most expensive to store at high volume", use: "Three wrong PIN tries and you're locked out, where the count has to be exactly right" },
  { name: "Sliding window counter", burst: "Barely", cost: "Two counters per key", note: "Weighted blend of the current and previous window; approximate but cheap", use: "A huge site keeping scrapers out without keeping a record of every single visit" },
];

const seenInTheWild = [
  "Stripe's API enforces per-account rate limits and returns clear 429 responses with guidance, documented explicitly so integrators can build correct retry logic instead of guessing at the behaviour.",
  "GitHub's REST and GraphQL APIs use a token-bucket-style limit tied to your authentication method, with response headers reporting exactly how many requests remain in the current window.",
  "Cloudflare offers rate limiting as an edge product, letting sites throttle or block abusive traffic patterns before a single request ever reaches the origin server.",
  "Twitter/X has long enforced strict per-endpoint limits on its API, historically a major constraint that shaped how third-party clients and bots were built around it.",
];

const keyPoints = [
  "Token bucket allows controlled bursts up to a cap while enforcing a steady average rate, and is the *most common general-purpose choice*.",
  "Leaky bucket smooths bursty traffic into a constant output rate by queueing, protecting downstream systems that *can't handle spikes at all*.",
  "Fixed window counters are simple but allow nearly *double the limit at the window boundary*; sliding windows fix that for more memory or a small approximation.",
  "Rate limiting protects the server's own capacity *and* other clients' fair share of it, not just one or the other.",
  "A fleet of servers needs a *shared store like Redis* to enforce one true limit, or the limit multiplies by the number of instances.",
  "A good limiter communicates: *429 plus retry timing*, instead of silently dropping requests and leaving the client to guess.",
  "The rate limit key decides who gets throttled together, which is why *per-IP alone* punishes shared networks and misses distributed abuse.",
  "Limits belong in layers, cheap and coarse at the edge, *tight and specific* on the expensive endpoints.",
];

const commonMistakes = [
  "Implementing a naive fixed window counter without realizing it allows nearly double the intended rate right at the window boundary.",
  "Rate limiting only by IP address, which unfairly throttles many legitimate users sharing a NAT or corporate gateway while barely slowing down a distributed attacker.",
  "Enforcing the limit locally per server instance in a multi-server deployment, letting a client's effective limit multiply by however many servers happen to receive its requests.",
  "Returning a bare rejection with no Retry-After or remaining-quota information, leaving well-behaved clients to retry blindly instead of backing off correctly.",
  "Setting one blanket limit for every endpoint, instead of tighter limits on expensive operations like search or file upload and looser ones on cheap operations like a health check.",
  "Rejecting with a 500 or a connection reset instead of a 429, so clients and their monitoring read a deliberate throttle as a server fault and retry harder.",
  "Treating the limiter itself as infallible, with no decision made about what happens to traffic when the shared counter store is unreachable.",
];

const furtherReading = [
  {
    title: "INDEX 0",
    source: "Practice coach",
    note: "A free, local-first coach for DSA, mock interviews and system design. Zero nudges you toward the answer instead of handing it over, and nothing leaves your machine.",
    href: "https://www.index-0.in/",
  },
  {
    title: "Rate Limiting Algorithms Explained",
    source: "AlgoMaster",
    note: "Algorithm by algorithm, with the trade-offs each one makes and the weighting maths behind the sliding window counter.",
    href: "https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code",
  },
  {
    title: "Rate limits",
    source: "Stripe API docs",
    note: "A production limiter described from the integrator's side: what the limits are, what a 429 looks like, and the retry behaviour expected of clients.",
    href: "https://docs.stripe.com/rate-limits",
  },
];

/* Shared arrowhead for the topology and flow diagrams. */
const flowArrow = (
  <defs>
    <marker id="sd-rl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
    </marker>
  </defs>
);

function Node({ x, y, w, h, label, sub, accent }: { x: number; y: number; w: number; h: number; label: string; sub?: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="var(--sd-surface2)" stroke={accent ? "var(--sd-accent)" : "var(--sd-border-strong)"} strokeWidth="1.5" />
      <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">{label}</text>
      {sub ? (
        <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{sub}</text>
      ) : null}
    </g>
  );
}

function Edge({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-rl-arrow)" />
      {label ? (
        <text x={lx} y={ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">{label}</text>
      ) : null}
    </g>
  );
}

function BucketCard({ item }: { item: (typeof bucketCompare)[number] }) {
  const { example } = item;
  return (
    <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ background: item.wash, color: item.color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {item.label}
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {item.points.map((pt) => (
          <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, color: item.color, fontSize: 11, lineHeight: 1.7 }}>●</span>
            <p className="sd-text-sm-tight">{pt}</p>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--sd-border)", background: "var(--sd-bg)", padding: "12px 16px 14px" }}>
        <div style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sd-muted)", marginBottom: 9 }}>
          Limit of 10/s, bucket of 50
        </div>
        <div style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11.5, fontWeight: 700, color: item.color, marginBottom: 9 }}>
          {example.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 11 }}>
          {example.trace.map(([step, count], i) => {
            const last = i === example.trace.length - 1;
            return (
              <div key={step} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--sd-font-mono)", fontSize: 11, paddingTop: last ? 6 : 0, borderTop: last ? "1px solid var(--sd-border)" : "none" }}>
                <span style={{ color: last ? "var(--sd-text)" : "var(--sd-muted)" }}>{step}</span>
                <span style={{ flexShrink: 0, color: last ? item.color : "var(--sd-muted)" }}>{count}</span>
              </div>
            );
          })}
        </div>
        <p className="sd-text-xs" style={{ margin: 0 }}>{example.breaks}</p>
      </div>
    </div>
  );
}

export default function Lesson03RateLimiting() {
  const nav = getLessonNav("rate-limiting");

  return (
    <>
      <Breadcrumb section={nav.sectionTitle} lesson="Rate Limiting" />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Concept {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">Rate Limiting</h1>
        <LearnedToggle />
        <p className="sd-lede">
          Why the algorithm behind a limit decides how forgiving it is, not just what number is printed on it.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              Rate limiting caps how often a client can call your system in a given window, and the algorithm you pick decides <strong className="sd-strong">how forgiving that cap is about bursts</strong>, not just what the average rate ends up being. Two limiters advertising &ldquo;100 requests a minute&rdquo; can behave completely differently in the second that actually matters.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">Why One Client Can Become Everyone&rsquo;s Outage</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">A Data Plan, And The Night Before It Resets</h2>

          <div className="sd-prose">
            <p>
              Rate limiting is like the data allowance on a phone plan. The carrier isn&rsquo;t trying to stop you using the network, it&rsquo;s keeping any one phone from <strong className="sd-strong">eating the capacity of a tower everybody is sharing</strong>.
            </p>
            <p style={{ marginTop: 12 }}>
              A fixed window plan gives you 10 GB that resets at midnight on the first of the month, which is why someone who checks their usage on the 31st can burn the last 10 GB that night and <strong className="sd-strong">another 10 GB the next morning</strong>: twenty gigabytes in a few hours, out of a plan sized for ten a month. A plan with rollover data behaves like a token bucket instead. The allowance accrues steadily, stops accruing at some ceiling, and a quiet month lets you spend a burst later <strong className="sd-strong">without ever beating the long-run rate</strong>. Same number on the bill, very different night for the tower.
            </p>
          </div>
        </div>

        {/* Topology */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">A Layered Limiter In Front Of An API</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">Cheap and coarse at the edge, precise and shared deeper in</p>
            <svg viewBox="0 0 860 290" role="img" aria-label="A client request passes a coarse limit at the CDN, then an API gateway that reads and updates counters in Redis before forwarding allowed requests to the app server." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>A layered rate limiter in front of an API</title>
              {flowArrow}
              <Node x={20} y={98} w={120} h={54} label="Client" accent />
              <Edge d="M 140 125 L 168 125" label="request" lx={154} ly={112} />
              <Node x={175} y={98} w={120} h={54} label="CDN" sub="edge" />
              <Edge d="M 295 125 L 338 125" label="coarse limit passed" lx={316} ly={112} />
              <Node x={345} y={88} w={180} h={74} label="API gateway" sub="the rate limiter" accent />
              <Edge d="M 525 125 L 663 125" label="allowed request" lx={594} ly={112} />
              <Node x={670} y={98} w={130} h={54} label="App server" />
              <Edge d="M 435 162 L 435 203" />
              <Node x={350} y={207} w={170} h={54} label="Redis" sub="counters / tokens" />
              <text x={532} y={238} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">check and update the count</text>
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            The counter store sits <strong className="sd-strong">beside the limiter, not inside it</strong>. That one detail is what lets ten gateway instances enforce a single shared limit, and it is also the detail most local implementations quietly skip, which is why their limit turns out to be ten times what the documentation claims.
          </div>
        </div>

        {/* Anatomy */}
        <div className="sd-section">
          <p className="sd-eyebrow">Anatomy</p>
          <h2 className="sd-h2">The Six Pieces</h2>

          <div className="sd-grid-2">
            {anatomy.map((a) => (
              <div key={a.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{a.title}</div>
                <p className="sd-text-sm-tight">{a.def}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            The key is the piece people underthink. Limiting by IP, by API key, by user, or by the pair of user and endpoint are four different products: they decide <strong className="sd-strong">who gets throttled together</strong>. Everything else on this list is arithmetic, but the key is a policy decision about fairness.
          </div>
        </div>

        {/* The concept */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">Four Algorithms And What Each One Forgives</h2>

          <div className="sd-stack">
            {concept.map((step, i) => (
              <div key={step.name} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 3 }}>{step.name}</div>
                  <p className="sd-text-sm-tight">{hl(step.body)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Terms</p>
          <h2 className="sd-h2">The Vocabulary Of Saying No Politely</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token vs leaky */}
        <div className="sd-section">
          <p className="sd-eyebrow">Worked Example</p>
          <h2 className="sd-h2">Token Bucket vs Leaky Bucket</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
            <BucketCard item={bucketCompare[0]} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
            </div>

            <BucketCard item={bucketCompare[1]} />
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            Both columns enforce the same average. The difference is <strong className="sd-strong">who absorbs the burst</strong>: the token bucket pushes it downstream and tells the excess clients no immediately, while the leaky bucket absorbs it in a queue and makes the clients wait instead. Pick by asking which your downstream can survive, a spike or a delay.
          </div>
        </div>

        {/* Token bucket flow */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Token Bucket, One Request At A Time</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">The refill runs on the clock, not on the request</p>
            <svg viewBox="0 0 860 290" role="img" aria-label="A request arrives and the limiter checks for an available token; if one exists it is consumed and the request is allowed, otherwise the request is rejected with a 429 and a Retry-After header. The bucket refills at a steady rate independently." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Token bucket, per request</title>
              {flowArrow}
              <Node x={300} y={16} w={230} h={46} label="Request arrives" accent />
              <Edge d="M 415 62 L 415 108" />
              <Node x={310} y={112} w={210} h={46} label="Token available?" accent />
              <Edge d="M 520 135 L 643 135" label="yes" lx={580} ly={125} />
              <Node x={650} y={112} w={190} h={46} label="Consume token" sub="request allowed" />
              <Edge d="M 415 158 L 415 210" label="no" lx={432} ly={188} />
              <Node x={300} y={214} w={230} h={46} label="Reject: 429" sub="with Retry-After" />
              <Node x={20} y={112} w={190} h={46} label="Bucket refills" sub="steady rate, up to N" />
              <Edge d="M 210 135 L 303 135" />
            </svg>
          </div>

          <div className="sd-callout">
            Nothing here depends on how long ago the last request was, only on <strong className="sd-strong">what the clock has put back in the bucket</strong> since. That is the whole trick: an idle client accumulates headroom up to the cap and no further, so the average holds without anyone tracking a window at all.
          </div>
        </div>

        {/* Boundary burst */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">The Fixed Window&rsquo;s Boundary Burst</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">A limit of 100 per window, and a client that knows where the boundary is</p>
            <svg viewBox="0 0 860 300" role="img" aria-label="Cumulative requests allowed over ten seconds. The fixed window line steps to 100 just before the window boundary and to 200 just after it, while the sliding window line steps to 100 and stays flat." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Fixed window boundary burst versus a sliding window</title>
              {[0, 100, 200].map((v) => (
                <g key={v}>
                  <line x1={105} y1={250 - v * 1.05} x2={830} y2={250 - v * 1.05} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
                  <text x={93} y={254 - v * 1.05} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{v}</text>
                </g>
              ))}
              {[55, 60, 65].map((t) => (
                <text key={t} x={105 + (t - 55) * 72.5} y={270} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{t}</text>
              ))}
              <line x1={467} y1={30} x2={467} y2={250} stroke="var(--sd-border-strong)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={473} y={262} fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">window resets</text>
              <polyline points="105,250 395,250 395,145 467,145 467,40 830,40" fill="none" stroke="var(--sd-danger)" strokeWidth="2" />
              <polyline points="105,250 395,250 395,145 830,145" fill="none" stroke="var(--sd-accent)" strokeWidth="2" />
              <line x1={105} y1={250} x2={830} y2={250} stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <text x={467} y={290} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Time (seconds)</text>
              <text x={28} y={145} textAnchor="middle" transform="rotate(-90 28 145)" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Requests allowed</text>
              <text x={560} y={34} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-danger)">Fixed window: 200 in two seconds</text>
              <text x={560} y={139} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-accent)">Sliding window: 100, same limit</text>
            </svg>
          </div>

          <div className="sd-prose">
            <p>
              Both lines are enforcing &ldquo;100 per minute&rdquo; and both are doing exactly what they were configured to do. The client sends its full allowance at second 59 and its full allowance again at second 60, and the fixed window counter has <strong className="sd-strong">no memory of the window it just closed</strong>, so it permits 200 requests inside a two-second span. If the server was sized for 100 a minute, it just received a minute and a half of traffic in two seconds.
            </p>
            <p style={{ marginTop: 12 }}>
              A sliding window log fixes this exactly by keeping every request&rsquo;s timestamp and counting only those inside the last sixty seconds, which costs one stored timestamp per request. The sliding window counter gets most of the way there far more cheaply by keeping just two counters and <strong className="sd-strong">weighting the previous window by how much of it is still in view</strong>: a quarter of the way into the current window, it counts the current window&rsquo;s requests plus three quarters of the previous one&rsquo;s. It approximates, but it never has a boundary to exploit.
            </p>
          </div>
        </div>

        {/* Algorithm reference */}
        <div className="sd-section">
          <p className="sd-eyebrow">Reference</p>
          <h2 className="sd-h2">Which Algorithm Fits Which Job</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760 }}>
              <thead>
                <tr>
                  {["Algorithm", "Allows Bursts", "What It Stores", "What Defines It", "Where You've Met It"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {algorithms.map((a, i) => (
                  <tr key={a.name}>
                    <td style={{ padding: "11px 14px", borderBottom: i < algorithms.length - 1 ? "1px solid var(--sd-border)" : "none", fontWeight: 600, color: "var(--sd-text)" }}>{a.name}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < algorithms.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-teal)" }}>{a.burst}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < algorithms.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)" }}>{a.cost}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < algorithms.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)" }}>{a.note}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < algorithms.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)", minWidth: 200 }}>{a.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            The choice is rarely about accuracy. It is about <strong className="sd-strong">what you want a burst to do</strong>: pass through up to a cap (token bucket), wait in line (leaky bucket), or be measured against a window that can&rsquo;t be gamed (sliding). Default to token bucket, and reach for the others when you can name the specific thing it forgives that you can&rsquo;t afford.
          </div>
        </div>

        {/* Distributed */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">One True Limit Across Many Servers</h2>

          <div className="sd-prose">
            <p>
              A limiter that works perfectly on one server often stops limiting anything the moment that server becomes five. The load balancer spreads one client&rsquo;s requests across the fleet, so each instance sees only a fraction of that client&rsquo;s traffic and happily counts it as <strong className="sd-strong">well under the limit</strong>.
            </p>
          </div>

          <div className="sd-callout sd-callout-accent">
            The arithmetic is blunt: a local limit of 100 a minute, enforced independently on <strong className="sd-strong">five instances, is a real limit of 500</strong>. Nothing in the logs looks wrong, every instance reports it is enforcing the documented number, and the client sees five times what it was promised.
          </div>

          <div className="sd-prose" style={{ marginTop: 16 }}>
            <p>
              The fix is a shared store, usually Redis, holding the counter or token balance centrally. That introduces two new problems worth deciding about in advance rather than during an incident. The first is that the check now costs a network round trip on <strong className="sd-strong">every single request</strong>, which is why limiters keep the operation to one atomic increment and put the store in the same region as the gateway.
            </p>
            <p style={{ marginTop: 12 }}>
              The second is the question nobody enjoys: what happens when the counter store is unreachable? <strong className="sd-strong">Failing open</strong> lets all traffic through and risks the overload the limiter exists to prevent. <strong className="sd-strong">Failing closed</strong> rejects everything and turns a cache outage into a total outage. Most systems fail open with a coarse local fallback limit, so a store outage degrades precision rather than availability, but the point is that it is a decision, not a default.
            </p>
          </div>
        </div>

        {/* Who gets counted */}
        <div className="sd-section">
          <p className="sd-eyebrow">Counterpoint</p>
          <h2 className="sd-h2">Who The Limit Is Actually Counting</h2>

          <div className="sd-prose">
            <p>
              Per-IP limiting is the version everyone reaches for first, because it needs nothing from the client and works before authentication. It is also the version that gets both halves of the job wrong. One office, one university, or one mobile carrier gateway can put <strong className="sd-strong">thousands of unrelated users behind a single address</strong>, so the limit throttles them as though they were one client. Meanwhile an attacker with a few hundred addresses stays comfortably under a per-IP limit while sending a few hundred times the traffic.
            </p>
            <p style={{ marginTop: 12 }}>
              Per-API-key and per-account limits fix the fairness problem, because the key is the actual identity, but they can only be applied <strong className="sd-strong">after the request has been authenticated</strong>, which means unauthenticated endpoints like login and signup still need an IP-shaped limit in front of them. That is the real reason limits end up layered rather than unified: a coarse IP limit at the edge protects the door, and a precise per-account limit inside protects the expensive rooms.
            </p>
          </div>

          <div className="sd-callout sd-callout-green">
            And one limit for every endpoint is its own mistake. A search query that fans out across a database and a health check that returns a constant <strong className="sd-strong">should not share a budget</strong>. Price the limit by what the operation costs you, not by what is easiest to configure.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">Limits You&rsquo;ve Probably Hit</h2>
          <MarkerList mark="▪" color="var(--sd-teal)" items={seenInTheWild} columns={2} />
        </div>

        {/* Key points */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Points</p>
          <h2 className="sd-h2">What To Carry Forward</h2>
          <MarkerList mark="✓" color="var(--sd-green)" items={keyPoints.map(hl)} columns={2} />
        </div>

        {/* Common mistakes */}
        <div className="sd-section">
          <p className="sd-eyebrow">Common Mistakes</p>
          <h2 className="sd-h2">Where This Usually Goes Wrong</h2>
          <MarkerList mark="✕" color="var(--sd-danger)" bg="var(--sd-danger-wash)" items={commonMistakes} columns={2} />

          <blockquote style={{ borderLeft: "2px solid var(--sd-teal)", padding: "2px 0 2px 16px", margin: "20px 0 0", fontSize: 14, lineHeight: 1.75, color: "var(--sd-text)", fontStyle: "italic" }}>
            &ldquo;Three treats a day, my human says. But there are four humans in this house, none of them compare notes, and the paw-on-the-knee routine works on each of them separately, so my real limit is twelve. My harness is getting snug. Nobody has proposed a shared counter, and I am absolutely not going to be the one who brings it up.&rdquo;
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Guess The Algorithm Behind A Limit You&rsquo;ve Hit</h2>

          <div className="sd-callout sd-callout-accent">
            Pick an API you&rsquo;ve used, or just the app you use most. From its documented behaviour, guess which algorithm it likely uses: does it <strong className="sd-strong">allow a short burst</strong>, or is the rate perfectly smooth? Then sketch, in one sentence each, how a fixed window counter and a token bucket would behave differently if you sent 100 requests in the first second of every minute, every minute, for an hour.
          </div>
        </div>

        {/* Further reading */}
        <div className="sd-section">
          <p className="sd-eyebrow">Further Reading</p>
          <h2 className="sd-h2">Where To Go Deeper</h2>

          <div className="sd-stack">
            {furtherReading.map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noreferrer" style={{ display: "block", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px", textDecoration: "none" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-accent)" }}>{r.title}</span>
                  <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sd-muted)" }}>{r.source}</span>
                </div>
                <p className="sd-text-sm-tight">{r.note}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Quiz */}
        <div className="sd-quiz">
          <p className="sd-eyebrow-accent">Quiz Review</p>
          <p className="sd-quiz-title">Check your understanding</p>
          <QuizCarousel cards={quizCards} />
        </div>
      </PageLayout>

      <PageNav {...nav} />
    </>
  );
}
