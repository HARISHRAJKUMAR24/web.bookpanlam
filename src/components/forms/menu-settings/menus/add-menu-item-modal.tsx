"use client";

import AddMenuItemForm from "../menu-items/add-menu-item-form";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddMenuItemModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Add Menu Item</h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to add a new menu item.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <AddMenuItemForm onClose={onClose} />
      </div>
    </div>
  );
}
