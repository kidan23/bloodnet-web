import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { InputTextarea } from "primereact/inputtextarea";
import { useCreateDonation } from "../../state/donations";
import { UserRole } from "../../state/auth";
import RoleBasedAccess from "../../components/RoleBasedAccess";
import {
  donationStatusOptions,
  donationTypeOptions,
  collectionMethodOptions,
  DonationStatus,
} from "./constants";
import type { CreateDonationDto } from "./types";
import { extractErrorForToast } from "../../utils/errorHandling";
import { notificationsService } from "../../services/notificationsService";
import { useDonors } from "../../state/donors";
import { useBloodBanks } from "../../state/bloodBanks";
import type { Donor } from "../DonorsPage/types";
import type { BloodBank } from "../BloodBanksPage/types";

// Component for creating new donation records - Only accessible to authorized roles
const CreateDonationPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const createDonationMutation = useCreateDonation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Form state
  const [donationData, setDonationData] = useState<CreateDonationDto>({
    donor: "",
    bloodBank: "",
    donationDate: new Date(),
    status: DonationStatus.SCHEDULED,
  });

  // Fetch all donors and blood banks for dropdowns
  const { data: donorData } = useDonors();
  const donorOptions = (donorData?.results || []).map((d: Donor) => ({
    label: `${d.firstName} ${d.lastName} (${d._id})`,
    value: d._id,
  }));

  const { data: bloodBankData } = useBloodBanks();
  const bloodBankOptions = (bloodBankData?.results || []).map((b: BloodBank) => ({
    label: `${b.name} (${b._id})`,
    value: b._id,
  }));

  // Handle form input changes
  const handleInputChange = (key: keyof CreateDonationDto, value: any) => {
    setDonationData({
      ...donationData,
      [key]: value,
    });
  };

  // Handle numeric input changes
  const handleNumberChange = (
    key: keyof CreateDonationDto,
    value: number | null
  ) => {
    setDonationData({
      ...donationData,
      [key]: value === null ? undefined : value,
    });
  };

  // Handle checkbox input changes
  const handleCheckboxChange = (
    key: keyof CreateDonationDto,
    checked: boolean
  ) => {
    setDonationData({
      ...donationData,
      [key]: checked,
    });
  };

  // Validate form before submission
  const validateForm = () => {
    if (!donationData.donor) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Donor ID is required",
        life: 3000,
      });
      return false;
    }
    if (!donationData.bloodBank) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Blood Bank ID is required",
        life: 3000,
      });
      return false;
    }
    if (!donationData.donationDate) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Donation date is required",
        life: 3000,
      });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createDonationMutation.mutateAsync(donationData);

      // Notify donor that donation result is ready (simulate result ready for demo)
      await notificationsService.notifyDonationResultReady(
        donationData.donor,
        "new-donation-id", // Replace with actual ID if available
        new Date(), // Use current date for result ready
        donationData.bloodBank
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Donation record created successfully",
        life: 3000,
      });

      // Navigate back to donations list after successful creation
      setTimeout(() => {
        navigate("/donations");
      }, 1500);
    } catch (error) {
      console.error("Error creating donation:", error);

      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };
  return (
    <RoleBasedAccess
      allowedRoles={[
        UserRole.ADMIN,
        UserRole.BLOOD_BANK,
        UserRole.MEDICAL_INSTITUTION,
      ]}
      fallback={
        <div className="p-4">
          <Card>
            <div className="text-center p-4">
              <i className="pi pi-lock text-6xl text-400 mb-3"></i>
              <h3>Access Restricted</h3>
              <p className="text-600">
                You don't have permission to create donation records. Only
                administrators, blood banks, and medical institutions can access
                this feature.
              </p>
              <Link to="/donations">
                <Button
                  label="Back to Donations"
                  icon="pi pi-arrow-left"
                  className="mt-3"
                />
              </Link>
            </div>
          </Card>
        </div>
      }
    >
      <div className="p-4 max-w-3xl mx-auto">
        <Toast ref={toast} />

        <div className="flex align-items-center mb-4">
          <Link to="/donations">
            <Button
              label="Back to Donations"
              icon="pi pi-arrow-left"
              className="p-button-outlined mr-3"
            />
          </Link>
          <h1 className="m-0">Record New Donation</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <TabView
              activeIndex={activeIndex}
              onTabChange={(e) => setActiveIndex(e.index)}
            >
              <TabPanel header="Basic Information">
                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="donor" className="block mb-2">
                      Donor*
                    </label>
                    <Dropdown
                      id="donor"
                      value={donationData.donor}
                      options={donorOptions}
                      onChange={(e) => handleInputChange("donor", e.value)}
                      placeholder="Select donor"
                      className="w-full"
                      filter
                      optionLabel="label"
                      optionValue="value"
                      required
                    />
                  </div>
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="bloodBank" className="block mb-2">
                      Blood Bank*
                    </label>
                    <Dropdown
                      id="bloodBank"
                      value={donationData.bloodBank}
                      options={bloodBankOptions}
                      onChange={(e) => handleInputChange("bloodBank", e.value)}
                      placeholder="Select blood bank"
                      className="w-full"
                      filter
                      optionLabel="label"
                      optionValue="value"
                      required
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="donationDate" className="block mb-2">
                      Donation Date*
                    </label>
                    <Calendar
                      id="donationDate"
                      value={
                        donationData.donationDate instanceof Date
                          ? donationData.donationDate
                          : new Date(donationData.donationDate)
                      }
                      onChange={(e) => handleInputChange("donationDate", e.value)}
                      showIcon
                      dateFormat="yy-mm-dd"
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="status" className="block mb-2">
                      Status
                    </label>
                    <Dropdown
                      id="status"
                      value={donationData.status}
                      options={donationStatusOptions}
                      onChange={(e) => handleInputChange("status", e.value)}
                      placeholder="Select Status"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="donationType" className="block mb-2">
                      Donation Type
                    </label>
                    <Dropdown
                      id="donationType"
                      value={donationData.donationType}
                      options={donationTypeOptions}
                      onChange={(e) => handleInputChange("donationType", e.value)}
                      placeholder="Select Donation Type"
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="volumeCollected" className="block mb-2">
                      Volume Collected (ml)
                    </label>
                    <InputNumber
                      id="volumeCollected"
                      value={donationData.volumeCollected}
                      onValueChange={(e) =>
                        handleNumberChange(
                          "volumeCollected",
                          e.value as number | null
                        )
                      }
                      min={100}
                      max={1000}
                      className="w-full"
                      placeholder="Enter volume in ml"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="bagNumber" className="block mb-2">
                      Bag Number
                    </label>
                    <InputText
                      id="bagNumber"
                      value={donationData.bagNumber || ""}
                      onChange={(e) =>
                        handleInputChange("bagNumber", e.target.value)
                      }
                      placeholder="Enter bag number"
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="collectionMethod" className="block mb-2">
                      Collection Method
                    </label>
                    <Dropdown
                      id="collectionMethod"
                      value={donationData.collectionMethod}
                      options={collectionMethodOptions}
                      onChange={(e) =>
                        handleInputChange("collectionMethod", e.value)
                      }
                      placeholder="Select Collection Method"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="phlebotomist" className="block mb-2">
                      Phlebotomist
                    </label>
                    <InputText
                      id="phlebotomist"
                      value={donationData.phlebotomist || ""}
                      onChange={(e) =>
                        handleInputChange("phlebotomist", e.target.value)
                      }
                      placeholder="Enter phlebotomist name"
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="equipmentUsed" className="block mb-2">
                      Equipment Used
                    </label>
                    <InputText
                      id="equipmentUsed"
                      value={donationData.equipmentUsed || ""}
                      onChange={(e) =>
                        handleInputChange("equipmentUsed", e.target.value)
                      }
                      placeholder="Enter equipment details"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-content-end">
                  <Button
                    type="button"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    onClick={() => setActiveIndex(1)}
                  />
                </div>
              </TabPanel>

              <TabPanel header="Medical Metrics">
                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="weight" className="block mb-2">
                      Weight (kg)
                    </label>
                    <InputNumber
                      id="weight"
                      value={donationData.weight}
                      onValueChange={(e) =>
                        handleNumberChange("weight", e.value as number | null)
                      }
                      min={20}
                      max={200}
                      className="w-full"
                      placeholder="Enter weight in kg"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="height" className="block mb-2">
                      Height (cm)
                    </label>
                    <InputNumber
                      id="height"
                      value={donationData.height}
                      onValueChange={(e) =>
                        handleNumberChange("height", e.value as number | null)
                      }
                      min={100}
                      max={250}
                      className="w-full"
                      placeholder="Enter height in cm"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="hemoglobinLevel" className="block mb-2">
                      Hemoglobin Level (g/dL)
                    </label>
                    <InputNumber
                      id="hemoglobinLevel"
                      value={donationData.hemoglobinLevel}
                      onValueChange={(e) =>
                        handleNumberChange(
                          "hemoglobinLevel",
                          e.value as number | null
                        )
                      }
                      min={4}
                      max={25}
                      step={0.1}
                      className="w-full"
                      placeholder="Enter hemoglobin level"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label htmlFor="temperature" className="block mb-2">
                      Temperature (°C)
                    </label>
                    <InputNumber
                      id="temperature"
                      value={donationData.temperature}
                      onValueChange={(e) =>
                        handleNumberChange(
                          "temperature",
                          e.value as number | null
                        )
                      }
                      min={35}
                      max={42}
                      step={0.1}
                      className="w-full"
                      placeholder="Enter temperature"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="bloodPressureSystolic" className="block mb-2">
                      Blood Pressure - Systolic (mmHg)
                    </label>
                    <InputNumber
                      id="bloodPressureSystolic"
                      value={donationData.bloodPressureSystolic}
                      onValueChange={(e) =>
                        handleNumberChange(
                          "bloodPressureSystolic",
                          e.value as number | null
                        )
                      }
                      min={70}
                      max={200}
                      className="w-full"
                      placeholder="Enter systolic pressure"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label
                      htmlFor="bloodPressureDiastolic"
                      className="block mb-2"
                    >
                      Blood Pressure - Diastolic (mmHg)
                    </label>
                    <InputNumber
                      id="bloodPressureDiastolic"
                      value={donationData.bloodPressureDiastolic}
                      onValueChange={(e) =>
                        handleNumberChange(
                          "bloodPressureDiastolic",
                          e.value as number | null
                        )
                      }
                      min={40}
                      max={120}
                      className="w-full"
                      placeholder="Enter diastolic pressure"
                    />
                  </div>
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6 field">
                    <label htmlFor="pulseRate" className="block mb-2">
                      Pulse Rate (bpm)
                    </label>
                    <InputNumber
                      id="pulseRate"
                      value={donationData.pulseRate}
                      onValueChange={(e) =>
                        handleNumberChange("pulseRate", e.value as number | null)
                      }
                      min={40}
                      max={200}
                      className="w-full"
                      placeholder="Enter pulse rate"
                    />
                  </div>

                  <div className="col-12 md:col-6 field">
                    <label
                      htmlFor="nextEligibleDonationDate"
                      className="block mb-2"
                    >
                      Next Eligible Donation Date
                    </label>
                    <Calendar
                      id="nextEligibleDonationDate"
                      value={
                        donationData.nextEligibleDonationDate instanceof Date
                          ? donationData.nextEligibleDonationDate
                          : donationData.nextEligibleDonationDate
                          ? new Date(donationData.nextEligibleDonationDate)
                          : null
                      }
                      onChange={(e) =>
                        handleInputChange("nextEligibleDonationDate", e.value)
                      }
                      showIcon
                      dateFormat="yy-mm-dd"
                      className="w-full"
                      minDate={new Date()}
                    />
                  </div>
                </div>

                <div className="flex justify-content-between">
                  <Button
                    type="button"
                    label="Previous"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => setActiveIndex(0)}
                  />
                  <Button
                    type="button"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    onClick={() => setActiveIndex(2)}
                  />
                </div>
              </TabPanel>

              <TabPanel header="Additional Information">
                <div className="field mb-4">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="adverseReaction"
                      checked={!!donationData.adverseReaction}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "adverseReaction",
                          e.checked || false
                        )
                      }
                    />
                    <label htmlFor="adverseReaction" className="ml-2">
                      Adverse Reaction Occurred
                    </label>
                  </div>
                </div>

                {donationData.adverseReaction && (
                  <div className="field mb-4">
                    <label
                      htmlFor="adverseReactionDetails"
                      className="block mb-2"
                    >
                      Adverse Reaction Details
                    </label>
                    <InputTextarea
                      id="adverseReactionDetails"
                      value={donationData.adverseReactionDetails || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "adverseReactionDetails",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full"
                      placeholder="Describe the adverse reaction"
                    />
                  </div>
                )}

                <div className="field mb-4">
                  <label htmlFor="notes" className="block mb-2">
                    Notes
                  </label>
                  <InputTextarea
                    id="notes"
                    value={donationData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={5}
                    className="w-full"
                    placeholder="Enter any additional notes or observations"
                  />
                </div>

                <div className="field mb-4">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="isApproved"
                      checked={!!donationData.isApproved}
                      onChange={(e) =>
                        handleCheckboxChange("isApproved", e.checked || false)
                      }
                    />
                    <label htmlFor="isApproved" className="ml-2">
                      Donation Approved
                    </label>
                  </div>
                </div>

                <div className="flex justify-content-between">
                  <Button
                    type="button"
                    label="Previous"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => setActiveIndex(1)}
                  />
                  <Button
                    type="submit"
                    label="Submit"
                    icon="pi pi-check"
                    loading={createDonationMutation.isPending}
                  />
                </div>
              </TabPanel>
            </TabView>
          </form>
        </Card>
      </div>
    </RoleBasedAccess>
  );
};

export default CreateDonationPage;
