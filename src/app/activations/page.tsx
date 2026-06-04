"use client";

import { useAppStore } from "@/lib/store";
import { Plus } from "lucide-react";

export default function ActivationsPage() {
  const { activations: unused, campaigns, influencers } = useAppStore() as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Campaign Activations</h2>
        <button className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors">
          <Plus size={16} /> New Activation
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-strong)] border-b border-[var(--color-border-default)]">
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Campaign ID</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Influencer</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Product</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Cost</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((act: any) => {
              const inf = influencers.find((i:any) => i.influencer_id === act.influencer_id);
              return (
                <tr key={act.campaign_id} className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-surface-strong)] transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">
                    {act.campaign_id.slice(0, 8)}...
                    <div className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5">{act.content_type}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">{inf?.name || "Unknown"}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">{act.product}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">₹{act.budget.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                      {act.campaign_status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!campaigns || campaigns.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-text-secondary)] text-sm">
                  No activations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
