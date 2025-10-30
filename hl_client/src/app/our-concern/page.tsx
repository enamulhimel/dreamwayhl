"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/Navbar2"
import Footer from "@/components/footer"
import Image from "next/image"

const concerns = [
  {
    id: 1,
    title: "Environmental Sustainability",
    description: "We are committed to reducing our environmental impact through sustainable construction practices and eco-friendly materials.",
    icon: "🌱",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    id: 2,
    title: "Quality Assurance",
    description: "Our rigorous quality control processes ensure that every project meets the highest standards of construction excellence.",
    icon: "✓",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    title: "Community Development",
    description: "We believe in creating spaces that enhance community life and foster social connections.",
    icon: "🏘️",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    title: "Innovation",
    description: "Embracing cutting-edge technology and modern construction methods to deliver superior results.",
    icon: "💡",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

export default function OurConcern() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src="/images/concern-bg.jpg"
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Our Concerns</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                We are dedicated to creating sustainable, high-quality developments that positively impact communities.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Concerns Grid Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container-custom">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            >
              {concerns.map((concern) => (
                <motion.div
                  key={concern.id}
                  variants={itemVariants}
                  className={`${concern.color} border p-8 rounded-xl hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className={`text-4xl mb-4 ${concern.iconColor}`}>{concern.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4">{concern.title}</h3>
                  <p className="text-gray-600">{concern.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">Our Commitment</h2>
                <p className="text-gray-600 mb-6">
                  At Dreamway Holding, we are committed to excellence in every aspect of our work. Our approach combines innovative construction methods with environmental responsibility to build a better future.
                </p>
                <p className="text-gray-600 mb-6">
                  We believe that successful development is not just about buildings, but about creating spaces that enhance the lives of people who use them. This philosophy guides every project we undertake.
                </p>
                <ul className="space-y-3">
                  {[
                    "Sustainable building practices",
                    "Highest quality materials",
                    "Innovative design solutions",
                    "Community-focused development",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="flex items-center"
                    >
                      <span className="h-2 w-2 bg-blue-600 rounded-full mr-3"></span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-[400px] rounded-xl overflow-hidden shadow-xl"
              >
                <Image
                  src="/images/commitment.jpg"
                  alt="Our Commitment"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 