"use client";

import { GoogleMap, OverlayViewF, OVERLAY_MOUSE_TARGET } from "@react-google-maps/api";
import mapStyles from "@/lib/mapStyles";
import { useGoogleMapsLoaded } from "@/components/providers/GoogleMapsProvider";

interface EventMapProps {
  lat: number;
  lng: number;
  label?: string;
}

export default function EventMap({ lat, lng }: EventMapProps) {
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
      <OverlayViewF
        position={{ lat, lng }}
        mapPaneName={OVERLAY_MOUSE_TARGET}
        getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -h })}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          <div style={{
            width: 32,
            height: 32,
            backgroundColor: "#00DF81",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,223,129,0.5)",
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "7px solid #00DF81",
          }} />
        </div>
      </OverlayViewF>
    </GoogleMap>
  );
}
