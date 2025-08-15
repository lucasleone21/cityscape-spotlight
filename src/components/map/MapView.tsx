import React, { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  rating?: number;
  category?: string;
  review?: string;
  recommendedBy?: string;
  onEdit?: () => void;
  onDelete?: () => void;
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
      // valor 13 mostra o quao longe devemos ir quando clicamos em Return to City Overview
      mapRef.current.flyTo([center[1], center[0]], 13, { 
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
    // valor 19 mostra o quao perto deve chegar quando clicamos no lugar marcado na sidebar
    map.flyTo([lat, lng], 19, { 
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
            last.recommendedBy !== current.recommendedBy ||
            last.category !== current.category ||
            last.review !== current.review ||
            // Also check if admin callbacks changed
            (!!last.onEdit) !== (!!current.onEdit) ||
            (!!last.onDelete) !== (!!current.onDelete)) {
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

        // Create new marker with simple red circle design
        const size = 32; // All markers same size
        
        const icon = L.divIcon({
          html: `<div class="map-marker">
                   <div class="map-marker-inner"></div>
                 </div>`,
          className: "custom-marker-icon",
          iconSize: [size, size] as [number, number],
          iconAnchor: [size / 2, size / 2] as [number, number],
          popupAnchor: [0, -(size / 2)] as [number, number],
        });

        const popupContent = document.createElement('div');
        popupContent.style.minWidth = '250px';
        popupContent.style.padding = '8px';
        
        popupContent.innerHTML = `
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
            ${m.title}
          </div>
          ${typeof m.rating === "number" ? `<div style="margin-bottom: 6px; color: #f59e0b;">Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
          ${m.category ? `<div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">Category: ${m.category}</div>` : ""}
          ${m.recommendedBy ? `<div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">Recomendado por: ${m.recommendedBy}</div>` : ""}
          ${m.recommendedBy === "Danilo Carneiro" ? `<div style="margin-bottom: 8px;"><img src="/danilo-carneiro.png" alt="Danilo Carneiro" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.recommendedBy === "Cadu" ? `<div style="margin-bottom: 8px;"><img src="/cadu.png" alt="Cadu" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.recommendedBy === "Mohamad Hindi" ? `<div style="margin-bottom: 8px;"><img src="/mohamad-hindi.png" alt="Mohamad Hindi" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.review ? `<div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.4; color: #374151;">${m.review}</div>` : ""}
        `;

        // Add admin buttons if in admin mode
        if (adminMode && (m.onEdit || m.onDelete)) {
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'flex';
          buttonContainer.style.gap = '8px';
          buttonContainer.style.marginTop = '12px';
          buttonContainer.style.paddingTop = '12px';
          buttonContainer.style.borderTop = '1px solid #e5e7eb';

          if (m.onEdit) {
            const editButton = document.createElement('button');
            editButton.innerHTML = '✏️ Edit';
            editButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; color: #374151;';
            editButton.addEventListener('click', m.onEdit);
            editButton.addEventListener('mouseenter', () => {
              editButton.style.background = '#e5e7eb';
            });
            editButton.addEventListener('mouseleave', () => {
              editButton.style.background = '#f3f4f6';
            });
            buttonContainer.appendChild(editButton);
          }

          if (m.onDelete) {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '🗑️ Delete';
            deleteButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; color: #dc2626;';
            deleteButton.addEventListener('click', m.onDelete);
            deleteButton.addEventListener('mouseenter', () => {
              deleteButton.style.background = '#fee2e2';
            });
            deleteButton.addEventListener('mouseleave', () => {
              deleteButton.style.background = '#fef2f2';
            });
            buttonContainer.appendChild(deleteButton);
          }

          popupContent.appendChild(buttonContainer);
        }

        const marker: LeafletMarker = L.marker([m.coordinates[1], m.coordinates[0]], { 
          icon,
          id: m.id
        })
          .bindPopup(popupContent)
          .addTo(group);
      });

      // Update refs - store markers without the callback functions for comparison
      lastMarkersRef.current = markers.map(m => ({
        id: m.id,
        coordinates: m.coordinates,
        title: m.title,
        rating: m.rating,
        category: m.category,
        review: m.review,
        recommendedBy: m.recommendedBy
      }));
      markersInitializedRef.current = true;
    }
  }, [markers]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
};

export default MapView;
