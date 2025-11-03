// File path: app/[slug]/page.tsx
"use client";
import IframeMap from "@/components/IframeMap";
import Navbar from "@/components/Navbar2";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/footer";
import api from "@/lib/api";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// TypeScript interfaces
interface PropertyImage {
  type: string;
  data: number[];
}

interface Property {
  id: number;
  name: string;
  slug: string;
  img_thub: PropertyImage | null;
  img_hero: PropertyImage | null;
  img1: PropertyImage | null;
  img2: PropertyImage | null;
  img3: PropertyImage | null;
  img4: PropertyImage | null;
  img5: PropertyImage | null;
  video1: string;
  video2: string;
  video3: string;
  address: string;
  land_area: string;
  flat_size: string;
  building_type: string;
  project_status: string;
  location: string;
  map_src?: string;
  description?: string;
  price?: string;
  contact_info?: string;
  amenities?: string;
  agent_name?: string;
  agent_image?: PropertyImage | null;
  agent_number?: string;
  typical_floor_plan?: PropertyImage | null;
  ground_floor_plan?: PropertyImage | null;
  roof_floor_plan?: PropertyImage | null;
  "Car Parking"?: number;
  "Servant Bed"?: number;
  "Sub-station"?: number;
  Generator?: number;
  Elevator?: number;
  "CC Camera"?: number;
  "Conference Room"?: number;
  "Health Club"?: number;
  "Prayer Zone"?: number;
  "BBQ Zone"?: number;
  "Child Corner"?: number;
  Gardening?: number;
  "Swimming Pool"?: number;
  Fountain?: number;
  beds?: number;
  baths?: number;
  balconies?: number;
  drawing?: number;
  dining?: number;
  kitchen?: number;
  family_living?: number;
  servant_bed?: number;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  property_name: string;
}

