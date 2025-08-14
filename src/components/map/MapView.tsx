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
  focusTimestamp?: number;
  zoom?: number;
  markers: MapMarker[];
  adminMode?: boolean;
  onMapClick?: (lng: number, lat: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  focus,
  focusTimestamp,
  zoom = 3,
  markers,
  adminMode = false,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markersInitializedRef = useRef(false);
  const lastMarkersRef = useRef<MapMarker[]>([]);
  const lastFocusRef = useRef<[number, number] | undefined>(undefined);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: center ?? [20, 0],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

  // Focus on specific coordinate - NO MORE MAP CENTERING
  useEffect(() => {
    if (mapRef.current && focus) {
      // Just update the focus ref - don't move the map
      const [lng, lat] = focus;
      lastFocusRef.current = [lng, lat];
    } else if (mapRef.current && !focus && center) {
      // When focus is cleared, return to city center
      mapRef.current.flyTo([center[1], center[0]], 11, { 
        animate: true,
        duration: 1.5
      });
      lastFocusRef.current = undefined;
    }
  }, [focus, focusTimestamp, center]);

  // Move map to focused location when focus changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;

    // Move the map to the focused location
    const [lng, lat] = focus;
    map.flyTo([lat, lng], 16, { 
      animate: true,
      duration: 1.5
    });
  }, [focus, focusTimestamp]);

  // Remove the old zoom centering logic - we don't need it anymore

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

  // Render markers - optimized to prevent flickering while maintaining functionality
  useEffect(() => {
    const group = markerLayerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    // Deep comparison function to check if markers actually changed
    const markersActuallyChanged = (): boolean => {
      if (lastMarkersRef.current.length !== markers.length) return true;
      
      for (let i = 0; i < markers.length; i++) {
        const current = markers[i];
        const last = lastMarkersRef.current[i];
        
        if (!last || 
            last.id !== current.id ||
            last.coordinates[0] !== current.coordinates[0] ||
            last.coordinates[1] !== current.coordinates[1] ||
            last.title !== current.title ||
            last.rating !== current.rating ||
            last.recommended !== current.recommended ||
            last.category !== current.category ||
            last.review !== current.review) {
          return true;
        }
      }
      return false;
    };

    // Only re-render if markers actually changed in content
    if (!markersInitializedRef.current || markersActuallyChanged()) {
      // Store current markers for reuse
      const existingMarkers = new Map();
      group.getLayers().forEach((layer: any) => {
        if (layer.options?.id) {
          existingMarkers.set(layer.options.id, layer);
        }
      });

      // Clear all layers
      group.clearLayers();
      
      // Create or reuse markers
      markers.forEach((m) => {
        // Try to reuse existing marker if it's identical
        const existingMarker = existingMarkers.get(m.id);
        if (existingMarker && 
            existingMarker.getLatLng().lat === m.coordinates[1] && 
            existingMarker.getLatLng().lng === m.coordinates[0]) {
          // Reuse existing marker - no flickering
          group.addLayer(existingMarker);
          return;
        }

        // Create new marker only if necessary
        const category = m.category ? ` map-marker--${m.category.toLowerCase().replace(/\s+/g, '-')}` : "";
        const isFocused = focus && focus[0] === m.coordinates[0] && focus[1] === m.coordinates[1];
        const focusedClass = isFocused ? " map-marker--focused" : "";
        const size = 36; // All markers same size now
        
        const icon = L.divIcon({
          html: `<div class="map-marker${category}${focusedClass}">
                   <div class="map-marker-inner">
                     <!-- Clean marker with no letters or stars -->
                   </div>
                 </div>`,
          className: "custom-marker-icon",
          iconSize: [size, size] as [number, number],
          iconAnchor: [size / 2, size / 2] as [number, number],
          popupAnchor: [0, -(size / 2)] as [number, number],
        });

        const popupHtml = `
          <div style="min-width:250px; padding: 8px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
              ${m.title}
            </div>
            ${typeof m.rating === "number" ? `<div style="margin-bottom: 6px; color: #f59e0b;">Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
            ${m.category ? `<div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">Category: ${m.category}</div>` : ""}
            ${m.review ? `<div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.4; color: #374151;">${m.review}</div>` : ""}
          </div>
        `;

        const marker: LeafletMarker = L.marker([m.coordinates[1], m.coordinates[0]], { 
          icon,
          id: m.id
        })
          .bindPopup(popupHtml)
          .addTo(group);
      });

      // Update refs
      lastMarkersRef.current = [...markers];
      markersInitializedRef.current = true;
    }
  }, [markers]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
};

export default MapView;
