import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useCreateBloodBank } from "../../state/bloodBanks";
import {
  InteractiveMap,
  type LatLng,
  type AddressDetails,
} from "../../components/map";
import type { CreateBloodBankDto, GeoPoint } from "./types";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface CreateBloodBankFormProps {
  visible: boolean;
  onHide: () => void;
}

const CreateBloodBankForm: React.FC<CreateBloodBankFormProps> = ({
  visible,
  onHide,
}) => {
  const createMutation = useCreateBloodBank();
  const [formData, setFormData] = useState<Partial<CreateBloodBankDto>>({
    bloodTypesAvailable: [],
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location state for InteractiveMap
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(() => {
    // Initialize from formData if coordinates exist and are not default [0, 0]
    if (
      formData.location?.coordinates &&
      formData.location.coordinates[0] !== 0 &&
      formData.location.coordinates[1] !== 0
    ) {
      return {
        lng: formData.location.coordinates[0],
        lat: formData.location.coordinates[1],
      };
    }
    return null;
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
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
    setFormData((prev) => ({ ...prev, location: newLocation }));
  };

  // Handle address change from reverse geocoding
  const handleAddressChange = (addressDetails: AddressDetails) => {
    if (addressDetails.address) {
      setFormData((prev) => ({ ...prev, address: addressDetails.address }));
    }
    if (addressDetails.city) {
      setFormData((prev) => ({ ...prev, city: addressDetails.city }));
    }
    if (addressDetails.state) {
      setFormData((prev) => ({ ...prev, state: addressDetails.state }));
    }
    if (addressDetails.postalCode) {
      setFormData((prev) => ({ ...prev, postalCode: addressDetails.postalCode }));
    }
    if (addressDetails.country) {
      setFormData((prev) => ({ ...prev, country: addressDetails.country }));
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
    setFormData((prev) => {
      const currentTypes = prev.bloodTypesAvailable || [];
      const newTypes = currentTypes.includes(bloodType)
        ? currentTypes.filter((type) => type !== bloodType)
        : [...currentTypes, bloodType];
      return { ...prev, bloodTypesAvailable: newTypes };
    });
  };
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ["name", "address", "contactNumber", "email"];
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createMutation.mutateAsync(formData as CreateBloodBankDto);
      onHide();
    } catch (err) {
      setErrors({ form: "Failed to create blood bank. Please try again." });
    }
  };
  return (
    <Dialog
      header="Create New Blood Bank"
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: "80vw", maxWidth: "900px" }}
    >
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-3">Basic Information</h3>
          <div className="flex flex-wrap gap-3">
            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              {" "}
              <label>Name*</label>
              <InputText
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className={errors.name ? "invalid" : ""}
                placeholder="Enter blood bank name"
              />
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </div>

            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              {" "}
              <label>Email*</label>
              <InputText
                name="email"
                value={formData.email || ""}
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
            <div
              className="flex flex-column gap-2"
              style={{ flex: 2, minWidth: "320px" }}
            >
              {" "}
              <label>Address*</label>
              <InputText
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className={errors.address ? "invalid" : ""}
                placeholder="Enter street address"
              />
              {errors.address && (
                <small className="text-danger">{errors.address}</small>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                <div
                  className="flex flex-column gap-2"
                  style={{ flex: 1, minWidth: "150px" }}
                >
                  {" "}
                  <label>City</label>
                  <InputText
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                <div
                  className="flex flex-column gap-2"
                  style={{ flex: 1, minWidth: "150px" }}
                >
                  {" "}
                  <label>State</label>
                  <InputText
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    placeholder="Enter state/province"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <div
                  className="flex flex-column gap-2"
                  style={{ flex: 1, minWidth: "150px" }}
                >
                  {" "}
                  <label>Postal Code</label>
                  <InputText
                    name="postalCode"
                    value={formData.postalCode || ""}
                    onChange={handleInputChange}
                    placeholder="Enter postal/zip code"
                  />
                </div>
                <div
                  className="flex flex-column gap-2"
                  style={{ flex: 1, minWidth: "150px" }}
                >
                  {" "}
                  <label>Country</label>
                  <InputText
                    name="country"
                    value={formData.country || ""}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                  />
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
                locationHint="Click on the map to select the blood bank location, or enter the address above and click 'Find from Address'"
                height="400px"
                showHints={true}
                showLocationButton={true}
                showAddressButton={true}
                showResetButton={true}
                showCoordinatesDisplay={true}
              />
            </div>
          </div>
        </div>
        {/* Contact Information Section */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
          <div className="flex flex-wrap gap-3">
            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              {" "}
              <label>Contact Number*</label>
              <InputText
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleInputChange}
                className={errors.contactNumber ? "invalid" : ""}
                placeholder="Enter primary contact number"
              />
              {errors.contactNumber && (
                <small className="text-danger">{errors.contactNumber}</small>
              )}
            </div>
            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              {" "}
              <label>Alternate Contact Number</label>
              <InputText
                name="alternateContactNumber"
                value={formData.alternateContactNumber || ""}
                onChange={handleInputChange}
                placeholder="Enter alternate contact number"
              />
            </div>
          </div>
        </div>
        {/* Additional Information Section */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-3">Additional Information</h3>
          <div className="flex flex-wrap gap-3">
            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              <label>Website</label>
              <InputText
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
              />

              <label>Operating Hours</label>
              <InputText
                name="operatingHours"
                value={formData.operatingHours || ""}
                onChange={handleInputChange}
              />
            </div>
            <div
              className="flex flex-column gap-2"
              style={{ flex: 1, minWidth: "220px" }}
            >
              <label>License Number</label>
              <InputText
                name="licenseNumber"
                value={formData.licenseNumber || ""}
                onChange={handleInputChange}
              />

              <label>Established Date</label>
              <InputText
                name="establishedDate"
                value={formData.establishedDate || ""}
                onChange={handleInputChange}
                type="date"
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
                  checked={
                    formData.bloodTypesAvailable?.includes(type) || false
                  }
                  onChange={() => handleBloodTypeToggle(type)}
                />
                <label htmlFor={`type_${type}`} className="cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>{" "}
        {errors.form && <div className="text-danger mt-2">{errors.form}</div>}
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            type="button"
            label="Cancel"
            className="p-button-secondary"
            onClick={onHide}
          />
          <Button
            type="submit"
            label={
              createMutation.isPending ? "Creating..." : "Create Blood Bank"
            }
            disabled={createMutation.isPending}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default CreateBloodBankForm;
