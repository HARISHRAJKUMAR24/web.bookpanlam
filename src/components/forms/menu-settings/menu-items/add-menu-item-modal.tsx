"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AddMenuItemModal({ onClose }: Props) {
  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-xl shadow-lg flex flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Add Menu Item</h2>
              <p className="text-sm text-gray-500">
                Fill in the details below to add a new menu item
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Product Information</h3>

                <input
                  className="w-full border rounded px-4 py-2"
                  placeholder="Item Name (e.g. Butter Chicken)"
                />

                <textarea
                  className="w-full border rounded px-4 py-2"
                  rows={3}
                  placeholder="Item description"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select className="border rounded px-3 py-2">
                    <option>Select Menu</option>
                    <option>North Indian Delights</option>
                  </select>

                  <select className="border rounded px-3 py-2">
                    <option>Select Category</option>
                    <option>Main Course</option>
                  </select>
                </div>

                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  placeholder="Preparation Time (mins)"
                />

                <input type="file" />
              </div>

              {/* RIGHT */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Pricing Details</h3>

                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  placeholder="Base Price"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  Has Variations
                </label>

                <div className="border rounded p-3 space-y-3">
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Variation Name (Small / Medium)"
                  />
                  <input
                    type="number"
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Price"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border rounded"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded">
              Save Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
