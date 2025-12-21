'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white/95 backdrop-blur-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl text-[#C5A059]">☪</div>
            <span className="text-xl font-semibold text-[#292524]">Umrah Companion</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-[#78716c] hover:text-[#292524] transition-colors">
              How it works
            </Link>
            <Link href="#features" className="text-sm text-[#78716c] hover:text-[#292524] transition-colors">
              Features
            </Link>
            <Link href="#for-leaders" className="text-sm text-[#78716c] hover:text-[#292524] transition-colors">
              For group leaders
            </Link>
            <Link href="/admin/login" className="text-sm text-[#78716c] hover:text-[#292524] transition-colors">
              Already an admin?
            </Link>
            <Link
              href="#get-started"
              className="px-5 py-2 border-2 border-[#4A6741] text-[#4A6741] rounded-lg hover:bg-[#4A6741] hover:text-white transition-colors font-medium text-sm"
            >
              Get started
            </Link>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#78716c] hover:text-[#292524]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <nav className="absolute top-20 right-0 left-0 mx-4 bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <Link
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="block py-3 text-[#78716c] hover:text-[#292524] transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#features"
              onClick={closeMobileMenu}
              className="block py-3 text-[#78716c] hover:text-[#292524] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#for-leaders"
              onClick={closeMobileMenu}
              className="block py-3 text-[#78716c] hover:text-[#292524] transition-colors"
            >
              For group leaders
            </Link>
            <Link
              href="/admin/login"
              onClick={closeMobileMenu}
              className="block py-3 text-[#78716c] hover:text-[#292524] transition-colors"
            >
              Already an admin?
            </Link>
            <Link
              href="#get-started"
              onClick={closeMobileMenu}
              className="block py-3 px-6 text-center border-2 border-[#4A6741] text-[#4A6741] rounded-lg hover:bg-[#4A6741] hover:text-white transition-colors font-medium"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
