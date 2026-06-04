const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://gafmpbodqnhxdsuxzjjk.supabase.co";
const supabaseKey = "sb_publishable_fBoqm_D_uXJ0BQMQDfGUKQ_1boJPgFd";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching influencers...");
  const { data: infs, error: infErr } = await supabase.from("influencers").select("influencer_id, name, is_deleted");
  if (infErr) {
    console.error("Error:", infErr);
    return;
  }
  
  console.log(`Total influencers: ${infs.length}`);
  
  const grouped = {};
  for (const inf of infs) {
    grouped[inf.name] = (grouped[inf.name] || 0) + 1;
  }
  
  console.log("Counts per name:", Object.entries(grouped).slice(0, 5));
  
  const notDeleted = infs.filter(i => !i.is_deleted);
  console.log(`Not deleted influencers: ${notDeleted.length}`);
}

main();
