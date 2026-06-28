import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function packageRoot(metaUrl: string = import.meta.url): string {
  let current = path.dirname(fileURLToPath(metaUrl));
  while (true) {
    const manifest = path.join(current, "package.json");
    if (existsSync(manifest)) {
      const parsed = JSON.parse(readFileSync(manifest, "utf8")) as { name?: string };
      if (parsed.name === "codex-game-studio") return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Could not find codex-game-studio package root");
    }
    current = parent;
  }
}

export function packageAssetPath(relativePath: string): string {
  if (path.isAbsolute(relativePath) || relativePath.includes("..")) {
    throw new Error(`Package asset path must be relative and contained: ${relativePath}`);
  }
  return path.join(packageRoot(import.meta.url), relativePath);
}

export function resolveProjectRoot(input?: string, cwd: string = process.cwd()): string {
  return path.resolve(cwd, input ?? ".");
}
