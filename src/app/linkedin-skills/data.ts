import type { QuizCard } from "@/components";

/* Everything here is an outside observation of someone else's product, so the
   shape of a finding keeps the guess physically separate from the thing seen.
   `guesses` must never be phrased as a cause, and `build` is a proposal for a
   screen of our own, not a correction of theirs. */

export interface Finding {
  n: number;
  title: string;
  /** Two or three words, for the tab. */
  short: string;
  /** One line on the tab, so the four can be scanned without opening any. */
  teaser: string;
  /** What happened on screen. The only part that is not a guess. */
  saw: string;
  /** What was expected instead. A personal expectation, not a published contract. */
  expected?: string;
  /** What cannot be told from outside, where the temptation to over-read is strongest. */
  unsure?: string;
  guessLabel: string;
  /** Short enough to read as a list of leads. The mechanics behind them are the
      rest of the page, and the Q&A links underneath. */
  guesses: string[];
  /** How the same screen would be built here. A proposal, nothing more. */
  build: string;
  /** Interview Q&A sections that already cover the mechanics underneath. */
  qa: number[];
}

export const findings: Finding[] = [
  {
    n: 1,
    title: "Pagination stopped after I deleted a skill",
    short: "Pagination stopped",
    teaser: "Deleted a skill, the list stopped loading more until a full page refresh.",
    saw: "Scrolling the list loaded more skills, a page at a time. After a few pages had loaded I deleted one skill, and the list appeared to fall back to about its first page. Scrolling further did not seem to load anything else. A hard refresh brought pagination back, and nothing short of one did: the next delete stopped it again, so the page had to be reloaded once per deleted skill for scrolling to keep working.",
    expected:
      "I expected the deleted row to go, the rest of what had loaded to stay, and the next scroll to carry on fetching.",
    unsure:
      "It happened more than once, so it is not a one-off misreading, but I did not have the network tab open every time. That leaves the question I most want answered still open: whether a request went out and came back with nothing, or whether no request was sent at all. From the outside those look identical, and they have completely different causes.",
    guessLabel: "Guesses, not diagnoses",
    guesses: [
      "Scroll trigger not reattached?",
      "hasNextPage computed from a stale total?",
      "Pages and offset reset independently?",
      "In-flight request landed after the delete?",
      "Cache reset instead of reconciled?",
    ],
    build:
      "Treat a delete as an edit to the pages already loaded rather than a reason to drop them. Take the row out of whichever page holds it, and pull the next offset back by one so the window held and the offset asked for next still describe the same list. Better still, page by cursor instead of by offset, and the arithmetic stops existing.",
    qa: [5, 64, 25, 45, 35],
  },
  {
    n: 2,
    title: "A filtered list kept showing a skill I had deleted",
    short: "The filter went stale",
    teaser: "Deleted a skill with a filter on, and the row stayed put.",
    saw: "With a category filter applied, I deleted a skill that was visible and its row stayed on screen. Switching the filter, or reloading the page, and it was gone.",
    expected:
      "I expected a delete that worked to remove the row from the view I was looking at, which was the filtered one.",
    unsure:
      "That a reload fixed it tells me the server had accepted the delete. It does not tell me which copy on the client was wrong, or whether the row that stayed was a cached response, a local array, or something else entirely.",
    guessLabel: "Guesses, not diagnoses",
    guesses: [
      "Filtered collection never invalidated?",
      "Rows copied into local state?",
      "Filter missing from the cache key?",
      "No refetch after the write?",
    ],
    build:
      "Put the filter in the cache identity, so a Frontend view and an All view are different entries rather than the same one. On a delete that succeeds, reconcile every cached collection that could have held the record, not only the one on screen. The reload works for the same reason the fix does: a fresh read has no stale copy to disagree with.",
    qa: [67, 36, 30, 54, 68],
  },
  {
    n: 3,
    title: "Endorsement counts did not explain the order",
    short: "The order was a mystery",
    teaser: "Endorsed skills sat below skills with no endorsements at all.",
    saw: "Two skills with five and four endorsements sat near the bottom of the list, below skills with none.",
    unsure:
      "This only tells me that endorsement count alone is not the sort key. It is not evidence of what the rule is, and not evidence that endorsements count for nothing. There is almost certainly a signal involved that I cannot see, and the order may well be correct by a definition I do not have.",
    guessLabel: "What the order could be built from",
    guesses: [
      "An explicit rank, set once and forgotten?",
      "A relevance score I cannot see?",
      "Insertion recency?",
      "Endorsements as one term among several?",
    ],
    build:
      "Pick the ordering rule deliberately, then make it legible. The lesson I take from being confused by someone else's list is not that their rule is wrong, it is that a list whose order cannot be accounted for by anything visible will read as broken to a user who cannot see the inputs. If the order is derived, say so. If the user set it, let them see that they did.",
    qa: [67, 36],
  },
  {
    n: 4,
    title: "A skill I added went to the top",
    short: "A new skill jumped",
    teaser: "A skill I added went straight to the top of everything.",
    saw: "A skill I added appeared at the top of the list, above skills that had been sitting higher up, including endorsed ones.",
    unsure:
      "This may well be deliberate, and if it is, it is defensible: showing someone the thing they just added, where they will see it, is a reasonable choice. I am noting it because it is a decision worth making on purpose, not because I think it is a bug.",
    guessLabel: "What the order could be keyed on",
    guesses: [
      "Insertion recency as an implicit rank?",
      "No persisted rank at all?",
      "New rank assigned as the minimum minus one?",
      "Unstable sort over a tied key?",
    ],
    build:
      "Persist an explicit rank and let the user own it. A new record takes a rank at the end, or wherever the user drops it, and nothing in the add path renumbers records that already have one. If the new row should be surfaced, scroll to it or highlight it rather than rewriting the order to do it.",
    qa: [5, 19],
  },
];

