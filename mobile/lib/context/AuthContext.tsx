/**
 * Auth Context
 * 
 * Centralized authentication state management.
 * Provides user data, session tracking, and authentication status.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { User, Session } from '@supabase/supabase-js';
import { clearUserCache } from '../api/utils/authCache';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    loading: boolean;
    userName: string;
    userEmail: string;
    lastAuthEvent: string | null;
    shouldReloadData: boolean;
    updateUserProfile: (updates: any) => Promise<{ error: any }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);
    const [shouldReloadData, setShouldReloadData] = useState(false);

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                
                setSession(currentSession);
                setUser(currentSession?.user || null);
                setLastAuthEvent('INITIAL_SESSION');
                setShouldReloadData(false);
            } catch (error) {
                console.error('[AuthContext] Error initializing auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('[AuthContext] Auth event:', event);
            setLastAuthEvent(event);
            
            setSession(newSession);
            setUser(newSession?.user || null);
            
            // Clear auth cache on any auth state change
            clearUserCache();

            // Determine if this event should trigger data reloads in dependent contexts
            const reloadEvents = ['SIGNED_IN'];
            
            if (reloadEvents.includes(event)) {
                setShouldReloadData(true);
                // Reset flag after a brief moment
                setTimeout(() => setShouldReloadData(false), 100);
            } else {
                setShouldReloadData(false);
            }

            // Update loading state for significant auth changes
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                setLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Safe wrapper for profile updates that won't cause reloads
    const updateUserProfile = async (updates: any) => {
        try {
            const { error } = await supabase.auth.updateUser(updates);
            // The USER_UPDATED event will fire, but shouldReloadData will be false
            return { error };
        } catch (error) {
            return { error };
        }
    };

    // Manual refresh of user metadata
    const refreshUser = async () => {
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        setUser(freshUser);
    };

    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'User';
    const userEmail = user?.email || '';
    const isAuthenticated = !!session && !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isAuthenticated,
                loading,
                userName,
                userEmail,
                lastAuthEvent,
                shouldReloadData,
                updateUserProfile,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
