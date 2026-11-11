/* Phase is ours, not the source's: the first two stages produce no code, the
   middle three produce the app, the last four are passes over what exists. */

export interface Phase {
  id: "frame" | "build" | "harden";
  name: string;
  color: string;
  wash: string;
  thesis: string;
}

export const phases: Phase[] = [
  {
    id: "frame",
    name: "Frame",
    color: "var(--sd-accent)",
    wash: "var(--sd-accent-wash)",
    thesis: "Nothing is drawn yet. These two stages decide what the rest is allowed to be.",
  },
  {
    id: "build",
    name: "Build",
    color: "var(--sd-violet)",
    wash: "var(--sd-violet-wash)",
    thesis: "The stack appears, and every box in it gets exactly one owner.",
  },
  {
    id: "harden",
    name: "Harden",
    color: "var(--sd-warm)",
    wash: "var(--sd-warm-wash)",
    thesis: "Four passes over the same stack, each asking what it costs and how it breaks.",
  },
];

export interface Check {
  q: string;
  a: string;
  explain: Explain;
}

export interface Explain {
  plain: string;
  /** One entry per case: more than one renders as a list rather than a paragraph. */
  seen: string[];
  say: string;
}

export interface Stage {
  n: number;
  phase: Phase["id"];
  label: string;
  decides: string;
  /** `q` is the question asked of the design, `a` what you walk out having chosen. */
  checks: Check[];
  /** How you know the stage is finished rather than merely mentioned. */
  tell: string;
  /** What changes on the stack diagram, shown under the figure. */
  draws: string;
  /** Diagram ids this stage lights up. */
  lit: string[];
  analogy?: { title: string; body: string };
  deepDives?: DeepDive[];
}

export interface DeepDive {
  id: string;
  question: string;
  intro: string;
  cards: { title: string; body: string }[];
  note: string;
}

const STALE =
  "Out of date. Data you are still showing after the server's version has moved on. Almost every caching decision is really a decision about how stale is too stale.";
const MAIN_THREAD =
  "The single thread a browser uses to run your JavaScript, work out the layout and paint the screen. While your code is busy on it, nothing repaints and nothing answers a tap.";
const DEDUPE =
  "Noticing that an identical request is already on its way and waiting for that one, instead of sending a second copy of it.";
const IDEMPOTENT =
  "A request that can arrive twice without doing the thing twice. It is the property that makes retrying a write safe.";

/* The key is also the visible label a line writes as [WebSocket], so there is
   nothing to keep in sync and a missing entry shows up as unmatched markup. */
export const terms: Record<string, string> = {
  SSG: "Static site generation. Pages are built once, when you deploy, and served as plain files. Unbeatable for speed and cost, and the content is frozen until the next build.",
  ISR: "Incremental static regeneration. Pages are static files, but the server quietly rebuilds one once its timer runs out. Static speed, with content that catches up on its own.",
  SSR: "Server side rendering. The server builds the finished HTML for each request and sends it ready to display. The first paint is quick and crawlers see real content, but every visit costs server work.",
  streaming: "The server sends the page in pieces as each piece becomes ready, so the part waiting on a slow database does not hold up the parts that are already done.",
  CSR: "Client side rendering. The server sends a nearly empty page plus a bundle of JavaScript, and the browser builds the screen itself. Cheap to host, slow to first paint, and invisible to anything that does not run scripts.",
  SPA: "Single page application. One document loads once and the router swaps screens in place. Navigation feels instant, and the first load has to carry the whole app.",
  MPA: "Multi page application. Each route is its own document fetched from the server. Every navigation is a full page load, which is simpler and sturdier but less fluid.",
  microfrontends: "Separate teams ship separate slices of one interface, deployed independently and stitched together in the browser or at the edge. It buys team autonomy and costs you consistency.",
  BFF: "Backend for frontend. A small service between your screens and the real APIs that returns exactly the shape one screen needs, so the client stops making six calls and reassembling the answer itself.",
  REST: "An API style where each URL names a thing and the standard HTTP verbs act on it. Simple and easy to cache, and one screen often needs several of them.",
  GraphQL: "An API style where the client sends a query naming precisely the fields it wants and gets back that shape and nothing else. One trip instead of six, paid for with a more complicated server.",
  polling: "Asking the server on a timer whether anything changed. Easy to build and easy to reason about, and it burns a request every time the answer is no.",
  SSE: "Server sent events. The server holds one connection open and pushes updates down it. One direction only, which is all a feed or a progress bar ever needs.",
  WebSocket: "A connection either side can send on at any moment, held open for the whole session. The right tool for chat and shared editing, and the one that makes reconnects and message ordering your problem.",
  DOM: "The tree of elements the browser builds from your HTML. Easy to inspect, style and make accessible, and slow once there are tens of thousands of nodes in it.",
  Canvas: "A single element you draw pixels into with code. Far faster than thousands of DOM nodes, and it gives you nothing for free: no text selection, no accessibility, no styling.",
  WebGL: "Drawing through the machine's graphics hardware, inside a canvas. What you reach for with a map, a 3D scene, or a chart holding a million points.",
  socket: "Shorthand for a WebSocket: a connection either side can send on at any moment, held open for the whole session.",
  stale: STALE,
  staleness: STALE,
  "main thread": MAIN_THREAD,
  thread: "A single line of work a computer runs, doing one thing at a time. The browser's main thread is the one that runs your JavaScript and draws the screen, which is why anything slow on it freezes the page.",
  token: "A short string the server hands you once you have logged in, which your app sends with every later request to prove who you are. Anyone who copies it can be you until it expires.",
  dedupe: DEDUPE,
  deduping: DEDUPE,
  retry: "Sending a failed request again. Free for reads. For writes it is only safe if the server can recognise the repeat, or one retry becomes two orders.",
  backoff: "Waiting longer before each retry, usually doubling: one second, then two, then four. It is what stops a struggling server being finished off by its own clients.",
  "round trip": "One full journey from the browser to the server and back. On a phone that can be a tenth of a second before any work is even done, which is why the number of trips matters more than their size.",
  bundle: "The file of JavaScript the browser downloads and runs before your app works at all. Every library you add ends up inside it.",
  hydration: "The browser taking the ready-made HTML it was sent and attaching your JavaScript to it, turning a page you can read into a page you can click.",
  crawler: "A robot that reads pages for a search engine. It does not browse like a person, and it does not reliably wait around for JavaScript to build the page.",
  cursor: "A pointer at one exact item in a list, so you can ask for \"the items after this one\" instead of \"page 3\". It survives new items arriving at the top; a page number does not.",
  debounce: "Waiting until someone stops typing before you act, so a search box sends one request instead of one per keystroke.",
  idempotency: IDEMPOTENT,
  idempotent: IDEMPOTENT,
  optimistic: "Showing the result on screen before the server has confirmed it, then quietly undoing it if the server says no.",
  EXIF: "The metadata a camera writes inside a photo: the timestamp, the camera model, and very often the exact spot on the map it was taken. Stripping it before upload is a privacy measure, not an optimisation.",
  "presigned URL": "A single-use URL your server signs so the browser can upload straight to storage, with the bytes never passing through you. Any limit you want enforced has to be inside the signature, because nothing of yours is in the path.",
  reflow: "The browser working out the position and size of everything again, because something moved or resized. The expensive kind of change: it can touch the whole page, and it is what you feel as text jumping.",
  repaint: "The browser redrawing pixels without moving anything, say for a colour or a shadow change. Cheaper than a reflow, because no position has to be recalculated.",
  "HTTP cache": "The browser's own cache, filled from the headers a response arrived with. It is keyed by URL and you cannot reach it from JavaScript, which is why a new build changes the filenames instead of trying to clear it.",
  "in-memory cache": "The cache living in the page itself, usually your query client. Fast, yours to invalidate by key, and gone the moment the tab closes.",
  "service worker": "A script the browser runs beside your page that can answer the page's network requests itself. It survives tab closes, which is what makes it powerful offline and dangerous when it keeps serving an old version of the app.",
  srcset: "A list of the same image at several widths, handed to the browser so it can pick the one that fits the slot and the screen. Paired with sizes, which tells it how wide the slot will be before any CSS has run.",
  CLS: "Cumulative Layout Shift: how much the page jumps around while it loads. One of the three Core Web Vitals, and almost always caused by an image, an ad or a font arriving without its space reserved.",
  jitter: "A random wobble added to a retry delay so every client does not come back at the same instant. Without it, ten thousand apps on a four second timer arrive as one wave, over and over.",
  AbortController: "The browser object that cancels a request already in flight. You hand its signal to fetch, then call abort when the answer stops mattering, and that fetch rejects instead of quietly resolving later.",
  throttle: "Letting something run at most once every so many milliseconds, for events that fire continuously like scroll or resize. Debounce waits for quiet; throttle rations.",
  ETag: "A short string the server sends with a resource, identifying that exact version of it. Send it back with a write and the server can tell whether what you edited is still what it has.",
  CRDT: "A data structure built so that two copies edited separately always merge to the same result, with nobody refereeing. It is what collaborative editors use instead of deciding whose change won.",
  deferred: "Started later on purpose rather than at page load. A deferred image is fetched when the browser works out it is about to be needed, which in practice means as it comes near the bottom of the screen.",
  LCP: "Largest Contentful Paint: how long until the biggest thing on screen, usually the hero image or the headline, has actually painted. One of the three Core Web Vitals, and the one images ruin.",
  useTransition: "React's hook for marking an update as non-urgent. It hands back an isPending flag and keeps the current screen alive and interactive while the next one is prepared, instead of blanking it the moment you click.",
  useLinkStatus: "A Next.js hook, read inside a Link, that reports whether that particular link's navigation is still pending. It is for inline feedback on the thing you clicked, not for the whole page.",
  "View Transitions": "A browser API that photographs the old screen, lets you swap the DOM underneath, and animates between the two states. It is what turns a route change from a cut into a cross-fade.",
  "aria-live": "An attribute marking a region whose changes a screen reader should read out as they happen, without the user going looking for them. It is how a loading message, a toast or a result count announces itself.",
  lazy: "React's lazy() takes a dynamic import and hands back an ordinary component. The code behind it is only fetched the first time something actually renders it, which is what turns a split in the build into a saving at runtime.",
  Suspense: "A boundary you wrap around something that is not ready yet, with a fallback to show meanwhile. It is what holds the space while a lazy component's code, or its data, is still on its way.",
  "next/dynamic": "Next.js's wrapper around lazy and Suspense in one call, with a loading option for the fallback and the choice of skipping the component during server rendering.",
  "TanStack Query": "The library most React apps hand their server answers to. Every query has a key, answers are cached under that key, and you mark them out of date by key rather than hunting down components. You may know it by its older name, React Query.",
  useOptimistic: "React's hook for exactly this. You give it the real value and a function that applies a pending change; it shows the changed value while the action is in flight and *drops back to the real value by itself* once the action settles. The rollback you would otherwise hand-write is the point of it.",
  frame: "One drawn picture of the screen. Phones aim for sixty a second, so any single piece of work on the main thread lasting longer than about 16ms means a frame never gets drawn and motion stutters.",
  CDN: "A network of servers spread around the world holding copies of your files, so someone in Tokyo downloads from Tokyo rather than from Virginia.",
  viewport: "The part of the page you can actually see right now, as opposed to everything scrolled above or below it.",
  endpoint: "One address on a server your app can call, like /orders or /users/42.",
  VPC: "Virtual Private Cloud. The private network your backend lives in, unreachable from the public internet unless you deliberately open a door. Server code sitting inside one is never downloaded by anyone, which is why a secret can live in it and never in your bundle.",
};

