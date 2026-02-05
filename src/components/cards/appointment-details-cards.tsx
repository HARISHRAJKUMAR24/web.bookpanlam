"use client";
import {
  Calendar,
  CallCalling,
  Clock,
  DollarCircle,
  InfoCircle,
  Message,
  MoneyRecive,
  NoteText,
  Personalcard,
  RecordCircle,
  TaskSquare,
  User,
} from "iconsax-react";
import ListCard from "./list-card";
import {
  calculateGST,
  formatDate,
  formatNumber,
  getInitials,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Appointment } from "@/types";
import { useEffect, useState } from "react";
import { uploadsUrl } from "@/config";
import getSymbolFromCurrency from "currency-symbol-map";

interface ListProps {
  title: string;
  order: number;
  icon: React.ReactElement;
  list: any[];
  color?: string;
}

const AppointmentDetailsCards = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  const [lists, setLists] = useState<ListProps[]>([
    {
      title: "Appointment Details",
      order: 1,
      icon: <Calendar />,
      list: [
        {
          icon: <RecordCircle />,
          label: "Appointment ID",
          value: `#${appointment.appointmentId}`,
        },
        {
          icon: <Calendar />,
          label: "Date",
          value: formatDate(new Date(appointment.date)).split(", ")[0],
        },
        {
          icon: <Clock />,
          label: "Time",
          value: appointment.time,
        },
        {
          icon: <NoteText />,
          label: "Remark",
          value: appointment.remark,
        },
      ],
      color: "blue",
    },
    {
      title: "Customer Address",
      order: 3,
      icon: <Personalcard />,
      list: [
        {
          label: "Name",
          value: appointment.name,
        },
        {
          label: "Mobile",
          value: appointment.phone,
        },
        {
          label: "Address",
          value: appointment.address,
        },
        {
          label: "Area",
          value: appointment.area,
        },
        {
          label: "Postal Code",
          value: appointment.postalCode,
        },
      ],
      color: "indigo",
    },
  ]);

  useEffect(() => {
    if (appointment.customer && !lists.find((item) => item.order === 2)) {
      const obj: ListProps = {
        title: "Customer Info",
        order: 2,
        icon: <User />,
        list: [
          {
            icon: <RecordCircle />,
            label: "ID No.",
            value: appointment.customer.customerId.toString(),
          },
          {
            icon: <User />,
            label: "Customer",
            value: (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={uploadsUrl + "/" + appointment.customer.photo}
                  />
                  <AvatarFallback>
                    {getInitials(appointment.customer.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <span className="block font-medium text-sm">
                    {appointment.customer.name}
                  </span>
                </div>
              </div>
            ),
          },
          {
            icon: <CallCalling />,
            label: "Mobile",
            value: appointment.customer.phone,
          },
          {
            icon: <Message />,
            label: "Email",
            value: appointment.customer.email,
          },
        ],
        color: "orange",
      };

      setLists((prev) =>
        !prev.find((item) => item.order === 2) ? [...prev, obj] : prev
      );
    }

    if (appointment.employee && !lists.find((item) => item.order === 4)) {
      const obj: ListProps = {
        title: "Assigned Employee",
        order: 4,
        icon: <User />,
        list: [
          {
            icon: <User />,
            label: "Employee",
            value: (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={uploadsUrl + "/" + appointment.employee.image}
                  />
                  <AvatarFallback>
                    {getInitials(appointment.employee.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <span className="block font-medium text-sm">
                    {appointment.employee.name}
                  </span>
                </div>
              </div>
            ),
          },
          {
            icon: <CallCalling />,
            label: "Mobile",
            value: appointment.employee.phone,
          },
          {
            icon: <DollarCircle />,
            label: "Commission",
            value:
              getSymbolFromCurrency(getCurrency()) +
              formatNumber(appointment.employeeCommission),

          },
        ],
        color: "green",
      };

      setLists((prev) =>
        !prev.find((item) => item.order === 4) ? [...prev, obj] : prev
      );
    }

    const obj: ListProps = {
      title: "Payment & Service Info",
      order: 5,
      icon: <InfoCircle />,
      list: [
        {
          icon: <TaskSquare />,
          label: "Service",
          value: appointment?.service?.name,
        },
        {
          icon: <MoneyRecive />,
          label: "Payment Method",
          value: appointment.paymentMethod,
        },
        appointment.paymentId && {
          icon: <MoneyRecive />,
          label: "Payment Id",
          value: appointment.paymentId,
        },
        {
          icon: <DollarCircle />,
          label: "Subtotal",
          value:
            getSymbolFromCurrency(getCurrency()) +
            formatNumber(parseInt(appointment.amount)),

        },
        appointment.gstPercentage && {
          icon: <DollarCircle />,
          label: "GST",
          value:
            getSymbolFromCurrency(getCurrency()) +
            formatNumber(
              parseInt(
                calculateGST(
                  parseInt(appointment.amount),
                  appointment.gstPercentage,
                  appointment?.gstType === "inclusive"
                ).gstAmount
              )
            ),
        },
        {
          icon: <DollarCircle />,
          label: "Charges",
          value:
            getSymbolFromCurrency(getCurrency()) +
            formatNumber(parseInt(appointment.charges)),
        },
        {
          icon: <DollarCircle />,
          label: "Total",
          value:
            getSymbolFromCurrency(getCurrency()) +
            formatNumber(
              parseInt(
                calculateGST(
                  parseInt(appointment.amount),
                  appointment.gstPercentage as number,
                  appointment?.gstType === "inclusive"
                ).totalAmount
              ) + parseInt(appointment.charges)
            ),
        },
      ].filter(Boolean),
      color: "red",
    };

    setLists((prev) =>
      !prev.find((item) => item.order === 5) ? [...prev, obj] : prev
    );
  }, [appointment]);

  const getCurrency = () => {
    const settings = appointment.user?.siteSettings;

    if (!settings) return "₹"; // fallback if nothing exists

    // If it's an array → use first item
    if (Array.isArray(settings)) {
      return settings[0]?.currency ?? "₹";
    }

    // If it's a single object
    return settings.currency ?? "₹";
  };


  return (
    <div className="grid 4xl:grid-cols-4 2xl:grid-cols-3 sm:grid-cols-2 gap-5">
      {lists
        .sort((a, b) => a.order - b.order)
        .map((item: ListProps, index: number) => (
          <ListCard
            key={index}
            title={item.title}
            icon={item.icon}
            list={item.list}
            color={item.color}
          />
        ))}
    </div>
  );
};

export default AppointmentDetailsCards;
