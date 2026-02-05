// import axios from "axios";
// import { apiUrl } from "@/config";

// const handleAxiosResponse = (res: any) => {
//   if (!res || typeof res.data !== "object") {
//     console.warn("⚠️ Invalid server response:", res);
//     return { success: false, message: "Invalid response from server" };
//   }
//   return res.data;
// };

// const handleAxiosError = (err: any) => {
//   const serverData = err?.response?.data;

//   console.error("🔥 SERVER RAW ERROR =", serverData);
//   console.error("🔥 SERVER STATUS =", err?.response?.status);
//   console.error("🔥 SERVER MESSAGE =", err?.message);

//   if (serverData && typeof serverData === "object") {
//     return {
//       success: false,
//       message: serverData.message || "Server returned an error",
//       data: serverData.data || null,
//     };
//   }

//   return { success: false, message: err.message || "Network error" };
// };

// /* -----------------------------------------
//    CREATE DOCTOR SCHEDULE (CLIENT)
// ----------------------------------------- */
// export const addDoctorScheduleClient = async (payload: any) => {
//   try {
//     console.log("📤 SENDING PAYLOAD =", payload);

//     const res = await axios.post(
//       `${apiUrl}/seller/doctor_schedule/create.php`,
//       payload,
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("📥 API RESPONSE =", res?.data);

//     return handleAxiosResponse(res);
//   } catch (err: any) {
//     return handleAxiosError(err);
//   }
// };

// /* -----------------------------------------
//    UPDATE DOCTOR SCHEDULE (CLIENT)
// ----------------------------------------- */
// export const updateDoctorScheduleClient = async (id: number, payload: any) => {
//   try {
//     console.log("📤 UPDATING PAYLOAD =", payload);

//     const res = await axios.post(
//       `${apiUrl}/seller/doctor_schedule/update.php?id=${id}`,
//       payload,
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("📥 UPDATE RESPONSE =", res?.data);

//     return handleAxiosResponse(res);
//   } catch (err: any) {
//     return handleAxiosError(err);
//   }
// };