export const stages: Stage[] = [
  {
    n: 1,
    phase: "frame",
    label: "Frame the problem",
    decides: "Who is on the other side of the screen, and on what device?",
    checks: [
      {
        q: "Who are the users?",
        a: "Named specifically, because *\"everyone\" is not an answer*: an operator who lives in the app all day and a first time visitor on a borrowed phone are two different systems.",
        explain: {
          plain: "The actual people who will open this thing. Not \"users\" in general: a warehouse worker scanning boxes all day, or a parent who checks a school app twice a term.",
          seen: [
            "Instagram is built for someone who scrolls for an hour.",
            "A hospital screen is built for a nurse who needs one number in three seconds.",
            "Same technology, completely different app.",
          ],
          say: "Name two or three real people and what they are doing at the moment they open it. Then say which one you are designing for *first*, because you cannot be first for everybody.",
        },
      },
      {
        q: "What are the core user journeys?",
        a: "The one or two paths the product exists for, written as journeys rather than screens. Everything designed after this either serves one of them or is scope.",
        explain: {
          plain: "The main thing someone came to do, from the first tap to the finished job. On YouTube it is \"find a video, watch it\". Everything else on the page is extra.",
          seen: [
            "A food app's journey is \"hungry, pick, pay, track\".",
            "Nobody opens it to edit their profile, which is why the profile screen is allowed to be slower and plainer.",
          ],
          say: "Describe one or two journeys as a sentence of steps, not a list of screens. Everything you design later either serves one of them or is scope you can cut.",
        },
      },
      {
        q: "Web, mobile web, desktop, embedded?",
        a: "The surfaces you ship on: web, mobile web, installed app, or an embedded widget inside someone else's page.",
        explain: {
          plain: "Where the thing actually appears: a browser on a laptop, a browser on a phone, an installed app, or a small box living inside somebody else's website.",
          seen: [
            "A Spotify player sitting inside a tweet is the same product squeezed into a tiny box, on a page it does not control, with somebody else's styles around it.",
          ],
          say: "List the surfaces, then say which one you optimise for. \"Phone browser first, desktop second, embedded later\" is an answer. \"All of them\" is not.",
        },
      },
      {
        q: "Read-heavy or write-heavy?",
        a: "Whether the core journeys are *read shaped or write shaped*, because that decides what you cache and what you queue.",
        explain: {
          plain: "Are people mostly *looking* at things, or mostly *making* things? A news site is reading. A notes app is writing.",
          seen: [
            "*Read-heavy:* Wikipedia is read by millions and edited by a few, so it can cache nearly everything.",
            "*Write-heavy:* Google Docs is the opposite, where every keystroke is a write that must not get lost.",
          ],
          say: "Say which one, then say what follows from it. Read-heavy means caching is your main job. Write-heavy means saving, retrying and never losing the user's work is your main job.",
        },
      },
      {
        q: "Real-time or not?",
        a: "Whether anything on screen must be *live*, or only *fresh*. Those are different systems and only one of them needs a socket.",
        explain: {
          plain: "Does the screen have to change the *instant* something happens somewhere else, or is a few seconds late fine? Those are two different words: *live* and *fresh*.",
          seen: [
            "*Live:* a football score, which has to change the moment the goal goes in.",
            "*Fresh:* the unread badge on your email, where nobody minds if it turns up eight seconds late.",
          ],
          say: "Say live or fresh, out loud, per feature. Fresh means you can just ask again on a timer. Live means a kept-open connection, and all the reconnect problems that come with it.",
        },
      },
      {
        q: "SEO required or not?",
        a: "Whether a crawler has to see the page, or only a reader who is signed in. SEO is a rendering constraint, not a marketing one.",
        explain: {
          plain: "SEO is whether Google can read your page and put it in search results. Google's robot does not reliably wait around for your JavaScript to run, so a page that builds itself in the browser can look *empty* to it.",
          seen: [
            "*Needs it:* a shop or a blog, which lives or dies on search traffic.",
            "*Does not:* a logged-in dashboard. Nobody googles your private settings page.",
          ],
          say: "Split the app. \"Public pages are rendered on the server so crawlers get real text; the signed-in area can render in the browser.\" That one sentence settles half of stage 2.",
        },
      },
      {
        q: "Offline support needed?",
        a: "What the app does with no network, and whether that is *a feature or an error message*.",
        explain: {
          plain: "What the app does with no internet. Either it still does something useful, or it honestly says \"no connection\". Both are fine. Not deciding is what is not fine.",
          seen: [
            "*Works offline:* Google Maps lets you download an area and keeps working underground.",
            "*Queues it for later:* Gmail lets you write a reply on a plane and sends it when you land.",
            "*Neither:* most websites just show an error.",
          ],
          say: "Say what still works offline and what does not. If unsent work must survive, say where it is kept on the device and when it gets sent.",
        },
      },
      {
        q: "Accessibility requirements?",
        a: "Which accessibility and locale requirements cannot be negotiated, named before any component exists.",
        explain: {
          plain: "Making it work for people who do not use a mouse and eyes the way you do: keyboard only, a screen reader that reads the page out loud, bigger text, colours a colourblind person can tell apart.",
          seen: [
            "*A real button:* Tab reaches it and the focus outline moves. That is the whole test for keyboard support.",
            "*A button made out of a styled div:* Tab never reaches it, so for a keyboard user it does not exist.",
          ],
          say: "Name the non-negotiables before any component exists: everything keyboard reachable, focus always visible, every control labelled, colour never the only signal. *Bolted on later it is a rewrite.*",
        },
      },
      {
        q: "Browser/device constraints?",
        a: "The *device and browser floor* you support, which sets the performance budget for everything after.",
        explain: {
          plain: "The oldest, slowest phone and the oldest browser you promise to support. That one device quietly sets the speed limit for every line of code you ship.",
          seen: [
            "A site that flies on a new laptop can take eleven seconds on a four year old budget Android, because that phone's processor has to chew through the same JavaScript.",
          ],
          say: "Name a real floor, like \"a four year old Android on a slow connection\". Every performance decision after this needs something to be measured *against*.",
        },
      },
      {
        q: "Security/privacy constraints?",
        a: "Which fields are sensitive, and which rules are fixed before any code exists: tenancy, retention, regulated data. *Stage 9 enforces them; stage 1 is where you find out they are there.*",
        explain: {
          plain: "Which information is sensitive, and which rules you are not allowed to break around it: health records, card numbers, someone's location, another customer's data.",
          seen: [
            "A medical app may not log a patient's name into an error report.",
            "A shop may not keep your card number on the device.",
            "Those rules come from outside the team and cannot be designed away.",
          ],
          say: "Name the sensitive fields and the rule for each: never logged, never cached on the device, never visible to another account. *Stage 9 enforces it; here you only find out it exists.*",
        },
      },
      {
        q: "Latency expectations?",
        a: "What latency the journey is allowed to feel like, expressed as a number rather than \"fast\".",
        explain: {
          plain: "Latency is just *the delay*. This is how long a user will wait before the thing feels broken rather than busy.",
          seen: [
            "Typing has to feel instant, under about a tenth of a second.",
            "A search result can take half a second.",
            "A big export can take ten, as long as you show it working.",
          ],
          say: "Give a number per action, not the word \"fast\". A number can be tested and missed; \"fast\" can only be argued about.",
        },
      },
    ],
    tell: "You can name the one journey the whole design serves, and the device it has to feel fast on.",
    draws: "Only the two endpoints. A user, and something that has data. Everything between them is still a guess.",
    lit: ["user", "server"],
  },
  {
    n: 2,
    phase: "frame",
    label: "Place the boundary",
    decides: "Where does the work happen: their machine, or ours?",
    checks: [
      {
        q: "Rendering: CSR, SSR, SSG, ISR or streaming?",
        a: "Rendering: prerendered at build ([SSG]), rebuilt on a timer ([ISR]), built per request ([SSR]), sent in pieces as they are ready ([streaming]), or assembled entirely in the browser ([CSR]).",
        explain: {
          plain: "Who builds the page you end up looking at: our server, before it sends anything, or your browser, after it downloads a pile of JavaScript. These five names are five answers to *how much was ready in advance*.",
          seen: [
            "Think of a kitchen, and how much of the food is ready before the customer walks in.",
            "[SSG]: cook everything at dawn and keep it on a shelf.",
            "[ISR]: reheat a tray whenever its timer runs out.",
            "[SSR]: cook each plate to order.",
            "[streaming]: send the courses out one at a time instead of making the table wait for the slowest dish.",
            "[CSR]: hand the customer raw ingredients and a stove.",
          ],
          say: "Answer per route, not per app. Say how often that page's content changes, whether a [crawler] must read it, and whose machine pays for the work. Those three facts pick the strategy for you.",
        },
      },
      {
        q: "Page architecture: SPA or MPA?",
        a: "Navigation: *one app that owns the shell* across routes ([SPA]), or a separate document per route ([MPA]).",
        explain: {
          plain: "One document that loads once and swaps screens inside itself ([SPA]), or a fresh page from the server for every link you click ([MPA]).",
          seen: [
            "*SPA:* Gmail. The shell never reloads, which is why moving between emails feels instant.",
            "*MPA:* Wikipedia. Every article is a real page load, which is rock solid and shareable.",
          ],
          say: "Say which, and say what it costs. An SPA buys instant navigation and pays with a big first download plus a router you now own. An MPA is simpler and sturdier and feels like a reload every time.",
        },
      },
      {
        q: "Product architecture: monolith frontend or microfrontends?",
        a: "Ownership: a single frontend, or independently deployed slices ([microfrontends]) stitched together at the edge.",
        explain: {
          plain: "One frontend app owned by one team, or several independently shipped slices of the same screen owned by several teams and stitched together ([microfrontends]).",
          seen: [
            "*Microfrontends:* a big shop where search, product pages and checkout belong to three teams that deploy on their own schedule.",
            "The customer sees one site. It is really three apps in a trench coat.",
          ],
          say: "Default to one app. Reach for microfrontends only when *separate teams shipping on separate days* is a real problem you have, and admit the price: duplicated code and a constant fight for a consistent look.",
        },
      },
      {
        q: "APIs: BFF or direct API calls?",
        a: "The data edge: a [BFF] shaped to your screens, or direct calls to the shared services underneath.",
        explain: {
          plain: "Call the shared backend services straight from the browser, or put one small service of your own in the middle that returns exactly the shape one screen needs ([BFF]).",
          seen: [
            "A screen needing a user, their orders and each order's status is four [round trip]s from a phone.",
            "Inside a BFF it is four fast local calls and *one* trip to the phone.",
          ],
          say: "Say who does the reshaping and on whose hardware. One screen and one API needs no BFF. Twelve screens and six services already has one, scattered across the components.",
        },
      },
      {
        q: "Query shape: REST or GraphQL?",
        a: "Query shape: fixed endpoints that return what they return ([REST]), or a query the client narrows itself ([GraphQL]).",
        explain: {
          plain: "Fixed addresses that return whatever they return ([REST]), or one address where the client sends a list of the exact fields it wants ([GraphQL]).",
          seen: [
            "*REST:* you ask for a user and get the whole user object, when all you wanted was the name.",
            "*GraphQL:* the screen asks for the name and gets the name. A real win on a phone, and a more complicated server for you to run.",
          ],
          say: "Say what the screens need. Many different screens wanting many different slices of the same data favours GraphQL. A handful of stable screens favours REST, and REST caches far more easily.",
        },
      },
      {
        q: "Real-time data: polling, SSE or WebSocket?",
        a: "Liveness: ask on a timer ([polling]), hold a one way stream open ([SSE]), or keep a two way socket alive ([WebSocket]).",
        explain: {
          plain: "Three ways to find out something changed: ask again on a timer ([polling]), let the server push down a one-way stream ([SSE]), or keep a two-way line open where both sides can talk at any moment ([WebSocket]).",
          seen: [
            "*Polling:* an unread count. Asking again every few seconds is fine.",
            "*SSE:* a build log or a progress bar. One direction, server to client.",
            "*WebSocket:* chat and shared cursors. Both sides send at any moment.",
          ],
          say: "Start at polling and only climb when the requirement forces it. *The cost of a socket is never the socket*, it is reconnecting, ordering and resyncing, which stage 6 will ask you about.",
        },
      },
      {
        q: "Rendering surface: DOM, Canvas or WebGL?",
        a: "Paint surface: [DOM] for almost everything, [Canvas] or [WebGL] only where *the DOM itself is the bottleneck*.",
        explain: {
          plain: "What you actually draw into. The browser's normal boxes of elements ([DOM]), a single element you paint pixels into with code ([Canvas]), or the machine's graphics chip ([WebGL]).",
          seen: [
            "*DOM:* a form, a list, a page of text.",
            "*Canvas or WebGL:* a spreadsheet with a hundred thousand live cells, a map, a drawing app. Tens of thousands of DOM boxes make the browser crawl.",
          ],
          say: "DOM unless the DOM itself is measurably the bottleneck. Canvas is fast and gives you *nothing* for free: no text selection, no screen reader, no CSS. Say how you will replace those.",
        },
      },
      {
        q: "Data processing: client-side or server-side search and filtering?",
        a: "Where search and filtering run: in the client over a set you already have, or on the server over the set you don't.",
        explain: {
          plain: "When someone types in a search box, who does the looking: the browser, over data it already downloaded, or the server, over everything that exists.",
          seen: [
            "*Client-side:* a 200 row table filters instantly in the browser, with no network at all.",
            "*Server-side:* searching every product in a shop, because you are never going to download every product.",
          ],
          say: "Say it by size. If the whole set already fits on the device, filter there and feel instant. If it does not, the server filters, and you owe the user debouncing and a loading state.",
        },
      },
    ],
    tell: "Every one of those answers is a point on the same line, and you can say why you landed where you did on each.",
    draws: "One line. It decides what arrives as finished HTML and what arrives as work for their CPU to do.",
    lit: ["boundary", "shell", "net"],
    analogy: {
      title: "A kitchen deciding what to cook in advance",
      body: "Everything here is one question: how much is ready before the customer walks in? Cook it all at dawn and keep it on the shelf, and service is instant but the food is as old as the shelf (SSG). Reheat a tray whenever its timer runs out (ISR). Cook each plate to order (SSR). Bring out the courses one at a time instead of making the table wait for the slowest dish (streaming). Or hand the customer raw ingredients and a stove, which is quick for the kitchen and slow for everybody else (CSR). None of them is the right answer. The right answer depends on how often the menu changes and how long a customer will sit there waiting.",
    },
    deepDives: [
      {
        id: "rendering",
        question: "How do I actually pick between the five rendering strategies?",
        intro: "Not by preference. Three facts from stage 1 decide it for you, and most arguments about rendering are really arguments about which of the three nobody wrote down.",
        cards: [
          {
            title: "How often does the content change?",
            body: "Content that changes on a deploy wants SSG. Content that changes hourly wants ISR. Content that is different for every single viewer, like a dashboard, has nothing to prebuild and wants SSR or CSR.",
          },
          {
            title: "Does a crawler need to read it?",
            body: "If search traffic matters, the HTML has to arrive with the words already in it, which rules out pure CSR. A crawler that does not run your JavaScript sees the empty page you shipped, not the page your user sees.",
          },
          {
            title: "Who pays for the work?",
            body: "SSR moves cost onto your servers, once per request, forever. CSR moves it onto the user's device, which is free for you and expensive for them on a cheap phone. Streaming is how you stop one slow query from holding the whole page hostage.",
          },
        ],
        note: "Most real apps are a mix, chosen per route. The homepage is static, the dashboard is server rendered, and the settings panel renders in the browser, because those three routes answer the three questions differently.",
      },
      {
        id: "liveness",
        question: "When is data actually worth a WebSocket?",
        intro: "Almost never, and a lot more often than you think, which is why this one needs the stage 1 answer in writing. Fresh and live are different requirements, and only one of them costs you a connection to maintain.",
        cards: [
          {
            title: "Fresh: polling is fine",
            body: "A notification count or a stock price that may lag ten seconds is fresh, not live. Ask on a timer. It is a few lines, it recovers from failure by itself, and the next request is the retry.",
          },
          {
            title: "Live in one direction: use SSE",
            body: "A build log, a progress bar, a feed that updates itself. The server has things to say and the client has nothing to send back. One open connection, pushed down, and the browser reconnects for you.",
          },
          {
            title: "Live in both directions: now you need a socket",
            body: "Chat, shared cursors, collaborative editing. Both sides send at any moment. You have just signed up for reconnect logic, message ordering, resync after a gap, and conflict resolution, all of which stage 6 is going to ask you about.",
          },
        ],
        note: "The cost of a WebSocket is never the socket. It is the four problems underneath it that only exist once you have one.",
      },
      {
        id: "bff",
        question: "What does a BFF buy that calling the shared API directly does not?",
        intro: "A shared API is shaped for every consumer, which means it is shaped for none of them. The question is who does the reshaping, and on whose hardware.",
        cards: [
          {
            title: "It collapses the waterfall",
            body: "One screen that needs a user, their orders, and each order's status is three or four round trips from the browser, each paying full network latency. The same work inside a BFF is three local calls and one trip to the client.",
          },
          {
            title: "It moves the joining off the phone",
            body: "Stitching those responses together, sorting and filtering them, is real CPU work. On your server it is free. On a four year old Android it is dropped frames.",
          },
          {
            title: "It gives you a contract you own",
            body: "The shared API belongs to another team and changes on their schedule. A BFF is a layer you control, so a breaking change upstream becomes one fix in one place instead of a release across every client.",
          },
        ],
        note: "The cost is a service to run, deploy and monitor. If you have one screen and one API, you do not need one. If you have twelve screens and six services, you already have a BFF, it is just scattered across your components.",
      },
    ],
  },
  {
    n: 3,
    phase: "build",
    label: "Name the parts",
    decides: "What are the moving pieces, and which one owns each job?",
    checks: [
      {
        q: "App shell",
        a: "A *shell* that paints before any data arrives, so the first frame is never blank.",
        explain: {
          plain: "The frame that paints immediately, before any data has arrived: header, nav, empty layout. It is what stops the first second being a blank white screen.",
          seen: [
            "Open the Twitter or Gmail app on a slow connection and you see the bars and the layout first, then the content drops in. That outline is the shell.",
          ],
          say: "Say what is in the shell and prove it needs no data. If your header needs the user's name to render, the first frame is now waiting on the network.",
        },
      },
      {
        q: "Router",
        a: "A *router* whose only job is turning a URL into a screen.",
        explain: {
          plain: "The one piece that turns a URL into a screen. That is its whole job: read the address, decide what to show.",
          seen: [
            "The address bar reading /settings/billing is how a refresh, a back button and a pasted link all land on the same screen. The router is what makes that true.",
          ],
          say: "Say the route list and that *nothing else* reads the URL. When components start parsing the address themselves, back and refresh begin to disagree.",
        },
      },
      {
        q: "UI component layer",
        a: "A *component layer* that paints and nothing else: no fetching, no transport knowledge.",
        explain: {
          plain: "The pieces that draw pixels: buttons, lists, cards. They paint what they are handed and nothing more. They do not fetch, and they do not know a network exists.",
          seen: [
            "A product card that fetches its own price looks convenient until forty of them on one page fire forty requests and nobody can tell you why the page is slow.",
          ],
          say: "Say it plainly: components receive data, they do not go and get it. Keeping fetching out of them is what makes retries, caching and testing possible at all.",
        },
      },
      {
        q: "Store / state management layer",
        a: "A *store* that is the one place truth owned by the client lives.",
        explain: {
          plain: "The single place where the truth the *client* owns lives: which tab is open, what is in the cart, which filters are on. One shelf, so two screens cannot disagree.",
          seen: [
            "Two components each keeping their own copy of \"is the sidebar open\" is how you get a sidebar that is open and closed at the same time.",
          ],
          say: "Say what belongs in the store and what does not. Server data is not client state, it belongs in the cache, and mixing those two is the most common frontend design mistake there is.",
        },
      },
      {
        q: "Data fetching / API client",
        a: "A *data client* every outbound call goes through, so retry, cancel and dedupe exist once.",
        explain: {
          plain: "One doorway that every outbound request goes through. Because there is only one, things like retrying, cancelling and adding the auth [token] get written *once*.",
          seen: [
            "Without it, forty components each do their own fetch, and adding a [retry] means forty edits and thirty-eight places where somebody forgets.",
          ],
          say: "Say that every call goes through it, with no exceptions. Then stage 6's whole list, retries, cancelling, [deduping], has exactly one place to live.",
        },
      },
      {
        q: "Cache",
        a: "A *cache* holding server answers, each with a staleness rule attached.",
        explain: {
          plain: "The memory of answers the server already gave you, each one tagged with how long it is allowed to be trusted.",
          seen: [
            "Going back to a list you just viewed shows instantly because the answer was kept, and maybe quietly refreshed behind the scenes while you looked at it.",
          ],
          say: "Never describe a cache without describing how entries *stop* being trusted. A cache with no expiry rule is a bug that happens to be fast.",
        },
      },
      {
        q: "Real-time connection manager",
        a: "A *realtime manager* owning the socket's whole lifecycle, reconnects included.",
        explain: {
          plain: "One piece of code that holds the live connection to the server, the [socket] or [SSE] stream itself, and is the only thing allowed to touch it. It opens the connection, notices when it dies, opens a new one, asks for whatever was missed, and hands incoming messages to the rest of the app.",
          seen: [
            "*While it is up:* new chat messages appear on their own, with nothing on screen having asked for them.",
            "*When you walk into a lift:* the connection dies. The little \"reconnecting\" banner is this piece talking.",
            "*When you come back out:* it opens a new connection and asks the server for everything you missed, which is why the conversation has no holes in it.",
          ],
          say: "Say one module owns the connection and components only subscribe to it. Then answer its three hard questions: when it reopens, how it catches up on what was missed, and what the user sees while it is gone.",
        },
      },
      {
        q: "Background workers",
        a: "*Workers* for anything that would otherwise cost you a frame.",
        explain: {
          plain: "A second [thread]. Heavy work moved off the main one, because the main thread is also the thread that draws the screen and listens for your taps.",
          seen: [
            "Parsing a huge file or crunching a big list on the main thread freezes everything: scrolling stops, buttons ignore you.",
            "Move it to a worker and the page stays alive.",
          ],
          say: "Name the jobs that go off the main thread and why: anything that would cost you a [frame]. Then say how results come back, because workers talk in messages, not return values.",
        },
      },
      {
        q: "Local persistence",
        a: "*Persistence*, with an explicit decision about what survives a refresh and where it sits.",
        explain: {
          plain: "The part of the app that writes to the device so things survive a refresh or a closed tab. Small values go in localStorage, bigger structured piles go in IndexedDB.",
          seen: [
            "A half-written post still being there tomorrow is persistence.",
            "So is the app remembering dark mode without asking the server.",
          ],
          say: "Say exactly what survives and where, and say what happens when it is [stale] or from an older version of your app. *Old data on disk outlives the code that wrote it.*",
        },
      },
      {
        q: "Auth / session layer",
        a: "A *session layer* that answers \"who is this\" in one place rather than eleven.",
        explain: {
          plain: "The one place that answers \"who is this, and are they still signed in\". Everything else asks it instead of working it out again.",
          seen: [
            "A [token] quietly expiring while someone is halfway through a form is the moment this layer earns its keep: it either recovers cleanly or it throws the work away.",
          ],
          say: "Say where identity is checked and that it happens once, in one place. Eleven components each deciding whether you are logged in will eventually give eleven answers.",
        },
      },
      {
        q: "Analytics / logging",
        a: "*Telemetry* for the things you will wish you had logged during the incident.",
        explain: {
          plain: "The breadcrumbs you leave for yourself: what people did, what broke, and how slow it was. You cannot add them after the thing you wanted to see has already happened.",
          seen: [
            "\"It was broken for twenty minutes last Tuesday\" is answerable only if something was recording at the time.",
          ],
          say: "Name the handful of events and errors worth recording, and say what must *never* appear in them: passwords, tokens, personal data. Logs are a privacy leak waiting to happen.",
        },
      },
    ],
    tell: "Every box has exactly one owner, and no layer reaches around the one below it.",
    draws: "The whole stack, greyed out. From here on no stage adds a box. Each one claims the boxes it governs.",
    lit: ["shell", "ui", "store", "cache", "data", "workers", "persist", "session", "telemetry"],
  },
  {
    n: 4,
    phase: "build",
    label: "Assign ownership of data",
    decides: "For every value on screen: who is the source of truth, and how long does it live?",
    checks: [
      {
        q: "Server state vs client state vs ephemeral UI state?",
        a: "Server state, client state and throwaway UI state *kept in separate places*, because they have different rules.",
        explain: {
          plain: "The confusing part first: *all three of them live in the browser*. The names are not about where the data sits, they are about who owns the real version of it. One question sorts them: if this tab reloaded right now, who could give this value back? The server, nobody, or nobody would care.",
          seen: [
            "*Server state, the server could give it back:* the orders on screen. You did not invent them, you fetched them, and the real list lives on the server. Your copy is a borrowed one that can go [stale], and if you doubt it you just ask again.",
            "*Client state, nobody could give it back:* the filters you picked, the sort order, items in a cart before checkout. The server has never heard of any of it. Lose it and it is gone, because there is nowhere else to get it from.",
            "*Ephemeral UI state, nobody would care:* which tooltip is open, what is hovered, whether the dropdown is expanded. If it reset this second, nobody would notice.",
          ],
          say: "Sort every value with the reload question, then keep the three apart in the stack from stage 3: server state belongs in the *cache*, client state in the *store*, ephemeral state inside the component itself. Copying borrowed server data into the store is the classic mistake, and it costs months of syncing two sources of truth that were never meant to agree.",
        },
      },
      {
        q: "Source of truth, and what is derived?",
        a: "One source of truth per field, with everything else *derived* rather than copied.",
        explain: {
          plain: "For every value on screen, one place is the real one. Everything else is *worked out* from it, not copied next to it.",
          seen: [
            "*One source:* store the item list and work the total out from it.",
            "*Two sources:* store the total as well, and someday you have five items and a total that says four, with no way to know which one lied.",
          ],
          say: "Point at any number on screen and name its one owner. If it is calculated, calculate it at render time and never store it.",
        },
      },
      {
        q: "Caching strategy: what data can go stale?",
        a: "A staleness rule per query: how old is too old, answered per query rather than globally.",
        explain: {
          plain: "Stale means \"a bit out of date\". Caching is keeping an answer so you do not have to ask again, and the strategy is how old each kind of answer is allowed to get.",
          seen: [
            "*Can go stale:* a product name can be an hour old and nobody suffers.",
            "*Cannot:* a bank balance showing yesterday's number is a real problem.",
            "Same mechanism, completely different limits.",
          ],
          say: "Give a staleness rule per query, not one rule for the whole app. \"Profile for an hour, cart never, prices for thirty seconds\" is a design; \"we use a cache\" is not.",
        },
      },
      {
        q: "What data needs conflict resolution?",
        a: "What wins when a cached answer disagrees with a fresh one.",
        explain: {
          plain: "A conflict is two changes to the same thing, and nobody can say which is right: your phone edited it offline while a colleague edited it on the web.",
          seen: [
            "Two people renaming the same file at once.",
            "Someone adding a tag on their laptop while the same note changes on their phone.",
            "One of those edits is going to lose unless you decide otherwise.",
          ],
          say: "Name the fields where two people can collide. For most apps, last write wins is fine and you say so on purpose. For shared editing it is not, and that is a much bigger design.",
        },
      },
      {
        q: "Optimistic updates?",
        a: "Whether a write *shows instantly and reconciles later*, or waits for the server to confirm.",
        explain: {
          plain: "Showing the change *immediately*, before the server has confirmed it, and quietly fixing the screen if the server says no.",
          seen: [
            "Tapping like turns the heart red instantly, while the request is still in the air.",
            "If it fails the heart goes back, which is why it sometimes seems to un-like itself.",
          ],
          say: "Say which actions are optimistic and how each one *undoes* itself on failure. Optimistic with no rollback plan is just a lie on screen. In React the mechanism is [useOptimistic]: the pending value shows while the action runs, and the real value comes back on its own when it settles, so rollback stops being something you remember to write.",
        },
      },
      {
        q: "Invalidation / revalidation?",
        a: "Invalidation: what else a write makes wrong, and how that gets marked.",
        explain: {
          plain: "Two jobs people say in one breath. *Invalidation* is marking a saved answer as no longer trustworthy. *Revalidation* is the trip that goes and gets it again. Keeping them separate is the whole trick: an answer can be marked wrong the instant you write, and refetched later, only if something is actually looking at it.",
          seen: [
            "*The problem:* delete a message, and the thread list, the unread count and the search results are all wrong at once. Refresh only the thread and the badge keeps counting a message that is gone.",
            "*Invalidation, in [TanStack Query]:* when the delete succeeds you call `queryClient.invalidateQueries({ queryKey: ['messages'] })`. Every cached answer under that key is marked [stale]. Nothing is deleted.",
            "*Revalidation, from that same call:* yes, invalidating is what starts the refetch, but only for the queries a mounted component is currently watching. They refetch in the background with the old data still on screen, so nothing flashes empty.",
            "*Everything else just waits:* a query nobody is watching stays marked stale and is fetched the next time something mounts it, which for most of your cache is never. That is why marking is cheap enough to do on every write.",
            "*The knob next to it:* `staleTime` is the same decision from the other end, how long an answer is trusted *without* anyone invalidating it.",
          ],
          say: "For each write, list what else it makes wrong. That list *is* your invalidation plan, and it is the part people forget until a [stale] number turns up in a bug report. Then say that invalidating marks rather than deletes, so the screen keeps the old value until the new one lands.",
        },
      },
      {
        q: "Pagination / cursoring?",
        a: "Pagination that still works when the list changes underneath the cursor.",
        explain: {
          plain: "Pagination is handing out a long list a chunk at a time: twenty posts, then the next twenty. Cursoring is *how* you ask for the next chunk. Instead of \"give me page 3\", you say \"give me what comes after this exact item\".",
          seen: [
            "*Page numbers:* five new posts arrive while you read page 1, so page 2 now starts five items earlier and you see the same posts twice.",
            "*Cursors:* the cursor points at a real item, so new things arriving on top cannot shift your place.",
          ],
          say: "Numbered pages for lists that sit still, like an admin table. Cursors for anything that moves: feeds, chat, notifications. Then say what happens when the item the cursor points at gets deleted.",
        },
      },
      {
        q: "What data belongs in the URL?",
        a: "What belongs in the URL, so that *a link reproduces the screen* for someone else.",
        explain: {
          plain: "The address bar is storage too. Whatever you put there can be bookmarked, shared, reloaded and gone back to.",
          seen: [
            "*In the URL:* you can send someone the exact results you are looking at.",
            "*In memory only:* your link shows them a blank search.",
          ],
          say: "Rule of thumb: *if a link should reproduce the screen, it goes in the URL*. Search terms, filters, tabs, page position yes. Draft text and half-filled forms no.",
        },
      },
      {
        q: "What data should survive refresh?",
        a: "What survives a refresh, and whether localStorage or IndexedDB is the right shelf for it.",
        explain: {
          plain: "What is still there after someone reloads the tab or comes back tomorrow. Everything else dies the moment the page unloads.",
          seen: [
            "Losing a long comment to an accidental refresh is this decision, made by not making it.",
            "A saved draft is the same decision, made on purpose.",
          ],
          say: "List what survives and where it is kept. Small and simple goes in localStorage; large or structured goes in IndexedDB. Then say what you do with it when it turns out to be old.",
        },
      },
      {
        q: "Normalized or denormalized state?",
        a: "Normalized or duplicated, and how much drift you are willing to tolerate in exchange.",
        explain: {
          plain: "Normalized means one copy of each thing, kept by id, with everywhere it appears pointing at that one copy. Denormalized means the same thing copied into every place that shows it. The real question is not tidiness, it is *what should happen when the original changes*: should every copy follow it, or should it stay as it was?",
          seen: [
            "*Denormalized, and correct:* an order history line keeps the price you actually paid. The product is $8 today and was $5 then, and the receipt must *not* follow. The copy is not laziness here, the copy is the fact.",
            "*Denormalized, and the usual default:* the posts [endpoint] returns each post with its author embedded, and you keep the responses exactly as they arrived. No transform code, and every component already holds what it needs. Then someone changes their display name and forty posts keep the old one until you refetch.",
            "*Normalized, and worth the work:* a chat where the server pushes \"user 7 renamed themselves\" down the [socket]. With users kept once by id, that is one write and every message, mention and member list updates together. Denormalized, it is a hunt through every list that happens to hold a copy.",
            "*What actually decides it:* how updates arrive. If you refresh whole lists, denormalized is fine, because each refetch replaces the copies wholesale. If single entities are patched live, you want one copy to patch.",
          ],
          say: "Name the values that must change everywhere *after* they are already on screen: those get normalized. Name the ones that are snapshots and must never move, like a paid price: those stay copied, deliberately. For the rest, say the honest thing, that a query cache like [TanStack Query] is denormalized by design and refetching is its answer to drift, which is why most apps never normalize at all.",
        },
      },
      {
        q: "Form state?",
        a: "Where a half filled form lives while it is being filled, and whether leaving the route is allowed to throw it away.",
        explain: {
          plain: "Everything about a form while it is being filled: the typed values, which fields have been touched, which are invalid, and whether it is currently being submitted.",
          seen: [
            "A form that forgets what you typed when you switch tabs, or that lets you hit Send twice and creates two orders, is form state nobody designed.",
          ],
          say: "Say where the half-filled form lives, whether leaving the route is allowed to throw it away, and what blocks a second submit while the first is still in flight.",
        },
      },
    ],
    tell: "You can point at any value on screen and say where it came from, who owns it, and when it expires.",
    draws: "Three layers get claimed: the store, the cache, and whatever is written to disk. This stage is where most frontend designs are actually decided.",
    lit: ["store", "cache", "persist"],
  },
  {
    n: 5,
    phase: "build",
    label: "Design the waiting",
    decides: "What is on screen before the data is, and when it never arrives?",
    checks: [
      {
        q: "Code splitting and lazy loading?",
        a: "Which route's code loads now, and which loads on demand.",
        explain: {
          plain: "Two halves of one idea. *Code splitting* is the build cutting that one giant [bundle] into pieces. *Lazy loading* is when a piece is actually fetched: not at startup, but the first time something renders it.",
          seen: [
            "*Unsplit:* someone opening the homepage downloads the reports page, the grid library and the emoji picker too, before anything on screen becomes clickable.",
            "*Split by route, free in a framework:* each route is already its own piece, so the homepage no longer carries the reports page.",
            "*Split by component, your call:* the reports page draws a 2,000 row table and drags in a grid library, a date picker and a CSV exporter with it. Nobody on the homepage should pay for that.",
            "*How it is written:* `const ReportsTable = lazy(() => import(\'./ReportsTable\'))`, rendered inside `<Suspense fallback={<TableSkeleton />}>`. The [lazy] call is what defers the import, and [Suspense] is what holds the space while the code is in flight. In Next.js the two in one call are [next/dynamic].",
            "*What it does not fix:* the 2,000 rows. Splitting changes when the table's *code* arrives, not what painting 2,000 rows costs once it is here. That is virtualization, two cards along.",
          ],
          say: "Split by route first, because that is where the big wins are. Then name the heavy components loaded on demand: editors, charts, grids, maps, anything most people never open. Then say what fills the space while the piece is in flight, because a lazy component without a fallback is a blank rectangle that moves the layout when it lands.",
        },
      },
      {
        q: "Progressive hydration / islands?",
        a: "Hydration: all at once, progressively, or *per island* where only some of the page is interactive.",
        explain: {
          plain: "[hydration] is the browser taking server-made HTML and wiring your JavaScript onto it, so a page you can read becomes a page you can click. Doing that to the whole page at once is the default. *Islands* is doing it only where it is needed, and leaving the rest as plain HTML forever.",
          seen: [
            "*The page:* a product page is a title, a photo, a description and a price. All of it is text the server already rendered.",
            "*The islands:* the add to cart button, the size picker, the reviews carousel. Three small things that need JavaScript, on a page that otherwise needs none.",
            "*In React terms:* a tree of Server Components with two or three `\"use client\"` leaves. Only those leaves ship JavaScript and only those hydrate; everything above them is HTML that was never going to change.",
            "*What it buys:* a cheap phone spends no time waking up code for a paragraph and a photo. Astro built a whole framework on this idea, and the App Router is the same bargain under different words.",
          ],
          say: "Name the interactive parts, and say out loud that everything else ships with no JavaScript at all. On a mostly static page this is the biggest single win available on a slow device, bigger than any amount of memoizing.",
        },
      },
      {
        q: "List virtualization?",
        a: "Long lists windowed, so the DOM stays small no matter how long the list gets.",
        explain: {
          plain: "Only building the rows that fit on screen, plus a few spare, no matter how long the list is. Scroll, and rows are recycled rather than added.",
          seen: [
            "*Plain list:* ten thousand real rows makes scrolling stutter and memory climb.",
            "*Virtualized:* the browser is only ever holding about twenty of them.",
          ],
          say: "Virtualize anything whose length the *user* controls. Then say how you keep it accessible and searchable, because rows that do not exist cannot be found by Ctrl+F or read aloud.",
        },
      },
      {
        q: "Image / video loading?",
        a: "Images and video sized, [deferred], and *given their space in advance* so nothing jumps.",
        explain: {
          plain: "Pictures and video are almost always the heaviest thing on a page, and they go wrong in three separate ways: the bytes you send, when you send them, and whether the layout knows how big they will be before they arrive.",
          seen: [
            "*Too many bytes:* a phone-sized slot handed a 4000 pixel wide photo. The browser scales it down and most of that data was downloaded for nothing.",
            "*Fetched too early:* twenty images below the fold competing for bandwidth with the one image the user can actually see. `loading=\"lazy\"` on the ones out of [viewport] is a single attribute and fixes it.",
            "*No space reserved:* the image lands, the text jumps down, you lose the line you were reading. `width` and `height` on the tag, or an aspect-ratio box, lets the browser hold the gap open before the file arrives.",
            "*Video, worse on every count:* no autoplay on a heavy file, a poster image as the placeholder, and the player itself loaded only when somebody presses play.",
          ],
          say: "Serve the size the slot actually needs in a modern format, [deferred] for everything out of view, with the space reserved in advance. Then name the one image that must *not* be deferred: the big one at the top, which is usually your [LCP].",
        },
      },
      {
        q: "Skeletons / placeholders?",
        a: "Placeholders shaped like the thing that replaces them, not a generic spinner.",
        explain: {
          plain: "What fills the space while the real content is still coming. A skeleton is a grey outline shaped like the thing about to appear. In React it is usually not a state you track at all: it is the `fallback` you hand [Suspense], shown for you while whatever sits inside is still waiting.",
          seen: [
            "*A spinner in the middle of nowhere:* tells you nothing at all.",
            "*Grey bars shaped like a list:* tell you a list is coming, roughly how much of it, and where it will sit.",
            "*Where it actually lives:* `<Suspense fallback={<ListSkeleton />}><Orders /></Suspense>`. The skeleton is the fallback, so no component has to know whether it is loading. In Next.js a route's `loading.tsx` is the same thing for a whole screen.",
            "*The flash:* data that arrives in 80ms still paints 80ms of skeleton, which reads as a flicker. Either keep the previous content on screen, or delay the skeleton so fast answers never show one.",
          ],
          say: "Shape the placeholder like its content so nothing moves when the real thing lands, and say where the boundary sits, because that is what decides how much of the screen goes grey at once. Then give your rule for the flash: hold the old content, or delay the skeleton.",
        },
      },
      {
        q: "Route transitions?",
        a: "Route transitions that keep the old screen until the new one can actually paint.",
        explain: {
          plain: "What is on screen in the moment between clicking a link and the new screen being ready to paint. The choice is whether the old screen stays up while the next one is prepared, or the page goes blank the instant you click.",
          seen: [
            "*Blanking the page instantly:* feels broken, even when the wait is short.",
            "*Holding the old screen until the new one can draw:* feels fast, even when it is not.",
            "*How React does it:* [useTransition]. The navigation goes inside `startTransition`, and the `isPending` flag it hands back is your cue to dim the old screen or run a progress bar, while React prepares the next one off to the side.",
            "*How the framework does it:* a route's `loading.tsx` is the fallback the App Router shows once it commits, and [useLinkStatus] gives one clicked link its own pending state for the gap before that.",
            "*The polish on top:* [View Transitions] for the cross-fade, so the swap reads as one movement instead of a cut.",
          ],
          say: "Say what stays on screen during the wait and what signals that something is happening, a pending state rather than a spinner over everything. Then say your rule for when holding becomes a skeleton, and what happens to scroll position and focus, which is the half everybody forgets.",
        },
      },
      {
        q: "Responsive layout?",
        a: "Layout that holds at the *small end*, not just at the width the design was drawn in.",
        explain: {
          plain: "The layout holding up at every width, from a small phone to a wide monitor, without pieces overlapping or scrolling sideways.",
          seen: [
            "Designs are usually drawn at desktop width.",
            "The small end is where tables overflow, buttons collide and long words break the grid.",
          ],
          say: "Design at the *small* end first and let it grow. Say your breakpoints and what actually changes at each, and watch out for tables, long words and anything with a fixed width.",
        },
      },
      {
        q: "Theming / design system?",
        a: "One theme and token layer, so no component can invent a colour of its own.",
        explain: {
          plain: "One shared set of colours, spacing and type that every component reads from, instead of each component inventing its own.",
          seen: [
            "*Without it:* nine slightly different greys, and a dark mode that is almost right everywhere.",
            "*With it:* dark mode is swapping one set of values.",
          ],
          say: "Say that components may not hardcode a colour or a size, only use tokens. That single rule is what makes theming, dark mode and rebranding possible later.",
        },
      },
      {
        q: "Accessibility states?",
        a: "Focus, announcements and state expressed to assistive tech as deliberately as they are to the eye.",
        explain: {
          plain: "Making the state of the interface readable to assistive tech, not just visible to the eye: what is loading, what failed, what is selected, where the focus went. Most of it comes free from using the right element, and the aria attributes are only for what is left over.",
          seen: [
            "*The right element first:* a `<button>` is focusable, fires on Enter and Space, and is announced as a button. A `<div onClick>` is none of those, and no amount of aria repairs it.",
            "*Loading:* a spinner a screen reader never announces is silence. Put the message in an [aria-live] region, or mark the region `aria-busy` while it waits.",
            "*Errors:* `aria-invalid` on the field that failed, the message tied to it with `aria-describedby`, and never colour alone to say which one it was.",
            "*Focus:* a dialog takes focus when it opens and gives it back to the trigger when it closes. A route change moves focus to the new heading, or a keyboard user is still stranded at the bottom of the last page.",
            "*Never delete the outline:* if `:focus-visible` is invisible, nobody can tell where they are. Restyle it, do not remove it.",
          ],
          say: "For each of the eight UI states, say how it is *announced*, not just how it looks. The order is semantic element first, aria second. The three that get missed are loading, errors, and where focus went.",
        },
      },
    ],
    tell: "Every screen has an answer for all eight states below, not just the one where everything worked.",
    draws: "The paint layers. The shell and the components are the only two boxes the user ever actually sees.",
    lit: ["shell", "ui"],
  },
  {
    n: 6,
    phase: "harden",
    label: "Harden the wire",
    decides: "What happens between the request leaving and the answer arriving, or not arriving at all?",
    checks: [
      {
        q: "Request lifecycle?",
        a: "One lifecycle every request goes through, so \"in flight\" is a state the UI can read.",
        explain: {
          plain: "A request is not one moment, it is four: *not asked for yet*, *on the wire*, *came back with an answer*, *came back with a failure*. Naming them matters because the screen has to show something different in each, which means \"in flight\" cannot live inside a function. It has to be a value a component can read.",
          seen: [
            "*Idle:* nothing has been asked for. The button is live and the list shows whatever was last known.",
            "*In flight:* the request is on the wire. The button is disabled so it cannot be pressed twice, and either a skeleton or the old data holds the space.",
            "*Settled, fine:* the answer is in the cache and the screen renders it. The only state anybody designs.",
            "*Settled, broken:* no answer, or an answer that says no. Something has to say which of the two it was, and offer the way out.",
            "*What a library hands you:* TanStack Query splits it in two, `status` for what you have (pending, error, success) and `fetchStatus` for whether a request is in the air right now. That split is exactly why you can show old data and a quiet spinner at the same time.",
          ],
          say: "Name the four states and what is on screen in each, then say where that state lives: in the data client, once, rather than as a `useState(false)` copied into forty components.",
        },
      },
      {
        q: "Retries and backoff?",
        a: "Retries with *backoff and a ceiling*, rather than a loop that hammers a struggling server.",
        explain: {
          plain: "A [retry] is sending the same request again after a failure. [backoff] is waiting longer between each attempt instead of firing them back to back. [jitter] is scattering those waits randomly, so ten thousand clients do not all come back on the same second.",
          seen: [
            "*The shape of it:*`async function withRetry(run, attempts = 3) {\n  for (let i = 0; ; i++) {\n    try { return await run(); }\n    catch (err) {\n      if (i >= attempts || !isRetryable(err)) throw err;\n      const wait = Math.min(30000, 500 * 2 ** i) * (0.5 + Math.random());\n      await new Promise(r => setTimeout(r, wait));\n    }\n  }\n}`",
            "*The same thing, configured:* in TanStack Query it is `retry: 3` with `retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000)`, and the default already backs off for you.",
            "*What must never be retried:* anything the server already answered. A 422 or a 403 will say the same thing forever. Only transport failures and 5xx are worth a second go.",
            "*The ceiling matters more than the delay:* with no cap you are hammering a server that is already struggling, and with no attempt limit you are doing it until the tab closes.",
          ],
          say: "Say what is retryable, how many attempts, with growing waits, jitter and a ceiling. Then say where it lives, in the one client every call goes through, so no component has to remember any of it.",
        },
      },
      {
        q: "Cancellation / abort?",
        a: "Cancellation, so a slow answer *cannot overwrite a newer one* that already landed.",
        explain: {
          plain: "Calling off a request whose answer you no longer want, so a slow old response cannot land on top of a newer one. On the web that is [AbortController]: you hand its signal to fetch, and calling abort makes that request reject instead of quietly resolving later.",
          seen: [
            "*The mechanism:*`const controller = new AbortController();\nfetch('/search?q=' + q, { signal: controller.signal });\n\n// a newer keystroke arrives\ncontroller.abort();`",
            "*In React it is the effect cleanup:* `useEffect(() => { const c = new AbortController(); run(c.signal); return () => c.abort(); }, [q])` cancels the previous search every time q changes.",
            "*[debounce] is the cheaper half:* wait 300ms after the last keystroke before sending anything at all. Ten letters become one request rather than ten aborted ones.",
            "*[throttle] is its sibling:* at most one call every N milliseconds, for things that fire continuously like scroll or resize. Debounce waits for quiet, throttle rations.",
            "*A query cache does both ends:* the queryFn is handed a signal, and changing the query key aborts the request it replaces.",
          ],
          say: "Say which inputs are debounced, which handlers are throttled, and that every request carries a signal so the one it replaces is aborted. Then say the rule underneath: an answer that arrives for something you are no longer showing is dropped, not rendered.",
        },
      },
      {
        q: "Deduping?",
        a: "Deduping identical calls already in flight instead of letting three components each ask.",
        explain: {
          plain: "Two things asking for the same data in the same moment should produce one request, not two. The technique never changes: give the request a key, keep the in-flight promise under that key, and hand that same promise to whoever asks next.",
          seen: [
            "*By hand, the whole idea:*`const inflight = new Map();\n\nfunction getUser(id) {\n  const key = 'user:' + id;\n  if (!inflight.has(key)) {\n    inflight.set(key, fetch('/users/' + id)\n      .then(r => r.json())\n      .finally(() => inflight.delete(key)));\n  }\n  return inflight.get(key);\n}`",
            "*In a store:* that same map lives in your Zustand or Redux store beside the data, so components subscribe to one entry and the store is the only thing that knows whether a fetch is already running.",
            "*In a query cache:* TanStack Query does it by key. Ten components calling `useQuery({ queryKey: ['user', 7] })` produce exactly one request, and all ten re-render when it lands.",
            "*Why it bites:* it is rarely two components racing. It is one component mounting twice, a parent re-rendering, and a list of forty rows each wanting the same lookup.",
          ],
          say: "Say requests are keyed and in-flight ones are shared, inside the data client, once. The moment deduping lives in components, forty of them solve it forty slightly different ways.",
        },
      },
      {
        q: "Batching?",
        a: "Batching chatter into one trip where the protocol allows it.",
        explain: {
          plain: "Collecting several small requests that happen within a few milliseconds of each other and sending them as one. Not because each is slow, but because each one costs a whole [round trip] and a connection slot.",
          seen: [
            "*The problem:* a table of fifty rows where each row fetches its own author. Fifty round trips, and the browser only runs a handful at a time, so the rest queue.",
            "*The fix is a queue and one tick of patience:*`let queue = [];\n\nfunction load(id) {\n  return new Promise(resolve => {\n    queue.push({ id, resolve });\n    if (queue.length === 1) queueMicrotask(flush);\n  });\n}\n\nasync function flush() {\n  const batch = queue;\n  queue = [];\n  const ids = batch.map(b => b.id).join(',');\n  const users = await fetch('/users?ids=' + ids).then(r => r.json());\n  batch.forEach(b => b.resolve(users[b.id]));\n}`",
            "*It has a name:* this is what DataLoader does, and what a GraphQL client does when it folds several queries into one document.",
            "*The price:* one tick of latency for everybody in the batch, and a server endpoint that accepts a list. Only worth it where the chatter is real.",
          ],
          say: "Say where the chatter is, how wide the window is (a microtask, or ten milliseconds), and that the endpoint takes a list. Then say what happens when one id in the batch fails, because a batch fails as a unit unless you design it not to.",
        },
      },
      {
        q: "Background refresh?",
        a: "Background refresh that updates data *without flashing the screen* the user is reading.",
        explain: {
          plain: "Showing the data you already have while quietly checking whether it is still true. The reader gets the old answer instantly, and the new one slides in underneath with no spinner and no blank screen.",
          seen: [
            "*The two flags that make it possible:* in TanStack Query `isPending` means you have nothing to show yet, and `isFetching` means a request is in the air right now. Old data plus isFetching *is* the background refresh.",
            "*What sets it off:* `staleTime` running out, the window regaining focus with `refetchOnWindowFocus`, the network coming back, or a stale query being mounted again.",
            "*Keeping the screen still:* `placeholderData: keepPreviousData` holds the current page's rows while the next page loads, so paging through a table never flashes empty.",
            "*The quiet tell:* dim the list slightly or run a thin bar while isFetching. The point is that someone can see it refreshing *without* the content being taken away from them.",
            "*The trap:* refreshing a list someone is halfway through clicking. If rows can move, refresh on focus rather than on a timer, or hold the new data until they are idle.",
          ],
          say: "Say what refreshes in the background and what triggers it, and say the content stays on screen while it does. Then say how it is signalled, because a silent refresh that moves a row out from under someone's finger is worse than no refresh at all.",
        },
      },
      {
        q: "Idempotency expectations?",
        a: "Idempotency, so a retried write does not become two writes.",
        explain: {
          plain: "[idempotent] means doing it twice has the same effect as doing it once. It matters because retries, double taps and flaky connections all mean one write can reach the server more than once. The client's job is to make the repeats *recognisable*.",
          seen: [
            "*Generate the key once per action, not per attempt:*`const key = crypto.randomUUID();   // once, when they click\n\nawait withRetry(() => fetch('/orders', {\n  method: 'POST',\n  headers: { 'Idempotency-Key': key },\n  body: JSON.stringify(order),\n}));`",
            "*Why once:* a fresh key on every retry is three different orders as far as the server is concerned. One key is what lets it answer \"I have already done this\" and return the original result.",
            "*Disabling the button is not this:* it stops the second click, and does nothing about the retry, the refresh, the restored tab or the second device.",
            "*Reads are already safe:* GET and PUT are idempotent by definition. POST is the one that needs a key, which is why you meet this header on payments and orders.",
          ],
          say: "Say which writes carry a client generated key and that the key survives every retry of that one action. Then say what the UI does when the server replies \"already done\": treat it as success, because it is.",
        },
      },
      {
        q: "Reconnect logic?",
        a: "Reconnect with [backoff], and an explicit *resync* for what was missed while disconnected.",
        explain: {
          plain: "A live connection will drop, so the only question is what happens next. Three separate jobs: *noticing* the drop, *reopening* on a growing delay, and *catching up* on what happened while you were gone. That third one is the resync, and it is the one that gets skipped.",
          seen: [
            "*Noticing:* the connection's close and error events, plus the browser's online, offline and visibilitychange. A phone that was asleep wakes up holding a connection that looks open and is already dead.",
            "*Reopening:* the same [backoff] and [jitter] as a retry, capped at something like thirty seconds, with a visible state while it is happening.",
            "*Resync, the skipped part:* a new connection does not replay what you missed. You have to ask: \"send me everything after event 4182\". [SSE] does this for you by replaying Last-Event-ID; with a [socket] it is yours to build.",
            "*What it looks like:*`socket.onclose = () => {\n  const wait = Math.min(30000, 500 * 2 ** attempt++) * (0.5 + Math.random());\n  setTimeout(() => connect({ since: lastEventId }), wait);\n};`",
            "*When the gap is too big:* past some number of missed events, stop replaying and refetch the whole thing. Catching up one event at a time through an hour offline is slower than starting again.",
          ],
          say: "Say how a drop is detected, how long you wait between attempts, what the user sees meanwhile, and exactly how you catch up: a cursor, a sequence number, or a full refetch when the gap is too wide. *A reconnect with no resync is an app that looks fine and is quietly wrong.*",
        },
      },
      {
        q: "Event ordering?",
        a: "Event ordering, because the socket does not promise to deliver in the order things happened.",
        explain: {
          plain: "Messages on a live connection do not arrive in the order things happened, and after a reconnect they definitely do not. Ordering is making the client apply them in the order the *server* decided, rather than the order the network happened to deliver.",
          seen: [
            "*What makes it possible:* every event carries a number the server increments, per channel. Arrival time is not an order, and the client's clock is no help at all.",
            "*How you apply one:*`if (event.seq <= lastSeq) return;              // already applied, drop it\nif (event.seq > lastSeq + 1) return resync(lastSeq);  // a gap: go and ask\n\napply(event);\nlastSeq = event.seq;`",
            "*Why duplicates turn up:* delivery is at-least-once. A [socket] that reconnects may replay its last few events, so the same \"message added\" arrives twice and the message appears twice unless you drop by id.",
            "*The ordering nobody mentions:* your own [optimistic] update racing the server's echo of it. Match them on a client generated id, or you render your own message twice.",
          ],
          say: "Say events carry a sequence number or an id, that anything already applied is dropped, and that a gap triggers a resync rather than a guess. Then say how the server's echo of your own write is matched back to the copy already on screen.",
        },
      },
      {
        q: "Conflict resolution?",
        a: "Conflict resolution for when two clients edited the same thing.",
        explain: {
          plain: "Two people changed the same thing and the client has to decide what you now see, without quietly throwing somebody's work away. On the frontend that is three jobs: *notice* the collision, *keep* the user's input, and *offer* a way out.",
          seen: [
            "*Noticing it:* send the version you loaded along with the write, as a field or an If-Match header carrying the [ETag]. The server compares and answers 409 Conflict if it has moved on. No version sent, no conflict detected, and the loser never finds out.",
            "*Last write wins:* the default if you do nothing. Someone's change disappears with nobody told. Fine for a settings toggle, wrong for anything someone typed.",
            "*Merge by field:* they changed the title, you changed the body, apply both. Safe only when the fields are genuinely independent, which is a product decision more than a technical one.",
            "*Hand it back to the user:* \"this changed while you were editing\", both versions, and a choice. Slow, honest, and the right answer whenever the work is expensive to redo.",
            "*The rule under all of it:* never discard what they typed. Keep the draft locally, show the conflict, let them reapply. Reloading the page out from under someone is the unforgivable one.",
            "*When it is the whole product:* shared editing needs [CRDT] style merging or server side transformation. That is the point where you stop hand-rolling and pick a library.",
          ],
          say: "Say how a conflict is detected, a version or etag plus a 409, which fields merge on their own, and what the user is shown when they cannot. Then say where their unsaved work lives while that conversation is happening.",
        },
      },
      {
        q: "Transport error or domain error?",
        a: "*Transport failures told apart from domain failures*. A 500 and a rejected form are not the same error.",
        explain: {
          plain: "One question separates them: *did the server receive it and decide?* If the request never arrived, or the answer never came back, that is a transport error and nobody has decided anything yet. If the server read it, understood it and said no, that is a domain error, and the no is a real answer.",
          seen: [
            "*Transport:* offline, DNS failure, a timeout, CORS, a 500, a connection dropped mid-flight. What you asked for may have happened or may not. Retrying makes sense.",
            "*Domain:* \"that email is already taken\", \"card declined\", \"you do not have permission\", \"that file is too large\". The server worked perfectly and the answer is no. Retrying the identical request earns the identical no, forever.",
            "*Why they get confused:* both land in the same catch block. That is exactly how they end up collapsed into one \"something went wrong\", which tells the user nothing about whether pressing the button again could possibly help.",
            "*So they must not look the same on screen:* a transport failure gets a banner and a Retry button. A domain failure gets a sentence next to the field that caused it, in the user's words, with no retry button at all.",
            "*The giveaway:* if your [retry] logic ever retries a 422, the two are not separated.",
          ],
          say: "Say the data client labels every failure as transport or domain before it leaves, that only transport failures are retried, and that the two have different homes on screen: a banner you can retry, or a sentence beside the input.",
        },
      },
    ],
    tell: "Losing the network for ten seconds is a state your UI already has a design for, not a bug report.",
    draws: "The data client, the cache it fills, and the boundary they talk across. Everything here is about a trip that might not come back.",
    lit: ["data", "cache", "net"],
  },
  {
    n: 7,
    phase: "harden",
    label: "Spend the budget",
    decides: "What is the user's device paying for, and is each item worth it?",
    checks: [
      {
        q: "Bundle splitting and route-based loading?",
        a: "Bundles split per route, with shared code hoisted once instead of shipped twice.",
        explain: {
          plain: "A bundle is the file of JavaScript the browser downloads. Splitting it means shipping one piece per route instead of one file containing the entire app.",
          seen: [
            "On a big unsplit app the first visit downloads the whole product, including screens that person will never open, before anything becomes clickable.",
          ],
          say: "Split per route, and make sure code used by several routes is hoisted into one shared piece rather than copied into each. Then check the output, not the intention.",
        },
      },
      {
        q: "Tree shaking?",
        a: "Dead code *actually* shaken out, verified in the built output rather than assumed.",
        explain: {
          plain: "The build tool dropping code nothing actually uses. Picture shaking a tree so the dead leaves fall off.",
          seen: [
            "Importing one function from a big library and accidentally shipping all of it is the normal failure here, and it can be hundreds of kilobytes of nothing.",
          ],
          say: "Say you *verify* it in the built output rather than assuming it happened. Certain import styles quietly defeat it, and you only find out by looking.",
        },
      },
      {
        q: "Prefetching?",
        a: "Prefetching the *next likely* route, not every route, which is just the old bundle with extra steps.",
        explain: {
          plain: "Fetching something *before* it is asked for, so it is already there when the click comes.",
          seen: [
            "*The next likely route:* hovering a link and finding the page already loading is why some sites feel instant.",
            "*Every link on the page:* downloading the whole app again, with extra steps.",
          ],
          say: "Prefetch the *next likely* thing only, and say how you guessed: hover, visible in the [viewport], or the obvious next step in a flow. Respect slow connections and data saver.",
        },
      },
      {
        q: "Memoization?",
        a: "Memoization where a profiler said so, not everywhere a wasted render was suspected.",
        explain: {
          plain: "Remembering the result of an expensive calculation so you do not redo it when nothing has changed.",
          seen: [
            "*Without it:* sorting ten thousand rows again on every keystroke.",
            "*Memoized:* it sorts again only when the rows or the sort actually change.",
          ],
          say: "Say you memoize where a profiler pointed, not everywhere you suspect. Memoizing has its own cost, and sprinkling it everywhere usually makes things slightly worse and much harder to read.",
        },
      },
      {
        q: "Virtualization?",
        a: "Virtualization for anything whose length the user controls.",
        explain: {
          plain: "Only rendering what is visible, so a long list costs about the same as a short one.",
          seen: [
            "Same technique as the UI stage, but here it is on the performance list because it is often the difference between a janky scroll and a smooth one.",
          ],
          say: "Virtualize anything whose length the user controls, then say how search, keyboard navigation and screen readers still work when most rows do not exist.",
        },
      },
      {
        q: "Image optimization?",
        a: "Images served in the format and the size the slot actually needs.",
        explain: {
          plain: "Three separate wins, usually worth doing in this order: send fewer bytes for the same picture (format and compression), send one sized for the slot it lands in ([srcset]), and never let it move the layout when it arrives.",
          seen: [
            "*Format first, the biggest single win:* the same photo as AVIF is often half the size of the JPEG at the same quality, with WebP as the fallback. The browser picks whichever it understands:`<picture>\n  <source type=\"image/avif\" srcset=\"hero.avif\">\n  <source type=\"image/webp\" srcset=\"hero.webp\">\n  <img src=\"hero.jpg\" width=\"800\" height=\"450\" alt=\"\">\n</picture>`",
            "*One size per slot, with [srcset]:* you publish a few widths and let the browser choose, screen density included.`<img src=\"hero-800.jpg\"\n     srcset=\"hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w\"\n     sizes=\"(max-width: 600px) 100vw, 800px\"\n     width=\"800\" height=\"450\" alt=\"\">`",
            "*Priority, in both directions:* the hero gets `fetchpriority=\"high\"` and must never be lazy. Everything below the fold gets `loading=\"lazy\" decoding=\"async\"`.",
            "*Hold the space:* width and height on the tag, or an aspect-ratio box in CSS, so the gap exists before the bytes do. Without it every image that lands is a [reflow] and a hit to [CLS].",
            "*What a framework folds together:* `next/image` is this whole list in one component. It generates the widths, serves AVIF or WebP, sets the dimensions, lazy loads by default, and takes a priority flag for the one at the top.",
          ],
          say: "Name the format, that widths are generated per slot and chosen with srcset, that dimensions are reserved, and which single image is the [LCP] one and therefore eager and high priority. Then say where the resizing happens: at build time, or in an image CDN on the way through.",
        },
      },
      {
        q: "Font loading?",
        a: "Fonts loaded without a [reflow] and without an invisible paragraph.",
        explain: {
          plain: "A custom font arrives after the page does, so there is a window where the text is either invisible or shown in a fallback and then laid out again when the real font lands. That relayout is a [reflow], the expensive kind of change: every position has to be worked out again, not just recoloured, which would only be a [repaint].",
          seen: [
            "*The two bad moments have names:* a blank heading is FOIT, a flash of invisible text. A heading that appears and then jumps is FOUT, a flash of unstyled text.",
            "*Pick FOUT on purpose:* `font-display: swap` shows the fallback immediately and swaps when the real font arrives. Ugly for 200ms beats unreadable for 200ms.",
            "*Then stop the jump:* `<link rel=\"preload\" as=\"font\" crossorigin>` so the file starts early, subset the font to the characters you actually use, and match the fallback's metrics with `size-adjust` and `ascent-override` so the swap moves nothing at all.",
            "*The free option:* a good system font stack costs zero bytes and never swaps. Worth saying out loud before anyone picks three weights of a webfont.",
          ],
          say: "Say the font is preloaded and subset, that `font-display: swap` is deliberate, and that the fallback's metrics are matched so the swap causes no reflow. Then say how many families and weights you are actually shipping, because that is the number that matters.",
        },
      },
      {
        q: "Worker offloading, and avoiding main-thread blocking?",
        a: "Heavy work moved off the main thread so the *frame still lands*.",
        explain: {
          plain: "The [main thread] draws the screen and handles your taps. Anything slow running on it freezes the page, so slow work moves to a worker.",
          seen: [
            "A [frame] is about sixteen milliseconds.",
            "One function that takes two hundred means twelve dropped frames, which people feel as the page being stuck.",
          ],
          say: "Name what moves off the main thread: parsing, crunching, encrypting, big transforms. Then say that nothing on the main thread is allowed to run long enough to miss a frame.",
        },
      },
      {
        q: "Caching layers?",
        a: "Each caching layer paired with a named invalidation story, or it is a bug with good latency.",
        explain: {
          plain: "There is never one cache. A single response can be held by four things at once, each with its own idea of how long it stays true, and each able to hand back something old long after you fixed it.",
          seen: [
            "*The [HTTP cache]:* the browser's own, invalidated only by the URL changing. That is exactly why built files carry a hash in the name, and why you cannot clear it from JavaScript.",
            "*The [CDN]:* invalidated by a purge or by waiting out its TTL. Minutes, usually, not instantly, and not per user.",
            "*Your [in-memory cache]:* the query cache in the tab. You invalidate it by key, and it dies with the tab.",
            "*A [service worker], if you have one:* it answers requests itself and *outlives the tab*. A bad one serves last week's app to somebody who has refreshed five times.",
            "*Why the bug is so confusing:* you see the fix, a colleague does not, and you are both running the same code. The difference is only which layer answered.",
          ],
          say: "For every layer you name, say how it is invalidated and how long stale is allowed to last there. *A caching layer with no invalidation story is a bug with good latency.*",
        },
      },
    ],
    tell: "Every metric below has a budget, and you know which one you are closest to blowing.",
    draws: "The three layers that cost frames: what paints, what computes, and what waits on the network.",
    lit: ["ui", "workers", "data", "telemetry"],
  },
  {
    n: 8,
    phase: "harden",
    label: "Plan the failure",
    decides: "When one piece breaks, what still works?",
    checks: [
      {
        q: "Graceful degradation?",
        a: "Degrading to something *useful* rather than to a blank screen with a console error behind it.",
        explain: {
          plain: "When something breaks, the app drops to something *useful* instead of to nothing.",
          seen: [
            "A dashboard where the chart service is down can still show the numbers.",
            "A map that fails can still show the list of addresses.",
            "Both beat a blank screen with an error in the console.",
          ],
          say: "For each feature, say what the reduced version is. If the only answer is \"it breaks\", that is the design, and now it is at least a deliberate one.",
        },
      },
      {
        q: "Error boundaries?",
        a: "Error boundaries drawn *per panel*, so one dead widget does not take the page with it.",
        explain: {
          plain: "A fence around part of the screen that catches a crash inside it, so the rest of the page survives.",
          seen: [
            "*Without one:* a single bad widget throwing an exception blanks the entire page.",
            "*With one:* a small \"this panel failed\" box, and everything around it keeps working.",
          ],
          say: "Say where the fences are, *per panel*, and what each one shows when it catches something. One boundary wrapped around the whole app is barely better than none.",
        },
      },
      {
        q: "Partial rendering?",
        a: "Partial rendering as a designed outcome, not an accident of load order.",
        explain: {
          plain: "Deliberately showing the parts that are ready while others are still loading or already failed.",
          seen: [
            "Three panels, one of them slow.",
            "*With it:* the two fast panels paint immediately.",
            "*Without it:* the fastest panel waits for the slowest one, for no reason at all.",
          ],
          say: "Say which regions render independently and that one slow or failed region cannot hold the others hostage. That is a design decision, not something load order does for you.",
        },
      },
      {
        q: "Autosave / draft recovery?",
        a: "Autosave and draft recovery, so a refresh never costs the user work.",
        explain: {
          plain: "Saving what someone is typing as they type, so a crash, a refresh or a closed tab does not cost them their work.",
          seen: [
            "Long form, phone rings, tab gone.",
            "Whether the text is still there when they come back is decided entirely by this.",
          ],
          say: "Say how often you save, where it goes, and how the draft is offered back. Then say how you handle the awkward case: a draft on the device that is older than the server's version.",
        },
      },
      {
        q: "Retry and reconnect?",
        a: "Reconnect and resync treated as a normal path through the app.",
        explain: {
          plain: "Treating a dropped connection as a normal thing that happens, with a route back to working, rather than as a crash.",
          seen: [
            "Trains, lifts, hotel wifi: connections drop constantly.",
            "The only question is whether your app notices and comes back.",
          ],
          say: "Say that reconnect is a normal path through the app, with growing waits, a catch-up step for what was missed, and a visible state while it is happening.",
        },
      },
      {
        q: "Offline fallback?",
        a: "An offline fallback with an *honest label* about what is stale and what is missing.",
        explain: {
          plain: "What is on screen when there is no connection at all, and how honest it is about what you are looking at. There are only two real failures here: emptying the screen because you could not refresh it, and *showing old data as though it were live*.",
          seen: [
            "*The train goes into a tunnel:* the feed you already loaded is still on screen. Scrolling back through those posts is reading from the device, not the network, so it should carry on working exactly as before.",
            "*What it has to say:* a thin bar at the top reading \"offline, showing posts from 14:02\". The feed is not wrong, it is old, and the label is the only thing that makes that difference visible.",
            "*Pull to refresh with no signal:* fails, says so, and leaves the list exactly as it was. What it must never do is spin forever, or replace forty cached posts with an empty state.",
            "*The edge of the cache:* scroll past the last post you have and there is nothing underneath. That is \"more posts when you are back online\", not an infinite spinner pretending the next page is on its way.",
            "*Writes queue, visibly:* the like turns red and the reply is accepted and marked pending, both sent when the signal comes back. Accepting them and then losing them is the one unforgivable version of this.",
            "*Images are the trap:* a post's text is tiny and cached, its photo is not. A grey rectangle with no explanation reads as a broken app; one that says the image needs a connection does not.",
          ],
          say: "Say what still works offline (reading whatever is already on the device), what queues for later (likes, replies, drafts), and what is blocked outright (payments, anything you cannot reconcile afterwards). Then say how [stale] content is labelled and where the queue lives, because an outbox that does not survive the tab closing is not an outbox.",
        },
      },
      {
        q: "Feature flags and kill switches?",
        a: "Flags and kill switches on anything you might need to turn off without a deploy.",
        explain: {
          plain: "A switch outside the code that turns something on or off without shipping a new version. A kill switch is the same thing used in a hurry.",
          seen: [
            "A new feature melting down at 2am is a one-click fix with a flag, and a frantic deploy without one.",
          ],
          say: "Say which features sit behind a flag and who can flip them. Anything risky, expensive or new belongs behind one.",
        },
      },
      {
        q: "State recovery after refresh?",
        a: "State recovery after a refresh, back to the screen they were actually on.",
        explain: {
          plain: "Coming back to where you *were* rather than to the front door. It is entirely a client side job, and it is really four smaller ones, because the four kinds of state from stage 4 each recover differently: the URL carries where you were, the device carries what you typed, the server is refetched, and the rest is allowed to die.",
          seen: [
            "*Where they were, from the URL:* route, tab, step, filters, sort, page. If it is in the address bar it recovers for free, and it survives being pasted to somebody else too.",
            "*What they typed, from the device:* a draft saved while they type, keyed by what it belongs to, with enough context to judge it later.`const key = 'draft:order:' + orderId;\n\nsave(() => localStorage.setItem(key, JSON.stringify({\n  values,\n  savedAt: Date.now(),\n  basedOn: serverVersion,   // the version it was edited against\n  schema: 2,                // your shape, so old drafts can be dropped\n})));`",
            "*Save on the right event:* debounce while typing, and flush on `visibilitychange` when the page goes hidden. `beforeunload` does not reliably fire on a phone, which is exactly where tabs get killed.",
            "*The reconcile, which is the actual question:*`const draft = JSON.parse(localStorage.getItem(key) || 'null');\n\nif (!draft || draft.schema !== 2) discard(key);              // from an older app\nelse if (draft.basedOn === serverVersion) restore(draft);    // nothing moved: just restore\nelse offerBoth(draft, server);                               // it moved: ask, never overwrite`",
            "*What the three branches mean:* if the server has not changed since the draft was written, restore it silently. If it has (compare a version or an [ETag]), show both and let them choose. If the draft is from an older shape of your app, throw it away rather than restoring something half valid.",
            "*What never gets persisted:* server data, which is borrowed and should be refetched, and anything sensitive. A draft carrying card details in localStorage is a stage 9 problem you created in stage 8.",
            "*Scroll position:* restore by the id of the item they were looking at, not by pixel offset. Once a list is virtualized or the data has changed length, a pixel offset points at a different row entirely.",
          ],
          say: "Say which of the four kinds survives and where: the URL for where they were, the device for what they typed, a refetch for whatever the server owns, nothing for the rest. Then say how a restored draft is reconciled with a server that moved on, and the three reasons you bin one: too old, wrong schema, or already submitted.",
        },
      },
      {
        q: "Version mismatch between frontend and backend?",
        a: "A version skew story for when the loaded client is older than the API it is calling.",
        explain: {
          plain: "A tab someone left open yesterday is running yesterday's code against today's API. Those two can disagree.",
          seen: [
            "The old client calls an [endpoint] that no longer exists, or sends a field the server renamed, and the user gets a mystery error on a page that worked this morning.",
          ],
          say: "Say the client sends its version, and that a mismatch produces a clear \"please reload\" rather than an unexplained failure. Keep the API backwards compatible for long enough that open tabs are not an incident.",
        },
      },
    ],
    tell: "For each panel on the page, you can say what the user sees when only that panel fails.",
    draws: "Everything that holds a copy of the truth, plus the boundary that stops being reliable. Resilience is mostly a question about stale data.",
    lit: ["cache", "persist", "data", "net"],
  },
  {
    n: 9,
    phase: "harden",
    label: "Hold the trust boundary",
    decides: "What can a hostile user, or a hostile page, do from the client?",
    checks: [
      {
        q: "Auth flow?",
        a: "The auth flow end to end, *including the token expiring mid session* while a form is half filled.",
        explain: {
          plain: "The whole path of becoming and staying signed in: logging in, holding proof of it, refreshing that proof, and logging out.",
          seen: [
            "The interesting part is never the login form. It is the [token] quietly expiring while someone is halfway through a form, and whether they lose their work.",
          ],
          say: "Walk it end to end *including expiry mid-session*: what refreshes silently, what is retried after refresh, and what happens to the half-filled form.",
        },
      },
      {
        q: "Token / cookie handling?",
        a: "Tokens in the right store, with the right flags, for the right lifetime.",
        explain: {
          plain: "A token is the slip of paper that proves you already logged in. This is where it is kept and how long it lasts.",
          seen: [
            "*In ordinary JavaScript storage:* any script that gets onto your page can read the token.",
            "*In an HttpOnly cookie:* it cannot, which is why that is usually the safer home.",
          ],
          say: "Say where the token lives, which flags it has, and how long it is valid. Short lifetimes plus a refresh step beats one long-lived token sitting somewhere readable.",
        },
      },
      {
        q: "CSRF and XSS?",
        a: "CSRF and XSS treated as two problems with two defences, not one word.",
        explain: {
          plain: "Two different attacks people say in one breath. XSS is somebody getting *their* JavaScript to run on your page. CSRF is another site making your browser send a request *as you*, using cookies it cannot read but can trigger.",
          seen: [
            "*XSS:* a comment containing a script, which the site then renders as real HTML.",
            "*CSRF:* a hidden form on a dodgy page that quietly posts to your bank, with your cookie attached.",
          ],
          say: "Two problems, two defences. XSS: never inject untrusted HTML, plus a content security policy. CSRF: tokens or SameSite cookies. Saying one word for both is the mistake.",
        },
      },
      {
        q: "Permission-based UI?",
        a: "Permission shaped UI that hides the button *and still expects the server to check*.",
        explain: {
          plain: "Hiding or disabling things someone is not allowed to use. Useful, and *not* security.",
          seen: [
            "Anyone can open devtools and unhide a button, or just call the [endpoint] directly with no browser involved at all.",
          ],
          say: "Say you hide it for clarity *and* that the server checks every single time. The UI is a convenience over the real check, never a replacement for it.",
        },
      },
      {
        q: "Secret exposure?",
        a: "No secret in the bundle. Ever. *Everything you ship to the client is public.*",
        explain: {
          plain: "Everything you ship to the browser is public. API keys, private endpoints, anything in the [bundle], all readable by anyone in about four seconds.",
          seen: [
            "People find keys in frontend bundles constantly.",
            "A search of public sites will turn up thousands, and bots check for them automatically.",
          ],
          say: "Say it flatly: *no secret ever goes in the client*. If a call needs a secret, it goes through your own server, which holds the secret and never sends it down.",
        },
      },
      {
        q: "Sensitive data in logs?",
        a: "Nothing sensitive in logs, analytics payloads, or error reports.",
        explain: {
          plain: "Logs, analytics events and crash reports get sent somewhere else and kept for a long time. Whatever you put in them, you have handed to a third party.",
          seen: [
            "A crash report that includes the whole form, including the password field someone had just typed, is a leak nobody intended and everybody keeps.",
          ],
          say: "Name what is stripped before anything is sent: tokens, passwords, personal details, full request bodies. Say it is stripped at the source, not filtered later.",
        },
      },
      {
        q: "iframe / cross-origin considerations?",
        a: "Cross origin embedding decided both ways: what you frame, and who is allowed to frame you.",
        explain: {
          plain: "Two questions, both yours. What other sites are you willing to put inside your page, and who is allowed to put *your* page inside theirs.",
          seen: [
            "An embedded third-party widget can do things on your page if you let it.",
            "Your app framed inside someone else's site is how clickjacking works.",
          ],
          say: "Answer both directions: what you embed and how it is sandboxed, and who may frame you, set by a header rather than left to chance.",
        },
      },
      {
        q: "File upload safety?",
        a: "Upload validation on type, size and content, on the client for feedback and on the server for truth.",
        explain: {
          plain: "People will pick the wrong file, the enormous file, and occasionally the hostile one. Everything you do in the browser here is *feedback*: it saves somebody a forty megabyte upload that was going to be rejected anyway. None of it is a security control, because anyone can skip your page and post to the endpoint directly.",
          seen: [
            "*The picker hint:* `accept=\"image/png,image/jpeg\"` filters the file dialog and nothing else. It does not apply to drag and drop, and it does not apply to a renamed file. A convenience, not a check.",
            "*Size, before you read a single byte:* `if (file.size > 5 * 1024 * 1024) return reject('Under 5 MB, please')`. Failing here costs the user nothing at all.",
            "*Type, properly:* `file.type` is guessed from the extension, so renaming anything to .png makes it lie. The honest check is the first few bytes, the file's own signature.`const SIGNATURES = {\n  'image/png':  [0x89, 0x50, 0x4e, 0x47],\n  'image/jpeg': [0xff, 0xd8, 0xff],\n};\n\nasync function looksLike(file, type) {\n  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());\n  return SIGNATURES[type].every((byte, i) => head[i] === byte);\n}`",
            "*For images, make the browser decode it:* `await createImageBitmap(file)` throws if the bytes are not a real image, and hands back width and height, so you can refuse a 20,000 pixel wide one before it reaches whatever makes your thumbnails.",
            "*Re-encode before sending, where you can:* drawing it onto a canvas and exporting strips [EXIF], including where the photo was taken, drops anything hidden in the container, and usually makes the file much smaller as a side effect.",
            "*SVG is the one that bites:* it is XML, it can contain a script tag, and rendering an uploaded one inline runs that script on your origin. Rasterise it, or serve it through an img tag from a different origin, but never inline it.",
            "*The filename is user input too:* never use it as a storage key, strip any path out of it, and escape it when you print it back. A file named with a tag in it is a stored XSS waiting for your file list to render it.",
            "*If the browser uploads straight to storage:* a [presigned URL] bypasses your server entirely, so the limits have to be baked into the signature itself, a content type and a length range. Otherwise every check you wrote lives in a page the uploader never had to open.",
          ],
          say: "Say the client checks exist for speed of feedback and that the server repeats every one of them. Name the limits: size, dimensions, and types verified by signature rather than by extension. Then say what happens to SVG, and where files are stored and served from, which should be a different origin with nosniff set, so an uploaded file can never execute as your site.",
        },
      },
      {
        q: "Clickjacking?",
        a: "Clickjacking defences anywhere a single click has consequences.",
        explain: {
          plain: "Loading your page inside an invisible frame on top of something tempting, so a click lands on your button instead of what the person thought they were pressing.",
          seen: [
            "A \"you won a prize\" page with your transfer confirmation hidden at zero opacity under the cursor.",
            "They click the prize; they confirm the transfer.",
          ],
          say: "Say you forbid framing by default with a header, and allow it only for partners you name. Anywhere one click has consequences needs this.",
        },
      },
    ],
    tell: "You can say, out loud, that nothing on the client is a security control, only a convenience over one that lives on the server.",
    draws: "Identity, what is written to disk, what crosses the wire, and what gets logged. Every one of them is reachable by someone with devtools open.",
    lit: ["session", "persist", "net", "telemetry"],
  },
];

