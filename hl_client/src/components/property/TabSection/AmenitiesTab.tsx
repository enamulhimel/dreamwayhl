export default function AmenitiesTab({ property }: { property: any }) {
  const amenities = Object.entries(property)
    .filter(([k]) => !["id", "name", "slug", "address", "description"].includes(k))
    .filter(([_, v]) => v === 0)
    .map(([k]) => k.replace(/_/g, " "));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {amenities.length > 0 ? (
        amenities.map((a) => (
          <div key={a} className="flex items-center">
            <span className="text-green-600 mr-2">Check</span>
            <span>{a}</span>
          </div>
        ))
      ) : (
        <p className="col-span-full text-gray-500">No amenities listed.</p>
      )}
    </div>
  );
}