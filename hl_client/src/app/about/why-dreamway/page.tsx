"use client"

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar2";
import Image from "next/image";
import Footer from '@/components/footer';
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSwipeable } from 'react-swipeable';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const WhyDreamway = () => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [currentFirstIndex, setCurrentFirstIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();

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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const whyChooseCards = [
    {
      title: "Prime Locations",
      description: "We offer a selection from the most lucrative locations across the city. Our project locations are selected intelligently, keeping in mind the things that matter to you most.",
      image: "/images/about/why-dreamway/card1.jpg"
    },
    {
      title: "Innovative Group Buying",
      description: "Our unique approach allows individuals to collectively invest in land at significantly lower costs, making dream homes accessible to more people without the traditional complexities.",
      image: "/images/about/why-dreamway/card2.jpg"
    },
    {
      title: "Highest Quality Materials",
      description: "We continuously explore material sourcing to enhance the comfort and lifestyle of our clients. Each material is selected with utmost attention to quality, suitability and durability.",
      image: "/about/why/cards/3.png"
    },
    {
      title: "Uncompromising Safety",
      description: "Our priority to safety is second to none. Structural, electro-mechanical and fire safety stand paramount in our planning and construction methodology, ensuring your family's wellbeing.",
      image: "/about/why/cards/4.png"
    },
    {
      title: "On-time Delivery",
      description: "Our experienced team of highly qualified engineers and management professionals work relentlessly in perfect synergy to deliver uncompromised quality on time, every time.",
      image: "/about/why/cards/5.jpg"
    },
    {
      title: "Professional Management",
      description: "A safe, clean and comfortable living environment can only be maintained by a team of professionals with an eye for perfection. Our Facility Management team ensures your community remains beautiful.",
      image: "/about/why/cards/6.jpg"
    }
  ];

  const firstsOfDreamway = [
    {
      title: "FIRST FAR COMPLIANT BUILDING WITH FOUR SIDE FARE FACED",
      project: "Dreamway The Bloom",
      image: "/about/why/bloom.jpg",
    },
    {
      title: "AN ICONIC 1550 SFT, 6-STORIED RESEDENTIAL DEVELOPMENT",
      project: "Dreamway Littleyard",
      image: "/about/why/littleyard.jpg",
    },
    {
      title: " CRAFTED FOR COMFORT, DESIGNED FOR DISTINCTION",
      project: "Dreamway Luxury Cottage",
      image: "/about/why/lixurycottage.jpg",
    },
    {
      title: "CRAFTED FOR MODERN AND COMFORT ELEGANT LIVING",
      project: "Dreamway South Breeze",
      image: "/about/why/southreeze.jpg",
    }
  ];

  // Helper function to get previous index with wraparound
  const getPrevIndex = (current: number) => {
    return current === 0 ? firstsOfDreamway.length - 1 : current - 1;
  };

  // Helper function to get next index with wraparound
  const getNextIndex = (current: number) => {
    return current === firstsOfDreamway.length - 1 ? 0 : current + 1;
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1); // Direction for left movement
    setCurrentFirstIndex(getPrevIndex(currentFirstIndex));
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1); // Direction for right movement
    setCurrentFirstIndex(getNextIndex(currentFirstIndex));
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Enhanced swipe handler with better sensitivity
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrev(),
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 50, // Minimum distance in pixels before a swipe is registered
    swipeDuration: 500, // Maximum time in ms to detect a swipe
  });

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStartX;
    controls.start({ x: dragDistance, transition: { duration: 0 } });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    
    const dragDistance = e.clientX - dragStartX;
    setIsDragging(false);
    
    // Threshold for triggering slide change
    if (Math.abs(dragDistance) > 100) {
      if (dragDistance > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    } else {
      // Reset position if threshold not met
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      controls.start({ x: 0, transition: { duration: 0.3 } });
    }
  };

  // Variants for slide animations - enhanced with spring physics
  const slideVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -300 : 300,
      scale: 0.85,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8
      }
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8
      }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? -300 : 300,
      scale: 0.85,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8
      }
    })
  };

  // Add floating animation
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  };

  // Enhanced side image animation variants with fixed timing
  const sideImageVariants = {
    leftEnter: {
      opacity: 0.5,
      scale: 0.85,
      x: -20,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.4
      }
    },
    rightEnter: {
      opacity: 0.5,
      scale: 0.85,
      x: 20,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.4
      }
    },
    center: {
      opacity: 0.7,
      scale: 0.9,
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.4
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
            src="/images/about/why-dreamway/hero.jpg"
            alt="Why Choose Dreamway"
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
              Why Dreamway?
            </motion.h1>
          </motion.div>
        </div>
      </section>

      <main>
        {/* Why Choose Dreamway Section */}
        <section className="py-20 bg-white dark:bg-neutral-950">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              
              <p className="text-gray-700 dark:text-white max-w-4xl mx-auto text-lg leading-relaxed">
                Dreamway Holdings aspires to weave an unprecedented experience of fine living cocooned in comfort for you. 
                It's the statement of prestige and elegant Architecture that sets us apart. We delve deep into your dwelling 
                needs and make sure those are met to the minutest detail. Each day provides a fresh opportunity for us to 
                refine the art of sophisticated living, continually reinventing our craftsmanship to align with your lifestyle 
                and refined taste. With each creation, Dreamway consistently raises the standard, setting a golden benchmark of 
                excellence. We strive to establish your personal realm of grandeur, embraced in the comforting ambiance of home.
              </p>
            </motion.div>

            {/* Why Choose Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {whyChooseCards.map((card, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="relative group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ height: '350px' }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors duration-300"></div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-white">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-center">{card.title}</h3>
                    
                    {/* Hover content */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm text-center">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Firsts of Dreamway Section */}
        <section className="py-10 bg-black text-white">
          <div className="container mx-auto px-4 w-full lg:w-[90%]">
            <div className="text-center mb-0">
              <h2 className="text-4xl md:text-5xl font-bold tracking-wide mb-3">
                SOME ICONIC PROJECTS
              </h2>
              <div className="h-[80px] md:h-[100px] flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-medium max-w-[800px] mx-auto px-4">
                  {firstsOfDreamway[currentFirstIndex].title}
                </h3>
              </div>
            </div>

            <div className="relative">
              <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={3}
                spaceBetween={30}
                initialSlide={1}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2,
                  slideShadows: false,
                }}
                navigation={true}
                pagination={{
                  clickable: true,
                }}
                modules={[EffectCoverflow, Navigation, Pagination]}
                className="firsts-swiper"
                onSlideChange={(swiper) => setCurrentFirstIndex(swiper.activeIndex)}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20
                  },
                  640: {
                    slidesPerView: 3,
                    spaceBetween: 20
                  }
                }}
              >
                {firstsOfDreamway.map((item, index) => (
                  <SwiperSlide key={index} className="w-full">
                    <motion.div
                      className="relative w-full h-full"
                      style={{ aspectRatio: "9/16", maxHeight: "80vh" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={item.image}
                          alt={item.project}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover rounded-lg"
                          priority={index === currentFirstIndex}
                        />
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Project title */}
              <div className="mt-6 text-center">
                <motion.h2
                  key={currentFirstIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-5xl font-bold tracking-wider"
                >
                  {firstsOfDreamway[currentFirstIndex].project}
                </motion.h2>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {showWhatsApp && <WhatsAppButton />}
    </div>
  );
};

export default WhyDreamway;
