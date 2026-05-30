import { existsSync, realpathSync, statSync } from "node:fs";
import path from "node:path";

const broadContextCandidates = [
  "documentation/design/gdd.md",
  "documentation/production/timeline.md",
  "resources/market-research/market-overview.md",
  "AGENTS.md",
  ".codex/studio.json"
] as const;

export function discoverBroadContextFiles(projectRoot: string, existing: string[] = []): string[] {
  const seen = new Set(existing);
  const realRoot = realpathSync(projectRoot);
  return broadContextCandidates.filter((file) => {
    if (seen.has(file)) return false;
    const full = path.join(projectRoot, file);
    if (!existsSync(full)) return false;
    const realFull = realpathSync(full);
    return statSync(realFull).isFile() && realFull.startsWith(`${realRoot}${path.sep}`);
  });
}
