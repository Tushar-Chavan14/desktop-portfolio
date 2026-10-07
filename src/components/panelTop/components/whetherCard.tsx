"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { PiMapPinFill, PiWarningCircle } from "react-icons/pi";
import { WeatherIcons } from "@src/constants/panel";
import { retriveWhether } from "@src/actions";
import type { WeatherResponse } from "@src/types/panel/weather";

type Status = "idle" | "locating" | "loading" | "ready" | "denied" | "error";

const WeatherCard = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  const load = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setStatus("loading");
        try {
          const data = await retriveWhether({ latitude: coords.latitude, longitude: coords.longitude });
          if (!data?.main) throw new Error("No weather data");
          setWeather(data);
          setStatus("ready");
        } catch {
          setStatus("error");
        }
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { maximumAge: 10 * 60_000, timeout: 10_000 }
    );
  }, []);

  // If the visitor already granted location, fetch straight away; never prompt unasked.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((p) => {
        if (p.state === "granted") load();
        if (p.state === "denied") setStatus("denied");
      })
      .catch(() => {});
  }, [load]);

  if (status === "ready" && weather) {
    const icon = WeatherIcons[weather.weather[0]?.icon] ?? WeatherIcons.default;
    return (
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-mocha-subtext0">Weather</p>
          <p className="mt-0.5 truncate text-sm font-medium text-mocha-text">{weather.name}</p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-4xl font-light tracking-tight text-mocha-text tabular-nums">
            {Math.round(weather.main.temp)}°
          </p>
          <Image src={icon} alt={weather.weather[0]?.description ?? "Weather"} width={52} height={52} />
        </div>
        <p className="text-sm text-mocha-subtext1 capitalize">
          {weather.weather[0]?.description}
          <span className="text-mocha-overlay1"> · feels {Math.round(weather.main.feels_like)}°</span>
        </p>
      </div>
    );
  }

  if (status === "locating" || status === "loading") {
    return (
      <div className="flex h-full flex-col gap-3" aria-busy="true" aria-label="Loading weather">
        <div className="h-3 w-16 animate-pulse rounded bg-mocha-surface1" />
        <div className="h-4 w-28 animate-pulse rounded bg-mocha-surface1" />
        <div className="mt-auto h-10 w-20 animate-pulse rounded bg-mocha-surface1" />
        <div className="h-3 w-24 animate-pulse rounded bg-mocha-surface1" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs font-medium text-mocha-subtext0">Weather</p>
      {status === "denied" || status === "error" ? (
        <p className="flex items-start gap-2 text-sm text-mocha-subtext1">
          <PiWarningCircle className="mt-0.5 size-4 shrink-0 text-mocha-yellow" aria-hidden />
          {status === "denied"
            ? "Location access is blocked. Allow it in your browser to see local weather."
            : "Couldn't load the weather right now."}
        </p>
      ) : (
        <p className="text-sm text-mocha-subtext1">Share your location to see the weather where you are.</p>
      )}
      {status !== "denied" && (
        <button
          type="button"
          onClick={load}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-mocha-surface1 px-3 py-1.5 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
        >
          <PiMapPinFill className="size-4" aria-hidden />
          {status === "error" ? "Try again" : "Use my location"}
        </button>
      )}
    </div>
  );
};

export default WeatherCard;
