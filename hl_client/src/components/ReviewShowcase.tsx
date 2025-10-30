import api from "@/lib/api";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import ReviewCard from "./ReviewCard";

interface ProcessedReview {
  id: number;
  name: string;
  imageUrl: string;
  review: string;
  projectName?: string;
  videoUrl?: string;
  title?: string;
}

interface NavigationButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}

const NavigationButton = ({
  direction,
  onClick,
  disabled,
}: NavigationButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`absolute top-1/2 transform -translate-y-1/2 z-10 
      ${direction === "prev" ? "-left-5 md:-left-10" : "-right-5 md:-right-10"} 
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 cursor-pointer"
      }`}
    aria-label={`${direction === "prev" ? "Previous" : "Next"} review`}
  >
    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
      {direction === "prev" ? (
        <ChevronLeft className="w-6 h-6 text-red-600" />
      ) : (
        <ChevronRight className="w-6 h-6 text-red-600" />
      )}
    </div>
  </button>
);

export default function ReviewShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reviews, setReviews] = useState<ProcessedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processReviews = (rawReviews: Record<string, unknown>[]) => {
      return rawReviews.map((review) => {
        let imageUrl = "/default-avatar.jpg"; // Fallback image

        // Check if image exists and has data
        if (
          review.image &&
          typeof review.image === "object" &&
          "data" in review.image &&
          Array.isArray(review.image.data)
        ) {
          // Convert array buffer to base64
          const uint8Array = new Uint8Array(review.image.data);
          const binaryString = uint8Array.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
          );
          const base64String = btoa(binaryString);

          // Determine MIME type or default to jpeg
          const mimeType =
            "type" in review.image && typeof review.image.type === "string"
              ? review.image.type
              : "image/jpeg";
          imageUrl = `data:${mimeType};base64,${base64String}`;
        }

        return {
          id: typeof review.id === "number" ? review.id : 0,
          name: typeof review.name === "string" ? review.name : "",
          imageUrl,
          review: typeof review.review === "string" ? review.review : "",
          projectName:
            typeof review.project_name === "string"
              ? review.project_name
              : undefined,
          videoUrl:
            typeof review.video_url === "string" ? review.video_url : undefined,
          title: typeof review.title === "string" ? review.title : undefined,
        };
      });
    };

    // For demo purposes, let's create some sample reviews if API fails
    const createSampleReviews = () => {
      return [
        {
          id: 1,
          name: "Aliur Rahman",
          imageUrl: "/testimonial-1.jpg",
          review:
            "We Choose Dreamway Holdings Ltd. for their long-term commitment towards client's expectation and their success rate of on time project handover. It was my best investment to stay safe & blessed with my family at one of the milestone projects of Dreamway Holdings Ltd. in the city so far.",
          projectName: "Flat Owner, BAshundhara I-Extention",
          title: "It was my best investment",
          videoUrl: "",
        },
      ];
    };

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/review`);

        const data = response.data;

        if (data && data.length > 0) {
          const processedReviews = processReviews(data);
          setReviews(processedReviews);
        } else {
          // Use sample reviews if API returns empty data
          setReviews(createSampleReviews());
        }
      } catch (_) {
        setReviews(createSampleReviews());
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();

    // Cleanup function
    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Add intersection observer for header animation
  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const headerRefCurrent = headerRef.current;

    if (headerRefCurrent) {
      headerObserver.observe(headerRefCurrent);
    }

    return () => {
      if (headerRefCurrent) {
        headerObserver.unobserve(headerRefCurrent);
      }
    };
  }, []);

  // Auto-rotation functionality - 3 seconds
  useEffect(() => {
    // Clear any existing timers
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    // Don't start auto-rotation if loading, error, or no reviews
    if (isLoading || error || reviews.length === 0) {
      return;
    }

    // Prevent infinite loop by checking if we have enough reviews
    if (reviews.length <= 1) {
      return;
    }

    // Start auto-rotation - always running regardless of pause state
    autoRotateTimerRef.current = setInterval(() => {
      if (!isPaused && !isDragging) {
        setDirection(1);
        setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
      }
    }, 3000);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [isLoading, error, reviews.length, isPaused, isDragging]);

  // Temporarily pause auto-rotation during user interaction
  const pauseAutoRotation = useCallback((duration = 3000) => {
    setIsPaused(true);

    // Clear any existing pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set a timeout to resume auto-rotation
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, duration);
  }, []);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    pauseAutoRotation();

    setCurrentIndex((prev) => {
      // Implement infinite loop - if at first review, go to last
      if (prev === 0) {
        return reviews.length - 1;
      }
      return prev - 1;
    });
  }, [reviews.length, pauseAutoRotation]);

  const goToNext = useCallback(() => {
    setDirection(1);
    pauseAutoRotation();

    setCurrentIndex((prev) => {
      // Implement infinite loop - if at last review, go to first
      if (prev === reviews.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  }, [reviews.length, pauseAutoRotation]);

  // Handle drag/swipe functionality
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    pauseAutoRotation(3000); // Shorter pause during drag
  }, [pauseAutoRotation]);

  const handleDragEnd = useCallback((
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    // Determine swipe direction based on drag distance and velocity
    if (info.offset.x < -50 || info.velocity.x < -0.5) {
      // Swiped left - go to next
      goToNext();
    } else if (info.offset.x > 50 || info.velocity.x > 0.5) {
      // Swiped right - go to previous
      goToPrevious();
    } else {
      // Not enough movement to trigger navigation
      pauseAutoRotation(1000); // Very short pause if no navigation
    }
  }, [goToNext, goToPrevious, pauseAutoRotation]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "5%" : "-5%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-5%" : "5%",
      opacity: 0,
    }),
  };

  // Get current review
  const currentReview = reviews[currentIndex];

  const handleCardHeightChange = (height: number) => {
    if (!cardHeight) {
      setCardHeight(height);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-stone-950 ">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-10" ref={headerRef}>
          <motion.div
            initial="hidden"
            animate={isHeaderVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative inline-block"
          >
            <h2
              className={`text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 font-[josefinSans] transform transition-all duration-700 ease-out
              ${
                isHeaderVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              What Our Customers Say
            </h2>
            <div
              className={`absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600 transform transition-all duration-700 ease-out origin-center
                ${isHeaderVisible ? "scale-x-100" : "scale-x-0"}`}
            ></div>
          </motion.div>
        </div>

        <div
          className="relative px-4 md:px-16"
          onMouseEnter={() => pauseAutoRotation(5000)}
          onMouseLeave={() => setIsPaused(false)}
          ref={carouselRef}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <NavigationButton
                direction="prev"
                onClick={goToPrevious}
                disabled={false}
              />

              <div
                className="w-full overflow-hidden"
                style={{ height: cardHeight ? `${cardHeight}px` : "auto" }}
              >
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="w-full touch-pan-y cursor-grab active:cursor-grabbing"
                  >
                    {currentReview && (
                      <ReviewCard
                        key={currentReview.id}
                        name={currentReview.name}
                        image={currentReview.imageUrl}
                        testimonial={currentReview.review}
                        projectName={currentReview.projectName}
                        videoUrl={currentReview.videoUrl}
                        title={currentReview.title}
                        onHeightChange={handleCardHeightChange}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <NavigationButton
                direction="next"
                onClick={goToNext}
                disabled={false}
              />

              {/* Pagination indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                      pauseAutoRotation(2000);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-red-600 w-6" : "bg-red-300"
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No reviews available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
