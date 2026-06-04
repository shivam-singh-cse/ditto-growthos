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
          <div className="flex-1 overflow-auto flex flex-col pb-16 md:pb-0">
            <header className="h-16 bg-white border-b border-[var(--color-border-default)] flex items-center px-4 md:px-8 shrink-0 justify-center md:justify-start">
              <h1 className="text-[16px] font-semibold">Ditto GrowthOS</h1>
            </header>
            <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
          <MobileNav />
        </AppProvider>
      </body>
    </html>
  );
}

function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border-default)] flex justify-around items-center h-16 px-2 z-50">
      <a href="/" className="flex flex-col items-center p-2 text-gray-500 hover:text-[#10b981]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span className="text-[10px] mt-1 font-medium">Home</span>
      </a>
      <a href="/influencers" className="flex flex-col items-center p-2 text-gray-500 hover:text-[#10b981]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="text-[10px] mt-1 font-medium">CRM</span>
      </a>
      <a href="/campaigns" className="flex flex-col items-center p-2 text-gray-500 hover:text-[#10b981]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span className="text-[10px] mt-1 font-medium">Campaigns</span>
      </a>
      <a href="/reporting" className="flex flex-col items-center p-2 text-gray-500 hover:text-[#10b981]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <span className="text-[10px] mt-1 font-medium">Reports</span>
      </a>
      <a href="/settings" className="flex flex-col items-center p-2 text-gray-500 hover:text-[#10b981]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        <span className="text-[10px] mt-1 font-medium">Settings</span>
      </a>
    </div>
  );
}
