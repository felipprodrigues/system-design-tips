"use client";

import {
  Breadcrumb,
  QuizCarousel,
  PageNav,
  PageLayout,
  MarkerList,
} from "@/components";
import type { QuizCard } from "@/components";
import { getLessonNav } from "@/lib/lessons";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "Why is cache invalidation considered a genuinely hard problem instead of just an implementation detail?",
    answers: ["Because it requires knowing, at the moment underlying data changes, every cached representation of that data that now needs to be updated or removed, across potentially many cache keys, layers, and services, while concurrent reads and writes keep happening. Getting this wrong doesn't crash the system, it silently serves incorrect data, which is often worse than an outage because nobody notices immediately."],
  },
  {
    question: "When would you choose write-back over write-through for a cache?",
    answers: ["When write latency matters more than the small risk of data loss, for example a high-throughput analytics counter or a system where losing the last few milliseconds of writes on a rare cache failure is acceptable. Write-through is preferred when correctness on every write matters more than raw write speed, like anything touching financial balances."],
  },
  {
    question: "A cache stampede is fixed with a lock and an avalanche is fixed with jitter. Both are lots of requests hitting the database at once, so why doesn't one fix cover both?",
    answers: ["They share a victim but not a shape. A stampede is many requests converging on one expired key, so there is a single key for everyone to queue behind and a lock can serialize the refill down to one query. An avalanche is thousands of unrelated keys expiring together because they were written together, so there is no shared key to lock on and no one request to elect. The only lever left is making sure they stop expiring at the same moment, by spreading the expiry times apart when they are written."],
  },
  {
    question: "Your cache is being hammered with requests for user IDs that don't exist. Why does the cache fail to absorb any of it?",
    answers: ["Because a cache only shields the database from questions it has already answered, and a lookup that finds nothing produces no result to store. Every one of those requests misses, reaches the database, finds nothing, and leaves the cache no wiser, so the next identical request repeats the trip. The fix is to store the empty answer as well, with a short expiry, so the second request stops at the cache and a record that genuinely appears later isn't hidden for long."],
  },
  {
    question: "One cache holds both sign-in sessions and cached query results. What goes wrong when memory fills up and a blanket eviction policy is in place?",
    answers: ["It evicts whichever entry looks least valuable by its rule, and sessions are perfectly eligible, so users get signed out to make room for query results that could have been recomputed for free. The usual answer is to let eviction consider only entries that carry an expiry, and to give an expiry only to the disposable data, so anything without a deadline is never a candidate for removal."],
  },
  {
    question: "Your cache comfortably exceeds the size of the working set, but the hit rate is still poor. What is worth investigating, and what is not?",
    answers: ["More memory is the one thing that will not help, since there is already room for everything hot. The likely causes are the eviction policy discarding the wrong entries, for example a large one-off scan pushing genuinely popular data out under a least-recently-used rule, or a bad choice of what to cache, since data that changes on nearly every read never survives long enough to accumulate hits."],
  },
];

const whyThisExists = [
  "Databases are slow relative to memory, and the same data (a user's profile, a product page, a popular post) often gets read far more often than it changes, recomputing or refetching it from scratch on every single read wastes capacity that a cache could save entirely.",
  "The moment you add a cache, you've created a second copy of the truth, and now you have to decide what happens when the original changes: does the cached copy update immediately, eventually, or does it just quietly go stale and serve wrong data until something notices.",
  "Phil Karlton's famous line, 'there are only two hard things in computer science: cache invalidation and naming things,' is not a joke about caching being finicky, it's a real acknowledgment that keeping a cache correct under concurrent reads and writes is a genuinely hard distributed systems problem, not an afterthought.",
];