export const ownership = [
  {
    owner: "The server",
    colour: "var(--sd-accent)",
    holds: "The records: name, category, endorsement count, rank. Everything that has to survive a reload, and the only copy anyone else can see.",
  },
  {
    owner: "The client",
    colour: "var(--sd-teal)",
    holds: "Which filter is selected, which row is being edited, whether a dialog is open, what has been typed. State nobody else needs and no server should hold.",
  },
  {
    owner: "Nobody",
    colour: "var(--sd-green)",
    holds: "The list on screen. Derived from the records and the filter on every render, which is why it cannot go stale. The moment it becomes a copy with an owner, it can.",
  },
];

export const lifecycle = [
  { name: "Request the delete", sub: "the row is still on screen" },
  { name: "Mark it pending", sub: "dimmed, or gone already if the update is optimistic" },
  { name: "The server confirms", sub: "or rejects, and a rejection has to be survivable" },
  { name: "Reconcile every cached collection", sub: "not only the one being rendered" },
  { name: "Re-derive the view", sub: "no copy to update, so nothing to forget" },
  { name: "Check the pagination still holds", sub: "the offset moved whether or not you moved it" },
];

export const strategies = [
  {
    label: "Optimistic update",
    colour: "var(--sd-teal)",
    wash: "rgba(127, 147, 242, 0.12)",
    points: [
      "Remove the row from the cache first, then send the request",
      "The list answers instantly, which is what makes it feel local",
      "A failure has to put the row back, in position, with the offset restored",
      "Snapshot the cache before the edit and restore it on failure. Reversing the edit by hand is where the subtle bugs live",
    ],
  },
  {
    label: "Refetch after success",
    colour: "var(--sd-amber)",
    wash: "rgba(106, 118, 163, 0.12)",
    points: [
      "Send, wait for confirmation, then read the affected collections again",
      "The client never holds a state the server disagrees with",
      "Costs a visible round trip, and a spinner on something already decided",
      "Nothing to roll back, because nothing changed before it was confirmed",
    ],
  },
];

export const terms = [
  { title: "Offset pagination", def: "Asking for a window by position: start at 60, give me 10. Cheap to implement, and correct only while nothing in front of position 60 changes." },
  { title: "Cursor pagination", def: "Asking for a window by its edge: give me 10 after this record. A deletion elsewhere does not move the cursor, because a cursor names a record rather than a count." },
  { title: "Cache identity", def: "The key a cached response is stored under. It has to carry every parameter that changes the response, or two different responses end up sharing one slot." },
  { title: "Invalidation", def: "Marking a cached collection as no longer trustworthy so the next read fetches it again, rather than editing the cached copy in place." },
  { title: "Optimistic update", def: "Applying a mutation locally before the server confirms it, so the UI answers at once, and owing the user a rollback if it fails." },
  { title: "Derived state", def: "A value recomputed from other state on every render rather than stored. It cannot go stale, because there is no copy of it to go stale." },
  { title: "Reconciliation", def: "Bringing a cached copy back into agreement with what the server now holds, after a write moved one of them." },
  { title: "Stable sort", def: "A sort that leaves records with equal keys in the order it found them, so a list does not reshuffle itself between renders for no visible reason." },
];

