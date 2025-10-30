import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ReviewCardProps {
  name: string;
  image: string;
  testimonial: string;
  projectName?: string;
  videoUrl?: string;
  title?: string;
  onHeightChange?: (height: number) => void;
}

export default function ReviewCard({
  name,
  image,
  testimonial,
  projectName,
  videoUrl,
  title,
  onHeightChange,
}: ReviewCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && onHeightChange) {
      const height = cardRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col md:flex-row w-full max-w-6xl mx-auto rounded-lg overflow-hidden"
    >
      {/* Left side - Video/Image */}
      <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[400px] flex items-center justify-center">
        {videoUrl ? (
          <>
            {!isVideoPlaying ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${name}'s profile`}
                  width={194}
                  height={242}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 text-red-600 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <iframe
                  src={`${videoUrl}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Image
              src={image || "/placeholder.svg"}
              alt={`${name}'s profile`}
              width={194}
              height={242}
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-light text-red-600 mb-6">
            {title}
          </h2>
        )}

        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-8">
          {testimonial}
        </p>

        <div className="mt-auto">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {name}
          </h3>
          {projectName && (
            <p className="text-gray-600 dark:text-gray-300">{projectName}</p>
          )}

          {/* Pagination dots */}
          <div className="flex space-x-2 mt-6">
            <div className="w-20 h-1 bg-red-600"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
