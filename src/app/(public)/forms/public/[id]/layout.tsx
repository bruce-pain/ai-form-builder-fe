import type { Metadata } from "next";
import { getPublicForm } from "@/lib/public-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const form = await getPublicForm(id);
    const title = form.data.title.trim() || "Untitled Form";
    const description = form.data.description;

    return {
      title,
      description,
      openGraph: {
        type: "website",
        title,
        description,
        images: [
          {
            url: `/forms/public/${id}/og`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`/forms/public/${id}/og`],
      },
    };
  } catch {
    return {};
  }
}

export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
