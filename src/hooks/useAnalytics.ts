import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Helper to get or create a persistent session ID
const getSessionId = () => {
    let sessionId = localStorage.getItem('site_session_id');
    if (!sessionId) {
        // Fallback for crypto.randomUUID() which requires HTTPS and modern browsers
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            sessionId = crypto.randomUUID();
        } else {
            sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        localStorage.setItem('site_session_id', sessionId);
    }
    return sessionId;
};

export const useAnalytics = () => {
    const location = useLocation();
    const { user } = useAuth();
    const sessionId = getSessionId();

    const trackEvent = async (eventType: 'page_view' | 'click', elementId?: string) => {
        try {
            await supabase.from('site_analytics').insert([{
                event_type: eventType,
                page_path: window.location.pathname,
                session_id: sessionId,
                user_id: user?.id || null,
                element_id: elementId || null
            }]);
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    };

    // Track page views automatically on route change
    useEffect(() => {
        trackEvent('page_view');
    }, [location.pathname]);

    return { trackEvent };
};

// Global click tracker helper
export const trackClick = async (elementId: string) => {
    const sessionId = localStorage.getItem('site_session_id') || 'unknown';
    try {
        await supabase.from('site_analytics').insert([{
            event_type: 'click',
            page_path: window.location.pathname,
            session_id: sessionId,
            element_id: elementId
        }]);
    } catch (error) {
        console.error('Click tracking failed:', error);
    }
};
