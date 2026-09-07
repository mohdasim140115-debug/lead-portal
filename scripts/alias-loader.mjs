// Minimal ESM resolve hook so CLI scripts can use the "@/..." path alias that
// Next.js resolves at build time.
import { pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const root = process.cwd();

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    let rel = specifier.slice(2);
    const last = rel.split("/").pop();
    if (!last.includes(".")) rel += ".js";
    const target = pathToFileURL(resolvePath(root, "src", rel)).href;
    return next(target, context);
  }
  return next(specifier, context);
}
