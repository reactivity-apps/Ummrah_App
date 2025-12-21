'use client';

import { AdminCard } from '@/components/admin/ui';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#78716c] hover:text-[#292524] mb-4"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
                <h2 className="text-2xl font-semibold text-[#292524]">Terms of Service</h2>
                <p className="text-[#78716c] mt-1">App usage guidelines and agreement</p>
            </div>

            {/* Content */}
            <AdminCard className="p-8 prose prose-stone max-w-none">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={24} className="text-[#4A6741]" />
                    <h3 className="text-lg font-semibold text-[#292524] m-0">Terms of Service Agreement</h3>
                </div>

                <div className="space-y-6 text-[#292524]">
                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">1. Acceptance of Terms</h4>
                        <p className="text-[#78716c]">
                            By accessing and using the Umrah Companion application, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">2. Use License</h4>
                        <p className="text-[#78716c]">
                            Permission is granted to use this application for personal, non-commercial purposes related to organizing and participating in Umrah trips.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">3. User Responsibilities</h4>
                        <p className="text-[#78716c]">
                            Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">4. Content</h4>
                        <p className="text-[#78716c]">
                            Users retain ownership of content they create. By posting content, you grant Umrah Companion the right to use, modify, and display that content within the application.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">5. Limitation of Liability</h4>
                        <p className="text-[#78716c]">
                            Umrah Companion shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the application.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">6. Changes to Terms</h4>
                        <p className="text-[#78716c]">
                            We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms.
                        </p>
                    </section>
                </div>

                <div className="mt-8 p-4 bg-[#fdfbf7] rounded-lg border border-[#e8dfc8]">
                    <p className="text-sm text-[#78716c] m-0">
                        Last updated: December 2025
                    </p>
                </div>
            </AdminCard>
        </div>
    );
}