export default function PropertyDetails() {
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

  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState<boolean>(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  // Add more states for UI interactions
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [activeFloorPlan, setActiveFloorPlan] = useState<string>("typical");
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageOrientation, setImageOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
    property_name: "",
  });
  const [buttonText, setButtonText] = useState<string>("Submit Booking");
  const router = useRouter();
  // Add a ref to cache blob URLs
  const blobUrlCache = useRef<Map<string, string>>(new Map());

  // Add this state to track the current image index
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
  if (!slug) return;

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sproperties?slug=${slug}`);
      const propertyData = Array.isArray(res.data) ? res.data[0] : null;
      
      if (!propertyData) throw new Error("Property not found");
      
      setProperty(propertyData);
      setBookingForm(prev => ({ ...prev, property_name: propertyData.name }));
    } catch (err) {
      console.error("Property fetch error:", err);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  fetchProperty();
}, [slug]);

  // Fetch similar properties
  useEffect(() => {
    if (!slug) return;

    const fetchSimilarProperties = async () => {
      try {
        const response = await api.get(`/similer`, {
          params: { slug, flat_size: property?.flat_size },
        });
        setSimilarProperties(response.data);
      } catch (_) {}
    };

    if (property) {
      fetchSimilarProperties();
    }
  }, [slug, property]);

  // Convert BLOB data to image URL
  const getBlobImageUrl = (img: PropertyImage | null): string => {
    if (!img || !img.data || !img.data.length) {
      return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e";
    }

    try {
      // Create a cache key from the image data
      const cacheKey = `${img.type || "image/jpeg"}-${img.data.length}-${
        img.data[0]
      }-${img.data[img.data.length - 1]}`;

      // Check if we already have a URL for this image in our cache
      if (blobUrlCache.current.has(cacheKey)) {
        return blobUrlCache.current.get(cacheKey) as string;
      }

      // Convert the array of numbers to a Uint8Array
      const uint8Array = new Uint8Array(img.data);
      // Create a blob from the Uint8Array
      const blob = new Blob([uint8Array], { type: "image/jpeg" });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Store it in the cache for future use
      blobUrlCache.current.set(cacheKey, url);

      return url;
    } catch (_) {
      return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e";
    }
  };

  // Modified function to get property images
  const getPropertyImages = (): string[] => {
    if (!property) return [];

    const images: string[] = [];

    if (property.img1) images.push(getBlobImageUrl(property.img1));
    if (property.img2) images.push(getBlobImageUrl(property.img2));
    if (property.img3) images.push(getBlobImageUrl(property.img3));
    if (property.img4) images.push(getBlobImageUrl(property.img4));
    if (property.img5) images.push(getBlobImageUrl(property.img5));

    return images;
  };

  // Updated navigation function using the index state
  const navigateImages = (direction: "next" | "prev") => {
    const images = getPropertyImages();
    if (images.length <= 1) return;

    let newIndex;
    if (direction === "next") {
      // Move to next image, loop back to first if at the end
      newIndex = (currentImageIndex + 1) % images.length;
    } else {
      // Move to previous image, loop to the last if at the beginning
      newIndex = (currentImageIndex - 1 + images.length) % images.length;
    }

    // Update both the index and active image
    setCurrentImageIndex(newIndex);
    setActiveImage(images[newIndex]);
  };

  // Update the useEffect to initialize the first image and index
  useEffect(() => {
    if (!slug) {
      router.push("/properties");
      return;
    }

    const fetchPropertyDetails = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/sproperties`, {
          params: { slug },
        });

        // The API returns an array, so we need to get the first item
        const propertyData =
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : null;

        if (!propertyData) {
          setProperty(null);
          setLoading(false);
          return;
        }

        setProperty(propertyData);
        setLoading(false);

        if (propertyData && propertyData.img1) {
          setActiveImage(getBlobImageUrl(propertyData.img1));
        }
      } catch (_: unknown) {
        setProperty(null);
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [slug, router]);

  // Update thumbnail gallery click handler
  const handleThumbnailClick = (image: string, index: number) => {
    setActiveImage(image);
    setCurrentImageIndex(index);
  };

  // Handle booking form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(`/visit`, bookingForm);

      if (response.data.message) {
        // Update only the button text
        setButtonText("Booked!");
        // Show success popup
        setShowPopup(true);

        // Reset the form after a delay
        setTimeout(() => {
          setBookingForm({
            name: "",
            email: "",
            phone: "",
            date: "",
            time: "",
            message: "",
            property_name: "",
          });
          // Reset button text
          setButtonText("Already Booked");
          // Close the modal
          setShowBookingModal(false);
        }, 1000);

        // Hide popup after 15 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 20000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert(
          error.response.data?.error ||
            "Failed to submit booking request. Please try again."
        );
      } else {
        alert("Failed to submit booking request. Please try again.");
      }
    }
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all created object URLs to avoid memory leaks
      blobUrlCache.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlCache.current.clear();
    };
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  };

  // Get property status badge color
  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-600";

    const normalizedStatus = status.trim().toLowerCase();

    if (
      normalizedStatus.includes("ready") ||
      normalizedStatus.includes("flat")
    ) {
      return "bg-red-900";
    } else if (
      normalizedStatus.includes("under") ||
      normalizedStatus.includes("construction")
    ) {
      return "bg-red-600";
    } else if (
      normalizedStatus.includes("land") ||
      normalizedStatus.includes("share")
    ) {
      return "bg-red-400";
    } else {
      return "bg-gray-600";
    }
  };

  // Add this function to determine image orientation
  const checkImageOrientation = (
    img: PropertyImage | null,
    callback: (orientation: "horizontal" | "vertical") => void
  ) => {
    if (!img || !img.data || !img.data.length) {
      callback("horizontal");
      return;
    }

    try {
      const uint8Array = new Uint8Array(img.data);
      const blob = new Blob([uint8Array], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      // Use window.Image instead of Image to avoid conflicts with Next.js Image component
      const image = new window.Image();

      image.onload = () => {
        // If width is greater than height, it's horizontal, otherwise vertical
        const orientation =
          image.width > image.height ? "horizontal" : "vertical";
        callback(orientation);
        URL.revokeObjectURL(url); // Clean up
      };

      image.onerror = () => {
        callback("horizontal"); // Default to horizontal on error
        URL.revokeObjectURL(url); // Clean up
      };

      image.src = url;
    } catch (_) {
      callback("horizontal"); // Default to horizontal on error
    }
  };

  // Update the floor plan button click handlers to check orientation
  const handleFloorPlanChange = (planType: string) => {
    setActiveFloorPlan(planType);

    // Check orientation of the selected floor plan
    if (property) {
      let selectedPlan: PropertyImage | null = null;

      if (planType === "typical" && property.typical_floor_plan) {
        selectedPlan = property.typical_floor_plan;
      } else if (planType === "ground" && property.ground_floor_plan) {
        selectedPlan = property.ground_floor_plan;
      } else if (planType === "roof" && property.roof_floor_plan) {
        selectedPlan = property.roof_floor_plan;
      }

      if (selectedPlan) {
        checkImageOrientation(selectedPlan, (orientation) => {
          setImageOrientation(orientation);
        });
      }
    }
  };

  // Update useEffect to check orientation of initial floor plan
  useEffect(() => {
    if (property && property.typical_floor_plan) {
      checkImageOrientation(property.typical_floor_plan, (orientation) => {
        setImageOrientation(orientation);
      });
    }
  }, [property]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The property you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/properties")}
            className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-800 transition-colors"
          >
            Back to Properties
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getPropertyImages();

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950">
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
            <span>Your booking request has been sent successfully!</span>
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
      <div id="hero" className="relative h-[60vh] bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src={getBlobImageUrl(property.img_hero)}
            alt="Hero Background"
            className="object-cover opacity-60"
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{property.name}</h1>
            <p className="text-xl">{property.address}</p>
          </div>
        </div>
      </div>

      {/* Property Details Hero */}
      <motion.div
        className="container mx-auto px-4 py-8 mt-8"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Gallery Section */}
          <div className="w-full md:w-2/3">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-[450px] max-w-[800px] mx-auto">
                <Image
                  src={
                    activeImage ||
                    (images.length > 0
                      ? images[0]
                      : "https://images.unsplash.com/photo-1441974231531-c6227db76b6e")
                  }
                  alt={property.name}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all z-10"
                      onClick={() => navigateImages("prev")}
                      aria-label="Previous image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all z-10"
                      onClick={() => navigateImages("next")}
                      aria-label="Next image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex justify-center overflow-x-auto p-2 bg-gray-100 dark:bg-neutral-900 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`w-24 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? "border-red-600"
                          : "border-transparent"
                      }`}
                      onClick={() => handleThumbnailClick(image, index)}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Property Information Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 h-full flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {property.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{property.address}</p>

                {property.price && (
                  <div className="bg-red-600 text-white text-lg font-bold p-2 rounded-md mb-4 text-center">
                    {property.price}
                  </div>
                )}

                {/* Agent Information */}
                <div className="border-t border-b border-gray-200 py-3 mt-3 mb-8">
                  <h3 className="text-base font-semibold mb-2">
                    Contact Agent
                  </h3>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-red-600">
                      {property.agent_image ? (
                        <Image
                          src={getBlobImageUrl(property.agent_image)}
                          alt="Property Agent"
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/48x48.png?text=Agent";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {property.agent_name || "Sabrina Meraj Rumpa"}
                      </h4>
                      <a
                        href={`tel:+880${
                          property.agent_number || "1911493434"
                        }`}
                        className="text-red-600 font-medium flex items-center text-base"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        +880 {property.agent_number || "171111111"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-neutral-900/90 p-2 md:p-4 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300 text-xs md:text-sm">
                      Land Area
                    </span>
                    <p className="font-semibold text-sm md:text-base">
                      {property.land_area}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900/90 p-2 md:p-4 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300 text-xs md:text-sm">
                      Flat Size
                    </span>
                    <p className="font-semibold text-sm md:text-base">
                      {property.flat_size}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900/90 p-2 md:p-4 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300 text-xs md:text-sm">
                      Building Type
                    </span>
                    <p className="font-semibold text-sm md:text-base">
                      {property.building_type}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900/90 p-2 md:p-4 rounded-md">
                    <span className="text-gray-500 dark:text-gray-300 text-xs md:text-sm">
                      Status
                    </span>
                    <p className="font-semibold text-sm md:text-base text-green-600">
                      {property.project_status}
                    </p>
                  </div>
                </div>

                {property.contact_info && (
                  <div className="bg-gray-100 p-3 rounded-md mb-4 text-sm">
                    <h3 className="font-bold text-base mb-1">
                      Contact Information
                    </h3>
                    <p>{property.contact_info}</p>
                  </div>
                )}
              </div>

              <motion.button
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-800 transition-colors font-bold text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBookingModal(true)}
              >
                Book a Visit
              </motion.button>
            </div>
          </div>
        </div>

        {/* Property Details Tabs */}
        <div className="mt-12 mb-16">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === "overview"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === "amenities"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("amenities")}
              >
                Amenities
              </button>
              <button
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-lg ${
                  activeTab === "location"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("location")}
              >
                Floor Plan
              </button>
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === "overview" && (
              <div className="bg-white dark:bg-black/90 rounded-lg shadow-lg p-6">
                {/* Feature Cards */}
                <div className="w-full mb-8">
                  {/* Calculate total number of visible feature cards */}
                  {(() => {
                    const visibleCards = [
                      property.beds !== undefined,
                      property.baths !== undefined,
                      property.balconies !== undefined,
                      property.drawing === 0,
                      property.dining === 0,
                      property.kitchen !== undefined,
                      property.family_living === 0,
                      property.servant_bed === 0,
                    ].filter(Boolean).length;

                    // Determine column class based on number of cards
                    const getColClass = () => {
                      if (visibleCards === 7) return "lg:grid-cols-7";
                      if (visibleCards === 6) return "lg:grid-cols-6";
                      if (visibleCards === 5) return "lg:grid-cols-5";
                      if (visibleCards === 4) return "lg:grid-cols-4";
                      return "lg:grid-cols-8"; // Default for 8 or more cards
                    };

                    return (
                      <div
                        className={`grid grid-cols-2 ${getColClass()} gap-4`}
                      >
                        {/* Beds Card */}
                        {property.beds !== undefined && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Bedrooms
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                              {property.beds}
                            </p>
                          </motion.div>
                        )}

                        {/* Baths Card */}
                        {property.baths !== undefined && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Bathrooms
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                              {property.baths}
                            </p>
                          </motion.div>
                        )}

                        {/* Balconies Card */}
                        {property.balconies !== undefined && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Balconies
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                              {property.balconies}
                            </p>
                          </motion.div>
                        )}

                        {/* Drawing Room Card - Only show if drawing is 0 */}
                        {property.drawing === 0 && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="currentColor"
                              height="40px"
                              width="40px"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 60 60"
                              xmlSpace="preserve"
                            >
                              <g>
                                <path d="M40.949,12h-2.512c-2.483,0-4.639,1.683-5.241,4.093L31.72,22H52.28l-1.477-5.907C50.201,13.683,48.046,12,45.563,12 h-2.613C42.436,5.299,36.83,0,30,0h-7C13.075,0,5,8.075,5,18v36H0v6h12v-6H7V18C7,9.178,14.178,2,23,2h7 C35.728,2,40.442,6.402,40.949,12z" />
                                <path d="M57.486,27h-2.973C53.128,27,52,28.128,52,29.514v0.515c-3.355,0.284-6,3.101-6,6.528V39H34.1c-1.709,0-3.1,1.391-3.1,3.1 V57h2v3h6v-3h13v3h6v-3h2V41v-2v-9.486C60,28.128,58.872,27,57.486,27z M48,36.557c0-2.324,1.749-4.247,4-4.522V39h-4V36.557z" />
                              </g>
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Drawing Room
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Available</p>
                          </motion.div>
                        )}

                        {/* Dining Room Card - Only show if dining is 0 */}
                        {property.dining === 0 && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              className="h-8 w-8 text-red-600 mb-2"
                              width="800px"
                              height="800px"
                              viewBox="0 0 421.4 421.4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                            >
                              <g>
                                <path
                                  d="M148.003,223.375h-41.436l-2.515,22h32.95v22.5h-35.521l-2.514,22h38.036v33.5c0,6.075,4.925,11,11,11
                                  c6.075,0,11-4.925,11-11v-89C159.003,228.3,154.078,223.375,148.003,223.375z"
                                />
                                <path
                                  d="M43.212,245.375h25.613l2.515-22H42.954c-0.614-15.8-2.131-32.399-4.557-49.771c-6.301-45.118-16.46-78.109-16.889-79.491
                                  c-1.802-5.802-7.968-9.043-13.768-7.242c-5.802,1.802-9.044,7.966-7.242,13.768c0.399,1.286,39.585,129.617,9.092,219.192
                                  c-1.958,5.751,1.117,12,6.868,13.958c1.175,0.4,2.37,0.59,3.546,0.59c4.579,0,8.855-2.882,10.412-7.458
                                  c3.909-11.483,6.927-23.844,9.053-37.045h24.27l2.515-22H42.123C42.726,260.596,43.085,253.091,43.212,245.375z"
                                />
                                <path
                                  d="M413.66,86.87c-5.803-1.805-11.966,1.439-13.768,7.242c-0.429,1.382-10.588,34.373-16.889,79.491
                                  c-2.426,17.372-3.943,33.972-4.557,49.771h-28.386l2.515,22h25.613c0.127,7.716,0.486,15.221,1.089,22.5h-24.131l2.514,22h24.271
                                  c2.126,13.201,5.144,25.561,9.053,37.045c1.558,4.576,5.832,7.458,10.412,7.458c1.175,0,2.372-0.189,3.546-0.59
                                  c5.751-1.958,8.826-8.207,6.868-13.958c-30.428-89.381,8.637-217.72,9.092-219.192C422.705,94.836,419.462,88.672,413.66,86.87z"
                                />
                                <path
                                  d="M284.397,267.875v-22.5h32.95l-2.515-22h-41.435c-6.075,0-11,4.925-11,11v89c0,6.075,4.925,11,11,11s11-4.925,11-11v-33.5
                                  h38.035l-2.514-22H284.397z"
                                />
                                <path
                                  d="M336.587,162.727h8.612c9.391,0,17.003-7.611,17.003-17c0-9.391-7.612-17.004-17.003-17.004H76.201
                                  c-9.391,0-17.002,7.613-17.002,17.004c0,9.389,7.611,17,17.002,17h8.612L66.521,322.778c-0.69,6.036,3.644,11.488,9.68,12.178
                                  c6.038,0.696,11.488-3.644,12.178-9.68l18.577-162.55h207.488l18.577,162.55c0.641,5.612,5.399,9.752,10.915,9.752
                                  c0.417,0,0.839-0.023,1.263-0.072c6.036-0.689,10.37-6.142,9.68-12.178L336.587,162.727z"
                                />
                              </g>
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Dining Room
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Available</p>
                          </motion.div>
                        )}

                        {/* Kitchen Card */}
                        {property.kitchen !== undefined && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Kitchen
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                              {property.kitchen === 0
                                ? "Big Kitchen"
                                : "Available"}
                            </p>
                          </motion.div>
                        )}

                        {/* Family Living Card - Only show if family_living is 0 */}
                        {property.family_living === 0 && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Family Living
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Available</p>
                          </motion.div>
                        )}

                        {/* Servant Bed Card - Only show if servant_bed is 0 */}
                        {property.servant_bed === 0 && (
                          <motion.div
                            className="col-span-1 lg:col-span-1 bg-gray-50 dark:bg-neutral-950/90 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
                            whileHover={{
                              y: -5
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-red-600 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Servant Bedroom
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Available</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  Property Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {property.description ||
                    `This is an amazing property located in ${property.location}. It features a beautiful ${property.building_type} building with a total area of ${property.land_area}. 
                   The flat size is ${property.flat_size}. The property is currently ${property.project_status}.
                   
                   Contact us today to schedule a viewing or for more information about this exceptional property.`}
                </p>
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="bg-white dark:bg-black/90 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Property Amenities</h2>
                {property.amenities ? (
                  <p className="text-gray-700">{property.amenities}</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      // Create a dynamic list of amenities based on the property object
                      const amenitiesList = Object.entries(property)
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .filter(([key, _value]) => {
                          // Only include fields that are amenities (not part of the basic property info)
                          const basicFields = [
                            "id",
                            "name",
                            "slug",
                            "img_thub",
                            "img_hero",
                            "img1",
                            "img2",
                            "img3",
                            "img4",
                            "img5",
                            "video1",
                            "address",
                            "land_area",
                            "flat_size",
                            "building_type",
                            "project_status",
                            "location",
                            "map_src",
                            "description",
                            "price",
                            "contact_info",
                            "amenities",
                            "typical_floor_plan",
                          ];
                          return !basicFields.includes(key) && key !== "test";
                        })
                        .map(([key, _value]) => ({
                          name: key,
                          value: _value,
                        }));

                      // Show only amenities with value 0
                      const filteredAmenities = amenitiesList.filter(
                        (amenityItem) => {
                          return amenityItem.value === 0;
                        }
                      );

                      if (filteredAmenities.length === 0) {
                        return (
                          <div className="col-span-full text-gray-500 italic">
                            No amenities information available
                          </div>
                        );
                      }

                      return filteredAmenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>{amenity.name}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === "location" && (
              <div className="bg-white dark:bg-black/90 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Floor Plan</h2>

                {(!property.typical_floor_plan ||
                  !property.typical_floor_plan.data ||
                  property.typical_floor_plan.data.length === 0) &&
                (!property.ground_floor_plan ||
                  !property.ground_floor_plan.data ||
                  property.ground_floor_plan.data.length === 0) &&
                (!property.roof_floor_plan ||
                  !property.roof_floor_plan.data ||
                  property.roof_floor_plan.data.length === 0) ? (
                  <div className="bg-gray-100 dark:bg-black/90 rounded-lg p-8">
                    <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mb-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        No Floor Plans Available
                      </p>
                      <p className="text-sm mt-2 text-center">
                        Floor plans for this property have not been uploaded
                        yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-4 space-x-4">
                      <button
                        onClick={() => handleFloorPlanChange("typical")}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          activeFloorPlan === "typical"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Typical Floor
                      </button>
                      <button
                        onClick={() => handleFloorPlanChange("ground")}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          activeFloorPlan === "ground"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Ground Floor
                      </button>
                      <button
                        onClick={() => handleFloorPlanChange("roof")}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          activeFloorPlan === "roof"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Roof Floor
                      </button>
                    </div>

                    <div className="bg-gray-100 dark:bg-black/90 rounded-lg overflow-hidden">
                      {activeFloorPlan === "typical" &&
                        (property.typical_floor_plan &&
                        property.typical_floor_plan.data &&
                        property.typical_floor_plan.data.length > 0 ? (
                          <div
                            className={`relative ${
                              imageOrientation === "horizontal"
                                ? "h-[800px]"
                                : "h-[600px] max-w-md mx-auto"
                            }`}
                          >
                            <Image
                              src={getBlobImageUrl(property.typical_floor_plan)}
                              alt="Typical Floor Plan"
                              className="object-contain"
                              fill
                              sizes="(max-width: 768px) 100vw, 66vw"
                            />
                          </div>
                        ) : (
                          <div className="h-96 flex items-center justify-center text-gray-500">
                            <p>Typical floor plan not available</p>
                          </div>
                        ))}

                      {activeFloorPlan === "ground" &&
                        (property.ground_floor_plan &&
                        property.ground_floor_plan.data &&
                        property.ground_floor_plan.data.length > 0 ? (
                          <div
                            className={`relative ${
                              imageOrientation === "horizontal"
                                ? "h-[800px]"
                                : "h-[600px] max-w-md mx-auto"
                            }`}
                          >
                            <Image
                              src={getBlobImageUrl(property.ground_floor_plan)}
                              alt="Ground Floor Plan"
                              className="object-contain"
                              fill
                              sizes="(max-width: 768px) 100vw, 66vw"
                            />
                          </div>
                        ) : (
                          <div className="h-96 flex items-center justify-center text-gray-500">
                            <p>Ground floor plan not available</p>
                          </div>
                        ))}

                      {activeFloorPlan === "roof" &&
                        (property.roof_floor_plan &&
                        property.roof_floor_plan.data &&
                        property.roof_floor_plan.data.length > 0 ? (
                          <div
                            className={`relative ${
                              imageOrientation === "horizontal"
                                ? "h-[800px]"
                                : "h-[600px] max-w-md mx-auto"
                            }`}
                          >
                            <Image
                              src={getBlobImageUrl(property.roof_floor_plan)}
                              alt="Roof Floor Plan"
                              className="object-contain"
                              fill
                              sizes="(max-width: 768px) 100vw, 66vw"
                            />
                          </div>
                        ) : (
                          <div className="h-96 flex items-center justify-center text-gray-500">
                            <p>Roof floor plan not available</p>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Section (if available) - Moved outside to take full width */}
        {property.video1 && (
          <div className="mt-8 bg-gray-50 dark:bg-neutral-950 p-6 rounded-xl shadow-sm w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2">
              Property Video & Location
            </h3>

            {/* Video and Map in 50/50 layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Section */}
              <div className="group transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden w-full">
                <div className="relative w-full pb-[56.25%]">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    src={property.video1.replace("watch?v=", "embed/")}
                    title="Property Tour"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="bg-white dark:bg-black/90 p-3 border-t border-red-600">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Property Tour</h4>
                </div>
              </div>

              {/* Map Section */}
              <div className="group transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden w-full">
                <div className="relative w-full pb-[56.25%]">
                  {property && (
                    <div className="absolute top-0 left-0 w-full h-full">
                      <IframeMap
                        mapSrc={property.map_src || ""}
                        fallbackAddress={property.address}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-white dark:bg-black/90 p-3 border-t border-red-600">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Property Location
                  </h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Properties Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((similarProperty) => (
              <motion.div
                key={similarProperty.id}
                className="rounded-xl overflow-hidden h-full transition-all duration-300 group border border-red-600/20 hover:border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]"
                whileHover={{ y: -5 }}
              >
                <Link href={`/properties/${similarProperty.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0">
                      <Image
                        src={getBlobImageUrl(similarProperty.img_thub)}
                        alt={similarProperty.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.jpg";
                        }}
                        fill
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                          similarProperty.project_status
                        )}`}
                      >
                        {similarProperty.project_status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center text-white">
                      <MapPin size={16} className="mr-1 text-red-600" />
                      <span className="text-sm">
                        {similarProperty.location || similarProperty.address}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-black">
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-red-600 transition-colors">
                      {similarProperty.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-xs uppercase">Size</div>
                        <div className="text-black dark:text-white">
                          {similarProperty.flat_size}
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-xs uppercase">Land Area</div>
                        <div className="text-black dark:text-white">
                          {similarProperty.land_area}
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-xs uppercase">Building Type</div>
                        <div className="text-black dark:text-white">
                          {similarProperty.building_type}
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-xs uppercase">Address</div>
                        <div className="text-black dark:text-white truncate">
                          {similarProperty.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <span className="inline-flex items-center text-red-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Button (Hidden over Hero Section) */}
      <div
        className={`fixed bottom-5 right-5 transition-opacity duration-300 ${
          showWhatsApp ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <WhatsAppButton />
      </div>

      {/* Booking Visit Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white dark:bg-stone-950 rounded-lg w-full max-w-md overflow-hidden shadow-xl border border-red-300 dark:border-red-400"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              <div className="bg-red-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Book a Visit</h3>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm mt-1">
                  Fill out the form below to book a visit to {property.name}
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="p-6">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={bookingForm.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Preferred Time
                    </label>
                    <select
                      id="time"
                      name="time"
                      value={bookingForm.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                      required
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
                  >
                    Additional Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={bookingForm.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-red-400 dark:border-red-400 rounded-md bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 h-24"
                    placeholder="Any specific questions or requirements?"
                  ></textarea>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition-colors"
                  >
                    {buttonText}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
