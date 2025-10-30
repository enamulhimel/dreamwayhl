"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  //{ label: "Our Concern", href: "/our-concern" },
  { label: "Blogs", href: "/blog" },
  { 
    label: "About", 
    href: "/about",
    dropdown: [
      { label: "Why Dreamway", href: "/about/why-dreamway" },
      { label: "About Us", href: "/about" }
    ]
  },
  { label: "Contact", href: "/contact" },
];

// Pages that have hero sections
const pagesWithHero = ["/", "/about", "/properties", "/contact", "/blog", "/about/why-dreamway"];

// Add this new component before the Navbar component
const DropdownMenu = ({ items, isActive }: { items: { label: string; href: string }[], isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`absolute top-full left-0 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-sm ${
        isActive ? "block" : "hidden"
      }`}
    >
      <div className="py-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default function Navbar({
  forceStickyBg = false,
}: { forceStickyBg?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Check if current page has a hero section
  const hasHeroSection =
    pagesWithHero.includes(pathname) || pathname.startsWith("/properties/");

  // Pages that should always have a semi-transparent background
  const alwaysShowBg = ["/our-concern", "/news-events"].includes(pathname);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme')
    
    // Check system preference if no saved theme
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(systemPrefersDark)
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark')
      }
    } else if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Add listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches)
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
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

  useEffect(() => {
    if (forceStickyBg) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      if (hasHeroSection) {
        const heroSection = document.getElementById("hero");
        if (heroSection) {
          const heroRect = heroSection.getBoundingClientRect();
          setIsScrolled(heroRect.bottom <= 80);
        } else {
          setIsScrolled(window.scrollY > 10);
        }
      } else {
        // For pages without hero, don't change on scroll
        setIsScrolled(alwaysShowBg);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [hasHeroSection, alwaysShowBg, pathname, forceStickyBg]);

  // Set initial state for pages that should always show background
  useEffect(() => {
    if (alwaysShowBg || forceStickyBg) {
      setIsScrolled(true);
    }
  }, [alwaysShowBg, forceStickyBg]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const handleMobileDropdownClick = (label: string) => {
    setOpenMobileDropdown(openMobileDropdown === label ? null : label);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    // Also close dropdown when menu closes or route changes
    setOpenMobileDropdown(null);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 dark:bg-black/90 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/">
              <Image
                src="/logo2.png"
                width={80}
                height={80}
                alt="Logo"
                className="object-contain"
              />
            </Link>
          </motion.div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.dropdown && item.dropdown.some(d => d.href === pathname));

              return (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 group"
                  >
                    <span
                      className={`text-white text-sm font-medium transition-colors duration-200 ${
                        isActive ? "text-red-400" : "group-hover:text-red-600"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"
                      />
                    )}
                  </Link>
                  {item.dropdown && (
                    <div className="hidden group-hover:block">
                      <DropdownMenu items={item.dropdown} isActive={true} />
                    </div>
                  )}
                </div>
              );
            })}

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/contact"
              className="mr-6 px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Get in Touch
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="relative w-14 h-7 rounded-full bg-gray-600 dark:bg-slate-900 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={{
                  x: darkMode ? 28 : 0,
                  scale: darkMode ? 1.2 : 1
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4 text-yellow-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="relative w-14 h-7 rounded-full bg-gray-600 dark:bg-slate-900 transition-colors duration-200 ml-4"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={{
                  x: darkMode ? 28 : 0,
                  scale: darkMode ? 1.2 : 1
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-gray-800 dark:bg-slate-900 flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="moon-mobile"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4 text-yellow-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun-mobile"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-white lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed top-0 right-0 h-screen w-64 bg-black/95 dark:bg-black z-50 overflow-y-auto"
          >
            <div className="flex justify-start px-2 pt-2">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-white"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="px-2 pt-4 pb-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.dropdown && item.dropdown.some(d => d.href === pathname));

                return (
                  <div key={item.label}>
                    {item.dropdown ? (
                      // Render clickable item to toggle dropdown
                      <button
                        onClick={() => handleMobileDropdownClick(item.label)}
                        className={`flex justify-between items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? "text-red-600 bg-red-900/20" : "text-white hover:text-red-400 hover:bg-white/5"}`}
                      >
                        <span>{item.label}</span>
                        {/* Optional: Add an arrow icon to indicate dropdown */}
                      </button>
                    ) : (
                      // Render normal Link for items without dropdown
                      <Link
                        href={item.href}
                        className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${isActive ? "text-red-600 bg-red-900/20" : "text-white hover:text-red-400 hover:bg-white/5"}`}
                      >
                        {item.label}
                      </Link>
                    )}
                    {// Conditionally render dropdown items if the current item's dropdown is open
                    item.dropdown && openMobileDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 overflow-hidden"
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.label}
                            href={dropdownItem.href}
                            className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${pathname === dropdownItem.href ? "text-red-600 bg-red-900/20" : "text-white hover:text-red-600 hover:bg-white/5"}`}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 mt-4 border-t border-white/10">
                <a
                  href="/contact"
                  className="block w-full text-center px-4 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
