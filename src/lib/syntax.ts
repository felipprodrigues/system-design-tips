/* Syntax highlighting for the code blocks in src/content, with no dependency
   and no grammar: one ordered alternation per language, first match wins. That
   is enough for snippets this short, and it costs nothing at runtime — the
   document is parsed on the server, so the browser only ever sees the spans.

   Blocks are JavaScript unless the author says otherwise: <code class="css">
   for stylesheets, <code class="plain"> for the ones that are not code at all
   (console output, directory trees, the render-phase diagrams). */

const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&amp;": "&",
};

/* Content is authored as escaped HTML, so the source has to be decoded before
   it can be tokenised — an entity is punctuation and letters, and the tokeniser
   would read `=&gt;` as an identifier. One pass, so `&amp;gt;` decodes to the
   text `&gt;` and not to `>`. */
function decode(html: string) {
  return html.replace(/&(?:lt|gt|quot|#39|amp);/g, (e) => ENTITIES[e]);
}

function esc(code: string) {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const KEYWORDS = [
  "as", "async", "await", "break", "case", "catch", "class", "const", "continue", "default",
  "delete", "do", "else", "export", "extends", "finally", "for", "from", "function", "get",
  "if", "import", "in", "instanceof", "interface", "let", "new", "of", "return", "set",
  "static", "super", "switch", "this", "throw", "try", "type", "typeof", "var", "void",
  "while", "yield",
  // Literals read as keywords in every theme worth copying.
  "false", "null", "true", "undefined",
].join("|");

/* Groups, in precedence order, matching TOKEN_CLASSES below. A comment wins
   over everything (it can contain any character), then strings, and only then
   the rules that look at bare words. */
const JS = new RegExp(
  [
    String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`,
    String.raw`'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|\`(?:\\.|[^\`\\])*\``,
    String.raw`<\/?[A-Za-z][\w.]*|\/>`,
    String.raw`\b(?:${KEYWORDS})\b`,
    String.raw`\b0x[\da-fA-F]+\b|\b\d+(?:\.\d+)?\b`,
    String.raw`\b[A-Za-z_$][\w$]*(?=\s*\()`,
  ]
    .map((pattern) => `(${pattern})`)
    .join("|"),
  "g",
);

const CSS = new RegExp(
  [
    String.raw`\/\*[\s\S]*?\*\/`,
    String.raw`'[^'\n]*'|"[^"\n]*"`,
    String.raw`@[a-z-]+`,
    String.raw`[-\w]+(?=\s*:)`,
    String.raw`#[\da-fA-F]{3,8}\b|\b\d+(?:\.\d+)?[a-z%]*\b`,
  ]
    .map((pattern) => `(${pattern})`)
    .join("|"),
  "g",
);

const JS_CLASSES = ["comment", "string", "tag", "keyword", "number", "fn"];
const CSS_CLASSES = ["comment", "string", "keyword", "prop", "number"];

function tokenise(code: string, pattern: RegExp, classes: string[]) {
  let out = "";
  let last = 0;

  for (const match of code.matchAll(pattern)) {
    const group = match.slice(1).findIndex((captured) => captured !== undefined);
    out += esc(code.slice(last, match.index));
    out += `<span class="tok-${classes[group]}">${esc(match[0])}</span>`;
    last = match.index + match[0].length;
  }

  // Everything between tokens — punctuation, identifiers — stays unstyled.
  return out + esc(code.slice(last));
}

const BLOCK = /<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;

/** Rewrites every `<pre><code>` in an authored document into styled tokens. */
export function highlight(html: string) {
  return html.replace(BLOCK, (whole, lang: string | undefined, code: string) => {
    if (lang === "plain") return whole;

    const [pattern, classes] = lang === "css" ? [CSS, CSS_CLASSES] : [JS, JS_CLASSES];
    return `<pre><code class="${lang ?? "js"}">${tokenise(decode(code), pattern, classes)}</code></pre>`;
  });
}
