import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "primereact/dropdown";
import type { DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCreateDonor } from "../../state/donors";
import { useGlobalToast } from "../../components/layout/ToastContext";
import type { CreateDonorPayload } from "./types";
import type { BloodType } from "./types";

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Replace the default marker with a custom SVG marker
const customMarkerIcon = new L.DivIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path fill="#d32f2f" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const bloodTypeOptions: { label: string; value: BloodType }[] = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "AB", value: "AB" },
  { label: "O", value: "O" },
];

const rhFactorOptions: { label: string; value: "+" | "-" }[] = [
  { label: "+", value: "+" },
  { label: "-", value: "-" },
];

const genderOptions: { label: string; value: string }[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

// Leaflet map constants
const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194
};

const defaultZoom = 13;

// Map click handler component
function MapClickHandler({ setMarkerPosition, setLatitude, setLongitude, toast, preferredDonationCenter, setPreferredDonationCenter, setAddress, setCity, setState, setPostalCode, setCountry }: any) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const newPosition = { lat, lng };
      setMarkerPosition(newPosition);
      setLatitude(lat);
      setLongitude(lng);
      
      // Perform reverse geocoding using OpenStreetMap Nominatim
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.address) {
          const { road, house_number, city, town, state, postcode, country, village } = data.address;
          
          // Construct street address
          let street = '';
          if (house_number) street += house_number + ' ';
          if (road) street += road;
          
          // Set city (may be called town or village in some areas)
          const cityValue = city || town || village || '';
          
          // Update address fields
          setAddress(street);
          setCity(cityValue);
          setState(state || '');
          setPostalCode(postcode || '');
          setCountry(country || '');
          
          // If this is a point of interest, use it for preferred donation center
          if (!preferredDonationCenter && data.name) {
            setPreferredDonationCenter(data.name);
          }
          
          toast.current?.show({
            severity: "info",
            summary: "Address Updated",
            detail: "Address fields updated from map location",
            life: 2000,
          });
        }
      } catch (error) {
        console.error('Error with reverse geocoding:', error);
        toast.current?.show({
          severity: "error",
          summary: "Geocoding Error",
          detail: "Could not retrieve address information",
          life: 3000,
        });
      }
    }
  });
  
  return null;
}

// Component to recenter map when mapCenter changes
function SetMapCenter({ mapCenter }: { mapCenter: { lat: number; lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([mapCenter.lat, mapCenter.lng], defaultZoom);
  }, [map, mapCenter]);
  
  return null;
}

