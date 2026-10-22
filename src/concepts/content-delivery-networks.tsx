"use client";

import {
  ConceptHeader,
  LearnedToggle,
  MarkerList,
  QuizCarousel,
  Term,
} from "@/components";
import type { QuizCard } from "@/components";
import { hl } from "@/lib/highlight";

const quizCards: QuizCard[] = [
  {
    question: "Why does a CDN help almost nothing for a personalized dashboard endpoint, even if the endpoint is popular?",
    answers: ["Caching only helps when many requests can be served the same cached response. A personalized dashboard returns different data for every user, and often different data on every request, so there is no shared content for the edge node to have cached from a previous request. Nearly every request still has to be forwarded to the origin, and the CDN adds a hop with no cache hit to show for it."],
  },
  {
    question: "What's the trade-off between origin pull and origin push, and when would you choose push?",
    answers: ["Origin pull requires no upfront work but means the first request for any piece of content in a given region pays full origin latency before it is cached. Origin push avoids that cold-start cost by proactively uploading content everywhere ahead of time, which is worth it when you already know content will be broadly and immediately popular, like a scheduled major software release, but wastes storage and bandwidth pushing content to regions that may never request it."],
  },
  {
    question: "Why do deployed static assets commonly use content-hashed filenames instead of a fixed name with a short TTL?",
    answers: ["A fixed filename with a long TTL risks serving a stale, outdated version after a deploy until the TTL expires, while a very short TTL sacrifices most of the caching benefit. A content-hashed filename sidesteps the trade-off entirely: any change to the file's contents produces a brand-new filename, so old cached copies simply become unreferenced and the new file is fetched fresh exactly once, letting the CDN safely use an effectively infinite TTL."],
  },
  {
    question: "A CDN absorbs 95% of your traffic at the edge. Why is that still not a capacity plan for the origin?",
    answers: ["The 95% is the cacheable share, and it is absorbed because those requests are identical. The remaining 5% is the uncacheable traffic, logins, checkouts, searches, writes, and that share does not shrink when a spike arrives, it grows with it. A traffic event that multiplies total requests by ten also multiplies the uncacheable requests by ten, and those all land on the origin at full force. The CDN changes the constant in front of origin load, not the shape of the curve."],
  },
  {
    question: "Two edge nodes in the same CDN serve the same URL with different content for an hour. Nothing is broken. What happened?",
    answers: ["Each edge node caches independently and its TTL starts when that node fetched the object, not when the object was published. If one region pulled the file before a deploy and another pulled it after, they hold different versions and will keep serving them until each one's own TTL expires. This is why a deploy is not a cache invalidation: either you purge explicitly, or you change the URL so the old entry is never requested again."],
  },
];

const whyThisExists = [
  "A single origin server, however powerful, is physically far from most of its users, and the speed of light itself puts a floor on how fast a round trip to a distant server can be. No amount of server tuning shortens the distance.",
  "A popular video or a viral image generates an enormous number of near-identical requests for the exact same bytes, and serving every one of them from one origin spends bandwidth and compute on work the origin already did once.",
  "A single point of origin is also a single point of failure and a single bottleneck under load. A launch, a live event, or an attack aimed at that one server can take down every user's experience at once.",
];