/* The stack, top to bottom. `kind` is the mono label; `id` is what a stage claims. */
export const layers = [
  { id: "shell", kind: "FRAME", name: "Shell + Router" },
  { id: "ui", kind: "PAINT", name: "UI components" },
  { id: "store", kind: "CLIENT TRUTH", name: "Store" },
  { id: "cache", kind: "SERVER ANSWERS", name: "Cache" },
  { id: "data", kind: "EVERY CALL OUT", name: "Data client" },
  { id: "workers", kind: "OFF MAIN THREAD", name: "Workers" },
  { id: "persist", kind: "SURVIVES REFRESH", name: "Persistence" },
];

export const crossCutting = [
  { id: "session", name: "Session / auth" },
  { id: "telemetry", name: "Telemetry" },
];

/* Fractions of the plot area, origin at the bottom left. Kept inside 0.19-0.88
   vertically so nothing collides with the corner rules. */
export const stateItems = [
  { label: "Theme preference", x: 0.06, y: 0.86 },
  { label: "URL / route state", x: 0.14, y: 0.70 },
  { label: "Unsaved form draft", x: 0.10, y: 0.46 },
  { label: "Scroll position", x: 0.26, y: 0.28 },
  { label: "Hover / focus", x: 0.08, y: 0.19 },
  { label: "Session / identity", x: 0.92, y: 0.82 },
  { label: "Cached query result", x: 0.86, y: 0.56 },
  { label: "Fetched list in view", x: 0.80, y: 0.26 },
];

export const quadrants = [
  { id: "tl", rule: "You have to persist it. Nobody else will.", x: 100, y: 86, anchor: "start" },
  { id: "tr", rule: "Cache it, and own the invalidation.", x: 640, y: 86, anchor: "end" },
  { id: "bl", rule: "Let it die with the render.", x: 100, y: 340, anchor: "start" },
  { id: "br", rule: "Fetch it again. Don't store it.", x: 640, y: 340, anchor: "end" },
] as const;

/* Published Core Web Vitals thresholds: at or under `good` is good, over `poor`
   is poor, between them is the middle band. `scale` is only the axis length. */
export const vitals = [
  {
    name: "LCP",
    full: "Largest Contentful Paint",
    good: 2.5,
    poor: 4,
    scale: 6,
    unit: "s",
    means: "How long until the biggest thing on screen, usually the hero image or the headline, has actually painted. The closest single number to \"when does this page feel like it is here\".",
  },
  {
    name: "INP",
    full: "Interaction to Next Paint",
    good: 200,
    poor: 500,
    scale: 800,
    unit: "ms",
    means: "How long a tap or a keypress takes to produce a visible change. This is the one that decides whether the page feels alive or stuck.",
  },
  {
    name: "CLS",
    full: "Cumulative Layout Shift",
    good: 0.1,
    poor: 0.25,
    scale: 0.4,
    unit: "",
    means: "How much the page jumps around while it loads, scored rather than timed. Almost always an image, an ad or a font arriving without its space reserved.",
  },
  {
    name: "TTFB",
    full: "Time to First Byte",
    good: 0.8,
    poor: 1.8,
    scale: 3,
    unit: "s",
    means: "How long the server takes to send the first byte of the response. Everything else on this list only starts counting after it.",
  },
];

