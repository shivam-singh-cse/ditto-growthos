"use client";

import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Bot, TrendingUp, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { influencers, campaigns, performance } = useAppStore();
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const metrics = [
    { label: "Total Influencers", value: influencers.length },
    { label: "Live Campaigns", value: campaigns.filter(a => a.campaign_status === "Live").length },
    { label: "Total Leads", value: performance.reduce((sum, p) => sum + (p.leads || 0), 0) },
    { label: "Conversions", value: performance.reduce((sum, p) => sum + (p.conversions || 0), 0) },
  ];

  // Map granular data: Influencer + Content Type + Product Type -> ROI / CPA
  const granularData = campaigns.map(camp => {
    const perf = performance.find(p => p.campaign_id === camp.campaign_id);
    const inf = influencers.find(i => i.influencer_id === camp.influencer_id);
    const cost = camp.budget || 1;
    const conversions = perf?.conversions || 0;
    const cpa = conversions > 0 ? (cost / conversions).toFixed(2) : "N/A";
    return {
      influencer: inf?.name || "Unknown",
      product: camp.product,
      contentType: camp.content_type,
      cpa: cpa,
      roi: perf?.roi || 0,
      conversions: conversions
    };
  }).filter(d => d.conversions > 0 || d.roi > 0);

  const generateActionPlan = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granularData })
      });
      const data = await res.json();
      setAiSummary(JSON.parse(data.summary));
    } catch (err) {
      console.error(err);
      setAiSummary(null);
    }
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h2>
        <button 
          onClick={generateActionPlan}
          disabled={loadingAi || granularData.length === 0}
          className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0ea5e9] transition-colors disabled:opacity-50"
        >
          <Bot size={16} /> {loadingAi ? "Analyzing DB..." : "AI Action Plan"}
        </button>
      </div>

      {aiSummary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">SCALE Recommendations</h3>
            <div className="space-y-3">
              {aiSummary.scale?.map((s: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 text-sm">
                  <div className="font-semibold text-green-800">{s.influencer}</div>
                  <div className="text-xs text-green-600 mb-1">{s.product} • {s.content_type}</div>
                  <div className="text-gray-600 text-xs">{s.reason}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">CUT Recommendations</h3>
            <div className="space-y-3">
              {aiSummary.cut?.map((c: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 text-sm">
                  <div className="font-semibold text-red-800">{c.influencer}</div>
                  <div className="text-xs text-red-600 mb-1">{c.product} • {c.content_type}</div>
                  <div className="text-gray-600 text-xs">{c.reason}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">Next Actions</h3>
            <ul className="space-y-2 list-disc pl-4 text-sm text-blue-800">
              {aiSummary.action_steps?.map((action: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm">
            <div className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-1">{m.label}</div>
            <div className="text-3xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Granular Performance (Top Combinations)</h3>
          <div className="space-y-3">
            {granularData.sort((a,b) => b.roi - a.roi).slice(0, 5).map((d, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-[var(--color-border-default)] last:border-0">
                <div>
                  <div className="font-medium">{d.influencer}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{d.product} • {d.contentType}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-700 font-bold">{d.roi}x ROI</div>
                  <div className="text-xs text-gray-500">₹{d.cpa} CPA</div>
                </div>
              </div>
            ))}
            {granularData.length === 0 && <div className="text-sm text-gray-500">No performance data yet.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Pipeline Status</h3>
          <div className="space-y-3">
            {["Sourced", "Contacted", "Replied", "Negotiation", "Approved", "Scheduled", "Live", "Completed", "Rejected", "Lost"].map(status => {
              const count = influencers.filter(i => i.status === status).length;
              if (count === 0 && !["Sourced", "Contacted", "Negotiation", "Live"].includes(status)) return null; // Hide empty non-core stages to save space
              return (
                <div key={status} className="flex justify-between items-center text-sm py-2 border-b border-[var(--color-border-default)] last:border-0">
                  <div className="font-medium text-[var(--color-text-secondary)]">{status}</div>
                  <div className="font-semibold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
