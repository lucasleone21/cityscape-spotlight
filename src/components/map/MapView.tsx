// import React, { useEffect, useRef } from "react";
// import L, { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from "leaflet";
// import "leaflet/dist/leaflet.css";

// export type MapMarker = {
//   id: string;
//   coordinates: [number, number]; // [lng, lat]
//   title: string;
//   rating?: number;
//   category?: string;
//   review?: string;
//   recommendedBy?: string;
//   onEdit?: () => void;
//   onDelete?: () => void;
// };

// interface MapViewProps {
//   center?: [number, number];
//   focus?: [number, number];
//   focusTimestamp?: number;
//   zoom?: number;
//   markers: MapMarker[];
//   adminMode?: boolean;
//   onMapClick?: (lng: number, lat: number) => void;
// }

// const MapView: React.FC<MapViewProps> = ({
//   center,
//   focus,
//   focusTimestamp,
//   zoom = 3,
//   markers,
//   adminMode = false,
//   onMapClick,
// }) => {
//   const mapContainer = useRef<HTMLDivElement | null>(null);
//   const mapRef = useRef<LeafletMap | null>(null);
//   const markerLayerRef = useRef<LayerGroup | null>(null);
//   const markersInitializedRef = useRef(false);
//   const lastMarkersRef = useRef<MapMarker[]>([]);
//   const lastAdminModeRef = useRef(adminMode);
//   const lastFocusRef = useRef<[number, number] | undefined>(undefined);

//   // Initialize map
//   useEffect(() => {
//     if (!mapContainer.current) return;

//     const map = L.map(mapContainer.current, {
//       center: center ?? [20, 0],
//       zoom,
//       zoomControl: true,
//       attributionControl: true,
//     });

//     L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
//       maxZoom: 20,
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      
//     }).addTo(map);

//     mapRef.current = map;
//     markerLayerRef.current = L.layerGroup().addTo(map);

//     return () => {
//       map.remove();
//       mapRef.current = null;
//       markerLayerRef.current = null;
//     };
//   }, []);

//   // City center change
//   useEffect(() => {
//     if (mapRef.current && center) {
//       mapRef.current.flyTo([center[1], center[0]] as any, 11, { animate: true });
//     }
//   }, [center]);

//   // Focus on specific coordinate - NO MORE MAP CENTERING
//   useEffect(() => {
//     if (mapRef.current && focus) {
//       // Just update the focus ref - don't move the map
//       const [lng, lat] = focus;
//       lastFocusRef.current = [lng, lat];
//     } else if (mapRef.current && !focus && center) {
//       // When focus is cleared, return to city center
//       // valor 13 mostra o quao longe devemos ir quando clicamos em Return to City Overview
//       mapRef.current.flyTo([center[1], center[0]], 13, { 
//         animate: true,
//         duration: 1.5
//       });
//       lastFocusRef.current = undefined;
//     }
//   }, [focus, focusTimestamp, center]);

//   // Move map to focused location when focus changes
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !focus) return;

//     // Move the map to the focused location
//     const [lng, lat] = focus;
//     // valor 19 mostra o quao perto deve chegar quando clicamos no lugar marcado na sidebar
//     map.flyTo([lat, lng], 19, { 
//       animate: true,
//       duration: 1.5
//     });
//   }, [focus, focusTimestamp]);

//   // Remove the old zoom centering logic - we don't need it anymore

//   // Admin click handler
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map) return;

//     const handler = (e: L.LeafletMouseEvent) => {
//       if (adminMode && onMapClick) {
//         onMapClick(e.latlng.lng, e.latlng.lat);
//       }
//     };

//     map.on("click", handler);
//     return () => {
//       map.off("click", handler);
//     };
//   }, [adminMode, onMapClick]);

// useEffect(() => {
//     const group = markerLayerRef.current;
//     const map = mapRef.current;
//     if (!group || !map) return;