const concept = [
  { name: "Cache-aside (lazy loading)", body: "The most common pattern: the application checks the cache first, *on a miss it reads from the database*, then writes the result into the cache for next time. Reads are fast after the first miss, but *the cache and database can drift out of sync* if the underlying data changes without going through this same path." },
  { name: "Write-through", body: "Every write goes to the cache and the database together, synchronously, before the write is considered done. This keeps the cache *always consistent* with the database, at the cost of every write now paying *the latency of two systems instead of one*." },
  { name: "Write-back (write-behind)", body: "A write goes to the cache immediately and is considered done, then gets flushed to the database asynchronously later. This makes writes fast, but *risks data loss* if the cache fails before the flush happens, and needs careful design to avoid it." },
  { name: "TTL (time to live)", body: "The simplest invalidation strategy: every cached entry expires automatically after a set duration, forcing a fresh read from the source of truth. It doesn't require any explicit invalidation logic, but it means the cache can serve *stale data for up to the full TTL window*, and picking that window is itself a trade-off between staleness and load on the database." },
  { name: "Explicit invalidation", body: "The application actively deletes or updates a cache entry *the moment the underlying data changes*, e.g. a user edits their profile, and that write path also deletes the cached profile so the next read is forced to refetch. This gives tighter consistency than TTL alone but requires the application to correctly find and invalidate every cache entry that could be affected by a given write, which *gets hard fast* as relationships between cached data grow. The usual answer is to track, alongside the cache, which cached entries depend on which underlying thing, so changing that thing can invalidate all of them in one step instead of hoping every write path remembered." },
  { name: "Cache stampede (thundering herd)", body: "Happens when a popular cached entry expires and a burst of concurrent requests *all miss the cache at the same instant*, all hammering the database simultaneously trying to refill it. Mitigations include locking so only one request refills while others wait, or staggering TTLs so not everything expires at the same second." },
  { name: "Eviction policy", body: "Decides what gets removed *when the cache is full, not just when data goes stale*. LRU (least recently used) is the most common default, evicting whatever hasn't been accessed in the longest time, on the assumption that recently used data is likely to be used again soon. When that assumption fails, counting how often an entry is used, with older activity fading over time, keeps genuinely popular data resident while letting a one-off scan pass through without flushing everything." },
  { name: "Cache placement", body: "A cache can live in the browser (HTTP caching headers), at the CDN edge, in front of an application server (like Redis or Memcached), or even inside a single process's memory. Each layer trades *how close it is against how much it can hold* and how many different clients can share it." },
  { name: "Choosing what to cache", body: "Matters as much as how: caching data that's *read far more often than it's written*, and that can tolerate at least some staleness, gives the best return. Caching data that changes on nearly every read, or where staleness is unacceptable (like real-time account balances), often isn't worth the complexity a cache adds." },
  { name: "Cache penetration", body: "Requests that ask for something *which never existed*, like a probe for user ID -1 or a stream of invented identifiers. Every one misses the cache, reaches the database, finds nothing, and writes nothing back, so the next identical request repeats the whole trip. Unlike a stampede this can be driven deliberately, and *the fix is counter-intuitive*: cache the \"not found\" answer too, with a short expiry, so the second request stops at the cache." },
  { name: "Avalanche vs breakdown", body: "Two shapes of the same problem. Breakdown is one popular key expiring and sending a focused burst at the database. Avalanche is thousands of unrelated keys, all written at the same moment by a restart or a nightly job, expiring within the same second and shifting their combined traffic at once. *Locking fixes the first*, because there is one key to queue behind. Only *spreading expiry times apart* fixes the second." },
  { name: "Protecting what you cannot lose", body: "When one cache holds both disposable data and data that must survive, like sign-in sessions alongside cached query results, a blanket eviction policy will *happily throw the sessions away* to make room. The usual answer is to let eviction consider only entries that carry an expiry, and give an expiry only to the disposable ones, so anything without a deadline is *never a candidate for removal*." },
];

