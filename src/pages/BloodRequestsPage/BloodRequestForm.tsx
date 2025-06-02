// Reusable form component for blood request creation and editing
import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import {
  type CreateBloodRequestDto,
  RequestPriority,
  RequestStatus,
  type UpdateBloodRequestDto,
} from "./types";
import { InteractiveMap } from "../../components/map";

interface BloodType {
  label: string;
  value: string;
}

interface BloodRequestFormProps {
  formData: Partial<CreateBloodRequestDto | UpdateBloodRequestDto>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  institutions: { id: string; name: string }[];
  showStatus?: boolean;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({
  formData,
  onChange,
  errors,
  institutions,
  showStatus = false,
}) => {
  const bloodTypeOptions: BloodType[] = [
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "AB", value: "AB" },
    { label: "O", value: "O" },
  ];

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
    <div className="grid">
      <div className="col-12 field">
        <label htmlFor="institution">Medical Institution*</label>
        <Dropdown
          id="institution"
          name="institution"
          value={formData.institution}
          options={institutionOptions}
          onChange={(e) => onChange("institution", e.value)}
          placeholder="Select a medical institution"
          className={errors.institution ? "p-invalid" : ""}
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
          onChange={(e) => onChange("bloodType", e.value)}
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
          onChange={(e) => onChange("RhFactor", e.value)}
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
          onValueChange={(e) => onChange("unitsRequired", e.value)}
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
          onChange={(e) => onChange("priority", e.value)}
          placeholder="Select priority"
        />
      </div>

      <div className="col-12 md:col-6 field">
        <label htmlFor="requiredBy">Required By*</label>
        <Calendar
          id="requiredBy"
          value={formData.requiredBy}
          onChange={(e) => onChange("requiredBy", e.value)}
          showIcon
          dateFormat="yy-mm-dd"
          minDate={new Date()}
          className={errors.requiredBy ? "p-invalid" : ""}
        />
        {errors.requiredBy && (
          <small className="p-error">{errors.requiredBy}</small>
        )}
      </div>

      {showStatus && (
        <div className="col-12 md:col-6 field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={(formData as UpdateBloodRequestDto).status}
            options={statusOptions}
            onChange={(e) => onChange("status", e.value)}
            placeholder="Select status"
          />
        </div>
      )}

      <div className="col-12 field">
        <label htmlFor="coordinates">Location*</label>
        <InteractiveMap
          initialMarkerPosition={formData.coordinates ? { lat: formData.coordinates[0], lng: formData.coordinates[1] } : undefined}
          onLocationChange={(loc) => onChange("coordinates", [loc.lat, loc.lng])}
          height="300px"
          width="100%"
          showHints={true}
          showCoordinatesDisplay={true}
          draggableMarker={true}
          showLocationButton={true}
          showResetButton={true}
          className={errors.coordinates ? "p-invalid" : ""}
        />
        {errors.coordinates && (
          <small className="p-error">{errors.coordinates}</small>
        )}
      </div>

      <div className="col-12 field">
        <label htmlFor="patientCondition">Patient Condition</label>
        <InputText
          id="patientCondition"
          name="patientCondition"
          value={formData.patientCondition || ""}
          onChange={(e) => onChange("patientCondition", e.target.value)}
          placeholder="Describe the patient's condition"
        />
      </div>

      <div className="col-12 field">
        <label htmlFor="notes">Additional Notes</label>
        <InputTextarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          placeholder="Any additional information or requirements"
        />
      </div>

      <div className="col-12 field-checkbox">
        <Checkbox
          inputId="notifyNearbyDonors"
          checked={!!formData.notifyNearbyDonors}
          onChange={(e) => onChange("notifyNearbyDonors", e.checked)}
        />
        <label htmlFor="notifyNearbyDonors" className="ml-2">
          Notify nearby donors
        </label>
      </div>

      {formData.notifyNearbyDonors && (
        <div className="col-12 md:col-6 field">
          <label htmlFor="notificationRadius">Notification Radius (km)*</label>
          <InputNumber
            id="notificationRadius"
            value={formData.notificationRadius}
            onValueChange={(e) => onChange("notificationRadius", e.value)}
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
  );
};

export default BloodRequestForm;
