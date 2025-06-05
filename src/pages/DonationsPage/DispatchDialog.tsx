import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import type { Donation } from "./types";

type BloodUnit = Donation;

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contactPhone: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

interface DispatchDialogProps {
  visible: boolean;
  onHide: () => void;
  unit: BloodUnit | null;
  onDispatch: (unitId: string, hospitalId: string, notes?: string) => void;
  isLoading: boolean;
}

// Mock hospitals data - in a real app, this would come from an API
const mockHospitals: Hospital[] = [
  {
    _id: "60b8d295f1b2c8d4e8a12345",
    name: "City General Hospital",
    address: "123 Main St, Downtown",
    contactPhone: "+1-555-0123",
    urgencyLevel: "high",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12346",
    name: "Regional Medical Center",
    address: "456 Health Ave, Midtown",
    contactPhone: "+1-555-0124",
    urgencyLevel: "medium",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12347",
    name: "Emergency Care Hospital",
    address: "789 Emergency Blvd, Uptown",
    contactPhone: "+1-555-0125",
    urgencyLevel: "critical",
  },
  {
    _id: "60b8d295f1b2c8d4e8a12348",
    name: "Community Health Center",
    address: "321 Community Dr, Suburb",
    contactPhone: "+1-555-0126",
    urgencyLevel: "low",
  },
];

const DispatchDialog: React.FC<DispatchDialogProps> = ({
  visible,
  onHide,
  unit,
  onDispatch,
  isLoading,
}) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [notes, setNotes] = useState("");

  const handleDispatch = () => {
    if (!unit || !selectedHospital) return;
    onDispatch(unit._id, selectedHospital._id, notes);
    handleClose();
  };

  const handleClose = () => {
    setSelectedHospital(null);
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

  const hospitalOptionTemplate = (option: Hospital) => {
    return (
      <div className="flex align-items-center justify-content-between w-full">
        <div className="flex-1">
          <div className="font-medium">{option.name}</div>
          <div className="text-sm text-500">{option.address}</div>
          <div className="text-sm text-500">{option.contactPhone}</div>
        </div>
        <Badge
          value={option.urgencyLevel.toUpperCase()}
          severity={getUrgencySeverity(option.urgencyLevel)}
        />
      </div>
    );
  };

  const selectedHospitalTemplate = (option: Hospital) => {
    if (!option) return "Select Hospital";
    return (
      <div className="flex align-items-center">
        <span className="mr-2">{option.name}</span>
        <Badge
          value={option.urgencyLevel.toUpperCase()}
          severity={getUrgencySeverity(option.urgencyLevel)}
        />
      </div>
    );
  };

  const headerContent = (
    <div className="flex align-items-center">
      <i className="pi pi-truck mr-2"></i>
      Dispatch Blood Unit
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
        label="Dispatch"
        icon="pi pi-truck"
        onClick={handleDispatch}
        disabled={!selectedHospital || isLoading}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      style={{ width: "50vw", minWidth: "400px" }}
      footer={footerContent}
      onHide={handleClose}
      modal
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
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

          {/* Hospital Selection */}
          <div className="mb-4">
            <label className="block text-900 font-medium mb-2">
              Select Medical Institution *
            </label>
            <Dropdown
              value={selectedHospital}
              options={mockHospitals}
              onChange={(e) => setSelectedHospital(e.value)}
              optionLabel="name"
              placeholder="Choose a hospital..."
              className="w-full"
              itemTemplate={hospitalOptionTemplate}
              valueTemplate={selectedHospitalTemplate}
              filter
              filterBy="name,address"
              emptyMessage="No hospitals found"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-900 font-medium mb-2">
              Dispatch Notes (Optional)
            </label>
            <InputTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter any special instructions or notes for the dispatch..."
              className="w-full"
              maxLength={500}
            />
            <small className="text-500">{notes.length}/500 characters</small>
          </div>

          {/* Selected Hospital Details */}
          {selectedHospital && (
            <Card className="bg-blue-50 border-1 border-blue-200">
              <h6 className="mb-3">Dispatch Summary</h6>
              <div className="grid">
                <div className="col-12 md:col-8">
                  <div className="flex justify-content-between mb-2">
                    <span className="font-semibold">Hospital:</span>
                    <span>{selectedHospital.name}</span>
                  </div>
                  <div className="flex justify-content-between mb-2">
                    <span className="font-semibold">Address:</span>
                    <span>{selectedHospital.address}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Contact:</span>
                    <span>{selectedHospital.contactPhone}</span>
                  </div>
                </div>
                <div className="col-12 md:col-4 flex align-items-center justify-content-center">
                  <div className="text-center">
                    <div className="text-sm text-500 mb-1">Priority Level</div>
                    <Badge
                      value={selectedHospital.urgencyLevel.toUpperCase()}
                      severity={getUrgencySeverity(selectedHospital.urgencyLevel)}
                      className="text-lg"
                    />
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

export default DispatchDialog;
