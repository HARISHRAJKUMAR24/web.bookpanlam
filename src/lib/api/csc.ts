"use server";

import { CSC_API_KEY, apiUrl } from "@/config";
import axios from "axios";

// Get states by country
export const statesByCountry = async (country: string) => {
  const url = `https://api.countrystatecity.in/v1/countries/${country}/states`;

  const options = {
    headers: {
      "X-CSCAPI-KEY": CSC_API_KEY,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Get city by state and country
export const citiesByStateAndCountry = async (
  country: string,
  state?: string
) => {
  let url = `https://api.countrystatecity.in/v1/countries/${country}/cities`;
  if (state) {
    url = `https://api.countrystatecity.in/v1/countries/${country}/states/${state}/cities`;
  }

  const options = {
    headers: {
      "X-CSCAPI-KEY": CSC_API_KEY,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
