'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput, LoadingSpinner } from '@/components/admin/ui';
import { Save, ArrowLeft, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmergencyContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('emergency_contact_name, emergency_contact_phone, emergency_contact_relationship')
            .eq('id', user.id)
            .single();

        if (profile) {
            setFormData({
                emergency_contact_name: profile.emergency_contact_name || '',
                emergency_contact_phone: profile.emergency_contact_phone || '',
                emergency_contact_relationship: profile.emergency_contact_relationship || '',
            });
        }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id);

        if (error) {
            setMessage('Failed to update emergency contact');
        } else {
            setMessage('Emergency contact updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

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
                <h2 className="text-2xl font-semibold text-[#292524]">Emergency Contact</h2>
                <p className="text-[#78716c] mt-1">Add someone we can contact in case of emergency</p>
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
                        <Phone size={20} className="text-[#4A6741]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#292524]">Emergency Contact Details</h3>
                        <p className="text-sm text-[#78716c]">This person will be contacted if needed</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Full Name
                        </label>
                        <AdminInput
                            value={formData.emergency_contact_name}
                            onChange={(value) => setFormData({ ...formData, emergency_contact_name: value })}
                            placeholder="Emergency contact name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Phone Number
                        </label>
                        <AdminInput
                            type="tel"
                            value={formData.emergency_contact_phone}
                            onChange={(value) => setFormData({ ...formData, emergency_contact_phone: value })}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Relationship
                        </label>
                        <AdminInput
                            value={formData.emergency_contact_relationship}
                            onChange={(value) => setFormData({ ...formData, emergency_contact_relationship: value })}
                            placeholder="e.g., Spouse, Parent, Sibling"
                        />
                    </div>
                </div>
            </AdminCard>

            {/* Save Button */}
            <div className="flex justify-end">
                <AdminButton
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </AdminButton>
            </div>
        </div>
    );
}
