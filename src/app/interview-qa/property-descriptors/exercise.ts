import type { Exercise, Scope } from "../closures/exercise";

const flags = (name: string, ...vars: Scope["vars"]): Scope => ({ name: `${name} flags`, vars });
const names: Scope = { name: "Variables", vars: [["o", "", "#1"]] };
const open = flags("a", ["value", "1"], ["writable", "true"], ["enumerable", "true"], ["configurable", "true"]);
const locked = flags("id", ["value", "42"], ["writable", "false"], ["enumerable", "false"], ["configurable", "false"]);
const getter = flags("label", ["get", "ƒ"], ["enumerable", "true"], ["configurable", "false"]);
const o = (...extra: Scope["vars"]): Scope => ({ name: "#1 object", vars: [["a", "1", "a flags"], ["id", "42", "id flags"], ...extra] });
const out = ["a", '{"a":1}', "42", "false", "#42", "1", "false"];

export const EXERCISE: Exercise = {
  hint: "A property made by a literal or an assignment gets all three flags true. One made with defineProperty gets every flag you leave out set to false. Non-enumerable hides it from keys, spread and JSON. Non-writable ignores assignment. Non-configurable blocks delete.",
  memory: "An object and the flags on each property (the arrow leads to that property's descriptor)",
  code: [
    "const o = { a: 1 };",
    'Object.defineProperty(o, "id", { value: 42 });',
    "",
    "console.log(Object.keys(o).join());   // A",
    "console.log(JSON.stringify(o));       // B",
    "o.id = 99;",
    "console.log(o.id);                    // C",
    "console.log(delete o.id);             // D",
    "",
    'Object.defineProperty(o, "label", {',
    "  get() { return `#${this.id}`; },",
    "  enumerable: true,",
    "});",
    "console.log({ ...o }.label);          // E",
    "",
    "Object.freeze(o);",
    "o.a = 2;",
    "console.log(o.a);                     // F",
    'console.log(Object.getOwnPropertyDescriptor(o, "a").writable); // G',
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G"],
  answer: out,
  tiles: ["a", "a,id", '{"a":1}', '{"a":1,"id":42}', "42", "99", "true", "false", "false", "#42", "1", "2"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1], scopes: [names, { ...o(), fresh: true }, { ...open, fresh: true }, { ...locked, fresh: true }], stack: [], out: [], phase: "Define", note: "The literal gives `a` all three flags `true`. `defineProperty` was only told the value, so every flag on `id` defaults to `false`." },
    { lines: [3, 4], scopes: [names, o(), open, locked], stack: [], out: out.slice(0, 2), phase: "Read", note: "`id` is not enumerable, so `Object.keys` and `JSON.stringify` both skip it. It is still there: `o.id` reads it fine." },
    { lines: [5, 6, 7], scopes: [names, o(), open, locked], stack: [], out: out.slice(0, 4), phase: "Mutate", note: "`writable: false`, so `o.id = 99` is silently ignored here; in strict mode it throws. `configurable: false`, so `delete` refuses and returns `false`." },
    { lines: [9, 10, 11, 12, 13], scopes: [names, { ...o(["label", "get ƒ", "label flags"]), changed: ["label"] }, open, locked, { ...getter, fresh: true }, { name: "#2 object", vars: [["a", "1"], ["label", '"#42"']], fresh: true }], stack: ["get label()"], out: out.slice(0, 5), phase: "Define", note: "An accessor runs a function on every read. Spread copies own enumerable properties by reading them, so the getter runs once and #2 gets a plain string, not the getter. `id` is left behind." },
    { lines: [15, 16, 17, 18], scopes: [names, o(["label", "get ƒ", "label flags"]), { ...flags("a", ["value", "1"], ["writable", "false"], ["enumerable", "true"], ["configurable", "false"]), changed: ["writable", "configurable"] }, locked, getter], stack: [], out, phase: "Mutate", note: "`Object.freeze` sets `writable` and `configurable` to `false` on every own property, so `o.a = 2` is ignored. It only goes one level deep: an object stored in a property would stay editable." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: 'Final answers: A a, B {"a":1}, C 42, D false, E the string from the getter, F 1, G false.' },
  ],
};

const cfg = (url: string, extra: Partial<Scope> = {}): Scope => ({ name: "#2 object", vars: [["url", url]], ...extra });
const frozen: Scope = { name: "#1 object", vars: [["api", "", "#2"], ["retries", "3"]], kept: "frozen" };
const locks = ["3", "/v2", "2", "false", "false"];

export const EXTRA: Exercise = {
  hint: "freeze stops writes, additions and deletes on the object itself, one level deep. seal stops additions and deletes but values stay writable. Neither reaches into nested objects.",
  memory: "Objects in memory (a highlighted border means the object is locked)",
  code: [
    'const cfg = Object.freeze({ api: { url: "/v1" }, retries: 3 });',
    "cfg.retries = 5;",
    'cfg.api.url = "/v2";',
    "console.log(cfg.retries);               // A",
    "console.log(cfg.api.url);               // B",
    "",
    "const s = Object.seal({ n: 1 });",
    "s.n = 2;",
    "s.extra = true;",
    "console.log(s.n);                       // C",
    'console.log("extra" in s);              // D',
    "console.log(Object.isFrozen(cfg.api));  // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: locks,
  tiles: ["3", "5", "/v1", "/v2", "1", "2", "true", "false", "false"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0], scopes: [{ name: "Variables", vars: [["cfg", "", "#1"]] }, { ...frozen, fresh: true }, cfg('"/v1"', { fresh: true })], stack: [], out: [], phase: "Define", note: "`freeze` locks #1: every own property becomes non-writable and non-configurable. #2 is a separate object and is not touched." },
    { lines: [1, 2], scopes: [{ name: "Variables", vars: [["cfg", "", "#1"]] }, frozen, cfg('"/v2"', { changed: ["url"] })], stack: [], out: [], phase: "Mutate", note: "`cfg.retries = 5` is silently ignored. `cfg.api.url` only reads `api` from #1 and then writes to #2, which is not frozen, so that works." },
    { lines: [3, 4], scopes: [{ name: "Variables", vars: [["cfg", "", "#1"]] }, frozen, cfg('"/v2"')], stack: [], out: locks.slice(0, 2), phase: "Read", note: "`retries` is still 3. The url changed: freeze is shallow." },
    { lines: [6, 7, 8], scopes: [{ name: "Variables", vars: [["cfg", "", "#1"], ["s", "", "#3"]] }, frozen, cfg('"/v2"'), { name: "#3 object", vars: [["n", "2"]], kept: "sealed", changed: ["n"], fresh: true }], stack: [], out: locks.slice(0, 2), phase: "Mutate", note: "`seal` sets `configurable: false` and blocks new properties, but leaves `writable` alone. So `n` changes and `extra` is ignored." },
    { lines: [9, 10, 11], scopes: [{ name: "Variables", vars: [["cfg", "", "#1"], ["s", "", "#3"]] }, frozen, cfg('"/v2"'), { name: "#3 object", vars: [["n", "2"]], kept: "sealed" }], stack: [], out: locks, phase: "Read", note: "`n` is 2, `extra` never got added, and #2 reports it is not frozen. A deep freeze has to walk every nested object itself." },
    { lines: [], scopes: [], stack: [], out: locks, phase: "Done", note: "Final answers: A 3, B /v2, C 2, D false, E false." },
  ],
};
