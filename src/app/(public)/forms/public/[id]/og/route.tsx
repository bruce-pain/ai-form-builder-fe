import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og/OgCard";
import { getOgFonts, truncate } from "@/lib/og";
import { getPublicForm } from "@/lib/public-form";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const fonts = await getOgFonts();

  let title = "This form isn't available";
  let description: string | undefined =
    "The form you're looking for doesn't exist or hasn't been published.";
  let meta: string | undefined;
  const footer = "Describe your form. AI builds it.";

  try {
    const form = await getPublicForm(id);
    title = truncate(form.data.title.trim() || "Untitled Form", 48);
    description = form.data.description
      ? truncate(form.data.description, 130)
      : undefined;
    const questionCount = form.data.questions?.length ?? 0;
    meta =
      questionCount > 0
        ? `${questionCount} ${questionCount === 1 ? "QUESTION" : "QUESTIONS"}`
        : undefined;
  } catch {
    // Render the generic fallback card.
  }

  return new ImageResponse(
    <OgCard
      eyebrow="FORM PREVIEW"
      title={title}
      description={description}
      meta={meta}
      footer={footer}
    />,
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