const terms = [
  { title: "Cache-aside", def: "A pattern where the application checks the cache first, falls back to the database on a miss, and populates the cache afterward, the most common general-purpose caching pattern." },
  { title: "TTL (time to live)", def: "A duration after which a cached entry automatically expires and must be refetched from the source of truth, the simplest and most common invalidation mechanism." },
  { title: "Cache stampede", def: "A surge of simultaneous requests all missing the cache at once (often right after a popular entry expires) and overwhelming the database trying to refill it." },
  { title: "Eviction policy", def: "The rule that decides which entries get removed when a cache reaches capacity, most commonly LRU (least recently used)." },
  { title: "Write-through cache", def: "A caching strategy where writes update the cache and the underlying database synchronously, keeping them always consistent at the cost of write latency." },
  { title: "Stale data", def: "Cached data that no longer matches the current state of the source of truth, the central risk every invalidation strategy is trying to manage." },
  { title: "Cache penetration", def: "Repeated requests for data that does not exist anywhere, which miss the cache every time and reach the database every time, because there is no result to store." },
  { title: "Cache avalanche", def: "Many cached entries expiring at nearly the same moment, usually because they were all written together, sending their combined read traffic at the database at once." },
];

const seenInTheWild = [
  "Reddit and Twitter/X use Memcached and Redis extensively to cache hot content (popular posts, feeds) so millions of reads don't hit the database directly for the same rapidly re-requested data.",
  "CDNs like Cloudflare and Akamai apply TTL-based caching to static assets at the edge, letting a browser or edge node serve a cached copy for minutes to days without contacting the origin server at all.",
  "Facebook's TAO caching layer sits in front of its social graph database specifically to absorb the enormous read-to-write ratio of social data, most content is read far more often than it's ever edited.",
  "Amazon's product pages use aggressive caching with careful invalidation on price and inventory changes, since showing a stale price is a real business problem, illustrating how the choice of TTL versus explicit invalidation depends on how costly staleness actually is.",
];

const keyPoints = [
  "Every caching strategy answers the same question differently: *how does the cache learn the source of truth changed*, and what does a reader see before it does.",
  "*Cache-aside is the default pattern*: check cache, miss, read database, populate cache.",
  "Write-through keeps cache and database always in sync at the cost of write latency; write-back is fast but *risks losing data* before it's flushed.",
  "TTL is the simplest invalidation approach but trades correctness for simplicity, entries can be *stale for up to the full TTL window*.",
  "Cache stampede is a real failure mode when a hot entry expires and many requests hit the database at once, mitigated with *locking or staggered expiration*.",
  "Cache what's *read far more than it's written* and can tolerate some staleness, that's where caching pays off the most.",
];

const commonMistakes = [
  "Adding a cache without a real invalidation plan, treating 'it'll expire eventually' as sufficient for data where staleness actually matters.",
  "Using a TTL so long that users see meaningfully outdated data, or so short that the cache barely reduces database load at all, without deliberately choosing the trade-off.",
  "Not accounting for cache stampede, letting a single hot key's expiration cause a burst of simultaneous database load right when the system can least afford it.",
  "Caching data that changes on nearly every read, adding cache complexity and a consistency risk for a hit rate that's barely better than not caching at all.",
  "Forgetting that a cache is a second copy of the truth, and every code path that writes the underlying data needs to also handle the cache, not just the 'main' write path.",
  "Never caching the answer 'this does not exist', so a stream of requests for invented identifiers passes straight through the cache to the database every single time.",
];

const writeStrategies = [
  {
    label: "Write-through",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    points: [
      "Write goes to cache and database together, synchronously",
      "Cache and database always agree",
      "Every write pays the cost of two systems",
    ],
  },
  {
    label: "Write-back",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    points: [
      "Write goes to cache immediately, database updated later",
      "Writes are fast",
      "Risk of data loss if the cache fails before flushing",
    ],
  },
];

const cacheAsideSteps = [
  { name: "Check cache", sub: "is the data there?" },
  { name: "Cache miss", sub: "not found or expired" },
  { name: "Read from database", sub: "the source of truth" },
  { name: "Write result into cache", sub: "for next time" },
  { name: "Return to caller", sub: "future reads hit the cache" },
];

/* Lifelines shared by both stampede diagrams. */
const lanes = [
  { label: "Request 1", x: 95 },
  { label: "Request 2..N", x: 315 },
  { label: "Cache", x: 545, accent: true },
  { label: "Database", x: 760, accent: true },
];

