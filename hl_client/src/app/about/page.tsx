"use client"

import React, { useEffect, useRef, useState } from 'react';
import Navbar from "@/components/Navbar2";
import Image from "next/image";
import Footer from '@/components/footer';
import { motion } from "framer-motion";
import WhatsAppButton from '@/components/WhatsAppButton';

const About = () => {

  const [showWhatsApp, setShowWhatsApp] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero")
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom
        setShowWhatsApp(heroBottom <= 0) // Show button once hero is out of view
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const overviewRef = useRef(null);
  const visionRef = useRef(null);
  const valuesRef = useRef(null);
  const messageRef = useRef(null);
  const statsRef = useRef(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
        when: "beforeChildren"
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative h-[50vh] md:h-[60vh] bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/images/properties/property-hero2.jpg" 
            alt="Hero Background" 
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <motion.div 
            className="text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              About Us
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Building Dreams, Delivering Excellence
            </motion.p>
          </motion.div>
        </div>
      </section>

      <main>
        {/* Overview Section */}
        <section id="overview" className="py-20 bg-white dark:bg-neutral-950" ref={overviewRef}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                  <span className="relative inline-block">
                    Overview
                  </span>
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  In the ever-evolving global landscape, the real estate industry holds a significant position, 
                  recognized as one of the leading sectors worldwide. However, in contrast to developed nations, 
                  where real estate enjoys widespread acceptance and structured growth, Bangladesh faces unique challenges. 
                  The primary obstacles stem from a lack of expertise among industry entrepreneurs and the exploitative 
                  tendencies of certain profit-driven entities.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  At Dreamway Holdings Ltd., we are committed to transforming the traditional real estate approach 
                  by fostering trust, transparency, and efficiency. Our innovative Group Buying Model allows 
                  individuals to collectively invest in land at 50% lower costs, enabling them to build their 
                  dream homes without the complexities of traditional real estate transactions.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  At Dreamway Holdings Ltd., we are not just building homes—we are building a community of trust 
                  and shared aspirations. Partner with us and take a confident step toward securing your dream home.
                </p>
              </motion.div>
              <motion.div 
                variants={fadeInUp}
                className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl"
              >
                <Image 
                  src="/about/aboutimage.jpg" 
                  alt="Company Overview" 
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Vision & Process Section */}
        <section className="py-20 bg-gray-50 dark:bg-neutral-950" ref={visionRef}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <motion.div 
                variants={fadeInUp}
                className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-6">
                  <span className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Process</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our process is simple and secure:
                </p>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    "Investors purchase land shares through a legally verified process.",
                    "Upon confirmation, ownership is secured through a registered deed at the land registry office.",
                    "A joint purchase and construction committee is formed, comprising both Dreamway Holdings Ltd. representatives and the landowners.",
                    "Construction costs can be paid in flexible installments, ensuring financial ease.",
                    "Every phase is meticulously managed by our expert team, ensuring a seamless and trustworthy experience."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-6">
                  <span className="inline-block p-3 rounded-full bg-red-100 text-red-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Vision</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  At Dreamway Holdings Ltd., we envision a real estate landscape where trust, transparency, and efficiency are paramount. 
                  We aim to revolutionize the traditional approach to property ownership in Bangladesh by empowering individuals through 
                  our innovative Group Buying Model. Our vision is to create communities where dreams of home ownership are accessible to all, 
                  free from the complexities and excessive costs of conventional real estate transactions. We strive to be the catalyst for 
                  positive change in an industry that has long been challenged by lack of expertise and profit-driven practices.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 bg-white dark:bg-neutral-950" ref={valuesRef}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={fadeInUp}
                className="relative inline-block"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  Our Core Values
                </h2>
                <motion.div
                  className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                ></motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              {[
                { 
                  title: "Innovation", 
                  desc: "Embracing new ideas and technologies",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )
                },
                { 
                  title: "Quality", 
                  desc: "Maintaining highest standards in all we do",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )
                },
                { 
                  title: "Integrity", 
                  desc: "Operating with honesty and transparency",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                { 
                  title: "Excellence", 
                  desc: "Striving for exceptional results",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )
                }
              ].map((value, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-red-600"
                >
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{value.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Board Of Directors Section Title */}
        <section className="py-10 bg-gray-50 dark:bg-neutral-950" ref={messageRef}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={fadeInUp}
                className="relative inline-block"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Board Of Directors
                </h2>
                <motion.div
                  className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Message Section */}
        <section className="py-8 bg-gray-50 dark:bg-neutral-950">
          <div className="container mx-auto px-4">
            <motion.div 
              className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-xl shadow-xl overflow-hidden relative mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <motion.div 
                    className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/about/cm_image.png"
                      alt="Chairman"
                      fill
                      className="object-cover object-[50%_10%]"
                    />
                  </motion.div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Md Abul Kashem Raj</h2>
                  <h4 className="text-xl text-gray-700 dark:text-gray-300 mb-6 flex items-center">
                    <span className="mr-2">Founder & Chairman</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    &ldquo;Mr. Md. Abul Kashem, Founder Chairman of Dreamway Holdings Ltd., established the company 
                    to provide world-class products and services in Bangladesh. Under his visionary leadership, 
                    Dreamway Holdings Ltd. has excelled in quality, innovation, and social responsibility, 
                    contributing to the country's economic growth. With approximately 120 employees and additional 
                    indirect employment, the company plays a vital role in the private sector. Recognized with 
                    various quality and trade awards, Dreamway Holdings Ltd. remains committed to   expansion 
                    and diversification. Mr. Md Abul Kashem Raj expresses gratitude to colleagues, patrons, 
                    and partners, emphasizing the company's dedication to sustainable growth and excellence 
                    in modern business practices.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* New Managing Director Message */}
            <motion.div 
              className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-xl shadow-xl overflow-hidden relative mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3 order-1 md:order-2">
                <motion.div 
                    className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/about/md.png"
                      alt="Director"
                      fill
                      className="object-cover object-[50%_10%]"
                    />
                  </motion.div>
                </div>
                <div className="md:w-2/3 order-2 md:order-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">AFM Afzalur Rahman</h2>
                  <h4 className="text-xl text-gray-700 dark:text-gray-300 mb-6 flex items-center">
                    <span className="mr-2">Managing Director</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    &ldquo;
                    
                    AFM Afzalur Rahman, the Managing Director of Dreamway Holdings Ltd, is a distinguished entrepreneur 
                    in Bangladesh’s real estate sector. With extensive experience in high-rise residential and
                     commercial developments across Dhaka, he has established a strong presence in the competitive market.
                     <br /><br />
                      Through his professionalism, strategic vision, and commitment to excellence, 
                      he has rapidly built a solid foundation for Dreamway Holdings Ltd. His attention 
                      to detail and mission-driven leadership have positioned the company as a pioneer 
                      in the industry. Drawing from real-world experience, AFM Afzalur Rahman continues 
                      to drive the company’s growth, setting new benchmarks in real estate development.

                    &rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Director Message */}
            <motion.div 
              className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-xl shadow-xl overflow-hidden relative"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <motion.div 
                    className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/about/director.png"
                      alt="Director"
                      fill
                      className="object-cover object-[50%_10%]"
                    />
                  </motion.div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Eng. Roshne Anwar</h2>
                  <h4 className="text-xl text-gray-700 dark:text-gray-300 mb-6 flex items-center">
                    <span className="mr-2">Director</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    &ldquo;Roshne Anwar deals with bigger picture challenges and opportunities of the organization. 
                    She evaluates growth potential in different markets and recommends further evaluations 
                    based on those observations.
                    <br /><br />
                    As a part of the leadership team, she also helps to shape the organizational culture, 
                    and design motivational initiatives for all employees.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Achievement Stats */}
        <section className="py-20 bg-white dark:bg-neutral-950 text-black" ref={statsRef}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={fadeInUp}
                className="relative inline-block"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white ">
                  Our Achievements
                </h2>
                <motion.div
                  className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                ></motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              {[
                { number: "10+", label: "Years of Service", icon: "🏆" },
                { number: "32+", label: "Projects Completed", icon: "🏢" },
                { number: "200+", label: "Team Members", icon: "👥" },
                { number: "99%", label: "Client Satisfaction", icon: "⭐" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="bg-stone-100 dark:bg-neutral-900 p-6 md:p-8 rounded-lg text-center transform transition-all duration-300 hover:bg-stone-200 border border-red-600 shadow-xl hover:shadow-2xl text-black"
                  whileHover={{ y: -10 }}
                >
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">{stat.number}</h3>
                  <p className="text-black dark:text-white font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* WhatsApp Button (Hidden over Hero Section) */}
      <div
        className={`fixed bottom-5 right-5 transition-opacity duration-300 ${showWhatsApp ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <WhatsAppButton />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;