export const ownBudgets = [
  {
    name: "JS bundle size",
    start: "~170KB compressed, first route",
    note: "What has to arrive and run before the page works. Measure the route someone actually lands on, not the whole app.",
  },
  {
    name: "Memory",
    start: "flat after 10 minutes",
    note: "The shape matters more than the number. A tab that climbs while you scroll a long list is leaking rows somewhere.",
  },
  {
    name: "Dropped frames",
    start: "no task over 50ms",
    note: "A frame is drawn every 16ms, so one long task on the main thread is visible as a stutter during a scroll or a drag.",
  },
  {
    name: "API latency",
    start: "p75, not the average",
    note: "The average hides the slow quarter of your users. Budget the 75th percentile and the number stops lying to you.",
  },
  {
    name: "Error rate",
    start: "a ceiling you alert on",
    note: "Failed requests and caught exceptions per session. This one is not a target to hit, it is a line that pages somebody.",
  },
];

export const uiStates = [
  { label: "Loading", note: "and for how long before you say something" },
  { label: "Success", note: "the only one anyone designs" },
  { label: "Error", note: "transport, or domain: say which" },
  { label: "Empty", note: "never used it, versus nothing matched" },
  { label: "Stale", note: "shown, and labelled as old" },
  { label: "Offline", note: "what still works, stated plainly" },
  { label: "Unauthorized", note: "sign in, or you may not: two different screens" },
  { label: "Pending", note: "optimistic, and reversible" },
];

