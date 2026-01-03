import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#292524] text-[#a8a29e] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <Image
              src="/Safar.svg"
              alt="Safar"
              width={140}
              height={46}
              className="h-11 w-auto"
            />
            <p className="text-[#a8a29e] max-w-md">
              Calm, unified trip companion for Umrah groups
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <p className="hover:text-white transition-colors cursor-pointer">
                contact@ummrahapp.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#44403c] mt-8 pt-8 text-center text-sm text-[#78716c]">
          <p>&copy; {new Date().getFullYear()} Safar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
