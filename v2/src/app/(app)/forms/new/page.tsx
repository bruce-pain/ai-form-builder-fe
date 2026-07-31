"use client";

import { useSession } from "next-auth/react";

import { FormEditor } from "@/components/FormEditor";

export default function NewFormPage() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session.accessToken) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <FormEditor token={session.accessToken} />;
}
