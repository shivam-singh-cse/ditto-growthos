"use client";

import { useAppStore } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InfluencersPage() {
  const { influencers, updateInfluencerStatus, refreshData, user } = useAppStore() as any;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddInfluencer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("influencers").insert([{
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      platform: fd.get("platform"),
      category: fd.get("category"),
      followers: parseInt(fd.get("followers") as string),
      engagement_rate: parseFloat(fd.get("engagement_rate") as string),
      status: "Sourced",
      owner_id: user?.id
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
        <h2 className="text-2xl font-semibold tracking-tight">Influencer CRM</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors">
          <Plus size={16} /> Add Influencer
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-strong)] border-b border-[var(--color-border-default)]">
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Name</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Contact</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Category</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Followers</th>
              <th className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((inf: any) => (
              <tr key={inf.influencer_id} className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-surface-strong)] transition-colors">
                <td className="py-3 px-4 text-sm font-medium">
                  {inf.name}
                  <div className="text-[11px] text-[var(--color-text-secondary)]">{inf.platform}</div>
                </td>
                <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
                  <div>{inf.email}</div>
                  <div className="text-xs">{inf.phone}</div>
                </td>
                <td className="py-3 px-4 text-sm">{inf.category}</td>
                <td className="py-3 px-4 text-sm">
                  {(inf.followers / 1000).toFixed(1)}k
                  <div className="text-[11px] text-[var(--color-text-secondary)]">{inf.engagement_rate}% ER</div>
                </td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">Add New Influencer</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddInfluencer} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" name="name" required placeholder="e.g. Shruti" className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select name="platform" required className="w-full border p-2 rounded text-sm">
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" name="email" required placeholder="contact@example.com" className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" name="phone" required placeholder="+91..." className="w-full border p-2 rounded text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content Category</label>
                <select name="category" required className="w-full border p-2 rounded text-sm">
                  <option value="Finance">Finance</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Education">Education</option>
                  <option value="Tech">Tech</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Followers Count</label>
                  <input type="number" name="followers" required min="0" placeholder="50000" className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
                  <input type="number" step="0.1" name="engagement_rate" required min="0" placeholder="2.5" className="w-full border p-2 rounded text-sm" />
                </div>
              </div>

              <div className="pt-2">
                <button disabled={loading} type="submit" className="w-full bg-[#10b981] text-white py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50">
                  {loading ? "Adding..." : "Save Influencer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
