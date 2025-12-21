import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AdminCard } from '@/components/admin/ui';
import { Users, Briefcase, Calendar, Megaphone } from 'lucide-react';

async function getDashboardStats() {
    const supabase = await createClient();

    const [
        { count: tripCount },
        { count: memberCount },
        { count: itineraryCount },
        { count: announcementCount },
    ] = await Promise.all([
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('itinerary_items').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
    ]);

    return {
        trips: tripCount || 0,
        members: memberCount || 0,
        itinerary: itineraryCount || 0,
        announcements: announcementCount || 0,
    };
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    return (
        <AdminCard className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[#78716c] mb-1">{label}</p>
                    <p className="text-3xl font-semibold text-[#292524]">{value}</p>
                </div>
                <div className={`p-3 rounded-[12px] ${color}`}>
                    {icon}
                </div>
            </div>
        </AdminCard>
    );
}

export default async function AdminDashboard() {
    const { authorized } = await requireAdmin();

    if (!authorized) {
        redirect('/admin/login');
    }

    const stats = await getDashboardStats();

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-semibold text-[#292524] mb-2">Welcome back</h2>
                <p className="text-[#78716c]">Here's what's happening with your groups</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Briefcase className="text-[#4A6741]" size={24} />}
                    label="Active Trips"
                    value={stats.trips}
                    color="bg-[#4A6741]/10"
                />
                <StatCard
                    icon={<Users className="text-[#C5A059]" size={24} />}
                    label="Total Members"
                    value={stats.members}
                    color="bg-[#C5A059]/10"
                />
                <StatCard
                    icon={<Calendar className="text-[#4A6741]" size={24} />}
                    label="Itinerary Items"
                    value={stats.itinerary}
                    color="bg-[#4A6741]/10"
                />
                <StatCard
                    icon={<Megaphone className="text-[#C5A059]" size={24} />}
                    label="Announcements"
                    value={stats.announcements}
                    color="bg-[#C5A059]/10"
                />
            </div>

            {/* Quick Actions */}
            <AdminCard className="p-6">
                <h3 className="text-lg font-semibold text-[#292524] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/trips"
                        className="p-4 bg-[#fdfbf7] rounded-[12px] hover:bg-[#f5f1e9] transition-all border border-[#e8dfc8]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Briefcase className="text-[#4A6741]" size={20} />
                            <h4 className="font-medium text-[#292524]">Create Trip</h4>
                        </div>
                        <p className="text-sm text-[#78716c]">Set up a new Umrah journey</p>
                    </a>

                    <a
                        href="/admin/itinerary"
                        className="p-4 bg-[#fdfbf7] rounded-[12px] hover:bg-[#f5f1e9] transition-all border border-[#e8dfc8]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="text-[#4A6741]" size={20} />
                            <h4 className="font-medium text-[#292524]">Add Itinerary</h4>
                        </div>
                        <p className="text-sm text-[#78716c]">Schedule activities and events</p>
                    </a>

                    <a
                        href="/admin/announcements"
                        className="p-4 bg-[#fdfbf7] rounded-[12px] hover:bg-[#f5f1e9] transition-all border border-[#e8dfc8]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Megaphone className="text-[#4A6741]" size={20} />
                            <h4 className="font-medium text-[#292524]">Send Announcement</h4>
                        </div>
                        <p className="text-sm text-[#78716c]">Notify your group members</p>
                    </a>
                </div>
            </AdminCard>

            {/* System Status */}
            <AdminCard className="p-6">
                <h3 className="text-lg font-semibold text-[#292524] mb-4">System Status</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[#78716c]">Database</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Connected
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#78716c]">Authentication</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Active
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#78716c]">Push Notifications</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Enabled
                        </span>
                    </div>
                </div>
            </AdminCard>
        </div>
    );
}
