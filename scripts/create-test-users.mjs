import { createClient } from "@supabase/supabase-js";

// Make sure these match the `.env.local`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gafmpbodqnhxdsuxzjjk.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_fBoqm_D_uXJ0BQMQDfGUKQ_1boJPgFd";

const supabase = createClient(supabaseUrl, supabaseKey);

const usersToCreate = [
  {
    email: "founder@dittogrowthos.com",
    password: "password123",
    name: "Founder User",
    role: "founder",
  },
  {
    email: "vp@dittogrowthos.com",
    password: "password123",
    name: "VP Marketing",
    role: "vp_marketing",
  },
  {
    email: "manager@dittogrowthos.com",
    password: "password123",
    name: "Influencer Manager",
    role: "influencer_manager",
  },
];

async function createTestUsers() {
  console.log("Creating test users...");

  for (const user of usersToCreate) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name,
          role: user.role,
        },
      },
    });

    if (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`✅ Created ${user.email} (Role: ${user.role}, ID: ${data.user?.id})`);
    }
  }

  console.log("Done.");
}

createTestUsers();
