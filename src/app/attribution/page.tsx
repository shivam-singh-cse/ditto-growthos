"use client";

import { useAppStore } from "@/lib/store";
import { Link as LinkIcon, Download, Search } from "lucide-react";

export default function AttributionPage() {
  const { performance, campaigns } = useAppStore() as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Attribution Tracking</h2>
        <div className="flex gap-2">
          <button className="bg-white border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[var(--color-surface-strong)] transition-colors">
            <Download size={16} /> Export
          </button>
          <button className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors">
            <LinkIcon size={16} /> Override Performance
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--color-border-default)] flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search campaign ID..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-strong)] border-b border-[var(--color-border-default)]">
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Campaign ID</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Leads</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Conversions</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">ROI</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {performance?.map((perf: any) => {
              return (
                <tr key={perf.campaign_id} className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-surface-strong)] transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-[var(--color-text-secondary)]">{perf.campaign_id.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-sm font-medium">{perf.leads}</td>
                  <td className="py-3 px-4 text-sm">{perf.conversions}</td>
                  <td className="py-3 px-4 text-sm font-medium text-green-700">{perf.roi}x</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-0.5 rounded text-xs font-medium border bg-blue-50 text-blue-700">
                      {perf.recommendation || "Pending"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!performance || performance.length === 0) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-text-secondary)] text-sm">
                  No performance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
