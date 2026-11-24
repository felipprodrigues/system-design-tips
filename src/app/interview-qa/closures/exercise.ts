export type Phase =
  | "Start"
  | "Define"
  | "Call"
  | "Closure"
  | "Update"
  | "var loop"
  | "let loop"
  | "Copy"
  | "Mutate"
  | "Read"
  | "Bind"
  | "Add"
  | "Collect"
  | "Done";

export interface Scope {
  name: string;
  /** `to` names another scope in the same step and draws an arrow to it; a leading "~" draws it weak (dashed). */
  vars: [name: string, value: string, to?: string][];
  /** Set while a function still holds this scope alive after its call ended. */
  kept?: string;
  fresh?: boolean;
  changed?: string[];
}

export interface Step {
  /** Zero-based indices into `Exercise.code`, lit while this step runs. */
  lines: number[];
  scopes: Scope[];
  stack: string[];
  /** Values printed so far, one per lettered slot in order. */
  out: string[];
  phase: Phase;
  note: string;
}

export interface Exercise {
  hint: string;
  /** Heading of the walkthrough panel that shows `Step.scopes`. */
  memory: string;
  code: string[];
  labels: string[];
  answer: string[];
  /** More tiles than slots, with repeats and decoys, so the pool never gives the answer away. */
  tiles: string[];
  steps: Step[];
}

const global = (...vars: Scope["vars"]): Scope => ({ name: "Global", vars });
const call1: Scope = { name: "makeCounter call #1", vars: [["count", "0"]], kept: "kept by a" };
const call2: Scope = { name: "makeCounter call #2", vars: [["count", "0"]], kept: "kept by b" };
const ab: Scope["vars"] = [["makeCounter", "ƒ"], ["a", "ƒ", call1.name], ["b", "ƒ", call2.name]];
const gs: Scope["vars"] = [0, 1, 2].map((n) => [`gs[${n}]`, "ƒ", `loop pass ${n + 1}`]);
const pass = (n: number, extra: Partial<Scope> = {}): Scope => ({
  name: `loop pass ${n + 1}`,
  vars: [["j", String(n)]],
  kept: `kept by gs[${n}]`,
  ...extra,
});

