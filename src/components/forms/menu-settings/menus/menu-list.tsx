"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Package, TrendingUp, DollarSign } from "lucide-react";
import MenuCard from "./menu-card";
import AddMenuModal from "./add-menu-modal";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import {
  addMenu,
  getMenus,
  deleteMenu,
  updateMenu,
  getMenuStats,   // 👈 add this
} from "@/lib/api/menu-items";

export interface MenuType {
  id: number;
  name: string;
  items: number;
  orders: number;
  totalAmount: number;
  rating?: number; // 👈 Optional rating field
}

export default function MenuList() {
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Modals ---------- */
  const [open, setOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuType | null>(null);

  /* ---------- Delete confirmation ---------- */
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);

  /* ---------- Carousel ---------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ================= LOAD MENUS & STATS ================= */
  useEffect(() => {
    const fetchMenusAndStats = async () => {
      setLoading(true);
      try {
        // Fetch menus
        const menusData = await getMenus();

        // Fetch stats for each menu
        const menusWithStats = await Promise.all(
          menusData.map(async (menu) => {
            try {
              const stats = await getMenuStats(menu.id);
              return {
                ...menu,
                orders: stats?.orders || 0,
                totalAmount: stats?.totalAmount || 0,
                rating: stats?.rating || Math.random() * 2 + 3, // Mock rating 3-5
              };
            } catch (error) {
              console.error(`Error fetching stats for menu ${menu.id}:`, error);
              return {
                ...menu,
                orders: 0,
                totalAmount: 0,
                rating: Math.random() * 2 + 3, // Mock rating 3-5
              };
            }
          })
        );

        setMenus(menusWithStats);
      } catch (error) {
        console.error("Error fetching menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenusAndStats();
  }, []);

  /* ================= REFRESH MENU STATS ================= */
  const refreshMenuStats = async (menuId: number) => {
    try {
      const stats = await getMenuStats(menuId);
      setMenus(prev => prev.map(menu =>
        menu.id === menuId
          ? {
            ...menu,
            orders: stats?.orders || 0,
            totalAmount: stats?.totalAmount || 0,
            rating: stats?.rating || menu.rating
          }
          : menu
      ));
    } catch (error) {
      console.error(`Error refreshing stats for menu ${menuId}:`, error);
    }
  };

  /* ================= SCROLL STATE ================= */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateButtons = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    updateButtons();
    el.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [menus]);

  /* ================= SCROLL ACTIONS ================= */
  const scrollLeft = () => {
    const scrollAmount = window.innerWidth < 768 ? -280 : -360;
    scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    const scrollAmount = window.innerWidth < 768 ? 280 : 360;
    scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  /* ================= CRUD ================= */
  const handleAddMenu = async (name: string) => {
    const res = await addMenu(name);
    if (res.success) {
      setMenus(prev => [
        {
          id: res.id,
          name: res.name,
          items: 0,
          orders: 0,
          totalAmount: 0,
          rating: 4.0 // Default rating for new menu
        },
        ...prev,
      ]);
      setOpen(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteMenuId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMenuId) return;

    const res = await deleteMenu(deleteMenuId);
    if (res.success) {
      setMenus(prev => prev.filter(m => m.id !== deleteMenuId));
    }
    setDeleteMenuId(null);
  };

  const handleRenameMenu = (id: number) => {
    const menu = menus.find(m => m.id === id);
    if (menu) setEditMenu(menu);
  };

  const handleUpdateMenu = async (name: string) => {
    if (!editMenu) return;

    const res = await updateMenu(editMenu.id, name);
    if (res.success) {
      setMenus(prev =>
        prev.map(m =>
          m.id === editMenu.id ? { ...m, name } : m
        )
      );
      setEditMenu(null);
    }
  };

  return (
    <div className="p-4 sm:p-5 md:p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurant Menus</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage and track performance of all your menus
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
          >
            <span className="text-lg sm:text-xl">+</span>
            <span>Create Menu</span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
            <span>{menus.length} Total Menus</span>
          </div>
        </div>
      </div>

      {/* ================= CAROUSEL CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Menus</h2>
        </div>

        {menus.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all ${canScrollLeft
                ? 'hover:bg-gray-50 text-gray-700 border-gray-300'
                : 'text-gray-300 border-gray-200 cursor-not-allowed'}`}
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all ${canScrollRight
                ? 'hover:bg-gray-50 text-gray-700 border-gray-300'
                : 'text-gray-300 border-gray-200 cursor-not-allowed'}`}
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ================= MENUS CAROUSEL ================= */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scroll-smooth pb-6 sm:pb-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]">
                <div className="bg-white rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 h-[250px] sm:h-[260px] md:h-[270px] lg:h-[280px] animate-pulse">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                      <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                      <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                      <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                      <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : menus.length === 0 ? (
            // Empty State
            <div className="w-full max-w-2xl mx-auto text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 rounded-full mb-4 sm:mb-6">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No menus created yet</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
                Start by creating your first menu. Add items, set prices, and track orders all in one place.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Create Your First Menu
              </button>
            </div>
          ) : (
            // Menu Cards
            menus.map(menu => {
              return (
                <div key={menu.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]">
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-200 group">
                    {/* Header with Status */}
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-purple-700 transition-colors truncate" title={menu.name}>
                          {menu.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {menu.rating?.toFixed(1) || '4.0'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      {/* Items Count */}
                      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Items</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                              {menu.items}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Orders Count */}
                      <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Orders</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                              {menu.orders}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Revenue */}
                      {/* Revenue */}
                      <div className="col-span-2 flex items-center gap-3 bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600">Revenue</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                            ${menu.totalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleRenameMenu(menu.id)}
                        className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(menu.id)}
                        className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {open && (
        <AddMenuModal
          title="Create New Menu"
          onClose={() => setOpen(false)}
          onSave={handleAddMenu}
        />
      )}

      {editMenu && (
        <AddMenuModal
          title="Rename Menu"
          initialName={editMenu.name}
          onClose={() => setEditMenu(null)}
          onSave={handleUpdateMenu}
        />
      )}

      <ConfirmationModal
        isOpen={deleteMenuId !== null}
        onClose={() => setDeleteMenuId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu"
        description="This action will permanently delete the menu and all its data. This cannot be undone."
        confirmText="Delete Menu"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}