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
    question: "Why do consumers reading from a queue need to be idempotent even if the queue technology claims reliable delivery?",
    answers: ["Because most real-world delivery guarantees are at-least-once, not exactly-once. A consumer can crash after processing a message but before acknowledging it, so the broker never learns the work was done and redelivers the same message. If processing isn't idempotent, that redelivery causes duplicate side effects, like charging a customer twice or sending the same notification twice, so the consumer itself has to detect and absorb duplicates, usually by recording the message ID it already handled."],
  },
  {
    question: "What's the risk of putting work on a queue with no backpressure policy?",
    answers: ["If producers keep publishing faster than consumers can process and nothing is defined to happen, the queue just grows unbounded. That eventually exhausts memory or storage on the broker itself, turning a temporary processing lag into a hard outage. The subtler cost is staleness: by the time a huge backlog is finally drained, the work at the front of it may no longer be useful, so the queue was holding messages that should have been shed instead."],
  },
  {
    question: "A queue absorbed a one-hour outage. Why isn't the system fine one hour after the consumers come back?",
    answers: ["Because draining a backlog requires capacity on top of the work still arriving. An hour of accumulated messages needs roughly double the normal processing capacity for another full hour just to catch up, and the ratio is unforgiving: a backlog ten times what consumers can chew through in normal operation takes hours to clear, not minutes. This is why queues are described as bimodal, fast and invisible in normal operation, then suddenly in a slow mode that takes far longer to exit than it took to enter."],
  },
  {
    question: "Your team needs events for one document's edits to be applied in the order they were made. What does that constrain?",
    answers: ["It constrains both the technology and the layout of the work. Ordering is only ever guaranteed inside a narrow boundary, a single partition, message group, or key, never across a whole topic being consumed in parallel. So every edit to that one document has to be routed onto the same partition or message group, which means the document ID becomes the partitioning key. The cost is that one busy document can no longer be processed in parallel, and a slow message on that key blocks the ones behind it."],
  },
  {
    question: "What problem does a dead letter queue solve that retries alone cannot?",
    answers: ["Retries assume failure is transient. A malformed message, or one referring to a record that no longer exists, will fail identically on every attempt, so retrying it forever burns consumer capacity and can stall everything behind it. A dead letter queue gives that message somewhere to go after a bounded number of attempts, so the main queue keeps flowing while the poison message waits somewhere a human can inspect it."],
  },
];

const whyThisExists = [
  "When one service calls another directly and waits for the response, the caller is now only as fast, and only as available, as the callee, so a slow or down email service can make signing up for an account slow or impossible, even though sending the email isn't actually required before the account exists.",
  "Some work is genuinely slow or bursty, sending a batch of emails, transcoding an uploaded video, generating a report, and forcing a user-facing request to wait for all of it wastes the user's time on something they don't need an immediate answer for.",
  "Without something absorbing the mismatch between how fast work arrives and how fast it can be processed, a sudden burst of traffic, a flash sale or a viral post, either overwhelms downstream services or gets silently dropped, and neither is acceptable if the work has to happen eventually.",
];

