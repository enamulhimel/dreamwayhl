"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createObserver = (callback: (isIntersecting: boolean) => void) => {
      return new IntersectionObserver(
        ([entry]) => {
          callback(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );
    };

    const titleObserver = createObserver(setIsVisible);
    const contentObserver = createObserver(setContentVisible);

    const titleRefCurrent = titleRef.current;
    const contentRefCurrent = contentRef.current;

    if (titleRefCurrent) titleObserver.observe(titleRefCurrent);
    if (contentRefCurrent) contentObserver.observe(contentRefCurrent);

    return () => {
      if (titleRefCurrent) titleObserver.unobserve(titleRefCurrent);
      if (contentRefCurrent) contentObserver.unobserve(contentRefCurrent);
    };
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  return (
    <section
      id="about"
      className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-stone-950 py-16 "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12" ref={titleRef}>
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative inline-block"
          >
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4 font-[josefinSans] transform transition-all duration-700 ease-out
                    ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
            >
              About Us
            </h2>
            <div
              className={`absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600 transform transition-all duration-700 ease-out origin-center
                      ${isVisible ? "scale-x-100" : "scale-x-0"}`}
            ></div>
          </motion.div>
        </div>

        {/* Main Content Section */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto"
          ref={contentRef}
        >
          {/* Text Content */}
          <motion.div
            initial="hidden"
            animate={contentVisible ? "visible" : "hidden"}
            variants={fadeInLeft}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-300 font-[josefinSans]">
              Our Journey
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              At Dreamway Holdings Ltd., we are committed to transforming the
              traditional real estate approach by fostering trust, transparency,
              and efficiency. Our innovative Group Buying Model allows
              individuals to collectively invest in land at 50% lower costs,
              enabling them to build their dream homes without the complexities
              of traditional real estate transactions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              At Dreamway Holdings Ltd., we are not just building homes—we are
              building a community of trust and shared aspirations. Partner with
              us and take a confident step toward securing your dream home.
            </p>
            <div className="pt-4">
              <a
                href="/about"
                className="inline-flex items-center text-red-600 font-medium hover:text-blue-700 transition-colors"
              >
                Learn more about our vision
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial="hidden"
            animate={contentVisible ? "visible" : "hidden"}
            variants={fadeInRight}
            className="grid grid-cols-2 gap-4 h-full"
          >
            <div className="space-y-4">
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                <Image
                  src="/gallery/im1.jpg"
                  alt="Modern Building"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: '50% 80%' }}
                />
              </div>
              <div className="relative h-40 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                <Image
                  src="/gallery/image2.jpg"
                  alt="City Skyline"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-right"
                />
              </div>
            </div>
            <div className="space-y-4 mt-4">
              <div className="relative h-40 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                <Image
                  src="/gallery/image3.jpg"
                  alt="Modern Office"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                <Image
                  src="/gallery/im4.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className=" object-cover"
                  style={{ objectPosition: '50% 80%' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
