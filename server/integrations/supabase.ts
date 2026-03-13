import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function getSupabaseMetrics(start?: string, end?: string) {
    try {
        // 1. Get Total Users from auth.users (Static view)
        const { data: viewData, error: viewError } = await supabase
            .from('v_app_analytics')
            .select('total_users')
            .single();

        if (viewError) throw viewError;

        // 2. Calculate "Active Users" in the selected period (Recurring Users definition)
        let recurringUsers = 0;
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const activeUserIds = new Set<string>();

            // A. Get unique users from our new activity logs
            const { data: usageData } = await supabase
                .from('app_usage_logs')
                .select('user_id')
                .gte('used_at', startDate.toISOString())
                .lte('used_at', endDate.toISOString());

            if (usageData) {
                usageData.forEach(log => activeUserIds.add(log.user_id));
            }

            // B. Get users who signed in during this period (Fallback/Historical)
            const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
                perPage: 1000,
            });

            if (!userError && userData.users) {
                userData.users.forEach(u => {
                    if (u.last_sign_in_at) {
                        const loginDate = new Date(u.last_sign_in_at);
                        if (loginDate >= startDate && loginDate <= endDate) {
                            activeUserIds.add(u.id);
                        }
                    }
                });
            }

            recurringUsers = activeUserIds.size;
        }


        return {
            totalUsers: viewData.total_users || 0,
            recurringUsers: recurringUsers,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error fetching Supabase metrics:", error);
        return {
            totalUsers: 0,
            recurringUsers: 0,
            error: "Failed to fetch metrics"
        };
    }
}
