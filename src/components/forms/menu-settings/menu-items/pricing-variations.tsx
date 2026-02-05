"use client";

export default function PricingVariations() {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h3 className="font-semibold text-orange-600">
        🟠 Pricing Details
      </h3>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" />
        Has Variations
      </label>

      {/* VARIATION CARD */}
      <div className="border rounded-lg p-4 space-y-3">
        <p className="font-medium">Variation 1</p>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Variation Name (Small, Medium)"
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Price"
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Order Type Pricing</p>
          <input
            placeholder="Dine In Price"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            placeholder="Pickup Price"
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <input
          placeholder="Base Delivery Price"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button className="border rounded px-4 py-2 w-full text-sm">
        + Add Variation
      </button>
    </div>
  );
}
