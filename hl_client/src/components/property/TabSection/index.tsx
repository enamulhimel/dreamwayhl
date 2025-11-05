import { useState } from "react";
import OverviewTab from "./OverviewTab";
import AmenitiesTab from "./AmenitiesTab";
import FloorPlanTab from "./FloorPlanTab";

export default function TabsSection({ property, getBlobImageUrl }: any) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="mt-12">
      <nav className="flex border-b">
        {["overview", "amenities", "floor plan"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`mr-8 py-4 px-1 border-b-2 ${tab === t ? "border-red-600 text-red-600" : "text-gray-500"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      <div className="mt-8 p-6 bg-white rounded-lg">
        {tab === "overview" && <OverviewTab property={property} />}
        {tab === "amenities" && <AmenitiesTab property={property} />}
        {tab === "floor plan" && <FloorPlanTab property={property} getBlobImageUrl={getBlobImageUrl} />}
      </div>
    </div>
  );
}