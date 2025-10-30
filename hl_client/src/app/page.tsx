"use client";

import About from "@/components/About";
import Achievement from "@/components/Achievement";
import Footer from "@/components/footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar2";
import ProjectList from "@/components/ProjectList";
import RecentBlogs from "@/components/RecentBlogs";
import ReviewShowcase from "@/components/ReviewShowcase";
import WhatsAppButton from "@/components/WhatsAppButton";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowWhatsApp(heroBottom <= 0); // Show button once hero is out of view
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if overlay has already been shown in this session
    const hasSeenOverlay = typeof window !== "undefined" && sessionStorage.getItem("hasSeenOverlay");
    if (!hasSeenOverlay) {
      const timer = setTimeout(() => {
        setShowOverlay(true);
        sessionStorage.setItem("hasSeenOverlay", "true");
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, []);

  // Auto-close overlay after 8 seconds
  useEffect(() => {
    if (showOverlay) {
      const closeTimer = setTimeout(() => {
        setShowOverlay(false);
      }, 8000);

      return () => clearTimeout(closeTimer);
    }
  }, [showOverlay]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop, not the image itself
    if (e.target === e.currentTarget) {
      setShowOverlay(false);
    }
  };

  return (
    <div className="relative">
      <Navbar />
      <Hero />

      {/* Content Sections */}
      <main>
        {/* Projects Section */}
        <section id="projects" className="bg-black py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectList />
          </div>
        </section>

        {/* About us Section */}
        <About />

        {/* Achievement Section */}
        <Achievement />

        <ReviewShowcase />
        <RecentBlogs />
        <Footer />
      </main>

      {/* WhatsApp Button (Hidden over Hero Section) */}
      <div
        className={`fixed bottom-5 right-5 transition-opacity duration-300 ${
          showWhatsApp ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <WhatsAppButton />
      </div>

      {/* Site-wide Overlay */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-700 ease-in-out ${
          showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
        style={{ background: "rgba(0,0,0,0.7)" }}
      >
        <div
          className="relative transform origin-center w-[80%] h-[90%] flex items-center justify-center"
          style={{
            transform: showOverlay ? "scale(1)" : "scale(0.8)",
            opacity: showOverlay ? 1 : 0,
            transition: "all 0.8s ease-in-out",
            background: "transparent",
          }}
        >
          <button
            onClick={() => setShowOverlay(false)}
            className="absolute top-5 right-5 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 transition-colors"
            aria-label="Close overlay"
          >
            <X className="h-5 w-5 text-gray-800" />
          </button>
          <Link
            href="/properties/dreamway-lucentia"
            className="w-full h-full flex items-center justify-center"
          >
            <Image
              src="/overlay5.png"
              alt="Overlay"
              width={600}
              height={400}
              className="rounded-lg cursor-pointer"
              style={{
                backgroundColor: "transparent",
                objectFit: "contain",
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              priority
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
