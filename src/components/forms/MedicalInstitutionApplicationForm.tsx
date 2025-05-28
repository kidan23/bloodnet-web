import React from 'react';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";

interface MedicalInstitutionData {
  name: string;
  registrationNumber: string;
  type: string;
  phoneNumber: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactPersonName: string;
  contactPersonRole: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  operatingHours: string[];
  services: string[];
  coordinates: [number, number];
}

interface MedicalInstitutionApplicationFormProps {
  data: MedicalInstitutionData;
  onChange: (data: MedicalInstitutionData) => void;
  submitted: boolean;
}

const MedicalInstitutionApplicationForm: React.FC<MedicalInstitutionApplicationFormProps> = ({
  data,
  onChange,
  submitted
}) => {
  const institutionTypes = [
    { label: "Hospital", value: "Hospital" },
    { label: "Clinic", value: "Clinic" },
    { label: "Emergency Center", value: "Emergency Center" },
    { label: "Diagnostic Center", value: "Diagnostic Center" }
  ];

  const handleChange = (field: keyof MedicalInstitutionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miName">Institution Name*</label>
          <InputText
            id="miName"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.name })}
          />
          {submitted && !data.name && (
            <small className="p-error">Institution name is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miRegNumber">Registration Number*</label>
          <InputText
            id="miRegNumber"
            value={data.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.registrationNumber })}
          />
          {submitted && !data.registrationNumber && (
            <small className="p-error">Registration number is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miType">Institution Type*</label>
          <Dropdown
            id="miType"
            value={data.type}
            options={institutionTypes}
            onChange={(e) => handleChange('type', e.value)}
            placeholder="Select institution type"
            className={classNames({ "p-invalid": submitted && !data.type })}
          />
          {submitted && !data.type && (
            <small className="p-error">Institution type is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miPhone">Phone Number*</label>
          <InputText
            id="miPhone"
            value={data.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.phoneNumber })}
          />
          {submitted && !data.phoneNumber && (
            <small className="p-error">Phone number is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12">
        <div className="field">
          <label htmlFor="miAddress">Address*</label>
          <InputTextarea
            id="miAddress"
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
          <label htmlFor="miCity">City*</label>
          <InputText
            id="miCity"
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
          <label htmlFor="miState">State*</label>
          <InputText
            id="miState"
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
          <label htmlFor="miCountry">Country*</label>
          <InputText
            id="miCountry"
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
          <label htmlFor="miWebsite">Website</label>
          <InputText
            id="miWebsite"
            value={data.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miContactPersonName">Contact Person Name</label>
          <InputText
            id="miContactPersonName"
            value={data.contactPersonName}
            onChange={(e) => handleChange('contactPersonName', e.target.value)}
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miContactPersonRole">Contact Person Role</label>
          <InputText
            id="miContactPersonRole"
            value={data.contactPersonRole}
            onChange={(e) => handleChange('contactPersonRole', e.target.value)}
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miContactPersonPhone">Contact Person Phone</label>
          <InputText
            id="miContactPersonPhone"
            value={data.contactPersonPhone}
            onChange={(e) => handleChange('contactPersonPhone', e.target.value)}
          />
        </div>
      </div>
      
      <div className="col-12">
        <div className="field">
          <label htmlFor="miContactPersonEmail">Contact Person Email</label>
          <InputText
            id="miContactPersonEmail"
            value={data.contactPersonEmail}
            onChange={(e) => handleChange('contactPersonEmail', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalInstitutionApplicationForm;
