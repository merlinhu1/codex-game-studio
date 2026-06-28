import { createHash } from "node:crypto";

export type GeneratedSurfaceMetadata = {
  surface: string;
  id?: string;
  role?: string;
  schema: string;
  sourceInputSha256: string;
  renderedBodySha256: string;
};

export type GeneratedSurfaceMetadataParts = {
  generated?: Pick<GeneratedSurfaceMetadata, "surface" | "id" | "role" | "schema">;
  sourceInputSha256?: string;
  renderedBodySha256?: string;
  hasAnyMarker: boolean;
};

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function stableHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function hashGeneratedBody(bodyWithoutMetadata: string): string {
  return createHash("sha256").update(`${bodyWithoutMetadata.trimEnd()}\n`).digest("hex");
}

export function stripGeneratedMetadata(body: string): string {
  return body.replace(
    /^<!-- generated-by: (?:open-gamestudio|codex-game-studio) surface=.* -->\n<!-- source-input-sha256: .* -->\n<!-- rendered-body-sha256: .* -->\n/,
    ""
  );
}

export function renderGeneratedSurfaceMetadata(args: { surface: string; id?: string; role?: string; sourceInput: unknown; body: string }): string {
  const target = [args.id ? `id=${args.id}` : undefined, args.role ? `role=${args.role}` : undefined].filter(Boolean).join(" ");
  return [
    `<!-- generated-by: codex-game-studio surface=${args.surface}${target ? ` ${target}` : ""} schema=1.0 -->`,
    `<!-- source-input-sha256: ${stableHash(args.sourceInput)} -->`,
    `<!-- rendered-body-sha256: ${hashGeneratedBody(args.body)} -->`,
    ""
  ].join("\n");
}

export function parseGeneratedSurfaceMetadata(body: string): GeneratedSurfaceMetadata | undefined {
  const parts = parseGeneratedSurfaceMetadataParts(body);
  if (!parts.generated || !parts.sourceInputSha256 || !parts.renderedBodySha256) return undefined;
  return { ...parts.generated, sourceInputSha256: parts.sourceInputSha256, renderedBodySha256: parts.renderedBodySha256 };
}

export function parseGeneratedSurfaceMetadataParts(body: string): GeneratedSurfaceMetadataParts {
  const generated = /^<!-- generated-by: (?:open-gamestudio|codex-game-studio) surface=(\S+)(?: id=(\S+))?(?: role=(\S+))? schema=(\S+) -->\n/.exec(body);
  const source = /^<!-- generated-by: (?:open-gamestudio|codex-game-studio) surface=.* -->\n<!-- source-input-sha256: ([a-f0-9]+) -->\n/.exec(body);
  const rendered = /^<!-- generated-by: (?:open-gamestudio|codex-game-studio) surface=.* -->\n<!-- source-input-sha256: [a-f0-9]+ -->\n<!-- rendered-body-sha256: ([a-f0-9]+) -->\n/.exec(body);
  const hasAnyMarker = /^<!-- generated-by: (?:open-gamestudio|codex-game-studio)\b.*-->$/m.test(body) || /^<!-- source-input-sha256: .*-->$/m.test(body) || /^<!-- rendered-body-sha256: .*-->$/m.test(body);
  return {
    generated: generated ? { surface: generated[1], id: generated[2], role: generated[3], schema: generated[4] } : undefined,
    sourceInputSha256: source?.[1],
    renderedBodySha256: rendered?.[1],
    hasAnyMarker
  };
}
