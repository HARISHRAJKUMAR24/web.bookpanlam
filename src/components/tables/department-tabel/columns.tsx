"use client";

import { formatDate } from "@/lib/utils";
import { Department } from "@/types";
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
import { deleteDepartment } from "@/lib/api/departments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ===============================
   HELPERS
================================ */
const truncate = (text: string | undefined, limit = 25) =>
  text && text.length > limit ? text.slice(0, limit) + "…" : text ?? "—";

const safeFormatDate = (value: string | undefined) => {
  if (!value) return "—";

  const iso = value.includes(" ")
    ? value.replace(" ", "T") + "Z"
    : value;

  const date = new Date(iso);

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ===============================
   ACTION MENU
================================ */
function Action({ departmentId }: { departmentId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await deleteDepartment(departmentId);
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

      <DropdownMenuContent align="end" className="w-[160px] sm:w-[180px] md:w-[200px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">Actions</DropdownMenuLabel>

        <DropdownMenuGroup>
          <Link href={`/departments/${departmentId}`}>
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

            <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  This action will permanently delete the department.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs sm:text-sm">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="text-xs sm:text-sm"
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
export const columns: ColumnDef<Department>[] = [
  {
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm">{row.index + 1}</span>
    ),
    size: 50,
  },

  {
    header: "Image",
    cell: ({ row }) => {
      const data = row.original;
      const img = data.image;

      const isValid =
        img &&
        typeof img === "string" &&
        img.includes(".");

      if (!isValid) {
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-[50px] md:h-[50px] rounded bg-gray-200 border flex items-center justify-center text-xs text-gray-500">
            N/A
          </div>
        );
      }

      return (
        <Image
          src={img}
          alt={data.name ?? "Department"}
          width={50}
          height={50}
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-[50px] md:h-[50px] rounded object-cover border"
          unoptimized
        />
      );
    },
    size: 70,
  },

  {
    header: "Department Name",
    cell: ({ row }) => (
      <span 
        className="text-xs sm:text-sm truncate" 
        title={row.original.name}
      >
        {truncate(row.original.name, 20)}
      </span>
    ),
    size: 200,
  },

  {
    header: "Department Slug",
    cell: ({ row }) => (
      <span 
        className="text-xs sm:text-sm truncate font-mono bg-gray-100 px-1.5 py-0.5 rounded" 
        title={row.original.slug}
      >
        {truncate(row.original.slug, 15)}
      </span>
    ),
    size: 180,
  },

  {
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm whitespace-nowrap">
        {safeFormatDate(row.original.createdAt)}
      </span>
    ),
    size: 120,
  },

  {
    header: "Action",
    cell: ({ row }) => (
      <Action departmentId={row.original.department_id} />
    ),
    size: 80,
  },
];