'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, LoadingSpinner } from '@/components/admin/ui';
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, Lock, Trash2, ChevronRight, Crown, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileData {
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    date_of_birth: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Get profile data
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData) {
            setProfile(profileData);
            setUserName(profileData.email?.split('@')[0] || 'User');
        }

        // Check if admin
        const { data: adminData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (adminData?.role === 'super_admin') {
            setIsAdmin(true);
        } else {
            const { data: memberships } = await supabase
                .from('group_memberships')
                .select('role')
                .eq('user_id', user.id);

            if (memberships && memberships.length > 0) {
                setIsAdmin(true);
            }
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <AdminCard className="p-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-[#4A6741] rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                        {userName[0]?.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-[#292524]">{userName}</h2>
                    {isAdmin && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full">
                            <Crown size={14} className="text-amber-700" />
                            <span className="text-amber-700 text-sm font-semibold">Admin</span>
                        </div>
                    )}
                    {profile?.email && (
                        <p className="text-[#78716c] mt-2">{profile.email}</p>
                    )}
                </div>
            </AdminCard>

            {/* Account Section */}
            <div>
                <h3 className="text-sm font-bold text-[#78716c] mb-3 uppercase tracking-wider px-2">Account</h3>
                <AdminCard className="divide-y divide-[#e8dfc8]">
                    <ProfileMenuItem
                        icon={<User size={18} />}
                        title="Edit Personal Information"
                        subtitle="Update your details"
                        onClick={() => router.push('/admin/settings/personal-info')}
                    />
                    <ProfileMenuItem
                        icon={<Phone size={18} />}
                        title="Edit Emergency Contact"
                        subtitle="Add emergency contact"
                        onClick={() => router.push('/admin/settings/emergency-contact')}
                    />
                    <ProfileMenuItem
                        icon={<Lock size={18} />}
                        title="Change Password"
                        subtitle="Update your password"
                        onClick={() => router.push('/admin/settings/change-password')}
                    />
                    <ProfileMenuItem
                        icon={<Trash2 size={18} />}
                        title="Delete Account"
                        subtitle="Permanently remove your account"
                        onClick={() => router.push('/admin/settings/delete-account')}
                        last
                    />
                </AdminCard>
            </div>

            {/* Preferences Section */}
            <div>
                <h3 className="text-sm font-bold text-[#78716c] mb-3 uppercase tracking-wider px-2">Preferences</h3>
                <AdminCard className="divide-y divide-[#e8dfc8]">
                    <ProfileMenuItem
                        icon={<Bell size={18} />}
                        title="Notifications"
                        subtitle="Manage notification preferences"
                        onClick={() => router.push('/admin/settings/notifications')}
                        last
                    />
                </AdminCard>
            </div>

            {/* Other Section */}
            <div>
                <h3 className="text-sm font-bold text-[#78716c] mb-3 uppercase tracking-wider px-2">Other</h3>
                <AdminCard className="divide-y divide-[#e8dfc8]">
                    <ProfileMenuItem
                        icon={<Shield size={18} />}
                        title="Terms of Service"
                        subtitle="App usage guidelines & agreement"
                        onClick={() => router.push('/admin/settings/terms')}
                    />
                    <ProfileMenuItem
                        icon={<Shield size={18} />}
                        title="Privacy Policy"
                        subtitle="How we protect your data"
                        onClick={() => router.push('/admin/settings/privacy')}
                        last
                    />
                </AdminCard>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full bg-red-50 p-4 rounded-[12px] border border-red-200 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
                <LogOut size={20} className="text-red-600" />
                <span className="text-red-600 font-semibold">
                    {loggingOut ? 'Signing out...' : 'Sign out'}
                </span>
            </button>
        </div>
    );
}

interface ProfileMenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    last?: boolean;
}

function ProfileMenuItem({ icon, title, subtitle, onClick, last }: ProfileMenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 hover:bg-[#fdfbf7] transition-colors ${!last ? '' : ''
                }`}
        >
            <div className="flex items-center gap-3 flex-1 text-left">
                <div className="w-9 h-9 bg-[#fdfbf7] rounded-full flex items-center justify-center text-[#4A6741]">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-[#292524] font-medium">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-[#78716c] mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            <ChevronRight size={18} className="text-[#a8a29e]" />
        </button>
    );
}