export interface TestTier {
  tier: string;
  colour: string;
  wash: string;
  runs: string;
  cases: string[];
  catches: string;
}

export const testing: TestTier[] = [
  {
    tier: "Unit",
    colour: "var(--sd-done)",
    wash: "var(--sd-done-wash)",
    runs: "Milliseconds, no DOM, no network. The pagination and cache arithmetic as plain functions over plain data.",
    cases: [
      "Deleting a record inside the loaded window pulls the next offset back by one.",
      "Deleting a record outside the loaded window leaves the offset untouched.",
      "A page response whose offset no longer matches the cache is discarded rather than appended.",
      "Adding a record leaves the rank of every record that already had one unchanged.",
      "An empty collection produces an empty state, not a cache entry that says there is more.",
    ],
    catches:
      "Findings 1 and 4, in full, before anything is rendered. This only works if the arithmetic lives in functions that can be called without a component, which is a design decision as much as a testing one.",
  },
  {
    tier: "Integration",
    colour: "var(--sd-accent)",
    wash: "var(--sd-accent-wash)",
    runs: "The real component against a mocked network, so cache, derivation and rendering are exercised together.",
    cases: [
      "Load two pages, delete a row from the first, and assert the next request offset and that no record is skipped.",
      "Apply a filter, delete a visible row, and assert it leaves the filtered view without a reload.",
      "Switch filters twice quickly and assert the first response is discarded rather than rendered.",
      "Delete while a page request is in flight, resolving in both orders, and assert no duplicate and no gap.",
      "Reject the delete on the server and assert the row returns to the position it held.",
    ],
    catches:
      "Finding 2, which is invisible to a unit test because it only appears once a filter, a cache and a render are in the same place at the same time.",
  },
  {
    tier: "End to end",
    colour: "var(--sd-violet)",
    wash: "var(--sd-violet-wash)",
    runs: "A real browser against a real build. Slow, so keep it to the few paths that would be embarrassing to ship broken.",
    cases: [
      "Scroll to the third page, delete a row, keep scrolling, and assert the list keeps growing.",
      "Add a skill and assert the rows above it did not move.",
      "Delete every row matching a filter and assert the empty state, not a spinner that never ends.",
    ],
    catches:
      "The scroll trigger itself, which is the one thing no mock can vouch for. Finding 1 would have shown up here on the first run, because scrolling is the only way to find out whether the trigger survived the delete.",
  },
];

export const earlyWarning: { title: string; body: string }[] = [
  {
    title: "Assert the invariant",
    body: "For an append-only pager, the next offset should equal the number of records loaded for that filter. One check after every cache write turns finding 1 into a stack trace.",
  },
  {
    title: "Warn on the suspicious pair",
    body: "hasNextPage going false while the total still exceeds what is loaded is either the end of the list or a bug, and the component knows which.",
  },
  {
    title: "Log two numbers, not one",
    body: "The offset a request was issued against, next to the rows rendered when it returns. Two numbers that should move together are easy to eyeball.",
  },
  {
    title: "Name every regression",
    body: "A bug found by hand becomes a named test before the fix lands, so the next refactor has to argue with the test and not a memory.",
  },
  {
    title: "Keep the logic reachable",
    body: "Arithmetic that only exists inside a component can only be checked by an expensive test. Where it lives is a testing decision.",
  },
];

export const keyPoints = [
  "A paginated, filterable, mutable list is not an array on screen. It is *four pieces of state that have to agree*: the records, the loaded window, the filter, and the next offset.",
  "Every finding here is a version of one thing: *something changed the records and something else was not told*.",
  "Asking by position and deleting records pull against each other. An offset is a count, and *deleting a record changes what every later count means*.",
  "Derive the visible list, never copy it. *A copy is a second owner*, and the second owner is the one that goes stale.",
  "The cheapest test is the one that runs without a browser, which makes *where the logic lives* a testing decision.",
];

export const commonMistakes = [
  "Fixing the symptom a report names. The delete handler gets patched while the add path, the filter change and the error path keep breaking the same rule.",
  "Resetting the cache on every mutation because reconciling it is harder. Correct, slow, and it throws away everything the user had scrolled to.",
  "Keeping a local copy of the visible rows so filtering feels fast, creating a second owner for data the server already owns.",
  "Leaving the filter out of the cache key, then being surprised when two filters disagree about what exists.",
  "Writing the pagination arithmetic inside the component, so the only test that can reach it has to start a browser.",
];

