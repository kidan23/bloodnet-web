// Form component for creating new donation schedules

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCreateDonationSchedule, useAvailableTimeSlots } from "./hooks";
import { useBloodBanks } from "../../state/bloodBanks";
import { useDonors } from "../../state/donors";
import { useAuth } from "../../state/authContext";
import { extractErrorForToast } from "../../utils/errorHandling";
import type { CreateDonationScheduleDto } from "./types";
import {
  TIME_SLOTS,
  DONATION_TYPES,
  PURPOSE_OPTIONS,
  CONTACT_METHODS,
  RECURRING_PATTERNS,
  DEFAULT_SCHEDULE_FORM,
  VALIDATION_MESSAGES,
} from "./constants";
import type { Donor } from "../DonorsPage";

interface CreateScheduleFormProps {
  visible: boolean;
  onHide: () => void;
  donorId?: string; // Pre-select donor if provided
  bloodBankId?: string; // Pre-select blood bank if provided
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  visible,
  onHide,
  donorId,
  bloodBankId,
}) => {
  const { user } = useAuth();
  const createMutation = useCreateDonationSchedule();

  const [formData, setFormData] = useState<CreateDonationScheduleDto>({
    ...DEFAULT_SCHEDULE_FORM,
    donor: user?.donorId || "",
    bloodBank: bloodBankId || "",
    scheduledBy: user?._id,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch data for dropdowns
  const { data: bloodBanksData } = useBloodBanks({ limit: 100 });
  const { data: donorsData } = useDonors({ limit: 100 });

  // Fetch available time slots when date and blood bank are selected
  const { data: availableSlots, isLoading: slotsLoading } =
    useAvailableTimeSlots(
      formData.bloodBank,
      formData.scheduledDate instanceof Date
        ? formData.scheduledDate
        : undefined
    );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (visible) {
      setFormData({
        ...DEFAULT_SCHEDULE_FORM,
        donor: user?.donorId || "",
        bloodBank: bloodBankId || "",
        scheduledBy: user?._id,
      });
      setErrors({});
      setSubmitted(false);
    }
  }, [visible, bloodBankId, user]);

  const bloodBankOptions =
    bloodBanksData?.results?.map((bank) => ({
      label: `${bank.name} - ${bank.city}`,
      value: bank._id,
    })) || [];

  const donorOptions =
    donorsData?.results?.map((donor: Donor) => ({
      label: `${donor.firstName} ${donor.lastName} (${donor.bloodType}${donor.RhFactor})`,
      value: donor._id,
    })) || [];

  // Filter time slots based on availability
  const timeSlotOptions = TIME_SLOTS.map((slot) => {
    const availability = availableSlots?.find(
      (avail) => avail.timeSlot === slot.value
    );
    return {
      ...slot,
      available: availability?.available ?? true,
      disabled: availability?.available === false,
    };
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.donor) {
      newErrors.donor = VALIDATION_MESSAGES.DONOR_REQUIRED;
    }

    if (!formData.bloodBank) {
      newErrors.bloodBank = VALIDATION_MESSAGES.BLOOD_BANK_REQUIRED;
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = VALIDATION_MESSAGES.DATE_REQUIRED;
    } else if (new Date(formData.scheduledDate) <= new Date()) {
      newErrors.scheduledDate = VALIDATION_MESSAGES.DATE_FUTURE;
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = VALIDATION_MESSAGES.TIME_SLOT_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      onHide();
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateDonationScheduleDto,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
        disabled={createMutation.isPending}
      />
      <Button
        label="Create Schedule"
        icon="pi pi-check"
        type="submit"
        form="create-schedule-form"
        loading={createMutation.isPending}
        disabled={createMutation.isPending}
      />
    </div>
  );

  return (
    <Dialog
      header="Create Donation Schedule"
      visible={visible}
      onHide={onHide}
      footer={footer}
      className="w-full max-w-4xl"
      modal
      dismissableMask
    >
      <form id="create-schedule-form" onSubmit={handleSubmit}>
        <div className="grid">
          {/* Basic Information */}
          <div className="col-12">
            <h4>Basic Information</h4>
            <Divider />
          </div>

          {/* Donor Selection */}
          {/*
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">
              Donor <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.donor}
              options={donorOptions}
              onChange={(e) => handleInputChange("donor", e.value)}
              placeholder="Select a donor"
              className={`w-full ${errors.donor ? "p-invalid" : ""}`}
              filter
              showClear
              disabled={!!donorId} // Disable if pre-selected
            />
            {errors.donor && <small className="p-error">{errors.donor}</small>}
          </div>
          */}

          {/* Blood Bank Selection */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">
              Blood Bank <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.bloodBank}
              options={bloodBankOptions}
              onChange={(e) => handleInputChange("bloodBank", e.value)}
              placeholder="Select a blood bank"
              className={`w-full ${errors.bloodBank ? "p-invalid" : ""}`}
              filter
              showClear
              disabled={!!bloodBankId} // Disable if pre-selected
            />
            {errors.bloodBank && (
              <small className="p-error">{errors.bloodBank}</small>
            )}
          </div>

          {/* Scheduled Date */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={
                typeof formData.scheduledDate === "string"
                  ? formData.scheduledDate
                    ? new Date(formData.scheduledDate)
                    : null
                  : formData.scheduledDate
              }
              onChange={(e) => handleInputChange("scheduledDate", e.value)}
              className={`w-full ${errors.scheduledDate ? "p-invalid" : ""}`}
              placeholder="Select date"
              minDate={new Date()}
              showIcon
              dateFormat="mm/dd/yy"
            />
            {errors.scheduledDate && (
              <small className="p-error">{errors.scheduledDate}</small>
            )}
          </div>

          {/* Time Slot */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">
              Time Slot <span className="text-red-500">*</span>
            </label>
            <div className="flex align-items-center gap-2">
              <Dropdown
                value={formData.timeSlot}
                options={timeSlotOptions}
                onChange={(e) => handleInputChange("timeSlot", e.value)}
                placeholder="Select time slot"
                className={`flex-1 ${errors.timeSlot ? "p-invalid" : ""}`}
                disabled={!formData.bloodBank || !formData.scheduledDate}
                optionDisabled="disabled"
              />
              {slotsLoading && (
                <ProgressSpinner style={{ width: "20px", height: "20px" }} />
              )}
            </div>
            {errors.timeSlot && (
              <small className="p-error">{errors.timeSlot}</small>
            )}
            {!formData.bloodBank || !formData.scheduledDate ? (
              <small className="text-600">
                Select blood bank and date first
              </small>
            ) : null}
          </div>

          {/* Donation Details */}
          <div className="col-12 mt-4">
            <h4>Donation Details</h4>
            <Divider />
          </div>

          {/* Donation Type */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">Donation Type</label>
            <Dropdown
              value={formData.donationType}
              options={DONATION_TYPES}
              onChange={(e) => handleInputChange("donationType", e.value)}
              placeholder="Select donation type"
              className="w-full"
            />
          </div>

          {/* Purpose */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">Purpose</label>
            <Dropdown
              value={formData.purpose}
              options={PURPOSE_OPTIONS}
              onChange={(e) => handleInputChange("purpose", e.value)}
              placeholder="Select purpose"
              className="w-full"
            />
          </div>

          {/* Contact Method */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">Contact Method</label>
            <Dropdown
              value={formData.contactMethod}
              options={CONTACT_METHODS}
              onChange={(e) => handleInputChange("contactMethod", e.value)}
              placeholder="Select contact method"
              className="w-full"
            />
          </div>

          {/* Estimated Duration */}
          <div className="col-12 md:col-6">
            <label className="block mb-2 font-semibold">
              Estimated Duration (minutes)
            </label>
            <InputNumber
              value={formData.estimatedDuration}
              onValueChange={(e) =>
                handleInputChange("estimatedDuration", e.value)
              }
              className="w-full"
              min={30}
              max={240}
              suffix=" min"
            />
          </div>

          {/* Settings */}
          <div className="col-12 mt-4">
            <h4>Settings & Preferences</h4>
            <Divider />
          </div>

          {/* Send Reminders */}
          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-2">
              <Checkbox
                checked={formData.sendReminders ?? false}
                onChange={(e) => handleInputChange("sendReminders", e.checked)}
              />
              <label className="font-semibold">Send Reminders</label>
            </div>
            <small className="text-600 block mt-1">
              Send automated reminders before the appointment
            </small>
          </div>

          {/* Recurring Schedule */}
          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-2 mb-2">
              <Checkbox
                checked={formData.isRecurring ?? false}
                onChange={(e) => handleInputChange("isRecurring", e.checked)}
              />
              <label className="font-semibold">Recurring Schedule</label>
            </div>
            {formData.isRecurring && (
              <Dropdown
                value={formData.recurringPattern}
                options={RECURRING_PATTERNS}
                onChange={(e) => handleInputChange("recurringPattern", e.value)}
                placeholder="Select pattern"
                className="w-full"
              />
            )}
          </div>

          {/* Special Instructions */}
          <div className="col-12">
            <label className="block mb-2 font-semibold">
              Special Instructions
            </label>
            <InputTextarea
              value={formData.specialInstructions}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              className="w-full"
              rows={3}
              placeholder="Any special instructions or requirements..."
            />
          </div>

          {/* Notes */}
          <div className="col-12">
            <label className="block mb-2 font-semibold">Notes</label>
            <InputTextarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {createMutation.isError && (
          <Message
            severity="error"
            text={extractErrorForToast(createMutation.error).detail}
            className="w-full mt-3"
          />
        )}
      </form>
    </Dialog>
  );
};

export default CreateScheduleForm;
