import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG = {
  background: "#FEF2DF",
  foreground: "#361C11",
  muted: "#6E5547",
  hairline: "#D9C7B7",
  card: "#FFFBF3",
  skeleton: "#F0DAC2",
  accent: "#DC7B40",
  accentForeground: "#250F07",
  primary: "#562A19",
  primaryForeground: "#FDF8ED",
} as const;

const DEFAULT_SITE_URL = "https://formbrew.vercel.app";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

export function getSiteHostname(): string {
  return new URL(getSiteUrl()).hostname;
}

export function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

const loadFonts = cache(async () => {
  const dir = join(process.cwd(), "src/lib/fonts");
  const fonts = [
    { name: "Bricolage Grotesque", file: "BricolageGrotesque-Regular.ttf", weight: 400 },
    { name: "Bricolage Grotesque", file: "BricolageGrotesque-SemiBold.ttf", weight: 600 },
    { name: "Bricolage Grotesque", file: "BricolageGrotesque-Bold.ttf", weight: 700 },
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