export const tryIt = [
  "Open a long, filterable list in any app you use, a playlist or a label list or a settings screen with categories. Load several pages, apply a filter, delete something, and watch what the remaining rows do.",
  "Before reloading, write down which of the four you think disagreed: the records, the loaded window, the filter, or the next offset. Then reload and find out whether the server agreed with the screen.",
  "Then write the test you would have wanted. If it needs a browser, ask what would have to move for it not to.",
];

/* Seven prompts, answered. They double as the closing quiz rather than sitting in
   a section of their own. The question and the model answer are the two halves
   the carousel already renders. */
export const quizCards: QuizCard[] = [
  {
    question: "What happens to offset pagination when an item is deleted?",
    answers: [
      "Every position past the deleted record starts pointing one spot earlier than it did, because an offset is a count and the thing being counted got shorter. Say the browser holds the first four of eight and its next request starts at spot 4. Delete one of those four, and the browser holds three while everything on the server slides forward one. It still asks for spot 4, so the record that moved into spot 3 is fetched by nobody: it is behind where the browser is reading from, and it was never deleted. Nothing in the request or the response is an error. Cursor pagination does not have the problem, because a cursor names a record rather than a count, and deleting a different record does not move it.",
    ],
  },
  {
    question: "How do you preserve the selected filter after a mutation?",
    answers: [
      "By not storing it anywhere the mutation can reach. The filter is client state, so it belongs in component state or in the URL, never in the cache the write reconciles. Then put it in the cache identity of the reads, so ['skills', { category: 'Frontend' }] and ['skills', { category: 'All' }] are separate entries and a write can reconcile both without either owning which is selected. If a mutation can reset your filter, the filter was living in the wrong place.",
    ],
  },
  {
    question: "When should you invalidate a query instead of editing the cached pages directly?",
    answers: [
      "Invalidate when you cannot compute the new state locally. A delete is the easy case: you know which record left and where it was, so editing the cached pages is cheap and keeps the scroll position. An add is the hard case, because where the new record sorts depends on a rank the server assigned and on records you have not loaded, so refetching the loaded window is more honest than guessing. The rule of thumb: edit when the effect on the collection is fully determined by what you already hold, invalidate when it is not.",
    ],
  },
  {
    question: "Why might an infinite-scroll trigger stop firing after a list remounts?",
    answers: [
      "Because the observer is still watching the old element. An IntersectionObserver holds a reference to a specific node, so if the list is rebuilt, the sentinel at the bottom is a new node and the observer attached to the previous one never fires again. It fails silently: no error, no request, nothing happening. Attaching the observer in a ref callback rather than in an effect that runs once fixes it, because the callback runs again for the new node. The symptom to recognise is that no request is sent at all, which from the outside looks exactly like having reached the end of the list.",
    ],
  },
  {
    question: "How should user-defined ordering be modelled?",
    answers: [
      "As a persisted rank the server owns and the user controls: an integer per record, sorted on, never recomputed by anything but an explicit reorder. Deriving the order from endorsements, recency or relevance turns the user's choice into a suggestion that gets overwritten. The two decisions worth making deliberately are what rank a new record gets, where the end of the list is the safe default because anything else renumbers records the user already placed, and whether the sort is stable, because ties in a derived key let rows swap places between renders for no visible reason.",
    ],
  },
  {
    question: "How would you test deletion during an in-flight page request?",
    answers: [
      "Hold the page request open, delete a record, then let the request resolve, and assert the list has no duplicate and no gap. The failure it catches is a response computed against the pre-delete list being written into a cache that has moved on. The defence is to tag each in-flight request with the offset it was issued against and discard the response if the cache's next offset is no longer that value. Worth running in both resolution orders, alongside the siblings: deletion from the first page, from the last page, with a filter applied, with a rapid filter change, and a delete the server rejects.",
    ],
  },
  {
    question: "Which state belongs on the server, and which belongs in the browser?",
    answers: [
      "The server owns anything that must survive a reload or be seen by anyone else: the records, their ranks, their endorsement counts. The browser owns anything meaningless to anyone else: the selected filter, which row is being edited, what is half-typed in an input, the scroll position. The list on screen belongs to neither, because it is derived from the records and the filter on every render, and that is exactly why it cannot go stale. The question to run every piece of state through is the one this page reduces to: who owns this, and what has to change when it changes?",
    ],
  },
];
