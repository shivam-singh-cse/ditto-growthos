import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Zap, Link as LinkIcon, BarChart3, Settings, ShieldAlert } from "lucide-react";

export function Sidebar() {
  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Influencers", href: "/influencers", icon: Users },
    { name: "Activations", href: "/activations", icon: Zap },
    { name: "Attribution", href: "/attribution", icon: LinkIcon },
    { name: "Reporting", href: "/reporting", icon: BarChart3 },
    { name: "Automations", href: "/automations", icon: ShieldAlert },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-[var(--color-border-default)] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-default)]">
        <div className="font-bold text-lg tracking-tight text-[var(--color-surface-base)]">
          Ditto<span className="text-[#10b981]">OS</span>
        </div>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text-tertiary)] transition-colors"
            >
              <Icon size={18} strokeWidth={2} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
