
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function getTables() {
    const { data, error } = await supabase.rpc('get_tables'); // Custom RPC? Unlikely.
    if (error) {
        // Try querying postgres direct if possible via RPC? No.
        // Let's try to query information_schema.tables via a generic select?
        // Supabase PostgREST doesn't allow querying information_schema by default.

        // Let's check common activity tables
        const potentialTables = ['logs', 'events', 'activities', 'sessions', 'audit_log', 'user_activity'];
        for (const t of potentialTables) {
            const { data: d, error: e } = await supabase.from(t).select('id').limit(1);
            if (!e) console.log(`Table found: ${t}`);
        }
    } else {
        console.log('Tables:', data);
    }
}
getTables();
