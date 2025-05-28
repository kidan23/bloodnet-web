import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useNearbyMedicalInstitutions } from './api';
import MedicalInstitutionCard from './MedicalInstitutionCard';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Make sure Leaflet CSS is imported somewhere in your app
// import 'leaflet/dist/leaflet.css';

interface MapCenterProps {
  center: [number, number];
}

const MapCenter: React.FC<MapCenterProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const NearbyMedicalInstitutionsSearch: React.FC = () => {
  const [location, setLocation] = useState<[number, number]>([0, 0]);
  const [radius, setRadius] = useState<number>(10); // Default radius in km
  const [searchInitiated, setSearchInitiated] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const { data, isLoading, error } = useNearbyMedicalInstitutions(
    location[0], // longitude
    location[1], // latitude
    radius,
    { 
      limit: 100, // We can show more results on the map
      isActive: true 
    }
  );

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.current?.show({
            severity: 'warn',
            summary: 'Location Access',
            detail: 'Could not access your location. Please enter coordinates manually.',
            life: 5000,
          });
          // Set default location (this could be a central point in your service area)
          setLocation([-97.7431, 30.2672]); // Example: Austin, TX
        }
      );
    }
  }, []);

  const handleLocationChange = (index: number, value: number) => {
    const newLocation = [...location];
    newLocation[index] = value;
    setLocation(newLocation as [number, number]);
  };

  const handleSearch = () => {
    if (location[0] === 0 && location[1] === 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Invalid Coordinates',
        detail: 'Please enter valid coordinates',
        life: 3000,
      });
      return;
    }
    setSearchInitiated(true);
  };

  // Create custom marker icon
  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Nearby Medical Institutions</h1>
        <Button 
          label="Back to List" 
          icon="pi pi-arrow-left" 
          className="p-button-outlined" 
          onClick={() => navigate('/medical-institutions')} 
        />
      </div>

      <Card className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-4 lg:col-3">
            <div className="field">
              <label htmlFor="longitude" className="font-bold block mb-2">
                Longitude
              </label>
              <InputNumber
                id="longitude"
                value={location[0]}
                onChange={(e) => handleLocationChange(0, e.value || 0)}
                mode="decimal"
                minFractionDigits={6}
                maxFractionDigits={6}
                className="w-full"
              />
            </div>
          </div>
          <div className="col-12 md:col-4 lg:col-3">
            <div className="field">
              <label htmlFor="latitude" className="font-bold block mb-2">
                Latitude
              </label>
              <InputNumber
                id="latitude"
                value={location[1]}
                onChange={(e) => handleLocationChange(1, e.value || 0)}
                mode="decimal"
                minFractionDigits={6}
                maxFractionDigits={6}
                className="w-full"
              />
            </div>
          </div>
          <div className="col-12 md:col-4 lg:col-3">
            <div className="field">
              <label htmlFor="radius" className="font-bold block mb-2">
                Radius (km)
              </label>
              <InputNumber
                id="radius"
                value={radius}
                onChange={(e) => setRadius(e.value || 10)}
                min={1}
                max={100}
                className="w-full"
              />
            </div>
          </div>
          <div className="col-12 lg:col-3 flex align-items-end">
            <Button 
              label="Search Nearby" 
              icon="pi pi-search" 
              className="w-full"
              onClick={handleSearch}
              loading={isLoading}
            />
          </div>
        </div>
      </Card>

      {searchInitiated && (
        <>
          <div className="grid">
            <div className="col-12 lg:col-8">
              {location[0] !== 0 && location[1] !== 0 && (
                <div style={{ height: '500px', width: '100%' }}>
                  <MapContainer
                    center={[location[1], location[0]]} // Leaflet uses [lat, lng]
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenter center={[location[1], location[0]]} />
                    
                    {/* User's location marker */}
                    <Marker position={[location[1], location[0]]} icon={markerIcon}>
                      <Popup>Your location</Popup>
                    </Marker>
                      {/* Institution markers */}
                    {data?.results.map((institution) => (
                      <Marker 
                        key={institution._id} 
                        position={[institution.coordinates[1], institution.coordinates[0]]} 
                        icon={markerIcon}
                      >
                        <Popup>
                          <div>
                            <h4>{institution.name}</h4>
                            <p>{institution.type}</p>
                            <p>{institution.address}</p>
                            <Button 
                              label="View Details" 
                              size="small" 
                              onClick={() => navigate(`/medical-institutions/${institution._id}`)}
                            />
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>
            
            <div className="col-12 lg:col-4">
              <div className="sticky" style={{ top: '20px' }}>
                <h3>Search Results</h3>
                {isLoading ? (
                  <div className="flex justify-content-center">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                  </div>
                ) : error ? (
                  <div className="p-message p-message-error">
                    <div className="p-message-text">Error loading results</div>
                  </div>
                ) : (                  <div className="results-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {data?.results.length === 0 ? (
                      <div className="text-center p-4">
                        <p>No medical institutions found in this area</p>
                      </div>
                    ) : (
                      <div className="flex flex-column gap-3">
                        {data?.results.map((institution) => (
                          <MedicalInstitutionCard 
                            key={institution._id} 
                            institution={institution}
                            showActions={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyMedicalInstitutionsSearch;
