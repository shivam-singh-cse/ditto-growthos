import "./globals.css";
import type { Metadata } from "next";
import { AppProvider } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Ditto OS",
  description: "Influencer Marketing OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--color-surface-strong)] text-[var(--color-text-tertiary)] flex h-screen overflow-hidden">
        <AppProvider>
          <Sidebar />
          <div className="flex-1 overflow-auto flex flex-col">
            <header className="h-16 bg-white border-b border-[var(--color-border-default)] flex items-center px-8 shrink-0">
              <h1 className="text-[16px] font-semibold">Influencer CRM</h1>
            </header>
            <main className="p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
