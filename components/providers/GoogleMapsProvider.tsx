"use client";

import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

// Stable reference — must never change between renders
const LIBRARIES: ("places")[] = ["places"];

const GoogleMapsContext = createContext(false);

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider value={isLoaded}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export const useGoogleMapsLoaded = () => useContext(GoogleMapsContext);
