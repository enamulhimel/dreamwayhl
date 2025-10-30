"use client";

import { fadeInUp } from "@/lib/animations";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export default function Achievement() {
  const { ref: achievementRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  return (
    <section
      className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-stone-950 dark:to-black "
      ref={achievementRef}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative inline-block"
          >
            <h2
              className={`text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 font-[josefinSans] transform transition-all duration-700 ease-out
                ${
                  inView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
            >
              Our Achievements
            </h2>
            <div
              className={`absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600 transform transition-all duration-700 ease-out origin-center
                ${inView ? "scale-x-100" : "scale-x-0"}`}
            ></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: 32, label: "Total Projects", icon: "🏢" },
            { number: 600, label: "Total Clients", icon: "👥" },
            {
              number: 1290000,
              label: "Total Build Area (sq ft)",
              icon: "📐",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-stone-100 dark:bg-black p-8 rounded-lg text-center transform transition-all duration-300 hover:bg-stone-200 dark:hover:bg-stone-800 border border-red-600 shadow-xl hover:shadow-2xl"
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                {inView && (
                  <CountUp
                    end={stat.number}
                    duration={2.5}
                    key={inView ? "in-view" : "out-of-view"}
                  />
                )}
                {stat.label === "Total Build Area (sq ft)" ? "+" : "+"}
              </h3>
              <p className="text-black dark:text-gray-200 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
