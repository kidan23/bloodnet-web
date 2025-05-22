import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useSearchBloodBanksByCoordinates, useSearchNearbyWithBloodType } from '../../state/bloodBanks';
import { useLocationSearch } from './locationUtils';
import BloodBankCard from './BloodBankCard';
import type { BloodBank } from './types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NearbyBloodBanksSearch: React.FC = () => {
  const [selectedBloodType, setSelectedBloodType] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // Default 10km
  const {
    userLocation,
    isLocating,
    locationError,
    searchByLocation,
    clearLocationSearch
  } = useLocationSearch();
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
  return (
    <div className="flex flex-column gap-4" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex justify-content-between align-items-center mb-3">
        <h1>Nearby Blood Banks</h1>
        <Link to="/blood-banks">
          <Button label="View All Blood Banks" className="secondary" />
        </Link>
      </div>
      <Card className="mb-3">
        <div className="flex flex-wrap gap-3 align-items-end">
          <div className="flex flex-column gap-1" style={{ minWidth: 180 }}>
            <label>Blood Type (Optional)</label>
            <Dropdown value={selectedBloodType} options={[{ label: 'Any Blood Type', value: '' }, ...BLOOD_TYPES.map(bt => ({ label: bt, value: bt }))]} onChange={e => setSelectedBloodType(e.value)} placeholder="Select Blood Type" />
          </div>
          <div className="flex flex-column gap-1" style={{ minWidth: 120 }}>
            <label>Max Distance (km)</label>
            <InputText type="number" min={1} max={100} value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} />
          </div>
          <Button label={isLocating ? 'Getting Location...' : 'Search Nearby'} icon="pi pi-search" onClick={handleSearch} disabled={isLocating || !userLocation} />
        </div>
        {locationError && <div className="mt-2 text-danger">{locationError}</div>}
        {userLocation && (
          <div className="mt-2" style={{ fontSize: 13, color: '#6b7280' }}>
            Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </div>
        )}
      </Card>
      {isLoading ? (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: 120 }}>Searching for nearby blood banks...</div>
      ) : isError ? (
        <div className="text-danger">Error finding nearby blood banks: {(error as Error)?.message || 'Unknown error'}</div>
      ) : displayedBanks.length > 0 ? (
        <div className="grid grid-nogutter">
          {displayedBanks.map(bank => (
            <div className="col-12 md:col-6 lg:col-4" key={bank.id}>
              <BloodBankCard bloodBank={bank} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ minHeight: 120 }}>
          {userLocation ? 'No blood banks found nearby.' : 'Please enable location services to find nearby blood banks.'}
        </div>
      )}
    </div>
  );
};

export default NearbyBloodBanksSearch;