const concept = [
  {
    name: "A network of edge servers, not one server",
    body: (
      <>
        A CDN is a distributed network of edge servers, also called{" "}
        <Term label="points of presence, or PoPs">
          <strong className="sd-strong">Point of presence.</strong> One of a CDN&rsquo;s physical locations: a rack of caching servers in a data centre or inside an ISP&rsquo;s network, holding copies of content for the users around it. A provider&rsquo;s PoP count and placement is most of what makes one CDN faster than another in a given country.
        </Term>
        , spread across many geographic regions. Each one holds cached copies of content close to the users in that region, so a request is served from a nearby node instead of crossing an ocean to the origin.
      </>
    ),
  },
  { name: "Getting to the nearest edge is the network's job", body: "You never pick a PoP, and the URL never changes. Two mechanisms do it for you: *DNS that answers with a different address depending on where the question came from*, and anycast, where many PoPs announce the same IP and the network delivers to whichever is closest. It is why the same link loads from a machine in Lisbon for one reader and one in Lima for another." },
  { name: "Origin pull, or lazy caching", body: "The CDN does not have the content until the first request for it arrives at an edge node. That first request is *forwarded to the origin*, the response is cached at the edge, and every subsequent request in that region is served from the cache until it expires. No upfront setup, but the first user in each region pays full origin latency." },
  { name: "Origin push, or pre-loading", body: "The origin proactively uploads content to edge nodes ahead of any request, so *every user gets a cached response from the very first request*. This suits content you know in advance will be popular everywhere, like a scheduled major release, at the cost of pushing data to regions that may never ask for it." },
  { name: "Static assets are the best case", body: "Images, CSS, JavaScript bundles, fonts and downloadable files are the CDN's ideal workload: the exact same bytes are correct for every single user, so *one cached copy serves unlimited requests* until the content itself changes, giving a near-perfect cache hit ratio." },
  { name: "Video is the same idea at a larger scale", body: "Video files are large, popular ones are requested repeatedly by huge numbers of viewers, and CDNs *split video into small chunks* so a player requests just the next few seconds from the nearest edge. That also lets quality adapt mid-stream without re-fetching the whole file." },
  { name: "Personalized and dynamic responses are the worst case", body: "An account dashboard, a search result unique to one query, an authenticated API call: the response depends on who is asking and what they asked, so there is *effectively nothing shared to cache*. Most such requests still reach the origin, meaning the CDN adds a network hop without adding a cache hit." },
  { name: "TTL and invalidation matter just as much here", body: "A long TTL means a stale asset, an outdated CSS file after a deploy, can keep being served for a while. This is why deployed static assets are given *content-hashed filenames*: a changed file becomes a genuinely new URL, so it can never collide with a stale cached entry." },
  { name: "The edge is also a shield", body: "Because edge nodes absorb the vast majority of repeat requests, *only a small fraction of real traffic ever reaches the origin*. That both reduces origin load during normal spikes and blunts many denial-of-service patterns, since the flood is spread across a global network rather than aimed at one machine." },
  { name: "Edge compute is a thin slice, not a backend", body: "Some CDNs run small pieces of application logic on the edge node itself: A/B test routing, header rewriting, redirects, cheap authorization checks. It is genuinely useful for *per-request work that would be silly to send to the origin*, but it is a narrow slice of logic, not a replacement for real personalized backend processing." },
];

const anatomy = [
  { title: "Edge node (PoP)", def: "The server near the user that answers the request. How many there are, and how close they are, is most of what you are buying." },
  { title: "Origin", def: "The one server or cluster that holds the authoritative copy. The edge is a copy of it, never the source of truth." },
  { title: "Cache key", def: "What an edge node considers 'the same request'. Usually the URL, optionally plus specific headers, and getting it wrong caches one user's response for another." },
  { title: "TTL", def: "How long an edge node may serve its copy before re-checking the origin. The dial between freshness and hit ratio." },
  { title: "Cache hit ratio", def: "The fraction of requests answered from the edge rather than forwarded. The single number that tells you how much the CDN is actually doing." },
  { title: "Invalidation", def: "The way content is removed before its TTL expires: an explicit purge, or a new URL. Both work, only one is instant everywhere." },
];

const terms = [
  { title: "Edge server / point of presence (PoP)", def: "A CDN server located geographically close to end users, holding cached copies of content so requests do not need to travel all the way to the origin." },
  { title: "Origin pull", def: "A caching mode where content is fetched from the origin and cached at the edge only after the first real request for it arrives, requiring no upfront upload." },
  { title: "Origin push", def: "A caching mode where content is proactively uploaded to edge nodes ahead of demand, guaranteeing fast responses from the very first request in every region." },
  { title: "Cache hit ratio", def: "The fraction of requests an edge node serves directly from its cache rather than forwarding to the origin, the key metric for how much load a CDN is absorbing." },
  { title: "Content-hashed filename", def: "A filename that includes a hash of the file's contents, so any change produces a new filename and therefore a new cache entry, avoiding stale-cache problems after a deploy." },
  { title: "Edge compute", def: "Small pieces of application logic executed directly on a CDN's edge nodes rather than at the origin, used for lightweight per-request work like routing or header rewriting." },
  { title: "Anycast", def: "The routing trick that makes one IP address resolve to whichever PoP is nearest the user. It is how a single URL reaches a different machine depending on where you ask from." },
  { title: "Cold cache", def: "An edge node that does not yet hold a requested object, so the request becomes a miss and pays the full trip to the origin. Every region starts cold under origin pull." },
];

