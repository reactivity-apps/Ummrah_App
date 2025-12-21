'use client';

import { AdminCard } from '@/components/admin/ui';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
                <h2 className="text-2xl font-semibold text-[#292524]">Privacy Policy</h2>
                <p className="text-[#78716c] mt-1">How we protect your data</p>
            </div>

            {/* Content */}
            <AdminCard className="p-8 prose prose-stone max-w-none">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={24} className="text-[#4A6741]" />
                    <h3 className="text-lg font-semibold text-[#292524] m-0">Privacy Policy</h3>
                </div>

                <div className="space-y-6 text-[#292524]">
                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">1. Information We Collect</h4>
                        <p className="text-[#78716c]">
                            We collect information you provide directly to us, including:
                        </p>
                        <ul className="text-[#78716c] mt-2">
                            <li>Account information (email, password)</li>
                            <li>Profile information (name, phone, location)</li>
                            <li>Trip and itinerary data</li>
                            <li>Emergency contact information</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">2. How We Use Your Information</h4>
                        <p className="text-[#78716c]">
                            We use the information we collect to:
                        </p>
                        <ul className="text-[#78716c] mt-2">
                            <li>Provide and improve our services</li>
                            <li>Communicate with you about trips and updates</li>
                            <li>Send notifications and reminders</li>
                            <li>Ensure the security of your account</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">3. Information Sharing</h4>
                        <p className="text-[#78716c]">
                            We do not sell your personal information. We may share your information:
                        </p>
                        <ul className="text-[#78716c] mt-2">
                            <li>With other members of your trip group</li>
                            <li>With your trip organizers and guides</li>
                            <li>When required by law</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">4. Data Security</h4>
                        <p className="text-[#78716c]">
                            We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">5. Your Rights</h4>
                        <p className="text-[#78716c]">
                            You have the right to:
                        </p>
                        <ul className="text-[#78716c] mt-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your information</li>
                            <li>Opt-out of certain communications</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="font-semibold text-[#292524] mb-2">6. Contact Us</h4>
                        <p className="text-[#78716c]">
                            If you have questions about this Privacy Policy, please contact your group administrator.
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