function Lifelines({ bottom }: { bottom: number }) {
  return (
    <>
      {lanes.map((l) => (
        <g key={l.label}>
          <rect x={l.x - 78} y={10} width={156} height={38} rx={8} fill="var(--sd-surface2)" stroke={l.accent ? "var(--sd-teal)" : "var(--sd-border-strong)"} strokeWidth="1.5" />
          <text x={l.x} y={34} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="12" fontWeight="700" fill="var(--sd-text)">{l.label}</text>
          <line x1={l.x} y1={48} x2={l.x} y2={bottom} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
        </g>
      ))}
    </>
  );
}

function Msg({ from, to, y, label }: { from: number; to: number; y: number; label: string }) {
  const dir = to > from ? -6 : 6;
  return (
    <g>
      <line x1={from} y1={y} x2={to + dir} y2={y} stroke="var(--sd-border-strong)" strokeWidth="1.5" markerEnd="url(#sd-seq-arrow)" />
      <text x={(from + to) / 2} y={y - 8} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">{label}</text>
    </g>
  );
}

const seqArrow = (
  <defs>
    <marker id="sd-seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)" />
    </marker>
  </defs>
);

export default function Lesson09() {
  const nav = getLessonNav("09-caching-strategies");

  return (
    <>
      <Breadcrumb section={nav.sectionTitle} lesson="Caching Strategies & Cache Invalidation" />

      <PageLayout>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--sd-font-mono)", textTransform: "uppercase", color: "var(--sd-accent)", marginBottom: 10 }}>
          Lesson {nav.lessonNumber} · {nav.sectionTitle}
        </p>
        <h1 className="sd-h1">Caching Strategies &amp; Cache Invalidation</h1>
        <p className="sd-lede">
          A second copy of the truth, and every way of keeping it honest.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              A cache only helps if it&rsquo;s <strong className="sd-strong">usually right and cheap to check</strong>, and every caching strategy is really a different answer to one question: when the underlying data changes, how does the cache find out, and what does a reader see in the meantime.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">Why The Hardest Part Is Not The Caching</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">A Cheat Sheet Of Your Bank Balance</h2>

          <div className="sd-prose">
            <p>
              A cache is like keeping a printed cheat sheet of your bank balance instead of calling the bank every time you want to check it. It&rsquo;s fast, you glance at the paper instead of waiting on hold. But the moment money moves in or out of the actual account, <strong className="sd-strong">that paper is wrong until you update it</strong>.
            </p>
            <p style={{ marginTop: 12 }}>
              Do you update the paper the instant a transaction happens (<strong className="sd-strong">write-through</strong>), let it happen in the background a moment later (<strong className="sd-strong">write-back</strong>), or just throw the paper away after an hour and force a fresh call next time you need it (<strong className="sd-strong">TTL</strong>)? Each choice trades a bit of speed for a bit of risk of looking at stale numbers.
            </p>
          </div>
        </div>

        {/* The concept */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">The Pieces That Make Up A Caching Decision</h2>

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
          <h2 className="sd-h2">The Vocabulary Of A Second Copy</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Write-through vs write-back */}
        <div className="sd-section">
          <p className="sd-eyebrow">Worked Example</p>
          <h2 className="sd-h2">Write-Through vs Write-Back</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: writeStrategies[0].wash, color: writeStrategies[0].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {writeStrategies[0].label}
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {writeStrategies[0].points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, color: writeStrategies[0].color, fontSize: 11, lineHeight: 1.7 }}>●</span>
                    <p className="sd-text-sm-tight">{pt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
            </div>

            <div style={{ background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: writeStrategies[1].wash, color: writeStrategies[1].color, padding: "10px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {writeStrategies[1].label}
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {writeStrategies[1].points.map((pt) => (
                  <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, color: writeStrategies[1].color, fontSize: 11, lineHeight: 1.7 }}>●</span>
                    <p className="sd-text-sm-tight">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cache-aside read path */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Cache-Aside On A Read</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, alignItems: "stretch" }}>
            {cacheAsideSteps.map((step, i) => (
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
            Step 4 is the one that bites. Nothing here tells the cache when the database changes <strong className="sd-strong">through some other path</strong>, so a write that skips this flow leaves the entry stale until its TTL runs out or something explicitly deletes it.
          </div>
        </div>

        {/* Stampede */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">When The Cache Stops Absorbing Load</h2>

          <p className="sd-eyebrow-sub">Stampede: a popular key expires</p>

          <p className="sd-eyebrow-sub" style={{ color: "var(--sd-danger)" }}>Unprotected refill</p>
          <div className="sd-figure" style={{ overflowX: "auto", marginBottom: 20 }}>
            <svg viewBox="0 0 860 250" role="img" aria-label="Without a lock, request one and every other concurrent request all miss the expired entry and each sends its own identical query to the database." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Cache stampede without a refill lock</title>
              {seqArrow}
              <Lifelines bottom={230} />
              <Msg from={95} to={545} y={90} label="read (miss, expired)" />
              <Msg from={315} to={545} y={130} label="read (miss too)" />
              <Msg from={545} to={760} y={170} label="N identical queries, all at once" />
              <Msg from={760} to={545} y={210} label="N identical results" />
            </svg>
          </div>

          <p className="sd-eyebrow-sub" style={{ color: "var(--sd-green)" }}>Locked refill</p>
          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <svg viewBox="0 0 860 410" role="img" aria-label="With a refill lock, request one acquires the lock and issues a single query while every other request waits, then all of them are served the one fresh cached value." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Cache stampede prevented by a refill lock</title>
              {seqArrow}
              <Lifelines bottom={390} />
              <Msg from={95} to={545} y={90} label="read (miss, expired)" />
              <Msg from={95} to={545} y={130} label="acquire refill lock" />
              <Msg from={315} to={545} y={170} label="read (miss too)" />
              <Msg from={545} to={315} y={210} label="wait, refill in progress" />
              <Msg from={545} to={760} y={250} label="single query to refill" />
              <Msg from={760} to={545} y={290} label="fresh value" />
              <text x={545} y={324} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="11" fill="var(--sd-muted)">write value, release lock</text>
              <Msg from={545} to={315} y={370} label="serve fresh cached value" />
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent" style={{ marginTop: 16 }}>
            The database load difference is the whole point: <strong className="sd-strong">N queries versus one</strong>, at the exact moment a popular key expires. A lock works here because there is a single key for everyone to queue behind.
          </div>

          <p className="sd-eyebrow-sub" style={{ marginTop: 24 }}>Penetration: a key that never existed</p>

          <div className="sd-prose">
            <p>
              A stampede needs a real entry to expire. <strong className="sd-strong">Penetration needs nothing to exist at all.</strong> Requests arrive for an identifier that was never in the database, perhaps a probe for user ID -1 or a stream of invented IDs. Each one misses the cache, reaches the database, finds nothing, and writes nothing back, so the cache never learns and the next identical request makes the same trip.
            </p>
            <p style={{ marginTop: 12 }}>
              That is the part worth sitting with: a cache only shields the database from questions it has already answered, and &ldquo;nothing found&rdquo; never gets recorded as an answer. The fix is to record it anyway, storing the empty result with a short expiry so the second request stops at the cache. Short, because the record might genuinely appear later.
            </p>
          </div>

          <div className="sd-callout">
            Unlike a stampede, which is an unlucky coincidence of timing, penetration can be <strong className="sd-strong">driven deliberately</strong>. Anyone who can send requests can pick identifiers that will never hit, which makes it a denial-of-service technique as much as a performance bug.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">Where The Read-To-Write Ratio Pays</h2>
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
            &ldquo;I keep a mental cache of which humans give treats on command. Never invalidated it once. That&rsquo;s why I still try the trick on the mail carrier.&rdquo;
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Two Ways To Keep It Fresh</h2>

          <div className="sd-callout sd-callout-accent">
            Pick a piece of data in an app you use that changes rarely but is read constantly, like a user&rsquo;s display name or a product&rsquo;s description. Sketch out, in a sentence each, how you&rsquo;d cache it with a <strong className="sd-strong">TTL</strong> versus with <strong className="sd-strong">explicit invalidation on write</strong>, and name one scenario where each approach would show a user outdated information.
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
