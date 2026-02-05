"use client";

import { formatDate, formatNumber } from "@/lib/utils";
import { Coupon } from "@/types";
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
import Link from "next/link";
import { deleteCoupon } from "@/lib/api/coupons";
import getSymbolFromCurrency from "currency-symbol-map";
import { Badge } from "@/components/ui/badge";

function Action({ id, couponId }: { id: number; couponId: string }) {
  const { refresh } = useRouter();

  const handleDelete = async () => {
    try {
      const response = await deleteCoupon(couponId);
      toast.success(response.message);
      refresh();
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
      <DropdownMenuContent align="end" className="w-[160px] sm:w-[200px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href={`/coupons/${couponId}`}>
            <DropdownMenuItem className="text-blue-600 text-xs sm:text-sm">
              <Edit variant="Bold" className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs sm:text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 w-full">
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
                  This action cannot be undone. This will permanently remove
                  your coupon from our servers.
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

export const columns: ColumnDef<Coupon>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return row.index + 1;
    },
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Coupon Name",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate" title={row.original.name}>
        {row.original.name}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm font-mono bg-gray-100 px-2 py-1 rounded">
        {row.original.code}
      </span>
    ),
    size: 120,
  },
  {
    header: "Discount",
    cell: ({ row }) => {
      const data = row.original;

      const currency = Array.isArray(data?.user?.siteSettings)
        ? data.user.siteSettings[0]?.currency ?? "USD"
        : data?.user?.siteSettings?.currency ?? "USD";
      const symbol = getSymbolFromCurrency(currency) ?? "$";

      let content;

      if (data.discountType === "percentage") {
        content = `${formatNumber(data.discount)}%`;
      } else {
        content = `${symbol}${formatNumber(data.discount)}`;
      }

      return <span className="block text-xs sm:text-sm">{content}</span>;
    },
    size: 100,
  },
  {
    header: "Start Date",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <Badge
          variant="outline"
          className="font-medium bg-green-500 border-green-500 text-white text-xs sm:text-sm"
        >
          {formatDate(new Date(data.startDate)).split(", ")[0]}
        </Badge>
      );
    },
    size: 110,
  },
  {
    header: "End Date",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <Badge
          variant="outline"
          className="font-medium bg-orange-500 border-orange-500 text-white text-xs sm:text-sm"
        >
          {formatDate(new Date(data.endDate)).split(", ")[0]}
        </Badge>
      );
    },
    size: 110,
  },
  {
    header: "Created At",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {formatDate(new Date(data.createdAt)).replace(/\,\s*\d+.*$/, "")}
        </span>
      );
    },
    size: 120,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const data = row.original;

      return <Action id={data.id} couponId={data.couponId} />;
    },
    size: 80,
  },
];