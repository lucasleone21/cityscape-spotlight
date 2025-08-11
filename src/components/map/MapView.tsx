import React, { useEffect, useRef } from "react";
import mapboxgl, { Map, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapMarker = {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  rating?: number;
  recommended?: boolean;
  category?: string;
};

interface MapViewProps {
  accessToken?: string;
  center?: [number, number];
  focus?: [number, number];
  zoom?: number;
  markers: MapMarker[];
  adminMode?: boolean;
  onMapClick?: (lng: number, lat: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  accessToken,
  center,
  focus,
  zoom = 3,
  markers,
  adminMode = false,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: center ?? [0, 20],
      zoom,
      projection: "globe",
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (adminMode && onMapClick) {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      }
    };

    mapRef.current.on("click", onClick);

    mapRef.current.on("style.load", () => {
      try {
        mapRef.current?.setFog({
          color: "rgb(255,255,255)",
          "high-color": "rgb(190, 200, 255)",
          "horizon-blend": 0.1,
        } as any);
      } catch (_) {}
    });

    return () => {
      mapRef.current?.off("click", onClick);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  // Fly to city center
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo({ center, zoom: 11, essential: true });
    }
  }, [center]);

  // Focus on specific coordinate (e.g., from list)
  useEffect(() => {
    if (mapRef.current && focus) {
      mapRef.current.flyTo({ center: focus, zoom: 14, essential: true });
    }
  }, [focus]);

  // Draw markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className = `map-marker${m.recommended ? " map-marker--recommended" : ""}`;
      el.setAttribute("aria-label", m.title);

      const popupHtml = `
        <div style="min-width:180px">
          <strong>${m.title}</strong>
          ${typeof m.rating === "number" ? `<div>Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
          ${m.category ? `<div>Category: ${m.category}</div>` : ""}
          ${m.recommended ? `<div>Recommended</div>` : ""}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(m.coordinates)
        .setPopup(new Popup({ offset: 12 }).setHTML(popupHtml))
        .addTo(map);

      markersRef.current[m.id] = marker;
    });
  }, [markers]);

  return (
    <div className="relative w-full h-full">
      {!accessToken && (
        <div className="absolute inset-0 z-10 grid place-items-center">
          <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold">Mapbox token required</h2>
            <p className="text-sm text-muted-foreground">Enter a Mapbox public token in the sidebar to load the map.</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      <div className="absolute inset-0 pointer-events-none rounded-lg" />
    </div>
  );
};

export default MapView;
