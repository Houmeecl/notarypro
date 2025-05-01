import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Contact from "@/components/landing/Contact";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import RonService from "@/components/landing/RonService";
import ApkDownload from "@/components/landing/ApkDownload";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <RonService />
      <Services />
      <HowItWorks />
      <ApkDownload />
      <Pricing />
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
}
