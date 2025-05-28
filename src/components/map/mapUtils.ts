import type { MapPoint } from './DisplayMap';

// Utility functions to convert different data types to MapPoint format

export interface BloodBankData {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  bloodTypes?: string[];
  [key: string]: any;
}

export interface DonorData {
  id: string | number;
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
  bloodType?: string;
  rhFactor?: string;
  available?: boolean;
  [key: string]: any;
}

export interface HospitalData {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  emergency?: boolean;
  [key: string]: any;
}

// Convert blood bank data to MapPoint
export const bloodBankToMapPoint = (bloodBank: BloodBankData): MapPoint => ({
  id: bloodBank.id,
  lat: bloodBank.latitude,
  lng: bloodBank.longitude,
  title: bloodBank.name,
  description: bloodBank.address || 'Blood donation center',
  type: 'bloodbank',
  data: bloodBank
});

// Convert donor data to MapPoint
export const donorToMapPoint = (donor: DonorData): MapPoint => {
  const fullName = `${donor.firstName} ${donor.lastName}`;
  const bloodInfo = donor.bloodType && donor.rhFactor 
    ? `${donor.bloodType}${donor.rhFactor}` 
    : 'Unknown blood type';
  
  return {
    id: donor.id,
    lat: donor.latitude,
    lng: donor.longitude,
    title: fullName,
    description: `Blood Type: ${bloodInfo}${donor.available ? ' • Available' : ''}`,
    type: 'donor',
    color: donor.available ? '#38a169' : '#718096', // Green if available, gray if not
    data: donor
  };
};

// Convert hospital data to MapPoint
export const hospitalToMapPoint = (hospital: HospitalData): MapPoint => ({
  id: hospital.id,
  lat: hospital.latitude,
  lng: hospital.longitude,
  title: hospital.name,
  description: hospital.address || 'Medical facility',
  type: 'hospital',
  color: hospital.emergency ? '#e53e3e' : '#3182ce', // Red for emergency, blue for regular
  data: hospital
});

// Convert database Donor to MapPoint (for actual donor records from DB)
export const dbDonorToMapPoint = (donor: {
  _id?: string;
  id?: string | number;
  firstName: string;
  lastName: string;
  bloodType?: string;
  RhFactor?: string;
  isEligible?: boolean;
  receiveDonationAlerts?: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  distance?: number;
  [key: string]: any;
}): MapPoint => {
  const fullName = `${donor.firstName} ${donor.lastName}`;
  const bloodInfo = donor.bloodType && donor.RhFactor 
    ? `${donor.bloodType}${donor.RhFactor}` 
    : 'Unknown blood type';
  
  // Extract coordinates from location or use fallback
  const lat = donor.location?.coordinates?.[1] || 0;
  const lng = donor.location?.coordinates?.[0] || 0;
  
  // Determine availability based on eligibility and alerts preference
  const available = donor.isEligible && donor.receiveDonationAlerts;
  
  return {
    id: donor._id || donor.id || '',
    lat,
    lng,
    title: fullName,
    description: `Blood Type: ${bloodInfo}${available ? ' • Available' : ''}${donor.distance ? ` • ${donor.distance.toFixed(1)}km away` : ''}`,
    type: 'donor',
    color: available ? '#38a169' : donor.isEligible ? '#d69e2e' : '#718096', // Green if available, orange if eligible, gray if not
    data: donor
  };
};

// Generic converter for any location data
export const genericLocationToMapPoint = (
  location: {
    id: string | number;
    name?: string;
    title?: string;
    latitude: number;
    longitude: number;
    description?: string;
    type?: string;
    [key: string]: any;
  }
): MapPoint => ({
  id: location.id,
  lat: location.latitude,
  lng: location.longitude,
  title: location.name || location.title || `Location ${location.id}`,
  description: location.description,
  type: (location.type as any) || 'default',
  data: location
});

// Convert array of mixed location data to MapPoints
export const convertToMapPoints = (
  data: (BloodBankData | DonorData | HospitalData)[],
  type: 'bloodbank' | 'donor' | 'hospital' | 'auto' = 'auto'
): MapPoint[] => {
  return data.map(item => {
    if (type === 'bloodbank') {
      return bloodBankToMapPoint(item as BloodBankData);
    } else if (type === 'donor') {
      return donorToMapPoint(item as DonorData);
    } else if (type === 'hospital') {
      return hospitalToMapPoint(item as HospitalData);
    } else {
      // Auto-detect type based on properties
      if ('firstName' in item && 'lastName' in item) {
        return donorToMapPoint(item as DonorData);
      } else if ('name' in item && 'bloodTypes' in item) {
        return bloodBankToMapPoint(item as BloodBankData);
      } else if ('name' in item && 'emergency' in item) {
        return hospitalToMapPoint(item as HospitalData);
      } else {
        return genericLocationToMapPoint(item);
      }
    }
  });
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Sort points by distance from a reference point
export const sortByDistance = (
  points: MapPoint[],
  referencePoint: { lat: number; lng: number }
): MapPoint[] => {
  return [...points].sort((a, b) => {
    const distanceA = calculateDistance(referencePoint.lat, referencePoint.lng, a.lat, a.lng);
    const distanceB = calculateDistance(referencePoint.lat, referencePoint.lng, b.lat, b.lng);
    return distanceA - distanceB;
  });
};

// Filter points within a certain radius (in kilometers)
export const filterByRadius = (
  points: MapPoint[],
  centerPoint: { lat: number; lng: number },
  radiusKm: number
): MapPoint[] => {
  return points.filter(point => {
    const distance = calculateDistance(centerPoint.lat, centerPoint.lng, point.lat, point.lng);
    return distance <= radiusKm;
  });
};

// Group points by type
export const groupPointsByType = (points: MapPoint[]): Record<string, MapPoint[]> => {
  return points.reduce((groups, point) => {
    const type = point.type || 'default';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(point);
    return groups;
  }, {} as Record<string, MapPoint[]>);
};
