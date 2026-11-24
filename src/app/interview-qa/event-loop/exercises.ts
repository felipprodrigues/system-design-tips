export type Phase = "Start" | "Sync" | "Event loop" | "Microtask" | "Macrotask" | "Done";

export interface Step {
  /** Zero-based indices into `Exercise.code`, lit while this step runs. */
  lines: number[];
  stack: string[];
  /** Reactions registered on a promise that has not settled: not queued yet. */
  waiting: string[];
  micro: string[];
  macro: string[];
  out: string[];
  phase: Phase;
  note: string;
}

export interface Exercise {
  id: string;
  title: string;
  point: string;
  hint: string;
  code: string[];
  /** What the console prints, in order. One draggable tile per entry. */
  answer: string[];
  steps: Step[];
}

const ten: Exercise = {
  id: "ten",
  title: "Ten numbers",
  point: "Sync, then every microtask, then one timer at a time.",
  hint: "An async function runs synchronously until its first await. A chained .then waits for the one before it. A microtask that queues another still runs before any setTimeout.",
  code: [
    "console.log('1');",
    "setTimeout(() => console.log('2'), 0);",
    "async function run() {",
    "  console.log('3');",
    "  await null;",
    "  console.log('4');",
    "}",
    "Promise.resolve()",
    "  .then(() => console.log('5'))",
    "  .then(() => console.log('6'));",
    "run();",
    "queueMicrotask(() => {",
    "  console.log('7');",
    "  queueMicrotask(() => console.log('8'));",
    "});",
    "setTimeout(() => console.log('9'), 0);",
    "console.log('10');",
  ],
  answer: ["1", "3", "10", "5", "4", "7", "6", "8", "2", "9"],
  steps: [
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0], stack: ["main"], waiting: [], micro: [], macro: [], out: ["1"], phase: "Sync", note: "The script runs top to bottom. 1 prints right away." },
    { lines: [1], stack: ["main"], waiting: [], micro: [], macro: ["timer 2"], out: ["1"], phase: "Sync", note: "setTimeout puts the 2 callback in the macrotask queue." },
    { lines: [2, 3, 4, 5, 6], stack: ["main"], waiting: [], micro: [], macro: ["timer 2"], out: ["1"], phase: "Sync", note: "This only defines run(). Nothing inside it runs until it is called." },
    { lines: [7, 8, 9], stack: ["main"], waiting: ["log 6"], micro: ["log 5"], macro: ["timer 2"], out: ["1"], phase: "Sync", note: "The first .then is queued because its promise is already resolved. The second .then waits until the first one has run." },
    { lines: [10, 3], stack: ["main", "run()"], waiting: ["log 6"], micro: ["log 5"], macro: ["timer 2"], out: ["1", "3"], phase: "Sync", note: "run() is called. An async function runs synchronously up to its first await, so 3 prints now." },
    { lines: [4], stack: ["main"], waiting: ["log 6"], micro: ["log 5", "run: after await"], macro: ["timer 2"], out: ["1", "3"], phase: "Sync", note: "await null pauses run(). The rest of the function is queued as a microtask, behind 5." },
    { lines: [11, 12, 13, 14], stack: ["main"], waiting: ["log 6"], micro: ["log 5", "run: after await", "log 7"], macro: ["timer 2"], out: ["1", "3"], phase: "Sync", note: "queueMicrotask adds the 7 callback to the back of the microtask queue." },
    { lines: [15], stack: ["main"], waiting: ["log 6"], micro: ["log 5", "run: after await", "log 7"], macro: ["timer 2", "timer 9"], out: ["1", "3"], phase: "Sync", note: "A second timer, 9, goes in the macrotask queue behind 2." },
    { lines: [16], stack: ["main"], waiting: ["log 6"], micro: ["log 5", "run: after await", "log 7"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10"], phase: "Sync", note: "10 prints. That is the last line of the script." },
    { lines: [], stack: [], waiting: ["log 6"], micro: ["log 5", "run: after await", "log 7"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10"], phase: "Event loop", note: "The call stack is empty. The event loop empties the whole microtask queue before it takes any timer." },
    { lines: [8], stack: ["log 5"], waiting: [], micro: ["run: after await", "log 7", "log 6"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5"], phase: "Microtask", note: "5 prints. Its .then is done, so the chained 6 is queued now, at the back of the queue." },
    { lines: [5], stack: ["run()"], waiting: [], micro: ["log 7", "log 6"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5", "4"], phase: "Microtask", note: "run() picks up after its await and prints 4." },
    { lines: [12], stack: ["log 7"], waiting: [], micro: ["log 6"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5", "4", "7"], phase: "Microtask", note: "7 prints." },
    { lines: [13], stack: ["log 7"], waiting: [], micro: ["log 6", "log 8"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5", "4", "7"], phase: "Microtask", note: "Inside 7, queueMicrotask adds 8 to the back of the queue that is being emptied, behind 6." },
    { lines: [9], stack: ["log 6"], waiting: [], micro: ["log 8"], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5", "4", "7", "6"], phase: "Microtask", note: "6 prints." },
    { lines: [13], stack: ["log 8"], waiting: [], micro: [], macro: ["timer 2", "timer 9"], out: ["1", "3", "10", "5", "4", "7", "6", "8"], phase: "Microtask", note: "8 prints. Microtasks added while the queue is being emptied still run before any timer." },
    { lines: [1], stack: ["timer 2"], waiting: [], micro: [], macro: ["timer 9"], out: ["1", "3", "10", "5", "4", "7", "6", "8", "2"], phase: "Macrotask", note: "The microtask queue is empty, so the event loop takes the first timer. 2 prints." },
    { lines: [15], stack: ["timer 9"], waiting: [], micro: [], macro: [], out: ["1", "3", "10", "5", "4", "7", "6", "8", "2", "9"], phase: "Macrotask", note: "The next timer prints 9." },
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: ["1", "3", "10", "5", "4", "7", "6", "8", "2", "9"], phase: "Done", note: "Everything has run. Final order: 1 3 10 5 4 7 6 8 2 9." },
  ],
};

const chains: Exercise = {
  id: "chains",
  title: "Two chains, one queue",
  point: "Every link in a .then chain costs one trip through the queue.",
  hint: "Both chains start resolved, so both first links are queued during the script. Each later link is only queued once the one before it has run.",
  code: [
    "Promise.resolve()",
    "  .then(() => console.log('A'))",
    "  .then(() => console.log('B'));",
    "Promise.resolve()",
    "  .then(() => console.log('C'))",
    "  .then(() => console.log('D'));",
    "setTimeout(() => console.log('T'), 0);",
    "queueMicrotask(() => console.log('M'));",
    "console.log('S');",
  ],
  answer: ["S", "A", "C", "M", "B", "D", "T"],
  steps: [
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: [], phase: "Start", note: "Two identical chains, side by side. Watch them interleave." },
    { lines: [0, 1, 2], stack: ["main"], waiting: ["log B"], micro: ["log A"], macro: [], out: [], phase: "Sync", note: "A is queued at once: its promise is already resolved. B is registered on the promise that .then returns, which has not settled, so it only waits." },
    { lines: [3, 4, 5], stack: ["main"], waiting: ["log B", "log D"], micro: ["log A", "log C"], macro: [], out: [], phase: "Sync", note: "The second chain does the same thing, one place further back in the queue." },
    { lines: [6], stack: ["main"], waiting: ["log B", "log D"], micro: ["log A", "log C"], macro: ["timer T"], out: [], phase: "Sync", note: "The timer is parked. Timers are never in the same queue as promises." },
    { lines: [7], stack: ["main"], waiting: ["log B", "log D"], micro: ["log A", "log C", "log M"], macro: ["timer T"], out: [], phase: "Sync", note: "queueMicrotask goes to the back, behind both chains' first links." },
    { lines: [8], stack: ["main"], waiting: ["log B", "log D"], micro: ["log A", "log C", "log M"], macro: ["timer T"], out: ["S"], phase: "Sync", note: "S prints. It is the only thing the script itself prints, and nothing above it has run yet." },
    { lines: [], stack: [], waiting: ["log B", "log D"], micro: ["log A", "log C", "log M"], macro: ["timer T"], out: ["S"], phase: "Event loop", note: "Stack empty. The microtask queue is drained in full, in order, before the timer." },
    { lines: [1], stack: ["log A"], waiting: ["log D"], micro: ["log C", "log M", "log B"], macro: ["timer T"], out: ["S", "A"], phase: "Microtask", note: "A prints. Its .then has settled now, so B is queued, at the back of the queue." },
    { lines: [4], stack: ["log C"], waiting: [], micro: ["log M", "log B", "log D"], macro: ["timer T"], out: ["S", "A", "C"], phase: "Microtask", note: "C prints, and D joins the back the same way." },
    { lines: [7], stack: ["log M"], waiting: [], micro: ["log B", "log D"], macro: ["timer T"], out: ["S", "A", "C", "M"], phase: "Microtask", note: "M prints. It was queued during the script, so it beats both second links even though they belong to chains that started earlier." },
    { lines: [2], stack: ["log B"], waiting: [], micro: ["log D"], macro: ["timer T"], out: ["S", "A", "C", "M", "B"], phase: "Microtask", note: "B prints, one turn of the queue after A." },
    { lines: [5], stack: ["log D"], waiting: [], micro: [], macro: ["timer T"], out: ["S", "A", "C", "M", "B", "D"], phase: "Microtask", note: "D prints. The queue is finally empty." },
    { lines: [6], stack: ["timer T"], waiting: [], micro: [], macro: [], out: ["S", "A", "C", "M", "B", "D", "T"], phase: "Macrotask", note: "Only now does the timer get its turn." },
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: ["S", "A", "C", "M", "B", "D", "T"], phase: "Done", note: "Final order: S A C M B D T. The chains interleave because each link waits one turn for the link before it." },
  ],
};

const timers: Exercise = {
  id: "timers",
  title: "A timer that queues more work",
  point: "The microtask queue is drained after every macrotask, not once per loop.",
  hint: "A timer callback is one task. Whatever it queues is dealt with before the next timer, and a timer it sets goes to the back of the line.",
  code: [
    "setTimeout(() => {",
    "  console.log('t1');",
    "  Promise.resolve().then(() => console.log('m1'));",
    "  setTimeout(() => console.log('t3'), 0);",
    "}, 0);",
    "setTimeout(() => {",
    "  console.log('t2');",
    "  Promise.resolve().then(() => console.log('m2'));",
    "}, 0);",
    "Promise.resolve().then(() => console.log('m0'));",
    "console.log('sync');",
  ],
  answer: ["sync", "m0", "t1", "m1", "t2", "m2", "t3"],
  steps: [
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: [], phase: "Start", note: "Two timers, each queueing a promise of its own once it runs." },
    { lines: [0, 1, 2, 3, 4], stack: ["main"], waiting: [], micro: [], macro: ["timer 1"], out: [], phase: "Sync", note: "The whole callback is parked as one macrotask. Nothing inside it runs yet." },
    { lines: [5, 6, 7, 8], stack: ["main"], waiting: [], micro: [], macro: ["timer 1", "timer 2"], out: [], phase: "Sync", note: "The second timer queues behind the first. Same delay, so the order they were set is the order they run." },
    { lines: [9], stack: ["main"], waiting: [], micro: ["log m0"], macro: ["timer 1", "timer 2"], out: [], phase: "Sync", note: "A promise reaction, queued in the other queue entirely." },
    { lines: [10], stack: ["main"], waiting: [], micro: ["log m0"], macro: ["timer 1", "timer 2"], out: ["sync"], phase: "Sync", note: "sync prints, and the script is done." },
    { lines: [], stack: [], waiting: [], micro: ["log m0"], macro: ["timer 1", "timer 2"], out: ["sync"], phase: "Event loop", note: "Stack empty. Microtasks first, always." },
    { lines: [9], stack: ["log m0"], waiting: [], micro: [], macro: ["timer 1", "timer 2"], out: ["sync", "m0"], phase: "Microtask", note: "m0 prints. Now the queue is empty, so a timer can run." },
    { lines: [1], stack: ["timer 1"], waiting: [], micro: [], macro: ["timer 2"], out: ["sync", "m0", "t1"], phase: "Macrotask", note: "The first timer runs. t1 prints." },
    { lines: [2, 3], stack: ["timer 1"], waiting: [], micro: ["log m1"], macro: ["timer 2", "timer 3"], out: ["sync", "m0", "t1"], phase: "Macrotask", note: "Still inside that one task: m1 joins the microtask queue, and a third timer joins the back of the macrotask queue." },
    { lines: [2], stack: ["log m1"], waiting: [], micro: [], macro: ["timer 2", "timer 3"], out: ["sync", "m0", "t1", "m1"], phase: "Microtask", note: "That task ended, so the microtask queue is drained before the next timer. m1 prints." },
    { lines: [6], stack: ["timer 2"], waiting: [], micro: [], macro: ["timer 3"], out: ["sync", "m0", "t1", "m1", "t2"], phase: "Macrotask", note: "The second timer runs. t2 prints." },
    { lines: [7], stack: ["timer 2"], waiting: [], micro: ["log m2"], macro: ["timer 3"], out: ["sync", "m0", "t1", "m1", "t2"], phase: "Macrotask", note: "m2 is queued inside it." },
    { lines: [7], stack: ["log m2"], waiting: [], micro: [], macro: ["timer 3"], out: ["sync", "m0", "t1", "m1", "t2", "m2"], phase: "Microtask", note: "Drained again, after this macrotask too. m2 prints before t3, even though t3 was queued before m2 existed." },
    { lines: [3], stack: ["timer 3"], waiting: [], micro: [], macro: [], out: ["sync", "m0", "t1", "m1", "t2", "m2", "t3"], phase: "Macrotask", note: "Last in, last out: the timer set inside the first timer." },
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: ["sync", "m0", "t1", "m1", "t2", "m2", "t3"], phase: "Done", note: "Final order: sync m0 t1 m1 t2 m2 t3. Microtasks are drained after every macrotask, not once per loop." },
  ],
};

const rejected: Exercise = {
  id: "rejected",
  title: "The rejected one",
  point: "A handler that does not match still costs a turn of the queue.",
  hint: "A .then with no rejection handler on a rejected promise has nothing to do, but it is still queued and still runs: it passes the rejection to the promise it returned.",
  code: [
    "console.log('start');",
    "Promise.reject(new Error('x'))",
    "  .then(() => console.log('then'))",
    "  .catch(() => {",
    "    console.log('catch');",
    "    return 'v';",
    "  })",
    "  .then((v) => console.log('after', v));",
    "queueMicrotask(() => console.log('micro'));",
    "setTimeout(() => console.log('timer'), 0);",
    "console.log('end');",
  ],
  answer: ["start", "end", "micro", "catch", "after v", "timer"],
  steps: [
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: [], phase: "Start", note: "One of the four lines here never prints at all. Which one, and what does that cost?" },
    { lines: [0], stack: ["main"], waiting: [], micro: [], macro: [], out: ["start"], phase: "Sync", note: "start prints." },
    { lines: [1, 2], stack: ["main"], waiting: [], micro: ["then: pass it on"], macro: [], out: ["start"], phase: "Sync", note: "The promise is already rejected, and this .then only handles success. It is queued anyway: it will run, print nothing, and reject the promise it returned." },
    { lines: [3, 4, 5, 6], stack: ["main"], waiting: ["catch handler"], micro: ["then: pass it on"], macro: [], out: ["start"], phase: "Sync", note: ".catch is registered on the promise the .then above returns, which has not settled yet. It waits." },
    { lines: [7], stack: ["main"], waiting: ["catch handler", "log after"], micro: ["then: pass it on"], macro: [], out: ["start"], phase: "Sync", note: "And the last .then waits on the one the .catch returns. Registering is not queueing." },
    { lines: [8], stack: ["main"], waiting: ["catch handler", "log after"], micro: ["then: pass it on", "log micro"], macro: [], out: ["start"], phase: "Sync", note: "queueMicrotask lands behind the only thing in the queue." },
    { lines: [9], stack: ["main"], waiting: ["catch handler", "log after"], micro: ["then: pass it on", "log micro"], macro: ["timer"], out: ["start"], phase: "Sync", note: "The timer is parked in the other queue." },
    { lines: [10], stack: ["main"], waiting: ["catch handler", "log after"], micro: ["then: pass it on", "log micro"], macro: ["timer"], out: ["start", "end"], phase: "Sync", note: "end prints. The chain has not run a single line of itself yet." },
    { lines: [], stack: [], waiting: ["catch handler", "log after"], micro: ["then: pass it on", "log micro"], macro: ["timer"], out: ["start", "end"], phase: "Event loop", note: "Stack empty. Microtasks before the timer." },
    { lines: [2], stack: ["then: pass it on"], waiting: ["log after"], micro: ["log micro", "catch handler"], macro: ["timer"], out: ["start", "end"], phase: "Microtask", note: "It runs and prints nothing: with no rejection handler it just rejects the promise it returned. That queues the .catch, at the back, behind micro." },
    { lines: [8], stack: ["log micro"], waiting: ["log after"], micro: ["catch handler"], macro: ["timer"], out: ["start", "end", "micro"], phase: "Microtask", note: "micro prints. One turn earlier than the .catch, and one turn is all it takes." },
    { lines: [4, 5], stack: ["catch handler"], waiting: [], micro: ["log after"], macro: ["timer"], out: ["start", "end", "micro", "catch"], phase: "Microtask", note: "catch prints, and returning 'v' resolves the promise it returned, which queues the last .then." },
    { lines: [7], stack: ["log after"], waiting: [], micro: [], macro: ["timer"], out: ["start", "end", "micro", "catch", "after v"], phase: "Microtask", note: "after v prints. Three turns of the queue to get here, one per link in the chain." },
    { lines: [9], stack: ["timer"], waiting: [], micro: [], macro: [], out: ["start", "end", "micro", "catch", "after v", "timer"], phase: "Macrotask", note: "The timer, last, as always." },
    { lines: [], stack: [], waiting: [], micro: [], macro: [], out: ["start", "end", "micro", "catch", "after v", "timer"], phase: "Done", note: "Final order: start end micro catch after v timer. then never prints, and skipping it still pushed everything after it one turn later." },
  ],
};

export const EXERCISES: Exercise[] = [ten, chains, timers, rejected];