const modeCompare = [
  {
    label: "Origin pull",
    color: "var(--sd-amber)",
    wash: "rgba(106, 118, 163,0.12)",
    points: [
      "The edge fetches from the origin on the first request, then caches",
      "Nothing to configure and nothing to upload ahead of time",
      "Content that is never requested in a region is never stored there",
    ],
    example: {
      title: "A new image, 40 regions",
      trace: [
        ["requests that miss and hit origin", "40"],
        ["requests served from the edge", "all the rest"],
        ["bytes pushed in advance", "0"],
      ],
      breaks: "One user per region eats the full origin round trip, and if your launch traffic is one simultaneous spike, those misses all land on the origin at the same instant. It is the thundering herd, spread across the map.",
    },
  },
  {
    label: "Origin push",
    color: "var(--sd-teal)",
    wash: "rgba(127, 147, 242,0.12)",
    points: [
      "The origin uploads to edge nodes before any user asks",
      "The first request in every region is already a cache hit",
      "Storage and transfer are paid whether the content is wanted or not",
    ],
    example: {
      title: "A new image, 40 regions",
      trace: [
        ["requests that miss and hit origin", "0"],
        ["requests served from the edge", "all of them"],
        ["bytes pushed in advance", "40 copies"],
      ],
      breaks: "You paid to put the file in 40 places before knowing whether 38 of them would ever want it. Worth it for a scheduled release everyone downloads at once, wasteful for a long tail of user uploads.",
    },
  },
];

const goodFit = [
  "Static assets: images, CSS, JavaScript bundles, fonts",
  "Video and audio streaming, chunked and cached per segment",
  "Content identical for every viewer, like a public landing page",
  "Large downloads where bandwidth cost, not just latency, is the problem",
];

const poorFit = [
  "Personalized dashboards and account pages, unique per user",
  "Search results and query-specific API responses",
  "Anything requiring fresh, per-request authentication or state",
  "Writes, which have to reach the origin by definition",
];

const cacheability = [
  { kind: "Versioned JS/CSS bundle", key: "URL alone", ttl: "A year, immutable", invalidate: "New hash, new URL", note: "The ideal case: the URL changes whenever the bytes do" },
  { kind: "Product image", key: "URL alone", ttl: "Days to weeks", invalidate: "Purge, or a version in the path", note: "Rarely changes, read constantly, identical for everyone" },
  { kind: "Video segment", key: "URL alone", ttl: "Effectively forever", invalidate: "Never; segments are immutable", note: "Chunked so a viewer only pulls the seconds they watch" },
  { kind: "Public landing page", key: "URL, maybe locale", ttl: "Minutes", invalidate: "Purge on publish", note: "Same for everyone, but has to reflect edits quickly" },
  { kind: "Logged-in dashboard", key: "Would need the user", ttl: "Not cached", invalidate: "N/A", note: "No two responses are alike; the edge is pure overhead" },
  { kind: "Search results", key: "Would need the query", ttl: "Seconds, if at all", invalidate: "N/A", note: "The long tail of queries is never requested twice" },
];

const seenInTheWild = [
  "Cloudflare and Akamai run global CDN networks serving a large share of the web's static assets, images and even API traffic for millions of sites, absorbing traffic that would otherwise all hit individual origin servers. Akamai alone reports more than 4,100 edge locations across 120 or so countries, which is the scale the word 'nearby' is doing work at.",
  "Netflix built its own purpose-built CDN, Open Connect, placing caching appliances directly inside ISP networks so video travels the shortest possible path to viewers, a scale problem generic CDNs were not built to solve as cheaply.",
  "YouTube relies on Google's global edge infrastructure to cache and serve video chunks close to viewers worldwide, letting a video uploaded once be watched by millions without every view routing back to one data center.",
  "Amazon CloudFront and Fastly cache static assets and accelerate some dynamic traffic for e-commerce and media sites, cutting page load time by answering from an edge location near the shopper.",
];

