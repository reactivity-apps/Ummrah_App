'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminButton, AdminInput, LoadingSpinner } from '@/components/admin/ui';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();

        try {
            // Sign in with email and password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }

            if (!authData.user) {
                setError('Login failed. Please try again.');
                setLoading(false);
                return;
            }

            // Check if user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('auth_role')
                .eq('user_id', authData.user.id)
                .single();

            // Check for super_admin role
            if (profile?.auth_role === 'super_admin') {
                router.push('/admin/dashboard');
                return;
            }

            // Check for group membership (group admin)
            const { data: groupMemberships } = await supabase
                .from('group_memberships')
                .select('id')
                .eq('user_id', authData.user.id)
                .limit(1);

            if (groupMemberships && groupMemberships.length > 0) {
                router.push('/admin/dashboard');
                return;
            }

            // Not an admin - sign out and show error
            await supabase.auth.signOut();
            setError('You do not have admin access');
            setLoading(false);
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center px-6 relative">
            {/* Back to Site Link */}
            <a
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-[#78716c] hover:text-[#292524] transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Site</span>
            </a>

            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <div className="text-5xl text-[#C5A059]">☪</div>
                    </div>
                    <h1 className="text-3xl font-semibold text-[#292524] mb-2">Admin</h1>
                    <p className="text-[#78716c]">A calm control room for sacred journeys</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[16px] shadow-sm border border-[#e8dfc8] p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <AdminInput
                            type="email"
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            placeholder="admin@example.com"
                            required
                            disabled={loading}
                        />

                        <AdminInput
                            type="password"
                            label="Password"
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-[12px]">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <AdminButton
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </AdminButton>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-[#a8a29e] mt-6">
                    Admin access only · Contact support if you need assistance
                </p>
            </div>
        </div>
    );
}
