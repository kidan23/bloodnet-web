// Edit form for updating a blood request
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputNumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import {
  useBloodRequest,
  useUpdateBloodRequest,
} from "../../state/bloodRequests";
import { extractErrorForToast } from "../../utils/errorHandling";
import {
  type UpdateBloodRequestDto,
  RequestPriority,
  RequestStatus,
  BloodTypeEnum,
} from "./types";
import { useGlobalToast } from "../../components/layout/ToastContext";
import api from "../../state/api";
import LocationPicker from "./LocationPicker";
  import type { CheckboxChangeEvent } from "primereact/checkbox";


const EditBloodRequestForm: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useGlobalToast();

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateBloodRequestDto>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: bloodRequest,
    isLoading: isLoadingRequest,
    isError,
    error,
  } = useBloodRequest(id);

  const updateMutation = useUpdateBloodRequest();

  // Fetch institutions when component mounts
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Set form data when blood request is loaded
  useEffect(() => {
    if (bloodRequest) {
      setFormData({
        institution: bloodRequest.institution.id,
        bloodType: bloodRequest.bloodType,
        RhFactor: bloodRequest.RhFactor,
        unitsRequired: bloodRequest.unitsRequired,
        priority: bloodRequest.priority,
        requiredBy: new Date(bloodRequest.requiredBy),
        patientCondition: bloodRequest.patientCondition,
        notes: bloodRequest.notes,
        coordinates: bloodRequest.coordinates,
        notifyNearbyDonors: bloodRequest.notifyNearbyDonors,
        notificationRadius: bloodRequest.notificationRadius,
        status: bloodRequest.status,
      });
    }
  }, [bloodRequest]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/medical-institutions");
      setInstitutions(data.results || []);    } catch (error) {
      console.error("Failed to fetch institutions:", error);
      
      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
      
      // Mock data for demo purposes
      setInstitutions([
        { id: "1", name: "City General Hospital" },
        { id: "2", name: "Memorial Medical Center" },
        { id: "3", name: "University Health System" },
      ]);
    }finally {
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

  const handleNumberChange = (e: { value: number | null | undefined }, field: string) => {
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

  
  const handleCheckboxChange = (
      e: CheckboxChangeEvent,
      field: string
    ) => {
      setFormData((prev) => ({ ...prev, [field]: !!e.checked }));
    };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.unitsRequired !== undefined && formData.unitsRequired <= 0) {
      newErrors.unitsRequired = "Units required must be a positive number";
    }

    if (formData.requiredBy && formData.requiredBy < new Date()) {
      newErrors.requiredBy = "Required by date must be in the future";
    }

    if (
      formData.coordinates &&
      formData.coordinates[0] === 0 &&
      formData.coordinates[1] === 0
    ) {
      newErrors.coordinates = "Please select a valid location";
    }

    if (
      formData.notifyNearbyDonors &&
      formData.notificationRadius !== undefined &&
      formData.notificationRadius <= 0
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
      await updateMutation.mutateAsync({ id, data: formData });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Blood request updated successfully",
        life: 3000,      });
      navigate(`/blood-requests/${id}`);
    } catch (error) {
      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };

  if (isLoadingRequest) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight: 120 }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "1.5rem" }}></i>
        <span className="ml-2">Loading blood request...</span>
      </div>
    );
  }

  if (isError || !bloodRequest) {
    return (
      <div className="text-danger">
        Error loading blood request:{" "}
        {(error as Error)?.message || "Blood request not found"}
        <div className="mt-3">
          <Link to="/blood-requests" className="text-primary underline-hover">
            Back to Blood Requests
          </Link>
        </div>
      </div>
    );
  }

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

  const statusOptions = Object.values(RequestStatus).map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
    value: status,
  }));

  const institutionOptions = institutions.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  return (
    <div className="p-4">
      <div className="mb-3">
        <Link
          to={`/blood-requests/${id}`}
          className="text-primary underline-hover"
        >
          &larr; Back to Blood Request Details
        </Link>
      </div>

      <Card title="Edit Blood Request">
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="grid">
            <div className="col-12 field">
              <label htmlFor="institution">Medical Institution</label>
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
              <label htmlFor="bloodType">Blood Type</label>
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
              <label htmlFor="RhFactor">Rh Factor</label>
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
              <label htmlFor="unitsRequired">Units Required</label>
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
              <label htmlFor="requiredBy">Required By</label>
              <Calendar
                id="requiredBy"
                value={formData.requiredBy}
                onChange={(e) => handleDateChange({ value: e.value ?? null }, "requiredBy")}
                showIcon
                dateFormat="yy-mm-dd"
                minDate={new Date()}
                className={errors.requiredBy ? "p-invalid" : ""}
              />
              {errors.requiredBy && (
                <small className="p-error">{errors.requiredBy}</small>
              )}
            </div>

            <div className="col-12 md:col-6 field">
              <label htmlFor="status">Status</label>
              <Dropdown
                id="status"
                name="status"
                value={formData.status}
                options={statusOptions}
                onChange={(e) => handleDropdownChange(e, "status")}
                placeholder="Select status"
              />
            </div>

            <div className="col-12 field">
              <label htmlFor="coordinates">Location</label>
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
                  Notification Radius (km)
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
              onClick={() => navigate(`/blood-requests/${id}`)}
            />
            <Button
              type="submit"
              label={
                updateMutation.isPending ? "Updating..." : "Update Request"
              }
              icon="pi pi-check"
              disabled={updateMutation.isPending}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBloodRequestForm;
