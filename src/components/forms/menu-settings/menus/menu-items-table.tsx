"use client";

import { useEffect, useState } from "react";
import {
  Pencil, Trash2, Eye, EyeOff, Package,
  Tag, TrendingUp, AlertCircle,
  Filter, Search, MoreVertical,
  Plus, ChevronDown, X,
  Download, BarChart3, Clock,
  Percent, Layers, Infinity
} from "lucide-react";
import {
  getMenuItems,
  getMenus,
  getCategories,
  deleteMenuItem,
  toggleMenuItemAvailability,
  toggleMenuItemVisibility,
  toggleMenuItemBestSeller
} from "@/lib/api/menu-items";
import type { MenuItem, Menu, ItemCategory } from "@/lib/api/menu-items";
import toast from "react-hot-toast";
import AddMenuItemForm from "@/components/forms/menu-settings/menu-items/add-menu-item-form";

export default function MenuItemsTable() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, menusRes, categoriesRes] = await Promise.all([
        getMenuItems(),
        getMenus(),
        getCategories()
      ]);

      const extractArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.items)) return res.items;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        return [];
      };

      const normalizedItems: MenuItem[] = extractArray(itemsRes);
      const normalizedMenus: Menu[] = extractArray(menusRes);
      const normalizedCategories: ItemCategory[] = extractArray(categoriesRes);

      const safeItems: MenuItem[] = normalizedItems.map(item => ({
        ...item,
        order_count: item.order_count ?? 0,
        last_updated: item.last_updated ?? item.created_at ?? new Date().toISOString(),
        original_price: item.original_price ?? item.price,
        stock_qty: item.stock_qty ?? 0,
        stock_type: item.stock_type ?? 'limited'
      }));

      setItems(safeItems);
      setMenus(normalizedMenus);
      setCategories(normalizedCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load menu data");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform stock data for display with 25% warning
  const getStockDisplay = (item: MenuItem) => {
    if (item.stock_type === 'unlimited') {
      return {
        text: 'Unlimited',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <Infinity className="w-3.5 h-3.5" />,
        isLowStock: false
      };
    }

    if (item.stock_type === 'limited' && item.stock_qty && item.stock_qty > 0) {
      let color = 'text-blue-700';
      let bg = 'bg-blue-50';
      let border = 'border-blue-200';
      let isLowStock = false;
      let percentRemaining = 100;

      // For demo, assume initial stock is 4 times current stock to calculate percentage
      const initialStock = 100; // Assume initial stock was 100 for percentage calculation
      percentRemaining = Math.round((item.stock_qty / initialStock) * 100);

      if (percentRemaining <= 25) {
        color = 'text-amber-600';
        bg = 'bg-gradient-to-r from-amber-50 to-orange-50';
        border = 'border-amber-300';
        isLowStock = true;
      } else if (item.stock_qty < 10) {
        color = 'text-amber-700';
        bg = 'bg-amber-50';
        border = 'border-amber-200';
        isLowStock = true;
      } else if (item.stock_qty < 5) {
        color = 'text-orange-700';
        bg = 'bg-orange-50';
        border = 'border-orange-200';
        isLowStock = true;
      }

      return {
        text: `${item.stock_qty} ${item.stock_unit || 'units'}`,
        color,
        bg,
        border,
        icon: <Package className="w-3.5 h-3.5" />,
        isLowStock,
        percentRemaining
      };
    }

    return {
      text: 'Out of Stock',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      isLowStock: false
    };
  };

  // Check if item is out of stock
  const isOutOfStock = (item: MenuItem): boolean => {
    if (item.stock_type === 'unlimited') return false;
    return !item.stock_qty || item.stock_qty <= 0;
  };

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMenu = selectedMenu === "all" ||
      item.menu_id.toString() === selectedMenu;

    const matchesCategory = selectedCategory === "all" ||
      (item.category_id?.toString() === selectedCategory);

    const matchesOutOfStockFilter = !showOutOfStockOnly || isOutOfStock(item);

    return matchesSearch && matchesMenu && matchesCategory && matchesOutOfStockFilter;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.order_count ?? 0) - (a.order_count ?? 0);
      case "recent":
        return new Date(b.last_updated ?? 0).getTime()
          - new Date(a.last_updated ?? 0).getTime()

      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === sortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedItems.map(item => item.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      setProcessing(id);
      const res = await deleteMenuItem(id);

      const isSuccess =
        res === true ||
        res?.success === true ||
        res?.status === true ||
        res?.message?.toLowerCase().includes("success");

      if (isSuccess) {
        setItems(prev => prev.filter(item => item.id !== id));
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
        toast.success("Item deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    } finally {
      setProcessing(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) return;

    try {
      setProcessing(-1); // Use -1 for bulk operations
      const deletePromises = selectedItems.map(id => deleteMenuItem(id));
      const results = await Promise.allSettled(deletePromises);

      const successfulDeletes: number[] = [];
      const failedDeletes: number[] = [];

      results.forEach((result, index) => {
        const id = selectedItems[index];
        if (result.status === 'fulfilled' && (
          result.value === true ||
          result.value?.success === true ||
          result.value?.status === true ||
          result.value?.message?.toLowerCase().includes("success")
        )) {
          successfulDeletes.push(id);
        } else {
          failedDeletes.push(id);
        }
      });

      if (successfulDeletes.length > 0) {
        setItems(prev => prev.filter(item => !successfulDeletes.includes(item.id)));
        setSelectedItems([]);
        toast.success(`${successfulDeletes.length} item(s) deleted successfully`);
      }

      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} item(s)`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete items");
    } finally {
      setProcessing(null);
    }
  };

  // Fixed availability toggle function - optimized to prevent layout shift
  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      setProcessing(id);

      // Update UI optimistically with minimal visual change
      setItems(prev =>
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              is_available: !currentStatus
            };
          }
          return item;
        })
      );

      // Call API with correct parameter name
      const res = await toggleMenuItemAvailability(id, !currentStatus);

      // Check different possible success responses
      const isSuccess =
        res === true ||
        res?.success === true ||
        res?.status === true ||
        res?.message?.toLowerCase().includes("success");

      if (isSuccess) {
        toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        // Rollback on failure
        setItems(prev =>
          prev.map(item => {
            if (item.id === id) {
              return {
                ...item,
                is_available: currentStatus
              };
            }
            return item;
          })
        );
        toast.error(res?.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      // Rollback on error
      setItems(prev =>
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              is_available: currentStatus
            };
          }
          return item;
        })
      );
      toast.error("Failed to update availability");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
    try {
      setProcessing(id);

      // Update UI optimistically
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, show_on_site: !currentStatus } : item
        )
      );

      const res = await toggleMenuItemVisibility(id, !currentStatus);

      if (res?.success || res === true) {
        toast.success(`Visibility ${!currentStatus ? "enabled" : "disabled"}`);
      } else {
        // Rollback on failure
        setItems(prev =>
          prev.map(item =>
            item.id === id ? { ...item, show_on_site: currentStatus } : item
          )
        );
        toast.error("Failed to update visibility");
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      // Rollback on error
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, show_on_site: currentStatus } : item
        )
      );
      toast.error("Failed to update visibility");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleBestSeller = async (id: number, currentStatus: boolean) => {
    try {
      setProcessing(id);

      // Update UI optimistically
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_best_seller: !currentStatus } : item
        )
      );

      const res = await toggleMenuItemBestSeller(id, !currentStatus);

      if (res?.success || res === true) {
        toast.success(`Best seller status ${!currentStatus ? 'added' : 'removed'}`);
      } else {
        // Rollback on failure
        setItems(prev =>
          prev.map(item =>
            item.id === id ? { ...item, is_best_seller: currentStatus } : item
          )
        );
        toast.error(res?.message || "Failed to update best seller status");
      }
    } catch (error) {
      console.error("Toggle best seller error:", error);
      // Rollback on error
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_best_seller: currentStatus } : item
        )
      );
      toast.error("Failed to update best seller status");
    } finally {
      setProcessing(null);
    }
  };


  const getImageUrl = (image?: string) => {
    if (!image) return null;

    // already full URL
    if (image.startsWith("http")) return image;

    // ensure leading slash
    if (!image.startsWith("/")) image = "/" + image;

    return `http://localhost/manager.bookpanlam/public${image}`;
  };

  // Export to CSV function
  const handleExportCSV = () => {
    try {
      const headers = [
        'ID',
        'Name',
        'Description',
        'Price (₹)',
        'Original Price (₹)',
        'Category',
        'Menu',
        'Food Type',
        'Stock Type',
        'Stock Quantity',
        'Stock Unit',
        'Available',
        'Visible',
        'Best Seller',
        'Order Count',
        'Created At'
      ];

      const csvData = filteredItems.map(item => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.price,
        item.original_price || item.price,
        categories.find(cat => cat.id === item.category_id)?.name || 'Uncategorized',
        menus.find(menu => menu.id === item.menu_id)?.name || 'Unknown',
        item.food_type || 'unknown',
        item.stock_type || 'limited',
        item.stock_qty || 0,
        item.stock_unit || 'units',
        item.is_available ? 'Yes' : 'No',
        item.show_on_site ? 'Yes' : 'No',
        item.is_best_seller ? 'Yes' : 'No',
        item.order_count || 0,
        item.created_at || new Date().toISOString()
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `menu-items-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Menu items exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export menu items');
    }
  };

  // Count available items
  const availableItemsCount = items.filter(item => item.is_available).length;

  // Count low stock items (25% or less)
  const lowStockItemsCount = items.filter(item => {
    if (item.stock_type !== 'limited' || !item.stock_qty || item.stock_qty <= 0) return false;
    // For demo, assume initial stock was 100
    const percentRemaining = (item.stock_qty / 100) * 100;
    return percentRemaining <= 25;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-transparent border-t-blue-500 border-r-blue-300 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Loading menu items</p>
            <p className="text-xs text-gray-500 mt-1">Fetching your restaurant menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Menu Items
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">
                    Manage your restaurant's menu items, pricing, and availability
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white rounded-lg border border-gray-200 shadow-xs">
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500">TOTAL ITEMS</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{items.length}</div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500">AVAILABLE</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600">
                    {availableItemsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 sm:mb-6">
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, description, or category..."
                    className="w-full pl-9 sm:pl-11 pr-8 sm:pr-10 py-2.5 sm:py-3 border-0 focus:ring-0 text-sm placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Out of Stock Filter */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id="outOfStockOnly"
                      checked={showOutOfStockOnly}
                      onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                    />
                    <label htmlFor="outOfStockOnly" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
                      Out of Stock Only
                    </label>
                  </div>

                  <button
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${filtersVisible
                      ? "bg-blue-50 border-blue-500 text-blue-600 shadow-xs"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                  >
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${filtersVisible ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="hidden sm:block h-6 w-px bg-gray-300"></div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditItem(null);
                      setShowAddItem(true);
                    }}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow transition-all text-xs sm:text-sm font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {filtersVisible && (
                <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Menu
                      </label>
                      <select
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={selectedMenu}
                        onChange={(e) => setSelectedMenu(e.target.value)}
                      >
                        <option value="all">All Menus</option>
                        {menus.map(menu => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <select
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Sort By
                      </label>
                      <select
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="recent">Recently Added</option>
                        <option value="popular">Most Popular</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name">Alphabetical</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSelectedMenu("all");
                          setSelectedCategory("all");
                          setSearchQuery("");
                          setSortBy("recent");
                          setShowOutOfStockOnly(false);
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar - Simplified */}
        {selectedItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full text-xs font-medium">
                  {selectedItems.length}
                </div>
                <span className="text-blue-800 font-medium text-sm sm:text-base">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="hidden sm:block h-4 w-px bg-blue-300"></div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={processing === -1}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-red-300 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Bulk Delete</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedItems([])}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 hover:bg-white rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Available Items Card */}
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Available Items</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {availableItemsCount}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-hover:shadow-sm transition-shadow">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow group relative overflow-hidden">
            {lowStockItemsCount > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 to-orange-50/20 animate-pulse"></div>
            )}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Low Stock Alert</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {lowStockItemsCount}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-100 to-orange-50 rounded-lg group-hover:shadow-sm transition-shadow">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
            {lowStockItemsCount > 0 && (
              <div className="absolute -top-1 -right-1 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full"></div>
            )}
          </div>

          {/* Unlimited Stock Card */}
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Unlimited Stock</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {items.filter(item => item.stock_type === 'unlimited').length}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:shadow-sm transition-shadow">
                <Infinity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {items.reduce((sum, item) => sum + (item.order_count || 0), 0)}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg group-hover:shadow-sm transition-shadow">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] md:min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-4 sm:p-5 md:p-6 text-left">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Menu Item
                      </span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 sm:p-5 md:p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 sm:p-10 md:p-12 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                          {searchQuery || selectedMenu !== "all" || selectedCategory !== "all" || showOutOfStockOnly
                            ? "No items match your search"
                            : "No menu items yet"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 sm:mb-6">
                          {searchQuery || selectedMenu !== "all" || selectedCategory !== "all" || showOutOfStockOnly
                            ? "Try adjusting your filters or search terms"
                            : "Start by adding your first menu item to build your restaurant's menu"}
                        </p>
                        <button
                          onClick={() => {
                            setEditItem(null);
                            setShowAddItem(true);
                          }}
                          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm font-medium transition-all text-sm"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Add Your First Item</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => {
                    const stockDisplay = getStockDisplay(item);
                    const categoryName = categories.find(cat => cat.id === item.category_id)?.name || "Uncategorized";
                    const menuName = menus.find(menu => menu.id === item.menu_id)?.name || "Unknown Menu";

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/80 transition-colors ${!item.is_available ? 'bg-gray-50/50' : ''}`}
                      >
                        {/* Item Details */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              className="mt-1.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-xs">
                                {item.image ? (
                                  <img
                                    src={getImageUrl(item.image) ?? ""}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              {item.is_best_seller && (
                                <div className="absolute -top-1 -right-1">
                                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                                    🔥
                                  </span>
                                </div>
                              )}
                              <div className={`absolute -bottom-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-xs ${item.food_type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                <span className="sr-only">
                                  {item.food_type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {item.name}
                                  </h3>
                                </div>
                                <p className="text-gray-500 text-xs sm:text-sm line-clamp-1">
                                  {item.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-baseline gap-1.5 sm:gap-2">
                              <span className="text-base sm:text-lg font-bold text-gray-900">₹{item.price}</span>
                              {item.original_price && item.original_price > item.price && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through">
                                  ₹{item.original_price}
                                </span>
                              )}
                            </div>
                            {item.original_price && item.original_price > item.price && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded text-xs font-medium">
                                <Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>Save ₹{item.original_price - item.price}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Stock Status with 25% warning */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium ${stockDisplay.bg} ${stockDisplay.color} ${stockDisplay.border} border relative`}>
                              {stockDisplay.icon}
                              <span>{stockDisplay.text}</span>
                              {stockDisplay.isLowStock && (
                                <span className="absolute -top-1 -right-1 animate-pulse">
                                  <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full shadow-xs">
                                    !
                                  </span>
                                </span>
                              )}
                            </div>

                            {stockDisplay.isLowStock && stockDisplay.percentRemaining && stockDisplay.percentRemaining <= 25 && (
                              <div className="flex items-center gap-1.5 px-1.5 py-1 sm:px-2 sm:py-1.5 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-amber-700">
                                    Only {stockDisplay.percentRemaining}% stock left
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg">
                              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{categoryName}</span>
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                              <div className="p-1 sm:p-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-base sm:text-lg">{item.order_count ?? 0}</span>
                              </div>
                            </div>
                            {item.order_count > 50 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700">
                                Popular
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status - Only Available toggle */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.is_available}
                                  onChange={() => handleToggleAvailability(item.id, item.is_available)}
                                  disabled={processing === item.id}
                                  className="sr-only peer"
                                />
                                <div className={`relative w-12 h-6 sm:w-14 sm:h-7 rounded-full peer transition-all duration-300 ${item.is_available ? 'bg-emerald-500' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300`}>
                                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 transform ${item.is_available ? 'translate-x-6 sm:translate-x-7' : ''}`} />
                                </div>
                                <span className="text-xs sm:text-sm font-medium ml-2 sm:ml-3 text-gray-700">
                                  {item.is_available ? 'ON' : 'OFF'}
                                </span>
                              </label>
                              <span className="text-xs text-gray-500 text-center">
                                {item.is_available ? 'Available for order' : 'Not available'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 sm:p-5 md:p-6">
                          <div className="relative">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditItem(item);
                                  setShowAddItem(true);
                                }}
                                className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Item"
                              >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleBestSeller(item.id, item.is_best_seller)}
                                disabled={processing === item.id}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${item.is_best_seller
                                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  } ${processing === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={item.is_best_seller ? "Remove from best sellers" : "Mark as best seller"}
                              >
                                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <div className="w-px h-4 bg-gray-300"></div>
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                              >
                                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            {/* Action Menu Dropdown */}
                            {actionMenuOpen === item.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                                <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setEditItem(item);
                                        setShowAddItem(true);
                                        setActionMenuOpen(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      Edit Item
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteItem(item.id);
                                        setActionMenuOpen(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      Delete Item
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        handleToggleVisibility(item.id, item.show_on_site);
                                        setActionMenuOpen(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      {item.show_on_site ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                      {item.show_on_site ? 'Hide from Website' : 'Show on Website'}
                                    </button>
                                    <button className="flex items-center gap-2 w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      View History
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {sortedItems.length > 0 && (
            <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{sortedItems.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{items.length}</span> items
                  {showOutOfStockOnly && (
                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium">
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Out of Stock Only
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 rotate-90" />
                    <span className="hidden xs:inline">Previous</span>
                  </button>
                  <button className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all">
                    1
                  </button>
                  <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <span className="hidden xs:inline">Next</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Menu Item Modal */}
      {showAddItem && (
        <AddMenuItemForm
          item={editItem}
          title={editItem ? "Edit Menu Item" : "Add Menu Item"}
          onClose={() => {
            setShowAddItem(false);
            setEditItem(null);
            loadData();
          }}
          onItemSaved={loadData}
        />
      )}
    </>
  );
}