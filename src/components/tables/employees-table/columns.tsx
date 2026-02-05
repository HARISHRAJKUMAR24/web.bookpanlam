"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatNumber,
  getInitials,
} from "@/lib/utils";
import { formatPhoneNumber } from "react-phone-number-input";
import { Employee } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

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
import { deleteEmployee } from "@/lib/api/employees";
import Link from "next/link";

/* ===============================
   HELPERS
================================ */
const truncate = (text?: string, limit = 25) =>
  text && text.length > limit ? text.slice(0, limit) + "…" : text;

/* ===============================
   ACTION MENU
================================ */
function Action({ id, employeeId }: { id: number; employeeId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await deleteEmployee(id);
      toast.success(response.message);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <More />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuGroup>
          <Link href={`/employees/${employeeId}`}>
            <DropdownMenuItem className="text-blue-600">
              <Edit variant="Bold" className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-red-600">
                <Trash variant="Bold" className="mr-2 h-4 w-4" />
                Delete
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
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
export const columns: ColumnDef<Employee>[] = [
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },

  {
    header: "Employee",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={
                data.image
                  ? `http://localhost/manager.bookpanlam/public${data.image}`
                  : "/default-user.png"
              }
            />
            <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
          </Avatar>

          <div className="max-w-[220px]">
            {/* ✅ NAME (25 chars) */}
            <span
              className="block font-medium text-sm truncate"
              title={data.name}
            >
              {truncate(data.name, 25)}
            </span>

            {/* ✅ POSITION (25 chars) */}
            <span
              className="text-xs text-black/50 truncate"
              title={data.position}
            >
              <span className="text-green-500">
                {truncate(data.position, 25)}
              </span>
              {data.address ? ` - ${data.address}` : ""}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    header: "Mobile Number",
    cell: ({ row }) => {
      const data = row.original;
      return <Link href={`tel:${data.phone}`}>{formatPhoneNumber(data.phone)}</Link>;
    },
  },

  {
    header: "Email Address",
    cell: ({ row }) => {
      const data = row.original;
      return <Link href={`mailto:${data.email}`}>{data.email}</Link>;
    },
  },

  // {
  //   header: "Earnings",
  //   cell: ({ row }) => {
  //     const data = row.original;

  //     if (!data.earnings || isNaN(Number(data.earnings))) {
  //       return <span className="block text-center">-</span>;
  //     }

  //     return formatNumber(data.earnings);
  //   },
  // },

  {
    header: "Joined Date",
    cell: ({ row }) => {
      const data = row.original;

      if (!data.joining_date || data.joining_date === "0000-00-00") {
        return "-";
      }

return new Date(data.joining_date).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
    },
  },

  {
    header: "Action",
    cell: ({ row }) => {
      const data = row.original;
      return <Action id={data.id} employeeId={data.employee_id} />;
    },
  },
];
