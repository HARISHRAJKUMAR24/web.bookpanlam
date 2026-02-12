"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  doctors: string[];
}

export const DoctorFilter = ({ doctors }: Props) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("doctor", value);
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      value={searchParams.get("doctor") || "all"}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select Doctor" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Doctors</SelectItem>
        {doctors.map((doc, i) => (
          <SelectItem key={i} value={doc}>
            {doc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
