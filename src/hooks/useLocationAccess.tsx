"use client";
import { useState, useEffect } from "react";

interface Location {
  latitue: number;
  longitude: number;
}

const useLocationAccess = () => {
  const [hasLocationAccess, sethasLocationAccess] = useState<boolean | null>(
    null
  );

  const [location, setlocation] = useState<Location>({
    latitue: 0,
    longitude: 0,
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((resp) => {
          if (resp.state === "granted") {
            sethasLocationAccess(true);
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                setlocation({
                  latitue: position?.coords?.latitude,
                  longitude: position?.coords?.longitude,
                });
              });
            }
          } else if (resp.state === "denied") {
            sethasLocationAccess(false);
          } else {
            sethasLocationAccess(null);
          }
        })
        .catch(() => {
          sethasLocationAccess(false);
        });
    } else {
      sethasLocationAccess(false);
    }
  }, []);

  return { location, hasLocationAccess, setlocation };
};

export default useLocationAccess;
