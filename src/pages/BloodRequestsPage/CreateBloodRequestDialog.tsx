// Dialog for creating a new blood request
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputNumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { useCreateBloodRequest } from "../../state/bloodRequests";
import { type CreateBloodRequestDto, RequestPriority, BloodTypeEnum } from "./types";
import { useGlobalToast } from "../../components/layout/ToastContext";
import type { CheckboxChangeEvent } from "primereact/checkbox";

import api from "../../state/api";
import LocationPicker from "./LocationPicker";

interface CreateBloodRequestDialogProps {
  visible: boolean;
  onHide: () => void;
}

const CreateBloodRequestDialog: React.FC<CreateBloodRequestDialogProps> = ({
  visible,
  onHide,
}) => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const createMutation = useCreateBloodRequest();
  const toast = useGlobalToast();

  const [formData, setFormData] = useState<Partial<CreateBloodRequestDto>>({
    priority: RequestPriority.MEDIUM,
    coordinates: [0, 0],
    notifyNearbyDonors: true,
    notificationRadius: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch institutions when dialog is opened
  useEffect(() => {
    if (visible) {
      fetchInstitutions();
    }
  }, [visible]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/medical-institutions");
      setInstitutions(data.results || []);
    } catch (error) {
      console.error("Failed to fetch institutions:", error);
      // Mock data for demo purposes
      setInstitutions([
        { id: "1", name: "City General Hospital" },
        { id: "2", name: "Memorial Medical Center" },
        { id: "3", name: "University Health System" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (
    e: { value: number | null | undefined },
    field: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.value ?? null }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (e: { value: Date | null }, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: e.value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDropdownChange = (e: { value: any }, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: e.value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: CheckboxChangeEvent, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: e.checked ?? false }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.institution) {
      newErrors.institution = "Institution is required";
    }

    if (!formData.bloodType) {
      newErrors.bloodType = "Blood type is required";
    }

    if (!formData.RhFactor) {
      newErrors.RhFactor = "Rh factor is required";
    }

    if (!formData.unitsRequired || formData.unitsRequired <= 0) {
      newErrors.unitsRequired = "Units required must be a positive number";
    }

    if (!formData.requiredBy) {
      newErrors.requiredBy = "Required by date is required";
    } else if (formData.requiredBy < new Date()) {
      newErrors.requiredBy = "Required by date must be in the future";
    }

    if (
      !formData.coordinates ||
      !formData.coordinates[0] ||
      !formData.coordinates[1]
    ) {
      newErrors.coordinates = "Location coordinates are required";
    }

    if (
      formData.notifyNearbyDonors &&
      (!formData.notificationRadius || formData.notificationRadius <= 0)
    ) {
      newErrors.notificationRadius =
        "Notification radius must be a positive number when notification is enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please correct the errors in the form",
        life: 3000,
      });
      return;
    }

    try {
      await createMutation.mutateAsync(formData as CreateBloodRequestDto);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Blood request created successfully",
        life: 3000,
      });
      resetForm();
      onHide();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create blood request",
        life: 3000,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      priority: RequestPriority.MEDIUM,
      coordinates: [0, 0],
      notifyNearbyDonors: true,
      notificationRadius: 10,
    });
    setErrors({});
  };

  const bloodTypeOptions = Object.values(BloodTypeEnum).map((type) => ({
    label: type,
    value: type,
  }));

  const rhFactorOptions = [
    { label: "+", value: "+" },
    { label: "-", value: "-" },
  ];

  const priorityOptions = Object.values(RequestPriority).map((priority) => ({
    label: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: priority,
  }));

  const institutionOptions = institutions.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  return (
    <Dialog
      header="Create New Blood Request"
      visible={visible}
      onHide={() => {
        resetForm();
        onHide();
      }}
      style={{ width: "80vw", maxWidth: "900px" }}
      modal
      className="p-fluid"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div className="col-12 field">
            <label htmlFor="institution">Medical Institution*</label>
            <Dropdown
              id="institution"
              name="institution"
              value={formData.institution}
              options={institutionOptions}
              onChange={(e) => handleDropdownChange(e, "institution")}
              placeholder="Select a medical institution"
              className={errors.institution ? "p-invalid" : ""}
              disabled={loading}
              filter
            />
            {errors.institution && (
              <small className="p-error">{errors.institution}</small>
            )}
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="bloodType">Blood Type*</label>
            <Dropdown
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              options={bloodTypeOptions}
              onChange={(e) => handleDropdownChange(e, "bloodType")}
              placeholder="Select blood type"
              className={errors.bloodType ? "p-invalid" : ""}
            />
            {errors.bloodType && (
              <small className="p-error">{errors.bloodType}</small>
            )}
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="RhFactor">Rh Factor*</label>
            <Dropdown
              id="RhFactor"
              name="RhFactor"
              value={formData.RhFactor}
              options={rhFactorOptions}
              onChange={(e) => handleDropdownChange(e, "RhFactor")}
              placeholder="Select Rh factor"
              className={errors.RhFactor ? "p-invalid" : ""}
            />
            {errors.RhFactor && (
              <small className="p-error">{errors.RhFactor}</small>
            )}
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="unitsRequired">Units Required*</label>
            <InputNumber
              id="unitsRequired"
              value={formData.unitsRequired}
              onValueChange={(e) => handleNumberChange(e, "unitsRequired")}
              min={1}
              showButtons
              className={errors.unitsRequired ? "p-invalid" : ""}
            />
            {errors.unitsRequired && (
              <small className="p-error">{errors.unitsRequired}</small>
            )}
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="priority">Priority</label>
            <Dropdown
              id="priority"
              name="priority"
              value={formData.priority}
              options={priorityOptions}
              onChange={(e) => handleDropdownChange(e, "priority")}
              placeholder="Select priority"
            />
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="requiredBy">Required By*</label>
            <Calendar
              id="requiredBy"
              value={formData.requiredBy}
              onChange={(e) =>
                handleDateChange({ value: e.value ?? null }, "requiredBy")
              }
              showIcon
              dateFormat="yy-mm-dd"
              minDate={new Date()}
              className={errors.requiredBy ? "p-invalid" : ""}
            />
            {errors.requiredBy && (
              <small className="p-error">{errors.requiredBy}</small>
            )}
          </div>
          <div className="col-12 field">
            <label htmlFor="coordinates">Location*</label>
            <LocationPicker
              coordinates={formData.coordinates || [0, 0]}
              onChange={(coords) => {
                setFormData((prev) => ({ ...prev, coordinates: coords }));
                if (errors.coordinates) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.coordinates;
                    return newErrors;
                  });
                }
              }}
              error={errors.coordinates}
            />
          </div>

          <div className="col-12 field">
            <label htmlFor="patientCondition">Patient Condition</label>
            <InputText
              id="patientCondition"
              name="patientCondition"
              value={formData.patientCondition || ""}
              onChange={handleInputChange}
              placeholder="Describe the patient's condition"
            />
          </div>

          <div className="col-12 field">
            <label htmlFor="notes">Additional Notes</label>
            <InputTextarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional information or requirements"
            />
          </div>

          <div className="col-12 field-checkbox">
            <Checkbox
              inputId="notifyNearbyDonors"
              checked={formData.notifyNearbyDonors as boolean}
              onChange={(e) => handleCheckboxChange(e, "notifyNearbyDonors")}
            />
            <label htmlFor="notifyNearbyDonors" className="ml-2">
              Notify nearby donors
            </label>
          </div>

          {formData.notifyNearbyDonors && (
            <div className="col-12 md:col-6 field">
              <label htmlFor="notificationRadius">
                Notification Radius (km)*
              </label>
              <InputNumber
                id="notificationRadius"
                value={formData.notificationRadius}
                onValueChange={(e) =>
                  handleNumberChange(e, "notificationRadius")
                }
                min={1}
                max={100}
                showButtons
                className={errors.notificationRadius ? "p-invalid" : ""}
              />
              {errors.notificationRadius && (
                <small className="p-error">{errors.notificationRadius}</small>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              resetForm();
              onHide();
            }}
          />
          <Button
            type="submit"
            label={createMutation.isPending ? "Creating..." : "Create Request"}
            icon="pi pi-check"
            disabled={createMutation.isPending}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default CreateBloodRequestDialog;
