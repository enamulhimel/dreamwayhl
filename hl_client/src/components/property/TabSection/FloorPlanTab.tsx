import Image from "next/image";
import { useState } from "react";

type FloorKey = "typical" | "ground" | "roof";

export default function FloorPlanTab({
  property,
  getBlobImageUrl,
}: {
  property: any;
  getBlobImageUrl: any;
}) {
  const [active, setActive] = useState<FloorKey>("typical");

  const plans: Record<FloorKey, any> = {
    typical: property.typical_floor_plan,
    ground: property.ground_floor_plan,
    roof: property.roof_floor_plan,
  };

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        {Object.keys(plans).map((k) => {
          const key = k as FloorKey;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-2 rounded ${
                active === key ? "bg-red-600 text-white" : "bg-gray-200"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} Floor
            </button>
          );
        })}
      </div>

      {plans[active] ? (
        <div className="relative h-96">
          <Image
            src={getBlobImageUrl(plans[active])}
            alt=""
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <p className="text-center text-gray-500">Not available</p>
      )}
    </div>
  );
}