const keyPoints = [
  "A CDN reduces latency and origin load by caching content at edge nodes *physically close to users*.",
  "Origin pull caches lazily on first request; origin push uploads ahead of demand for a *guaranteed fast first request*.",
  "Static assets and video benefit enormously because *the same bytes are correct for every viewer*, giving near-perfect hit ratios.",
  "Personalized or dynamic content barely benefits, since a response unique to one user *has nothing to share with the next request*.",
  "TTL and invalidation still matter at the edge, and *content-hashed filenames* are the standard fix for stale assets after a deploy.",
  "CDNs absorb traffic spikes and blunt some attack traffic simply by *serving repeat requests before they reach the origin*.",
  "Every edge node caches independently, so *there is no single moment* when a deploy becomes visible everywhere.",
  "Edge compute handles cheap per-request logic at the PoP, but it is *not a place to move your backend*.",
];

const commonMistakes = [
  "Assuming a CDN speeds up everything, then being surprised when a personalized API endpoint sees no improvement after being put behind one.",
  "Setting a long TTL on assets without content-hashed filenames, so users keep getting a stale, broken version of a file after a deploy until the TTL finally expires.",
  "Treating origin pull and origin push as interchangeable, when push is only worth its upfront cost for content you are confident will actually be requested broadly.",
  "Forgetting that the first request in each region under origin pull still pays full origin latency, and expecting a brand-new asset to be instantly fast everywhere.",
  "Relying on a CDN instead of origin capacity planning, when a spike in genuinely dynamic, uncacheable traffic still arrives at the origin at full force.",
  "Caching a response that varied on a header or a cookie without putting that in the cache key, which serves one user's content to the next user who asks.",
];

const furtherReading = [
  {
    title: "INDEX 0",
    source: "Practice coach",
    note: "A free, local-first coach for DSA, mock interviews and system design. Zero nudges you toward the answer instead of handing it over, and nothing leaves your machine.",
    href: "https://www.index-0.in/",
  },
  {
    title: "What is a CDN?",
    source: "Cloudflare Learning Center",
    note: "The reference explainer from a company that runs one: performance, reliability, security and bandwidth cost, and why a CDN is not the same thing as web hosting.",
    href: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/",
  },
  {
    title: "What is a CDN?",
    source: "Akamai glossary",
    note: "The same question answered by the oldest CDN operator: origin, edge and DNS as three cooperating roles, plus what accelerating uncacheable dynamic content actually means.",
    href: "https://www.akamai.com/glossary/what-is-a-cdn",
  },
  {
    title: "Open Connect",
    source: "Netflix",
    note: "What it looks like when the CDN is the product: appliances placed inside ISP networks, because a generic edge was not close enough or cheap enough at that scale.",
    href: "https://openconnect.netflix.com/",
  },
];

