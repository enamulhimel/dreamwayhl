import Image from "next/image";


interface InfoProps {
  property: Property;
  getBlobImageUrl: (img: any) => string;
  setShowBookingModal: (show: boolean) => void;
}

type PropertyImage = {
  type: string;
  data: number[];
};

type Property = {
  id: number;
  name: string;
  slug: string;
  img_thub: PropertyImage | null;
  img_hero: PropertyImage | null;
  img1: PropertyImage | null;
  img2: PropertyImage | null;
  img3: PropertyImage | null;
  img4: PropertyImage | null;
  img5: PropertyImage | null;
  video1: string;
  video2: string;
  video3: string;
  address: string;
  land_area: string;
  flat_size: string;
  building_type: string;
  project_status: string;
  location: string;
  map_src?: string;
  description?: string;
  price?: string;
  contact_info?: string;
  amenities?: string;
  agent_name?: string;
  agent_image?: PropertyImage | null;
  agent_number?: string;
  typical_floor_plan?: PropertyImage | null;
  ground_floor_plan?: PropertyImage | null;
  roof_floor_plan?: PropertyImage | null;
  "Car Parking"?: number;
  "Servant Bed"?: number;
  "Sub-station"?: number;
  Generator?: number;
  Elevator?: number;
  "CC Camera"?: number;
  "Conference Room"?: number;
  "Health Club"?: number;
  "Prayer Zone"?: number;
  "BBQ Zone"?: number;
  "Child Corner"?: number;
  Gardening?: number;
  "Swimming Pool"?: number;
  Fountain?: number;
  beds?: number;
  baths?: number;
  balconies?: number;
  drawing?: number;
  dining?: number;
  kitchen?: number;
  family_living?: number;
  servant_bed?: number;
};

export default function InfoSideBar({ property, getBlobImageUrl, setShowBookingModal }: InfoProps) {
  return (
    <div className="w-full md:w-1/3">
      <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 h-full flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-3">{property.name}</h1>
          <p className="text-gray-600 mb-3 text-sm">{property.address}</p>
          {property.price && (
            <div className="bg-red-600 text-white text-lg font-bold p-2 rounded-md mb-4 text-center">
              {property.price}
            </div>
          )}
          {/* Agent */}
          <div className="border-t border-b py-3 mb-8">
            <h3 className="font-semibold mb-2">Contact Agent</h3>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-red-600">
                {property.agent_image ? (
                  <Image
                    src={getBlobImageUrl(property.agent_image)}
                    alt="Agent"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold">{property.agent_name || "Agent"}</h4>
                <a href={`tel:${property.agent_number}`} className="text-red-600">
                  +880 {property.agent_number || "1711111111"}
                </a>
              </div>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["land_area", "flat_size", "building_type", "project_status"].map((key) => (
              <div key={key} className="bg-gray-50 p-2 rounded-md">
                <span className="text-xs text-gray-500 uppercase">{key.replace("_", " ")}</span>
                <p className="font-semibold">{(property as any)[key]}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-800 font-bold"
        >
          Book a Visit
        </button>
      </div>
    </div>
  );
}