'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Calendar,
    Megaphone,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Briefcase
} from 'lucide-react';

interface SidebarLinkProps {
    href: string;
    icon: ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function SidebarLink({ href, icon, label, active, onClick }: SidebarLinkProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(href);
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all ${active
                ? 'bg-[#4A6741] text-white'
                : 'text-[#78716c] hover:bg-[#fdfbf7] hover:text-[#292524]'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Don't show sidebar/layout on login page
    const isLoginPage = pathname === '/admin/login' || pathname === '/admin';

    const handleLogout = async () => {
        setLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const links = [
        { href: '/admin/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
        { href: '/admin/trips', icon: <Briefcase />, label: 'Trips' },
        { href: '/admin/itinerary', icon: <Calendar />, label: 'Itinerary' },
        { href: '/admin/announcements', icon: <Megaphone />, label: 'Announcements' },
        { href: '/admin/members', icon: <Users />, label: 'Members' },
        { href: '/admin/settings', icon: <Settings />, label: 'Settings' },
    ];

    // If on login page, just render children without layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-[#e8dfc8] flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-[#e8dfc8]">
                    <Image
                        src="/Safar.svg"
                        alt="Safar"
                        width={120}
                        height={40}
                        className="h-10 w-auto mb-2"
                    />
                    <p className="text-xs text-[#a8a29e] mt-1">Admin Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {links.map((link) => (
                        <SidebarLink
                            key={link.href}
                            {...link}
                            active={pathname === link.href}
                        />
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#e8dfc8] space-y-2">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[#78716c] hover:bg-[#fdfbf7] hover:text-[#292524] transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">Back to Site</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[#78716c] hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                    >
                        <LogOut />
                        <span className="font-medium">{loggingOut ? 'Signing out...' : 'Sign out'}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-[#e8dfc8] flex flex-col">
                        {/* Logo */}
                        <div className="p-6 border-b border-[#e8dfc8] flex items-center justify-between">
                            <Image
                                src="/Safar.svg"
                                alt="Safar"
                                width={100}
                                height={33}
                                className="h-8 w-auto"
                            />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-[#78716c] hover:text-[#292524]"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            {links.map((link) => (
                                <SidebarLink
                                    key={link.href}
                                    {...link}
                                    active={pathname === link.href}
                                    onClick={() => setSidebarOpen(false)}
                                />
                            ))}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-[#e8dfc8] space-y-2">
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    router.push('/');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[#78716c] hover:bg-[#fdfbf7] hover:text-[#292524] transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="font-medium">Back to Site</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[#78716c] hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                            >
                                <LogOut />
                                <span className="font-medium">{loggingOut ? 'Signing out...' : 'Sign out'}</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-[#e8dfc8] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-[#78716c] hover:text-[#292524]"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden lg:block">
                            <h1 className="text-xl font-semibold text-[#292524]">
                                {links.find((link) => link.href === pathname)?.label || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/profile')}
                                className="w-10 h-10 bg-[#4A6741] rounded-full flex items-center justify-center text-white font-medium hover:bg-[#3d5435] transition-colors"
                            >
                                A
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
