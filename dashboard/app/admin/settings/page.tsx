'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, LoadingSpinner } from '@/components/admin/ui';
import { Save, Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface GroupSettings {
    id: string;
    name: string;
    description: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    website: string | null;
    address: string | null;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<GroupSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get the user's group
        const { data: membership } = await supabase
            .from('group_memberships')
            .select('group_id')
            .eq('user_id', user.id)
            .single();

        if (membership) {
            const { data: groupData } = await supabase
                .from('groups')
                .select('*')
                .eq('id', membership.group_id)
                .single();

            if (groupData) {
                setSettings(groupData);
            }
        }

        setLoading(false);
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setMessage('');

        const supabase = createClient();

        const { error } = await supabase
            .from('groups')
            .update({
                name: settings.name,
                description: settings.description,
                contact_email: settings.contact_email,
                contact_phone: settings.contact_phone,
                website: settings.website,
                address: settings.address,
            })
            .eq('id', settings.id);

        if (error) {
            setMessage('Failed to save settings');
        } else {
            setMessage('Settings saved successfully!');
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

    if (!settings) {
        return (
            <div className="max-w-4xl mx-auto">
                <AdminCard className="p-12 text-center">
                    <div className="text-[#C5A059] text-5xl mb-4">⚙️</div>
                    <h3 className="text-lg font-medium text-[#292524] mb-2">No Group Found</h3>
                    <p className="text-[#78716c]">You need to be part of a group to access settings</p>
                </AdminCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-[#292524]">Group Settings</h2>
                <p className="text-[#78716c] mt-1">Manage your organization information</p>
            </div>

            {/* Success Message */}
            {message && (
                <div className={`p-4 rounded-[12px] ${message.includes('success')
                        ? 'bg-[#4A6741]/10 text-[#4A6741]'
                        : 'bg-red-50 text-red-600'
                    }`}>
                    {message}
                </div>
            )}

            {/* Basic Information */}
            <AdminCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#4A6741]/10 rounded-full flex items-center justify-center">
                        <Building2 size={20} className="text-[#4A6741]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#292524]">Basic Information</h3>
                        <p className="text-sm text-[#78716c]">Organization name and description</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Organization Name *
                        </label>
                        <AdminInput
                            value={settings.name}
                            onChange={(value) => setSettings({ ...settings, name: value })}
                            placeholder="Enter organization name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Description
                        </label>
                        <AdminTextarea
                            value={settings.description || ''}
                            onChange={(value) => setSettings({ ...settings, description: value })}
                            placeholder="Brief description of your organization"
                            rows={4}
                        />
                    </div>
                </div>
            </AdminCard>

            {/* Contact Information */}
            <AdminCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#C5A059]/10 rounded-full flex items-center justify-center">
                        <Mail size={20} className="text-[#C5A059]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#292524]">Contact Information</h3>
                        <p className="text-sm text-[#78716c]">How members can reach you</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Contact Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716c]" />
                            <AdminInput
                                type="email"
                                value={settings.contact_email || ''}
                                onChange={(value) => setSettings({ ...settings, contact_email: value })}
                                placeholder="contact@organization.com"
                                className="pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Contact Phone
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716c]" />
                            <AdminInput
                                type="tel"
                                value={settings.contact_phone || ''}
                                onChange={(value) => setSettings({ ...settings, contact_phone: value })}
                                placeholder="+1 (555) 123-4567"
                                className="pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Website
                        </label>
                        <div className="relative">
                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716c]" />
                            <AdminInput
                                type="url"
                                value={settings.website || ''}
                                onChange={(value) => setSettings({ ...settings, website: value })}
                                placeholder="https://www.organization.com"
                                className="pl-11"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#292524] mb-2">
                            Address
                        </label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-4 text-[#78716c]" />
                            <AdminTextarea
                                value={settings.address || ''}
                                onChange={(value) => setSettings({ ...settings, address: value })}
                                placeholder="Organization address"
                                rows={3}
                                className="pl-11"
                            />
                        </div>
                    </div>
                </div>
            </AdminCard>

            {/* Save Button */}
            <div className="flex justify-end">
                <AdminButton
                    onClick={handleSave}
                    disabled={saving || !settings.name}
                    className="gap-2"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </AdminButton>
            </div>
        </div>
    );
}

