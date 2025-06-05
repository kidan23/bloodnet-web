import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useNearbyMedicalInstitutions } from './api';
import MedicalInstitutionCard from './MedicalInstitutionCard';
import DisplayMap from '../../components/map/DisplayMap';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapPoint } from '../../components/map/DisplayMap';
import type { MedicalInstitution } from './types';

const NearbyMedicalInstitutionsSearch: React.FC = () => {
  const [location, setLocation] = useState<[number, number]>([0, 0]);
  const [radius, setRadius] = useState<number>(10); // Default radius in km
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedInstitution, setSelectedInstitution] = useState<MedicalInstitution | null>(null);
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

  // Convert medical institutions to map points
  const mapPoints: MapPoint[] = useMemo(() => {
    if (!data?.results) return [];
    return data.results.map((institution: MedicalInstitution) => ({
      id: institution._id,
      lat: institution.location.coordinates[1], // latitude
      lng: institution.location.coordinates[0], // longitude
      title: institution.name,
      description: `${institution.type} • ${institution.address}`,
      type: 'hospital' as const,
      data: institution
    }));
  }, [data?.results]);

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
    }    setSearchInitiated(true);
  };
  return (
    <div className="p-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Toast ref={toast} /><div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Nearby Medical Institutions</h1>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button 
              label="List" 
              icon="pi pi-list" 
              className={viewMode === 'list' ? 'p-button-raised' : 'p-button-outlined'} 
              size="small"
              onClick={() => setViewMode('list')} 
            />
            <Button 
              label="Map" 
              icon="pi pi-map" 
              className={viewMode === 'map' ? 'p-button-raised' : 'p-button-outlined'} 
              size="small"
              onClick={() => setViewMode('map')} 
            />
          </div>
          <Button 
            label="Back to List" 
            icon="pi pi-arrow-left" 
            className="p-button-outlined" 
            onClick={() => navigate('/medical-institutions')} 
          />
        </div>
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
      </Card>      {searchInitiated && (
        <>
          {isLoading ? (
            <div className="flex justify-content-center">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
          ) : error ? (
            <div className="p-message p-message-error">
              <div className="p-message-text">Error loading results</div>
            </div>
          ) : (
            viewMode === 'map' ? (
              <div className="grid">
                <div className="col-12 lg:col-8">
                  <Card>
                    <DisplayMap
                      points={mapPoints}
                      height="500px"
                      showUserLocation={true}
                      userLocation={location[0] !== 0 && location[1] !== 0 ? {
                        lat: location[1],
                        lng: location[0]
                      } : undefined}
                      onPointClick={(point) => {
                        const institution = point.data as MedicalInstitution;
                        setSelectedInstitution(institution);
                      }}
                      selectedPointId={selectedInstitution?._id}
                      renderPopup={(point) => {
                        const institution = point.data as MedicalInstitution;
                        return (
                          <div className="p-3">
                            <h4 className="font-semibold text-lg mb-2">{institution.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{institution.type}</p>
                            <p className="text-sm text-gray-600 mb-2">{institution.address}</p>
                            {institution.phoneNumber && (
                              <p className="text-sm mb-2">📞 {institution.phoneNumber}</p>
                            )}
                            {institution.services && institution.services.length > 0 && (
                              <div className="mb-2">
                                <span className="text-sm font-medium">Services: </span>
                                <span className="text-sm">{institution.services.join(', ')}</span>
                              </div>
                            )}
                            {institution.operatingHours && institution.operatingHours.length > 0 && (
                              <p className="text-xs text-gray-500">Hours: {institution.operatingHours.join(', ')}</p>
                            )}
                            <Button 
                              label="View Details" 
                              size="small" 
                              className="mt-2"
                              onClick={() => navigate(`/medical-institutions/${institution._id}`)}
                            />
                          </div>
                        );
                      }}
                    />
                  </Card>
                </div>
                <div className="col-12 lg:col-4">
                  <div className="sticky" style={{ top: '20px' }}>
                    <h3>Search Results ({data?.results.length || 0})</h3>
                    <div className="results-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      {data?.results.length === 0 ? (
                        <div className="text-center p-4">
                          <p>No medical institutions found in this area</p>
                        </div>
                      ) : (
                        <div className="flex flex-column gap-3">
                          {data?.results.map((institution) => (
                            <div 
                              key={institution._id}
                              className={`cursor-pointer ${selectedInstitution?._id === institution._id ? 'ring-2 ring-blue-500' : ''}`}
                              onClick={() => setSelectedInstitution(institution)}
                            >
                              <MedicalInstitutionCard 
                                institution={institution}
                                showActions={false}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="results-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
            )
          )}
        </>
      )}
    </div>
  );
};

export default NearbyMedicalInstitutionsSearch;
