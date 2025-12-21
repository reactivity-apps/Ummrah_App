'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, LoadingSpinner } from '@/components/admin/ui';
import { AnnouncementRow } from '@/types/db';
import { Plus, Send, Calendar, AlertCircle, Trash2, Edit2 } from 'lucide-react';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [trips, setTrips] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const supabase = createClient();

        // Load user's trips
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
                    loadAnnouncements(tripsData[0].id);
                }
            }
        }

        setLoading(false);
    };

    const loadAnnouncements = async (tripId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAnnouncements(data as AnnouncementRow[]);
        }
    };

    const handleTripChange = (tripId: string) => {
        setSelectedTripId(tripId);
        loadAnnouncements(tripId);
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
                    <div className="text-[#C5A059] text-5xl mb-4">📢</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No trips available</h3>
                    <p className="text-[#78716c]">Create a trip first to send announcements</p>
                </AdminCard>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-[#292524]">Announcements</h2>
                    <p className="text-[#78716c] mt-1">Communicate with your group</p>
                </div>
                <AdminButton onClick={() => setShowCreateModal(true)} className="whitespace-nowrap flex items-center gap-2 text-sm">
                    <Plus size={18} />
                    <span>Create Announcement</span>
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

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">📢</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No announcements yet</h3>
                    <p className="text-[#78716c] mb-6">Create your first announcement to notify your group</p>
                    <AdminButton onClick={() => setShowCreateModal(true)} className="whitespace-nowrap inline-flex items-center gap-2 text-sm">
                        <Plus size={18} />
                        <span>Create Your First Announcement</span>
                    </AdminButton>
                </AdminCard>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <AdminCard key={announcement.id} className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-[#292524]">{announcement.title}</h3>
                                        {announcement.is_high_priority && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[#78716c] mb-3">{announcement.body}</p>
                                    {announcement.link_url && (
                                        <a
                                            href={announcement.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#4A6741] text-sm hover:underline"
                                        >
                                            View Link →
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[#e8dfc8]">
                                <div className="flex items-center gap-4 text-sm text-[#78716c]">
                                    {announcement.sent_at ? (
                                        <span className="flex items-center gap-1">
                                            <Send size={14} />
                                            Sent {new Date(announcement.sent_at).toLocaleString()}
                                        </span>
                                    ) : announcement.scheduled_for ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            Scheduled for {new Date(announcement.scheduled_for).toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                        </AdminCard>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateAnnouncementModal
                    tripId={selectedTripId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadAnnouncements(selectedTripId);
                    }}
                />
            )}
        </div>
    );
}

interface CreateAnnouncementModalProps {
    tripId: string;
    onClose: () => void;
    onSuccess: () => void;
}

function CreateAnnouncementModal({ tripId, onClose, onSuccess }: CreateAnnouncementModalProps) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [sendNow, setSendNow] = useState(true);
    const [scheduledFor, setScheduledFor] = useState('');
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

        const { error } = await supabase.from('announcements').insert({
            trip_id: tripId,
            title,
            body,
            link_url: linkUrl || null,
            is_high_priority: isHighPriority,
            scheduled_for: sendNow ? null : (scheduledFor || null),
            sent_at: sendNow ? new Date().toISOString() : null,
            created_by: user.id,
        });

        setLoading(false);

        if (error) {
            alert('Error creating announcement: ' + error.message);
            return;
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-[16px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[#e8dfc8]">
                    <h3 className="text-xl font-semibold text-[#292524]">Create Announcement</h3>
                    <p className="text-sm text-[#78716c] mt-1">Send a message to all trip members</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <AdminInput
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        placeholder="Important update about tomorrow's schedule"
                        required
                    />

                    <AdminTextarea
                        label="Message"
                        value={body}
                        onChange={setBody}
                        placeholder="Write your announcement message here..."
                        rows={5}
                        required
                    />

                    <AdminInput
                        label="Link URL (optional)"
                        value={linkUrl}
                        onChange={setLinkUrl}
                        placeholder="https://example.com/details"
                    />

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="highPriority"
                            checked={isHighPriority}
                            onChange={(e) => setIsHighPriority(e.target.checked)}
                            className="w-4 h-4 text-[#4A6741] border-[#e8dfc8] rounded focus:ring-[#4A6741]"
                        />
                        <label htmlFor="highPriority" className="text-sm text-[#292524]">
                            Mark as high priority
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="sendNow"
                                checked={sendNow}
                                onChange={() => setSendNow(true)}
                                className="w-4 h-4 text-[#4A6741] border-[#e8dfc8] focus:ring-[#4A6741]"
                            />
                            <label htmlFor="sendNow" className="text-sm text-[#292524]">
                                Send immediately
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="schedule"
                                checked={!sendNow}
                                onChange={() => setSendNow(false)}
                                className="w-4 h-4 text-[#4A6741] border-[#e8dfc8] focus:ring-[#4A6741]"
                            />
                            <label htmlFor="schedule" className="text-sm text-[#292524]">
                                Schedule for later
                            </label>
                        </div>
                        {!sendNow && (
                            <AdminInput
                                type="datetime-local"
                                label="Schedule Date & Time"
                                value={scheduledFor}
                                onChange={setScheduledFor}
                                required={!sendNow}
                                className="ml-7"
                            />
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-[#e8dfc8]">
                        <AdminButton type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </AdminButton>
                        <AdminButton type="submit" disabled={loading}>
                            {loading ? 'Sending...' : sendNow ? 'Send Now' : 'Schedule'}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </div>
    );
}