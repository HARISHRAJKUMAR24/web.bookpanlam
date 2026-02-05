"use client";

import { formatDate } from "@/lib/utils";
import { Category } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Edit, More, Trash } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/api/categories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ===============================
   HELPERS
================================ */
const truncate = (text: string, limit = 25) =>
  text?.length > limit ? text.slice(0, limit) + "…" : text;

const safeFormatDate = (value?: string) => {
  console.log("FORMAT INPUT =>", value);

  if (!value) return "—";

  const iso = value.includes(" ")
    ? value.replace(" ", "T") + "Z"
    : value;

  console.log("ISO VALUE =>", iso);

  const date = new Date(iso);

  console.log("DATE OBJECT =>", date);

  if (isNaN(date.getTime())) {
    console.log("❌ INVALID DATE");
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ===============================
   ACTION MENU
================================ */
function Action({ categoryId }: { categoryId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await deleteCategory(categoryId);
      toast.success(response.message);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <More className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 sm:w-[200px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">Actions</DropdownMenuLabel>

        <DropdownMenuGroup>
          <Link href={`/categories/${categoryId}`}>
            <DropdownMenuItem className="text-blue-600 text-xs sm:text-sm">
              <Edit variant="Bold" className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <button
                className="relative flex w-full cursor-default select-none items-center 
                rounded-sm px-2 py-1.5 text-xs sm:text-sm outline-none transition-colors 
                hover:bg-accent hover:text-accent-foreground text-red-600"
              >
                <Trash variant="Bold" className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Delete
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This action will permanently delete the category.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="mt-0 w-full sm:w-auto text-xs sm:text-sm">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===============================
   TABLE COLUMNS
================================ */
export const columns: ColumnDef<Category>[] = [
  {
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm">{row.index + 1}</span>
    ),
  },

  {
    header: "Image",
    cell: ({ row }) => {
      const img = row.original.doctorDetails?.doctorImage;

      const isValid = img && typeof img === "string" && img.includes(".");

      if (!isValid) {
        return (
          <div className="w-10 h-10 sm:w-[50px] sm:h-[50px] rounded bg-gray-200 border flex items-center justify-center text-xs text-gray-500">
            N/A
          </div>
        );
      }

      return (
        <Image
          src={img}
          alt={row.original.doctorDetails?.doctorName || "doctor"}
          width={50}
          height={50}
          className="rounded object-cover border w-10 h-10 sm:w-[50px] sm:h-[50px]"
          unoptimized
        />
      );
    },
  },

  {
    header: "Category Name",
    cell: ({ row }) => (
      <span 
        title={row.original.name}
        className="text-xs sm:text-sm truncate block max-w-[120px] sm:max-w-[200px]"
      >
        {truncate(row.original.name, 20)}
      </span>
    ),
  },

  {
    header: "Category Slug",
    cell: ({ row }) => (
      <span 
        title={row.original.slug}
        className="text-xs sm:text-sm truncate block max-w-[120px] sm:max-w-[200px]"
      >
        {truncate(row.original.slug, 20)}
      </span>
    ),
  },

  // ⭐ NEW doctor columns
  {
    header: "Doctor Name",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate block max-w-[100px] sm:max-w-none">
        {row.original.doctorDetails?.doctorName ?? "—"}
      </span>
    ),
  },
  {
    header: "Specialization",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate block max-w-[100px] sm:max-w-none">
        {row.original.doctorDetails?.specialization ?? "—"}
      </span>
    ),
  },
  {
    header: "Qualification",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate block max-w-[100px] sm:max-w-none">
        {row.original.doctorDetails?.qualification ?? "—"}
      </span>
    ),
  },

  {
    header: "Action",
    cell: ({ row }) => (
      <Action categoryId={row.original.categoryId} />
    ),
  },
];