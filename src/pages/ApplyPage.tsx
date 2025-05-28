import { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputNumber";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useNavigate } from "react-router-dom";
import { useApply } from "../state/auth";
import { UserRole } from "../state/auth";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const ApplyPage: React.FC = () => {
  const [organizationType, setOrganizationType] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const applyMutation = useApply();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // Blood Bank specific fields
  const [bloodBankData, setBloodBankData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    contactNumber: "",
    alternateContactNumber: "",
    website: "",
    operatingHours: "",
    bloodTypesAvailable: [],
    licenseNumber: "",
    establishedDate: null as Date | null,
    location: { type: "Point", coordinates: [0, 0] }
  });

  // Medical Institution specific fields
  const [medicalInstitutionData, setMedicalInstitutionData] = useState({
    name: "",
    registrationNumber: "",
    type: "",
    phoneNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    contactPersonName: "",
    contactPersonRole: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    operatingHours: [],
    services: [],
    coordinates: [0, 0] as [number, number]
  });

  const organizationTypes = [
    { label: "Blood Bank", value: UserRole.BLOOD_BANK },
    { label: "Medical Institution", value: UserRole.MEDICAL_INSTITUTION }
  ];

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

  const institutionTypes = [
    { label: "Hospital", value: "Hospital" },
    { label: "Clinic", value: "Clinic" },
    { label: "Emergency Center", value: "Emergency Center" },
    { label: "Diagnostic Center", value: "Diagnostic Center" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApplicationError(null);
    
    if (email && password && confirmPassword && organizationType) {
      if (password !== confirmPassword) {
        setApplicationError("Passwords do not match");
        return;
      }
      
      let profileData;
      if (organizationType === UserRole.BLOOD_BANK) {
        profileData = {
          ...bloodBankData,
          establishedDate: bloodBankData.establishedDate?.toISOString()
        };
      } else {
        profileData = medicalInstitutionData;
      }
      
      try {
        await applyMutation.mutateAsync({
          email,
          password,
          role: organizationType,
          profileData
        });
        
        toast.current?.show({
          severity: 'success',
          summary: 'Application Submitted',
          detail: 'Your application has been submitted successfully. You will receive an email once it is reviewed.',
          life: 5000
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err: any) {
        setApplicationError(err?.response?.data?.message || "Application submission failed");
      }
    }
  };

  const renderBloodBankForm = () => (
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbName">Organization Name*</label>
          <InputText
            id="bbName"
            value={bloodBankData.name}
            onChange={(e) => setBloodBankData({...bloodBankData, name: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.name })}
          />
          {submitted && !bloodBankData.name && (
            <small className="p-error">Organization name is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbLicense">License Number*</label>
          <InputText
            id="bbLicense"
            value={bloodBankData.licenseNumber}
            onChange={(e) => setBloodBankData({...bloodBankData, licenseNumber: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.licenseNumber })}
          />
          {submitted && !bloodBankData.licenseNumber && (
            <small className="p-error">License number is required.</small>
          )}
        </div>
      </div>
      <div className="col-12">
        <div className="field">
          <label htmlFor="bbAddress">Address*</label>
          <InputTextarea
            id="bbAddress"
            value={bloodBankData.address}
            onChange={(e) => setBloodBankData({...bloodBankData, address: e.target.value})}
            rows={3}
            className={classNames({ "p-invalid": submitted && !bloodBankData.address })}
          />
          {submitted && !bloodBankData.address && (
            <small className="p-error">Address is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbCity">City*</label>
          <InputText
            id="bbCity"
            value={bloodBankData.city}
            onChange={(e) => setBloodBankData({...bloodBankData, city: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.city })}
          />
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbState">State*</label>
          <InputText
            id="bbState"
            value={bloodBankData.state}
            onChange={(e) => setBloodBankData({...bloodBankData, state: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.state })}
          />
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="bbCountry">Country*</label>
          <InputText
            id="bbCountry"
            value={bloodBankData.country}
            onChange={(e) => setBloodBankData({...bloodBankData, country: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.country })}
          />
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbContact">Contact Number*</label>
          <InputText
            id="bbContact"
            value={bloodBankData.contactNumber}
            onChange={(e) => setBloodBankData({...bloodBankData, contactNumber: e.target.value})}
            className={classNames({ "p-invalid": submitted && !bloodBankData.contactNumber })}
          />
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="bbWebsite">Website</label>
          <InputText
            id="bbWebsite"
            value={bloodBankData.website}
            onChange={(e) => setBloodBankData({...bloodBankData, website: e.target.value})}
          />
        </div>
      </div>
      <div className="col-12">
        <div className="field">
          <label htmlFor="bbBloodTypes">Blood Types Available</label>
          <MultiSelect
            id="bbBloodTypes"
            value={bloodBankData.bloodTypesAvailable}
            options={bloodTypes}
            onChange={(e) => setBloodBankData({...bloodBankData, bloodTypesAvailable: e.value})}
            placeholder="Select available blood types"
            display="chip"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicalInstitutionForm = () => (
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miName">Institution Name*</label>
          <InputText
            id="miName"
            value={medicalInstitutionData.name}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, name: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.name })}
          />
          {submitted && !medicalInstitutionData.name && (
            <small className="p-error">Institution name is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miRegNumber">Registration Number*</label>
          <InputText
            id="miRegNumber"
            value={medicalInstitutionData.registrationNumber}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, registrationNumber: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.registrationNumber })}
          />
          {submitted && !medicalInstitutionData.registrationNumber && (
            <small className="p-error">Registration number is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miType">Institution Type*</label>
          <Dropdown
            id="miType"
            value={medicalInstitutionData.type}
            options={institutionTypes}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, type: e.value})}
            placeholder="Select institution type"
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.type })}
          />
          {submitted && !medicalInstitutionData.type && (
            <small className="p-error">Institution type is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="miPhone">Phone Number*</label>
          <InputText
            id="miPhone"
            value={medicalInstitutionData.phoneNumber}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, phoneNumber: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.phoneNumber })}
          />
        </div>
      </div>
      <div className="col-12">
        <div className="field">
          <label htmlFor="miAddress">Address*</label>
          <InputTextarea
            id="miAddress"
            value={medicalInstitutionData.address}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, address: e.target.value})}
            rows={3}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.address })}
          />
          {submitted && !medicalInstitutionData.address && (
            <small className="p-error">Address is required.</small>
          )}
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="miCity">City*</label>
          <InputText
            id="miCity"
            value={medicalInstitutionData.city}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, city: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.city })}
          />
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="miState">State*</label>
          <InputText
            id="miState"
            value={medicalInstitutionData.state}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, state: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.state })}
          />
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="field">
          <label htmlFor="miCountry">Country*</label>
          <InputText
            id="miCountry"
            value={medicalInstitutionData.country}
            onChange={(e) => setMedicalInstitutionData({...medicalInstitutionData, country: e.target.value})}
            className={classNames({ "p-invalid": submitted && !medicalInstitutionData.country })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex justify-content-center">
      <Toast ref={toast} />
      <Card title="Apply for Organization Account" className="shadow-4 w-full max-w-6">
        <div className="flex justify-content-center mb-4">
          <i
            className="pi pi-building text-blue-500"
            style={{ fontSize: "3rem" }}
          ></i>
        </div>
        <h2 className="text-center text-primary font-bold mb-5">
          Register Your Organization
        </h2>

        <form onSubmit={handleSubmit} className="p-fluid">
          {/* User Credentials Section */}
          <div className="grid">
            <div className="col-12">
              <h3>Account Information</h3>
              <Divider />
            </div>
            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="orgType">Organization Type*</label>
                <Dropdown
                  id="orgType"
                  value={organizationType}
                  options={organizationTypes}
                  onChange={(e) => setOrganizationType(e.value)}
                  placeholder="Select organization type"
                  className={classNames({ "p-invalid": submitted && !organizationType })}
                />
                {submitted && !organizationType && (
                  <small className="p-error">Organization type is required.</small>
                )}
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="email">Email*</label>
                <InputText
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={classNames({ "p-invalid": submitted && !email })}
                />
                {submitted && !email && (
                  <small className="p-error">Email is required.</small>
                )}
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="password">Password*</label>
                <Password
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  toggleMask
                  className={classNames({ "p-invalid": submitted && !password })}
                />
                {submitted && !password && (
                  <small className="p-error">Password is required.</small>
                )}
              </div>
            </div>
          </div>

          {/* Organization Details Section */}
          {organizationType && (
            <>
              <div className="col-12 mt-4">
                <h3>Organization Details</h3>
                <Divider />
              </div>
              {organizationType === UserRole.BLOOD_BANK ? renderBloodBankForm() : renderMedicalInstitutionForm()}
            </>
          )}

          {applicationError && <small className="p-error mb-3 block">{applicationError}</small>}

          <div className="flex justify-content-center mt-4">
            <Button 
              type="submit" 
              label="Submit Application" 
              className="w-auto"
              loading={applyMutation.isPending}
              disabled={!organizationType}
            />
          </div>
        </form>

        <Divider align="center" className="mt-5">
          <span className="text-600 font-normal">OR</span>
        </Divider>

        <div className="mt-4 text-center">
          <p className="text-600 line-height-3 mb-3">
            Already have an account?{" "}
            <Button
              link
              className="text-primary font-medium p-0"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </p>
          <p className="text-600 line-height-3 mb-3">
            Want to register as a donor?{" "}
            <Button
              link
              className="text-primary font-medium p-0"
              onClick={() => navigate('/signup')}
            >
              Create Donor Account
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApplyPage;
