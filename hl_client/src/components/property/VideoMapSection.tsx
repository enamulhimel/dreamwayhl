import IframeMap from "@/components/IframeMap";

export default function VideoMapSection({ property }: { property: any }) {
  if (!property.video1 && !property.map_src) return null;

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-xl">
      <h3 className="text-2xl font-bold mb-6">Video & Location</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {property.video1 && (
          <div>
            <iframe
              src={property.video1.replace("watch?v=", "embed/")}
              className="w-full h-64 rounded-xl"
              allowFullScreen
            />
          </div>
        )}
        {property.map_src && (
          <div>
            <IframeMap mapSrc={property.map_src} fallbackAddress={property.address} />
          </div>
        )}
      </div>
    </div>
  );
}