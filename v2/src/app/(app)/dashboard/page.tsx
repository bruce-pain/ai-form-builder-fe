import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/FormCard";

import type { components } from "@/lib/api.types";

type FormData = components["schemas"]["FormListResponseData"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { data: forms }: { data: FormData[] } = await apiFetch(
    "/api/v1/forms",
    session.accessToken,
  );

  const sorted = [...forms].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your Forms</h1>
        <Button asChild>
          <Link href="/forms/new">New form</Link>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium">No forms yet</h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Create your first form to get started
          </p>
          <Button asChild>
            <Link href="/forms/new">Create your first form</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </>
  );
}
