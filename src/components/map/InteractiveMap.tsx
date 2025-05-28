import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useGlobalToast } from "../layout/ToastContext";
import { extractErrorForToast } from "../../utils/errorHandling";

import "leaflet/dist/leaflet.css";

// Default marker icon
const defaultMarkerIcon = new L.DivIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path fill="#d32f2f" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Default center (Mek'ele)
const DEFAULT_CENTER = {
  lat: 13.5169,
  lng: 39.45389,
};

const DEFAULT_ZOOM = 13;

// Types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface AddressDetails {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface InteractiveMapProps {
  // Required props
  onLocationChange: (location: LatLng) => void;

  // Optional location props
  initialCenter?: LatLng;
  initialMarkerPosition?: LatLng | null;
  zoom?: number;

  // Map appearance
  height?: string;
  width?: string;
  className?: string;

  // Marker customization
  markerIcon?: L.Icon | L.DivIcon;
  draggableMarker?: boolean;
  showPopup?: boolean;
  popupContent?: string;

  // Feature toggles
  showLocationButton?: boolean;
  showAddressButton?: boolean;
  showResetButton?: boolean;
  showCoordinatesDisplay?: boolean;
  showHints?: boolean;

  // Reverse geocoding
  enableReverseGeocoding?: boolean;
  onAddressChange?: (address: AddressDetails) => void;

  // Custom address for geocoding
  addressForGeocoding?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  // Custom messages
  locationHint?: string;
  coordinatesLabel?: string;

  // Loading state
  isLoading?: boolean;

  // Accessibility
  ariaLabel?: string;
}

// Map click handler component
function MapClickHandler({
  onLocationChange,
  enableReverseGeocoding,
  onAddressChange,
}: {
  onLocationChange: (location: LatLng) => void;
  enableReverseGeocoding?: boolean;
  onAddressChange?: (address: AddressDetails) => void;
}) {
  const toast = useGlobalToast();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const newPosition = { lat, lng };
      onLocationChange(newPosition);

      // Perform reverse geocoding if enabled
      if (enableReverseGeocoding && onAddressChange) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const {
              road,
              house_number,
              city,
              town,
              state,
              postcode,
              country,
              village,
            } = data.address;

            // Construct street address
            let street = "";
            if (house_number) street += house_number + " ";
            if (road) street += road;

            // Set city (may be called town or village in some areas)
            const cityValue = city || town || village || "";

            // Update address fields
            const addressDetails: AddressDetails = {
              address: street,
              city: cityValue,
              state: state || "",
              postalCode: postcode || "",
              country: country || "",
            };

            onAddressChange(addressDetails);

            toast.current?.show({
              severity: "info",
              summary: "Address Updated",
              detail: "Address fields updated from map location",
              life: 2000,
            });
          }        } catch (error) {
          console.error("Error with reverse geocoding:", error);
          const { summary, detail } = extractErrorForToast(error);
          toast.current?.show({
            severity: "error",
            summary,
            detail,
            life: 3000,
          });
        }
      }
    },
  });

  return null;
}

