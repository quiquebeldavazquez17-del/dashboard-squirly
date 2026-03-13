
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    try {
        // Try to list tables via an RPC if common extensions are installed
        // Or just try common names
        console.log('Querying auth.users via admin API...');
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error listing users:', authError.message);
        } else {
            console.log('Total users in auth.users:', users.length);
            if (users.length > 0) {
                console.log('Sample user metadata:', users[0].user_metadata);
            }
        }

        console.log('Querying public tables...');
        const tables = ['profiles', 'users', 'user_logins', 'activity', 'logs'];
        for (const table of tables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`Table "${table}" error or not found:`, error.message);
            } else {
                console.log(`Table "${table}" exists. Count:`, count);
            }
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

inspect();
