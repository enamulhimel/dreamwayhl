import { motion } from "framer-motion";


interface OverviewProps {
  property: Property;
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

export default function OverviewTab({ property }: OverviewProps) {
  const features = [
    { key: "beds", icon: "bed", label: "Bedrooms" },
    { key: "baths", icon: "bath", label: "Bathrooms" },
    { key: "balconies", icon: "balcony", label: "Balconies" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {features.map((f) => (
          (property as any)[f.key] !== undefined && (
            <motion.div
              key={f.key}
              className="bg-gray-50 p-4 rounded-lg text-center"
              whileHover={{ y: -5 }}
            >
              <h3 className="font-semibold">{f.label}</h3>
              <p className="text-lg">{(property as any)[f.key]}</p>
            </motion.div>
          )
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4">Description</h2>
      <p className="text-gray-700">
        {property.description || `Luxurious ${property.building_type} in ${property.location}.`}
      </p>
    </div>
  );
}