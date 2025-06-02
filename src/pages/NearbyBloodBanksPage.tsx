import React, { useState, useMemo } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useSearchBloodBanksByCoordinates, useSearchNearbyWithBloodType } from "../state/bloodBanks";
import { useLocationSearch } from "../pages/BloodBanksPage/locationUtils";
import DisplayMap from "../components/map/DisplayMap";
import BloodBankCard from "../pages/BloodBanksPage/BloodBankCard";
import type { MapPoint } from "../components/map/DisplayMap";
import type { BloodBank } from "../pages/BloodBanksPage/types";

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NearbyBloodBanksPage: React.FC = () => {
  const [selectedBloodType, setSelectedBloodType] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // Default 10km
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map'); // Default to map view
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  
  const {
    userLocation,
    isLocating,
    locationError,
    searchByLocation
  } = useLocationSearch();
  
  // Query for blood banks based on current location
  const {
    data: nearbyBanksData,
    isLoading: isLoadingNearby,
    isError: isErrorNearby,
    error: errorNearby
  } = useSearchBloodBanksByCoordinates(
    userLocation ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      maxDistance
    } : { latitude: 0, longitude: 0 }
  );
  
  // Query for blood banks with specific blood type
  const {
    data: nearbyWithBloodTypeData,
    isLoading: isLoadingWithBloodType,
    isError: isErrorWithBloodType,
    error: errorWithBloodType
  } = useSearchNearbyWithBloodType(
    userLocation && selectedBloodType ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      bloodType: selectedBloodType,
      maxDistance
    } : { latitude: 0, longitude: 0, bloodType: '' }
  );
  
  const nearbyBanks = nearbyBanksData?.results || [];
  const nearbyWithBloodType = nearbyWithBloodTypeData?.results || [];
  
  const handleSearch = () => {
    if (userLocation) {
      searchByLocation(selectedBloodType, maxDistance);
    }
  };
  
  const isLoading = isLoadingNearby || isLoadingWithBloodType;
  const isError = isErrorNearby || isErrorWithBloodType;
  const error = errorNearby || errorWithBloodType;
  const displayedBanks = selectedBloodType ? nearbyWithBloodType : nearbyBanks;

  // Convert blood banks to map points
  const mapPoints: MapPoint[] = useMemo(() => {
    return displayedBanks.map((bank: BloodBank) => ({
      id: bank._id,
      lat: bank.location.coordinates[1], // latitude
      lng: bank.location.coordinates[0], // longitude
      title: bank.name,
      description: `${bank.address}${bank.contactNumber ? ` • ${bank.contactNumber}` : ''}`,
      type: 'bloodbank' as const,
      data: bank
    }));
  }, [displayedBanks]);

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-3">
        <h1>Nearby Blood Banks</h1>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button 
              label="List" 
              icon="pi pi-list" 
              className={viewMode === 'list' ? 'p-button-raised' : 'p-button-outlined'} 
              onClick={() => setViewMode('list')} 
            />
            <Button 
              label="Map" 
              icon="pi pi-map" 
              className={viewMode === 'map' ? 'p-button-raised' : 'p-button-outlined'} 
              onClick={() => setViewMode('map')} 
            />
          </div>
        </div>
      </div>
      
      <Card className="mb-3">
        <div className="flex flex-wrap gap-3 align-items-end">
          <div className="flex flex-column gap-1" style={{ minWidth: 180 }}>
            <label>Blood Type (Optional)</label>
            <Dropdown 
              value={selectedBloodType} 
              options={[{ label: 'Any Blood Type', value: '' }, ...BLOOD_TYPES.map(bt => ({ label: bt, value: bt }))]} 
              onChange={e => setSelectedBloodType(e.value)} 
              placeholder="Select Blood Type" 
            />
          </div>
          <div className="flex flex-column gap-1" style={{ minWidth: 120 }}>
            <label>Max Distance (km)</label>
            <InputText 
              type="number" 
              min={1} 
              max={100} 
              value={maxDistance.toString()} 
              onChange={e => setMaxDistance(Number(e.target.value))} 
            />
          </div>
          <Button 
            label={isLocating ? 'Getting Location...' : 'Search Nearby'} 
            icon="pi pi-search" 
            onClick={handleSearch} 
            disabled={isLocating || !userLocation} 
          />
        </div>
        {locationError && <div className="mt-2 text-danger">{locationError}</div>}
        {userLocation && (
          <div className="mt-2" style={{ fontSize: 13, color: '#6b7280' }}>
            Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </div>
        )}
      </Card>
      
      {isLoading ? (
        <div 
          className="flex justify-content-center align-items-center" 
          style={{ minHeight: 120 }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "1.5rem" }}></i>
          <span className="ml-2">Searching for nearby blood banks...</span>
        </div>
      ) : isError ? (
        <div className="text-danger">
          Error finding nearby blood banks: {(error as Error)?.message || 'Unknown error'}
        </div>
      ) : displayedBanks.length > 0 ? (
        viewMode === 'map' ? (
          <Card>
            <div className="grid">
              <div className="col-12 lg:col-8">
                <DisplayMap
                  points={mapPoints}
                  height="500px"
                  showUserLocation={true}
                  userLocation={userLocation ? {
                    lat: userLocation.latitude,
                    lng: userLocation.longitude
                  } : undefined}
                  onPointClick={(point) => {
                    const bank = point.data as BloodBank;
                    setSelectedBank(bank);
                  }}
                  selectedPointId={selectedBank?._id}
                  renderPopup={(point) => {
                    const bank = point.data as BloodBank;
                    return (
                      <div className="p-3">
                        <h4 className="font-semibold text-lg mb-2">{bank.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{bank.address}</p>
                        {bank.contactNumber && (
                          <p className="text-sm mb-2">📞 {bank.contactNumber}</p>
                        )}
                        {bank.bloodTypesAvailable && bank.bloodTypesAvailable.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Available: </span>
                            <span className="text-sm">{bank.bloodTypesAvailable.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              <div className="col-12 lg:col-4">
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <h3 className="mb-3">Blood Banks ({displayedBanks.length})</h3>
                  <div className="flex flex-column gap-3">
                    {displayedBanks.map(bank => (
                      <div 
                        key={bank._id}
                        className={`cursor-pointer ${selectedBank?._id === bank._id ? 'border-primary border-2' : ''}`}
                        onClick={() => setSelectedBank(bank)}
                      >
                        <BloodBankCard bloodBank={bank} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-nogutter">
            {displayedBanks.map(bank => (
              <div className="col-12 md:col-6 lg:col-4" key={bank._id}>
                <BloodBankCard bloodBank={bank} />
              </div>
            ))}
          </div>
        )
      ) : (
        <Card>
          <div className="text-center p-5">
            {userLocation ? 
              'No blood banks found nearby. Try increasing the distance or changing search criteria.' : 
              'Please enable location services to find nearby blood banks.'
            }
          </div>
        </Card>
      )}
    </div>
  );
};

export default NearbyBloodBanksPage;
