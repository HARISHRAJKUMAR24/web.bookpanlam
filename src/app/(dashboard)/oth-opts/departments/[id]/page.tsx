"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDepartmentById } from "@/lib/api/departments";
import OtherForm from "@/components/forms/other-form";

const Page = () => {
  const params = useParams();
const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getDepartmentById(id);
        setDepartment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-7 h-7" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center text-red-500 py-20">
        Department not found
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Department Options</h1>
      <OtherForm department={department} />
    </div>
  );
};

export default Page;
