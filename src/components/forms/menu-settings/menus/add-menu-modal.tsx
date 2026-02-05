"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
}

export default function AddMenuModal({
  onClose,
  onSave,
  initialName = "",
  title = "Add Menu",
}: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100"
        onKeyDown={handleKeyDown}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 pb-4 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter a descriptive name for your menu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Menu Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Eg: North Indian Delights, Summer Specials, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200"
              autoFocus
            />
            {!name.trim() && (
              <p className="text-xs text-gray-400 mt-2">
                This name will be displayed to your customers
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              name.trim()
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save Menu
          </button>
        </div>
      </div>
    </div>
  );
}