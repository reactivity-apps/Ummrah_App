'use client';

import { AdminCard } from '@/components/admin/ui';
import { ArrowLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#78716c] hover:text-[#292524] mb-4"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
                <h2 className="text-2xl font-semibold text-[#292524]">Notifications</h2>
                <p className="text-[#78716c] mt-1">Manage notification preferences</p>
            </div>

            {/* Coming Soon */}
            <AdminCard className="p-12 text-center">
                <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={32} className="text-[#C5A059]" />
                </div>
                <h3 className="text-lg font-medium text-[#292524] mb-2">Notification Settings</h3>
                <p className="text-[#78716c]">
                    Notification preferences are currently managed through the mobile app
                </p>
            </AdminCard>
        </div>
    );
}
