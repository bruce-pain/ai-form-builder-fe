import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white p-8 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-black dark:text-white">Home</h1>
      <ThemeToggle />
    </div>
  );
}
