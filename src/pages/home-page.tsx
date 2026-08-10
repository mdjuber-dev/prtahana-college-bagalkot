import HeroSection from '@/components/sections/hero-section';
import QuickHighlights from '@/components/sections/quick-highlights';
import AboutPreview from '@/components/sections/about-preview';
import AchievementCounters from '@/components/sections/achievement-counters';
import WhyChoosePrarthana from '@/components/sections/why-choose-prarthana';
import CoursesPreview from '@/components/sections/courses-preview';
import PamphletSection from '@/components/sections/pamphlet-section';
import FeeStructurePreview from '@/components/sections/fee-structure-preview';
import AchievementsShowcase from '@/components/sections/achievements-showcase';
import CampusLife from '@/components/sections/campus-life';
import CampusFacilities from '@/components/sections/campus-facilities';
import CampusVideos from '@/components/sections/campus-videos';
import Testimonials from '@/components/sections/testimonials';
import ManagementPreview from '@/components/sections/management-preview';
import ContactPreview from '@/components/sections/contact-preview';
import CTASection from '@/components/shared/cta-section';

export default function HomePage() {
  return (
    <div id="home-page-content">
      <HeroSection />
      <QuickHighlights />
      <CoursesPreview />
      <PamphletSection />
      <AboutPreview />
      <AchievementCounters />
      <WhyChoosePrarthana />
      <FeeStructurePreview />
      <AchievementsShowcase />
      <CampusLife />
      <CampusFacilities />
      <CampusVideos />
      <Testimonials />
      <ManagementPreview />
      <ContactPreview />
      <CTASection />
    </div>
  );
}
