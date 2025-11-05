import Image from "next/image";

interface GalleryProps {
  activeImage: string;
  images: string[];
  currentImageIndex: number;
  navigateImages: (dir: "next" | "prev") => void;
  handleThumbnailClick: (img: string, idx: number) => void;
}

export default function GallerySection({
  activeImage,
  images,
  currentImageIndex,
  navigateImages,
  handleThumbnailClick,
}: GalleryProps) {
  return (
    <div className="w-full md:w-2/3">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <div className="relative h-[450px] max-w-[800px] mx-auto">
          <Image
            src={activeImage || "/images/placeholder.jpg"}
            alt="Property"
            className="object-contain"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImages("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateImages("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center overflow-x-auto p-2 bg-gray-100 gap-2">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => handleThumbnailClick(img, i)}
                className={`w-24 h-16 cursor-pointer rounded-md overflow-hidden border-2 ${
                  currentImageIndex === i ? "border-red-600" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}