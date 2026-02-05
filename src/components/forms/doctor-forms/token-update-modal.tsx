"use client";

import { useState, useEffect } from "react";
import { X, History, Plus, Minus, RefreshCw, Calendar, Clock } from "lucide-react";

interface TokenUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: {
    batch_id: string;
    currentToken: string;
    day: string;
    slotIndex: number;
    startTime: string;
    endTime: string;
    categoryId: string;
  };
  categoryId: string;
  onTokenUpdated: (newToken: string, batchId: string) => void;
}

type TokenUpdateAction = 'set' | 'increase' | 'decrease';

export default function TokenUpdateModal({
  isOpen,
  onClose,
  slotData,
  categoryId,
  onTokenUpdated,
}: TokenUpdateModalProps) {
  const [action, setAction] = useState<TokenUpdateAction>("increase");
  const [value, setValue] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch token history
  useEffect(() => {
    if (isOpen && categoryId) {
      fetchTokenHistory();
    }
  }, [isOpen, categoryId, slotData.batch_id]);

  const fetchTokenHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({
        category_id: categoryId,
        batch_id: slotData.batch_id
      });

      const response = await fetch(
        `http://localhost/manager.bookpanlam/public/seller/doctor_schedule/token_history.php?${params}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateToken = async () => {
    if (!value || parseInt(value) <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost/manager.bookpanlam/public/seller/doctor_schedule/token_history.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            category_id: categoryId,
            batch_id: slotData.batch_id,
            action: action,
            value: parseInt(value),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onTokenUpdated(data.new_token.toString(), slotData.batch_id);
        fetchTokenHistory(); // Refresh history
      } else {
        alert("Failed to update token: " + data.message);
      }
    } catch (error) {
      console.error("Error updating token:", error);
      alert("Error updating token");
    } finally {
      setLoading(false);
    }
  };

  const calculateNewTotal = () => {
    const current = parseInt(slotData.currentToken || "0");
    const change = parseInt(value || "0");

    switch (action) {
      case "set":
        return change;
      case "increase":
        return current + change;
      case "decrease":
        return Math.max(0, current - change);
      default:
        return current;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-lg mx-3 sm:mx-4">
        {/* Header */}
        <div className="bg-blue-600 p-3 sm:p-4 md:p-5 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">Manage Token Limit</h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 truncate">
                Batch ID: <span className="font-mono bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{slotData.batch_id}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded flex-shrink-0 ml-2"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                <p className="text-xs text-blue-100">Day</p>
              </div>
              <p className="font-semibold text-xs sm:text-sm truncate">{slotData.day}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                <p className="text-xs text-blue-100">Time Slot</p>
              </div>
              <p className="font-semibold text-xs sm:text-sm truncate">
                {slotData.startTime} - {slotData.endTime}
              </p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1 truncate">Current Tokens</p>
              <p className="text-base sm:text-lg font-bold truncate">{slotData.currentToken || "0"}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1 truncate">New Total</p>
              <p className="text-base sm:text-lg font-bold text-green-300 truncate">{calculateNewTotal()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 p-3 sm:p-4 md:p-5">
          {/* Left Column - Update Controls */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-5">
              <h3 className="font-medium text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                <RefreshCw size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-sm sm:text-base">Update Token Count</span>
              </h3>

              {/* Action Selection */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                <button
                  onClick={() => setAction("increase")}
                  className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "increase"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                >
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">Increase</span>
                </button>
                <button
                  onClick={() => setAction("decrease")}
                  className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "decrease"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                >
                  <Minus size={16} className="sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">Decrease</span>
                </button>
                <button
                  onClick={() => setAction("set")}
                  className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "set"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <RefreshCw size={16} className="sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">Set Exact</span>
                </button>
              </div>

              {/* Value Input */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    {action === "set" ? "New Token Count" :
                      action === "increase" ? "Tokens to Add" :
                        "Tokens to Remove"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full p-2.5 sm:p-3 text-base sm:text-lg font-medium text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter number"
                    />
                    <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
                      tokens
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Quick Adjust</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[5, 10, 20, 50, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setValue(num.toString())}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs sm:text-sm transition"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600">Current</p>
                      <p className="text-base sm:text-lg font-bold">{slotData.currentToken || "0"}</p>
                    </div>

                    <div className="text-lg sm:text-xl text-gray-400 mx-2 sm:mx-4">→</div>

                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600">Change</p>
                      <p className={`text-base sm:text-lg font-bold ${action === "decrease" ? "text-red-600" : "text-green-600"
                        }`}>
                        {action === "set" ? "" : action === "increase" ? "+" : "-"}
                        {value}
                      </p>
                    </div>

                    <div className="text-lg sm:text-xl text-gray-400 mx-2 sm:mx-4">→</div>

                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600">New Total</p>
                      <p className="text-base sm:text-lg font-bold text-blue-600">{calculateNewTotal()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={handleUpdateToken}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 h-10 sm:h-11 text-white rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? "Updating..." : "Update Tokens"}
                  </button>
                  <button
                    onClick={onClose}
                    className="h-10 sm:h-11 px-4 sm:px-5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg border border-gray-200 h-full">
              <div className="p-2.5 sm:p-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 flex items-center gap-1.5 sm:gap-2">
                  <History size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                  <span className="text-sm sm:text-base">Update History</span>
                </h3>
              </div>

              <div className="p-2 sm:p-3 overflow-y-auto max-h-[300px] sm:max-h-[350px]">
                {historyLoading ? (
                  <div className="text-center py-4 sm:py-6">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Loading history...</p>
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    {history.map((record, index) => (
                      <div
                        key={record.id}
                        className="bg-white border border-gray-100 rounded p-1.5 sm:p-2 hover:border-blue-200 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-0.5 sm:gap-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                            <p className="text-xs text-gray-500">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(record.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium self-start sm:self-auto ${record.new_token > record.old_token
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                            {record.new_token > record.old_token ? "+" : ""}
                            {record.new_token - record.old_token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-600">From: </span>
                            <span className="font-medium">{record.old_token}</span>
                          </div>
                          <div className="text-gray-400 text-sm">→</div>
                          <div>
                            <span className="text-gray-600">To: </span>
                            <span className="font-medium">{record.new_token}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6 text-gray-500">
                    <History size={24} className="sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 text-gray-300" />
                    <p className="text-xs sm:text-sm">No update history yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-2 sm:p-3 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-1 sm:gap-0">
            <div className="truncate">
              Category ID: <span className="font-medium">{categoryId}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Increase</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
                <span className="text-xs">Decrease</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}