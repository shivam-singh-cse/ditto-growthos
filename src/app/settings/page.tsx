"use client";

import { useAppStore } from "@/lib/store";
import { Download, Upload, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { influencers, campaigns, performance } = useAppStore();

  const handleExport = () => {
    const headers = ["Influencer ID,Name,Platform,Category,Followers,Status"];
    const rows = influencers.map(i => `${i.influencer_id},${i.name},${i.platform},${i.category},${i.followers},${i.status}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ditto_influencers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings & Data Management</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage system preferences and import/export data.</p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Export Data</h3>
          <div className="flex items-center justify-between p-4 border border-[var(--color-border-default)] rounded-lg">
            <div>
              <div className="font-medium text-sm">Download Influencer Database</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm">
                Export a CSV file of all your current influencers, including their contact status and metrics.
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="bg-white border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-surface-strong)] transition-colors flex items-center gap-2 shrink-0"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Import Data</h3>
          <div className="flex items-center justify-between p-4 border border-[var(--color-border-default)] rounded-lg">
            <div>
              <div className="font-medium text-sm">Bulk Import</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm">
                Upload a CSV to bulk-add new influencers and campaigns.
              </div>
            </div>
            <label className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0ea5e9] transition-colors flex items-center gap-2 shrink-0 cursor-pointer">
              <Upload size={16} /> Select CSV File
              <input type="file" className="hidden" accept=".csv" onChange={() => alert("Upload complete (simulated for assignment)")} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
