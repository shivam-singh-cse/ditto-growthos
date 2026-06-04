"use client";

import { useAppStore } from "@/lib/store";
import { Plus } from "lucide-react";

export default function InfluencersPage() {
  const { influencers, updateInfluencerStatus } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Influencer CRM</h2>
        <button className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors">
          <Plus size={16} /> Add Influencer
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-strong)] border-b border-[var(--color-border-default)]">
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Name</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Handle</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Category</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Followers</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Manager</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((inf) => (
              <tr key={inf.influencer_id} className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-surface-strong)] transition-colors">
                <td className="py-3 px-4 text-sm font-medium">{inf.name}</td>
                <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{inf.email}</td>
                <td className="py-3 px-4 text-sm">{inf.category}</td>
                <td className="py-3 px-4 text-sm">{(inf.followers / 1000).toFixed(1)}k</td>
                <td className="py-3 px-4 text-sm">You</td>
                <td className="py-3 px-4 text-sm">
                  <select 
                    value={inf.status}
                    onChange={(e) => updateInfluencerStatus(inf.influencer_id, e.target.value)}
                    className="bg-transparent border border-[var(--color-border-default)] rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                  >
                    {["Sourced", "Contacted", "Replied", "Negotiation", "Approved", "Scheduled", "Live", "Completed", "Rejected", "Lost"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {influencers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-text-secondary)] text-sm">
                  No influencers found. Please run the import in settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