// Component to center map when center changes
function MapCenterController({
  center,
  zoom,
}: {
  center: LatLng;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);

  return null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  // Required props
  onLocationChange,

  // Optional location props
  initialCenter = DEFAULT_CENTER,
  initialMarkerPosition = null,
  zoom = DEFAULT_ZOOM,

  // Map appearance
  height = "300px",
  width = "100%",
  className = "",

  // Marker customization
  markerIcon = defaultMarkerIcon,
  draggableMarker = true,
  showPopup = true,
  popupContent = "Selected location",

  // Feature toggles
  showLocationButton = true,
  showAddressButton = true,
  showResetButton = true,
  showCoordinatesDisplay = true,
  showHints = true,

  // Reverse geocoding
  enableReverseGeocoding = false,
  onAddressChange,

  // Custom address for geocoding
  addressForGeocoding,

  // Custom messages
  locationHint,
  coordinatesLabel = "Coordinates",

  // Loading state
  isLoading = false,

  // Accessibility
  ariaLabel = "Interactive map for location selection",
}) => {
  const toast = useGlobalToast();
  const mapRef = useRef<L.Map | null>(null);

  // Internal state
  const [mapCenter, setMapCenter] = useState<LatLng>(initialCenter);
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(
    initialMarkerPosition
  );
  const [geoLoading, setGeoLoading] = useState(false);

  // Update marker when initialMarkerPosition changes
  useEffect(() => {
    setMarkerPosition(initialMarkerPosition);
    if (initialMarkerPosition) {
      setMapCenter(initialMarkerPosition);
    }
  }, [initialMarkerPosition]);

  // Handle location updates
  const handleLocationUpdate = useCallback(
    (location: LatLng) => {
      setMarkerPosition(location);
      setMapCenter(location);
      onLocationChange(location);
    },
    [onLocationChange]
  );

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.current?.show({
        severity: "warn",
        summary: "Geolocation",
        detail: "Geolocation is not supported by your browser.",
        life: 3000,
      });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        handleLocationUpdate(newPosition);

        // Try to get address details from coordinates if reverse geocoding is enabled
        if (enableReverseGeocoding && onAddressChange) {
          fetchAddressFromCoordinates(newPosition.lat, newPosition.lng);
        }

        setGeoLoading(false);
        toast.current?.show({
          severity: "success",
          summary: "Location",
          detail: "Location fetched successfully.",
          life: 2000,
        });
      },
      () => {
        setGeoLoading(false);
        toast.current?.show({
          severity: "error",
          summary: "Location Error",
          detail: "Unable to fetch location.",
          life: 3000,
        });
      }
    );
  }, [handleLocationUpdate, enableReverseGeocoding, onAddressChange, toast]);

  // Fetch address from coordinates using reverse geocoding
  const fetchAddressFromCoordinates = useCallback(
    async (lat: number, lng: number) => {
      if (!enableReverseGeocoding || !onAddressChange) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.address) {
          const {
            road,
            house_number,
            city,
            town,
            state,
            postcode,
            country,
            village,
          } = data.address;

          // Construct street address
          let street = "";
          if (house_number) street += house_number + " ";
          if (road) street += road;

          // Set city (may be called town or village in some areas)
          const cityValue = city || town || village || "";

          // Update address fields
          const addressDetails: AddressDetails = {
            address: street,
            city: cityValue,
            state: state || "",
            postalCode: postcode || "",
            country: country || "",
          };

          onAddressChange(addressDetails);
        }      } catch (error) {
        console.error("Error with reverse geocoding:", error);
        const { summary, detail } = extractErrorForToast(error);
        toast.current?.show({
          severity: "error",
          summary,
          detail,
          life: 3000,
        });
      }
    },
    [enableReverseGeocoding, onAddressChange]
  );

  // Geocode address to coordinates
  const handleGeocodeAddress = useCallback(async () => {
    if (!addressForGeocoding?.address || !addressForGeocoding?.city) {
      toast.current?.show({
        severity: "warn",
        summary: "Address Required",
        detail: "Please enter at least street address and city",
        life: 3000,
      });
      return;
    }

    setGeoLoading(true);
    const addressString = `${addressForGeocoding.address}, ${
      addressForGeocoding.city
    }${addressForGeocoding.state ? ", " + addressForGeocoding.state : ""}${
      addressForGeocoding.postalCode ? " " + addressForGeocoding.postalCode : ""
    }${addressForGeocoding.country ? ", " + addressForGeocoding.country : ""}`;

    try {
      const encodedAddress = encodeURIComponent(addressString);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      const data = await response.json();

      setGeoLoading(false);

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        };

        handleLocationUpdate(newPosition);

        if (mapRef.current) {
          mapRef.current.setView([newPosition.lat, newPosition.lng], zoom);
        }

        toast.current?.show({
          severity: "success",
          summary: "Location Found",
          detail: "Address geocoded successfully",
          life: 2000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Geocoding Error",
          detail: "Could not find location from address",
          life: 3000,
        });
      }    } catch (error) {
      setGeoLoading(false);
      console.error("Error with geocoding:", error);
      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 3000,
      });
    }
  }, [addressForGeocoding, handleLocationUpdate, zoom, toast]);

  // Reset location
  const handleResetLocation = useCallback(() => {
    setMarkerPosition(null);
    setMapCenter(initialCenter);
    onLocationChange(initialCenter);

    toast.current?.show({
      severity: "info",
      summary: "Location Reset",
      detail: "Location has been reset",
      life: 2000,
    });
  }, [initialCenter, onLocationChange, toast]);

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    async (e: L.DragEndEvent) => {
      const marker = e.target;
      const position = marker.getLatLng();
      const newPosition = {
        lat: position.lat,
        lng: position.lng,
      };

      handleLocationUpdate(newPosition);

      // Perform reverse geocoding if enabled
      if (enableReverseGeocoding && onAddressChange) {
        await fetchAddressFromCoordinates(newPosition.lat, newPosition.lng);
      }
    },
    [
      handleLocationUpdate,
      enableReverseGeocoding,
      onAddressChange,
      fetchAddressFromCoordinates,
    ]
  );

  const containerStyle = {
    width,
    height,
  };

  const defaultLocationHint =
    "Click on the map to select a location, or use the buttons below to find your location";

  return (
    <div className={`interactive-map-container ${className}`}>
      {/* Control buttons */}
      {(showLocationButton || showAddressButton || showResetButton) && (
        <div className="flex gap-2 mb-3">
          {showLocationButton && (
            <Button
              type="button"
              label={
                geoLoading ? "Getting Location..." : "Use My Current Location"
              }
              icon="pi pi-map-marker"
              onClick={handleGetCurrentLocation}
              disabled={geoLoading || isLoading}
            />
          )}

          {showAddressButton && addressForGeocoding && (
            <Button
              type="button"
              label="Find from Address"
              icon="pi pi-search"
              onClick={handleGeocodeAddress}
              disabled={geoLoading || isLoading}
            />
          )}

          {showResetButton && markerPosition && (
            <Button
              type="button"
              label="Reset Location"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-danger"
              onClick={handleResetLocation}
              disabled={geoLoading || isLoading}
            />
          )}
        </div>
      )}

      {/* Coordinates display */}
      {showCoordinatesDisplay && markerPosition && (
        <div className="mt-2 mb-3">
          <span className="mr-3">{coordinatesLabel}: </span>
          <span className="mr-3">
            Lat: <b>{markerPosition.lat.toFixed(6)}</b>
          </span>
          <span>
            Lng: <b>{markerPosition.lng.toFixed(6)}</b>
          </span>
        </div>
      )}

      {/* Map container */}
      <div className="mt-3 mb-3">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={containerStyle}
          ref={mapRef}
          aria-label={ariaLabel}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Center map when mapCenter changes */}
          <MapCenterController center={mapCenter} zoom={zoom} />

          {/* Map click handler */}
          <MapClickHandler
            onLocationChange={handleLocationUpdate}
            enableReverseGeocoding={enableReverseGeocoding}
            onAddressChange={onAddressChange}
          />

          {/* Marker */}
          {markerPosition && (
            <Marker
              position={[markerPosition.lat, markerPosition.lng]}
              draggable={draggableMarker}
              icon={markerIcon}
              eventHandlers={
                draggableMarker
                  ? {
                      dragend: handleMarkerDrag,
                    }
                  : {}
              }
            >
              {showPopup && <Popup>{popupContent}</Popup>}
            </Marker>
          )}
        </MapContainer>

        {/* Hints */}
        {showHints && (
          <div className="mt-2 text-sm text-gray-600">
            <p>{locationHint || defaultLocationHint}</p>
            {draggableMarker && markerPosition && (
              <p className="mt-1">
                You can drag the marker to adjust the location precisely
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
