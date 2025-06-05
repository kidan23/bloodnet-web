import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import type { BloodUnit } from "./types";

interface BloodRequest {
  _id: string;
  requestId: string;
  bloodType: string;
  unitsRequired: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  medicalInstitution: {
    name: string;
    address: string;
  };
  patientCondition: string;
  requestDate: string;
  requiredBy: string;
  status: "pending" | "partial" | "fulfilled";
}

interface ReserveDialogProps {
  visible: boolean;
  onHide: () => void;
  unit: BloodUnit | null;
  onReserve: (unitId: string, requestId: string, notes?: string) => void;
  isLoading: boolean;
}

// Mock blood requests data - in a real app, this would come from an API
const mockBloodRequests: BloodRequest[] = [
  {
    _id: "60b8d295f1b2c8d4e8a12346",
    requestId: "REQ-2025-001",
    bloodType: "O+",
    unitsRequired: 3,
    urgencyLevel: "critical",
    medicalInstitution: {
      name: "Emergency Care Hospital",
      address: "789 Emergency Blvd, Uptown",
    },
    patientCondition: "Severe blood loss from trauma",
    requestDate: "2025-06-04T08:30:00Z",
    requiredBy: "2025-06-04T18:00:00Z",
    status: "pending",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12347",
    requestId: "REQ-2025-002",
    bloodType: "A+",
    unitsRequired: 2,
    urgencyLevel: "high",
    medicalInstitution: {
      name: "City General Hospital",
      address: "123 Main St, Downtown",
    },
    patientCondition: "Surgical procedure",
    requestDate: "2025-06-04T10:15:00Z",
    requiredBy: "2025-06-05T09:00:00Z",
    status: "partial",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12348",
    requestId: "REQ-2025-003",
    bloodType: "B-",
    unitsRequired: 1,
    urgencyLevel: "medium",
    medicalInstitution: {
      name: "Regional Medical Center",
      address: "456 Health Ave, Midtown",
    },
    patientCondition: "Elective surgery",
    requestDate: "2025-06-04T14:20:00Z",
    requiredBy: "2025-06-06T12:00:00Z",
    status: "pending",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12349",
    requestId: "REQ-2025-004",
    bloodType: "AB+",
    unitsRequired: 1,
    urgencyLevel: "low",
    medicalInstitution: {
      name: "Community Health Center",
      address: "321 Community Dr, Suburb",
    },
    patientCondition: "Routine transfusion",
    requestDate: "2025-06-04T16:45:00Z",
    requiredBy: "2025-06-07T15:00:00Z",
    status: "pending",
  },
];

