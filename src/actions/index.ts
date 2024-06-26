"use server";

import { whetherApi } from "@src/constants";
import { WeatherResponse } from "@src/types/panel/weather";

export const retriveWhether = async (location: {
  latitue: number;
  longitude: number;
}) => {
  try {
    const url = `${whetherApi.apiUrl}?lat=${location.latitue}&lon=${location.longitude}&appid=${whetherApi.apiKey}&units=metric`;

    const dataRaw = await fetch(url, {
      method: "GET",
    });
    const data: WeatherResponse = await dataRaw.json();

    return data;
  } catch (err) {
    throw err;
  }
};
