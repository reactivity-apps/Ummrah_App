'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, LoadingSpinner } from '@/components/admin/ui';
import { ItineraryItemRow } from '@/types/db';
import { Plus, Calendar, Clock, MapPin, Edit2, Trash2 } from 'lucide-react';

export default function ItineraryPage() {
    const searchParams = useSearchParams();
    const tripParam = searchParams.get('trip');

    const [items, setItems] = useState<ItineraryItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryItemRow | null>(null);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [trips, setTrips] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (tripParam && trips.length > 0) {
            setSelectedTripId(tripParam);
            loadItinerary(tripParam);
        }
    }, [tripParam, trips]);

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
                    loadItinerary(tripsData[0].id);
                }
            }
        }

        setLoading(false);
    };

    const loadItinerary = async (tripId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('itinerary_items')
            .select('*')
            .eq('trip_id', tripId)
            .order('day_date', { ascending: true })
            .order('starts_at', { ascending: true });

        if (!error && data) {
            setItems(data as ItineraryItemRow[]);
        }
    };

    const handleTripChange = (tripId: string) => {
        setSelectedTripId(tripId);
        loadItinerary(tripId);
    };

    const handleEdit = (item: ItineraryItemRow) => {
        setEditingItem(item);
        setShowCreateModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('itinerary_items')
            .delete()
            .eq('id', id);

        if (!error) {
            loadItinerary(selectedTripId);
        }
    };

    // Group items by day
    const groupedItems = items.reduce((acc, item) => {
        const day = item.day_date || 'No Date';
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {} as Record<string, ItineraryItemRow[]>);

    const sortedDays = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return a.localeCompare(b);
    });

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
                    <div className="text-[#C5A059] text-5xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No trips available</h3>
                    <p className="text-[#78716c]">Create a trip first to manage itinerary</p>
                </AdminCard>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-[#292524]">Itinerary</h2>
                    <p className="text-[#78716c] mt-1">Manage day-by-day schedules and activities</p>
                </div>
                <AdminButton onClick={() => { setEditingItem(null); setShowCreateModal(true); }} className="whitespace-nowrap flex items-center gap-2 text-sm">
                    <Plus size={18} />
                    <span>Add Activity</span>
                </AdminButton>
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

            {/* Itinerary Items */}
            {items.length === 0 ? (
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No activities yet</h3>
                    <p className="text-[#78716c] mb-6">Add your first itinerary item to get started</p>
                    <AdminButton onClick={() => { setEditingItem(null); setShowCreateModal(true); }} className="whitespace-nowrap inline-flex items-center gap-2 text-sm">
                        <Plus size={18} />
                        <span>Add Your First Activity</span>
                    </AdminButton>
                </AdminCard>
            ) : (
                <div className="space-y-6">
                    {sortedDays.map((day) => (
                        <div key={day}>
                            <h3 className="text-lg font-semibold text-[#292524] mb-3 flex items-center gap-2">
                                <Calendar size={20} className="text-[#C5A059]" />
                                {day === 'No Date' ? 'Unscheduled' : new Date(day).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="space-y-3">
                                {groupedItems[day].map((item) => (
                                    <AdminCard key={item.id} className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-[#292524] mb-2">{item.title}</h4>
                                                {item.description && (
                                                    <p className="text-[#78716c] mb-3">{item.description}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-[#78716c]">
                                                    {item.starts_at && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {new Date(item.starts_at).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}
                                                            {item.ends_at && ` - ${new Date(item.ends_at).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}`}
                                                        </span>
                                                    )}
                                                    {item.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            {item.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-[#4A6741] hover:bg-[#4A6741]/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </AdminCard>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <ItineraryModal
                    tripId={selectedTripId}
                    item={editingItem}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setEditingItem(null);
                        loadItinerary(selectedTripId);
                    }}
                />
            )}
        </div>
    );
}

interface ItineraryModalProps {
    tripId: string;
    item: ItineraryItemRow | null;
    onClose: () => void;
    onSuccess: () => void;
}

function ItineraryModal({ tripId, item, onClose, onSuccess }: ItineraryModalProps) {
    const [title, setTitle] = useState(item?.title || '');
    const [description, setDescription] = useState(item?.description || '');
    const [location, setLocation] = useState(item?.location || '');
    const [dayDate, setDayDate] = useState(item?.day_date || '');
    const [startsAt, setStartsAt] = useState(item?.starts_at ? new Date(item.starts_at).toISOString().slice(0, 16) : '');
    const [endsAt, setEndsAt] = useState(item?.ends_at ? new Date(item.ends_at).toISOString().slice(0, 16) : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();

        const data = {
            trip_id: tripId,
            title,
            description: description || null,
            location: location || null,
            day_date: dayDate || null,
            starts_at: startsAt ? new Date(startsAt).toISOString() : null,
            ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        };

        const { error } = item?.id
            ? await supabase.from('itinerary_items').update(data).eq('id', item.id)
            : await supabase.from('itinerary_items').insert(data);

        setLoading(false);

        if (error) {
            alert('Error saving item: ' + error.message);
            return;
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[16px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[#e8dfc8]">
                    <h3 className="text-xl font-semibold text-[#292524]">
                        {item ? 'Edit Activity' : 'Add Activity'}
                    </h3>
                    <p className="text-sm text-[#78716c] mt-1">Create an itinerary item for your trip</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <AdminInput
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        placeholder="Morning prayer at Masjid al-Haram"
                        required
                    />

                    <AdminTextarea
                        label="Description"
                        value={description}
                        onChange={setDescription}
                        placeholder="Additional details about this activity..."
                        rows={3}
                    />

                    <AdminInput
                        label="Location"
                        value={location}
                        onChange={setLocation}
                        placeholder="Masjid al-Haram, Makkah"
                    />

                    <AdminInput
                        type="date"
                        label="Date"
                        value={dayDate}
                        onChange={setDayDate}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput
                            type="datetime-local"
                            label="Start Time"
                            value={startsAt}
                            onChange={setStartsAt}
                        />
                        <AdminInput
                            type="datetime-local"
                            label="End Time"
                            value={endsAt}
                            onChange={setEndsAt}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-[#e8dfc8]">
                        <AdminButton type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </AdminButton>
                        <AdminButton type="submit" disabled={loading}>
                            {loading ? 'Saving...' : item ? 'Update' : 'Create'}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </div>
    );
}