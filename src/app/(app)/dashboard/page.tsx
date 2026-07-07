import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getForms } from "@/lib/form";
import { ShareButton } from "@/components/ShareButton";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { data: forms } = await getForms();
  // TODO: review — move sorting to backend query param once endpoint supports it
  const sorted = [...forms].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-heading text-text-primary">
          Welcome back
        </h1>
        <Link
          href="/forms/new"
          className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-text hover:bg-btn-primary-hover"
        >
          + New form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-20">
          <p className="text-lg text-text-secondary">No forms yet</p>
          <p className="text-sm text-text-placeholder">
            Create your first form to get started
          </p>
        </div>
      ) : (
        <div>
          {sorted.map((form) => (
            <Link
              key={form.id}
              href={
                form.is_published
                  ? `/forms/${form.id}`
                  : `/forms/${form.id}/edit`
              }
              className="block py-6 border-b border-border first:pt-0 last:border-b-0 last:pb-0 space-y-0.5"
            >
              <h3 className="text-xl font-heading text-text-primary leading-snug">
                {form.title}
              </h3>
              <p className="text-sm text-text-secondary">{form.description}</p>
              <div className="flex items-center gap-1.5 pt-0.5 text-xs text-text-placeholder">
                <span
                  className={
                    form.is_published
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {form.is_published ? "Published" : "Draft"}
                </span>
                {form.is_published && <ShareButton formId={form.id} />}
                <span>· Updated {formatDate(form.updated_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
