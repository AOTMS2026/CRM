import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import LiveSimulatorSection from './LiveSimulatorSection';
import FeaturesSection from './FeaturesSection';
import WorkflowSection from './WorkflowSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-prussian_blue-100 text-tan-900 font-sans selection:bg-burnt_peach selection:text-prussian_blue-100">
      {/* Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main>
        <HeroSection />
        <AboutSection />
        <LiveSimulatorSection />
        <FeaturesSection />
        <WorkflowSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export {
  Navbar,
  HeroSection,
  AboutSection,
  LiveSimulatorSection,
  FeaturesSection,
  WorkflowSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
};
