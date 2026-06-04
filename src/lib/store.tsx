"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface DBInfluencer {
  influencer_id: string;
  name: string;
  platform: string;
  category: string;
  followers: number;
  engagement_rate: number;
  email: string;
  phone: string;
  status: string;
  owner_id: string;
  updated_at: string;
}

export interface DBCampaign {
  campaign_id: string;
  influencer_id: string;
  product: string;
  content_type: string;
  budget: number;
  campaign_status: string;
}

export interface DBPerformance {
  campaign_id: string;
  leads: number;
  qualified_leads: number;
  conversions: number;
  premium_revenue: number;
  roi: number;
  recommendation: string;
}

interface AppState {
  influencers: DBInfluencer[];
  campaigns: DBCampaign[];
  performance: DBPerformance[];
  loading: boolean;
  user: any;
}

interface AppContextType extends AppState {
  refreshData: () => Promise<void>;
  updateInfluencerStatus: (id: string, status: string) => Promise<void>;
  login: (email: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    influencers: [],
    campaigns: [],
    performance: [],
    loading: true,
    user: null,
  });

  const refreshData = async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const [infRes, campRes, perfRes] = await Promise.all([
        supabase.from("influencers").select("*").eq("is_deleted", false),
        supabase.from("campaigns").select("*").eq("is_deleted", false),
        supabase.from("campaign_performance").select("*")
      ]);

      setState(s => ({
        ...s,
        influencers: infRes.data || [],
        campaigns: campRes.data || [],
        performance: perfRes.data || [],
        loading: false
      }));
    } catch (err) {
      console.error("Error fetching data:", err);
      setState(s => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, user: session?.user || null }));
      if (session?.user) {
        refreshData();
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setState(s => ({ ...s, user: session?.user || null }));
      if (session?.user) refreshData();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const [loginError, setLoginError] = useState("");
  const [loginMsg, setLoginMsg] = useState("");

  const login = async (email: string, pass: string) => {
    setLoginError("");
    setLoginMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setLoginError(error.message + " - If you forgot your password, check your Supabase Auth dashboard or use a Magic Link.");
    }
  };

  const sendMagicLink = async (email: string) => {
    setLoginError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setLoginError(error.message);
    else setLoginMsg("Magic link sent! Check your email.");
  };

  const updateInfluencerStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("influencers").update({ status }).eq("influencer_id", id);
    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      await refreshData();
    }
  };

  return (
    <AppContext.Provider value={{ ...state, refreshData, updateInfluencerStatus, login }}>
      {state.loading ? (
        <div className="h-screen w-full flex items-center justify-center">Loading Data...</div>
      ) : !state.user ? (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-xl shadow-sm border max-w-sm w-full">
            <h2 className="text-xl font-bold mb-2">Supabase Login</h2>
            <p className="text-sm text-gray-500 mb-6">Your database has Row-Level Security enabled, so you must be authenticated to view or write data.</p>
            
            {loginError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded mb-4">{loginError}</div>}
            {loginMsg && <div className="p-3 bg-green-50 text-green-700 text-sm rounded mb-4">{loginMsg}</div>}

            <form onSubmit={(e) => {
              e.preventDefault();
              login(new FormData(e.currentTarget).get("email") as string, new FormData(e.currentTarget).get("password") as string);
            }} className="space-y-4">
              <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
              <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" />
              <button type="submit" className="w-full bg-[#10b981] text-white py-2 rounded font-medium">Sign In with Password</button>
            </form>

            <div className="mt-4 pt-4 border-t text-center">
              <button 
                onClick={() => sendMagicLink((document.querySelector('input[name="email"]') as HTMLInputElement)?.value)}
                className="text-sm text-[#10b981] hover:underline font-medium"
              >
                Send Magic Link instead
              </button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
}
