"use client";

import Navbar from "@/components/Navbar2";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/footer";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Mail, MapPin, Phone, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Simplified approach without complex TypeScript definitions
export default function Contact() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [buttonState, setButtonState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setButtonState("loading");

    try {
      await api.post(`/contact`, formData);

      setButtonState("success");
      setShowPopup(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset button state after 3 seconds
      setTimeout(() => {
        setButtonState("idle");
      }, 3000);

      // Hide popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    } catch (_) {
      setButtonState("error");

      // Reset error state after 3 seconds
      setTimeout(() => {
        setButtonState("idle");
      }, 3000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      {/* Notification Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-md shadow-lg flex items-center justify-between"
          >
            <span>Your message has been sent successfully!</span>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-[50vh] md:h-[60vh] bg-black overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/properties/property-hero.jpg"
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
              Contact Us
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

      <main className="pt-20">
        {/* Contact Section */}
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Fill out the form and our team will get back to you as soon
                    as possible. You can also reach us directly using the
                    contact information below.
                  </p>
                </div>

                <div className="space-y-6">
                  <ContactItem
                    icon={<MapPin className="h-6 w-6 text-red-600" />}
                    title="Our Office"
                    content={
                      <div className=" text-gray-600 dark:text-gray-300">
                        Rupayan Shopping Square, Level-7 & 11, Plot-02, <br />
                        Sayem Sobhan Anvir Road Bashundhara R/A, Dhaka-1229
                      </div >
                    }
                    delay={0.1}
                  />

                  <ContactItem
                    icon={<Phone className="h-6 w-6 text-red-600" />}
                    title="Phone"
                    content={
                      <>
                        <a
                          href="tel:+8801911493434"
                          className="hover:text-blue-600 transition-colors dark:text-gray-300"
                        >
                          +880 1911 493434
                        </a>
                        <br />
                      </>
                    }
                    delay={0.2}
                  />

                  <ContactItem
                    icon={<Mail className="h-6 w-6 text-red-600" />}
                    title="Email"
                    content={
                      <a
                        href="mailto:info@dreamwayhl.com"
                        className="hover:text-blue-600 transition-colors dark:text-gray-300"
                      >
                        info@dreamwayhl.com
                      </a>
                    }
                    delay={0.3}
                  />

                  <ContactItem
                    icon={<Clock className="h-6 w-6 text-red-600" />}
                    title="Working Hours"
                    content={
                      <div className=" text-gray-600 dark:text-gray-300">
                        Saturday - Thursday : 10:00 AM - 6:00 PM
                        <br />
                      </div>
                    }
                    delay={0.4}
                  />
                </div>

                <div className="pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Follow Us</h3>
                  <div className="flex space-x-4">
                    {[
                      {
                        name: "facebook",
                        url: "https://facebook.com/dreamwayhl",
                      },
                      { name: "x", url: "https://x.com/dreamwayhl" },
                      {
                        name: "instagram",
                        url: "https://instagram.com/dreamwayhl",
                      },
                      {
                        name: "linkedin",
                        url: "https://www.linkedin.com/company/dreamwayhl",
                      },
                      {
                        name: "youtube",
                        url: "https://www.youtube.com/@dreamwayhl",
                      },
                    ].map((social, index) => (
                      <motion.a
                        key={social.name}
                        href={social.url}
                        whileHover={{ y: -5, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-gray-100 dark:bg-white p-3 rounded-full hover:bg-blue-50 dark:hover:bg-red-600 transition-colors"
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
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-stone-950 rounded-xl shadow-xl p-8 border border-red-300 dark:border-red-400"
              >
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-red-400 dark:border-red-400 bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-red-400 dark:border-red-400 bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-red-400 dark:border-red-400 bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-red-400 dark:border-red-400 bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-red-400 dark:border-red-400 bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: buttonState === "idle" ? 1.02 : 1 }}
                    whileTap={{ scale: buttonState === "idle" ? 0.98 : 1 }}
                    type="submit"
                    disabled={buttonState === "loading"}
                    className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                      buttonState === "loading"
                        ? "bg-red-400"
                        : buttonState === "success"
                        ? "bg-red-400"
                        : buttonState === "error"
                        ? "bg-red-900"
                        : "bg-red-600 hover:bg-red-800"
                    }`}
                  >
                    {buttonState === "loading" ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending Message...
                      </>
                    ) : buttonState === "success" ? (
                      <>
                        <svg
                          className="h-5 w-5 mr-2 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Message Sent Successfully!
                      </>
                    ) : buttonState === "error" ? (
                      <>
                        <svg
                          className="h-5 w-5 mr-2 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Failed to Send Message
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-gray-50 dark:bg-black">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-xl overflow-hidden shadow-lg h-[400px] relative"
            >
              {/* Standard Google Map with styled InfoWindow */}
              <div className="w-full h-full relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.875748801565!2d90.4268904744735!3d23.82301698598626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70062b52b27%3A0x18476397bcc6d65d!2sDreamway%20Holdings%20Ltd.!5e0!3m2!1sen!2sbd!4v1741605364430!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </section>

        <style jsx global>{`
          .custom-marker-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            pointer-events: none;
          }

          .marker-content {
            font-size: 14px;
            background-color: #dc2626; /* Tailwind's red-600 */
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            border: 2px solid white;
          }
        `}</style>

        {/* WhatsApp Button (Hidden over Hero Section) */}
        <div
          className={`fixed bottom-5 right-5 transition-opacity duration-300 ${
            showWhatsApp ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <WhatsAppButton />
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface ContactItemProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  delay?: number;
}

function ContactItem({ icon, title, content, delay = 0 }: ContactItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start space-x-4"
    >
      <div className="flex-shrink-0 bg-blue-50 p-3 rounded-full">{icon}</div>
      <div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <div className="text-gray-600 dark:text-gray-300">{content}</div>
      </div>
    </motion.div>
  );
}
