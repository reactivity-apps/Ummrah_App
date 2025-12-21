'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

function ConditionalHeader() {
    const pathname = usePathname();

    // Don't show header on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return <Header />;
}

export default ConditionalHeader;
