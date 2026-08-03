import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG = {
  background: "#FAFAFA",
  foreground: "#111111",
  muted: "#737373",
  hairline: "#E5E5E5",
  card: "#FFFFFF",
  skeleton: "#EEEEEE",
} as const;

export function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

const loadFonts = cache(async () => {
  const dir = join(process.cwd(), "src/lib/fonts");
  const fonts = [
    { name: "Inter", file: "Inter_18pt-Regular.ttf", weight: 400 },
    { name: "Inter", file: "Inter_18pt-SemiBold.ttf", weight: 600 },
    { name: "Inter", file: "Inter_18pt-Bold.ttf", weight: 700 },
  ] as const;

  return Promise.all(
    fonts.map(async ({ name, file, weight }) => ({
      name,
      data: await readFile(join(dir, file)),
      weight,
      style: "normal" as const,
    })),
  );
});

export function getOgFonts() {
  return loadFonts();
}
