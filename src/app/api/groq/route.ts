import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    let prompt = "";

    if (data.granularData) {
      prompt = `You are a VP of Marketing analyzing influencer data for Ditto Insurance.
      Analyze the following granular performance data (Influencer + Content Type + Product Type).
      
      Data:
      ${JSON.stringify(data.granularData, null, 2)}

      Your task is to identify specific granular combinations to SCALE and CUT.
      Return ONLY a JSON object with this exact structure:
      {
        "scale": [ { "influencer": "Name", "product": "Product", "content_type": "Format", "reason": "Brief reason with metrics" } ],
        "cut": [ { "influencer": "Name", "product": "Product", "content_type": "Format", "reason": "Brief reason with metrics" } ],
        "action_steps": [ "Action 1", "Action 2" ]
      }`;
    } else {
      prompt = `You are a VP of Marketing analyzing influencer data for Ditto Insurance. 
      Here is the weekly aggregate data: 
      - Influencers Sourced: ${data.influencers}
      - Active Pipeline: ${data.activeInfluencers}
      - Total Spent: ₹${data.totalCost}
      - Total Conversions: ${data.totalConversions}
      - CPA (Cost Per Acquisition): ₹${data.cpa}

      Return ONLY a JSON object with this exact structure:
      {
        "biggest_wins": ["Win 1", "Win 2"],
        "biggest_risks": ["Risk 1", "Risk 2"],
        "decisions_required": ["Decision 1"]
      }`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    return NextResponse.json({ summary: chatCompletion.choices[0]?.message?.content || "{}" });
  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