export const whyThisExists = [
  "Backend system design has a settled shape: boxes, arrows, and a request moving between them. *Run that playbook on a frontend and you draw three boxes and stop*, because the interesting parts aren't components, they're ownership and timing.",
  "The frontend's hard problems are the ones a topology diagram can't show: *who owns this value, how stale is it allowed to be, and what is on screen while we find out*.",
  "Most frontend design failures are not architectural. They are *a state that nobody designed*: the empty list, the expired token, the second tab, the request that came back after the user navigated away.",
  "And unlike a server, *you don't control the machine your code runs on*. The budget is set by the worst device in your requirements, which is why stage 1 has to name it.",
];

export const differences = [
  ["The unit of design", "A service, and the contract around it", "A layer, and who owns the data crossing it"],
  ["What the diagram shows", "Topology: what calls what", "Ownership: who holds which truth, and for how long"],
  ["Where scale bites", "Many users hitting one system", "One user on one slow device, holding one tab open for hours"],
  ["The failure you plan for", "A node dies and traffic reroutes", "The network vanishes mid write and the user keeps typing"],
  ["What you can't control", "Someone else's traffic spike", "Someone else's hardware, browser, and extensions"],
  ["Who can read your code", "Nobody outside the [VPC]", "*Everybody*, with devtools, in about four seconds"],
];

