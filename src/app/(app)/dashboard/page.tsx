import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getForms } from "@/lib/form";

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
  const email = session.user.email!;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {email}
          </h1>
        </div>
        <Link
          href="/forms/new"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          + New form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-20 dark:border-gray-600">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No forms yet
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Create your first form to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Link
              key={form.id}
              href={`/forms/${form.id}`}
              className="group block min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {form.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {form.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    form.is_published
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {form.is_published ? "Published" : "Draft"}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Updated {formatDate(form.updated_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
