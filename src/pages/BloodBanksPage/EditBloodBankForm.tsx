import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBloodBank, useUpdateBloodBank } from '../../state/bloodBanks';
import type { UpdateBloodBankDto, GeoPoint } from './types';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { extractErrorForToast } from "../../utils/errorHandling";
import {
  InteractiveMap,
  type LatLng,
  type AddressDetails,
} from "../../components/map";

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EditBloodBankForm: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: bloodBank, 
    isLoading,
    isError,
    error 
  } = useBloodBank(id);
  
  const updateMutation = useUpdateBloodBank();
    const [formData, setFormData] = useState<UpdateBloodBankDto>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    if (bloodBank) {
      setFormData({
        name: bloodBank.name,
        address: bloodBank.address,
        location: bloodBank.location,
        city: bloodBank.city,
        state: bloodBank.state,
        postalCode: bloodBank.postalCode,
        country: bloodBank.country,
        contactNumber: bloodBank.contactNumber,
        alternateContactNumber: bloodBank.alternateContactNumber,
        email: bloodBank.email,
        website: bloodBank.website,
        operatingHours: bloodBank.operatingHours,
        bloodTypesAvailable: bloodBank.bloodTypesAvailable,
        licenseNumber: bloodBank.licenseNumber,
        establishedDate: bloodBank.establishedDate,
      });
      
      // Set initial location for map
      if (bloodBank.location && bloodBank.location.coordinates) {
        setCurrentLocation({
          lat: bloodBank.location.coordinates[1],
          lng: bloodBank.location.coordinates[0]
        });
      }
    }
  }, [bloodBank]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle location change from InteractiveMap
  const handleLocationChange = (location: LatLng) => {
    setCurrentLocation(location);
    const newLocation = { ...formData.location } as GeoPoint;
    newLocation.coordinates = [location.lng, location.lat];
    setFormData(prev => ({ ...prev, location: newLocation }));
  };

  // Handle address change from reverse geocoding
  const handleAddressChange = (addressDetails: AddressDetails) => {
    if (addressDetails.address) {
      setFormData(prev => ({ ...prev, address: addressDetails.address }));
    }
    if (addressDetails.city) {
      setFormData(prev => ({ ...prev, city: addressDetails.city }));
    }
    if (addressDetails.state) {
      setFormData(prev => ({ ...prev, state: addressDetails.state }));
    }
    if (addressDetails.postalCode) {
      setFormData(prev => ({ ...prev, postalCode: addressDetails.postalCode }));
    }
    if (addressDetails.country) {
      setFormData(prev => ({ ...prev, country: addressDetails.country }));
    }
  };

  // Create address object for geocoding
  const addressForGeocoding = {
    address: formData.address,
    city: formData.city,
    state: formData.state,
    postalCode: formData.postalCode,
    country: formData.country,
  };
  const handleBloodTypeToggle = (bloodType: string) => {
    setFormData(prev => {
      const currentTypes = prev.bloodTypesAvailable || [];
      const newTypes = currentTypes.includes(bloodType)
        ? currentTypes.filter(type => type !== bloodType)
        : [...currentTypes, bloodType];
      
      return { ...prev, bloodTypesAvailable: newTypes };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = [
      'name', 'address', 'contactNumber', 'email'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Website validation if provided
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
      try {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate(`/blood-banks/${id}`, { 
        state: { message: 'Blood bank updated successfully' }
      });
    } catch (err) {
      console.error('Failed to update blood bank:', err);
      const { summary, detail } = extractErrorForToast(err);
      setErrors({ form: `${summary}: ${detail}` });
    }
  };

  if (isLoading) {
    return <div className="flex justify-content-center align-items-center" style={{ minHeight: 120 }}>Loading blood bank data...</div>;
  }

  if (isError || !bloodBank) {
    return (
      <div className="text-danger">
        Error loading blood bank: {(error as Error)?.message || 'Blood bank not found'}
        <div className="mt-3">
          <Link to="/blood-banks" className="text-primary underline-hover">
            Back to Blood Banks
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-column gap-4" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="mb-3">
        <Link to={`/blood-banks/${id}`} className="text-primary underline-hover">
          &larr; Back to Blood Bank Details
        </Link>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Basic Information</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>Name*</label>
                <InputText
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={errors.name ? "invalid" : ""}
                  placeholder="Enter blood bank name"
                />
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>

              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>Email*</label>
                <InputText
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={errors.email ? "invalid" : ""}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Address</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-column gap-2" style={{ flex: 2, minWidth: "320px" }}>
                <label>Address*</label>
                <InputText
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className={errors.address ? "invalid" : ""}
                  placeholder="Enter street address"
                />
                {errors.address && (
                  <small className="text-danger">{errors.address}</small>
                )}
                
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "150px" }}>
                    <label>City</label>
                    <InputText
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "150px" }}>
                    <label>State</label>
                    <InputText
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      placeholder="Enter state/province"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "150px" }}>
                    <label>Postal Code</label>
                    <InputText
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleInputChange}
                      placeholder="Enter postal/zip code"
                    />
                  </div>
                  <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "150px" }}>
                    <label>Country</label>
                    <InputText
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>              </div>
            </div>
          </div>

          {/* Location Section with Interactive Map */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Location</h3>
            <div className="field mb-3">
              {/* Interactive Map Component */}
              <InteractiveMap
                onLocationChange={handleLocationChange}
                initialMarkerPosition={currentLocation}
                enableReverseGeocoding={true}
                onAddressChange={handleAddressChange}
                addressForGeocoding={addressForGeocoding}
                locationHint="Click on the map to update the blood bank location, or modify the address above and click 'Find from Address'"
                height="400px"
                showHints={true}
                showLocationButton={true}
                showAddressButton={true}
                showResetButton={true}
                showCoordinatesDisplay={true}
              />
            </div>
          </div>          {/* Contact Information Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>Contact Number*</label>
                <InputText
                  name="contactNumber"
                  value={formData.contactNumber || ''}
                  onChange={handleInputChange}
                  className={errors.contactNumber ? "invalid" : ""}
                  placeholder="Enter primary contact number"
                />
                {errors.contactNumber && (
                  <small className="text-danger">{errors.contactNumber}</small>
                )}
              </div>
              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>Alternate Contact Number</label>
                <InputText
                  name="alternateContactNumber"
                  value={formData.alternateContactNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Enter alternate contact number"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Additional Information</h3>
            <div className="flex flex-wrap gap-3">              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>Website</label>
                <InputText
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                />
                
                <label>Operating Hours</label>
                <InputText
                  name="operatingHours"
                  value={formData.operatingHours || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri: 9am-5pm"
                />
              </div>
              <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: "220px" }}>
                <label>License Number</label>
                <InputText
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Enter license number"
                />
                
                <label>Established Date</label>
                <InputText
                  name="establishedDate"
                  value={formData.establishedDate || ''}
                  onChange={handleInputChange}
                  type="date"
                  placeholder="Select established date"
                />
              </div>
            </div>
          </div>

          {/* Blood Types Section */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-3">Blood Types Available</h3>
            <div className="grid grid-cols-4 gap-2" style={{ maxWidth: "600px" }}>
              {BLOOD_TYPES.map((type) => (
                <div key={type} className="flex align-items-center gap-2">
                  <Checkbox
                    inputId={`type_${type}`}
                    checked={formData.bloodTypesAvailable?.includes(type) || false}
                    onChange={() => handleBloodTypeToggle(type)}
                  />
                  <label htmlFor={`type_${type}`} className="cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {errors.form && <div className="text-danger mt-2">{errors.form}</div>}
          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              type="button"
              label="Cancel"
              className="p-button-secondary"
              onClick={() => navigate(`/blood-banks/${id}`)}
            />
            <Button
              type="submit"
              label={updateMutation.isPending ? 'Updating...' : 'Update Blood Bank'}
              disabled={updateMutation.isPending}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBloodBankForm;
