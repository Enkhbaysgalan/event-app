"use client";

import { useEffect, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Search, MapPin } from "lucide-react";
import mapStyles from "@/lib/mapStyles";
import { useGoogleMapsLoaded } from "@/components/providers/GoogleMapsProvider";

export interface LocationValue {
  name: string;
  detail: string;
  lat: number | null;
  lng: number | null;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  error?: string;
}

export default function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const isLoaded = useGoogleMapsLoaded();
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || acRef.current) return;
    acRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["name", "formatted_address", "geometry"],
    });
    acRef.current.addListener("place_changed", () => {
      const place = acRef.current?.getPlace();
      if (!place?.geometry?.location) return;
      onChange({
        name: place.name ?? "",
        detail: place.formatted_address ?? "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }, [isLoaded, onChange]);

  const hasCoords = value.lat !== null && value.lng !== null;
  const center = hasCoords
    ? { lat: value.lat as number, lng: value.lng as number }
    : { lat: 47.9184, lng: 106.9177 };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          defaultValue={value.name}
          placeholder={isLoaded ? "Search venue or address…" : "Loading maps…"}
          disabled={!isLoaded}
          className="w-full bg-[#111118] border border-white/8 pl-9 pr-4 py-3 text-[13px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans disabled:opacity-50"
        />
      </div>

      {hasCoords ? (
        <div className="w-full h-[150px] overflow-hidden border border-white/8">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={15}
            options={{
              styles: mapStyles,
              disableDefaultUI: true,
              clickableIcons: false,
            }}
          >
            <Marker
              position={center}
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
        </div>
      ) : (
        <div className="w-full h-[80px] bg-[#111118] border border-dashed border-white/8 flex items-center justify-center gap-2">
          <MapPin size={14} className="text-gray-700" strokeWidth={1.5} />
          <span className="text-[10px] text-gray-700 uppercase tracking-widest font-black">
            Search to pin location
          </span>
        </div>
      )}

      {value.detail && (
        <p className="text-[10px] text-gray-600 font-mono truncate">{value.detail}</p>
      )}

      {error && (
        <p className="text-[10px] text-red-400 font-mono">{error}</p>
      )}
    </div>
  );
}
