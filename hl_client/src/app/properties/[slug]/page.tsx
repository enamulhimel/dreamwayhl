"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import Navbar from "@/components/Navbar2";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/footer";
import LoadingSkeleton from "@/components/property/LoadingSkeleton";
import NotFound from "@/components/property/NotFound";
import HeroSection from "@/components/property/HeroSection";
import GallerySection from "@/components/property/GallerySection";
import TabsSection from "@/components/property/TabSection";
import VideoMapSection from "@/components/property/VideoMapSection";
import SimilarPropertiesSection from "@/components/property/SimilarPropertiesSection";
import BookingModal from "@/components/property/BookingModal";
import InfoSidebar from "@/components/property/InfoSideBar";



export default function PropertyDetails() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", phone: "", date: "", time: "", message: "", property_name: "" });
  const [buttonText, setButtonText] = useState("Submit Booking");
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const blobUrlCache = useRef<Map<string, string>>(new Map());
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch property
  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sproperties?slug=${slug}`);
        const data = res.data[0];
        if (!data) throw new Error("Not found");
        setProperty(data);
        setBookingForm(prev => ({ ...prev, property_name: data.name }));
        if (data.img1) setActiveImage(getBlobImageUrl(data.img1));
      } catch (err: any) {
        if (err.response?.status === 401) router.push("/");
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug, router]);

  // Similar
  useEffect(() => {
    if (!property) return;
    api.get(`/similer`, { params: { slug, flat_size: property.flat_size } })
      .then(res => setSimilarProperties(res.data))
      .catch(() => {});
  }, [property]);

  const getBlobImageUrl = (img: any): string => {
  if (!img) return "";

  const key = JSON.stringify(img);

  // ✅ return cached
  if (blobUrlCache.current.has(key)) {
    return blobUrlCache.current.get(key)!;
  }

  // Convert buffer to Blob
  const blob = new Blob([new Uint8Array(img.data)], {
    type: img.type || "image/jpeg",
  });

  const url = URL.createObjectURL(blob);

  // Cache the URL
  blobUrlCache.current.set(key, url);

  return url; // ✅ MUST RETURN STRING
};

  const getPropertyImages = (): string[] => {
  const imgs = [
    property.img1,
    property.img2,
    property.img3,
    property.img4,
    property.img5,
    property.img_thub,
    property.img_hero,
  ];

  return imgs
    .filter((i: any) => i)
    .map((i: any) => getBlobImageUrl(i)); // ✅ must return string[]
};
  const navigateImages = (dir: "next" | "prev") => { /* same */ };
  const handleThumbnailClick = (img: string, i: number) => { setActiveImage(img); setCurrentImageIndex(i); };
  const handleBookingSubmit = async (e: any) => { /* same */ };

  if (loading) return <LoadingSkeleton />;
  if (!property) return <NotFound />;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      <HeroSection property={property} getBlobImageUrl={getBlobImageUrl} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <GallerySection
            activeImage={activeImage}
            images={getPropertyImages()}
            currentImageIndex={currentImageIndex}
            navigateImages={navigateImages}
            handleThumbnailClick={handleThumbnailClick}
          />
          <InfoSidebar property={property} getBlobImageUrl={getBlobImageUrl} setShowBookingModal={setShowBookingModal} />
        </div>
        <TabsSection property={property} getBlobImageUrl={getBlobImageUrl} />
      </div>
      <VideoMapSection property={property} />
      <SimilarPropertiesSection similarProperties={similarProperties} getBlobImageUrl={getBlobImageUrl} />
      <div className={`fixed bottom-5 right-5 ${showWhatsApp ? "opacity-100" : "opacity-0"} transition`}>
        <WhatsAppButton />
      </div>
      <BookingModal
        show={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bookingForm={bookingForm}
        handleInputChange={(e: any) => setBookingForm({ ...bookingForm, [e.target.name]: e.target.value })}
        handleSubmit={handleBookingSubmit}
        buttonText={buttonText}
      />
      <Footer />
    </div>
  );
}