export const EXERCISE: Exercise = {
  hint: "Each call to a function creates a new set of its variables. A closure keeps the variable itself, not a copy of its value. var makes one variable for the whole loop, while let makes a new one each time round.",
  memory: "Scopes in memory (a highlighted border means a function is still holding on to it)",
  code: [
    "function makeCounter() {",
    "  let count = 0;",
    "  return () => ++count;",
    "}",
    "const a = makeCounter();",
    "const b = makeCounter();",
    "console.log(a());        // A",
    "console.log(a());        // B",
    "console.log(b());        // C",
    "",
    "let x = 10;",
    "function show() { return x; }",
    "x = 20;",
    "console.log(show());     // D",
    "",
    "var fns = [];",
    "for (var i = 0; i < 3; i++) fns.push(() => i);",
    "console.log(fns[0]());   // E",
    "",
    "const gs = [];",
    "for (let j = 0; j < 3; j++) gs.push(() => j);",
    "console.log(gs[0]());    // F",
    "",
    "function outer() {",
    "  let y = 1;",
    "  const inc = () => y++;",
    "  inc(); inc();",
    "  return () => y;",
    "}",
    "console.log(outer()());  // G",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G"],
  answer: ["1", "2", "1", "20", "3", "0", "3"],
  tiles: ["0", "1", "1", "2", "2", "3", "3", "10", "20", "undefined"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3], scopes: [global(["makeCounter", "ƒ"])], stack: [], out: [], phase: "Define", note: "This only defines makeCounter. Nothing inside it runs until it is called." },
    { lines: [4, 1, 2], scopes: [global(["makeCounter", "ƒ"], ["a", "ƒ", call1.name]), { ...call1, fresh: true }], stack: ["makeCounter()"], out: [], phase: "Call", note: "Calling makeCounter creates a new scope with its own count = 0. It returns an arrow function that uses count, so that scope is kept alive after the call ends. That function is a." },
    { lines: [5], scopes: [global(...ab), call1, { ...call2, fresh: true }], stack: ["makeCounter()"], out: [], phase: "Call", note: "A second call creates a second, separate scope with its own count = 0. b keeps this one." },
    { lines: [6, 2], scopes: [global(...ab), { ...call1, vars: [["count", "1"]], changed: ["count"] }, call2], stack: ["a()"], out: ["1"], phase: "Closure", note: "a() runs ++count in its own scope, #1. count goes from 0 to 1 and 1 is returned." },
    { lines: [7, 2], scopes: [global(...ab), { ...call1, vars: [["count", "2"]], changed: ["count"] }, call2], stack: ["a()"], out: ["1", "2"], phase: "Closure", note: "a() again uses the same scope, so count is still there. It goes from 1 to 2." },
    { lines: [8, 2], scopes: [global(...ab), { ...call1, vars: [["count", "2"]] }, { ...call2, vars: [["count", "1"]], changed: ["count"] }], stack: ["b()"], out: ["1", "2", "1"], phase: "Closure", note: "b() uses scope #2, which has its own count. It goes from 0 to 1. Changes made through a never reach b." },
    { lines: [10, 11], scopes: [{ ...global(["a", "ƒ"], ["b", "ƒ"], ["x", "10"], ["show", "ƒ"]), changed: ["x"] }], stack: [], out: ["1", "2", "1"], phase: "Define", note: "show uses x from the global scope. It keeps the variable x itself, not the value 10. (The two counter scopes are still in memory but hidden from here on.)" },
    { lines: [12], scopes: [{ ...global(["a", "ƒ"], ["b", "ƒ"], ["x", "20"], ["show", "ƒ"]), changed: ["x"] }], stack: [], out: ["1", "2", "1"], phase: "Update", note: "x is changed to 20 before show is ever called." },
    { lines: [13, 11], scopes: [global(["a", "ƒ"], ["b", "ƒ"], ["x", "20"], ["show", "ƒ"])], stack: ["show()"], out: ["1", "2", "1", "20"], phase: "Closure", note: "show() reads x at the moment it runs. x is 20 now, so it returns 20, not 10." },
    { lines: [15, 16], scopes: [{ ...global(["x", "20"], ["fns", "[ƒ, ƒ, ƒ]"], ["i", "3"]), changed: ["i"], kept: "i kept by all 3 fns" }], stack: [], out: ["1", "2", "1", "20"], phase: "var loop", note: "var creates one i for the whole loop, in the outer scope. All three functions use that same i. The loop stops when i reaches 3." },
    { lines: [17, 16], scopes: [{ ...global(["x", "20"], ["fns", "[ƒ, ƒ, ƒ]"], ["i", "3"]), kept: "i kept by all 3 fns" }], stack: ["fns[0]()"], out: ["1", "2", "1", "20", "3"], phase: "Closure", note: "fns[0]() reads the shared i, which is 3 now. All three functions would return 3." },
    { lines: [19, 20], scopes: [global(["fns", "[ƒ, ƒ, ƒ]"], ["i", "3"], ...gs), pass(0, { fresh: true }), pass(1, { fresh: true }), pass(2, { fresh: true })], stack: [], out: ["1", "2", "1", "20", "3"], phase: "let loop", note: "let creates a new j on every pass through the loop. Each function keeps the j from its own pass." },
    { lines: [21, 20], scopes: [global(["fns", "[ƒ, ƒ, ƒ]"], ["i", "3"], ...gs), pass(0), pass(1), pass(2)], stack: ["gs[0]()"], out: ["1", "2", "1", "20", "3", "0"], phase: "Closure", note: "gs[0]() reads the j from pass 1, which is still 0." },
    { lines: [29, 23, 24, 25], scopes: [global(["gs", "[ƒ, ƒ, ƒ]"], ["outer", "ƒ"]), { name: "outer call", vars: [["y", "1"], ["inc", "ƒ"]], fresh: true }], stack: ["outer()"], out: ["1", "2", "1", "20", "3", "0"], phase: "Call", note: "outer() creates a scope with y = 1. inc is a closure over that same y." },
    { lines: [26, 25], scopes: [global(["gs", "[ƒ, ƒ, ƒ]"], ["outer", "ƒ"]), { name: "outer call", vars: [["y", "3"], ["inc", "ƒ"]], changed: ["y"] }], stack: ["outer()", "inc()"], out: ["1", "2", "1", "20", "3", "0"], phase: "Closure", note: "inc() runs twice. Each y++ changes the shared y, so it goes from 1 to 2 to 3." },
    { lines: [27, 29], scopes: [global(["gs", "[ƒ, ƒ, ƒ]"], ["outer", "ƒ"]), { name: "outer call", vars: [["y", "3"], ["inc", "ƒ"]], kept: "kept by returned ƒ" }], stack: ["returned ƒ"], out: ["1", "2", "1", "20", "3", "0", "3"], phase: "Closure", note: "outer() has finished, but the function it returned still keeps its scope alive. Calling it reads y, which is 3." },
    { lines: [], scopes: [], stack: [], out: ["1", "2", "1", "20", "3", "0", "3"], phase: "Done", note: "Final answers: A 1, B 2, C 1, D 20, E 3, F 0, G 3." },
  ],
};
