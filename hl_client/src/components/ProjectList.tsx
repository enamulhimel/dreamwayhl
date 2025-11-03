"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react"
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion"
import axios from "axios"
import Link from "next/link"
import Image from 'next/image'
import api from '@/lib/api'

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
  const [projects, setProjects] = useState<Project[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mouseEventListenersRef = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(null)
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const preventClickRef = useRef(false)
  const dragStartedRef = useRef(false)
  // Add a ref to track pointer down position for robust click/drag separation
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  // Restore blobUrlCache ref
  const blobUrlCache = useRef<Map<string, string>>(new Map())
  const [direction, setDirection] = useState(0) // 1 for next, -1 for prev

  // Convert BLOB data to image URL with caching
  const getBlobImageUrl = useCallback((image: ProjectImage | null) => {
    if (!image || !image.data || !image.data.length) {
      return "/images/placeholder.jpg"
    }
    
    try {
      // Create a cache key from the image data
      const cacheKey = `${image.type}-${image.data.length}-${image.data[0]}-${image.data[image.data.length - 1]}`;
      
      // Check if we already have a URL for this image in our cache
      if (blobUrlCache.current.has(cacheKey)) {
        return blobUrlCache.current.get(cacheKey) as string;
      }
      
      // If not cached, create a new URL
      const uint8Array = new Uint8Array(image.data);
      const blob = new Blob([uint8Array], { type: image.type || 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      
      // Store it in the cache for future use
      blobUrlCache.current.set(cacheKey, url);
      
      return url;
    } catch (_) {
      return "/images/placeholder.jpg";
    }
  }, []);

  // Fetch projects from API
  useEffect(() => {
    let isMounted = true;
    
    // const fetchProjects = async () => {
    //   try {
    //     setLoading(true)
    //     const response = await api.get(`/properties?from_homepage=true`)
    //     if (isMounted) {
    //       setProjects(response.data)
    //       setError(null)
    //     }
    //   } catch (err) {
    //     if (isMounted) {
    //       setError("Failed to load projects. Please try again later.")
    //     }
    //   } finally {
    //     if (isMounted) {
    //       setLoading(false)
    //     }
    //   }
    // }
    const fetchProjects = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/properties?from_homepage=true`);

    // ---- NEW ----
    const data = Array.isArray(response.data) ? response.data : [];
    // ---- END ----

    if (isMounted) {
      setProjects(data);
      setError(null);
    }
  } catch (err: any) {
    console.error('API error:', err);
    if (isMounted) {
      setError(err?.response?.data?.message || 'Failed to load projects');
    }
  } finally {
    if (isMounted) setLoading(false);
  }
};

    fetchProjects()
    
    return () => {
      isMounted = false;
    }
  }, [])

  if (!projects?.length) {
  return (
    <div className="text-center text-gray-400 py-12">
      No projects available at the moment.
    </div>
  );
}

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all URLs we've created
      blobUrlCache.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlCache.current.clear();
    };
  }, []);

  // Auto-rotation functionality
  useEffect(() => {
    // Clear any existing timer
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }

    // Don't start auto-rotation if loading, error, no projects, or paused
    if (loading || error || projects.length === 0 || isPaused) {
      return;
    }

    // Prevent infinite loop by checking if we have enough items
    const maxIndex = Math.max(0, projects.length - itemsPerView);
    if (maxIndex <= 0) {
      return;
    }

    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex < maxIndex) {
          return prevIndex + 1;
        } else {
          // Loop back to the beginning
          return 0;
        }
      });
    }, 4000);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
    };
  }, [loading, error, projects.length, itemsPerView, isPaused]);

  // Update carousel width and items per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth)
      }
      
      if (window.innerWidth < 640) {
        setItemsPerView(1)
        setIsMobile(true)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
        setIsMobile(false)
      } else {
        setItemsPerView(3)
        setIsMobile(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Navigation functions
  const nextSlide = useCallback(() => {
    setIsPaused(true);
    const maxIndex = Math.max(0, projects.length - itemsPerView);
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + itemsPerView)
      setDirection(1)
    } else {
      setCurrentIndex(0)
      setDirection(1)
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, 5000);
  }, [currentIndex, projects.length, itemsPerView]);

  const prevSlide = useCallback(() => {
    setIsPaused(true);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - itemsPerView)
      setDirection(-1)
    } else {
      const maxIndex = Math.max(0, projects.length - itemsPerView);
      setCurrentIndex(maxIndex)
      setDirection(-1)
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, 5000);
  }, [currentIndex, projects.length, itemsPerView]);

  // Mouse/touch down: record pointer position
  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false)
    preventClickRef.current = false
    if ('touches' in e && e.touches.length > 0) {
      pointerDownPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if ('clientX' in e) {
      pointerDownPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsPaused(true);
    setIsDragging(true);
    dragStartedRef.current = true;
    preventClickRef.current = false;
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragStartedRef.current = false;
    const dragThreshold = 50; // Minimum drag distance in pixels to trigger a slide change
    if (Math.abs(info.offset.x) > dragThreshold) {
      preventClickRef.current = true;
      if (info.offset.x > 0) {
        if (isMobile) {
          prevSlide();
        } else {
          setIsPaused(true);
          const newIndex = Math.max(0, currentIndex - itemsPerView);
          setCurrentIndex(newIndex);
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }
          pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            pauseTimeoutRef.current = null;
          }, 5000);
        }
      } else {
        if (isMobile) {
          nextSlide();
        } else {
          setIsPaused(true);
          const maxIndex = Math.max(0, projects.length - itemsPerView);
          const newIndex = Math.min(maxIndex, currentIndex + itemsPerView);
          setCurrentIndex(newIndex);
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }
          pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            pauseTimeoutRef.current = null;
          }, 5000);
        }
      }
    } else {
      controls.start({ x: -currentIndex * (100 / itemsPerView) + '%', transition: { type: 'spring', stiffness: 300, damping: 30 } });
      preventClickRef.current = false;
    }
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
      touchTimeoutRef.current = null;
    }, 100);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, 5000);
  }, [currentIndex, isMobile, itemsPerView, projects.length, controls, nextSlide, prevSlide]);

  // Add a function to handle drag
  const handleDrag = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Mouse event handlers for desktop drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Handle mouse move logic here if needed
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      setIsPaused(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mouseEventListenersRef.current = null;
    };
    
    // Store references for cleanup
    mouseEventListenersRef.current = { move: handleMouseMove, up: handleMouseUp };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate the transform value for the carousel
  const transformValue = -currentIndex * (100 / itemsPerView) + '%';

  // Update controls when currentIndex changes, always use the same transition
  useEffect(() => {
    controls.start({ x: transformValue, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  }, [currentIndex, controls, transformValue]);

  // Get project status badge color
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-600';
    
    const normalizedStatus = status.trim().toLowerCase();
    
    if (normalizedStatus.includes('ready') || normalizedStatus.includes('flat')) {
      return 'bg-red-900';
    } else if (normalizedStatus.includes('under') || normalizedStatus.includes('construction')) {
      return 'bg-red-600';
    } else if (normalizedStatus.includes('land') || normalizedStatus.includes('share')) {
      return 'bg-red-400';
    } else {
      return 'bg-gray-600';
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup auto-rotate timer
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
      
      // Cleanup pause timeout
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      
      // Cleanup touch timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      // Cleanup mouse event listeners
      if (mouseEventListenersRef.current) {
        window.removeEventListener('mousemove', mouseEventListenersRef.current.move);
        window.removeEventListener('mouseup', mouseEventListenersRef.current.up);
      }
    };
  }, []);

  // Framer Motion variants for group slide in/out
  const groupVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: '0%',
      opacity: 1,
      transition: { x: { type: 'spring', stiffness: 300, damping: 30 } },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  // Calculate the current group of projects to show
  const maxIndex = Math.max(0, projects.length - itemsPerView)
  const slideIndex = Math.max(0, Math.min(currentIndex, maxIndex))
  const visibleProjects = projects.slice(slideIndex, slideIndex + itemsPerView)

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

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No projects available at the moment.
      </div>
    );
  }

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
        onMouseLeave={() => {
          if (!isDragging) {
            setIsPaused(false);
          }
        }}
        onMouseUp={handleMouseUp}
      >
        <div className="relative w-full min-h-[500px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={slideIndex}
              className="flex w-full absolute left-0 top-0"
              custom={direction}
              variants={groupVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              whileTap={{ cursor: 'grabbing' }}
              onDragEnd={(e, info) => {
                const dragThreshold = 50;
                if (info.offset.x < -dragThreshold) {
                  nextSlide();
                } else if (info.offset.x > dragThreshold) {
                  prevSlide();
                }
              }}
            >
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className={`flex-none w-full sm:w-1/2 lg:w-1/3 p-3`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    className="block"
                    onMouseDown={handleMouseDown}
                    onTouchStart={() => {
                      // For touch devices, don't set drag mode immediately
                      // It will be handled by the motion.div's drag handlers
                    }}
                    onTouchEnd={() => {
                      if (!isDragging) {
                        if (touchTimeoutRef.current) {
                          clearTimeout(touchTimeoutRef.current);
                        }
                        touchTimeoutRef.current = setTimeout(() => {
                          setIsDragging(false);
                          preventClickRef.current = false;
                          pointerDownPos.current = null;
                          touchTimeoutRef.current = null;
                        }, 10);
                      }
                    }}
                    style={{ userSelect: 'none' }}
                  >
                    <Link 
                      href={`/properties/${project.slug}`} 
                      onClick={(e) => {
                        // If a drag was detected, or pointer moved more than 10px, prevent click
                        let moved = false;
                        if (pointerDownPos.current) {
                          const eventX = (e as any).clientX || (e as any).pageX || 0;
                          const eventY = (e as any).clientY || (e as any).pageY || 0;
                          const dx = Math.abs(eventX - pointerDownPos.current.x);
                          const dy = Math.abs(eventY - pointerDownPos.current.y);
                          if (dx > 10 || dy > 10) moved = true;
                        }
                        if (preventClickRef.current || moved) {
                          e.preventDefault();
                          preventClickRef.current = false;
                        }
                        pointerDownPos.current = null;
                      }}
                      className="block"
                      draggable="false"
                      passHref
                      legacyBehavior={false}
                      onPointerDown={handlePointerDown}
                    >
                      <div className="bg-black rounded-xl overflow-hidden h-full transition-all duration-300 group border border-red-600/20 hover:border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]">
                        <div className="relative h-64 overflow-hidden">
                          <div className="absolute inset-0 bg-black/50 z-10">
                            <Image
                              src={getBlobImageUrl(project.img_thub)}
                              alt={project.name}
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              draggable="false"
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

      {/* Pagination indicators */}
      {!loading && !error && projects.length > itemsPerView && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(projects.length / itemsPerView) }).map((_, index) => {
            const isActive = index === Math.floor(slideIndex / itemsPerView)
            return (
              <button
                key={index}
                onClick={() => {
                  setIsPaused(true);
                  setCurrentIndex(index * itemsPerView);
                  setDirection(index * itemsPerView > slideIndex ? 1 : -1)
                  if (pauseTimeoutRef.current) {
                    clearTimeout(pauseTimeoutRef.current);
                  }
                  pauseTimeoutRef.current = setTimeout(() => {
                    setIsPaused(false);
                    pauseTimeoutRef.current = null;
                  }, 5000);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isActive 
                    ? "bg-red-600 w-6" 
                    : "bg-gray-500 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
