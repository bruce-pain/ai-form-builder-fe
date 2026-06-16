import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userData = await apiFetch("/api/v1/auth/user");
  const email = userData.data.email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-black dark:text-white">
        Welcome, {email}
      </h1>
    </div>
  );
}
