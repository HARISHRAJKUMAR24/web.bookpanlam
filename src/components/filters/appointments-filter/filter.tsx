"use client";
import { Filter as FilterIcon } from "iconsax-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  APPOINTMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "@/constants";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const filters = [
  {
    title: "Status",
    key: "status",
    data: APPOINTMENT_STATUS,
  },
  {
    title: "Payment Status",
    key: "paymentStatus",
    data: PAYMENT_STATUS,
  },
  {
    title: "Payment Method",
    key: "paymentMethod",
    data: PAYMENT_METHODS,
  },
];

const Filter = () => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const [data, setData] = useState<{ [key: string]: string }>({
    status: "",
    paymentStatus: "",
    paymentMethod: "",
  });

  useEffect(() => {
    setData({
      status: searchParams.get("status") || "",
      paymentStatus: searchParams.get("paymentStatus") || "",
      paymentMethod: searchParams.get("paymentMethod") || "",
    });
  }, [searchParams]);

  const handleCheckboxChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    Object.keys(data).map((item) => {
      params.set(item, data[item]);
    });

    replace(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    Object.keys(data).map((item) => {
      params.delete(item);
    });

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger className="w-full sm:w-auto">
          <div className="bg-gray-100 text-gray-500 rounded-full h-12 px-4 sm:px-5 flex items-center justify-center gap-2 w-full text-sm sm:text-base">
            <FilterIcon variant="Bold" size={isMobile ? "18" : "20"} />
            <span className="truncate">Filter</span>
          </div>
        </PopoverTrigger>

        <PopoverContent 
          className="p-0 w-[90vw] max-w-sm sm:w-auto" 
          align={isMobile ? "center" : "end"}
        >
          <div className="p-3 sm:p-4">
            {filters.map((item, index: number, row) => (
              <div
                key={index}
                className={`space-y-2 sm:space-y-3 ${
                  index + 1 !== row.length && "border-b mb-3 sm:mb-5 pb-3 sm:pb-5"
                }`}
              >
                <h5 className="font-medium text-sm sm:text-base">{item.title}</h5>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                  {item.data.map((item2, index2: number) => (
                    <div key={index2} className="flex items-center space-x-2">
                      <Checkbox
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2"
                        id={item2.value}
                        value={item2.value}
                        checked={data[item.key] === item2.value}
                        onCheckedChange={(isChecked) => {
                          if (isChecked) {
                            handleCheckboxChange(item.key, item2.value);
                          } else {
                            handleCheckboxChange(item.key, "");
                          }
                        }}
                      />
                      <Label 
                        htmlFor={item2.value} 
                        className="text-xs sm:text-sm cursor-pointer"
                      >
                        {item2.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 px-3 sm:px-4 py-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleReset}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              type="button" 
              onClick={handleApply}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default Filter;