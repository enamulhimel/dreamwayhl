import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar2";
import Footer from "@/components/footer";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you are looking for does not exist or has been removed.</p>
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