// Location picker component for blood requests
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { extractErrorForToast } from "../../utils/errorHandling";
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet-custom.css';

// Custom marker icon to replace the default one
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  coordinates: [number, number];
  onChange: (coords: [number, number]) => void;
  error?: string;
}

// Map marker and click handler component
const LocationMarker: React.FC<{
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}> = ({ position, setPosition }) => {
  const map = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lng, e.latlng.lat]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker 
      position={[position[1], position[0]]} 
      icon={markerIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latlng = marker.getLatLng();
          setPosition([latlng.lng, latlng.lat]);
        },
      }}
    >
      <Popup>
        <div>
          <strong>Selected Location</strong><br />
          Latitude: {position[1].toFixed(6)}<br />
          Longitude: {position[0].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
};

const LocationPicker: React.FC<LocationPickerProps> = ({ coordinates, onChange, error }) => {
  const [position, setPosition] = useState<[number, number]>(coordinates || [0, 0]);
  const [address, setAddress] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Update parent component when position changes
  useEffect(() => {
    onChange(position);
  }, [position, onChange]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setSearchError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition([position.coords.longitude, position.coords.latitude]);
        setIsLocating(false);
      },
      (error) => {
        setSearchError(`Unable to get location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Search for an address using Nominatim
  const searchByAddress = async () => {
    if (!address.trim()) {
      setSearchError('Please enter an address to search');
      return;
    }

    try {
      setSearchError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            'User-Agent': 'BloodNetWebApp/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setPosition([parseFloat(result.lon), parseFloat(result.lat)]);
      } else {
        setSearchError('No results found for the address');
      }    } catch (error) {
      const { summary, detail } = extractErrorForToast(error);
      setSearchError(`${summary}: ${detail}`);
    }
  };

  return (
    <div className="location-picker">
      <Card className="mb-3">
        <div className="p-fluid grid formgrid">
          <div className="col-12 mb-2">
            <div className="flex flex-wrap align-items-center">
              <InputText
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className="mr-2 mb-2"
                style={{ flexGrow: 1 }}
              />
              <Button
                type="button"
                icon="pi pi-search"
                label="Find"
                onClick={searchByAddress}
                className="mb-2"
              />
            </div>
            <div className="flex mt-2">
              <Button
                type="button"
                icon="pi pi-map-marker"
                label={isLocating ? 'Locating...' : 'Use My Current Location'}
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="mr-2"
              />
              <Button
                type="button"
                icon="pi pi-undo"
                label="Reset"
                className="p-button-secondary"
                onClick={() => setPosition([0, 0])}
              />
            </div>
            {(searchError || error) && (
              <small className="p-error block mt-2">{searchError || error}</small>
            )}
          </div>
        </div>
      </Card>

      <MapContainer
        center={[position[1], position[0]]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      <div className="mt-2 text-sm text-color-secondary">
        Click on the map to select a location or drag the marker to adjust it.
        Coordinates: [{position[0].toFixed(6)}, {position[1].toFixed(6)}]
      </div>
    </div>
  );
};

export default LocationPicker;
