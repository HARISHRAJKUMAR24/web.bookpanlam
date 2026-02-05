"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  abbreviateNumber,
  formatDate,
  formatNumber,
  getInitials,
} from "@/lib/utils";
import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import { Customer } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import getSymbolFromCurrency from "currency-symbol-map";
import { uploadsUrl } from "@/config";
import Link from "next/link";

export const columns: ColumnDef<Customer>[] = [
  {
    header: "Customer",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Link
          href={`/customers/${data.customerId}`}
          className="flex items-center gap-2 sm:gap-3"
        >
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={uploadsUrl + "/" + data.photo} />
            <AvatarFallback className="text-xs sm:text-sm">
              {getInitials(data.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <span className="block font-medium text-xs sm:text-sm text-primary truncate">
              {data.name}
            </span>
            <span className="text-xs text-black/50 truncate block">
              {formatPhoneNumber(data.phone)}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "Customer ID",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate">{row.original.customerId}</span>
    ),
  },
  {
    header: "Mobile Number",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="text-xs sm:text-sm truncate">
          {formatPhoneNumberIntl(data.phone)}
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => (
      <span className="text-xs sm:text-sm truncate">{row.original.email}</span>
    ),
  },
  {
    header: "Total Appointments",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="text-xs sm:text-sm">
          {abbreviateNumber(data.countData.appointments)}
        </span>
      );
    },
  },
  {
    header: "Total Spent",
    cell: ({ row }) => {
      const data = row.original;

      // FIX: Normalize siteSettings
      const settings = Array.isArray(data.user?.siteSettings)
        ? data.user?.siteSettings[0]
        : data.user?.siteSettings;

      const currency = settings?.currency ?? "USD";
      const symbol = getSymbolFromCurrency(currency) ?? "$";

      return (
        <span className="text-xs sm:text-sm">
          {symbol + formatNumber(data.countData.totalSpent)}
        </span>
      );
    },
  },
  {
    header: "Account Creation Date",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="text-xs sm:text-sm truncate">
          {formatDate(new Date(data.createdAt))}
        </span>
      );
    },
  },
];