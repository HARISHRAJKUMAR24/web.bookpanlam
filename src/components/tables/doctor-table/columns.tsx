"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DoctorSchedule } from "@/types";
import { formatNumber } from "@/lib/utils";
import { useState } from "react";

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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { deleteDoctorSchedule } from "@/lib/api/doctor_schedule";

/* --------------------------------
   Helpers
--------------------------------- */

const getSrc = (path?: string | null) => {
  if (!path) return "/placeholder-image.jpg";

  // already full URL
  if (path.startsWith("http")) return path;

  // ✅ CORRECT base path
  return `http://localhost/manager.bookpanlam/public/uploads/${path}`;
};

const formatPrettyDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* --------------------------------
   Action Menu
--------------------------------- */

function Action({ serviceId }: { serviceId: string }) {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await deleteDoctorSchedule(serviceId);
      toast.success(res.message || "Deleted successfully");

      setDialogOpen(false);
      setMenuOpen(false);

      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <More className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[160px] sm:w-[180px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">
          Actions
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <Link href={`/hos-opts/${serviceId}`}>
            <DropdownMenuItem className="text-blue-600 text-xs sm:text-sm">
              <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-red-600 text-xs sm:text-sm"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">
                  Delete doctor?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDialogOpen(false)}
                  className="text-xs sm:text-sm"
                >
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

/* --------------------------------
   Table Columns
--------------------------------- */

export const columns: ColumnDef<DoctorSchedule>[] = [
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 50,
  },

  {
    header: "Doctor",
    cell: ({ row }) => {
      const d = row.original;

      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={getSrc(d.image)}
            alt={d.name || "Doctor"}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/placeholder-image.jpg";
            }}
          />

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate" title={d.name}>
              {d.name || "Unnamed Doctor"}
            </p>
          </div>
        </div>
      );
    },
    size: 200,
  },

  {
    header: "Specialization",
    cell: ({ row }) => (
      <span
        className="text-xs sm:text-sm truncate"
        title={row.original.specialization || undefined}
      >
        {row.original.specialization || "—"}
      </span>
    ),
    size: 150,
  },

  {
    header: "Qualification",
    cell: ({ row }) => (
      <span
        className="text-xs sm:text-sm truncate"
        title={row.original.qualification || undefined}
      >
        {row.original.qualification || "—"}
      </span>
    ),
    size: 150,
  },
  {
    header: "Qualification",
    cell: ({ row }) => {
      const qual = row.original.qualification;
      return (
        <span
          className="text-xs sm:text-sm truncate"
          title={qual ? qual : undefined}
        >
          {qual || "—"}
        </span>
      );
    },
    size: 150,
  },

  {
    header: "Fees",
    cell: ({ row }) => (
      <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
        ₹{formatNumber(Number(row.original.amount || 0))}
      </span>
    ),
    size: 100,
  },

  {
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm whitespace-nowrap">
        {formatPrettyDate(row.original.createdAt)}
      </span>
    ),
    size: 120,
  },

  {
    header: "Action",
    cell: ({ row }) => (
      <Action serviceId={String(row.original.serviceId)} />
    ),
    size: 80,
  },
];