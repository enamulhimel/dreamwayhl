"use client"

import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar2"
import Footer from "@/components/footer"
import { useState } from "react"
import Image from "next/image"

const newsAndEvents = [
  {
    id: 1,
    type: "news",
    title: "New Eco-Friendly Housing Project Launched",
    date: "March 15, 2024",
    image: "/images/news1.jpg",
    description: "We're excited to announce our latest eco-friendly housing project featuring solar panels and sustainable materials.",
  },
  {
    id: 2,
    type: "event",
    title: "Property Expo 2024",
    date: "April 5-7, 2024",
    image: "/images/event1.jpg",
    description: "Join us at the annual Property Expo where we'll showcase our upcoming projects and innovative construction technologies.",
  },
  {
    id: 3,
    type: "news",
    title: "Award-Winning Design Recognition",
    date: "March 1, 2024",
    image: "/images/news2.jpg",
    description: "Our latest commercial project has been recognized for its innovative design and sustainability features.",
  },
  {
    id: 4,
    type: "event",
    title: "Community Workshop",
    date: "March 20, 2024",
    image: "/images/event2.jpg",
    description: "Participate in our community workshop to learn about sustainable living and smart home technologies.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function NewsAndEvents() {
  const [filter, setFilter] = useState("all")

  const filteredItems = newsAndEvents.filter(
    item => filter === "all" || item.type === filter
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src="/images/news-bg.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10" />
          
          <div className="container-custom relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">News & Events</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Stay updated with our latest news and upcoming events
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <FilterButton 
                active={filter === "all"} 
                onClick={() => setFilter("all")}
                label="All"
              />
              <FilterButton 
                active={filter === "news"} 
                onClick={() => setFilter("news")}
                label="News"
              />
              <FilterButton 
                active={filter === "event"} 
                onClick={() => setFilter("event")}
                label="Events"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative h-56 w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.type === "news" 
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{item.description}</p>
                      <motion.button 
                        whileHover={{ x: 5 }}
                        className="mt-auto text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        Read more 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 text-lg">No items found for this filter.</p>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-blue-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">Stay Updated</h2>
                <p className="text-gray-600 mb-8">
                  Subscribe to our newsletter to receive the latest news and event updates directly in your inbox.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-2 rounded-full transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </motion.button>
  )
} 