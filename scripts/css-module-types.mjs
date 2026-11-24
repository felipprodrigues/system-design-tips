/* Next types every CSS module as `{ [key: string]: string }`, so a misspelled
   `styles.bannr` compiles and renders no class. This writes an exact declaration
   per module into .typegen/, which tsconfig.typecheck.json overlays onto src/
   through rootDirs, so `npm run typecheck` rejects a class the stylesheet lacks. */

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const SRC = "src";
const OUT = ".typegen";

function modulesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return modulesIn(path);
    return entry.name.endsWith(".module.css") ? [path] : [];
  });
}

/* `:global(.sd-card).toned` scopes `.toned` locally but `.sd-card` is a global
   class, so it must not become a key. */
export function classNames(css) {
  const stripped = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/:global\([^)]*\)/g, "")
    .replace(/url\([^)]*\)/g, "")
    .replace(/"[^"]*"|'[^']*'/g, "");
  return [...new Set([...stripped.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((match) => match[1]))].sort();
}

function declaration(names) {
  const keys = names.map((name) => `  readonly ${JSON.stringify(name)}: string;`).join("\n");
  return `declare const styles: {\n${keys}\n};\nexport default styles;\n`;
}

rmSync(OUT, { recursive: true, force: true });
const modules = modulesIn(SRC);
for (const path of modules) {
  const target = join(OUT, `${path}.d.ts`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, declaration(classNames(readFileSync(path, "utf8"))));
}
console.log(`css-module-types: ${modules.length} modules → ${relative(".", OUT)}/`);
