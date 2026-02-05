"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from "@/constants";
import { Label } from "../ui/label";
import { TickCircle } from "iconsax-react";
import { Appointment, Employee, Option } from "@/types";
import { useEffect, useState } from "react";
import { getAllEmployees } from "@/lib/api/employees";
import { Input } from "../ui/input";
import getSymbolFromCurrency from "currency-symbol-map";
import { Button } from "../ui/button";
import { updateAppointment } from "@/lib/api/appointments";
import { handleToast } from "@/lib/utils";
import { toast } from "sonner";

const AppointmentActionForm = ({
  appointment,
}: {
  appointment: Appointment;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selects, setSelects] = useState([
    {
      label: "Status",
      key: "status",
      options: APPOINTMENT_STATUS,
    },
    {
      label: "Payment Status",
      key: "paymentStatus",
      options: PAYMENT_STATUS,
    },
  ]);
const currency =
  Array.isArray(appointment.user?.siteSettings)
    ? appointment.user.siteSettings[0]?.currency
    : appointment.user?.siteSettings?.currency;

  const [data, setData] = useState<{ [key: string]: string | number }>({
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
    employee: 0,
    employeeCommission: 0,
  });

  useEffect(() => {
    setData({
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
      employee: appointment.employeeId?.toString(),
      employeeCommission: appointment.employeeCommission,
    });
  }, [appointment]);

  useEffect(() => {
    async function fetchEmployees() {
      const employees = await getAllEmployees({ limit: 999 });
      let options: Option[] = [];

      employees.records.map((employee: Employee) => {
        options.push({
          label: employee.name + " - " + employee.position,
          value: employee.id.toString(),
        });
      });

      setSelects((prev) =>
        !prev.find((item) => item.key === "employee")
          ? [...prev, { label: "Employee", key: "employee", options }]
          : prev
      );
    }
    fetchEmployees();
  }, []);

  const handleSave = async () => {
    try {
      const result = await updateAppointment(appointment.appointmentId, {
        status: data.status as string,
        paymentStatus: data.paymentStatus as string,
        employeeId: parseInt(data.employee as string),
        employeeCommission: data.employeeCommission as string,
      });

      handleToast(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl p-5 flex items-center flex-wrap justify-between gap-x-6 gap-y-3">
        <div className="flex items-center flex-wrap gap-x-6 gap-y-3">
          {selects.map((item, index: number) => (
            <div className="space-y-2" key={index}>
              <Label>{item.label}</Label>

              <Select
                value={data[item.key] as string}
                onValueChange={(value) => {
                  if (
                    item.key === "status" &&
                    value === "Completed" &&
                    !data.employee
                  ) {
                    return toast.error("Please select a employee to continue");
                  }

                  setData((prev) => ({ ...prev, [item.key]: value }));
                }}
                onOpenChange={(status) =>
                  status == true &&
                  item.key === "employee" &&
                  setIsModalOpen(true)
                }
                disabled={
                  (item.key === "paymentStatus" &&
                    appointment.paymentStatus === "Paid") ||
                  appointment.status === "Completed" ||
                  appointment.status === "Cancelled"
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {item.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary text-white rounded-full h-12 px-5 flex items-center justify-center gap-2 w-full sm:w-auto transition hover:bg-primary/90"
          >
            <TickCircle />
            Save
          </button>
        </div>
      </div>

      {/* Employee Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={() => setIsModalOpen((prev) => !prev)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Employee</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label>Employee</Label>

              <Select
                value={data["employee"] as string}
                onValueChange={(value) => {
                  setData((prev) => ({ ...prev, ["employee"]: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selects
                    .find((item) => item.key === "employee")
                    ?.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Commission</Label>

              <Input
                type="number"
           placeholder={getSymbolFromCurrency(currency || "INR")}

                value={data.employeeCommission}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    employeeCommission: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentActionForm;
