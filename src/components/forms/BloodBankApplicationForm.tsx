import React from 'react';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { classNames } from "primereact/utils";

interface BloodBankData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactNumber: string;
  alternateContactNumber: string;
  website: string;
  operatingHours: string;
  bloodTypesAvailable: string[];
  licenseNumber: string;
  establishedDate: Date | null;
  location: { type: "Point", coordinates: [number, number] };
}

interface BloodBankApplicationFormProps {
  data: BloodBankData;
  onChange: (data: BloodBankData) => void;
  submitted: boolean;
}

const BloodBankApplicationForm: React.FC<BloodBankApplicationFormProps> = ({
  data,
  onChange,
  submitted
}) => {
  const bloodTypes = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" }
  ];

  const handleChange = (field: keyof BloodBankData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbName">Organization Name*</label>
          <InputText
            id="bbName"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.name })}
          />
          {submitted && !data.name && (
            <small className="p-error">Organization name is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbLicense">License Number*</label>
          <InputText
            id="bbLicense"
            value={data.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.licenseNumber })}
          />
          {submitted && !data.licenseNumber && (
            <small className="p-error">License number is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12">
        <div className="field">
          <label htmlFor="bbAddress">Address*</label>
          <InputTextarea
            id="bbAddress"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className={classNames({ "p-invalid": submitted && !data.address })}
          />
          {submitted && !data.address && (
            <small className="p-error">Address is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbCity">City*</label>
          <InputText
            id="bbCity"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.city })}
          />
          {submitted && !data.city && (
            <small className="p-error">City is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbState">State*</label>
          <InputText
            id="bbState"
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.state })}
          />
          {submitted && !data.state && (
            <small className="p-error">State is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbCountry">Country*</label>
          <InputText
            id="bbCountry"
            value={data.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.country })}
          />
          {submitted && !data.country && (
            <small className="p-error">Country is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbContact">Contact Number*</label>
          <InputText
            id="bbContact"
            value={data.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.contactNumber })}
          />
          {submitted && !data.contactNumber && (
            <small className="p-error">Contact number is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbWebsite">Website</label>
          <InputText
            id="bbWebsite"
            value={data.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>
      
      <div className="col-12">
        <div className="field">
          <label htmlFor="bbBloodTypes">Blood Types Available</label>
          <MultiSelect
            id="bbBloodTypes"
            value={data.bloodTypesAvailable}
            options={bloodTypes}
            onChange={(e) => handleChange('bloodTypesAvailable', e.value)}
            placeholder="Select available blood types"
            display="chip"
          />
        </div>
      </div>
    </div>
  );
};

export default BloodBankApplicationForm;
