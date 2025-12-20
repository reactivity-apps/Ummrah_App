'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, LoadingSpinner } from '@/components/admin/ui';
import { TripRow } from '@/types/db';
import { Plus, Calendar, Users, MapPin } from 'lucide-react';

export default function TripsPage() {
    const router = useRouter();
    const [trips, setTrips] = useState<TripRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTrips(data as TripRow[]);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-[#292524]">Trips</h2>
                    <p className="text-[#78716c] mt-1">Manage your Umrah group journeys</p>
                </div>
                <AdminButton onClick={() => setShowCreateModal(true)} className="whitespace-nowrap flex items-center gap-2 text-sm">
                    <Plus size={18} />
                    <span>Create Trip</span>
                </AdminButton>
            </div>

            {/* Trips Grid */}
            {trips.length === 0 ? (
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">☪</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No trips yet</h3>
                    <p className="text-[#78716c] mb-6">Create your first Umrah journey to get started</p>
                    <AdminButton onClick={() => setShowCreateModal(true)} className="whitespace-nowrap inline-flex items-center gap-2 text-sm">
                        <Plus size={18} />
                        <span>Create Your First Trip</span>
                    </AdminButton>
                </AdminCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <AdminCard
                            key={trip.id}
                            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/admin/itinerary?trip=${trip.id}`)}
                        >
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#292524] mb-1">{trip.name}</h3>
                                    {trip.description && (
                                        <p className="text-sm text-[#78716c] line-clamp-2">{trip.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {trip.start_date && (
                                        <div className="flex items-center gap-2 text-sm text-[#78716c]">
                                            <Calendar size={16} />
                                            <span>
                                                {new Date(trip.start_date).toLocaleDateString()} - {' '}
                                                {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-[#78716c]">
                                        <Users size={16} />
                                        <span>{trip.group_size} travelers</span>
                                    </div>

                                    {trip.cities && trip.cities.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-[#78716c]">
                                            <MapPin size={16} />
                                            <span>{trip.cities.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${trip.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {trip.status}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${trip.visibility === 'published'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {trip.visibility}
                                    </span>
                                </div>
                            </div>
                        </AdminCard>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateTripModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadTrips();
                    }}
                />
            )}
        </div>
    );
}

interface CreateTripModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function CreateTripModal({ onClose, onSuccess }: CreateTripModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [groupSize, setGroupSize] = useState('');
    const [cities, setCities] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('You must be logged in');
            setLoading(false);
            return;
        }

        // Get user's group
        const { data: groupMemberships } = await supabase
            .from('group_memberships')
            .select('group_id')
            .eq('user_id', user.id)
            .limit(1);

        if (!groupMemberships || groupMemberships.length === 0) {
            alert('You must be part of a group to create trips');
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('trips').insert({
            group_id: groupMemberships[0].group_id,
            name,
            description: description || null,
            start_date: startDate || null,
            end_date: endDate || null,
            group_size: parseInt(groupSize) || 0,
            cities: cities ? cities.split(',').map((c) => c.trim()) : [],
            visibility: 'draft',
            status: 'active',
        });

        setLoading(false);

        if (error) {
            alert('Error creating trip: ' + error.message);
            return;
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[16px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[#e8dfc8]">
                    <h3 className="text-xl font-semibold text-[#292524]">Create New Trip</h3>
                    <p className="text-sm text-[#78716c] mt-1">Set up a new Umrah journey for your group</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <AdminInput
                        label="Trip Name"
                        value={name}
                        onChange={setName}
                        placeholder="Umrah 2025"
                        required
                    />

                    <AdminTextarea
                        label="Description"
                        value={description}
                        onChange={setDescription}
                        placeholder="Brief description of the trip..."
                        rows={3}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <AdminInput
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </div>

                    <AdminInput
                        type="number"
                        label="Group Size"
                        value={groupSize}
                        onChange={setGroupSize}
                        placeholder="30"
                        required
                    />

                    <AdminInput
                        label="Cities"
                        value={cities}
                        onChange={setCities}
                        placeholder="Makkah, Madinah"
                    />

                    <div className="flex gap-3 justify-end pt-4 border-t border-[#e8dfc8]">
                        <AdminButton type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </AdminButton>
                        <AdminButton type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Trip'}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
