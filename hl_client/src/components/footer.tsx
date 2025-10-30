"use client"

import { Phone, Mail, MapPin, ArrowRight, Loader2, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import axios from "axios"
import api from '@/lib/api'

export default function Footer() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (status === "success") {
      setShowPopup(true)
      timer = setTimeout(() => {
        setShowPopup(false)
      }, 5000)
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [status])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) return
    
    setStatus("loading")
    
    try {
      await api.post(
        `/newsletter`, 
        { email, name }
      )
      
      setStatus("success")
      setEmail("")
      setName("")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to subscribe")
    }
  }

  const getButtonText = () => {
    switch (status) {
      case "loading":
        return (
          <span className="flex items-center justify-center">
            <Loader2 size={16} className="animate-spin mr-2" />
            Subscribing...
          </span>
        )
      case "success":
        return "Subscribed!"
      case "error":
        return "Failed to subscribe"
      default:
        return "Subscribe"
    }
  }

  const getButtonClass = () => {
    const baseClass = "px-4 py-2 text-white rounded-md transition-colors"
    
    switch (status) {
      case "success":
        return `${baseClass} bg-red-400 hover:bg-red-300`
      case "error":
        return `${baseClass} bg-red-900 hover:bg-red-700`
      default:
        return `${baseClass} bg-red-600 hover:bg-red-900`
    }
  }
  
  return (
    <footer className="bg-black text-slate-50 pt-16 pb-8">
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-md shadow-lg flex items-center justify-between"
          >
            <span>You have subscribed to newsletter!</span>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="mb-4">
              <Image 
                src="/logo2.png" 
                width={120} 
                height={60} 
                alt="Dreamway Holding Ltd Logo" 
                className="object-contain"
              />
            </div>
            <p className="text-slate-300 max-w-xs">
              Building dreams into reality with innovative construction solutions and sustainable development.
            </p>
            <div className="flex space-x-4 pt-4">
              {[
                { name: 'facebook', url: 'https://facebook.com/dreamwayhl' },
                { name: 'x', url: 'https://x.com/dreamwayhl' },
                { name: 'instagram', url: 'https://instagram.com/dreamwayhl' },
                { name: 'linkedin', url: 'https://www.linkedin.com/company/dreamwayhl' },
                { name: 'youtube', url: 'https://www.youtube.com/@dreamwayhl' }
              ].map((social, index) => (
                <motion.a
                        key={social.name}
                        href={social.url}
                        whileHover={{ y: -5, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        className="bg-gray-100 p-3 rounded-full hover:bg-blue-50 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image 
                          src={`/images/social/${social.name}.svg`} 
                          alt={social.name} 
                          width={24} 
                          height={24}
                        />
                      </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Properties", href: "/properties" },
               // { name: "Our Concern", href: "/our-concern" },
                { name: "Blogs", href: "/blog" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-slate-300 hover:text-white flex items-center group"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Contact Us</h3>
            <div className="space-y-3">
              <a href="tel:+8801911493434" className="flex items-center text-slate-300 hover:text-white transition-colors">
                <Phone size={16} className="mr-3 text-blue-400" />
                <span>+880 1911 493434</span>
              </a>
              <a href="mailto:info@dreamwayhl.com" className="flex items-center text-slate-300 hover:text-white transition-colors">
                <Mail size={16} className="mr-3 text-blue-400" />
                <span>info@dreamwayhl.com</span>
              </a>
              <div className="flex items-start text-slate-300">
                <MapPin size={16} className="mr-3 mt-1 text-blue-400 flex-shrink-0" />
                <span>Rupayan Shopping Square, Level-7 & 11, Plot-02, <br />
                Sayem Sobhan Anvir Road Bashundhara R/A, Dhaka-1229</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Newsletter</h3>
            <p className="text-slate-300 mb-4">Subscribe to our newsletter for updates</p>
            <form className="flex flex-col space-y-2" onSubmit={handleSubscribe}>
              <input 
                type="text" 
                placeholder="Your name" 
                className="px-4 py-2 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "loading" || status === "success"}
                required
              />
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-2 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                required
              />
              <button 
                type="submit" 
                className={getButtonClass()}
                disabled={status === "loading" || status === "success"}
              >
                {getButtonText()}
              </button>
              {status === "error" && (
                <p className="text-red-400 text-sm">{errorMessage || "Something went wrong. Please try again."}</p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Dreamway Holding Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