const concept = [
  { name: "Decoupling producers from consumers", body: "The producer publishes a message and *moves on immediately*; the consumer picks it up whenever it's ready. Neither side needs to know the other's speed, availability, or even how many instances of it exist, which is the whole reason the pattern is reached for in the first place." },
  { name: "A slow consumer stops being the producer's problem", body: "Because the two sides only meet at the queue, a consumer that is slow or temporarily down *doesn't block the producer*. Work accumulates and gets processed once the consumer recovers, instead of the producer's request failing or hanging on a dependency it didn't need an answer from." },
  { name: "Load leveling absorbs bursts", body: "If 10,000 messages arrive in one second but consumers can only process 1,000 per second, the queue *holds the backlog* and consumers work through it at a sustainable pace, instead of the burst overwhelming and crashing the processing layer. This is the single most common reason a queue earns its place." },
  { name: "Acknowledgment is the reliability hinge", body: "A message isn't removed when it's delivered, it's removed when the consumer *acknowledges* it. Everything else in this lesson follows from that one design choice: if a consumer crashes mid-work, it never acknowledges, so the broker eventually hands the message to someone else. Nothing is lost, and that is exactly why duplicates become possible." },
  { name: "At-least-once delivery is the realistic default", body: "The most common guarantee means a message will be delivered *one or more times*. A consumer might see the same message twice, most often because it crashed after doing the work but before acknowledging. Consumers therefore need to be *idempotent*: processing the same message twice must produce the same result as processing it once, usually by checking a unique message ID against already-processed IDs." },
  { name: "Exactly-once is mostly a story about idempotency", body: "Exactly-once delivery is what people actually want, but it's genuinely hard to guarantee across a distributed system. Most systems advertising it achieve *at-least-once delivery plus idempotent processing*, which produces the same practical outcome without needing the harder underlying guarantee. Designing as if you have it, when you don't, is where the duplicate charges come from." },
  { name: "Backpressure needs an explicit policy", body: "When consumers can't keep up and the queue fills toward capacity, a well-designed system has already decided what happens: slow the producers down, shed lower-priority messages, autoscale consumers, or deliberately let the queue grow because it has room. *Silently doing nothing is also a policy*, just one that defers an outage rather than preventing it." },
  { name: "Ordering is only guaranteed inside a narrow boundary", body: "Order holds within *a single queue, partition, message group, or key*, and essentially never across a whole topic being consumed in parallel. If a use case genuinely needs ordering, like a sequence of edits to one document, that requirement decides the partitioning key and costs you parallelism on that key, since the messages behind a slow one have to wait." },
  { name: "Dead letter queues stop one poison message", body: "Some messages can never succeed, a malformed payload, a reference to a deleted record. Retrying those forever burns consumer capacity and can stall everything behind them. A dead letter queue *routes them aside after a bounded number of attempts*, keeping the main queue flowing and leaving the failure somewhere a human can look at it." },
  { name: "Retries can amplify an outage", body: "Retrying aggressively during a partial failure multiplies the load on the thing that is already struggling. Retries need *backoff and jitter*, a cap on attempts, and the recognition that if a dependency is down, the fastest path back is usually less traffic rather than more." },
  { name: "Pub/sub is a related but different pattern", body: "In a work queue, one message is handled by *one* consumer. In publish-subscribe, one message is *broadcast to every subscriber* interested in that topic, which fits when several independent systems all need to react to the same event, like 'order placed' triggering inventory, billing, and notifications at once. Choosing the wrong one of the two shows up as either duplicated work or a system that never hears about an event." },
  { name: "The message format is an API", body: "Once two services only meet at the queue, the message schema is the contract between them, and messages already in flight were written by the *old* version of the producer. Changing the shape of a message therefore needs the same discipline as changing an HTTP endpoint: additive changes, versioning, and a migration plan rather than an edit." },
];

const anatomy = [
  { title: "Producer", def: "A service or component that creates work and publishes it to the queue, without waiting for that work to be processed." },
  { title: "Consumer", def: "A service or component that reads messages off the queue and processes them, independently and at its own pace." },
  { title: "Message", def: "One unit of work: a small payload plus metadata, typically an ID, a timestamp, and a trace ID, rather than the data itself." },
  { title: "Queue", def: "The buffer that holds messages until a consumer acknowledges them, and the only thing the two sides actually share." },
  { title: "Broker", def: "The system that owns storage and delivery, enforces the delivery guarantee, and tracks what has been acknowledged. RabbitMQ, SQS and Kafka are all brokers." },
];

const terms = [
  { title: "Acknowledgment (ack)", def: "The consumer's signal that a message was successfully processed and can be removed. Until it arrives, the broker assumes the work may not have happened." },
  { title: "At-least-once delivery", def: "A guarantee that a message is delivered one or more times, requiring consumers to handle duplicate delivery safely." },
  { title: "Idempotency", def: "The property that processing the same message several times produces the same result as processing it once, which is what makes at-least-once delivery safe to build on." },
  { title: "Backpressure", def: "The condition where consumers can't keep up with incoming volume, and the explicit policy chosen for it: slow producers, scale consumers, or shed load." },
  { title: "Dead letter queue", def: "A separate queue holding messages that repeatedly fail processing, so one unprocessable message can't block or endlessly retry against the main queue." },
  { title: "Visibility timeout", def: "How long a delivered message stays hidden from other consumers while one works on it. Set shorter than the real processing time, the same message gets handed out again in parallel." },
  { title: "Queue depth and message age", def: "The two numbers worth alerting on. Depth says how much is waiting; age of the oldest message says whether the delay has passed what the business can tolerate." },
  { title: "Pub/sub (publish-subscribe)", def: "A pattern where one published message is delivered to every interested subscriber, rather than to exactly one worker pulling off a queue." },
];

