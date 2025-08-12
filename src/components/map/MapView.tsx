import React, { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  rating?: number;
  recommended?: boolean;
  category?: string;
  review?: string;
};

interface MapViewProps {
  center?: [number, number];
  focus?: [number, number];
  zoom?: number;
  markers: MapMarker[];
  adminMode?: boolean;
  onMapClick?: (lng: number, lat: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  focus,
  zoom = 3,
  markers,
  adminMode = false,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: center ?? [20, 0],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // City center change
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo([center[1], center[0]] as any, 11, { animate: true });
    }
  }, [center]);

  // Focus on specific coordinate
  useEffect(() => {
    if (mapRef.current && focus) {
      mapRef.current.flyTo([focus[1], focus[0]] as any, 14, { animate: true });
    }
  }, [focus]);

  // Admin click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (adminMode && onMapClick) {
        onMapClick(e.latlng.lng, e.latlng.lat);
      }
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [adminMode, onMapClick]);

  // Render markers
  useEffect(() => {
    const group = markerLayerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();

    markers.forEach((m) => {
      const recommended = m.recommended ? " map-marker--recommended" : "";
      const size = m.recommended ? 32 : 20; // Made bigger: 32px for recommended, 20px for regular
      const icon = L.divIcon({
        html: `<div class="map-marker${recommended}"></div>`,
        className: "",
        iconSize: [size, size] as [number, number],
        iconAnchor: [size / 2, size / 2] as [number, number],
        popupAnchor: [0, -(size / 2)] as [number, number],
      });

      const popupHtml = `
        <div style="min-width:200px">
          <strong>${m.title}</strong>
          ${typeof m.rating === "number" ? `<div>Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
          ${m.category ? `<div>Category: ${m.category}</div>` : ""}
          ${m.review ? `<div style="margin-top:6px;">${m.review}</div>` : ""}
          ${m.recommended ? `<div style=\"margin-top:4px;\"><em>Recommended</em></div>` : ""}
        </div>
      `;

      const marker: LeafletMarker = L.marker([m.coordinates[1], m.coordinates[0]], { icon })
        .bindPopup(popupHtml)
        .addTo(group);

      return marker;
    });
  }, [markers]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
};

export default MapView;
