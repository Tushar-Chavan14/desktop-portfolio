import React, { PointerEventHandler, useEffect, useState } from "react";
import Image from "next/image";
import useLocationAccess from "@src/hooks/useLocationAccess";
import { WeatherIcons } from "@src/constants/panel";
import { retriveWhether } from "@src/actions";
import { WeatherResponse } from "@src/types/panel/weather";

const WhetherCard = () => {
  const { location, hasLocationAccess, setlocation } = useLocationAccess();
  const [loading, setloading] = useState<boolean>(false);
  const [weatherData, setweatherData] = useState<WeatherResponse>({
    coord: { lon: 0, lat: 0 },
    weather: [{ id: 0, main: "", description: "", icon: "" }],
    base: "",
    main: {
      temp: 0,
      feels_like: 0,
      temp_min: 0,
      temp_max: 0,
      pressure: 0,
      humidity: 0,
      sea_level: 0,
      grnd_level: 0,
    },
    visibility: 0,
    wind: { speed: 0, deg: 0, gust: 0 },
    clouds: { all: 0 },
    dt: 0,
    sys: { country: "", sunrise: 0, sunset: 0 },
    timezone: 0,
    id: 0,
    name: "",
    cod: 0,
  });
  
  const getLocationFromBrowser: PointerEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e?.preventDefault();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setlocation({
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        });
      });
    }
  };

  useEffect(() => {
    setloading(true);
    retriveWhether(location)
      .then((data) => {
        setweatherData(data);
        setloading(false);
      })
      .catch((err) => {
        console.log(err);
        setloading(false);
      });

    return () => {};
  }, [location]);

  if (!hasLocationAccess) {
    return (
      <div className="w-full h-full bg-mocha-base">
        <h4 className="text-lg font-medium px-8 py-4">whether Info</h4>

        <div className="mt-8 text-center flex flex-col items-center justify-center gap-4">
          <p className="px-4">
            please provide location access to get whether status
          </p>

          <button
            className="rounded-md bg-primary px-4"
            onClick={getLocationFromBrowser}
          >
            click here
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-mocha-base">
        <h4 className="text-lg font-medium px-8 py-4">whether Info</h4>

        <div className="mt-8 text-center flex flex-col items-center justify-center gap-4">
          <p className="px-4">Loading whether status please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-mocha-base">
      <h4 className="text-lg font-medium px-8 py-4">whether Info</h4>
      <div className="mt-8 rounded-md px-3 py-1 flex flex-col items-center justify-center gap-10">
        <div>
          <h2 className="text-xl font-semibold">{weatherData?.name}</h2>
        </div>

        <div className="mb-2 text-3xl font-semibold">
          {weatherData?.main?.temp.toFixed(0)}°c
        </div>
        <div>
          <Image
            src={
              WeatherIcons[weatherData?.weather[0]?.icon] ||
              WeatherIcons["default"]
            }
            alt="wheterIcons"
            width={50}
            height={50}
          />
        </div>
        <div>
          <p>{weatherData?.weather[0]?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default WhetherCard;