const syncVsAsync = [
  {
    label: "Synchronous",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    points: [
      "Caller waits for the response before continuing",
      "Caller's availability is tied directly to the callee's",
      "Simple, but a slow or down downstream breaks the caller too",
    ],
    example: {
      title: "POST /signup",
      trace: [
        ["write user row", "12 ms"],
        ["call email provider, wait", "2,400 ms"],
        ["respond 201", "2,412 ms total"],
      ],
      breaks: "Provider times out: the caller returns 500 even though the account row was already written, so the user sees a failed signup for an account that exists.",
    },
  },
  {
    label: "Asynchronous (via queue)",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    points: [
      "Caller publishes a message and moves on immediately",
      "Consumer processes independently, at its own pace",
      "Absorbs bursts, but adds delay and needs idempotent consumers",
    ],
    example: {
      title: "POST /signup",
      trace: [
        ["write user row", "12 ms"],
        ["publish welcome_email", "3 ms"],
        ["respond 201", "15 ms total"],
      ],
      breaks: "Provider down for an hour: signup keeps returning 201, and the welcome email goes out once a consumer drains the backlog. Late rather than never, but the user is already signed in by then.",
    },
  },
];

const lifecycle = [
  { name: "Produce", sub: "the producer builds a message" },
  { name: "Enqueue", sub: "the broker stores it durably" },
  { name: "Deliver", sub: "a consumer pulls it, hidden from others" },
  { name: "Process", sub: "the actual work happens" },
  { name: "Acknowledge", sub: "the consumer confirms success" },
  { name: "Remove", sub: "the broker drops it, or retries if no ack came" },
];

const patterns = [
  { title: "Work queue", def: "One message, one worker. Tasks are spread across a consumer pool so the pool's size sets the throughput." },
  { title: "Pub/sub", def: "One event, many independent subscribers, each reacting to it without knowing the others exist." },
  { title: "Priority queue", def: "Urgent messages are processed ahead of routine ones, so a backlog of bulk work doesn't delay anything time-sensitive." },
  { title: "Delayed queue", def: "A message stays invisible until a chosen time, which is how 'retry in five minutes' and scheduled work are expressed." },
  { title: "Dead letter queue", def: "The terminal destination for messages that exhausted their retries, kept for inspection instead of discarded." },
];

const brokers = [
  { name: "RabbitMQ", fit: "Traditional work queues", note: "Mature exchanges and routing, per-message acks, built-in DLQ support" },
  { name: "AWS SQS", fit: "Managed cloud queues", note: "Simple and scalable; the FIFO variant orders within a message group" },
  { name: "Google Cloud Pub/Sub", fit: "Events across many services", note: "Topic and subscription model aimed at fan-out rather than work sharing" },
  { name: "Azure Service Bus", fit: "Enterprise messaging", note: "Queues, topics, sessions and scheduled delivery in one service" },
  { name: "Apache Kafka", fit: "Event streams and replay", note: "Partitioned log; consumers track their own position and can re-read history" },
  { name: "Redis Streams", fit: "Lightweight processing", note: "Reasonable when Redis is already in the stack and durability needs are modest" },
];

const seenInTheWild = [
  "Uber uses Kafka extensively to decouple ride events, a driver's location update or a trip completion, from the many independent systems, pricing, matching, analytics, that need to react to them without being coupled to the event source.",
  "Amazon SQS is used across countless AWS-based systems specifically to decouple order placement from downstream fulfillment, so a slow warehouse system or payment processor doesn't block the checkout flow itself.",
  "AWS Lambda hashes each customer onto a small number of internal queues rather than one shared queue, so a single customer's spike congests only the queues they landed on instead of everyone's.",
  "Video platforms like YouTube queue uploaded videos for transcoding rather than making the uploader wait for every resolution to finish encoding, so the upload succeeds immediately and processing happens in the background.",
];

const keyPoints = [
  "A queue decouples producers from consumers *in both time and pace*, so the producer never waits for the consumer to finish.",
  "Queues absorb bursts by buffering work, letting consumers process at a *sustainable rate* instead of collapsing under a spike.",
  "Removal happens on *acknowledgment, not delivery*, which is what makes the system lossless and duplicates possible at the same time.",
  "At-least-once is the realistic default guarantee, so consumers *must be idempotent* to handle occasional duplicate delivery safely.",
  "Backpressure needs an explicit policy, slow producers, scale consumers, or shed load, because *ignoring it only defers the failure*.",
  "A backlog costs far more to drain than it did to accumulate, so *queue age matters more than queue depth* as an alarm.",
  "Dead letter queues stop one repeatedly failing message from blocking everything behind it.",
  "Pub/sub broadcasts one event to many subscribers, *distinct from a queue* where one message is consumed by one worker.",
];

