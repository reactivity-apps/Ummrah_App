import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import SocialProof from '@/components/landing/SocialProof';
import ForGroupLeaders from '@/components/landing/ForGroupLeaders';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdfbf7]">
      <Hero />
      <HowItWorks />
      <FeatureHighlights />
      <SocialProof />
      <ForGroupLeaders />
      <Footer />
    </main>
  );
}
