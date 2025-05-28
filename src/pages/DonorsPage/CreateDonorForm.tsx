import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "primereact/dropdown";
import type { DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { useCreateDonor } from "../../state/donors";
import { useGlobalToast } from "../../components/layout/ToastContext";
import {
  InteractiveMap,
  type LatLng,
  type AddressDetails,
} from "../../components/map";
import type { CreateDonorPayload } from "./types";
import type { BloodType } from "./types";

import { BloodTypeEnum } from "./types";

const bloodTypeOptions: { label: string; value: BloodTypeEnum }[] = [
  { label: "A", value: BloodTypeEnum.A },
  { label: "B", value: BloodTypeEnum.B },
  { label: "AB", value: BloodTypeEnum.AB },
  { label: "O", value: BloodTypeEnum.O },
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

interface CreateDonorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateDonorForm: React.FC<CreateDonorFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const createDonorMutation = useCreateDonor();
  const toast = useGlobalToast();

  // Location state - using InteractiveMap types
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  // Basic information
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState<string>("");
  const [emergencyContactPhone, setEmergencyContactPhone] =
    useState<string>("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState<string>("");

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

  // Preferences
  const [receiveDonationAlerts, setReceiveDonationAlerts] =
    useState<boolean>(false);
  const [maxTravelDistance, setMaxTravelDistance] = useState<number | null>(
    null
  );
  const [preferredDonationCenter, setPreferredDonationCenter] =
    useState<string>("");
  const [availableDays, setAvailableDays] = useState<string>("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<string>("");

  // Handle location change from InteractiveMap
  const handleLocationChange = (location: LatLng) => {
    setCurrentLocation(location);
  };

  // Handle address change from reverse geocoding
  const handleAddressChange = (addressDetails: AddressDetails) => {
    if (addressDetails.address) setAddress(addressDetails.address);
    if (addressDetails.city) setCity(addressDetails.city);
    if (addressDetails.state) setState(addressDetails.state);
    if (addressDetails.postalCode) setPostalCode(addressDetails.postalCode);
    if (addressDetails.country) setCountry(addressDetails.country);
  };

  // Create address object for geocoding
  const addressForGeocoding = {
    address,
    city,
    state,
    postalCode,
    country,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !dateOfBirth ||
      !gender ||
      !currentLocation
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all required fields including location.",
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
      gender: gender as "Male" | "Female" | "Other",

      // Emergency contact (optional)
      emergencyContactName: emergencyContactName || undefined,
      emergencyContactPhone: emergencyContactPhone || undefined,
      emergencyContactRelationship: emergencyContactRelationship || undefined,

      // Address (optional)
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,

      // Blood information (optional for first-time donors)
      bloodType: bloodType || (undefined as any),
      RhFactor: rhFactor || (undefined as any),

      // Medical information (optional)
      medicalConditions: medicalConditions
        ? medicalConditions.split(",").map((item) => item.trim())
        : undefined,
      medications: medications
        ? medications.split(",").map((item) => item.trim())
        : undefined,
      allergies: allergies
        ? allergies.split(",").map((item) => item.trim())
        : undefined,

      // Donation history (optional)
      lastDonationDate: lastDonationDate?.toISOString(),

      // Location
      location: {
        type: "Point",
        coordinates: [currentLocation.lng, currentLocation.lat],
      },

      // Preferences (optional)
      receiveDonationAlerts,
      maxTravelDistance: maxTravelDistance || undefined,
      preferredDonationCenter: preferredDonationCenter || undefined,
      availableDays: availableDays
        ? availableDays.split(",").map((day) => day.trim())
        : undefined,
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
          detail:
            "Failed to create donor. Please check your information and try again.",
          life: 4000,
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <h3>Personal Information</h3>
      <div className="grid">
        <div className="col-12 md:col-6 field">
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

      <div className="grid">
        <div className="col-12 md:col-6 field">
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
      </div>

      <h3>Blood Information (Optional for first-time donors)</h3>
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
        <div className="col-12 md:col-4 field">
          <label htmlFor="emergencyContactName">Name</label>
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
            onChange={(e) =>
              setEmergencyContactPhone(e.target.value.replace(/\D/g, ""))
            }
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
      </div>

      <h3>Address Information & Location*</h3>
      <div className="field mb-3">
        {/* Interactive Map Component */}
        <InteractiveMap
          onLocationChange={handleLocationChange}
          initialMarkerPosition={currentLocation}
          enableReverseGeocoding={true}
          onAddressChange={handleAddressChange}
          addressForGeocoding={addressForGeocoding}
          locationHint="Click on the map to select a location, or enter your address below and click 'Find from Address'"
          height="400px"
          showHints={true}
          showLocationButton={true}
          showAddressButton={true}
          showResetButton={true}
          showCoordinatesDisplay={true}
        />
      </div>

      <div className="grid">
        <div className="col-12 field">
          <label htmlFor="address">Street Address</label>
          <InputText
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. New York"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="state">State/Province</label>
          <InputText
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
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
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g. 10001"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="country">Country</label>
          <InputText
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
          />
        </div>
      </div>

      <h3>Medical Information</h3>
      <div className="field">
        <label htmlFor="medicalConditions">
          Medical Conditions (comma-separated)
        </label>
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
        />
      </div>

      <h3>Preferences</h3>
      <div className="field mb-3">
        <Checkbox
          inputId="receiveDonationAlerts"
          checked={receiveDonationAlerts}
          onChange={(e) => setReceiveDonationAlerts(e.checked || false)}
        />
        <label htmlFor="receiveDonationAlerts" className="ml-2">
          Receive donation alerts and notifications
        </label>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 field">
          <label htmlFor="maxTravelDistance">Max Travel Distance (km)</label>
          <InputText
            id="maxTravelDistance"
            type="number"
            value={maxTravelDistance?.toString() || ""}
            onChange={(e) =>
              setMaxTravelDistance(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            placeholder="e.g. 50"
          />
        </div>
        <div className="col-12 md:col-6 field">
          <label htmlFor="preferredDonationCenter">
            Preferred Donation Center
          </label>
          <InputText
            id="preferredDonationCenter"
            value={preferredDonationCenter}
            onChange={(e) => setPreferredDonationCenter(e.target.value)}
            placeholder="e.g. City Hospital Blood Bank"
          />
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 field">
          <label htmlFor="availableDays">
            Available Days (comma-separated)
          </label>
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
            placeholder="e.g. Morning, Afternoon, Evening"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          type="submit"
          label="Create Donor"
          className="p-button-success"
          loading={createDonorMutation.isPending}
        />
        <Button
          type="button"
          label="Cancel"
          className="p-button-secondary"
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default CreateDonorForm;
