"use client";

import { useEffect, useState } from "react";
import AddCategoryModal from "./add-category-modal";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/item-categories";
import DeleteCategoryModal from "./delete-category-modal";
import { Plus, Edit2, Trash2, Loader2, FolderOpen, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export interface Category {
  id: number;
  name: string;
  items: number;
}

export default function ItemCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [processing, setProcessing] = useState(false);

  /* 🔄 LOAD */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ➕ ADD CATEGORY */
  const handleAdd = async (name: string): Promise<string | null> => {
    setProcessing(true);
    try {
      const exists = categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );

      if (exists) {
        return "A category with this name already exists";
      }

      const res = await addCategory(name);

      if (!res?.success) {
        return "Failed to save category. Please try again.";
      }

      setCategories((prev) => [
        { id: res.id, name: res.name, items: 0 },
        ...prev,
      ]);

      setOpen(false);
      toast.success("Category added successfully");
      return null;
    } catch (error) {
      toast.error("Failed to add category");
      return "An unexpected error occurred";
    } finally {
      setProcessing(false);
    }
  };

  /* ✏️ UPDATE CATEGORY */
  const handleUpdate = async (name: string): Promise<string | null> => {
    setProcessing(true);
    try {
      if (!edit) return "Invalid category";

      const exists = categories.some(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() &&
          c.id !== edit.id
      );

      if (exists) {
        return "A category with this name already exists";
      }

      const res = await updateCategory(edit.id, name);

      if (!res?.success) {
        return "Failed to update category. Please try again.";
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === edit.id ? { ...c, name } : c
        )
      );

      setEdit(null);
      toast.success("Category updated successfully");
      return null;
    } catch (error) {
      toast.error("Failed to update category");
      return "An unexpected error occurred";
    } finally {
      setProcessing(false);
    }
  };

  /* ❌ DELETE CATEGORY */
  const confirmDelete = async () => {
    if (!deleteCat) return;

    setProcessing(true);
    try {
      const res = await deleteCategory(deleteCat.id);

      if (res?.success) {
        setCategories(prev =>
          prev.filter(c => c.id !== deleteCat.id)
        );
        toast.success("Category deleted successfully");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setDeleteCat(null);
      setProcessing(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    if (category.items > 0) {
      // Show informative toast for non-deletable categories
      toast.error(
        `Cannot delete "${category.name}" because it contains ${category.items} item${category.items !== 1 ? 's' : ''}`,
        {
          duration: 4000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          }
        }
      );
    } else {
      setDeleteCat(category);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Item Categories</h1>
              </div>
              <p className="text-gray-600 ml-12">
                Organize your menu items into categories for better management
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              disabled={processing}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              <span className="relative">Add New Category</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Categories with Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {categories.filter(c => c.items > 0).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Empty Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {categories.filter(c => c.items === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Categories</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage and organize your menu item categories
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                {categories.length} total
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Category Name
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Menu Items
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Loading categories</p>
                          <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your data</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
                          <FolderOpen className="h-16 w-16 text-purple-400" />
                        </div>
                        <div className="max-w-md">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
                          <p className="text-gray-600 mb-6">
                            Start organizing your menu by creating categories. This helps customers find items easily and improves menu navigation.
                          </p>
                          <button
                            onClick={() => setOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Create Your First Category
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr 
                      key={cat.id} 
                      className="group hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-indigo-50/30 transition-all duration-300"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl group-hover:from-purple-200 group-hover:to-purple-100 transition-colors">
                            <FolderOpen className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-gray-900 font-semibold text-lg block">{cat.name}</span>
                            <span className="text-gray-500 text-sm">ID: {cat.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`
                            px-4 py-2 rounded-lg font-medium text-sm
                            ${cat.items > 0 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100' 
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'
                            }
                          `}>
                            <span className="font-bold">{cat.items}</span>
                            <span className="ml-1">item{cat.items !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-2 h-2 rounded-full
                            ${cat.items > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}
                          `}></div>
                          <span className={`text-sm font-medium ${cat.items > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                            {cat.items > 0 ? 'Active' : 'Empty'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEdit(cat)}
                            disabled={processing}
                            className="group/edit flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="h-4 w-4 group-hover/edit:scale-110 transition-transform" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            disabled={processing}
                            className={`
                              group/delete flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow
                              ${cat.items > 0 
                                ? 'text-gray-500 bg-gray-100 border border-gray-300 cursor-not-allowed' 
                                : 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:text-red-700'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            title={cat.items > 0 ? `Cannot delete: Contains ${cat.items} item${cat.items !== 1 ? 's' : ''}` : "Delete category"}
                          >
                            <Trash2 className={`h-4 w-4 ${cat.items > 0 ? '' : 'group-hover/delete:scale-110 transition-transform'}`} />
                            {cat.items > 0 ? 'Locked' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          {categories.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{categories.filter(c => c.items > 0).length} active categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span>{categories.filter(c => c.items === 0).length} empty categories</span>
                  </div>
                </div>
                <div className="text-gray-700 font-medium">
                  Total items across all categories: {categories.reduce((sum, cat) => sum + cat.items, 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {open && (
        <AddCategoryModal
          title="Add Item Category"
          onClose={() => setOpen(false)}
          onAdd={handleAdd}
          processing={processing}
        />
      )}

      {edit && (
        <AddCategoryModal
          title="Update Item Category"
          initialName={edit.name}
          onClose={() => setEdit(null)}
          onAdd={handleUpdate}
          processing={processing}
        />
      )}

      {deleteCat && (
        <DeleteCategoryModal
          name={deleteCat.name}
          itemsCount={deleteCat.items}
          onClose={() => setDeleteCat(null)}
          onConfirm={confirmDelete}
          processing={processing}
        />
      )}
    </div>
  );
}