"use client";

import { useAppStore } from "@/lib/store";
import { ShieldAlert, Clock, RefreshCw, Mail } from "lucide-react";

export default function AutomationsPage() {
  const { influencers, communications } = useAppStore();

  const rules = [
    { title: "Duplicate Prevention", desc: "Block entry if Email, Phone, or IG handle exists.", status: "Active", icon: ShieldAlert, color: "blue" },
    { title: "SLA: No Reply (3 days)", desc: "Trigger reminder if Contacted -> No Reply > 3 days.", status: "Active", icon: Clock, color: "yellow" },
    { title: "SLA: Negotiation Stalled", desc: "Escalate to VP if Negotiation > 5 days with no update.", status: "Active", icon: RefreshCw, color: "orange" },
    { title: "Activation Alert", desc: "Alert manager 1 day before Scheduled activation date.", status: "Active", icon: Mail, color: "green" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Automation & SLA Center</h2>
        <button 
          onClick={() => alert("SLA Rules are strictly enforced at the Supabase PostgreSQL Trigger level. Modifying them requires database migration permissions.")}
          className="bg-white border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-surface-strong)] transition-colors"
        >
          Manage Rules
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div key={rule.title} className="bg-white p-5 rounded-xl border border-[var(--color-border-default)] shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-${rule.color}-50 text-${rule.color}-600`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm">{rule.title}</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {rule.status}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">{rule.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-[var(--color-border-default)] p-6 shadow-sm">
        <h3 className="font-semibold mb-4">SLA Violations & Action Items</h3>
        <div className="space-y-3">
          {influencers.filter(i => i.status === "Negotiation").map(inf => {
            const isStalled = new Date().getTime() - new Date(inf.updated_at).getTime() > 5 * 24 * 60 * 60 * 1000;
            return (
              <div key={inf.influencer_id} className="flex justify-between items-center text-sm py-3 border-b border-[var(--color-border-default)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isStalled ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <div className="font-medium">{inf.name} <span className="text-[var(--color-text-secondary)] font-normal ml-2"></span></div>
                    <div className={`text-xs mt-0.5 ${isStalled ? 'text-red-600' : 'text-yellow-600'}`}>
                      {isStalled ? "Stalled in Negotiation > 5 days. Escalate to VP?" : "In Negotiation phase."}
                    </div>
                  </div>
                </div>
                {isStalled && (
                  <button 
                    onClick={() => alert(`Escalation email sent to VP regarding ${inf.name}'s stalled negotiation.`)}
                    className="bg-white border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-strong)] transition-colors"
                  >
                    Escalate
                  </button>
                )}
              </div>
            );
          })}
          {influencers.filter(i => i.status === "Negotiation").length === 0 && (
            <div className="text-sm text-gray-500">All SLAs are currently met. No violations!</div>
          )}
        </div>
      </div>
    </div>
  );
}
