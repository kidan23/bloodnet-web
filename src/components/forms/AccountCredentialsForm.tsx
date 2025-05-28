import React from 'react';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { UserRole } from "../../state/auth";

interface AccountCredentialsData {
  organizationType: UserRole | null;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AccountCredentialsFormProps {
  data: AccountCredentialsData;
  onChange: (data: AccountCredentialsData) => void;
  submitted: boolean;
}

const AccountCredentialsForm: React.FC<AccountCredentialsFormProps> = ({
  data,
  onChange,
  submitted
}) => {
  const organizationTypes = [
    { label: "Blood Bank", value: UserRole.BLOOD_BANK },
    { label: "Medical Institution", value: UserRole.MEDICAL_INSTITUTION }
  ];

  const handleChange = (field: keyof AccountCredentialsData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid">
      <div className="col-12">
        <h3>Account Information</h3>
        <div className="p-divider" />
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="orgType">Organization Type*</label>
          <Dropdown
            id="orgType"
            value={data.organizationType}
            options={organizationTypes}
            onChange={(e) => handleChange('organizationType', e.value)}
            placeholder="Select organization type"
            className={classNames({ "p-invalid": submitted && !data.organizationType })}
          />
          {submitted && !data.organizationType && (
            <small className="p-error">Organization type is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="email">Email*</label>
          <InputText
            id="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={classNames({ "p-invalid": submitted && !data.email })}
          />
          {submitted && !data.email && (
            <small className="p-error">Email is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="password">Password*</label>
          <Password
            id="password"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            toggleMask
            className={classNames({ "p-invalid": submitted && !data.password })}
          />
          {submitted && !data.password && (
            <small className="p-error">Password is required.</small>
          )}
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password*</label>
          <Password
            id="confirmPassword"
            value={data.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            toggleMask
            className={classNames({ 
              "p-invalid": submitted && (!data.confirmPassword || data.password !== data.confirmPassword)
            })}
          />
          {submitted && !data.confirmPassword && (
            <small className="p-error">Please confirm your password.</small>
          )}
          {submitted && data.confirmPassword && data.password !== data.confirmPassword && (
            <small className="p-error">Passwords do not match.</small>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCredentialsForm;