interface CreateDonorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateDonorForm: React.FC<CreateDonorFormProps> = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const createDonorMutation = useCreateDonor();
  const toast = useGlobalToast();
  const mapRef = useRef<L.Map | null>(null);
  
  // Map state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);

  // Basic information
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState<string>("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState<string>("");

  // Address information
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  // Blood information
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [rhFactor, setRhFactor] = useState<"+" | "-" | null>(null);

  // Medical information
  const [medicalConditions, setMedicalConditions] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");

  // Donation information
  const [lastDonationDate, setLastDonationDate] = useState<Date | null>(null);

  // Location
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Preferences
  const [receiveDonationAlerts, setReceiveDonationAlerts] = useState<boolean>(false);
  const [maxTravelDistance, setMaxTravelDistance] = useState<number | null>(null);
  const [preferredDonationCenter, setPreferredDonationCenter] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string>("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<string>("");  const handleGetLocation = () => {
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
          lng: position.coords.longitude
        };
        setLatitude(newPosition.lat);
        setLongitude(newPosition.lng);
        setMarkerPosition(newPosition);
        setMapCenter(newPosition);
        
        // Try to get address details from coordinates
        fetchAddressFromCoordinates(newPosition.lat, newPosition.lng);
        
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
  };
  
  // Function to get address from coordinates using OpenStreetMap Nominatim
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const { road, house_number, city, town, state, postcode, country, village } = data.address;
        
        // Construct street address
        let street = '';
        if (house_number) street += house_number + ' ';
        if (road) street += road;
        
        // Set city (may be called town or village in some areas)
        const cityValue = city || town || village || '';
        
        // Update address fields
        setAddress(street);
        setCity(cityValue);
        setState(state || '');
        setPostalCode(postcode || '');
        setCountry(country || '');
        
        // If this is a point of interest, use it for preferred donation center
        if (!preferredDonationCenter && data.name) {
          setPreferredDonationCenter(data.name);
        }
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
    }
  };
  
  // Function to get coordinates from address using OpenStreetMap Nominatim
  const fetchCoordinatesFromAddress = async () => {
    if (!address || !city) {
      toast.current?.show({
        severity: "warn",
        summary: "Address Required",
        detail: "Please enter at least street address and city",
        life: 3000,
      });
      return;
    }
    
    setGeoLoading(true);
    const addressString = `${address}, ${city}${state ? ', ' + state : ''}${postalCode ? ' ' + postalCode : ''}${country ? ', ' + country : ''}`;
    
    try {
      // URL encode the address string
      const encodedAddress = encodeURIComponent(addressString);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      const data = await response.json();
      
      setGeoLoading(false);
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = {
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        };
        
        setLatitude(newPosition.lat);
        setLongitude(newPosition.lng);
        setMarkerPosition(newPosition);
        setMapCenter(newPosition);
        
        if (mapRef.current) {
          mapRef.current.setView([newPosition.lat, newPosition.lng], defaultZoom);
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
      }
    } catch (error) {
      setGeoLoading(false);
      console.error('Error with geocoding:', error);
      toast.current?.show({
        severity: "error",
        summary: "Geocoding Error",
        detail: "Error processing your request",
        life: 3000,
      });
    }
  };  // Update address fields with a helper function
  const handleAddressChange = (field: string, value: string) => {
    switch(field) {
      case 'address':
        setAddress(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'state':
        setState(value);
        break;
      case 'postalCode':
        setPostalCode(value);
        break;
      case 'country':
        setCountry(value);
        break;
    }
  };
  
  // Debounce address changes to avoid too many API calls
  const [geocodeTimeout, setGeocodeTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!address || !city) return;
    
    // Clear previous timeout if it exists
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }
    
    // Set a new timeout to delay geocoding by 1.5 seconds after user stops typing
    const timeout = setTimeout(() => {
      fetchCoordinatesFromAddress();
    }, 1500); // 1.5 seconds delay
    
    setGeocodeTimeout(timeout);
    
    // Cleanup function
    return () => {
      if (geocodeTimeout) {
        clearTimeout(geocodeTimeout);
      }
    };
  }, [address, city, state, postalCode, country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !dateOfBirth ||
      !gender ||
      longitude === null ||
      latitude === null
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all required fields.",
        life: 3000,
      });
      return;
    }

    // Prepare the donor payload
    const donorPayload: CreateDonorPayload = {
      firstName,
      lastName,
      phoneNumber,
      email: email || undefined,
      dateOfBirth: dateOfBirth?.toISOString() || "",
      gender: (gender as 'Male' | 'Female' | 'Other'),
      
      // Emergency contact (optional)
      emergencyContactName: emergencyContactName || undefined,
      emergencyContactPhone: emergencyContactPhone || undefined,
      emergencyContactRelationship: emergencyContactRelationship || undefined,
      
      // Address (optional)
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,      country: country || undefined,
      
      // Blood information (optional for first-time donors)
      bloodType: bloodType || undefined as any,
      RhFactor: rhFactor || undefined as any,
      
      // Medical information (optional)
      medicalConditions: medicalConditions ? medicalConditions.split(',').map(item => item.trim()) : undefined,
      medications: medications ? medications.split(',').map(item => item.trim()) : undefined,
      allergies: allergies ? allergies.split(',').map(item => item.trim()) : undefined,

      // Donation history (optional)
      lastDonationDate: lastDonationDate?.toISOString(),

      // Location
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },

      // Preferences (optional)
      receiveDonationAlerts,
      maxTravelDistance: maxTravelDistance || undefined,
      preferredDonationCenter: preferredDonationCenter || undefined,
      availableDays: availableDays ? availableDays.split(',').map(day => day.trim()) : undefined,
      preferredTimeOfDay: preferredTimeOfDay || undefined,
    };

    createDonorMutation.mutate(donorPayload as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["donors"] });
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Donor created successfully",
          life: 3000,
        });
        onSuccess();
      },
      onError: (error) => {
        console.error("Error creating donor:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to create donor. Please check your information and try again.",
          life: 4000,
        });
      },
    });  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <h3>Personal Information</h3>
      <div className="grid">        <div className="col-12 md:col-6 field">
          <label htmlFor="firstName">First Name*</label>
          <InputText
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="lastName">Last Name*</label>
          <InputText
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="grid">        <div className="col-12 md:col-6 field">
          <label htmlFor="phoneNumber">Phone Number*</label>
          <InputText
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            maxLength={15}
            placeholder="e.g. 1234567890"
            required
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@example.com"
          />
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 field">
          <label htmlFor="dateOfBirth">Date of Birth*</label>
          <Calendar
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.value as Date | null)}
            showIcon
            dateFormat="yy-mm-dd"
            maxDate={new Date()}
            required
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="gender">Gender*</label>
          <Dropdown
            id="gender"
            value={gender}
            options={genderOptions}
            onChange={(e: DropdownChangeEvent) => setGender(e.value)}
            placeholder="Select Gender"
            required
          />
        </div>
      </div>      <h3>Blood Information (Optional for first-time donors)</h3>
      <div className="grid">
        <div className="col-12 md:col-6 field">
          <label htmlFor="bloodType">Blood Type</label>
          <Dropdown
            id="bloodType"
            value={bloodType}
            options={bloodTypeOptions}
            onChange={(e: DropdownChangeEvent) => setBloodType(e.value)}
            placeholder="Select Blood Type (if known)"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="rhFactor">Rh Factor</label>
          <Dropdown
            id="rhFactor"
            value={rhFactor}
            options={rhFactorOptions}
            onChange={(e: DropdownChangeEvent) => setRhFactor(e.value)}
            placeholder="Select Rh Factor (if known)"
          />
        </div>
      </div>

      <h3>Emergency Contact</h3>
      <div className="grid">
        <div className="col-12 md:col-4 field">          <label htmlFor="emergencyContactName">Name</label>
          <InputText
            id="emergencyContactName"
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
            placeholder="Full name of emergency contact"
          />
        </div>
        <div className="col-12 md:col-4 field">
          <label htmlFor="emergencyContactPhone">Phone</label>
          <InputText
            id="emergencyContactPhone"
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={15}
            placeholder="e.g. 1234567890"
          />
        </div>
        <div className="col-12 md:col-4 field">
          <label htmlFor="emergencyContactRelationship">Relationship</label>
          <InputText
            id="emergencyContactRelationship"
            value={emergencyContactRelationship}
            onChange={(e) => setEmergencyContactRelationship(e.target.value)}
            placeholder="e.g. Spouse, Parent, Sibling"
          />
        </div>
      </div>      <h3>Address Information & Location*</h3>
      <div className="field mb-3">
        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            label={geoLoading ? "Getting Location..." : "Use My Current Location"}
            icon="pi pi-map-marker"
            onClick={handleGetLocation}
            disabled={geoLoading}
          />
            <Button
            type="button"
            label="Find from Address"
            icon="pi pi-search"
            onClick={fetchCoordinatesFromAddress}
            disabled={geoLoading}
          />
          
          {markerPosition && (
            <Button
              type="button"
              label="Reset Location"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-danger"
              onClick={() => {
                setLatitude(null);
                setLongitude(null);
                setMarkerPosition(null);
                setMapCenter(defaultCenter);
                toast.current?.show({
                  severity: "info",
                  summary: "Location Reset",
                  detail: "Location has been reset",
                  life: 2000,
                });
              }}
            />
          )}
        </div>
          {latitude !== null && longitude !== null && (
          <div className="mt-2 mb-3">
            <span className="mr-3">Latitude: <b>{latitude.toFixed(6)}</b></span>
            <span>Longitude: <b>{longitude.toFixed(6)}</b></span>
          </div>
        )}
          {/* OpenStreetMap component */}
        <div className="mt-3 mb-3">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={defaultZoom}
            style={containerStyle}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Center map when mapCenter changes */}
            <SetMapCenter mapCenter={mapCenter} />
            
            {/* Map click handler */}
            <MapClickHandler 
              setMarkerPosition={setMarkerPosition}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              toast={toast}
              preferredDonationCenter={preferredDonationCenter}
              setPreferredDonationCenter={setPreferredDonationCenter}
              setAddress={setAddress}
              setCity={setCity}
              setState={setState}
              setPostalCode={setPostalCode}
              setCountry={setCountry}
            />
            
            {markerPosition && (
              <Marker 
                position={[markerPosition.lat, markerPosition.lng]}
                draggable={true}
                icon={customMarkerIcon}
                eventHandlers={{
                  dragend: async (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    const newPosition = {
                      lat: position.lat,
                      lng: position.lng
                    };
                    setLatitude(newPosition.lat);
                    setLongitude(newPosition.lng);
                    setMarkerPosition(newPosition);
                    
                    // Perform reverse geocoding
                    await fetchAddressFromCoordinates(newPosition.lat, newPosition.lng);
                  }
                }}
              >
                <Popup>
                  Selected location
                </Popup>
              </Marker>
            )}
          </MapContainer>
          <div className="mt-2 text-sm text-gray-600">
            <p>Click on the map to select a location, or enter your address below and click "Find from Address"</p>
            <p className="mt-1">You can drag the marker to adjust the location precisely</p>
            <p className="mt-1">A valid location is required for donor registration</p>
          </div>
        </div>
      </div>      <div className="grid">
        <div className="col-12 field">
          <label htmlFor="address">Street Address</label>
          <InputText
            id="address"
            value={address}
            onChange={(e) => handleAddressChange('address', e.target.value)}
            placeholder="e.g. 123 Main Street, Apt 4B"
          />
        </div>
      </div>
      <div className="grid">        
        <div className="col-12 md:col-6 field">
          <label htmlFor="city">City</label>
          <InputText
            id="city"
            value={city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="e.g. New York"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="state">State/Province</label>
          <InputText
            id="state"
            value={state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            placeholder="e.g. NY"
          />
        </div>
      </div>
      <div className="grid">        
        <div className="col-12 md:col-6 field">
          <label htmlFor="postalCode">Postal Code</label>
          <InputText
            id="postalCode"
            value={postalCode}
            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            placeholder="e.g. 10001"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="country">Country</label>
          <InputText
            id="country"
            value={country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            placeholder="e.g. United States"
          />
        </div>
      </div>

      <h3>Medical Information</h3>
      <div className="field">
        <label htmlFor="medicalConditions">Medical Conditions (comma-separated)</label>
        <InputText
          id="medicalConditions"
          value={medicalConditions}
          onChange={(e) => setMedicalConditions(e.target.value)}
          placeholder="e.g. Diabetes, Hypertension"
        />
      </div>
      <div className="field">
        <label htmlFor="medications">Medications (comma-separated)</label>
        <InputText
          id="medications"
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          placeholder="e.g. Insulin, Metformin"
        />
      </div>
      <div className="field">
        <label htmlFor="allergies">Allergies (comma-separated)</label>
        <InputText
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. Penicillin, Peanuts"
        />
      </div>

      <h3>Donation History</h3>
      <div className="field">
        <label htmlFor="lastDonationDate">Last Donation Date</label>
        <Calendar
          id="lastDonationDate"
          value={lastDonationDate}
          onChange={(e) => setLastDonationDate(e.value as Date | null)}
          dateFormat="yy-mm-dd"
          showIcon
          maxDate={new Date()}
        />      </div>

      <h3>Preferences</h3>
      <div className="field mb-3">
        <div className="flex align-items-center">
          <Checkbox
            inputId="receiveDonationAlerts"
            checked={receiveDonationAlerts}
            onChange={(e) => setReceiveDonationAlerts(e.checked || false)}
          />
          <label htmlFor="receiveDonationAlerts" className="ml-2">Receive Donation Alerts</label>
        </div>
      </div>
      
      <div className="grid">        <div className="col-12 md:col-6 field">
          <label htmlFor="maxTravelDistance">Max Travel Distance (km)</label>
          <InputText
            id="maxTravelDistance"
            type="number"
            min="1"
            max="500"
            value={maxTravelDistance?.toString() || ""}
            onChange={(e) => setMaxTravelDistance(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g. 25"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="preferredDonationCenter">Preferred Donation Center</label>
          <InputText
            id="preferredDonationCenter"
            value={preferredDonationCenter}
            onChange={(e) => setPreferredDonationCenter(e.target.value)}
            placeholder="e.g. City Blood Bank"
          />
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6 field">
          <label htmlFor="availableDays">Available Days (comma-separated)</label>
          <InputText
            id="availableDays"
            value={availableDays}
            onChange={(e) => setAvailableDays(e.target.value)}
            placeholder="e.g. Monday, Wednesday, Friday"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="preferredTimeOfDay">Preferred Time of Day</label>
          <InputText
            id="preferredTimeOfDay"
            value={preferredTimeOfDay}
            onChange={(e) => setPreferredTimeOfDay(e.target.value)}
            placeholder="e.g. Morning, Afternoon"
          />
        </div>
      </div>

      <div className="flex justify-content-end mt-4 gap-2">
        <Button type="button" label="Cancel" className="p-button-secondary" onClick={onCancel} />
        <Button
          type="submit"
          label="Create Donor"
          icon="pi pi-plus"
          loading={createDonorMutation.isPending}
          disabled={createDonorMutation.isPending}
        />
      </div>
    </form>
  );
};

export default CreateDonorForm;
