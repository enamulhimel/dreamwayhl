import Navbar from "@/components/Navbar2";
import Footer from "@/components/footer";

export default function LoadingSkeleton() {
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