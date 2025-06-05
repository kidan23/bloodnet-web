import { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useNavigate } from "react-router-dom";
import { useApply } from "../state/auth";
import { UserRole } from "../state/auth";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import AccountCredentialsForm from "../components/forms/AccountCredentialsForm";
import BloodBankApplicationForm from "../components/forms/BloodBankApplicationForm";
import MedicalInstitutionApplicationForm from "../components/forms/MedicalInstitutionApplicationForm";
import { extractErrorForToast } from "../utils/errorHandling";

const ApplyPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const applyMutation = useApply();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // Account credentials state
  const [accountData, setAccountData] = useState({
    organizationType: null as UserRole | null,
    email: "",
    password: "",
    confirmPassword: "",
  });
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
    bloodTypesAvailable: [] as string[],
    licenseNumber: "",
    establishedDate: null as Date | null,
    location: {
      type: "Point" as const,
      coordinates: [0, 0] as [number, number],
    },
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
    operatingHours: [] as string[],
    services: [] as string[],
    coordinates: [0, 0] as [number, number],
  });
  const validateForm = () => {
    // Basic account validation
    if (
      !accountData.email ||
      !accountData.password ||
      !accountData.confirmPassword ||
      !accountData.organizationType
    ) {
      return false;
    }

    if (accountData.password !== accountData.confirmPassword) {
      setApplicationError("Passwords do not match");
      return false;
    }

    // Organization-specific validation
    if (accountData.organizationType === UserRole.BLOOD_BANK) {
      return (
        bloodBankData.name &&
        bloodBankData.address &&
        bloodBankData.city &&
        bloodBankData.state &&
        bloodBankData.country &&
        bloodBankData.contactNumber &&
        bloodBankData.licenseNumber
      );
    } else if (accountData.organizationType === UserRole.MEDICAL_INSTITUTION) {
      return (
        medicalInstitutionData.name &&
        medicalInstitutionData.registrationNumber &&
        medicalInstitutionData.type &&
        medicalInstitutionData.phoneNumber &&
        medicalInstitutionData.address &&
        medicalInstitutionData.city &&
        medicalInstitutionData.state &&
        medicalInstitutionData.country
      );
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApplicationError(null);

    if (!validateForm() || !accountData.organizationType) {
      return;
    }

    let profileData;
    if (accountData.organizationType === UserRole.BLOOD_BANK) {
      profileData = {
        ...bloodBankData,
        establishedDate: bloodBankData.establishedDate?.toISOString(),
      };
    } else {
      profileData = medicalInstitutionData;
    }

    try {
      await applyMutation.mutateAsync({
        email: accountData.email,
        password: accountData.password,
        role: accountData.organizationType,
        profileData,
      });

      toast.current?.show({
        severity: "success",
        summary: "Application Submitted",
        detail:
          "Your application has been submitted successfully. You will receive an email once it is reviewed.",
        life: 5000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const { summary, detail } = extractErrorForToast(err);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };
  return (
    <div className="flex justify-content-center mx-8 mt-8">
      <Toast ref={toast} />
      <Card title="Apply for Organization Account" className="shadow-4 ">
        <div className="flex justify-content-center mb-4">
          <i
            className="pi pi-building text-blue-500"
            style={{ fontSize: "3rem" }}
          ></i>
        </div>
        <h2 className="text-center text-primary font-bold mb-5">
          Register Your Organization
        </h2>{" "}
        <form onSubmit={handleSubmit} className="p-fluid">
          {/* Account Credentials Section */}
          <AccountCredentialsForm
            data={accountData}
            onChange={setAccountData}
            submitted={submitted}
          />

          {/* Organization Details Section */}
          {accountData.organizationType && (
            <>
              <div className="col-12 mt-4">
                <h3>Organization Details</h3>
                <Divider />
              </div>
              {accountData.organizationType === UserRole.BLOOD_BANK ? (
                <BloodBankApplicationForm
                  data={bloodBankData}
                  onChange={setBloodBankData}
                  submitted={submitted}
                />
              ) : (
                <MedicalInstitutionApplicationForm
                  data={medicalInstitutionData}
                  onChange={setMedicalInstitutionData}
                  submitted={submitted}
                />
              )}
            </>
          )}

          {applicationError && (
            <small className="p-error mb-3 block">{applicationError}</small>
          )}

          <div className="flex justify-content-center mt-4">
            <Button
              type="submit"
              label="Submit Application"
              className="w-auto"
              loading={applyMutation.isPending}
              disabled={!accountData.organizationType}
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
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </p>
          <p className="text-600 line-height-3 mb-3">
            Want to register as a donor?{" "}
            <Button
              link
              className="text-primary font-medium p-0"
              onClick={() => navigate("/signup")}
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
