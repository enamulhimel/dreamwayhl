import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

export default function SimilarPropertiesSection({ similarProperties, getBlobImageUrl }: any) {
  if (!similarProperties.length) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {similarProperties.map((p: any) => (
          <Link key={p.id} href={`/properties/${p.slug}`} className="group">
            <div className="rounded-xl overflow-hidden border border-red-600/20 hover:border-red-600 shadow-lg">
              <div className="relative h-64">
                <Image
                  src={getBlobImageUrl(p.img_thub)}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-110 transition"
                />
                <div className="absolute bottom-4 left-4 flex items-center text-white">
                  <MapPin size={16} className="mr-1 text-red-600" />
                  <span className="text-sm">{p.location}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold group-hover:text-red-600">{p.name}</h3>
                <div className="flex justify-end mt-2">
                  <span className="text-red-600 text-sm flex items-center group-hover:translate-x-1 transition">
                    View Details <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}