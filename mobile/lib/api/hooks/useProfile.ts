/**
 * useProfile Hook
 * 
 * Manages user profile data with caching, loading states, and real-time updates
 */

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../supabase';
import { loadFromCache, saveToCache } from '../../utils';
import { ProfileRow } from '../../../types/db';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface ProfileData {
    // Auth data
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    // Profile table data
    country: string;
    city: string;
    dateOfBirth: string;
    medicalNotes: string;
    dietaryRestrictions: string;
    profileVisible: boolean;
}

interface UseProfileOptions {
    userId?: string;
    enableRealtime?: boolean;
    authUser?: User; // Accept auth user from context to avoid redundant API call
}

export function useProfile(options: UseProfileOptions = {}) {
    const { userId, enableRealtime = false, authUser } = options;
    
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = async (forceRefresh: boolean = false) => {
        try {
            if (!userId) {
                setLoading(false);
                return;
            }

            setError(null);

            // Try cache first if not forcing refresh
            if (!forceRefresh) {
                const cacheKey = `@ummrah_profile_${userId}`;
                const cached = await loadFromCache<ProfileData>(cacheKey, CACHE_DURATION, 'Profile');
                
                if (cached) {
                    setProfile(cached.data);
                    setLastUpdated(cached.timestamp);
                    setLoading(false);
                }
            }

            // Use provided authUser or fetch from API
            let user = authUser;
            
            if (!user) {
                const { data: { user: fetchedUser }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !fetchedUser) {
                    throw new Error('Failed to load user data');
                }
                
                user = fetchedUser;
            }

            const emailVerified = user.email_confirmed_at !== null;
            const userName = user.user_metadata?.full_name || '';
            const userEmail = user.email || '';
            const userPhone = user.user_metadata?.phone || '';

            // Load profile data from profiles table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error loading profile:', profileError);
            }

            const profileCountry = profileData?.country || '';
            const profileCity = profileData?.city || '';
            const profileDateOfBirth = profileData?.date_of_birth || '';
            const profileMedicalNotes = profileData?.medical_notes || '';
            const profileDietaryRestrictions = profileData?.dietary_restrictions || '';
            const profileVisible = profileData?.profile_visible ?? true;

            const fullProfile: ProfileData = {
                name: userName,
                email: userEmail,
                phone: userPhone,
                emailVerified,
                country: profileCountry,
                city: profileCity,
                dateOfBirth: profileDateOfBirth,
                medicalNotes: profileMedicalNotes,
                dietaryRestrictions: profileDietaryRestrictions,
                profileVisible,
            };

            setProfile(fullProfile);
            setLastUpdated(Date.now());

            // Save to cache
            const cacheKey = `@ummrah_profile_${userId}`;
            await saveToCache(cacheKey, fullProfile, 'Profile');

        } catch (err: any) {
            console.error('Error loading profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        await loadProfile(true);
    };

    const updateProfile = async (updates: Partial<ProfileData>) => {
        if (!userId) return { error: 'No user ID provided' };

        try {
            // Update auth data if needed
            const authUpdates: any = {};
            if (updates.name !== undefined) authUpdates.full_name = updates.name;
            if (updates.phone !== undefined) authUpdates.phone = updates.phone;

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabase.auth.updateUser({
                    data: authUpdates,
                });

                if (authError) {
                    return { error: authError.message };
                }
            }

            // Update email separately if changed
            if (updates.email !== undefined && updates.email !== profile?.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: updates.email,
                });

                if (emailError) {
                    return { error: emailError.message };
                }
            }

            // Update profile table data
            const profileUpdates: Partial<ProfileRow> = {
                user_id: userId,
                updated_at: new Date().toISOString(),
            };

            if (updates.country !== undefined) profileUpdates.country = updates.country || null;
            if (updates.city !== undefined) profileUpdates.city = updates.city || null;
            if (updates.dateOfBirth !== undefined) profileUpdates.date_of_birth = updates.dateOfBirth || null;
            if (updates.medicalNotes !== undefined) profileUpdates.medical_notes = updates.medicalNotes || null;
            if (updates.dietaryRestrictions !== undefined) profileUpdates.dietary_restrictions = updates.dietaryRestrictions || null;
            if (updates.profileVisible !== undefined) profileUpdates.profile_visible = updates.profileVisible;

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileUpdates, { onConflict: 'user_id' });

            if (profileError) {
                return { error: profileError.message };
            }

            // Reload profile data
            await loadProfile(true);

            return { error: null };
        } catch (err: any) {
            console.error('Error updating profile:', err);
            return { error: err.message || 'Failed to update profile' };
        }
    };

    useEffect(() => {
        if (userId) {
            loadProfile();
        }
    }, [userId]);

    // Setup realtime subscription if enabled
    useEffect(() => {
        if (!enableRealtime || !userId) return;

        const channel = supabase
            .channel(`profile_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    loadProfile(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, enableRealtime]);

    return {
        profile,
        loading,
        refreshing,
        lastUpdated,
        error,
        refresh,
        updateProfile,
    };
}
