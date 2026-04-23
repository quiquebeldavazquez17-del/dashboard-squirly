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

import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function getSupabaseMetrics(start?: string, end?: string) {
    try {
        // 1. Get Total Users from auth.users (Static view)
        const { data: viewData, error: viewError } = await supabase
            .from('v_app_analytics')
            .select('total_users')
            .single();

        if (viewError) throw viewError;

        const endDate = end ? new Date(end) : new Date();
        const startDate = start ? new Date(start) : subDays(endDate, 6);
        
        // Intervals
        const dauStart = startOfDay(endDate);
        const dauEnd = endOfDay(endDate);
        
        const wauStart = startOfDay(startDate);
        const wauEnd = endOfDay(endDate);
        
        const mauStart = startOfDay(subDays(endDate, 29));
        const mauEnd = endOfDay(endDate);

        const dauUserIds = new Set<string>();
        const wauUserIds = new Set<string>();
        const mauUserIds = new Set<string>();

        // Get all activity logs for the maximum interval (MAU)
        const { data: usageData } = await supabase
            .from('app_usage_logs')
            .select('user_id, used_at')
            .gte('used_at', mauStart.toISOString())
            .lte('used_at', mauEnd.toISOString());

        if (usageData) {
            usageData.forEach(log => {
                const usedAt = new Date(log.used_at);
                
                // DAU
                if (usedAt >= dauStart && usedAt <= dauEnd) {
                    dauUserIds.add(log.user_id);
                }
                
                // WAU (Current Period)
                if (usedAt >= wauStart && usedAt <= wauEnd) {
                    wauUserIds.add(log.user_id);
                }
                
                // MAU (Last 30 days)
                if (usedAt >= mauStart && usedAt <= mauEnd) {
                    mauUserIds.add(log.user_id);
                }
            });
        }

        // Fallback to auth users last_sign_in_at
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
            perPage: 1000,
        });

        if (!userError && userData.users) {
            userData.users.forEach(u => {
                if (u.last_sign_in_at) {
                    const loginDate = new Date(u.last_sign_in_at);
                    
                    if (loginDate >= dauStart && loginDate <= dauEnd) {
                        dauUserIds.add(u.id);
                    }
                    if (loginDate >= wauStart && loginDate <= wauEnd) {
                        wauUserIds.add(u.id);
                    }
                    if (loginDate >= mauStart && loginDate <= mauEnd) {
                        mauUserIds.add(u.id);
                    }
                }
            });
        }

        return {
            totalUsers: viewData.total_users || 0,
            dau: dauUserIds.size,
            wau: wauUserIds.size,
            mau: mauUserIds.size,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error fetching Supabase metrics:", error);
        return {
            totalUsers: 0,
            dau: 0,
            wau: 0,
            mau: 0,
            error: "Failed to fetch metrics"
        };
    }
}