const commonMistakes = [
  "Assuming exactly-once delivery is guaranteed by the queue technology, instead of designing consumers to be idempotent against the at-least-once delivery you actually have.",
  "Using a queue for work that genuinely needs an immediate synchronous answer, adding delay and a second failure mode where the user is simply waiting for a real response.",
  "Not planning for backpressure, letting an unbounded queue grow through a sustained spike with no defined policy for what happens when consumers fall behind.",
  "Alerting on queue depth but never on the age of the oldest message, so a backlog is noticed only once it's large rather than once it's late.",
  "Forgetting that ordering isn't guaranteed by default in most configurations, and writing logic that silently assumes messages arrive in the order they were sent.",
  "Setting a visibility timeout shorter than the real processing time, so slow messages are handed to a second consumer while the first is still working on them.",
  "Skipping a dead letter queue, letting one malformed message retry forever and stall the consumer pool behind it.",
];

const furtherReading = [
  {
    title: "INDEX 0",
    source: "Practice coach",
    note: "A free, local-first coach for DSA, mock interviews and system design. Zero nudges you toward the answer instead of handing it over, and nothing leaves your machine.",
    href: "https://www.index-0.in/",
  },
  {
    title: "Message Queues",
    source: "AlgoMaster",
    note: "Broker-by-broker comparison, the delivery lifecycle, and the operational checklist for running a queue in production.",
    href: "https://algomaster.io/learn/system-design/message-queues",
  },
  {
    title: "Avoiding insurmountable queue backlogs",
    source: "Amazon Builders' Library",
    note: "Why queue-based systems are bimodal, and the mitigations, shuffle-sharding, sidelining, message TTL, that keep a backlog recoverable.",
    href: "https://builder.aws.com/content/3EuRcgkTP1MI0c7zM8W6HL3WIqA/avoiding-insurmountable-queue-backlogs",
  },
];

/* Shared arrowhead for the flow and topology diagrams. */
const flowArrow = (
  <defs>
    <marker id="sd-mq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
      <path d={d} fill="none" stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-mq-arrow)" />
      {label ? (
        <text x={lx} y={ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">{label}</text>
      ) : null}
    </g>
  );
}

function TradeoffCard({ item }: { item: (typeof syncVsAsync)[number] }) {
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
          In practice
        </div>
        <div style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11.5, fontWeight: 700, color: item.color, marginBottom: 9 }}>
          {example.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 11 }}>
          {example.trace.map(([step, cost], i) => {
            const last = i === example.trace.length - 1;
            return (
              <div key={step} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--sd-font-mono)", fontSize: 11, paddingTop: last ? 6 : 0, borderTop: last ? "1px solid var(--sd-border)" : "none" }}>
                <span style={{ color: last ? "var(--sd-text)" : "var(--sd-muted)" }}>{step}</span>
                <span style={{ flexShrink: 0, color: last ? item.color : "var(--sd-muted)" }}>{cost}</span>
              </div>
            );
          })}
        </div>
        <p className="sd-text-xs" style={{ margin: 0 }}>{example.breaks}</p>
      </div>
    </div>
  );
}

