"use client";

import { useAppStore } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CampaignsPage() {
  const { campaigns, influencers, refreshData, user } = useAppStore() as any;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("campaigns").insert([{
      influencer_id: fd.get("influencer_id"),
      product: fd.get("product"),
      content_type: fd.get("content_type"),
      budget: parseInt(fd.get("budget") as string),
      campaign_status: "Draft",
      approval_status: "Pending"
    }]);
    
    if (error) alert("Error: " + error.message);
    else {
      await refreshData();
      setShowModal(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Campaigns Center</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors">
          <Plus size={16} /> New Campaign
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
                  No campaigns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Create New Campaign</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCampaign} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Influencer</label>
                <select name="influencer_id" required className="w-full border p-2 rounded text-sm">
                  {influencers.map((i: any) => (
                    <option key={i.influencer_id} value={i.influencer_id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Line</label>
                <select name="product" required className="w-full border p-2 rounded text-sm">
                  <option value="Health">Health Insurance</option>
                  <option value="Term">Term Insurance</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content Type</label>
                <select name="content_type" required className="w-full border p-2 rounded text-sm">
                  <option value="LinkedIn Post">LinkedIn Post</option>
                  <option value="Instagram Reel">Instagram Reel</option>
                  <option value="Instagram Story">Instagram Story</option>
                  <option value="Integrated YouTube Video">Integrated YouTube Video</option>
                  <option value="Dedicated YouTube Video">Dedicated YouTube Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allocated Budget (INR)</label>
                <input type="number" name="budget" required min="0" placeholder="e.g. 50000" className="w-full border p-2 rounded text-sm" />
              </div>
              <div className="pt-2">
                <button disabled={loading} type="submit" className="w-full bg-[#10b981] text-white py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50">
                  {loading ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
