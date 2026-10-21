/* Node needs file extensions on relative imports; Next does not, so app code is
   written without them. This hook adds the ".ts" back at resolve time, which is
   what lets `node --experimental-strip-types` run a source file directly instead
   of the repo carrying a test runner and a transpiler to do the same job. */

import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\.\w+$/.test(specifier) && context.parentURL?.startsWith("file:")) {
    const candidate = resolvePath(dirname(fileURLToPath(context.parentURL)), `${specifier}.ts`);
    if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context);
  }
  return next(specifier, context);
}
