"use client";
import Navbar from "@/components/Navbar2";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/footer";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  img1: PropertyImage | null;
  img2: PropertyImage | null;
  img3: PropertyImage | null;
  img4: PropertyImage | null;
  img5: PropertyImage | null;
  video1: string;
  video2: string;
  address: string;
  land_area: string;
  flat_size: string;
  building_type: string;
  project_status: string;
  location: string;
}

// Animation variants
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },
};

// Helper component for the property card
const PropertyCard = ({
  property,
  getBlobImageUrl,
}: {
  property: Property;
  getBlobImageUrl: (img: PropertyImage | null) => string;
}) => {
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

  return (
    <motion.div
      className="rounded-xl overflow-hidden h-full transition-all duration-300 group border border-red-600/20 hover:border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]"
      variants={animations.item}
    >
      <Link href={`/properties/${property.slug}`}>
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={getBlobImageUrl(property.img_thub)}
              alt={property.name}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.jpg";
              }}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent "></div>
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                property.project_status
              )}`}
            >
              {property.project_status}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center text-white">
            <MapPin size={16} className="mr-1 text-red-600" />
            <span className="text-sm">
              {property.location || property.address}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-black">
          <h3 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-red-600 transition-colors">
            {property.name}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-gray-600 dark:text-gray-300">
              <div className="text-xs uppercase">Size</div>
              <div className="text-black dark:text-white">{property.flat_size}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              <div className="text-xs uppercase">Land Area</div>
              <div className="text-black dark:text-white">{property.land_area}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              <div className="text-xs uppercase">Building Type</div>
              <div className="text-black dark:text-white">{property.building_type}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              <div className="text-xs uppercase">Address</div>
              <div className="text-black dark:text-white truncate">{property.address}</div>
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
  );
};

const PropertiesClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "default",
    status: searchParams.get("status") || "default",
    search: searchParams.get("search") || "",
  });

  // Cache for blob URLs to avoid recreation on re-renders
  const blobUrlCache = useRef<Map<string, string>>(new Map());

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.location !== "default") {
      params.append("location", filters.location);
    }

    if (filters.status !== "default") {
      params.append("status", filters.status);
    }

    if (filters.search.trim()) {
      params.append("search", filters.search);
    }

    const queryString = params.toString();
    const url = `/properties${queryString ? `?${queryString}` : ""}`;

    // Update URL without reloading the page
    router.push(url, { scroll: false });
  }, [filters, router]);

  // Fetch properties based on filters
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location !== "default") {
        params.append("location", filters.location);
      }
      if (filters.status !== "default") {
        params.append("project_status", filters.status);
      }

      const queryString = params.toString();
      const url = `/properties${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      console.log(response)
      setProperties(response.data);
      setFilteredProperties(response.data);
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoading(false);
      setError("Failed to load properties. Please try again later.");
    }
  }, [filters.location, filters.status]);

  // Initial data fetch
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter properties by search text
  useEffect(() => {
    if (!filters.search.trim()) {
      setFilteredProperties(properties);
      return;
    }

    const normalizedQuery = filters.search.trim().toLowerCase();
    const filtered = properties.filter((property) =>
      property.name.toLowerCase().includes(normalizedQuery)
    );

    setFilteredProperties(filtered);
  }, [filters.search, properties]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Handle filter changes
  const handleFilterChange = (type: "location" | "status", value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Convert BLOB data to image URL with caching
  const getBlobImageUrl = (img: PropertyImage | null): string => {
    if (!img || !img.data || !img.data.length) {
      return "/images/placeholder.jpg";
    }

    try {
      const cacheKey = `${img.type}-${img.data.length}-${img.data[0]}-${
        img.data[img.data.length - 1]
      }`;

      if (blobUrlCache.current.has(cacheKey)) {
        return blobUrlCache.current.get(cacheKey) as string;
      }

      const uint8Array = new Uint8Array(img.data);
      const blob = new Blob([uint8Array], { type: img.type || "image/jpeg" });
      const url = URL.createObjectURL(blob);

      blobUrlCache.current.set(cacheKey, url);

      return url;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "/images/placeholder.jpg";
    }
  };

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlCache.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlCache.current.clear();
    };
  }, []);

  const [showWhatsApp, setShowWhatsApp] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />

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

        <div className="absolute inset-0 flex items-center justify-center text-white ">
          <motion.div
            className="text-center px-4 w-full max-w-3xl"
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
              Our Properties
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              এক সাথে জমি কিনি, নিজের বাড়ি নিজেই গড়ি
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearchSubmit}
              className="relative max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for projects..."
                  className="w-full px-6 py-3 text-black dark:text-gray-300 bg-white/95 dark:bg-neutral-900/95 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-red-600 pl-12"
                  value={filters.search}
                  onChange={handleSearchChange}
                  aria-label="Search properties"
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Properties Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our Properties
            </motion.h2>

            <motion.div
              className="mt-4 md:mt-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="hidden sm:block mr-3 text-gray-700 dark:text-gray-300 font-medium">
                  Filter By:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div>
                    <span className="block mb-2 sm:hidden text-gray-700 dark:text-gray-300 font-medium">
                      Filter By:
                    </span>
                    <select
                      className="w-full px-4 py-2 border-2 border-red-600 rounded-none focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-gray-300 bg-white dark:bg-neutral-900/95"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      aria-label="Filter by location"
                    >
                      <option value="default">Location</option>
                      <option value="Bashundhara">Bashundhara</option>
                      <option value="Jolshiri">Jolshiri</option>
                    </select>
                  </div>

                  <div>
                    <select
                      className="w-full px-4 py-2 border-2 border-red-600 rounded-none focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-gray-300 bg-white dark:bg-neutral-900/95"
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      aria-label="Filter by project status"
                    >
                      <option value="default">Project Status</option>
                      <option value="Ready Flat">Ready Flat</option>
                      <option value="Under Construction">
                        Under Construction
                      </option>
                      <option value="Land Share">Land Share</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-600/20 text-black p-4 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={animations.container}
              initial="hidden"
              animate="visible"
            >
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    getBlobImageUrl={getBlobImageUrl}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 py-10">
                  No properties found.
                </div>
              )}
            </motion.div>
          )}
        </section>
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
};

// Wrap the component with Suspense to fix the build error
const Properties: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <PropertiesClient />
    </Suspense>
  );
};

export default Properties;
