import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <div className="absolute right-8 top-8 z-10">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
