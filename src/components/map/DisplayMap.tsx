import React, { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGlobalToast } from "../layout/ToastContext";

import 'leaflet/dist/leaflet.css';

// Default marker icons for different types
const createMarkerIcon = (color: string, iconType?: string) => {
  const icons = {
    bloodbank: `<path fill="${color}" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
    donor: `<path fill="${color}" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    hospital: `<path fill="${color}" d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>`,
    default: `<path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>`
  };
  
  const iconPath = icons[iconType as keyof typeof icons] || icons.default;
  
  return new L.DivIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        ${iconPath}
      </svg>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Default marker colors
const MARKER_COLORS = {
  bloodbank: '#e53e3e',     // Red
  donor: '#38a169',         // Green
  hospital: '#3182ce',      // Blue
  default: '#d69e2e',       // Orange
  selected: '#805ad5'       // Purple
};

// Default center (Mek'ele, Ethiopia)
const DEFAULT_CENTER = {
  lat: 13.5169,
  lng: 39.45389,
};

const DEFAULT_ZOOM = 13;

// Types
export interface MapPoint {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'bloodbank' | 'donor' | 'hospital' | 'default';
  color?: string;
  data?: any; // Additional data that can be passed to callbacks
}

export interface DisplayMapProps {
  // Required props
  points: MapPoint[];
  
  // Optional location props
  center?: { lat: number; lng: number };
  zoom?: number;
  autoFitBounds?: boolean; // Auto zoom to fit all points
  
  // Map appearance
  height?: string;
  width?: string;
  className?: string;
  
  // Interaction callbacks
  onPointClick?: (point: MapPoint) => void;
  onPointHover?: (point: MapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  
  // Features
  showUserLocation?: boolean;
  userLocation?: { lat: number; lng: number };
    // Clustering (for many points) - Future feature
  // enableClustering?: boolean;
  // maxClusterRadius?: number;
  
  // Custom popup content
  renderPopup?: (point: MapPoint) => React.ReactNode;
  
  // Controls
  showZoomControl?: boolean;
  // showLayerControl?: boolean; // Future feature
  
  // Custom markers
  customMarkerIcons?: Record<string, L.Icon | L.DivIcon>;
  
  // Selected point highlighting
  selectedPointId?: string | number;
  
  // Loading state
  isLoading?: boolean;
  
  // Error handling
  onError?: (error: string) => void;
  
  // Accessibility
  ariaLabel?: string;
}

// Component to fit bounds when points change
function FitBoundsController({ 
  points, 
  autoFitBounds, 
  userLocation 
}: { 
  points: MapPoint[]; 
  autoFitBounds: boolean;
  userLocation?: { lat: number; lng: number };
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!autoFitBounds || points.length === 0) return;
    
    const bounds = L.latLngBounds([]);
    
    // Add all points to bounds
    points.forEach(point => {
      bounds.extend([point.lat, point.lng]);
    });
    
    // Add user location if provided
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }
    
    // Only fit bounds if we have valid bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, points, autoFitBounds, userLocation]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (!onMapClick) return;
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  return null;
}

const DisplayMap: React.FC<DisplayMapProps> = ({
  // Required props
  points,
  
  // Optional location props
  center,
  zoom = DEFAULT_ZOOM,
  autoFitBounds = true,
  
  // Map appearance
  height = '400px',
  width = '100%',
  className = '',
  
  // Interaction callbacks
  onPointClick,
  onPointHover,
  onMapClick,
    // Features
  showUserLocation = false,
  userLocation,
  
  // Custom popup content
  renderPopup,
  
  // Controls
  showZoomControl = true,
  
  // Custom markers
  customMarkerIcons = {},
  
  // Selected point highlighting
  selectedPointId,
  
  // Loading state
  isLoading = false,
  
  // Error handling
  onError,
  
  // Accessibility
  ariaLabel = "Map displaying locations"
}) => {
  const toast = useGlobalToast();
  const mapRef = useRef<L.Map | null>(null);
  
  // Calculate map center
  const mapCenter = center || (points.length > 0 ? {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length
  } : DEFAULT_CENTER);
  
  // Get marker icon for a point
  const getMarkerIcon = useCallback((point: MapPoint) => {
    // Check if there's a custom icon for this point
    if (customMarkerIcons[point.id.toString()]) {
      return customMarkerIcons[point.id.toString()];
    }
    
    // Check if this point is selected
    const isSelected = selectedPointId !== undefined && selectedPointId === point.id;
    const color = isSelected 
      ? MARKER_COLORS.selected 
      : point.color || MARKER_COLORS[point.type || 'default'];
    
    return createMarkerIcon(color, point.type);
  }, [customMarkerIcons, selectedPointId]);
  
  // Handle point click
  const handlePointClick = useCallback((point: MapPoint) => {
    if (onPointClick) {
      onPointClick(point);
    }
  }, [onPointClick]);
  
  // Handle point hover
  const handlePointHover = useCallback((point: MapPoint) => {
    if (onPointHover) {
      onPointHover(point);
    }
  }, [onPointHover]);
  
  // Default popup content
  const defaultPopupContent = useCallback((point: MapPoint) => (
    <div className="p-2">
      <h4 className="font-semibold text-lg mb-1">{point.title}</h4>
      {point.description && (
        <p className="text-sm text-gray-600 mb-2">{point.description}</p>
      )}
      <div className="text-xs text-gray-500">
        <div>Lat: {point.lat.toFixed(6)}</div>
        <div>Lng: {point.lng.toFixed(6)}</div>
      </div>
    </div>
  ), []);
  
  // Get user location marker
  const userLocationMarker = showUserLocation && userLocation ? (
    <Marker
      key="user-location"
      position={[userLocation.lat, userLocation.lng]}
      icon={createMarkerIcon('#805ad5', 'default')}
    >
      <Popup>
        <div className="p-2">
          <h4 className="font-semibold">Your Location</h4>
        </div>
      </Popup>
    </Marker>
  ) : null;
  
  const containerStyle = {
    width,
    height
  };
  
  // Handle errors
  useEffect(() => {
    if (points.some(point => 
      typeof point.lat !== 'number' || 
      typeof point.lng !== 'number' || 
      isNaN(point.lat) || 
      isNaN(point.lng)
    )) {
      const errorMsg = "Invalid coordinates found in points data";
      if (onError) {
        onError(errorMsg);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Map Error",
          detail: errorMsg,
          life: 3000,
        });
      }
    }
  }, [points, onError, toast]);
  
  return (
    <div className={`display-map-container ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <i className="pi pi-spin pi-spinner text-xl"></i>
            <span>Loading map...</span>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div className="relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={containerStyle}
          ref={mapRef}
          zoomControl={showZoomControl}
          aria-label={ariaLabel}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Auto fit bounds controller */}
          <FitBoundsController 
            points={points}
            autoFitBounds={autoFitBounds}
            userLocation={userLocation}
          />
          
          {/* Map click handler */}
          <MapClickHandler onMapClick={onMapClick} />
          
          {/* User location marker */}
          {userLocationMarker}
          
          {/* Point markers */}
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={getMarkerIcon(point)}
              eventHandlers={{
                click: () => handlePointClick(point),
                mouseover: () => handlePointHover(point),
              }}
            >
              <Popup>
                {renderPopup ? renderPopup(point) : defaultPopupContent(point)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Points counter */}
        {points.length > 0 && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded shadow text-sm">
            {points.length} location{points.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Points summary */}
      {points.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-32 bg-gray-50 text-gray-500">
          <div className="text-center">
            <i className="pi pi-map text-2xl mb-2"></i>
            <p>No locations to display</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayMap;
