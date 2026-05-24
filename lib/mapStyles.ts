const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a26" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a26" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6b8a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a3e" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#4a4a6a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c0c18" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#151522" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a3e" }],
  },
];

export default mapStyles;
