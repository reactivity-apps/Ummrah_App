'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, LoadingSpinner } from '@/components/admin/ui';
import { Users, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface TripMember {
    user_id: string;
    joined_at: string;
    profile: {
        email: string | null;
        phone: string | null;
        city: string | null;
        country: string | null;
        date_of_birth: string | null;
    };
}

export default function MembersPage() {
    const [members, setMembers] = useState<TripMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [trips, setTrips] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: groupMemberships } = await supabase
            .from('group_memberships')
            .select('group_id')
            .eq('user_id', user.id);

        if (groupMemberships && groupMemberships.length > 0) {
            const { data: tripsData } = await supabase
                .from('trips')
                .select('id, name')
                .eq('group_id', groupMemberships[0].group_id);

            if (tripsData) {
                setTrips(tripsData);
                if (tripsData.length > 0) {
                    setSelectedTripId(tripsData[0].id);
                    loadMembers(tripsData[0].id);
                }
            }
        }

        setLoading(false);
    };

    const loadMembers = async (tripId: string) => {
        const supabase = createClient();

        // First get trip to find group_id
        const { data: trip } = await supabase
            .from('trips')
            .select('group_id')
            .eq('id', tripId)
            .single();

        if (!trip) return;

        // Get all trip memberships
        const { data: memberships, error } = await supabase
            .from('trip_memberships')
            .select('id, user_id, joined_at')
            .eq('trip_id', tripId)
            .is('left_at', null)
            .order('joined_at', { ascending: false });

        if (error || !memberships || memberships.length === 0) {
            setMembers([]);
            return;
        }

        // Get user IDs
        const userIds = memberships.map(m => m.user_id);

        // Fetch profiles for these users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, phone, city, country, date_of_birth')
            .in('id', userIds);

        if (!profiles) {
            setMembers([]);
            return;
        }

        // Create a map of user_id to profile
        const profileMap = new Map(profiles.map(p => [p.id, p]));

        // Transform the data
        const transformedMembers = memberships
            .map(membership => {
                const profile = profileMap.get(membership.user_id);
                if (!profile) return null;

                return {
                    user_id: membership.user_id,
                    joined_at: membership.joined_at,
                    profile: {
                        email: profile.email,
                        phone: profile.phone,
                        city: profile.city,
                        country: profile.country,
                        date_of_birth: profile.date_of_birth,
                    }
                };
            })
            .filter(m => m !== null) as TripMember[];

        setMembers(transformedMembers);
    };

    const handleTripChange = (tripId: string) => {
        setSelectedTripId(tripId);
        loadMembers(tripId);
    };

    const getDisplayName = (member: TripMember) => {
        if (member.profile.email) {
            return member.profile.email.split('@')[0];
        }
        return 'Member';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="max-w-7xl mx-auto">
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No trips available</h3>
                    <p className="text-[#78716c]">Create a trip first to view members</p>
                </AdminCard>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-[#292524]">Trip Members</h2>
                    <p className="text-[#78716c] mt-1">View and manage participants</p>
                </div>
                <div className="px-4 py-2 bg-[#4A6741]/10 rounded-lg">
                    <span className="text-[#4A6741] font-semibold">{members.length} Members</span>
                </div>
            </div>

            {/* Trip Selector */}
            {trips.length > 1 && (
                <AdminCard className="p-4">
                    <label className="block text-sm font-medium text-[#292524] mb-2">Select Trip</label>
                    <select
                        value={selectedTripId}
                        onChange={(e) => handleTripChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#e8dfc8] rounded-[12px] text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#4A6741]"
                    >
                        {trips.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                                {trip.name}
                            </option>
                        ))}
                    </select>
                </AdminCard>
            )}

            {/* Members List */}
            {members.length === 0 ? (
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No members yet</h3>
                    <p className="text-[#78716c]">Share your trip join code to invite members</p>
                </AdminCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                        <AdminCard key={member.user_id} className="p-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#4A6741] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {getDisplayName(member)[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[#292524] truncate">
                                            {getDisplayName(member)}
                                        </h3>
                                        <p className="text-xs text-[#78716c]">
                                            Joined {new Date(member.joined_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {member.profile.email && (
                                        <div className="flex items-center gap-2 text-[#78716c]">
                                            <Mail size={14} />
                                            <span className="truncate">{member.profile.email}</span>
                                        </div>
                                    )}
                                    {member.profile.phone && (
                                        <div className="flex items-center gap-2 text-[#78716c]">
                                            <Phone size={14} />
                                            <span>{member.profile.phone}</span>
                                        </div>
                                    )}
                                    {(member.profile.city || member.profile.country) && (
                                        <div className="flex items-center gap-2 text-[#78716c]">
                                            <MapPin size={14} />
                                            <span>
                                                {[member.profile.city, member.profile.country].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {member.profile.date_of_birth && (
                                        <div className="flex items-center gap-2 text-[#78716c]">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(member.profile.date_of_birth).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AdminCard>
                    ))}
                </div>
            )}
        </div>
    );
}