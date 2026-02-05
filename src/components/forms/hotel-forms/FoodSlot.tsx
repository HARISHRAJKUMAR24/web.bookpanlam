"use client";

import { useState, useCallback, ChangeEvent, useRef } from "react";

type FoodItem = {
  food: string;
  price: string;
  quantityValue: number | "";
  quantityUnit: "pcs" | "kg" | "g" | "litre" | "plates" | "members";
  unavailable: boolean;
  image?: File | null;
  imagePreview?: string;
};

export type SlotData = {
  slotName: string;
  items: FoodItem[];
};

interface FoodSlotProps {
  onRemove?: () => void;
  onSave?: (data: SlotData) => void;
  initialData?: Partial<SlotData>;
}

export default function FoodSlot({ 
  onRemove, 
  onSave, 
  initialData 
}: FoodSlotProps) {
  const [slotName, setSlotName] = useState(initialData?.slotName || "");
  const [items, setItems] = useState<FoodItem[]>(
    initialData?.items?.length 
      ? initialData.items.map(item => ({
          ...item,
          imagePreview: item.image ? URL.createObjectURL(item.image) : undefined
        }))
      : [createEmptyItem()]
  );
  const [validationError, setValidationError] = useState<string>("");

  function createEmptyItem(): FoodItem {
    return {
      food: "",
      price: "",
      quantityValue: 1,
      quantityUnit: "pcs",
      unavailable: false,
      image: null,
      imagePreview: undefined,
    };
  }

  const addFoodItem = useCallback(() => {
    setItems(prev => [...prev, createEmptyItem()]);
    setValidationError("");
  }, []);

  const updateItem = useCallback((
    index: number,
    key: keyof FoodItem,
    value: FoodItem[keyof FoodItem]
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  }, []);

  const handleImageUpload = useCallback((index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItems(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            image: file,
            imagePreview: reader.result as string
          };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    } else {
setItems(prev => {
  const updated = [...prev];

  // Safe optional chaining → no more TS errors
  if (updated[index]?.imagePreview?.startsWith("blob:")) {
    URL.revokeObjectURL(updated[index]!.imagePreview!);
  }

  updated[index] = {
    ...updated[index],
    image: null,
    imagePreview: undefined
  };

  return updated;
});

    }
  }, []);

  const removeItem = useCallback((index: number) => {
    if (items.length <= 1) {
      setValidationError("At least one food item is required");
      return;
    }
    // Clean up image preview URL before removing
    if (items[index].imagePreview && items[index].imagePreview!.startsWith('blob:')) {
      URL.revokeObjectURL(items[index].imagePreview!);
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  }, [items]);

const validateForm = (): boolean => {
  if (!slotName.trim()) {
    setValidationError("Please enter a slot name");
    return false;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.food.trim()) {
      setValidationError(`Food name is required for item ${i + 1}`);
      return false;
    }

    const price = parseFloat(item.price);
    if (isNaN(price) || price < 0) {
      setValidationError(`Valid price is required for "${item.food}"`);
      return false;
    }

    if (item.quantityValue === "" || Number(item.quantityValue) < 1) {
      setValidationError(`Valid quantity is required for "${item.food}"`);
      return false;
    }
  }

  setValidationError("");
  return true;
};


  const handleSave = () => {
    if (!validateForm()) return;

    const slotData: SlotData = {
      slotName: slotName.trim(),
      items: items.map(item => {
        const { imagePreview, ...rest } = item;
        return {
          ...rest,
          food: item.food.trim(),
          price: item.price.trim(),
        };
      }),
    };

    onSave?.(slotData);
  };

  const handlePriceChange = (index: number, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      updateItem(index, "price", value);
    }
  };

  const handleQuantityChange = (index: number, value: number | "") => {
    if (value === "" || (value >= 1 && value <= 999)) {
      updateItem(index, "quantityValue", value);
    }
  };

  // Clean up image preview URLs on unmount
  const cleanup = useCallback(() => {
    items.forEach(item => {
      if (item.imagePreview && item.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(item.imagePreview);
      }
    });
  }, [items]);

  useState(() => {
    return () => cleanup();
  });

  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-6 bg-white shadow-sm">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">Food Slot</h2>
          </div>
          
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove slot"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Slot
            </button>
          )}
        </div>

        <div>
          <label htmlFor="slot-name" className="block text-sm font-medium text-gray-700 mb-2">
            Slot Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="slot-name"
              type="text"
              placeholder="e.g., Mutton Specialties, Chicken Dishes"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
              value={slotName}
              onChange={(e) => {
                setSlotName(e.target.value);
                setValidationError("");
              }}
              aria-label="Slot name"
              aria-invalid={!slotName.trim()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {slotName.length}/50
            </div>
          </div>
          {!slotName.trim() && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Slot name is required
            </p>
          )}
        </div>
      </div>

      {/* Food Items Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Food Items</h3>
            <p className="text-sm text-gray-500 mt-1">Add and manage food items in this slot</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`food-item-${index}`}
              className="border border-gray-200 rounded-xl p-5 space-y-5 bg-gray-50/50 hover:bg-gray-50 transition-colors relative overflow-hidden"
            >
              {/* Image Preview in Top-Right Corner */}
              {item.imagePreview && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img 
                        src={item.imagePreview} 
                        alt={`Preview of ${item.food || 'food item'}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Hover Overlay with Remove Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleImageUpload(index, null)}
                        className="text-white hover:text-red-300 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pr-28">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-semibold rounded-lg">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900">
                    Food Item Details
                  </h4>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              {/* Food Name and Price Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pr-28">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Butter Chicken, Mutton Biryani"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={item.food}
                    onChange={(e) => updateItem(index, "food", e.target.value)}
                    aria-label={`Food name for item ${index + 1}`}
                    aria-invalid={!item.food.trim()}
                  />
                  {!item.food.trim() && (
                    <p className="mt-2 text-sm text-red-600">Please enter a food name</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                      ₹
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="299.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={item.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      aria-label={`Price for ${item.food || `item ${index + 1}`}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      INR
                    </div>
                  </div>
                  {item.price && parseFloat(item.price) < 0 && (
                    <p className="mt-2 text-sm text-red-600">Price cannot be negative</p>
                  )}
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-100 pr-28">
                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={item.quantityValue}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onBlur={() => {
                        if (item.quantityValue === "") {
                          handleQuantityChange(index, 1);
                        }
                      }}
                      placeholder="10"
                    />
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={item.quantityUnit}
                      onChange={(e) =>
                        updateItem(index, "quantityUnit", e.target.value as FoodItem["quantityUnit"])
                      }
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="g">grams</option>
                      <option value="litre">litre</option>
                      <option value="plates">plates</option>
                      <option value="members">members</option>
                    </select>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`unavailable-${index}`}
                      checked={item.unavailable}
                      onChange={(e) => updateItem(index, "unavailable", e.target.checked)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`unavailable-${index}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${item.unavailable 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${item.unavailable 
                        ? 'bg-red-600 border-red-600' 
                        : 'bg-white border-gray-300'
                      }`}>
                        {item.unavailable && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">Mark as Unavailable</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {item.imagePreview ? "Change Image" : "Upload Image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleImageUpload(index, e.target.files?.[0] || null)
                      }
                      aria-label={`Upload image for ${item.food}`}
                    />
                  </label>

                  {item.image && !item.imagePreview && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-blue-700 font-medium truncate max-w-[120px]">
                        {item.image.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleImageUpload(index, null)}
                        className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label={`Remove image for ${item.food}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addFoodItem}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
          aria-label="Add another food item"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              Add Another Food Item
            </span>
          </div>
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div 
          className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
          role="alert"
        >
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-red-800">Validation Error</p>
            <p className="text-sm text-red-700 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSlotName("");
              setItems([createEmptyItem()]);
              setValidationError("");
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-colors"
            aria-label="Reset form"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Save slot"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Slot
          </button>
        </div>
      </div>
    </div>
  );
}