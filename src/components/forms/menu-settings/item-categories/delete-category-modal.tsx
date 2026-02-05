"use client";

import { X, Trash2 } from "lucide-react";

export interface Props {
  name: string;
  itemsCount: number;     // ✅ ADD THIS
  onClose: () => void;
  onConfirm: () => Promise<void>;
  processing: boolean;
}


export default function DeleteCategoryModal({
  name,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">
            Delete Category
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <p className="text-sm text-gray-600">
          Are you sure you want to delete
          <span className="font-semibold text-gray-900">
            {" "}
            {name}
          </span>
          ?
        </p>

        <p className="text-xs text-red-500 mt-2">
          This action cannot be undone.
        </p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