export const commonMistakes = [
  "Answering \"design Figma\" with a box diagram, when the whole question is how two people editing the same thing converge.",
  "Treating server data as client state, then spending the rest of the project syncing two sources of truth that were never meant to agree.",
  "Reaching for a WebSocket when the requirement was \"fresh\", not \"live\", and inheriting reconnect, ordering and resync for nothing.",
  "Designing only the success state, then discovering the other seven in production one support ticket at a time.",
  "Optimising renders before measuring, while the actual cost is an unsplit bundle and three fonts.",
  "Listing performance techniques without a budget, which makes every one of them optional and none of them checkable.",
  "Hiding a button for permissions and calling it authorization, when the endpoint behind it never checks.",
  "Walking through all nine stages as topics to mention rather than decisions to make, which produces a vocabulary demonstration instead of a design.",
];

export const keyPoints = [
  "*The stack doesn't change; the ownership does.* Stage 3 names the boxes once, and every later stage claims the ones it governs rather than adding new ones.",
  "*Frontend design is state design.* Lifetime and ownership are the two axes, and almost every disagreement about architecture is really a disagreement about one of them.",
  "*\"Fresh\" and \"live\" are different requirements.* Only one of them costs you a socket, reconnect logic, and event ordering.",
  "*The eight UI states are the deliverable, not a checklist.* A screen with one state designed is a screen that isn't finished.",
  "*A budget makes performance checkable.* Without a number, every technique is a suggestion and nothing can be said to be done.",
  "*Nothing on the client is a security control.* It can be a convenience over one, and that's the most it can ever be.",
  "*Every stage has a tell.* If you can't say what you walked away with, you named the stage instead of doing it.",
];

/* Stage number to the questions on /interview-qa that answer one of its decisions
   in full. Authored numbers only: the titles and the group each one opens in are
   resolved from the Q&A document itself, so nothing here can drift out of date. */
export const deeper: { n: number; ids: number[] }[] = [
  { n: 2, ids: [21, 61] },
  { n: 3, ids: [56, 57, 36, 37] },
  { n: 4, ids: [67, 32, 25] },
  { n: 5, ids: [30, 68, 31] },
  { n: 6, ids: [9, 10, 26, 45] },
  { n: 7, ids: [8, 23, 35, 65, 11, 20] },
  { n: 9, ids: [17] },
];
