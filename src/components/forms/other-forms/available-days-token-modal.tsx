"use client";

import { useState, useEffect } from "react";
import { X, History, Plus, Minus, RefreshCw, Calendar, Clock, AlertCircle } from "lucide-react";
import { getDepartmentTokenHistory, updateDepartmentToken } from "@/lib/api/departments";
import { toast } from "sonner";

interface AvailableDaysTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: {
    batch_id: string;
    currentToken: number;
    day: string;
    slotIndex: number;
    startTime: string;
    endTime: string;
  };
  departmentId?: string;
  onTokenUpdated: (newToken: number, batchId: string) => void;
}

type TokenUpdateAction = 'set' | 'increase' | 'decrease';

type TokenHistoryRecord = {
  id: number;
  slot_batch_id: string;
  old_token: number;
  new_token: number;
  total_token: number;
  created_at: string;
  created_at_display?: string;
  action_type: string;
  change_amount: number;
  updated_by_name?: string;
  day?: string;
  slot_number?: number;
};

export default function AvailableDaysTokenModal({
  isOpen,
  onClose,
  slotData,
  departmentId,
  onTokenUpdated,
}: AvailableDaysTokenModalProps) {
  const [action, setAction] = useState<TokenUpdateAction>("increase");
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TokenHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset values when modal opens
  useEffect(() => {
    if (isOpen) {
      setAction("increase");
      setValue(""); // Start with empty
      setError(null);
      if (departmentId && slotData.batch_id) {
        fetchTokenHistory();
      }
    }
  }, [isOpen, departmentId, slotData.batch_id]);

  const fetchTokenHistory = async () => {
    if (!departmentId) {
      setError("Department ID is required");
      return;
    }

    try {
      setHistoryLoading(true);
      setError(null);

      const response = await getDepartmentTokenHistory(departmentId, slotData.batch_id);

      if (response.success && response.data) {
        const formattedHistory = response.data.map(record => ({
          ...record,
          created_at_display: new Date(record.created_at).toLocaleDateString(),
          change_amount: record.new_token - record.old_token,
          action_type: record.new_token > record.old_token ? 'increase' :
            record.new_token < record.old_token ? 'decrease' : 'set'
        }));

        setHistory(formattedHistory);
      } else {
        setError(response.message || "Failed to fetch history");
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Unable to load history. Please try again.");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateToken = async () => {
    // Check if value is provided
    if (!value || value.trim() === "") {
      toast.error("Please enter a number");
      return;
    }

    const tokenValue = parseInt(value);

    // Validate the number
    if (isNaN(tokenValue) || tokenValue <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    // For decrease action, check if decreasing more than available
    if (action === "decrease" && tokenValue > (slotData.currentToken || 0)) {
      toast.error(`Cannot decrease by ${tokenValue}. Current token count is ${slotData.currentToken || 0}`);
      return;
    }

    if (!departmentId) {
      toast.error("Department ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updateDepartmentToken({
        department_id: departmentId,
        batch_id: slotData.batch_id,
        action: action,
        value: tokenValue
      });

      if (response.success) {
        onTokenUpdated(response.new_token || tokenValue, slotData.batch_id);
        fetchTokenHistory();
        setValue("");
        toast.success(`Token ${action === "increase" ? "increased" : action === "decrease" ? "decreased" : "set"} to ${response.new_token} successfully!`);
      } else {
        setError(response.message || "Failed to update token");
        toast.error(response.message || "Failed to update token");
      }
    } catch (error) {
      console.error("Error updating token:", error);
      setError("Network error. Please try again.");
      toast.error("Error updating token");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Properly calculate new total
  // FIXED: Properly calculate new total
  const calculateNewTotal = () => {
    const current = parseInt(String(slotData.currentToken ?? 0));
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

  // Handle quick action button click
  const handleQuickAction = (num: number) => {
    setValue(num.toString());
  };

  // Handle input change with validation
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  if (!isOpen) return null;

  const newTotal = calculateNewTotal();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-lg flex flex-col mx-3 sm:mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 sm:p-4 md:p-5 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">Manage Token Limit</h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 truncate">
                Batch ID: <span className="font-mono bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{slotData.batch_id}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition flex-shrink-0 ml-2"
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
              <p className="text-base sm:text-lg font-bold text-green-300 truncate">{newTotal}</p>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 p-3 sm:p-4 md:p-5">
            {/* Left Column - Update Controls */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <RefreshCw size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                  <span className="text-sm sm:text-base">Update Token Count</span>
                </h3>

                {/* Action Selection */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                  <button
                    onClick={() => setAction("increase")}
                    className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "increase"
                        ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">Increase</span>
                  </button>
                  <button
                    onClick={() => setAction("decrease")}
                    className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "decrease"
                        ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                      }`}
                  >
                    <Minus size={16} className="sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">Decrease</span>
                  </button>
                  <button
                    onClick={() => setAction("set")}
                    className={`p-2 sm:p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${action === "set"
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={value}
                        onChange={handleValueChange}
                        className="w-full p-2.5 sm:p-3 text-base sm:text-lg font-medium text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter number"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
                          type="button"
                          onClick={() => handleQuickAction(num)}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition hover:scale-105 ${value === num.toString()
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary - Simplified */}
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
                      disabled={loading || !departmentId || !value || parseInt(value) <= 0}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-10 sm:h-11 text-white rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all text-sm sm:text-base"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          Updating...
                        </span>
                      ) : "Update Tokens"}
                    </button>
                    <button
                      onClick={onClose}
                      className="h-10 sm:h-11 px-4 sm:px-5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - History */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg border border-gray-200 h-full flex flex-col">
                <div className="p-2.5 sm:p-3 md:p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <History size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                    <span className="text-sm sm:text-base">Update History</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing changes for this time slot
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 sm:p-3 max-h-[300px] sm:max-h-[350px]">
                  {error ? (
                    <div className="text-center py-4 sm:py-6">
                      <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mx-auto mb-1.5 sm:mb-2" />
                      <p className="text-xs sm:text-sm text-red-600">{error}</p>
                      <button
                        onClick={fetchTokenHistory}
                        className="mt-2 sm:mt-3 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : historyLoading ? (
                    <div className="text-center py-4 sm:py-6">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">Loading history...</p>
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-1.5 sm:space-y-2">
                      {history.map((record) => (
                        <div
                          key={record.id}
                          className="bg-white border border-gray-100 rounded-lg p-2 sm:p-3 hover:border-blue-200 hover:shadow-sm transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1.5 sm:mb-2 gap-0.5 sm:gap-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <p className="text-xs text-gray-500">
                                {record.created_at_display || new Date(record.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(record.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            </div>
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium self-start sm:self-auto ${record.change_amount > 0
                                ? "bg-green-100 text-green-800"
                                : record.change_amount < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                              {record.change_amount > 0 ? "+" : ""}{record.change_amount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-600">From: </span>
                              <span className="font-medium">{record.old_token}</span>
                            </div>
                            <div className="text-gray-400 mx-1 text-sm">→</div>
                            <div>
                              <span className="text-gray-600">To: </span>
                              <span className="font-medium">{record.new_token}</span>
                            </div>
                          </div>
                          {record.updated_by_name && (
                            <div className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                              By: {record.updated_by_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6 text-gray-500">
                      <History size={24} className="sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 text-gray-300" />
                      <p className="text-xs sm:text-sm">No update history yet</p>
                      <p className="text-xs mt-0.5 sm:mt-1">Updates will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}