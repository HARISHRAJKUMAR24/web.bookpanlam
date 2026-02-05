import { apiUrl } from "@/config";
import axios, { AxiosResponse } from "axios";

const route = "/files";

// Upload File
export const uploadFile = async (
  token: string,
  formData: FormData,
  setProgress: (value: any) => void
) => {
  try {
    const url = `${apiUrl + route}/upload`;
    const response: AxiosResponse = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: any) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentage);
      },
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

// Get All files
export const getFiles = async (
  token: string,
  params?: { limit?: number; page?: number }
) => {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
  };

  const url = `${apiUrl + route}`;

  try {
    const response = await axios.post(url, {}, options);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};
