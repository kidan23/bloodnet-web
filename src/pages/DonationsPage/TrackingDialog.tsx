import React from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { Skeleton } from "primereact/skeleton";
import type { Donation } from "./types";
import type { TrackingDataResponse } from "../../state/bloodInventory";

// Extended interface for tracking data that includes additional fields from backend
interface TrackingDialogProps {
  visible: boolean;
  onHide: () => void;
  unitId: string;
  unit: Donation | null;
  trackingData?: TrackingDataResponse;
  isLoading: boolean;
}

const TrackingDialog: React.FC<TrackingDialogProps> = ({
  visible,
  onHide,
  unitId,
  trackingData,
  isLoading,
}) => {
  const getStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
        return "info";
      case "tested":
        return "success";
      case "processed":
        return "warning";
      case "in_inventory":
        return "info";
      case "reserved":
        return "warning";
      case "dispatched":
        return "info";
      case "used":
        return "success";
      case "expired":
        return "danger";
      case "discarded":
        return "danger";
      default:
        return "info";
    }  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
        return "#2196F3";
      case "tested":
        return "#4CAF50";
      case "processed":
        return "#FF9800";
      case "in_inventory":
        return "#2196F3";
      case "reserved":
        return "#FF9800";
      case "dispatched":
        return "#2196F3";
      case "used":
        return "#4CAF50";
      case "expired":
        return "#F44336";
      case "discarded":
        return "#F44336";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
        return "pi pi-heart";
      case "tested":
        return "pi pi-verified";
      case "processed":
        return "pi pi-cog";
      case "in_inventory":
        return "pi pi-database";
      case "reserved":
        return "pi pi-bookmark";
      case "dispatched":
        return "pi pi-truck";
      case "used":
        return "pi pi-check";
      case "expired":
        return "pi pi-clock";
      case "discarded":
        return "pi pi-trash";
      default:
        return "pi pi-circle";
    }  };

  const renderSkeletonContent = () => (
    <div className="p-3">
      <div className="flex align-items-center mb-3">
        <Skeleton shape="circle" size="2rem" className="mr-3"></Skeleton>
        <div className="flex-1">
          <Skeleton width="100%" height="1rem" className="mb-2"></Skeleton>
          <Skeleton width="60%" height="0.8rem"></Skeleton>
        </div>
      </div>
      <div className="flex align-items-center mb-3">
        <Skeleton shape="circle" size="2rem" className="mr-3"></Skeleton>
        <div className="flex-1">
          <Skeleton width="100%" height="1rem" className="mb-2"></Skeleton>
          <Skeleton width="80%" height="0.8rem"></Skeleton>
        </div>
      </div>
      <div className="flex align-items-center">
        <Skeleton shape="circle" size="2rem" className="mr-3"></Skeleton>
        <div className="flex-1">
          <Skeleton width="100%" height="1rem" className="mb-2"></Skeleton>
          <Skeleton width="40%" height="0.8rem"></Skeleton>
        </div>
      </div>
    </div>
  );

  const headerContent = (
    <div className="flex align-items-center">
      <i className="pi pi-eye mr-2"></i>
      Blood Unit Tracking - {unitId}
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      style={{ width: "50vw", minWidth: "400px" }}
      onHide={onHide}
      modal
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >      {isLoading ? (
        renderSkeletonContent()
      ) : trackingData ? (
        <div>
          <div className="grid mb-4">
            <div className="col-12 md:col-6">
              <Card className="h-full">
                <h5>Unit Information</h5>
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Blood Type:</span>
                    <span>{trackingData.bloodType || "N/A"}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Donation Type:</span>
                    <span>{trackingData.donationType?.replace("_", " ").toUpperCase() || "N/A"}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Current Status:</span>
                    <Chip
                      label={trackingData.unitStatus?.replace("_", " ").toUpperCase() || "N/A"}
                      className={`p-chip-${getStatusSeverity(trackingData.unitStatus || "")}`}
                    />
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Expiry Date:</span>
                    <span>{trackingData.expiryDate ? new Date(trackingData.expiryDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Days Until Expiry:</span>
                    <span className={trackingData.isExpired ? "text-red-500" : ""}>
                      {trackingData.isExpired ? "Expired" : `${trackingData.daysUntilExpiry || 0} days`}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-6">
              <Card className="h-full">
                <h5>Location & Details</h5>
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Blood Bank:</span>
                    <span>{trackingData.bloodBank?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="font-semibold">Donation Date:</span>
                    <span>{trackingData.donationDate ? new Date(trackingData.donationDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  {trackingData.donor && (
                    <div className="flex justify-content-between">
                      <span className="font-semibold">Donor:</span>
                      <span>{`${trackingData.donor.firstName} ${trackingData.donor.lastName}`}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <h5>Current Status</h5>
            <div className="text-center p-4">
              <div className="flex justify-content-center align-items-center mb-3">
                <span
                  className="flex w-3rem h-3rem align-items-center justify-content-center text-white border-circle shadow-1"
                  style={{ backgroundColor: getStatusColor(trackingData.unitStatus || "") }}
                >
                  <i className={`${getStatusIcon(trackingData.unitStatus || "")} text-xl`}></i>
                </span>
              </div>
              <h6 className="mb-2">{trackingData.unitStatus?.replace("_", " ").toUpperCase()}</h6>
              <p className="text-color-secondary m-0">
                This blood unit is currently {trackingData.unitStatus?.replace("_", " ")} 
                {trackingData.bloodBank?.name && ` at ${trackingData.bloodBank.name}`}
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center p-4">
          <i className="pi pi-info-circle text-4xl text-color-secondary mb-3"></i>
          <p className="text-color-secondary">No tracking information available for this unit.</p>
        </div>
      )}
    </Dialog>
  );
};

export default TrackingDialog;
