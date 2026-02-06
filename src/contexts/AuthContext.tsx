import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch warning:', error.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            setLoading(true);
            await fetchProfile(user.id);
        }
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
