import type { Exercise, Scope } from "../closures/exercise";

const obj = (name: string, ...vars: Scope["vars"]): Scope => ({ name, vars });
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const base = obj("Object.prototype", ["toString", "ƒ"], ["hasOwnProperty", "ƒ"]);
const userProto = obj("User.prototype", ["hi", "ƒ"], ["[[Prototype]]", "", "Object.prototype"]);
const u = (n: number, who: string) => obj(`#${n} object`, ["name", `"${who}"`], ["[[Prototype]]", "", "User.prototype"]);
const out = ["true", "true", "false", "admin hi Cy", "false", "undefined", "undefined"];

export const EXERCISE: Exercise = {
  hint: "A literal links to Object.prototype. new and class put the methods on one shared prototype. A factory builds new functions on every call. Object.create(null) links to nothing. And new hands back the constructor's return value if that is an object.",
  memory: "Objects and their prototypes (an arrow from [[Prototype]] is where a missing property is looked up next)",
  code: [
    'const lit = { name: "Ada" };',
    "console.log(Object.getPrototypeOf(lit) === Object.prototype); // A",
    "",
    "function User(name) { this.name = name; }",
    "User.prototype.hi = function () { return `hi ${this.name}`; };",
    'const u1 = new User("Ada");',
    'const u2 = new User("Bob");',
    "console.log(u1.hi === u2.hi);          // B",
    'console.log(u1.hasOwnProperty("hi"));  // C',
    "",
    "class Admin extends User {",
    '  hi() { return "admin " + super.hi(); }',
    "}",
    'console.log(new Admin("Cy").hi());     // D',
    "",
    "const makeUser = (name) => ({ name, hi: () => `hi ${name}` });",
    'const f1 = makeUser("Ada");',
    'const f2 = makeUser("Bob");',
    "console.log(f1.hi === f2.hi);          // E",
    "",
    "const dict = Object.create(null);",
    "console.log(typeof dict.toString);     // F",
    "",
    "function Odd() { this.a = 1; return { b: 2 }; }",
    "console.log(new Odd().a);              // G",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G"],
  answer: out,
  tiles: ["true", "true", "false", "false", "admin hi Cy", "hi Cy", "undefined", "undefined", "function", "1"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1], scopes: [names(["lit", "", "#1"]), { ...obj("#1 object", ["name", '"Ada"'], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, base], stack: [], out: out.slice(0, 1), phase: "Define", note: "A literal is a one-off object, #1, and its prototype is `Object.prototype`. That link is where `toString` and `hasOwnProperty` come from." },
    { lines: [3, 4, 5, 6], scopes: [names(["User", "ƒ", "User.prototype"], ["u1", "", "#2"], ["u2", "", "#3"]), { ...userProto, fresh: true }, { ...u(2, "Ada"), fresh: true }, { ...u(3, "Bob"), fresh: true }, base], stack: [], out: out.slice(0, 1), phase: "Call", note: "`new` makes an empty object, links it to `User.prototype`, runs `User` with `this` set to it, and returns it. #2 and #3 each hold only `name`." },
    { lines: [7, 8], scopes: [names(["User", "ƒ", "User.prototype"], ["u1", "", "#2"], ["u2", "", "#3"]), userProto, u(2, "Ada"), u(3, "Bob"), base], stack: [], out: out.slice(0, 3), phase: "Read", note: "Neither #2 nor #3 has `hi`, so both lookups go one link up and land on the same function on `User.prototype`: `true`. It is not their own property: `false`." },
    { lines: [10, 11, 12, 13], scopes: [names(["Admin", "ƒ", "Admin.prototype"]), { ...obj("Admin.prototype", ["hi", "ƒ"], ["[[Prototype]]", "", "User.prototype"]), fresh: true }, userProto, { ...obj("#4 object", ["name", '"Cy"'], ["[[Prototype]]", "", "Admin.prototype"]), fresh: true }], stack: ["hi()"], out: out.slice(0, 4), phase: "Call", note: "`class` builds the same chain: #4 links to `Admin.prototype`, which links to `User.prototype`. `super.hi()` starts the lookup one link above `Admin.prototype`, with `this` still #4." },
    { lines: [15, 16, 17, 18], scopes: [names(["makeUser", "ƒ"], ["f1", "", "#5"], ["f2", "", "#6"]), { ...obj("#5 object", ["name", '"Ada"'], ["hi", "ƒ (own)"], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, { ...obj("#6 object", ["name", '"Bob"'], ["hi", "ƒ (own)"], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, base], stack: [], out: out.slice(0, 5), phase: "Call", note: "A factory has no shared prototype for its methods. Each call creates a new arrow function that closes over `name`, so #5 and #6 each carry their own `hi`: `false`." },
    { lines: [20, 21], scopes: [names(["dict", "", "#7"]), { ...obj("#7 object", ["[[Prototype]]", "null"]), fresh: true }], stack: [], out: out.slice(0, 6), phase: "Read", note: "`Object.create(null)` links #7 to nothing. There is no `toString` anywhere on its chain, so it is `undefined`. That is what makes it a safe dictionary for keys from user input." },
    { lines: [23, 24], scopes: [names(), { ...obj("#8 object", ["a", "1"]), kept: "thrown away" }, { ...obj("#9 object", ["b", "2"]), fresh: true }], stack: ["Odd()"], out, phase: "Return", note: "`new` made #8 and set `a` on it, but `Odd` returned an object of its own. When a constructor returns an object, `new` hands that back instead, so the result is #9 and `a` is `undefined`." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A true, B true, C false, D admin hi Cy, E false, F undefined, G undefined." },
  ],
};

const shared = obj("#1 object", ["greet", "ƒ"], ["[[Prototype]]", "", "Object.prototype"]);
const made = ["hi Ada", "name", "0", "function", "true"];

export const EXTRA: Exercise = {
  hint: "Object.create takes the prototype first and, optionally, descriptors for own properties. Object.assign copies own enumerable properties onto a target. A static field belongs to the class itself. fromEntries builds a plain object.",
  memory: "Objects and their prototypes (an arrow from [[Prototype]] is where a missing property is looked up next)",
  code: [
    'const proto = { greet() { return "hi " + this.name; } };',
    'const a = Object.create(proto, { name: { value: "Ada", enumerable: true } });',
    "console.log(a.greet());                          // A",
    "",
    'const b = Object.assign(Object.create(proto), { name: "Bob" });',
    "console.log(Object.keys(b).join());              // B",
    "",
    "class Point {",
    "  static origin = new Point(0, 0);",
    "  constructor(x, y) { this.x = x; this.y = y; }",
    "}",
    "console.log(Point.origin.x);                     // C",
    "console.log(typeof Point.prototype.constructor); // D",
    "",
    'const c = Object.fromEntries([["k", 1]]);',
    "console.log(Object.getPrototypeOf(c) === Object.prototype); // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: made,
  tiles: ["hi Ada", "hi undefined", "name", "name,greet", "0", "undefined", "function", "object", "true", "false"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [names(["proto", "", "#1"], ["a", "", "#2"]), { ...shared, fresh: true }, { ...obj("#2 object", ["name", '"Ada"'], ["[[Prototype]]", "", "#1"]), fresh: true }, base], stack: ["greet()"], out: made.slice(0, 1), phase: "Define", note: "`Object.create(proto, descriptors)` links #2 to #1 and defines `name` on #2 in one go. `greet` is found on #1, with `this` as #2." },
    { lines: [4, 5], scopes: [names(["proto", "", "#1"], ["b", "", "#3"]), shared, { ...obj("#3 object", ["name", '"Bob"'], ["[[Prototype]]", "", "#1"]), fresh: true }, base], stack: [], out: made.slice(0, 2), phase: "Define", note: "`Object.assign` copies `name` onto a fresh object linked to #1. `Object.keys` lists own properties only, so `greet`, which lives on #1, is not there." },
    { lines: [7, 8, 9, 10, 11, 12], scopes: [names(["Point", "ƒ", "Point.prototype"], ["Point.origin", "", "#4"]), { ...obj("Point.prototype", ["constructor", "ƒ"], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, { ...obj("#4 object", ["x", "0"], ["y", "0"], ["[[Prototype]]", "", "Point.prototype"]), fresh: true }, base], stack: [], out: made.slice(0, 4), phase: "Define", note: "A static field runs once, after the class is defined, and sits on `Point` itself, not on instances. Every prototype points back at its function through `constructor`." },
    { lines: [14, 15], scopes: [names(["c", "", "#5"]), { ...obj("#5 object", ["k", "1"], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, base], stack: [], out: made, phase: "Define", note: "`Object.fromEntries` builds an ordinary object from key and value pairs, linked to `Object.prototype` like a literal." },
    { lines: [], scopes: [], stack: [], out: made, phase: "Done", note: "Final answers: A hi Ada, B name, C 0, D function, E true." },
  ],
};
