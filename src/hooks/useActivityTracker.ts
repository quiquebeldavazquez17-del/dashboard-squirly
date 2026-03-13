
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useActivityTracker() {
    useEffect(() => {
        const trackActivity = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const userId = session.user.id;
                    const lastTrackedKey = `last_activity_tracked_${userId}`;
                    const lastTracked = localStorage.getItem(lastTrackedKey);
                    const now = Date.now();

                    // Solo registramos actividad si ha pasado más de 12 horas desde el último pulso
                    // para no saturar la base de datos de registros innecesarios.
                    if (!lastTracked || now - parseInt(lastTracked) > 12 * 60 * 60 * 1000) {
                        const { error } = await supabase
                            .from('app_usage_logs')
                            .insert({ user_id: userId });

                        if (!error) {
                            localStorage.setItem(lastTrackedKey, now.toString());
                            console.log('Actividad de usuario registrada');
                        } else {
                            // Si la tabla no existe aún, fallará silenciosamente
                            console.warn('No se pudo registrar actividad (¿Existe la tabla app_usage_logs?)');
                        }
                    }
                }
            } catch (e) {
                console.error('Error in activity tracker:', e);
            }
        };

        trackActivity();

        // Opcional: Registrar actividad cuando el usuario vuelve a la pestaña
        window.addEventListener('focus', trackActivity);
        return () => window.removeEventListener('focus', trackActivity);
    }, []);
}
