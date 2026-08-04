import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { getOgFonts } from "@/lib/og";

export const alt = "Formbrew";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const fonts = await getOgFonts();

  return new ImageResponse(
    <OgCard
      eyebrow="DESCRIBE · BUILD · SHARE"
      title="Describe it. The form brews itself."
      description="Type what you need in plain English. The AI generates questions, you refine with chat."
      meta="NO DRAG-AND-DROP REQUIRED"
      footer="Create, share, and collect responses — instantly."
    />,
    { ...size, fonts },
  );
}
