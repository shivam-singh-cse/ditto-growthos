"use client";

import { useAppStore } from "@/lib/store";
import { BarChart3, TrendingUp, Users, Target, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ReportingPage() {
  const { influencers, campaigns, performance } = useAppStore();
  const [summary, setSummary] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [view, setView] = useState("Manager");

  const activeInfluencers = influencers.filter(i => ["Contacted", "Replied", "Negotiation", "Live"].includes(i.status)).length;
  const totalCost = campaigns.reduce((sum, act) => sum + act.budget, 0);
  const totalConversions = performance.reduce((sum, p) => sum + (p.conversions || 0), 0);
  const costPerAcquisition = totalConversions > 0 ? totalCost / totalConversions : 0;

  const generateAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          influencers: influencers.length, 
          activeInfluencers, 
          totalCost, 
          totalConversions, 
          cpa: costPerAcquisition 
        })
      });
      const data = await res.json();
      setSummary(JSON.parse(data.summary));
    } catch (e) {
      console.error(e);
      setSummary(null);
    }
    setLoadingAI(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Weekly Review Center</h2>
        <select 
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="bg-white border border-[var(--color-border-default)] px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
        >
          <option value="Manager">Manager View</option>
          <option value="VP">VP Marketing View</option>
          <option value="Founder">Founder View</option>
        </select>
      </div>

      {view === "Manager" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
                <Users size={16} /> <span className="text-[13px] font-medium">Pipeline Health</span>
              </div>
              <div className="text-2xl font-bold">{activeInfluencers}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">Active discussions</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
                <Target size={16} /> <span className="text-[13px] font-medium">Follow-ups Needed</span>
              </div>
              <div className="text-2xl font-bold">{influencers.filter(i => i.status === "Contacted" || i.status === "Replied").length}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">Pending response</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-red-600 flex items-center gap-2"><AlertTriangle size={18} /> Stuck Influencers</h3>
              <div className="space-y-3">
                {influencers.filter(i => i.status === "Negotiation").map(inf => (
                  <div key={inf.influencer_id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between">
                    <div>
                      <div className="text-sm font-medium text-red-800">{inf.name}</div>
                      <div className="text-xs text-red-600 mt-1">Stalled in negotiation phase. Check emails.</div>
                    </div>
                    <button className="text-xs bg-white border border-red-200 px-3 rounded text-red-700">Follow up</button>
                  </div>
                ))}
                {influencers.filter(i => i.status === "Negotiation").length === 0 && (
                  <div className="text-sm text-gray-500">No influencers stuck in negotiation!</div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Live Campaigns</h3>
              <div className="space-y-3">
                {campaigns.filter(c => c.campaign_status === "Live").map(c => {
                  const inf = influencers.find(i => i.influencer_id === c.influencer_id);
                  return (
                    <div key={c.campaign_id} className="flex justify-between items-center text-sm py-2 border-b border-[var(--color-border-default)] last:border-0">
                      <div>
                        <div className="font-medium">{inf?.name}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">{c.product}</div>
                      </div>
                      <div className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded border border-green-100">Live</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "VP" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
                <Target size={16} /> <span className="text-[13px] font-medium">Total Spend</span>
              </div>
              <div className="text-2xl font-bold">₹{totalCost.toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
                <BarChart3 size={16} /> <span className="text-[13px] font-medium">Blended CPA</span>
              </div>
              <div className="text-2xl font-bold">₹{costPerAcquisition.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Product Performance Allocation</h3>
              <div className="space-y-4">
                {["Health", "Term", "Both"].map(product => {
                  const productActs = campaigns.filter(a => a.product === product);
                  const productPerf = performance.filter(p => productActs.some(a => a.campaign_id === p.campaign_id));
                  const conversions = productPerf.reduce((sum, p) => sum + (p.conversions || 0), 0);
                  
                  return (
                    <div key={product} className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{product} Insurance</span>
                        <span className="text-[var(--color-text-secondary)]">{conversions} conversions</span>
                      </div>
                      <div className="h-2 bg-[var(--color-surface-raised)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#10b981] rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, (conversions / (totalConversions || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Top Performing Formats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">YouTube Integration</span>
                  <span className="text-green-600 font-bold">Highest ROI</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">LinkedIn Posts</span>
                  <span className="text-blue-600 font-bold">Lowest CPA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "Founder" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111] text-white p-6 rounded-xl shadow-sm">
              <div className="text-sm font-medium text-gray-400 mb-1">Total Revenue Generated</div>
              <div className="text-3xl font-bold">₹{performance.reduce((sum, p) => sum + (p.premium_revenue || 0), 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Total Conversions</div>
              <div className="text-3xl font-bold">{totalConversions}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[var(--color-border-default)] shadow-sm">
              <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Blended CPA</div>
              <div className="text-3xl font-bold">₹{costPerAcquisition.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Bot className="text-purple-600" /> AI Board Report (Groq)</h3>
              <button onClick={generateAI} disabled={loadingAI} className="flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700">
                {loadingAI ? "Analyzing DB..." : "Generate AI Report"}
              </button>
            </div>
            
            <div className="p-6">
              {!summary ? (
                <div className="text-center py-8 text-gray-500 italic">Click generate to run the weekly board-level AI analysis.</div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2"><CheckCircle2 size={16} /> Biggest Wins</h4>
                    <ul className="space-y-3">
                      {summary.biggest_wins?.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-100">{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2"><AlertTriangle size={16} /> Biggest Risks</h4>
                    <ul className="space-y-3">
                      {summary.biggest_risks?.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-100">{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-800 mb-4">Decisions Required</h4>
                    <ul className="space-y-3">
                      {summary.decisions_required?.map((d: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 bg-purple-50 p-3 rounded border border-purple-100">{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
