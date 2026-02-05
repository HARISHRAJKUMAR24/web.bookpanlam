import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/manager.bookpanlam/public/';

export const addDoctorScheduleClient = async (data: any) => {
  try {
    const response = await fetch(
      `${apiUrl}/seller/doctor_schedule/create.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const updateDoctorScheduleClient = async (id: number, data: any) => {
  try {
    console.log("Updating doctor schedule with ID:", id, "Data:", data);
    
    const response = await fetch(
      `${apiUrl}/seller/doctor_schedule/update.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    const result = await response.json();
    console.log("Update response:", result);
    return result;
  } catch (error: any) {
    console.error("Update error:", error);
    throw error.message || "Update failed";
  }
};

export const fetchDoctorsClient = async (userId: number) => {
  try {
    const res = await axios.post(
      `${apiUrl}/seller/categories/list.php`,
      { user_id: userId }
    );
    return res.data?.data ?? [];
  } catch (err: any) {
    console.error("Fetch doctors error:", err);
    return [];
  }
};

export const getDoctorSchedules = async ({
  limit = 10,
  page = 1,
  q = "",
}: {
  limit?: number;
  page?: number;
  q?: string;
}) => {
  try {
    const res = await axios.get(
      `${apiUrl}/seller/doctor_schedule/list.php`,
      {
        params: { limit, page, q },
        withCredentials: true,
      }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed");
    }

    return {
      records: res.data.records,
      totalRecords: res.data.totalRecords,
      totalPages: res.data.totalPages,
    };
  } catch (error) {
    console.error("Doctor schedule fetch error:", error);
    return {
      records: [],
      totalRecords: 0,
      totalPages: 1,
    };
  }
};

export const deleteDoctorSchedule = async (id: string) => {
  const res = await axios.delete(
    `${apiUrl}/seller/doctor_schedule/delete.php`,
    {
      params: { id },
      withCredentials: true,
    }
  );

  return res.data;
};

// Add these to your api.ts file
export const fetchTokenHistory = async (categoryId: string, batchId?: string) => {
  try {
    const params = new URLSearchParams({
      category_id: categoryId.toString(),
    });
    
    if (batchId) {
      params.append('batch_id', batchId);
    }
    
    const res = await axios.get(
      `${apiUrl}/seller/doctor_schedule/token_history.php?${params}`,
      { withCredentials: true }
    );
    
    return res.data;
  } catch (error) {
    console.error("Token history fetch error:", error);
    return { success: false, data: [] };
  }
};

export const updateToken = async (data: {
  category_id: string;
  batch_id: string;
  action: 'set' | 'increase' | 'decrease';
  value: number;
}) => {
  try {
    const res = await axios.post(
      `${apiUrl}/seller/doctor_schedule/token_history.php`,
      data,
      { withCredentials: true }
    );
    
    return res.data;
  } catch (error) {
    console.error("Token update error:", error);
    throw error;
  }
};