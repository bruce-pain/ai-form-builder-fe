"use client";

import { use } from "react";
import { useSession } from "next-auth/react";

import { FormEditor } from "@/components/FormEditor";

export default function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session.accessToken) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <FormEditor token={session.accessToken} formId={id} />;
}
