'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput } from '@/components/admin/ui';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        if (confirmation !== 'DELETE') {
            return;
        }

        setDeleting(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Delete the user's profile (cascade will handle related data)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (!error) {
            await supabase.auth.signOut();
            router.push('/');
        }

        setDeleting(false);
    };

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
                <h2 className="text-2xl font-semibold text-[#292524]">Delete Account</h2>
                <p className="text-[#78716c] mt-1">Permanently remove your account and all data</p>
            </div>

            {/* Warning */}
            <AdminCard className="p-6 border-red-200 bg-red-50/50">
                <div className="flex gap-3">
                    <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h3>
                        <p className="text-sm text-red-700">
                            Deleting your account will permanently remove all your data, including:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                            <li>Your profile information</li>
                            <li>Trip memberships</li>
                            <li>All personal data</li>
                        </ul>
                    </div>
                </div>
            </AdminCard>

            {/* Confirmation */}
            {!showConfirm ? (
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-[12px] font-semibold hover:bg-red-700 transition-colors"
                    >
                        I want to delete my account
                    </button>
                </div>
            ) : (
                <AdminCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#292524]">Confirm Account Deletion</h3>
                            <p className="text-sm text-[#78716c]">Type DELETE to confirm</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AdminInput
                            value={confirmation}
                            onChange={(value) => setConfirmation(value)}
                            placeholder="Type DELETE in capital letters"
                            className="text-center font-mono"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setConfirmation('');
                                }}
                                className="flex-1 px-4 py-3 border border-[#e8dfc8] rounded-[12px] text-[#292524] font-semibold hover:bg-[#fdfbf7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={confirmation !== 'DELETE' || deleting}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-[12px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </AdminCard>
            )}
        </div>
    );
}
