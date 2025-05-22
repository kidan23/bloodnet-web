import { useState, useEffect } from 'react';
import { useSearchBloodBanksByCoordinates, useSearchNearbyWithBloodType } from '../../state/bloodBanks';
import type { NearbySearchParams } from './types';

interface UseLocationSearchResult {
  userLocation: { latitude: number; longitude: number } | null;
  isLocating: boolean;
  locationError: string | null;
  searchByLocation: (bloodType?: string, maxDistance?: number) => void;
  isSearching: boolean;
  clearLocationSearch: () => void;
}

export function useLocationSearch(): UseLocationSearchResult {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<NearbySearchParams & { bloodType?: string }>({
    latitude: 0,
    longitude: 0,
  });
  const [isSearchingEnabled, setIsSearchingEnabled] = useState(false);

  // Query for nearby blood banks
  const nearbyBanksQuery = useSearchBloodBanksByCoordinates({
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
    maxDistance: searchParams.maxDistance,
  });
  // Query for nearby blood banks with specific blood type
  const nearbyWithBloodTypeQuery = useSearchNearbyWithBloodType({
    latitude: searchParams.latitude,
    longitude: searchParams.longitude,
    bloodType: searchParams.bloodType || '',
    maxDistance: searchParams.maxDistance,
  });

  const isLoading = nearbyBanksQuery.isLoading || nearbyWithBloodTypeQuery.isLoading;
  const bloodType = searchParams.bloodType;

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        setLocationError(`Unable to retrieve your location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Initialize by getting the user's location
  useEffect(() => {
    getUserLocation();
  }, []);

  // Function to initiate search by location
  const searchByLocation = (bloodType?: string, maxDistance?: number) => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setSearchParams({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      bloodType,
      maxDistance,
    });
    
    setIsSearchingEnabled(true);
  };

  // Clear search results
  const clearLocationSearch = () => {
    setIsSearchingEnabled(false);
  };

  return {
    userLocation,
    isLocating,
    locationError,
    searchByLocation,
    isSearching: isSearchingEnabled && (
      bloodType ? nearbyWithBloodTypeQuery.isLoading : nearbyBanksQuery.isLoading
    ),
    clearLocationSearch,
  };
}

// Utility function to calculate distance between two coordinates
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}
