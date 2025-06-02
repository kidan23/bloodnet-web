import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Link } from 'react-router-dom';
import { useNearbyDonors } from '../../state/donors';
import { DisplayMap, type MapPoint } from '../../components/map';
import { dbDonorToMapPoint } from '../../components/map/mapUtils';
import { useGlobalToast } from '../../components/layout/ToastContext';
import type { Donor } from './types';
import { InputNumber } from 'primereact/inputnumber';
// Import blood bank and medical institution APIs and types
import { useBloodBanks } from '../../state/bloodBanks';
import { useMedicalInstitutions } from '../MedicalInstitutionsPage/api';
import { extractErrorForToast } from "../../utils/errorHandling";
import type { BloodBank } from '../BloodBanksPage/types';
import type { MedicalInstitution } from '../MedicalInstitutionsPage/types';

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const LOCATION_SOURCES = [
  { label: 'My Current Location', value: 'current' },
  { label: 'Blood Bank', value: 'bloodbank' },
  { label: 'Medical Institution', value: 'medical' }
];

interface DonorMapPoint extends MapPoint {
  donor: Donor;
}

const NearbyDonorsPage: React.FC = () => {
  const toast = useGlobalToast();
  
  // Location source and search parameters
  const [locationSource, setLocationSource] = useState<string>('current');
  const [selectedBloodBank, setSelectedBloodBank] = useState<BloodBank | null>(null);
  const [selectedMedicalInstitution, setSelectedMedicalInstitution] = useState<MedicalInstitution | null>(null);
  
  // Location and search parameters
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBloodType, setSelectedBloodType] = useState<string>(''); // No default blood type - returns all types when empty
  const [radius, setRadius] = useState<number>(10); // Default 10km
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  
  // Filter options
  const [showEligibleOnly, setShowEligibleOnly] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    // Selected donor for details
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  // Queries for blood banks and medical institutions
  const { data: bloodBanksData } = useBloodBanks({ limit: 100 });
  const { data: medicalInstitutionsData } = useMedicalInstitutions({ limit: 100 });
  
  const bloodBanks = bloodBanksData?.results || [];
  const medicalInstitutions = medicalInstitutionsData?.results || [];
  // Get the effective location based on the selected source
  const getEffectiveLocation = () => {
    switch (locationSource) {
      case 'bloodbank':
        return selectedBloodBank ? {
          lat: selectedBloodBank.location.coordinates[1],
          lng: selectedBloodBank.location.coordinates[0]
        } : null;
      case 'medical':
        return selectedMedicalInstitution ? {
          lat: selectedMedicalInstitution.coordinates[1],
          lng: selectedMedicalInstitution.coordinates[0]
        } : null;
      default:
        return userLocation;
    }
  };

  const effectiveLocation = getEffectiveLocation();

  // Get nearby donors data - only query when we have location and search is initiated
  const { 
    data: nearbyData, 
    isLoading, 
    error 
  } = useNearbyDonors(
    searchInitiated && effectiveLocation ? selectedBloodType : '', // Empty blood type returns all types
    searchInitiated && effectiveLocation ? effectiveLocation.lng : 0,
    searchInitiated && effectiveLocation ? effectiveLocation.lat : 0,
    radius,
    {
      isEligible: showEligibleOnly ? true : undefined,
      receiveDonationAlerts: showAvailableOnly ? true : undefined
    }
  );

  const donors = nearbyData?.results || [];
  
  // Clear selected donor if it's no longer in the current results
  useEffect(() => {
    if (selectedDonor && donors.length > 0) {
      const isDonorStillInResults = donors.some((donor: any) => donor._id === selectedDonor._id);
      if (!isDonorStillInResults) {
        setSelectedDonor(null);
      }
    }
  }, [donors, selectedDonor]);
  
  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          // Automatically initiate search once location is available
          setSearchInitiated(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Could not access your location. Please enable location services.');
          setIsLocating(false);
          // Set default location (Mek'ele, Ethiopia)
          setUserLocation({
            lat: 13.5169,
            lng: 39.45389
          });
          // Automatically initiate search with default location
          setSearchInitiated(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      // Set default location
      setUserLocation({
        lat: 13.5169,
        lng: 39.45389
      });
      // Automatically initiate search with default location
      setSearchInitiated(true);
    }
  }, []);
  // Convert donors to map points
  const mapPoints: DonorMapPoint[] = donors.map((donor: any) => {
    return {
      ...dbDonorToMapPoint(donor),
      donor
    } as DonorMapPoint;
  });  const handleSearch = () => {
    const location = getEffectiveLocation();
    
    if (!location) {
      let errorMessage = 'Location is required to find nearby donors.';
      
      if (locationSource === 'bloodbank') {
        errorMessage = 'Please select a blood bank to search from.';
      } else if (locationSource === 'medical') {
        errorMessage = 'Please select a medical institution to search from.';
      }
      
      toast.current?.show({
        severity: 'error',
        summary: 'Location Required',
        detail: errorMessage,
        life: 3000,
      });
      return;
    }

    setSearchInitiated(true);
    
    let locationName = '';
    if (locationSource === 'bloodbank' && selectedBloodBank) {
      locationName = ` from ${selectedBloodBank.name}`;
    } else if (locationSource === 'medical' && selectedMedicalInstitution) {
      locationName = ` from ${selectedMedicalInstitution.name}`;
    }
    
    const searchMessage = selectedBloodType 
      ? `Searching for ${selectedBloodType} donors within ${radius}km${locationName}...`
      : `Searching for all blood type donors within ${radius}km${locationName}...`;
    
    toast.current?.show({
      severity: 'info',
      summary: 'Searching',
      detail: searchMessage,
      life: 2000,
    });
  };

  const handlePointClick = (point: MapPoint) => {
    const donorPoint = point as DonorMapPoint;
    setSelectedDonor(donorPoint.donor);
  };

  const handleMapClick = () => {
    setSelectedDonor(null);
  };
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Distance unknown';
    
    // Distance is in meters, convert to km only when >= 1000m
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km away`;
    } else {
      return `${Math.round(distance)} m away`;
    }
  };

  const getDonorStatusColor = (donor: Donor) => {
    if (!donor.isEligible) return 'danger';
    if (donor.receiveDonationAlerts) return 'success';
    return 'warning';
  };

  const getDonorStatusLabel = (donor: Donor) => {
    if (!donor.isEligible) return 'Not Eligible';
    if (donor.receiveDonationAlerts) return 'Available';
    return 'Eligible';
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Nearby Donors</h1>
        <Link to="/donors">
          <Button label="View All Donors" icon="pi pi-list" className="p-button-outlined" />
        </Link>
      </div>      {/* Search Controls */}
      <Card className="mb-4">
        <h3>Search for Nearby Donors</h3>
          <div className="grid gap-1">
          <div className="col-12 lg:col-3 md:col-4">
            <div className="field">
              <label htmlFor="locationSource" className="font-bold block mb-2">
                Search Location
              </label>
              <Dropdown
                id="locationSource"
                value={locationSource}
                options={LOCATION_SOURCES}
                onChange={(e) => {
                  setLocationSource(e.value);
                  // Reset selected institutions when changing source
                  setSelectedBloodBank(null);
                  setSelectedMedicalInstitution(null);
                }}
                placeholder="Select location source"
                className="w-full"
              />
            </div>
          </div>

          {/* Blood Bank Selection */}
          {locationSource === 'bloodbank' && (
            <div className="col-12 lg:col-3 md:col-4">
              <div className="field">
                <label htmlFor="bloodBank" className="font-bold block mb-2">
                  Blood Bank
                </label>
                <Dropdown
                  id="bloodBank"
                  value={selectedBloodBank}
                  options={bloodBanks.map(bank => ({ 
                    label: bank.name, 
                    value: bank 
                  }))}
                  onChange={(e) => setSelectedBloodBank(e.value)}
                  placeholder="Select a blood bank"
                  className="w-full"
                  filter
                  showClear
                />
              </div>
            </div>
          )}

          {/* Medical Institution Selection */}
          {locationSource === 'medical' && (
            <div className="col-12 lg:col-3 md:col-4">
              <div className="field">
                <label htmlFor="medicalInstitution" className="font-bold block mb-2">
                  Medical Institution
                </label>
                <Dropdown
                  id="medicalInstitution"
                  value={selectedMedicalInstitution}
                  options={medicalInstitutions.map(institution => ({ 
                    label: institution.name, 
                    value: institution 
                  }))}
                  onChange={(e) => setSelectedMedicalInstitution(e.value)}
                  placeholder="Select a medical institution"
                  className="w-full"
                  filter
                  showClear
                />
              </div>
            </div>
          )}

          <div className="col-12 lg:col-3 md:col-4">
            <div className="field">
              <label htmlFor="bloodType" className="font-bold block mb-2">
                Blood Type (Optional)
              </label>
              <Dropdown
                id="bloodType"
                value={selectedBloodType}
                options={BLOOD_TYPES.map(bt => ({ label: bt, value: bt }))}
                onChange={(e) => setSelectedBloodType(e.value)}
                placeholder="All Blood Types"
                className="w-full"
                showClear
              />
            </div>
          </div>
          
          <div className="col-12 lg:col-2 md:col-3">
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
          
          <div className="col-12 md:col-5 lg:col-7">
            <div className="field">
              <label className="font-bold block mb-2">Filters</label>
              <div className="flex flex-column lg:flex-row flex-wrap gap-3">
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="eligibleOnly"
                    checked={showEligibleOnly}
                    onChange={(e) => setShowEligibleOnly(e.checked || false)}
                  />
                  <label htmlFor="eligibleOnly" className="ml-2 white-space-nowrap">Eligible donors only</label>
                </div>
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="availableOnly"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.checked || false)}
                  />
                  <label htmlFor="availableOnly" className="ml-2 white-space-nowrap">Available for alerts</label>
                </div>
              </div>
            </div>
          </div>
        </div>        <div className="flex justify-content-between align-items-center mt-3">
          <div>
            {effectiveLocation && (
              <div className="text-600">
                <small>
                  {locationSource === 'bloodbank' && selectedBloodBank ? (
                    <>Search center: {selectedBloodBank.name} ({effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)})</>
                  ) : locationSource === 'medical' && selectedMedicalInstitution ? (
                    <>Search center: {selectedMedicalInstitution.name} ({effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)})</>
                  ) : (
                    <>Your location: {effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)}</>
                  )}
                </small>
              </div>
            )}
            {locationError && (
              <div className="text-red-500 text-sm">{locationError}</div>
            )}
          </div><Button 
            label={isLocating ? 'Getting Location...' : 'Search Nearby Donors'} 
            icon="pi pi-search" 
            onClick={handleSearch}
            loading={isLoading}
            disabled={isLocating}
          />
        </div>
      </Card>

      {/* Results */}
      {searchInitiated && (
        <div className="grid">
          {/* Map */}
          <div className="col-12 lg:col-8">
            <Card>              <h3>Map View</h3>
              {effectiveLocation && (
                <DisplayMap
                  points={mapPoints}
                  center={effectiveLocation}
                  zoom={12}
                  height="500px"
                  autoFitBounds={mapPoints.length > 0}
                  showUserLocation={locationSource === 'current'}
                  userLocation={locationSource === 'current' ? effectiveLocation : undefined}
                  onPointClick={handlePointClick}
                  onMapClick={handleMapClick}
                  selectedPointId={selectedDonor?._id}
                  isLoading={isLoading}
                  renderPopup={(point) => {
                    const donorPoint = point as DonorMapPoint;
                    const donor = donorPoint.donor;
                    return (
                      <div className="p-2">
                        <h4 className="m-0 mb-2">{donor.firstName} {donor.lastName}</h4>
                        <div className="flex flex-column gap-1">
                          <div>
                            <Tag 
                              value={`${donor.bloodType}${donor.RhFactor}`} 
                              severity="info"
                            />
                            <Tag 
                              value={getDonorStatusLabel(donor)} 
                              severity={getDonorStatusColor(donor)}
                              className="ml-2"
                            />
                          </div>
                          <small className="text-600">{formatDistance(donor.distance)}</small>
                          {donor.phoneNumber && (
                            <small><i className="pi pi-phone mr-1"></i>{donor.phoneNumber}</small>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </Card>
          </div>

          {/* Donor Details or List */}
          <div className="col-12 lg:col-4">
            {selectedDonor ? (
              <Card>
                <h3>Donor Details</h3>
                <div className="flex flex-column gap-3">
                  <div>
                    <h4 className="m-0">{selectedDonor.firstName} {selectedDonor.lastName}</h4>
                    <div className="flex gap-2 mt-2">
                      <Tag 
                        value={`${selectedDonor.bloodType}${selectedDonor.RhFactor}`} 
                        severity="info"
                      />
                      <Tag 
                        value={getDonorStatusLabel(selectedDonor)} 
                        severity={getDonorStatusColor(selectedDonor)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="m-0"><strong>Distance:</strong> {formatDistance(selectedDonor.distance)}</p>
                    <p className="m-0"><strong>Phone:</strong> {selectedDonor.phoneNumber}</p>
                    {selectedDonor.email && (
                      <p className="m-0"><strong>Email:</strong> {selectedDonor.email}</p>
                    )}
                  </div>

                  {selectedDonor.lastDonationDate && (
                    <div>
                      <p className="m-0"><strong>Last Donation:</strong></p>
                      <p className="m-0 text-600">{new Date(selectedDonor.lastDonationDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/donors/${selectedDonor._id}`}>
                      <Button 
                        label="View Profile" 
                        icon="pi pi-user" 
                        size="small"
                        className="p-button-outlined"
                      />
                    </Link>
                    {selectedDonor.phoneNumber && (
                      <Button 
                        label="Call" 
                        icon="pi pi-phone" 
                        size="small"
                        onClick={() => window.open(`tel:${selectedDonor.phoneNumber}`)}
                      />
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <h3>Search Results</h3>
                {isLoading ? (
                  <div className="text-center p-4">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2">Searching for nearby donors...</p>
                  </div>                ) : error ? (
                  <div className="text-center p-4">
                    <i className="pi pi-exclamation-triangle text-orange-500" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 text-600">{(() => {
                      const { summary, detail } = extractErrorForToast(error);
                      return `${summary}: ${detail}`;
                    })()}</p>
                  </div>) : donors.length > 0 ? (                  <div>
                    <p className="text-600 mb-3">
                      Found {donors.length} donors within {radius}km
                      {locationSource === 'bloodbank' && selectedBloodBank ? ` from ${selectedBloodBank.name}` : 
                       locationSource === 'medical' && selectedMedicalInstitution ? ` from ${selectedMedicalInstitution.name}` : ''}
                      {selectedBloodType ? ` for blood type ${selectedBloodType}` : ' (all blood types)'}
                    </p>
                    <div className="flex flex-column gap-2">
                      {donors.slice(0, 5).map((donor: any) => (
                        <div 
                          key={donor._id}
                          className="p-2 border-1 border-round cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedDonor(donor)}
                        >
                          <div className="flex justify-content-between align-items-start">
                            <div>
                              <p className="m-0 font-medium">{donor.firstName} {donor.lastName}</p>
                              <p className="m-0 text-sm text-600">{formatDistance(donor.distance)}</p>
                            </div>
                            <Tag 
                              value={`${donor.bloodType}${donor.RhFactor}`} 
                              severity="info"
                            />
                          </div>
                        </div>
                      ))}
                      {donors.length > 5 && (
                        <p className="text-center text-600 mt-2">
                          +{donors.length - 5} more donors. Click on map markers to see details.
                        </p>
                      )}
                    </div>
                  </div>                ) : searchInitiated ? (
                  <div className="text-center p-4">
                    <i className="pi pi-info-circle text-blue-500" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 text-600">
                      No donors found within {radius}km
                      {locationSource === 'bloodbank' && selectedBloodBank ? ` from ${selectedBloodBank.name}` : 
                       locationSource === 'medical' && selectedMedicalInstitution ? ` from ${selectedMedicalInstitution.name}` : ''}
                      {selectedBloodType ? ` for blood type ${selectedBloodType}` : ''}.
                    </p>
                    <p className="text-600">Try increasing the search radius{selectedBloodType ? ' or selecting a different blood type' : ' or filtering by blood type'}.</p>
                  </div>                ) : (
                  <div className="text-center p-4">
                    <i className="pi pi-search text-gray-400" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 text-600">
                      Select a location source and click "Search Nearby Donors" to find donors. 
                      You can search from your current location, a blood bank, or a medical institution.
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyDonorsPage;
