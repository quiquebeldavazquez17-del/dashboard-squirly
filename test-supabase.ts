import { getSupabaseMetrics } from './server/integrations/supabase.ts';

async function run() {
  console.log("Testing getSupabaseMetrics...");
  const metrics = await getSupabaseMetrics();
  console.log("Result:", metrics);
}

run();
