import Image from "next/image";

interface HeroProps {
  property: Property;
  getBlobImageUrl: (img: any) => string;
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

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  property_name: string;
};


export default function HeroSection({ property, getBlobImageUrl }: HeroProps) {
  return (
    <div id="hero" className="relative h-[60vh] bg-gray-900">
      <div className="absolute inset-0">
        <Image
          src={getBlobImageUrl(property.img_hero)}
          alt={property.name}
          className="object-cover opacity-60"
          fill
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">{property.name}</h1>
          <p className="text-xl">{property.address}</p>
        </div>
      </div>
    </div>
  );
}