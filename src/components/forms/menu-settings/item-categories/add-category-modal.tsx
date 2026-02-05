"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
  onAdd: (name: string) => Promise<string | null>;
  title?: string;
  initialName?: string;
  processing?: boolean;
}

export default function AddCategoryModal({
  onClose,
  onAdd,
  title = "Add Item Category",
  initialName = "",
  processing = false,
}: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [initialName]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isSubmitting) return;
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a category name");
      inputRef.current?.focus();
      return;
    }

    if (trimmedName.length < 2) {
      setError("Category name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const err = await onAdd(trimmedName);
      if (err) {
        setError(err);
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        // Success - modal will close via onClose
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md"
          >
            {/* Modal Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                      <Tag className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {initialName ? "Update the category name" : "Create a new category"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="category-name"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Category Name
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        id="category-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Appetizers, Main Course, Desserts"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        maxLength={50}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      {name.length > 0 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {50 - name.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-red-600 flex items-center gap-1.5"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className="text-xs text-gray-400">
                        {name.length}/50 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center gap-2 min-w-[80px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      initialName ? "Update" : "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Keyboard hint */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> to save •{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd> to cancel
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}