export default function Lesson07MessageQueues() {
  const nav = getLessonNav("message-queues");

  return (
    <>
      <Breadcrumb section={nav.sectionTitle} lesson="Message Queues &amp; Asynchronous Processing" />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">Message Queues &amp; Asynchronous Processing</h1>
        <LearnedToggle />
        <p className="sd-lede">
          How the part of a system that takes work in stops running at the speed of the part that does it.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              A queue lets the part of your system that receives work <strong className="sd-strong">stop caring, in real time, about how fast the part that does the work can keep up</strong>. That is the difference between a slow downstream service degrading your whole system and it just quietly falling a little behind.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">Why Waiting Is The Expensive Part</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">The Order Ticket Rail In A Kitchen</h2>

          <div className="sd-prose">
            <p>
              A message queue is like the order ticket rail in a restaurant kitchen. The waiter doesn&rsquo;t stand at the grill watching every dish get cooked before taking the next table&rsquo;s order, they <strong className="sd-strong">clip the ticket to the rail and move on immediately</strong>. The cooks pull tickets off the rail at whatever pace they can actually sustain.
            </p>
            <p style={{ marginTop: 12 }}>
              If ten tables order at once, the rail just holds ten tickets instead of the kitchen collapsing or the waiter freezing in place. The waiter and the cooks work at their own paces, <strong className="sd-strong">connected only by that rail</strong>, not by standing over each other&rsquo;s shoulder. And the rail is also where the trouble shows: a rail with forty tickets on it means dinner is late no matter how calm the dining room looks.
            </p>
          </div>
        </div>

        {/* Topology */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Producer, Queue, Consumer Pool</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">One producer publishes; a pool of workers pulls at its own pace</p>
            <svg viewBox="0 0 860 250" role="img" aria-label="An API server publishes messages into a queue; three workers pull from that queue independently and write results to a database." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Producer, queue and consumer pool</title>
              {flowArrow}
              <Node x={20} y={98} w={140} h={54} label="API Server" sub="producer" accent />
              <Edge d="M 160 125 L 243 125" label="publish" lx={201} ly={115} />
              <Node x={250} y={88} w={150} h={74} label="Message Queue" sub="holds the backlog" accent />
              <Edge d="M 400 110 C 450 110, 460 52, 508 52" label="pull" lx={462} ly={74} />
              <Edge d="M 400 125 L 508 125" />
              <Edge d="M 400 140 C 450 140, 460 198, 508 198" />
              <Node x={515} y={28} w={130} h={48} label="Worker 1" />
              <Node x={515} y={101} w={130} h={48} label="Worker 2" />
              <Node x={515} y={174} w={130} h={48} label="Worker 3" />
              <Edge d="M 645 52 C 700 52, 710 110, 748 118" />
              <Edge d="M 645 125 L 748 125" />
              <Edge d="M 645 198 C 700 198, 710 140, 748 132" />
              <Node x={755} y={101} w={90} h={48} label="Database" />
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            Nothing in this picture tells the API server how many workers exist, or whether any of them are currently running. <strong className="sd-strong">That ignorance is the feature.</strong> Scaling the pool from three workers to thirty, or losing two of them, changes throughput without changing the producer at all.
          </div>
        </div>

        {/* Anatomy */}
        <div className="sd-section">
          <p className="sd-eyebrow">Anatomy</p>
          <h2 className="sd-h2">The Five Pieces</h2>

          <div className="sd-grid-2">
            {anatomy.map((a) => (
              <div key={a.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{a.title}</div>
                <p className="sd-text-sm-tight">{a.def}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            Keep messages <strong className="sd-strong">small and descriptive rather than self-contained</strong>. A message that says &ldquo;video 91ac is ready to transcode&rdquo; survives a schema change and costs nothing to store; one carrying the video itself turns the broker into a file server. Large payloads belong in object storage, with the message carrying the key.
          </div>
        </div>

        {/* The concept */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">What Decoupling Actually Costs And Buys</h2>

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
          <h2 className="sd-h2">The Vocabulary Of Work You Don&rsquo;t Wait For</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sync vs async */}
        <div className="sd-section">
          <p className="sd-eyebrow">Worked Example</p>
          <h2 className="sd-h2">A Direct Call vs The Same Call Through A Queue</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
            <TradeoffCard item={syncVsAsync[0]} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
            </div>

            <TradeoffCard item={syncVsAsync[1]} />
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            The async column is not strictly better. It trades a failure you can see, the call returned an error, for one you have to go looking for: the work was accepted and <strong className="sd-strong">may still be sitting in a backlog</strong>. Signing up for an account is a good fit. Checking whether a username is available is not.
          </div>
        </div>

        {/* Lifecycle */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">The Life Of One Message</h2>

          <div className="sd-grid-3">
            {lifecycle.map((step, i) => (
              <div key={step.name} style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 14px" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 4, lineHeight: 1.35 }}>{step.name}</div>
                <p className="sd-text-xs" style={{ margin: 0 }}>{step.sub}</p>
              </div>
            ))}
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
            Step 5 is the one everything hangs on. A consumer that finishes the work and then dies before acknowledging has <strong className="sd-strong">done the work and not recorded that it did</strong>, so the broker hands the same message to someone else. That is not a bug in the broker, it is the only safe thing it can do, and it is precisely why consumers have to be idempotent.
          </div>
        </div>

        {/* Failure flow */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">What Happens After A Consumer Pulls</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">Retries handle the transient; the dead letter queue handles the permanent</p>
            <svg viewBox="0 0 860 420" role="img" aria-label="A pulled message is processed; on success it is acknowledged and removed, on failure it is requeued until retries are exhausted, at which point it is routed to a dead letter queue." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Message outcomes after delivery</title>
              {flowArrow}
              <Node x={300} y={16} w={230} h={46} label="Message pulled" sub="hidden from other consumers" accent />
              <Edge d="M 415 62 L 415 108" />
              <Node x={300} y={112} w={230} h={46} label="Consumer processes it" />
              <Edge d="M 415 158 L 415 204" />
              <Node x={310} y={208} w={210} h={46} label="Processed OK?" accent />
              <Edge d="M 520 231 L 643 231" label="yes" lx={580} ly={221} />
              <Node x={650} y={208} w={190} h={46} label="Acknowledge" sub="broker removes it" />
              <Edge d="M 415 254 L 415 300" label="no" lx={432} ly={280} />
              <Node x={310} y={304} w={210} h={46} label="Retries exhausted?" accent />
              <Edge d="M 520 327 L 643 327" label="yes" lx={580} ly={317} />
              <Node x={650} y={304} w={190} h={46} label="Dead letter queue" sub="a human looks at it" />
              <Edge d="M 310 327 L 197 327" label="no" lx={253} ly={317} />
              <Node x={20} y={304} w={175} h={46} label="Requeue" sub="backoff and jitter" />
              <Edge d="M 107 304 C 107 200, 180 135, 297 135" />
            </svg>
          </div>

          <div className="sd-callout">
            The loop on the left is where outages get amplified. Every requeued message is load on a dependency that is <strong className="sd-strong">already failing</strong>, so retries need backoff, jitter, and a cap. Without the cap, the left-hand loop never reaches the dead letter queue and one message can circulate forever.
          </div>
        </div>

        {/* Burst absorption */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Queue Depth Absorbing A Burst</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">10,000 messages arrive in a second; consumers drain 1,000 a second</p>
            <svg viewBox="0 0 860 300" role="img" aria-label="Queue depth sits near zero, spikes to ten thousand messages when a burst arrives, then drains back to zero linearly over the following ten seconds." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Queue depth over time during a traffic burst</title>
              {[0, 5000, 10000].map((v) => (
                <g key={v}>
                  <line x1={105} y1={250 - v * 0.021} x2={830} y2={250 - v * 0.021} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
                  <text x={93} y={254 - v * 0.021} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{v}</text>
                </g>
              ))}
              {[0, 10, 20].map((t) => (
                <text key={t} x={105 + t * 35.75} y={270} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{t}</text>
              ))}
              <polygon points="105,250 248,250 284,40 641,250" fill="var(--sd-accent-wash)" />
              <polyline points="105,250 248,250 284,40 641,250 820,250" fill="none" stroke="var(--sd-accent)" strokeWidth="2" />
              <line x1={105} y1={250} x2={830} y2={250} stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <text x={467} y={290} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Time (seconds)</text>
              <text x={28} y={145} textAnchor="middle" transform="rotate(-90 28 145)" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Messages waiting</text>
              <text x={296} y={34} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-text)">burst arrives</text>
              <text x={420} y={108} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">drained at 1,000 a second</text>
            </svg>
          </div>

          <div className="sd-prose">
            <p>
              The spike is the queue doing its job: the processing layer never saw 10,000 requests per second, it saw its usual 1,000. But read the x-axis rather than the y-axis. The burst lasted one second and <strong className="sd-strong">the backlog took ten to clear</strong>, and every message near the top of that spike waited most of those ten seconds for work the producer had already called done.
            </p>
          </div>
        </div>

        {/* Backlogs */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">When A Backlog Stops Being Recoverable</h2>

          <div className="sd-prose">
            <p>
              Queue-based systems are <strong className="sd-strong">bimodal</strong>. In normal operation latency is low and the queue is nearly empty, so it is invisible. The moment arrival rate exceeds processing capacity the system enters a second mode that is far slower to leave than it was to enter, because draining a backlog needs capacity on top of the work still arriving.
            </p>
          </div>

          <div className="sd-callout sd-callout-accent">
            The arithmetic is unforgiving. An hour-long consumer outage needs roughly <strong className="sd-strong">double the normal capacity for another full hour</strong> just to catch up. A backlog ten times what the consumers can chew through takes on the order of <strong className="sd-strong">five hours</strong> to clear. The queue turned a one-hour dependency failure into a multi-hour outage of the thing it was supposed to protect.
          </div>

          <div className="sd-prose" style={{ marginTop: 16 }}>
            <p>
              Which is why the useful alarm is not depth, it is <strong className="sd-strong">the age of the oldest message</strong>, measured on first delivery attempt so retries don&rsquo;t mask it. Depth tells you how much is waiting; age tells you whether the delay has already passed what the business can tolerate, which is the thing anyone will actually be paged about.
            </p>
            <p style={{ marginTop: 12 }}>
              The mitigations all amount to refusing to treat every message as equally worth keeping: shed or sideline excess traffic to a spillover queue, drop messages older than their usefulness with a time-to-live, push back on producers once depth crosses a threshold, and isolate tenants so one customer&rsquo;s spike can&rsquo;t fill everyone&rsquo;s queue. The last one is worth stealing: rather than one shared queue, hash each customer onto a small subset of queues, so a flood lands on a few and the rest keep flowing.
            </p>
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            One sharp edge worth knowing by name: if processing slows past the <strong className="sd-strong">visibility timeout</strong>, the broker concludes the consumer died and delivers the same message again while the first is still working. Under load that multiplies work at the exact moment there is none to spare, which is why long-running consumers need to extend their claim as they go rather than hope to finish in time.
          </div>
        </div>

        {/* Patterns */}
        <div className="sd-section">
          <p className="sd-eyebrow">Reference</p>
          <h2 className="sd-h2">Five Shapes Beyond A Plain Work Queue</h2>

          <div className="sd-grid-2">
            {patterns.map((p) => (
              <div key={p.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-green)", marginBottom: 4 }}>{p.title}</div>
                <p className="sd-text-sm-tight">{p.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Broker comparison */}
        <div className="sd-section">
          <p className="sd-eyebrow">Reference</p>
          <h2 className="sd-h2">Which Broker Fits Which Job</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr>
                  {["System", "Best Fit", "What Defines It"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brokers.map((b, i) => (
                  <tr key={b.name}>
                    <td style={{ padding: "11px 14px", borderBottom: i < brokers.length - 1 ? "1px solid var(--sd-border)" : "none", fontWeight: 600, color: "var(--sd-text)" }}>{b.name}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < brokers.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-teal)" }}>{b.fit}</td>
                    <td style={{ padding: "11px 14px", borderBottom: i < brokers.length - 1 ? "1px solid var(--sd-border)" : "none", color: "var(--sd-muted)" }}>{b.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            The split that matters is not vendor, it is whether you want a <strong className="sd-strong">queue or a log</strong>. A queue hands each message to one worker and forgets it on acknowledgment. A log keeps the messages and lets each consumer track its own position, which is what makes replay possible, and replay is often the real reason Kafka shows up in an architecture.
          </div>
        </div>

        {/* When not to */}
        <div className="sd-section">
          <p className="sd-eyebrow">Counterpoint</p>
          <h2 className="sd-h2">When Not To Reach For One</h2>

          <div className="sd-callout sd-callout-green">
            Skip the queue when the caller genuinely needs an answer before it can continue, when the work must be validated before responding, when strict global ordering is required, or when nobody has committed to <strong className="sd-strong">monitoring the backlog</strong>. A direct call that fails loudly is easier to operate than an async pipeline whose failures are silent, and a queue nobody watches is a place for work to go missing quietly.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">Where The Rail Is Load-Bearing</h2>
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
            &ldquo;I bark the moment the doorbell rings and consider my job done. Whether anyone actually answers the door is a downstream consumer problem. Very at-least-once of me.&rdquo;
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">One Signup, Two Designs</h2>

          <div className="sd-callout sd-callout-accent">
            Think of a signup flow that sends a welcome email. Write down what happens to the user&rsquo;s signup request in a <strong className="sd-strong">synchronous</strong> design if the email service is down, versus in an <strong className="sd-strong">async</strong> design where sending the email is just published to a queue. Then push it one step further: the email service comes back after two hours. What does the user receive, and what would you have wanted the queue to do with a two-hour-old welcome email?
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
