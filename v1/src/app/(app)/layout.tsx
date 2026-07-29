import { Header } from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
