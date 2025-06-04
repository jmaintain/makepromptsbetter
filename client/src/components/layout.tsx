import { Navigation } from "@/components/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 overflow-x-hidden">
      <Navigation />
      <main className="mobile-container">{children}</main>
    </div>
  );
}