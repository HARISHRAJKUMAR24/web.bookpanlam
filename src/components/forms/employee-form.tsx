"use client";

import { useState, useEffect } from "react";
import EmployeeDetails from "./employee-forms/employee-details";
import Sticky from "../sticky";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { handleToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { EmployeeFormProps } from "@/types";
import { addEmployee, updateEmployee } from "@/lib/api/employees";
import EmployeeImage from "./employee-forms/category-image";
import useCurrentUser from "@/hooks/useCurrentUser";

const EmployeeForm = ({ employeeId, employeeData, isEdit }: EmployeeFormProps) => {
  const router = useRouter();
  const { userData } = useCurrentUser();
  console.log("🔥 USER DATA FROM HOOK =>", userData);
  console.log("🔥 REAL USER ID =>", userData?.user_id);

  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [joining_date, setJoiningDate] = useState("");

  // ⭐ GET CORRECT SELLER ID
  const realUserId = userData?.user_id ?? userData?.id;

  useEffect(() => {
    if (employeeData) {
      setName(employeeData.name || "");
      setPosition(employeeData.position || "");
      setEmail(employeeData.email || "");
      setPhone(employeeData.phone || "");
      setAddress(employeeData.address || "");
      setImage(employeeData.image || null);
      setJoiningDate(employeeData.joining_date || "");
    }
  }, [employeeData]);

  const handleSave = async () => {
    if (!realUserId) {
      toast.error("User ID missing");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        user_id: realUserId,   // ← REQUIRED
        employee_id: employeeId,
        name,
        position,
        email,
        phone,
        address,
        image: image ?? "", joining_date,
      };


      const response = isEdit
        ? await updateEmployee(employeeData.employee_id, data)
        : await addEmployee(data);

      // ⭐ CONSOLE HERE
      console.log("EMPLOYEE SAVE RESPONSE =>", response);

      handleToast(response);

      if (response.success) {
        router.replace("/employees");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message);
    }

    setIsLoading(false);
  };



  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-7 col-span-12 grid gap-5">
          <EmployeeDetails
            name={{ value: name, setValue: setName }}
            position={{ value: position, setValue: setPosition }}
            email={{ value: email, setValue: setEmail }}
            phone={{ value: phone, setValue: setPhone }}
            address={{ value: address, setValue: setAddress }}
            joining_date={{ value: joining_date, setValue: setJoiningDate }}
          />
        </div>

        <div className="lg:col-span-5 col-span-12">
          <EmployeeImage
            images={{ value: image ?? "", setValue: setImage }}
            userId={realUserId ?? ""}
          />

        </div>
      </div>

      <Sticky>
        <Button onClick={handleSave} disabled={isLoading} isLoading={isLoading}>
          Save
        </Button>
      </Sticky>
    </>
  );
};

export default EmployeeForm;