//     // A nova função verifica se os marcadores OU o adminMode mudaram.
//     const havePropsChanged = () => {
//       // 1. Se o modo admin mudou, precisamos redesenhar.
//       if (lastAdminModeRef.current !== adminMode) {
//         return true;
//       }

//       // 2. Se o número de marcadores mudou, redesenhar.
//       if (lastMarkersRef.current.length !== markers.length) {
//         return true;
//       }

//       // 3. Compara cada marcador para ver se algum dado mudou.
//       // Usar JSON.stringify é uma forma simples e eficaz para este caso.
//       // Ele ignora as funções (onEdit, onDelete), o que é bom para a comparação de dados.
//       const simplifiedLastMarkers = lastMarkersRef.current.map(m => ({...m, onEdit: undefined, onDelete: undefined}));
//       const simplifiedCurrentMarkers = markers.map(m => ({...m, onEdit: undefined, onDelete: undefined}));

//       if (JSON.stringify(simplifiedLastMarkers) !== JSON.stringify(simplifiedCurrentMarkers)) {
//         return true;
//       }

//       return false;
//     };

//     // Só executa a renderização completa se for a primeira vez ou se algo mudou.
//     if (!markersInitializedRef.current || havePropsChanged()) {
//       group.clearLayers();

//       markers.forEach((m) => {
//         const size = 32;
//         const icon = L.divIcon({
//           html: `<div class="map-marker"><div class="map-marker-inner"></div></div>`,
//           className: "custom-marker-icon",
//           iconSize: [size, size],
//           iconAnchor: [size / 2, size / 2],
//           popupAnchor: [0, -(size / 2)],
//         });

//         const popupContent = document.createElement('div');
//         popupContent.style.minWidth = '250px';
//         popupContent.style.padding = '8px';
        
//         popupContent.innerHTML = `
//           <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
//             ${m.title}
//           </div>
//           ${typeof m.rating === "number" ? `<div style="margin-bottom: 6px; color: #f59e0b;">Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
//           ${m.category ? `<div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">Category: ${m.category}</div>` : ""}
//           ${m.recommendedBy ? `<div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">Recomendado por: ${m.recommendedBy}</div>` : ""}
//           ${m.recommendedBy === "Danilo Carneiro" ? `<div style="margin-bottom: 8px;"><img src="/danilo-carneiro.png" alt="Danilo Carneiro" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
//           ${m.recommendedBy === "Cadu" ? `<div style="margin-bottom: 8px;"><img src="/cadu.png" alt="Cadu" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
//           ${m.recommendedBy === "Mohamad Hindi" ? `<div style="margin-bottom: 8px;"><img src="/mohamad-hindi.png" alt="Mohamad Hindi" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
//           ${m.review ? `<div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.4; color: #374151;">${m.review}</div>` : ""}
//         `;

//         // A condição para mostrar os botões agora funciona corretamente.
//         if (adminMode && (m.onEdit || m.onDelete)) {
//           const buttonContainer = document.createElement('div');
//           buttonContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;';

//           if (m.onEdit) {
//             const editButton = document.createElement('button');
//             editButton.innerHTML = '✏️ Edit';
//             editButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; color: #374151;';
//             editButton.addEventListener('click', () => m.onEdit && m.onEdit());
//             buttonContainer.appendChild(editButton);
//           }

//           if (m.onDelete) {
//             const deleteButton = document.createElement('button');
//             deleteButton.innerHTML = '🗑️ Delete';
//             deleteButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; color: #dc2626;';
//             deleteButton.addEventListener('click', () => m.onDelete && m.onDelete());
//             buttonContainer.appendChild(deleteButton);
//           }

//           popupContent.appendChild(buttonContainer);
//         }

//         L.marker([m.coordinates[1], m.coordinates[0]], { 
//           icon,
//           id: m.id
//         })
//         .bindPopup(popupContent)
//         .addTo(group);
//       });

//       // Atualiza as refs com os últimos valores que foram renderizados.
//       lastMarkersRef.current = markers;
//       lastAdminModeRef.current = adminMode;
//       markersInitializedRef.current = true;
//     }
//   }, [markers, adminMode]); // A dependência de 'adminMode' continua importante

