import type { Exercise, Scope } from "../closures/exercise";

const global: Scope = { name: "Global", vars: [["greet", "ƒ"], ["ada", "", "ada"], ["bob", "", "bob"]] };
const ada: Scope = { name: "ada", vars: [["name", '"Ada"'], ["greet", "ƒ"]] };
const bob: Scope = { name: "bob", vars: [["name", '"Bob"']] };
const greetCall = (self: string, greeting: string, punct: string): Scope => ({
  name: "greet call",
  vars: [["this", "", self], ["greeting", `"${greeting}"`], ["punct", `"${punct}"`]],
  changed: ["this"],
  fresh: true,
});
const hiBob: Scope = { name: "hiBob, bound ƒ", vars: [["target", "greet"], ["this", "", "bob"], ["greeting", '"Hi"']], kept: "this locked to bob" };
const twice: Scope[] = [
  { name: "twice, bound ƒ", vars: [["target", "", "greet.bind(ada)"], ["this", "ignored", "~bob"]], kept: "bob never reaches greet" },
  { name: "greet.bind(ada), bound ƒ", vars: [["target", "greet"], ["this", "", "ada"]], kept: "this locked to ada" },
];
const team: Scope = { name: "team", vars: [["name", '"Core"'], ["later", "ƒ"]] };
const out = ["Hi, Ada!", "Yo, Bob?", "Hey, Ada.", "Hi, Bob!", "Hi, Bob?", "Hi, Ada!", "Core"];

export const EXERCISE: Exercise = {
  hint: "A regular function gets its this from how it is called: the object before the dot. call and apply set this and run the function now. bind runs nothing and returns a new function whose this is fixed for good. An arrow function has no this of its own.",
  memory: "Calls and objects (the arrow from this shows who is speaking; a dashed one is ignored)",
  code: [
    "function greet(greeting, punct) {",
    "  return `${greeting}, ${this.name}${punct}`;",
    "}",
    'const ada = { name: "Ada", greet };',
    'const bob = { name: "Bob" };',
    "",
    'console.log(ada.greet("Hi", "!"));            // A',
    'console.log(greet.call(bob, "Yo", "?"));      // B',
    'console.log(greet.apply(ada, ["Hey", "."]));  // C',
    "",
    'const hiBob = greet.bind(bob, "Hi");',
    'console.log(hiBob("!"));                      // D',
    'console.log(hiBob.call(ada, "?"));            // E',
    "",
    "const twice = greet.bind(ada).bind(bob);",
    'console.log(twice("Hi", "!"));                // F',
    "",
    "const team = {",
    '  name: "Core",',
    "  later() { return [1].map(() => this.name)[0]; },",
    "};",
    "console.log(team.later());                    // G",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G"],
  answer: out,
  tiles: ["Hi, Ada!", "Hi, Ada!", "Hi, Ada?", "Hi, Bob!", "Hi, Bob?", "Yo, Bob?", "Hey, Ada.", "Hey, Bob.", "Core", "undefined"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3, 4], scopes: [{ ...global, fresh: true }, { ...ada, fresh: true }, { ...bob, fresh: true }], stack: [], out: [], phase: "Define", note: "`greet` uses `this`, but a regular function has no fixed `this`. It is decided at each call, by how the function is called. `ada` gets `greet` as a method, `bob` does not." },
    { lines: [6, 1], scopes: [greetCall("ada", "Hi", "!"), ada, bob], stack: ["ada.greet()"], out: out.slice(0, 1), phase: "Call", note: "The call is `ada.greet()`. A method call sets `this` to the object before the dot, so inside `greet`, `this` is `ada`." },
    { lines: [7, 1], scopes: [greetCall("bob", "Yo", "?"), ada, bob], stack: ["greet.call()"], out: out.slice(0, 2), phase: "Call", note: "`call` runs `greet` right now. Its first argument becomes `this`, and the rest are passed one by one. `bob` has no `greet` method, and does not need one." },
    { lines: [8, 1], scopes: [greetCall("ada", "Hey", "."), ada, bob], stack: ["greet.apply()"], out: out.slice(0, 3), phase: "Call", note: "`apply` is `call` with the arguments in one array. C for comma, A for array." },
    { lines: [10], scopes: [{ ...hiBob, fresh: true }, ada, bob], stack: [], out: out.slice(0, 3), phase: "Bind", note: "`bind` runs nothing. It returns a new function with `this` fixed to `bob` and the first argument pre-filled with `\"Hi\"`." },
    { lines: [11, 1], scopes: [hiBob, greetCall("bob", "Hi", "!"), ada, bob], stack: ["hiBob()", "greet()"], out: out.slice(0, 4), phase: "Call", note: "`hiBob(\"!\")` calls `greet` with `this` set to `bob`, the pre-filled `\"Hi\"`, then `\"!\"`." },
    { lines: [12, 1], scopes: [hiBob, greetCall("bob", "Hi", "?"), ada, bob], stack: ["hiBob.call()", "greet()"], out: out.slice(0, 5), phase: "Call", note: "`call` tries to point `this` at `ada`, but a bound function ignores it: the arrow stays on `bob`. Only `\"?\"` gets through, and lands in `punct`." },
    { lines: [14], scopes: [...twice.map((scope) => ({ ...scope, fresh: true })), ada, bob], stack: [], out: out.slice(0, 5), phase: "Bind", note: "Binding a bound function wraps it again. The outer wrapper's `this` (`bob`) only reaches the inner wrapper, which already fixed `this` to `ada` for `greet`." },
    { lines: [15, 1], scopes: [...twice, greetCall("ada", "Hi", "!"), ada, bob], stack: ["twice()", "greet.bind(ada)()", "greet()"], out: out.slice(0, 6), phase: "Call", note: "The first `bind` wins. `greet` runs with `this` set to `ada`, so it prints `Hi, Ada!`." },
    { lines: [17, 18, 19, 20], scopes: [{ name: "Global", vars: [["team", "", "team"]] }, { ...team, fresh: true }], stack: [], out: out.slice(0, 6), phase: "Define", note: "`later` is a regular method. Inside it, `map` gets an arrow function." },
    { lines: [21, 19], scopes: [{ name: "later call", vars: [["this", "", "team"]], changed: ["this"], fresh: true }, { name: "arrow call", vars: [["this", "from later", "team"]], kept: "no this of its own", fresh: true }, team], stack: ["team.later()", "map()", "arrow()"], out, phase: "Call", note: "`later` is called as `team.later()`, so its `this` is `team`. The arrow has no `this` of its own and uses the one from `later`, so `this.name` is `Core`. A regular function passed to `map` would have lost it." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A Hi, Ada!  B Yo, Bob?  C Hey, Ada.  D Hi, Bob!  E Hi, Bob?  F Hi, Ada!  G Core." },
  ],
};
