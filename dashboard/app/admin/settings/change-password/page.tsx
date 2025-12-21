'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput } from '@/components/admin/ui';
import { Save, ArrowLeft, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const handleSave = async () => {
        setMessage('');

        if (formData.newPassword.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setSaving(true);

        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({
            password: formData.newPassword
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Password updated successfully!');
            setFormData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage(''), 3000);
        }

        setSaving(false);
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
                <h2 className="text-2xl font-semibold text-[#292524]">Change Password</h2>
                <p className="text-[#78716c] mt-1">Update your account password</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-[12px] ${message.includes('success')
                        ? 'bg-[#4A6741]/10 text-[#4A6741]'
                        : 'bg-red-50 text-red-600'
                    }`}>
                    {message}
                </div>
            )}

            {/* Form */}
            <AdminCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#4A6741]/10 rounded-full flex items-center justify-center">
                        <Lock size={20} className="text-[#4A6741]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#292524]">New Password</h3>
                        <p className="text-sm text-[#78716c]">Must be at least 6 characters</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            New Password
                        </label>
                        <AdminInput
                            type="password"
                            value={formData.newPassword}
                            onChange={(value) => setFormData({ ...formData, newPassword: value })}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Confirm New Password
                        </label>
                        <AdminInput
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>
            </AdminCard>

            {/* Save Button */}
            <div className="flex justify-end">
                <AdminButton
                    onClick={handleSave}
                    disabled={saving || !formData.newPassword || !formData.confirmPassword}
                    className="gap-2"
                >
                    <Save size={18} />
                    {saving ? 'Updating...' : 'Update Password'}
                </AdminButton>
            </div>
        </div>
    );
}
