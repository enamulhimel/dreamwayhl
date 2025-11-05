"use client";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

interface ProjectImage {
  type: string;
  data: number[];
}

interface Project {
  id: number;
  name: string;
  slug: string;
  img_thub: ProjectImage | null;
  img2: ProjectImage | null;
  img3: ProjectImage | null;
  img4: ProjectImage | null;
  img5: ProjectImage | null;
  video1: string;
  video2: string;
  address: string;
  land_area: string;
  flat_size: string;
  building_type: string;
  project_status: string;
  location: string;
}

export default function ProjectList() {
  /* ============================= ALL HOOKS AT TOP ============================= */
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseEventListenersRef = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(null);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const preventClickRef = useRef(false);
  const dragStartedRef = useRef(false);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const blobUrlCache = useRef<Map<string, string>>(new Map());
  const [direction, setDirection] = useState(0);

  /* ----------------------- BLOB IMAGE URL (cached) ----------------------- */
  const getBlobImageUrl = useCallback((image: ProjectImage | null) => {
    if (!image?.data?.length) return "/images/placeholder.jpg";

    const cacheKey = `${image.type}-${image.data.length}-${image.data[0]}-${image.data[image.data.length - 1]}`;
    if (blobUrlCache.current.has(cacheKey)) return blobUrlCache.current.get(cacheKey)!;

    const uint8Array = new Uint8Array(image.data);
    const blob = new Blob([uint8Array], { type: image.type || "image/jpeg" });
    const url = URL.createObjectURL(blob);
    blobUrlCache.current.set(cacheKey, url);
    return url;
  }, []);

  /* -------------------------- FETCH PROJECTS -------------------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/properties?from_homepage=true`);
        const data = Array.isArray(response.data) ? response.data : [];

        if (isMounted) {
          setProjects(data);
          setError(null);
        }
      } catch (err: any) {
        console.error("API error:", err);
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load projects");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------------- CLEANUP BLOB URLS ---------------------- */
  useEffect(() => {
    return () => {
      blobUrlCache.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlCache.current.clear();
    };
  }, []);

  /* ---------------------- AUTO ROTATION ---------------------- */
  useEffect(() => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }

    if (loading || error || projects.length === 0 || isPaused) return;

    const maxIndex = Math.max(0, projects.length - itemsPerView);
    if (maxIndex <= 0) return;

    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 4000);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
    };
  }, [loading, error, projects.length, itemsPerView, isPaused]);

  /* ---------------------- RESIZE HANDLER ---------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }

      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
        setIsMobile(true);
      } else if (width < 1024) {
        setItemsPerView(2);
        setIsMobile(false);
      } else {
        setItemsPerView(3);
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------------- UPDATE ANIMATION ---------------------- */
  useEffect(() => {
    const transformValue = -currentIndex * (100 / itemsPerView) + "%";
    controls.start({
      x: transformValue,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  }, [currentIndex, itemsPerView, controls]);

  /* ---------------------- FINAL CLEANUP ---------------------- */
  useEffect(() => {
    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (mouseEventListenersRef.current) {
        window.removeEventListener("mousemove", mouseEventListenersRef.current.move);
        window.removeEventListener("mouseup", mouseEventListenersRef.current.up);
      }
    };
  }, []);

  /* ============================= NAVIGATION ============================= */
  const nextSlide = useCallback(() => {
    setIsPaused(true);
    const maxIndex = Math.max(0, projects.length - itemsPerView);
    const newIndex = currentIndex < maxIndex ? currentIndex + itemsPerView : 0;
    setCurrentIndex(newIndex);
    setDirection(1);

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, 5000);
  }, [currentIndex, projects.length, itemsPerView]);

  const prevSlide = useCallback(() => {
    setIsPaused(true);
    const newIndex = currentIndex > 0 ? currentIndex - itemsPerView : Math.max(0, projects.length - itemsPerView);
    setCurrentIndex(newIndex);
    setDirection(-1);

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, 5000);
  }, [currentIndex, projects.length, itemsPerView]);

  /* ============================= DRAG HANDLERS ============================= */
  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false);
    preventClickRef.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as any).clientY;
    pointerDownPos.current = { x: clientX, y: clientY };
  };

  const handleDragStart = useCallback(() => {
    setIsPaused(true);
    setIsDragging(true);
    dragStartedRef.current = true;
    preventClickRef.current = false;
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      dragStartedRef.current = false;
      const threshold = 50;
      if (Math.abs(info.offset.x) > threshold) {
        preventClickRef.current = true;
        if (info.offset.x > 0) {
          isMobile ? prevSlide() : setCurrentIndex(Math.max(0, currentIndex - itemsPerView));
        } else {
          isMobile ? nextSlide() : setCurrentIndex(Math.min(projects.length - itemsPerView, currentIndex + itemsPerView));
        }
      } else {
        controls.start({ x: -currentIndex * (100 / itemsPerView) + "%", transition: { type: "spring", stiffness: 300, damping: 30 } });
      }

      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
        touchTimeoutRef.current = null;
      }, 100);

      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        pauseTimeoutRef.current = null;
      }, 5000);
    },
    [currentIndex, isMobile, itemsPerView, projects.length, controls, nextSlide, prevSlide]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const move = () => {};
    const up = () => {
      setIsDragging(false);
      setIsPaused(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      mouseEventListenersRef.current = null;
    };
    mouseEventListenersRef.current = { move, up };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, []);

  /* ============================= STATUS COLOR ============================= */
  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-600";
    const s = status.trim().toLowerCase();
    if (s.includes("ready") || s.includes("flat")) return "bg-red-900";
    if (s.includes("under") || s.includes("construction")) return "bg-red-600";
    if (s.includes("land") || s.includes("share")) return "bg-red-400";
    return "bg-gray-600";
  };

  /* ============================= CALCULATIONS ============================= */
  const maxIndex = Math.max(0, projects.length - itemsPerView);
  const slideIndex = Math.max(0, Math.min(currentIndex, maxIndex));
  const visibleProjects = projects.slice(slideIndex, slideIndex + itemsPerView);

  /* ============================= EARLY RETURNS (AFTER ALL HOOKS) ============================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/20 text-white p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No projects available at the moment.
      </div>
    );
  }

  /* ============================= RENDER ============================= */
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Our Properties
        </motion.h2>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="p-2 rounded-full bg-red-600/20 text-white hover:bg-red-600/30 transition-colors"
            aria-label="Previous project"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="p-2 rounded-full bg-red-600/20 text-white hover:bg-red-600/30 transition-colors"
            aria-label="Next project"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>

      <div
        className="overflow-hidden touch-pan-y"
        ref={carouselRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => !isDragging && setIsPaused(false)}
      >
        <div className="relative w-full min-h-[500px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={slideIndex}
              className="flex w-full absolute left-0 top-0"
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                center: { x: "0%", opacity: 1 },
                exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              whileTap={{ cursor: "grabbing" }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className={`flex-none w-full sm:w-1/2 lg:w-1/3 p-3`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div onMouseDown={handleMouseDown} style={{ userSelect: "none" }}>
                    <Link
                      href={`/properties/${project.slug}`}
                      onClick={(e) => {
                        let moved = false;
                        if (pointerDownPos.current) {
                          const dx = Math.abs(e.clientX - pointerDownPos.current.x);
                          const dy = Math.abs(e.clientY - pointerDownPos.current.y);
                          if (dx > 10 || dy > 10) moved = true;
                        }
                        if (preventClickRef.current || moved) {
                          e.preventDefault();
                          preventClickRef.current = false;
                        }
                        pointerDownPos.current = null;
                      }}
                      onPointerDown={handlePointerDown}
                      className="block"
                      draggable={false}
                    >
                      <div className="bg-black rounded-xl overflow-hidden h-full transition-all duration-300 group border border-red-600/20 hover:border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]">
                        <div className="relative h-64 overflow-hidden">
                          <div className="absolute inset-0">
                            <Image
                              src={getBlobImageUrl(project.img_thub)}
                              alt={project.name}
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-20"></div>
                          <div className="absolute top-4 right-4 z-30">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.project_status)}`}>
                              {project.project_status}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 flex items-center text-white z-30">
                            <MapPin size={16} className="mr-1 text-red-600" />
                            <span className="text-sm">{project.location}</span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-600 transition-colors">
                            {project.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-gray-400">
                              <div className="text-xs uppercase">Size</div>
                              <div className="text-white">{project.flat_size}</div>
                            </div>
                            <div className="text-gray-400">
                              <div className="text-xs uppercase">Land Area</div>
                              <div className="text-white">{project.land_area}</div>
                            </div>
                            <div className="text-gray-400">
                              <div className="text-xs uppercase">Building Type</div>
                              <div className="text-white">{project.building_type}</div>
                            </div>
                            <div className="text-gray-400">
                              <div className="text-xs uppercase">Address</div>
                              <div className="text-white truncate">{project.address}</div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <span className="inline-flex items-center text-red-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                              View Details <ArrowRight size={16} className="ml-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination */}
      {projects.length > itemsPerView && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(projects.length / itemsPerView) }).map((_, index) => {
            const isActive = index === Math.floor(slideIndex / itemsPerView);
            return (
              <button
                key={index}
                onClick={() => {
                  setIsPaused(true);
                  setCurrentIndex(index * itemsPerView);
                  setDirection(index * itemsPerView > slideIndex ? 1 : -1);
                  if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
                  pauseTimeoutRef.current = setTimeout(() => {
                    setIsPaused(false);
                    pauseTimeoutRef.current = null;
                  }, 5000);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${isActive ? "bg-red-600 w-6" : "bg-gray-500 hover:bg-gray-400"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}