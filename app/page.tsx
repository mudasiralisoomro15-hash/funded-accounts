"use client";

import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PricingSection from "@/components/PricingSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import AuthModal, { type AuthMode } from "@/components/AuthModal";
import type { PlanSelection } from "@/lib/plans";

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [order, setOrder] = useState<PlanSelection | null>(null);

  const openAuth = useCallback((mode: AuthMode, selection: PlanSelection | null = null) => {
    setAuthMode(mode);
    setOrder(selection);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  return (
    <main>
      {/* "Client Portal" -> sign in. No signup wall: the page below is fully visible. */}
      <Navbar onOpenAuth={(mode) => openAuth(mode)} />
      <Hero />
      {/* "Buy Account" -> auth modal (sign up tab) with the chosen plan attached. */}
      <PricingSection onBuy={(selection) => openAuth("signup", selection)} />
      <WhyChooseUs />
      <FaqSection />
      <Footer />

      <AuthModal
        open={authOpen}
        mode={authMode}
        order={order}
        onClose={closeAuth}
        onModeChange={setAuthMode}
      />
    </main>
  );
}
