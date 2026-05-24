"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import mapStyles from "@/lib/mapStyles";
import { useGoogleMapsLoaded } from "@/components/providers/GoogleMapsProvider";

interface EventMapProps {
  lat: number;
  lng: number;
  label?: string;
}

export default function EventMap({ lat, lng, label }: EventMapProps) {
  const isLoaded = useGoogleMapsLoaded();

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a26]">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat, lng }}
      zoom={15}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      }}
    >
      <Marker
        position={{ lat, lng }}
        title={label}
        icon={{
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#7c3aed",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
          scale: 1.8,
          anchor: { x: 12, y: 24 } as google.maps.Point,
        }}
      />
    </GoogleMap>
  );
}
