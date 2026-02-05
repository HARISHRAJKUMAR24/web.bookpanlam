"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadsUrl } from "@/config";
import { abbreviateNumber, getInitials } from "@/lib/utils";
import { Customer, CustomerOverviewCardProps } from "@/types";
import { formatPhoneNumber } from "react-phone-number-input";
import OverviewCard from "./overview-card";
import {
  Calendar,
  Calendar2,
  CalendarRemove,
  CalendarSearch,
  CalendarTick,
  Money,
} from "iconsax-react";
import getSymbolFromCurrency from "currency-symbol-map";
import { useEffect, useState } from "react";

const CustomerCard = ({ customer }: { customer: Customer }) => {
  const [overviewData, setOverviewData] = useState<CustomerOverviewCardProps[]>(
    []
  );

useEffect(() => {
  if (!customer) return;

  // ⭐ FIX: Safe currency extraction
  const currency =
    Array.isArray(customer.user?.siteSettings)
      ? customer.user.siteSettings[0]?.currency
      : customer.user?.siteSettings?.currency;

  const symbol = getSymbolFromCurrency(currency || "INR");

  setOverviewData([
    {
      value: symbol + abbreviateNumber(customer.countData.totalSpent, 0),
      label: "Total Spent",
      icon: <Money />,
      color: "lime",
    },
    {
      value: abbreviateNumber(customer.countData.appointments, 0),
      label: "Total Appts.",
      icon: <CalendarTick />,
      color: "blue",
    },
    {
      value: abbreviateNumber(customer.countData.paid, 0),
      label: "Paid Appts.",
      icon: <Calendar />,
      color: "green",
    },
    {
      value: abbreviateNumber(customer.countData.unpaid, 0),
      label: "Unpaid Appts.",
      icon: <CalendarSearch />,
      color: "orange",
    },
    {
      value: abbreviateNumber(customer.countData.booked, 0),
      label: "Booked Appts.",
      icon: <Calendar />,
      color: "indigo",
    },
    {
      value: abbreviateNumber(customer.countData.processing, 0),
      label: "Processing Appts.",
      icon: <Calendar2 />,
      color: "yellow",
    },
    {
      value: abbreviateNumber(customer.countData.completed, 0),
      label: "Completed Appts.",
      icon: <CalendarTick />,
      color: "green",
    },
    {
      value: abbreviateNumber(customer.countData.cancelled, 0),
      label: "Cancelled Appts.",
      icon: <CalendarRemove />,
      color: "red",
    },
    {
      value: abbreviateNumber(customer.countData.refund, 0),
      label: "Refunded",
      icon: <CalendarRemove />,
      color: "rose",
    },
  ]);
}, [customer]);


  return (
    <div className="grid gap-4">
      <div className="bg-white p-5 rounded-xl">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarImage
            src={uploadsUrl + "/" + customer.photo}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-4">
          <span className="font-bold text-4xl text-center block">
            {customer.name}
          </span>

          <span className="text-black/50 text-center block mt-1.5 font-medium">
            {formatPhoneNumber(customer.phone)}
          </span>
          <span className="text-black/50 text-center block mt-0.5 font-medium">
            {customer.email}
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {overviewData.map((item, index) => (
            <OverviewCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
