import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";
import { useAuth } from "../state/authContext";
import { useDonorByUserId, useUpdateDonor } from "../state/donors";
import { useGlobalToast } from "../components/layout/ToastContext";
import { extractErrorForToast } from "../utils/errorHandling";
import type { Donor } from "./DonorsPage/types";
import { BloodTypeEnum } from "./DonorsPage/types";

const bloodTypeOptions = [
  { label: "A", value: BloodTypeEnum.A },
  { label: "B", value: BloodTypeEnum.B },
  { label: "AB", value: BloodTypeEnum.AB },
  { label: "O", value: BloodTypeEnum.O },
];

const rhFactorOptions = [
  { label: "+", value: "+" },
  { label: "-", value: "-" },
];

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const DonorSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: donor, isLoading, refetch } = useDonorByUserId(user?._id);
  const updateDonorMutation = useUpdateDonor();
  const toast = useGlobalToast();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState<string>("");

  // Form state for editing
  const [formData, setFormData] = useState<Partial<Donor>>({});

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const formatBloodType = (donor: Donor) => {
    return `${donor.bloodType}${donor.RhFactor}`;
  };

  const openEditDialog = (field: string, currentValue: any) => {
    setEditingField(field);
    setFormData({ [field]: currentValue });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!donor?._id) return;

    try {
      await updateDonorMutation.mutateAsync({
        id: donor._id,
        ...formData
      });
      
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
        life: 3000,
      });
      
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      console.error("Error updating donor profile:", error);
      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };

  const renderEditField = () => {
    const currentValue = formData[editingField as keyof Donor];

    switch (editingField) {
      case "firstName":
      case "lastName":
      case "phoneNumber":
      case "email":
      case "address":
      case "city":
      case "state":
      case "postalCode":
      case "country":
      case "preferredDonationCenter":
        return (
          <InputText
            value={currentValue as string || ""}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.target.value })}
            className="w-full"
          />
        );
      
      case "dateOfBirth":
        return (
          <Calendar
            value={currentValue ? new Date(currentValue as string) : null}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.value?.toISOString() })}
            showIcon
            dateFormat="yy-mm-dd"
            maxDate={new Date()}
            className="w-full"
          />
        );
      
      case "gender":
        return (
          <Dropdown
            value={currentValue}
            options={genderOptions}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.value === null ? undefined : e.value })}
            className="w-full"
          />
        );
      
      case "bloodType":
        return (
          <Dropdown
            value={currentValue}
            options={bloodTypeOptions}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.value === null ? undefined : e.value })}
            className="w-full"
          />
        );
      
      case "RhFactor":
        return (
          <Dropdown
            value={currentValue}
            options={rhFactorOptions}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.value === null ? undefined : e.value })}
            className="w-full"
          />
        );
      
      case "receiveDonationAlerts":
        return (
          <div className="flex align-items-center">
            <Checkbox
              checked={currentValue as boolean}
              onChange={(e) => setFormData({ ...formData, [editingField]: e.checked })}
            />
            <label className="ml-2">Receive donation alerts</label>
          </div>
        );
      
      case "maxTravelDistance":
        return (
          <InputNumber
            value={currentValue as number}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.value === null ? undefined : e.value })}
            suffix=" km"
            min={1}
            max={500}
            className="w-full"
          />
        );
      
      case "medicalConditions":
      case "medications":
      case "allergies":
        return (
          <InputText
            value={Array.isArray(currentValue) ? currentValue.join(", ") : ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              [editingField]: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
            })}
            placeholder="Comma-separated list"
            className="w-full"
          />
        );
      
      case "emergencyContactName":
      case "emergencyContactPhone":
      case "emergencyContactRelationship":
        return (
          <InputText
            value={currentValue as string || ""}
            onChange={(e) => setFormData({ ...formData, [editingField]: e.target.value })}
            className="w-full"
          />
        );
      
      default:
        return null;
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      phoneNumber: "Phone Number",
      email: "Email",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      bloodType: "Blood Type",
      RhFactor: "Rh Factor",
      address: "Address",
      city: "City",
      state: "State/Province",
      postalCode: "Postal Code",
      country: "Country",
      medicalConditions: "Medical Conditions",
      medications: "Medications",
      allergies: "Allergies",
      emergencyContactName: "Emergency Contact Name",
      emergencyContactPhone: "Emergency Contact Phone",
      emergencyContactRelationship: "Emergency Contact Relationship",
      receiveDonationAlerts: "Receive Donation Alerts",
      maxTravelDistance: "Max Travel Distance",
      preferredDonationCenter: "Preferred Donation Center",
    };
    return labels[field] || field;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Card title="My Donor Profile">
          <div className="grid">
            <div className="col-12 md:col-6">
              <Skeleton height="2rem" className="mb-2" />
              <Skeleton height="1.5rem" className="mb-3" />
              <Skeleton height="1.5rem" className="mb-3" />
              <Skeleton height="1.5rem" className="mb-3" />
            </div>
            <div className="col-12 md:col-6">
              <Skeleton height="2rem" className="mb-2" />
              <Skeleton height="1.5rem" className="mb-3" />
              <Skeleton height="1.5rem" className="mb-3" />
              <Skeleton height="1.5rem" className="mb-3" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="p-4">
        <Card title="My Donor Profile">
          <div className="text-center p-5">
            <i className="pi pi-user text-gray-400" style={{ fontSize: '3rem' }}></i>
            <h3 className="mt-3">No Donor Profile Found</h3>
            <p className="text-600">You don't have a donor profile yet. Please contact support to create one.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">My Donor Profile</h1>
        <Tag 
          value={formatBloodType(donor)} 
          severity="info" 
          style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}
        />
      </div>

      {/* Personal Information */}
      <Card title="Personal Information" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">First Name</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("firstName", donor.firstName)}
                />
              </div>
              <p className="m-0">{donor.firstName}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Last Name</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("lastName", donor.lastName)}
                />
              </div>
              <p className="m-0">{donor.lastName}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Phone Number</label>
              </div>
              <p className="m-0">{donor.phoneNumber}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Email</label>
              </div>
              <p className="m-0">{donor.email || "Not provided"}</p>
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Date of Birth</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("dateOfBirth", donor.dateOfBirth)}
                />
              </div>
              <p className="m-0">{formatDate(donor.dateOfBirth)}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Gender</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("gender", donor.gender)}
                />
              </div>
              <p className="m-0">{donor.gender}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Blood Type</label>
              </div>
              <p className="m-0">{donor.bloodType}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Rh Factor</label>
              </div>
              <p className="m-0">{donor.RhFactor}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card title="Address Information" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Address</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("address", donor.address)}
                />
              </div>
              <p className="m-0">{donor.address || "Not provided"}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">City</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("city", donor.city)}
                />
              </div>
              <p className="m-0">{donor.city || "Not provided"}</p>
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">State/Province</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("state", donor.state)}
                />
              </div>
              <p className="m-0">{donor.state || "Not provided"}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Postal Code</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("postalCode", donor.postalCode)}
                />
              </div>
              <p className="m-0">{donor.postalCode || "Not provided"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Medical Information */}
      <Card title="Medical Information" className="mb-4">
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Medical Conditions</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("medicalConditions", donor.medicalConditions)}
                />
              </div>
              <p className="m-0">{donor.medicalConditions?.length ? donor.medicalConditions.join(", ") : "None reported"}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Medications</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("medications", donor.medications)}
                />
              </div>
              <p className="m-0">{donor.medications?.length ? donor.medications.join(", ") : "None reported"}</p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Allergies</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("allergies", donor.allergies)}
                />
              </div>
              <p className="m-0">{donor.allergies?.length ? donor.allergies.join(", ") : "None reported"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card title="Emergency Contact" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Name</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("emergencyContactName", donor.emergencyContactName)}
                />
              </div>
              <p className="m-0">{donor.emergencyContactName || "Not provided"}</p>
            </div>
          </div>
          
          <div className="col-12 md:col-4">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Phone</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("emergencyContactPhone", donor.emergencyContactPhone)}
                />
              </div>
              <p className="m-0">{donor.emergencyContactPhone || "Not provided"}</p>
            </div>
          </div>
          
          <div className="col-12 md:col-4">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Relationship</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("emergencyContactRelationship", donor.emergencyContactRelationship)}
                />
              </div>
              <p className="m-0">{donor.emergencyContactRelationship || "Not provided"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Donation Preferences */}
      <Card title="Donation Preferences" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Receive Donation Alerts</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("receiveDonationAlerts", donor.receiveDonationAlerts)}
                />
              </div>
              <p className="m-0">
                <Tag 
                  value={donor.receiveDonationAlerts ? "Yes" : "No"} 
                  severity={donor.receiveDonationAlerts ? "success" : "secondary"}
                />
              </p>
            </div>
            
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Max Travel Distance</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("maxTravelDistance", donor.maxTravelDistance)}
                />
              </div>
              <p className="m-0">{donor.maxTravelDistance ? `${donor.maxTravelDistance} km` : "Not specified"}</p>
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <div className="field">
              <div className="flex justify-content-between align-items-center">
                <label className="font-bold">Preferred Donation Center</label>
                <Button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  onClick={() => openEditDialog("preferredDonationCenter", donor.preferredDonationCenter)}
                />
              </div>
              <p className="m-0">{donor.preferredDonationCenter || "Not specified"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Donation History Summary */}
      <Card title="Donation Summary">
        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{donor.totalDonations || 0}</div>
              <div className="text-600">Total Donations</div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "Never"}
              </div>
              <div className="text-600">Last Donation</div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {donor.nextEligibleDate ? formatDate(donor.nextEligibleDate) : "N/A"}
              </div>
              <div className="text-600">Next Eligible Date</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        header={`Edit ${getFieldLabel(editingField)}`}
        visible={showEditDialog}
        style={{ width: '400px' }}
        onHide={() => setShowEditDialog(false)}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              outlined 
              onClick={() => setShowEditDialog(false)}
            />
            <Button 
              label="Save" 
              icon="pi pi-check" 
              onClick={handleSave}
              loading={updateDonorMutation.isPending}
            />
          </div>
        }
      >
        <div className="field">
          <label className="font-bold block mb-2">{getFieldLabel(editingField)}</label>
          {renderEditField()}
        </div>
      </Dialog>
    </div>
  );
};

export default DonorSettingsPage;