//   return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
// };

// export default MapView;


/////////////////////////////////////////////  


import React, { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. Adicione a propriedade 'image' ao tipo MapMarker
export type MapMarker = {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  title: string;
  image?: string; // URL da imagem a ser exibida
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
  const lastAdminModeRef = useRef(adminMode);
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

  // Focus on specific coordinate
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

  useEffect(() => {
    const group = markerLayerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    const havePropsChanged = () => {
      if (lastAdminModeRef.current !== adminMode) return true;
      if (lastMarkersRef.current.length !== markers.length) return true;

      const simplifiedLastMarkers = lastMarkersRef.current.map(m => ({...m, onEdit: undefined, onDelete: undefined}));
      const simplifiedCurrentMarkers = markers.map(m => ({...m, onEdit: undefined, onDelete: undefined}));

      if (JSON.stringify(simplifiedLastMarkers) !== JSON.stringify(simplifiedCurrentMarkers)) {
        return true;
      }

      return false;
    };

    if (!markersInitializedRef.current || havePropsChanged()) {
      group.clearLayers();

      markers.forEach((m) => {
        const size = 32;
        const icon = L.divIcon({
          html: `<div class="map-marker"><div class="map-marker-inner"></div></div>`,
          className: "custom-marker-icon",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)],
        });

        const popupContent = document.createElement('div');
        popupContent.style.minWidth = '250px';
        popupContent.style.padding = '8px';
        
        // 2. Adicione a lógica para renderizar a imagem no HTML do popup
        popupContent.innerHTML = `
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
            ${m.title}
          </div>
          
          ${/* Início da Lógica da Imagem */''}
          ${m.image ? `
            <div style="margin-bottom: 10px;">
              <img src="${m.image}" alt="${m.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
            </div>
          ` : ""}
          ${/* Fim da Lógica da Imagem */''}

          ${typeof m.rating === "number" ? `<div style="margin-bottom: 6px; color: #f59e0b;">Rating: ${"★".repeat(Math.round(m.rating))}</div>` : ""}
          ${m.category ? `<div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">Category: ${m.category}</div>` : ""}
          ${m.recommendedBy ? `<div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">Recomendado por: ${m.recommendedBy}</div>` : ""}
          ${m.recommendedBy === "Danilo Carneiro" ? `<div style="margin-bottom: 8px;"><img src="/danilo-carneiro.png" alt="Danilo Carneiro" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.recommendedBy === "Cadu" ? `<div style="margin-bottom: 8px;"><img src="/cadu.png" alt="Cadu" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.recommendedBy === "Mohamad Hindi" ? `<div style="margin-bottom: 8px;"><img src="/mohamad-hindi.png" alt="Mohamad Hindi" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;"></div>` : ""}
          ${m.review ? `<div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.4; color: #374151;">${m.review}</div>` : ""}
        `;

        if (adminMode && (m.onEdit || m.onDelete)) {
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;';

          if (m.onEdit) {
            const editButton = document.createElement('button');
            editButton.innerHTML = '✏️ Edit';
            editButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; color: #374151;';
            editButton.addEventListener('click', () => m.onEdit && m.onEdit());
            buttonContainer.appendChild(editButton);
          }

          if (m.onDelete) {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '🗑️ Delete';
            deleteButton.style.cssText = 'flex: 1; padding: 6px 12px; font-size: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; color: #dc2626;';
            deleteButton.addEventListener('click', () => m.onDelete && m.onDelete());
            buttonContainer.appendChild(deleteButton);
          }

          popupContent.appendChild(buttonContainer);
        }

        L.marker([m.coordinates[1], m.coordinates[0]], { 
          icon,
          id: m.id
        })
        .bindPopup(popupContent)
        .addTo(group);
      });

      lastMarkersRef.current = markers;
      lastAdminModeRef.current = adminMode;
      markersInitializedRef.current = true;
    }
  }, [markers, adminMode]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
};

export default MapView;