const ReserveDialog: React.FC<ReserveDialogProps> = ({
  visible,
  onHide,
  unit,
  onReserve,
  isLoading,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [notes, setNotes] = useState("");

  const handleReserve = () => {
    if (!unit || !selectedRequest) return;
    onReserve(unit._id, selectedRequest._id, notes);
    handleClose();
  };

  const handleClose = () => {
    setSelectedRequest(null);
    setNotes("");
    onHide();
  };

  const getUrgencySeverity = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "info";
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "partial":
        return "info";
      case "fulfilled":
        return "success";
      default:
        return "secondary";
    }
  };

  // Filter requests that match the unit's blood type and are compatible
  const compatibleRequests = mockBloodRequests.filter((request) => {
    // Simple blood type compatibility check (in real app, this would be more sophisticated)
    if (unit?.bloodType === "O-") return true; // Universal donor
    if (unit?.bloodType === request.bloodType) return true;
    if (unit?.bloodType === "O+" && ["A+", "B+", "AB+", "O+"].includes(request.bloodType)) return true;
    if (unit?.bloodType === "A-" && ["A+", "A-", "AB+", "AB-"].includes(request.bloodType)) return true;
    if (unit?.bloodType === "B-" && ["B+", "B-", "AB+", "AB-"].includes(request.bloodType)) return true;
    // Add more compatibility rules as needed
    return false;
  });

  const requestOptionTemplate = (option: BloodRequest) => {
    const timeUntilRequired = new Date(option.requiredBy).getTime() - new Date().getTime();
    const hoursUntilRequired = Math.ceil(timeUntilRequired / (1000 * 60 * 60));

    return (
      <div className="flex align-items-center justify-content-between w-full p-2">
        <div className="flex-1">
          <div className="flex align-items-center gap-2 mb-1">
            <span className="font-medium">{option.requestId}</span>
            <Badge value={option.bloodType} severity="info" />
            <Badge
              value={option.urgencyLevel.toUpperCase()}
              severity={getUrgencySeverity(option.urgencyLevel)}
            />
            <Tag
              value={option.status.toUpperCase()}
              severity={getStatusSeverity(option.status)}
            />
          </div>
          <div className="text-sm text-500 mb-1">{option.medicalInstitution.name}</div>
          <div className="text-sm text-500">{option.patientCondition}</div>
          <div className="text-xs text-orange-500 mt-1">
            Required in {hoursUntilRequired > 0 ? `${hoursUntilRequired} hours` : "OVERDUE"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{option.unitsRequired} units</div>
        </div>
      </div>
    );
  };

  const selectedRequestTemplate = (option: BloodRequest) => {
    if (!option) return "Select Blood Request";
    return (
      <div className="flex align-items-center gap-2">
        <span>{option.requestId}</span>
        <Badge value={option.bloodType} severity="info" />
        <Badge
          value={option.urgencyLevel.toUpperCase()}
          severity={getUrgencySeverity(option.urgencyLevel)}
        />
      </div>
    );
  };

  const headerContent = (
    <div className="flex align-items-center">
      <i className="pi pi-bookmark mr-2"></i>
      Reserve Blood Unit
    </div>
  );

  const footerContent = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={handleClose}
        className="p-button-text"
        disabled={isLoading}
      />
      <Button
        label="Reserve"
        icon="pi pi-bookmark"
        onClick={handleReserve}
        disabled={!selectedRequest || isLoading}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      style={{ width: "60vw", minWidth: "500px" }}
      footer={footerContent}
      onHide={handleClose}
      modal
      breakpoints={{ "960px": "80vw", "641px": "95vw" }}
    >
      {unit && (
        <div>
          {/* Unit Information */}
          <Card className="mb-4">
            <h5>Unit Details</h5>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="flex justify-content-between mb-2">
                  <span className="font-semibold">Unit ID:</span>
                  <span>{unit._id.slice(-8)}</span>
                </div>
                <div className="flex justify-content-between mb-2">
                  <span className="font-semibold">Blood Type:</span>
                  <Badge value={unit.bloodType} severity="info" />
                </div>
                <div className="flex justify-content-between">
                  <span className="font-semibold">Donation Type:</span>
                  <span>{unit.donationType?.replace("_", " ").toUpperCase()}</span>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="flex justify-content-between mb-2">
                  <span className="font-semibold">Collection Date:</span>
                  <span>{new Date(unit.donationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-content-between mb-2">
                  <span className="font-semibold">Expiry Date:</span>
                  <span>{unit.expiryDate ? new Date(unit.expiryDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-content-between">
                  <span className="font-semibold">Blood Bank:</span>
                  <span>{unit.bloodBank.name}</span>
                </div>
              </div>
            </div>
          </Card>

          <Divider />

          {/* Request Selection */}
          <div className="mb-4">
            <label className="block text-900 font-medium mb-2">
              Select Blood Request *
            </label>
            {compatibleRequests.length > 0 ? (
              <Dropdown
                value={selectedRequest}
                options={compatibleRequests}
                onChange={(e) => setSelectedRequest(e.value)}
                optionLabel="requestId"
                placeholder="Choose a blood request..."
                className="w-full"
                itemTemplate={requestOptionTemplate}
                valueTemplate={selectedRequestTemplate}
                filter
                filterBy="requestId,medicalInstitution.name,patientCondition"
                emptyMessage="No compatible requests found"
                virtualScrollerOptions={{ itemSize: 80 }}
              />
            ) : (
              <div className="p-3 border-1 border-round text-center surface-border">
                <i className="pi pi-info-circle text-2xl text-500 mb-2"></i>
                <p className="text-500 m-0">No compatible blood requests found for {unit.bloodType} blood type.</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-900 font-medium mb-2">
              Reservation Notes (Optional)
            </label>
            <InputTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter any special notes about this reservation..."
              className="w-full"
              maxLength={500}
            />
            <small className="text-500">{notes.length}/500 characters</small>
          </div>

          {/* Selected Request Details */}
          {selectedRequest && (
            <Card className="bg-blue-50 border-1 border-blue-200">
              <h6 className="mb-3">Reservation Summary</h6>
              <div className="grid">
                <div className="col-12 md:col-8">
                  <div className="flex justify-content-between mb-2">
                    <span className="font-semibold">Request ID:</span>
                    <span>{selectedRequest.requestId}</span>
                  </div>
                  <div className="flex justify-content-between mb-2">
                    <span className="font-semibold">Medical Institution:</span>
                    <span>{selectedRequest.medicalInstitution.name}</span>
                  </div>
                  <div className="flex justify-content-between mb-2">
                    <span className="font-semibold">Patient Condition:</span>
                    <span>{selectedRequest.patientCondition}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Required By:</span>
                    <span>{new Date(selectedRequest.requiredBy).toLocaleString()}</span>
                  </div>
                </div>
                <div className="col-12 md:col-4 flex align-items-center justify-content-center">
                  <div className="text-center">
                    <div className="text-sm text-500 mb-1">Priority Level</div>
                    <Badge
                      value={selectedRequest.urgencyLevel.toUpperCase()}
                      severity={getUrgencySeverity(selectedRequest.urgencyLevel)}
                      className="text-lg"
                    />
                    <div className="text-sm text-500 mt-2">Units Required</div>
                    <div className="text-xl font-bold">{selectedRequest.unitsRequired}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default ReserveDialog;
