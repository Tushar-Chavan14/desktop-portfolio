"use client";
import { useState, useEffect } from "react";
import { useGeolocation } from "@uidotdev/usehooks";

interface Location {
  latitude: number;
  longitude: number;
}

const useLocationAccess = () => {
  const geolocation = useGeolocation();

  const [hasLocationAccess, sethasLocationAccess] = useState<boolean | null>(
    null
  );

  const [location, setlocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (geolocation.error) {
      sethasLocationAccess(false);
    }

    if (geolocation.latitude && geolocation.longitude) {
      setlocation({
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
      });
      sethasLocationAccess(true);
    } else {
      sethasLocationAccess(null);
    }
    return () => {};
  }, [geolocation]);

  // useEffect(() => {
  //   if ("geolocation" in navigator) {
  //     navigator.permissions
  //       .query({ name: "geolocation" })
  //       .then((resp) => {
  //         if (resp.state === "granted") {
  //           sethasLocationAccess(true);
  //           if ("geolocation" in navigator) {
  //             navigator.geolocation.getCurrentPosition((position) => {
  //               setlocation({
  //                 latitue: position?.coords?.latitude,
  //                 longitude: position?.coords?.longitude,
  //               });
  //             });
  //           }
  //         } else if (resp.state === "denied") {
  //           sethasLocationAccess(false);
  //         } else {
  //           sethasLocationAccess(null);
  //         }
  //       })
  //       .catch(() => {
  //         sethasLocationAccess(false);
  //       });
  //   } else {
  //     sethasLocationAccess(false);
  //   }
  // }, []);

  return { location, hasLocationAccess, setlocation };
};

export default useLocationAccess;