/* Shared arrowhead for the flow diagram. */
const flowArrow = (
  <defs>
    <marker id="sd-cdn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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

function Edge({ d, label, lx, ly, dim }: { d: string; label?: string; lx?: number; ly?: number; dim?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={dim ? "var(--sd-border)" : "var(--sd-border-strong)"} strokeWidth="1.5" strokeDasharray={dim ? "4 4" : undefined} markerEnd="url(#sd-cdn-arrow)" />
      {label ? (
        <text x={lx} y={ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">{label}</text>
      ) : null}
    </g>
  );
}

function ModeCard({ item }: { item: (typeof modeCompare)[number] }) {
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
          One file, 40 edge regions
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

function FitColumn({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className="sd-card">
      <div style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color, marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, color, fontSize: 11, lineHeight: 1.7 }}>●</span>
            <p className="sd-text-sm-tight">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Concept07ContentDeliveryNetworks() {

  return (
    <>

          <ConceptHeader slug="content-delivery-networks" />
        <LearnedToggle />
        <p className="sd-lede">
          Why moving the bytes closer works wonders for content everyone shares, and almost nothing for content nobody shares.
        </p>

        {/* Big idea */}
        <div className="sd-section">
          <p className="sd-eyebrow">Big Idea</p>
          <div className="sd-prose" style={{ fontSize: 16 }}>
            <p>
              A CDN keeps copies of your content sitting near the people who ask for it, so distance stops being the thing that decides how fast your site feels. Whether that pays off at all comes down to <strong className="sd-strong">how many people one copy can answer</strong>: enormously, when the bytes are identical for everybody, and close to nothing when every request deserves a different reply.
            </p>
          </div>
        </div>

        {/* Why this exists */}
        <div className="sd-section">
          <p className="sd-eyebrow">Why This Exists</p>
          <h2 className="sd-h2">One Server Cannot Be Near Everybody</h2>
          <MarkerList mark="▸" color="var(--sd-accent)" items={whyThisExists} />
        </div>

        {/* Think of it like */}
        <div className="sd-section">
          <p className="sd-eyebrow">Think Of It Like</p>
          <h2 className="sd-h2">One Press, Or A Shop In Every Town</h2>

          <div className="sd-prose">
            <p>
              Picture a single printing press serving an entire country. For a poster everybody wants, that is an absurd arrangement: each reader mails in an order, the press runs off one more identical sheet, and the post carries it back across the country. Send the master to a print shop in every town instead and the whole problem dissolves, because <strong className="sd-strong">one plate can serve a queue of any length</strong> and nobody is waiting on the mail.
            </p>
            <p style={{ marginTop: 12 }}>
              Now make it a certificate with the reader&rsquo;s own name on it. No local shop can print what it has <strong className="sd-strong">never seen and could not have guessed</strong>, so every order travels back to the one press that holds the records. The shops are still there, still close by, still cheap to run, and for this job they contribute nothing except one more counter to queue at on the way.
            </p>
          </div>
        </div>

        {/* Origin pull flow */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">Origin Pull: One Miss, Then Hits</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">The first user in a region pays for everyone who follows</p>
            <svg viewBox="0 0 860 300" role="img" aria-label="The first user in a region requests content from the nearby CDN edge node, which misses and fetches it from the distant origin server, caching the response. A later user in the same region requests the same content and is served from the edge cache without the origin being involved." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Origin pull: cache miss, then cache hit</title>
              {flowArrow}
              <Node x={20} y={36} w={180} h={56} label="User" sub="Region A, first" accent />
              <Node x={350} y={108} w={180} h={72} label="CDN edge node" sub="Region A PoP" accent />
              <Node x={668} y={116} w={172} h={56} label="Origin server" sub="one region, far away" />
              <Node x={20} y={198} w={180} h={56} label="User" sub="Region A, minutes later" accent />

              <Edge d="M 200 64 L 347 110" label="1 · request, miss" lx={268} ly={76} />
              <Edge d="M 530 144 L 661 144" label="2 · fetch and cache" lx={596} ly={132} />
              <Edge d="M 200 226 L 347 178" label="3 · request, hit" lx={268} ly={222} />
              <Edge d="M 530 170 L 661 206" dim />
              <text x={700} y={228} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">origin never hears</text>
              <text x={700} y={244} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">about request 3</text>
            </svg>
          </div>

          <div className="sd-callout sd-callout-accent">
            Everything good about a CDN lives in the gap between steps 1 and 3. Step 1 is <strong className="sd-strong">the full price</strong>, paid once per region per object. Step 3 is what you actually bought, and the more times it repeats before the{" "}
            <Term label="TTL">
              <strong className="sd-strong">Time to live.</strong> How long an edge node may keep serving its cached copy before it has to go back to the origin and re-check. A longer TTL means more requests answered locally and a higher chance of serving something out of date; a shorter one is the reverse. It is the one dial that trades freshness against hit ratio.
            </Term>{" "}
            expires, the better the deal was.
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
            The cache key is the piece people underthink. It decides <strong className="sd-strong">which requests count as the same request</strong>, and a key that ignores something the response actually varied on, a cookie, an Accept-Language header, an auth token, does not produce a slow site. It produces one user being served another user&rsquo;s page.
          </div>
        </div>

        {/* The concept */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Concept</p>
          <h2 className="sd-h2">How The Edge Actually Works</h2>

          <div className="sd-stack">
            {concept.map((step, i) => (
              <div key={step.name} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--sd-surface2)", border: "1px solid var(--sd-border)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(76, 110, 245,0.15)", color: "var(--sd-accent)", fontFamily: "var(--sd-font-mono)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-text)", marginBottom: 3 }}>{step.name}</div>
                  <p className="sd-text-sm-tight">{typeof step.body === "string" ? hl(step.body) : step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key terms */}
        <div className="sd-section">
          <p className="sd-eyebrow">Key Terms</p>
          <h2 className="sd-h2">The Vocabulary Of The Edge</h2>

          <div className="sd-grid-2">
            {terms.map((t) => (
              <div key={t.title} className="sd-card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sd-teal)", marginBottom: 4 }}>{t.title}</div>
                <p className="sd-text-sm-tight">{t.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pull vs push */}
        <div className="sd-section">
          <p className="sd-eyebrow">Worked Example</p>
          <h2 className="sd-h2">Origin Pull vs Origin Push</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "stretch" }}>
            <ModeCard item={modeCompare[0]} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sd-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sd-muted)" }}>VS</span>
            </div>

            <ModeCard item={modeCompare[1]} />
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            Both end up with the same file on the same edge nodes. The difference is <strong className="sd-strong">who pays the cold-start cost</strong>: pull charges it to the first real user in each region, push charges it to you, in advance, for every region whether or not anyone shows up. Pull is the default for a reason, and push earns its keep only when you can name the moment the traffic arrives.
          </div>
        </div>

        {/* Distance chart */}
        <div className="sd-section">
          <p className="sd-eyebrow">The Shape Of It</p>
          <h2 className="sd-h2">The Floor Under Every Round Trip</h2>

          <div className="sd-figure" style={{ overflowX: "auto" }}>
            <p className="sd-figure-caption">Round-trip latency against distance, before your server does any work at all</p>
            <svg viewBox="0 0 860 310" role="img" aria-label="Round-trip time rising linearly with distance. The theoretical minimum, set by the speed of light in fiber, reaches about 200 milliseconds at 20,000 kilometres, while typical real-world round trips with routing overhead reach about 260 milliseconds. An edge node in the same metro area sits near zero on both lines." style={{ width: "100%", minWidth: 620, display: "block" }}>
              <title>Round-trip latency versus distance to the server</title>
              {[0, 130, 260].map((v) => (
                <g key={v}>
                  <line x1={105} y1={250 - (v / 260) * 210} x2={830} y2={250 - (v / 260) * 210} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
                  <text x={93} y={254 - (v / 260) * 210} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{v}</text>
                </g>
              ))}
              {[0, 10000, 20000].map((d) => (
                <text key={d} x={105 + (d / 20000) * 725} y={270} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10" fill="var(--sd-muted)">{d.toLocaleString("en-US")}</text>
              ))}

              <line x1={105} y1={250} x2={830} y2={250} stroke="var(--sd-border-strong)" strokeWidth="1.5" />
              <polyline points="105,250 830,40" fill="none" stroke="var(--sd-accent)" strokeWidth="2" />
              <polyline points="105,250 830,88" fill="none" stroke="var(--sd-teal)" strokeWidth="2" strokeDasharray="5 4" />

              <circle cx={118} cy={246} r={4} fill="var(--sd-green)" />
              <text x={130} y={242} fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-green)">edge node in your metro: single-digit ms</text>

              <text x={826} y={30} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-accent)">Typical real RTT, with routing overhead</text>
              <text x={826} y={106} textAnchor="end" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-teal)">Theoretical floor: light in fiber</text>

              <text x={467} y={292} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Distance to the server (km)</text>
              <text x={28} y={145} textAnchor="middle" transform="rotate(-90 28 145)" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">Round-trip time (ms)</text>
            </svg>
          </div>

          <div className="sd-prose">
            <p>
              Light in fiber travels at roughly two thirds of its speed in a vacuum, which works out to about <strong className="sd-strong">one millisecond of round trip per hundred kilometres</strong>. A user in Sydney talking to a server in Virginia is around 16,000 km away, so physics alone charges them about 160 ms before a single byte of application work happens, and real routing, which never follows a straight line, pushes that past 200 ms in practice.
            </p>
            <p style={{ marginTop: 12 }}>
              Nothing you do to the server moves that number. A faster database, a bigger instance, a tighter query, all of it is optimising the small slice of the bar that is not distance. Putting a copy of the response 50 km from the user is the only change that moves the dominant term, and <strong className="sd-strong">that is the entire argument for a CDN</strong>.
            </p>
          </div>
        </div>

        {/* Fit */}
        <div className="sd-section">
          <p className="sd-eyebrow">Counterpoint</p>
          <h2 className="sd-h2">What Benefits, And What Does Not</h2>

          <div className="sd-grid-2">
            <FitColumn title="Great fit" color="var(--sd-teal)" items={goodFit} />
            <FitColumn title="Poor fit" color="var(--sd-danger)" items={poorFit} />
          </div>

          <div className="sd-prose">
            <p>
              One honest exception to the right-hand column: on a large CDN a forwarded request is not simply an extra hop. The edge <strong className="sd-strong">terminates TLS next to the user</strong>, so the handshake&rsquo;s several round trips are short ones, and it reaches the origin over already-open connections on the provider&rsquo;s own backbone rather than whatever path the public internet picks that day. Sold as dynamic site acceleration, it is a real but modest win, and it is worth knowing the shape of it: you are shortening the path for uncacheable traffic, <strong className="sd-strong">not removing it</strong>.
            </p>
          </div>

          <div className="sd-callout sd-callout-green">
            Underneath that, the test is one question: <strong className="sd-strong">would the next person asking be happy with this exact response?</strong> If yes, the edge can hold it, and that is where the order-of-magnitude wins live. If no, the edge can only forward it, and no amount of edge presence turns a response built for one person into one that can be reused.
          </div>
        </div>

        {/* Cacheability reference */}
        <div className="sd-section">
          <p className="sd-eyebrow">Reference</p>
          <h2 className="sd-h2">How Each Kind Of Content Caches</h2>

          <div style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760 }}>
              <thead>
                <tr>
                  {["Content", "Cache Key", "Workable TTL", "How It Changes", "Why"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface2)", color: "var(--sd-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cacheability.map((c, i) => {
                  const cell = { padding: "11px 14px", borderBottom: i < cacheability.length - 1 ? "1px solid var(--sd-border)" : "none" } as const;
                  return (
                    <tr key={c.kind}>
                      <td style={{ ...cell, fontWeight: 600, color: "var(--sd-text)" }}>{c.kind}</td>
                      <td style={{ ...cell, color: "var(--sd-muted)" }}>{c.key}</td>
                      <td style={{ ...cell, color: "var(--sd-teal)" }}>{c.ttl}</td>
                      <td style={{ ...cell, color: "var(--sd-muted)" }}>{c.invalidate}</td>
                      <td style={{ ...cell, color: "var(--sd-muted)", minWidth: 200 }}>{c.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sd-callout" style={{ marginTop: 16 }}>
            Read the table top to bottom and the pattern is the same one every time: <strong className="sd-strong">the more the URL alone determines the bytes, the longer the TTL can be</strong>. Cacheability is not a property of the file type, it is a property of how much of the response the URL already tells you.
          </div>
        </div>

        {/* Stale asset failure mode */}
        <div className="sd-section">
          <p className="sd-eyebrow">Failure Mode</p>
          <h2 className="sd-h2">The Stale Asset After A Deploy</h2>

          <div className="sd-prose">
            <p>
              You ship a new version. The HTML is fresh, the server is fine, the logs are clean, and some fraction of your users see a <strong className="sd-strong">broken, half-styled page</strong>. Their browser is loading new markup against a <code style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5 }}>styles.css</code> that an edge node fetched an hour ago and is contractually entitled to keep serving for another twenty-three.
            </p>
          </div>

          <div className="sd-callout sd-callout-accent">
            The reason it affects only some users is the part worth internalising: <strong className="sd-strong">every edge node caches independently</strong>, and each one&rsquo;s TTL started when that node happened to fetch the file. There is no moment at which a deploy is visible everywhere. There are hundreds of separate countdowns, started at different times, that you cannot see from the origin.
          </div>

          <div className="sd-prose" style={{ marginTop: 16 }}>
            <p>
              A purge API fixes it after the fact, and every CDN has one, but it is a repair, not a design. The design is to <strong className="sd-strong">never reuse a URL for different bytes</strong>: build output named <code style={{ fontFamily: "var(--sd-font-mono)", fontSize: 12.5 }}>app.4f9c2b.js</code> changes its name whenever its contents change, so the old entry is simply never requested again and the new one has nothing stale to collide with.
            </p>
            <p style={{ marginTop: 12 }}>
              That leaves exactly one file that must not be cached hard: the <strong className="sd-strong">HTML that names the hashed assets</strong>. Give it a short TTL or revalidate it every time, cache everything it points at for a year, and the stale-asset problem stops existing rather than being managed.
            </p>
          </div>
        </div>

        {/* Not a capacity plan */}
        <div className="sd-section">
          <p className="sd-eyebrow">Counterpoint</p>
          <h2 className="sd-h2">A Shield, Not A Capacity Plan</h2>

          <div className="sd-prose">
            <p>
              A CDN is a genuine first line of defence. Repeat requests die at the edge, so a spike that would have flattened one machine is instead spread across a global network, and a large share of crude denial-of-service traffic never reaches the origin at all. Sites routinely report that <strong className="sd-strong">the overwhelming majority of their requests never touch their own servers</strong>.
            </p>
            <p style={{ marginTop: 12 }}>
              The trap is reading that number as headroom. The share the edge absorbs is the cacheable share, and the uncacheable remainder, logins, checkouts, searches, writes, <strong className="sd-strong">grows with the spike just as fast as everything else</strong>. Ten times the traffic is also ten times the logins. The CDN divides origin load by a constant; it does not change what happens when the input goes up.
            </p>
          </div>

          <div className="sd-callout sd-callout-green">
            Edge compute shifts that line a little, and only a little. Routing an A/B test, rewriting a header, checking a token, redirecting by country: all genuinely better done at the PoP than 10,000 km away. Querying your database from 300 locations is <strong className="sd-strong">not the same kind of idea</strong>, because the data did not move, and now the hard part is 10,000 km from the logic instead of next to it.
          </div>
        </div>

        {/* Seen in the wild */}
        <div className="sd-section">
          <p className="sd-eyebrow">Seen In The Wild</p>
          <h2 className="sd-h2">Edges You Use Every Day</h2>
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
            &ldquo;The lamppost on the corner is my edge node. Every dog in this postcode writes to it, so I get the whole day&rsquo;s news in four seconds without walking the block, and I have never once needed to meet any of them. What is not on the lamppost is which of my two humans is holding the bowl tonight. Nobody posts that. For that one I make the full trip home, every evening, and I am never told in advance.&rdquo;
          </blockquote>
        </div>

        {/* Try it yourself */}
        <div className="sd-section">
          <p className="sd-eyebrow">Try It Yourself</p>
          <h2 className="sd-h2">Find The Edge In A Site You Already Use</h2>

          <div className="sd-callout sd-callout-accent">
            Open your browser&rsquo;s network tab on any site you use daily. Find a static asset, an image, a CSS file, a JS bundle, and look at its response headers for <strong className="sd-strong">cache-control, age, or an x-cache header</strong> naming a hit. Then find one clearly personalized response, like an account page, and notice it has either no caching header or a very short one. Write one sentence explaining why the difference has to be that way.
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

    </>
  );
}
