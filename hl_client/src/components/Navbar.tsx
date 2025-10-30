"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Menu, X, Sun, Moon } from "lucide-react"
import Link from "next/link"

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Our Concern", href: "/concern" },
  { label: "News & Event", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Image src="/holdings-logo-png.png" width={70} height={80} alt="Logo" className="object-contain" />
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white hover:text-gray-200 transition-colors duration-200 px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50" onClick={toggleMenu} aria-hidden="true" />}

      <div
        className={`lg:hidden fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-black/95 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 51 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-white hover:bg-white/10 transition-colors duration-200"
              onClick={toggleMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

