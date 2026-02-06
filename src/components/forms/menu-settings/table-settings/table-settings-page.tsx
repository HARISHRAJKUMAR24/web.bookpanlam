"use client";

import { saveTableSettings, fetchTableSettings } from "@/lib/api/table-settings";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Clock, Users, Plus, Trash2, Save, Calendar, Check, Edit2, X, Timer, ChevronRight, Loader2 } from "lucide-react";

interface Table {
  tableNumber: string;
  seats: number;
  eatingTime: number;
}

interface Timing {
  startTime: string;
  startMeridiem: "AM" | "PM";
  breakStart?: string;
  breakEnd?: string;
  endTime: string;
  endMeridiem: "AM" | "PM";
}

const TableSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [timing, setTiming] = useState<Timing>({
    startTime: "09:00",
    startMeridiem: "AM",
    endTime: "10:00",
    endMeridiem: "PM",
  });

  const [showBreak, setShowBreak] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat"]);
  const [tables, setTables] = useState<Table[]>([]);

  const [newTable, setNewTable] = useState({ tableNumber: "", seats: 4, eatingTime: 60 });
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableData, setEditTableData] = useState<Table | null>(null);

  // Updated days with consistent lowercase IDs
  const daysOfWeek = [
    { id: "mon", label: "Mon", full: "Monday" },
    { id: "tue", label: "Tue", full: "Tuesday" },
    { id: "wed", label: "Wed", full: "Wednesday" },
    { id: "thu", label: "Thu", full: "Thursday" },
    { id: "fri", label: "Fri", full: "Friday" },
    { id: "sat", label: "Sat", full: "Saturday" },
    { id: "sun", label: "Sun", full: "Sunday" },
  ];

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const period = i < 12 ? "AM" : "PM";
    return {
      value: `${hour.toString().padStart(2, "0")}:00`,
      label: `${hour}:00 ${period}`,
    };
  });

  const eatingTimeOptions = [
    { value: 15, label: "15 mins" },
    { value: 30, label: "30 mins" },
    { value: 45, label: "45 mins" },
    { value: 60, label: "1 hour" },
    { value: 75, label: "1 hour 15 mins" },
    { value: 90, label: "1 hour 30 mins" },
    { value: 105, label: "1 hour 45 mins" },
    { value: 120, label: "2 hours" },
    { value: 150, label: "2 hours 30 mins" },
    { value: 180, label: "3 hours" },
  ];

  // Fetch settings on component mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchTableSettings();

      if (data.settings) {
        // Set timing
        setTiming({
          startTime: data.settings.start_time,
          startMeridiem: data.settings.start_meridiem as "AM" | "PM",
          endTime: data.settings.end_time,
          endMeridiem: data.settings.end_meridiem as "AM" | "PM",
          breakStart: data.settings.break_start || undefined,
          breakEnd: data.settings.break_end || undefined,
        });

        // Show break toggle if break times exist
        if (data.settings.break_start && data.settings.break_end) {
          setShowBreak(true);
        }

        // Set operating days
        if (data.settings.operating_days) {
          try {
            const days = JSON.parse(data.settings.operating_days);
            if (Array.isArray(days)) {
              setSelectedDays(days.map(day => day.toLowerCase()));
            }
          } catch (e) {
            console.error("Error parsing operating days:", e);
          }
        }
      }

      // Set tables
      if (data.tables && data.tables.length > 0) {
        const formattedTables = data.tables.map(table => ({
          tableNumber: table.table_number,
          seats: table.seats,
          eatingTime: table.eating_time || 60, // Default to 60 if not set
        }));
        setTables(formattedTables);
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load saved settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayId: string) => {
    const dayLower = dayId.toLowerCase();
    setSelectedDays(prev =>
      prev.includes(dayLower)
        ? prev.filter(d => d !== dayLower)
        : [...prev, dayLower]
    );
  };

  const handleAddTable = () => {
    if (!newTable.tableNumber.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    const tableNumber = newTable.tableNumber.toUpperCase();

    if (tables.some(table => table.tableNumber === tableNumber)) {
      toast.error("Table number already exists");
      return;
    }

    setTables([
      ...tables,
      {
        tableNumber,
        seats: newTable.seats,
        eatingTime: newTable.eatingTime,
      },
    ]);

    setNewTable({ tableNumber: "", seats: 4, eatingTime: 60 });
    toast.success("Table added successfully");
  };

  const handleRemoveTable = (tableNumber: string) => {
    if (tables.length <= 1) {
      toast.error("You must have at least one table");
      return;
    }

    setTables(tables.filter(t => t.tableNumber !== tableNumber));
    toast.success("Table removed");
  };

  const handleEditTable = (table: Table) => {
    setEditingTableId(table.tableNumber);
    setEditTableData({ ...table });
  };

  const handleSaveEdit = () => {
    if (!editTableData || !editTableData.tableNumber.trim()) {
      toast.error("Table number cannot be empty");
      return;
    }

    if (tables.some(table =>
      table.tableNumber !== editingTableId &&
      table.tableNumber === editTableData.tableNumber.toUpperCase()
    )) {
      toast.error("Table number already exists");
      return;
    }

    setTables(tables.map(table =>
      table.tableNumber === editingTableId ? editTableData! : table
    ));

    setEditingTableId(null);
    setEditTableData(null);
    toast.success("Table updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingTableId(null);
    setEditTableData(null);
  };

  const validateSettings = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one operating day");
      return false;
    }

    if (!timing.startTime || !timing.endTime) {
      toast.error("Please set both opening and closing times");
      return false;
    }

    if (showBreak) {
      if (!timing.breakStart || !timing.breakEnd) {
        toast.error("Please set both break start and end times");
        return false;
      }
    }

    if (tables.length === 0) {
      toast.error("Please add at least one table");
      return false;
    }

    const tableNumbers = tables.map(table => table.tableNumber.toLowerCase());
    const uniqueTableNumbers = new Set(tableNumbers);
    if (tableNumbers.length !== uniqueTableNumbers.size) {
      toast.error("Table numbers must be unique");
      return false;
    }

    const invalidTable = tables.find(table => table.seats < 1 || table.seats > 20);
    if (invalidTable) {
      toast.error(`Table ${invalidTable.tableNumber} must have 1-20 seats`);
      return false;
    }

    const invalidEatingTime = tables.find(table => table.eatingTime < 15 || table.eatingTime > 300);
    if (invalidEatingTime) {
      toast.error(`Table ${invalidEatingTime.tableNumber} must have eating time between 15-300 minutes`);
      return false;
    }

    return true;
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) {
      return;
    }

    const payload = {
      timing,
      operatingDays: selectedDays, // Only selected days
      tables,
      breakSchedule: showBreak
        ? {
          breakStart: timing.breakStart,
          breakEnd: timing.breakEnd,
        }
        : null,
    };

    try {
      setSaving(true);

      toast.promise(
        saveTableSettings(payload).then(res => {
          if (!res.success) {
            throw new Error(res.message || "Failed to save settings");
          }
          return res;
        }),
        {
          loading: "Saving table settings...",
          success: (res) => {
            // Refresh the data after successful save
            loadSavedSettings();
            return `Settings saved successfully! ${tables.length} tables configured.`;
          },
          error: (err) => err.message || "Failed to save settings. Please try again.",
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const avgEatingTime = tables.length > 0
    ? Math.round(tables.reduce((sum, table) => sum + table.eatingTime, 0) / tables.length)
    : 0;

  const selectAllDays = () => {
    setSelectedDays(daysOfWeek.map(day => day.id));
    toast.success("All days selected");
  };

  const clearAllDays = () => {
    setSelectedDays([]);
    toast.success("All days cleared");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading table settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Table Settings
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage restaurant tables, operating hours, and seating</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Operating Hours</p>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                  {timing.startTime} {timing.startMeridiem} - {timing.endTime} {timing.endMeridiem}
                </p>
              </div>
              <Clock className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Tables</p>
                <p className="font-semibold text-gray-900 text-base sm:text-lg">{tables.length}</p>
              </div>
              <Users className="text-emerald-500 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Seats</p>
                <p className="font-semibold text-gray-900 text-base sm:text-lg">{totalSeats}</p>
              </div>
              <Users className="text-purple-500 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 pb-24 sm:pb-28">
        {/* Left Column - Operating Settings */}
        <div className="lg:w-1/2 space-y-4 sm:space-y-6">
          {/* Operating Hours Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Operating Hours</h2>
                <p className="text-xs sm:text-sm text-gray-600">Set your daily schedule</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Opening Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={timing.startTime}
                      onChange={(e) => setTiming({ ...timing, startTime: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {timeOptions.slice(0, 12).map(time => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                    <select
                      value={timing.startMeridiem}
                      onChange={(e) => setTiming({ ...timing, startMeridiem: e.target.value as "AM" | "PM" })}
                      className="w-16 sm:w-20 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Closing Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={timing.endTime}
                      onChange={(e) => setTiming({ ...timing, endTime: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {timeOptions.slice(12).map(time => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                    <select
                      value={timing.endMeridiem}
                      onChange={(e) => setTiming({ ...timing, endMeridiem: e.target.value as "AM" | "PM" })}
                      className="w-16 sm:w-20 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700">Break Schedule</h3>
                    <p className="text-xs text-gray-500">Optional daily break timings</p>
                  </div>
                  <button
                    onClick={() => setShowBreak(!showBreak)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showBreak ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showBreak ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {showBreak && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Break Start
                      </label>
                      <input
                        type="time"
                        value={timing.breakStart || "14:00"}
                        onChange={(e) => setTiming({ ...timing, breakStart: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Break End
                      </label>
                      <input
                        type="time"
                        value={timing.breakEnd || "15:00"}
                        onChange={(e) => setTiming({ ...timing, breakEnd: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Operating Days Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600 h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Operating Days</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Select open days for your restaurant</p>
                </div>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  onClick={selectAllDays}
                  className="px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllDays}
                  className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
              {daysOfWeek.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${isSelected ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="font-medium">{day.label}</span>
                    {isSelected && (
                      <div className="mt-1 sm:mt-2 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="text-white h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
              {selectedDays.length === 0 ? (
                <p className="text-amber-600">⚠️ No days selected</p>
              ) : selectedDays.length === 7 ? (
                <p className="text-emerald-600">✓ Open all days of the week</p>
              ) : (
                <p className="text-gray-600">
                  Open on {selectedDays.length} days: {
                    selectedDays
                      .map(d => {
                        const day = daysOfWeek.find(day => day.id === d);
                        return day ? day.label : d;
                      })
                      .join(", ")
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Table Management */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 h-full">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="text-emerald-600 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Table Management</h2>
                <p className="text-xs sm:text-sm text-gray-600">Configure tables with seats and eating time</p>
              </div>
            </div>

            {/* Add Table Form */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
              <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Add New Table</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value.toUpperCase() })}
                    placeholder="T01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seats
                  </label>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setNewTable({ ...newTable, seats: Math.max(1, newTable.seats - 1) })}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center bg-gray-50 py-1.5 sm:py-2 rounded">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{newTable.seats}</span>
                    </div>
                    <button
                      onClick={() => setNewTable({ ...newTable, seats: newTable.seats + 1 })}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Eating Time
                  </label>
                  <select
                    value={newTable.eatingTime}
                    onChange={(e) => setNewTable({ ...newTable, eatingTime: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {eatingTimeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    onClick={handleAddTable}
                    disabled={!newTable.tableNumber.trim()}
                    className="flex items-center justify-center gap-1 sm:gap-2 w-full py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Tables List */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Current Tables ({tables.length})</h3>
                <div className="text-xs sm:text-sm text-gray-500">
                  Total: {totalSeats} seats • Avg: {avgEatingTime} mins
                </div>
              </div>

              {tables.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Users className="mx-auto text-gray-400 mb-2 sm:mb-3 h-7 w-7 sm:h-9 sm:w-9" />
                  <p className="text-gray-600 font-medium text-sm sm:text-base">No tables configured</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Add your first table to get started</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                  {tables.map((table) => (
                    <div
                      key={table.tableNumber}
                      className="group relative p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all"
                    >
                      {editingTableId === table.tableNumber ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Edit Table</h4>
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 sm:p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Table Number
                              </label>
                              <input
                                type="text"
                                value={editTableData?.tableNumber || ""}
                                onChange={(e) => setEditTableData(prev => prev ? { ...prev, tableNumber: e.target.value.toUpperCase() } : null)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Seats
                              </label>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => setEditTableData(prev => prev ? { ...prev, seats: Math.max(1, prev.seats - 1) } : null)}
                                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
                                >
                                  -
                                </button>
                                <div className="flex-1 text-center bg-gray-50 py-1 sm:py-1.5 rounded">
                                  <span className="font-bold text-gray-900 text-sm sm:text-base">{editTableData?.seats || 0}</span>
                                </div>
                                <button
                                  onClick={() => setEditTableData(prev => prev ? { ...prev, seats: prev.seats + 1 } : null)}
                                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Eating Time
                              </label>
                              <select
                                value={editTableData?.eatingTime || 60}
                                onChange={(e) => setEditTableData(prev => prev ? { ...prev, eatingTime: parseInt(e.target.value) } : null)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              >
                                {eatingTimeOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-emerald-700 text-sm sm:text-base">{table.tableNumber}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{table.tableNumber}</h4>
                                <p className="text-xs text-gray-500">Table</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEditTable(table)}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveTable(table.tableNumber)}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm text-gray-600">Seats</span>
                                <Users className="text-gray-400 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  {Array.from({ length: Math.min(table.seats, 4) }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-200 rounded-full"
                                    />
                                  ))}
                                  {table.seats > 4 && (
                                    <span className="text-xs text-gray-500">+{table.seats - 4}</span>
                                  )}
                                </div>
                                <span className="font-bold text-gray-900 text-sm sm:text-base">{table.seats}</span>
                              </div>
                            </div>

                            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm text-gray-600">Eating Time</span>
                                <Timer className="text-blue-400 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="font-bold text-blue-700 text-sm sm:text-base">{table.eatingTime} min</span>
                                <ChevronRight className="text-blue-400 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className="text-xs text-blue-600">
                                  {table.eatingTime >= 60
                                    ? `${Math.floor(table.eatingTime / 60)}h ${table.eatingTime % 60 > 0 ? `${table.eatingTime % 60}m` : ''}`
                                    : `${table.eatingTime}m`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center justify-center gap-2
               px-4 py-2 sm:px-6 sm:py-3
               bg-gradient-to-r from-blue-600 to-indigo-600
               text-white font-semibold
               rounded-lg sm:rounded-xl
               shadow-lg hover:shadow-xl
               hover:from-blue-700 hover:to-indigo-700
               transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed
               text-sm sm:text-base
               w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save
            </>
          )}
        </button>
      </div>


    </div>
  );
};

export default TableSettingsPage;