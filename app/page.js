"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FocusSessions from "@/components/home/FocusSessions";
import Analytics from "@/components/home/Analytics";
import SessionLogging from "@/components/home/SessionLogging";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Log page view for analytics
    console.log("HomePage viewed");
  }, []);

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <FocusSessions />
        <Analytics />
        <SessionLogging />
      </main>
      <Footer />
    </div>
  );
}
