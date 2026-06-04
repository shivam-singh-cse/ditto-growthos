const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase/queries.ts', 'utf8');

code = '"use server";\n\n' + code;
code = code.replace('@/lib/supabase/client', '@/lib/supabase/server');
code = code.replace(/function db\(\) \{[\s\S]*?\}/, ''); 
code = code.replace(/const supabase = db\(\);/g, 'const supabase = await createClient();');
code = code.replace(/await db\(\)/g, 'await (await createClient())');
code = code.replace(/return db\(\)\.auth\.signOut\(\);/, 'const supabase = await createClient(); return supabase.auth.signOut();');

fs.writeFileSync('src/lib/supabase/queries.ts', code);
console.log('Refactored queries.ts successfully!');
