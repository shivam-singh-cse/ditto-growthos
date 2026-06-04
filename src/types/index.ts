export type InfluencerStatus = "Sourced" | "Contacted" | "Replied" | "Negotiation" | "Approved" | "Scheduled" | "Live" | "Completed" | "Rejected" | "Lost";
export type Product = "Health" | "Term" | "Both";
export type CampaignStatus = "Planned" | "Scheduled" | "Live" | "Completed";
export type AttributionConfidence = "High" | "Medium" | "Low";
export type CommunicationType = "Email" | "Call" | "WhatsApp" | "Meeting" | "DM" | "Notes";

export interface Influencer {
  id: string;
  name: string;
  instagram_handle: string;
  email: string;
  phone: string;
  category: string;
  followers: number;
  location: string;
  assigned_manager: string;
  status: InfluencerStatus;
  created_at: string;
}

export interface Activation {
  id: string;
  influencer_id: string;
  product: Product;
  campaign_name: string;
  campaign_code: string;
  utm_source: string;
  utm_campaign: string;
  activation_date: string;
  content_type: string;
  cost: number;
  expected_leads: number;
  expected_conversions: number;
  status: CampaignStatus;
}

export interface Lead {
  id: string;
  activation_id: string;
  source_type: "WhatsApp" | "Call" | "Form" | "DM";
  campaign_code: string;
  attribution_confidence: AttributionConfidence;
  is_conversion: boolean;
  date: string;
}

export interface Communication {
  id: string;
  influencer_id: string;
  date: string;
  type: CommunicationType;
  notes: string;
  next_follow_up_date: string | null;
}
