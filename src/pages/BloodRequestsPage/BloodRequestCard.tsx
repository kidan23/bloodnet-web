// Modern, compact card component for displaying blood request summary
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { formatDistanceToNow } from "date-fns";
import { type BloodRequest, RequestPriority, RequestStatus } from "./types";

interface BloodRequestCardProps {
  bloodRequest: BloodRequest;
}

const BloodRequestCard: React.FC<BloodRequestCardProps> = ({
  bloodRequest,
}) => {
  const getPriorityConfig = (priority: RequestPriority) => {
    switch (priority) {
      case RequestPriority.CRITICAL:
        return { 
          label: "CRITICAL", 
          severity: "danger" as const, 
          bgColor: "#fee2e2",
          borderColor: "#dc2626",
          icon: "pi pi-exclamation-triangle"
        };
      case RequestPriority.HIGH:
        return { 
          label: "HIGH", 
          severity: "warning" as const, 
          bgColor: "#fef3c7",
          borderColor: "#d97706",
          icon: "pi pi-exclamation-circle"
        };
      case RequestPriority.MEDIUM:
        return { 
          label: "MEDIUM", 
          severity: "info" as const, 
          bgColor: "#dbeafe",
          borderColor: "#2563eb",
          icon: "pi pi-info-circle"
        };
      case RequestPriority.LOW:
        return { 
          label: "LOW", 
          severity: "success" as const, 
          bgColor: "#dcfce7",
          borderColor: "#16a34a",
          icon: "pi pi-check-circle"
        };
      default:
        return { 
          label: priority, 
          severity: "info" as const, 
          bgColor: "#f3f4f6",
          borderColor: "#6b7280",
          icon: "pi pi-circle"
        };
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return { label: "PENDING", severity: "info" as const, icon: "pi pi-clock" };
      case RequestStatus.FULFILLED:
        return { label: "FULFILLED", severity: "success" as const, icon: "pi pi-check" };
      case RequestStatus.CANCELLED:
        return { label: "CANCELLED", severity: "danger" as const, icon: "pi pi-times" };
      case RequestStatus.EXPIRED:
        return { label: "EXPIRED", severity: "danger" as const, icon: "pi pi-calendar-times" };
      case RequestStatus.PARTIALLY_FULFILLED:
        return { label: "PARTIAL", severity: "warning" as const, icon: "pi pi-minus" };
      default:
        return { label: status, severity: "info" as const, icon: "pi pi-circle" };
    }
  };

  const priorityConfig = getPriorityConfig(bloodRequest.priority);
  const statusConfig = getStatusConfig(bloodRequest.status);
  
  const timeUntilRequired = bloodRequest.requiredBy ? 
    formatDistanceToNow(new Date(bloodRequest.requiredBy), { addSuffix: true }) : null;

  const isUrgent = bloodRequest.priority === RequestPriority.CRITICAL || 
                   bloodRequest.priority === RequestPriority.HIGH;

  return (
    <div 
      className="border-round-lg shadow-2 hover:shadow-4 transition-all transition-duration-200 cursor-pointer h-full"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: `2px solid ${priorityConfig.borderColor}`,
        borderLeft: `6px solid ${priorityConfig.borderColor}`,
        ...(isUrgent && {
          animation: "pulse 2s infinite",
          boxShadow: `0 0 0 1px ${priorityConfig.borderColor}20`
        })
      }}
    >
      {/* Header Section */}
      <div 
        className="p-3 border-bottom-1 border-200"
        style={{ backgroundColor: priorityConfig.bgColor }}
      >
        <div className="flex align-items-center justify-content-between">
          <div className="flex align-items-center gap-2">
            <div 
              className="flex align-items-center justify-content-center border-circle"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: priorityConfig.borderColor,
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold"
              }}
            >
              {String(bloodRequest.bloodType)}{bloodRequest.RhFactor}
            </div>
            <div>
              <div className="font-semibold text-lg">{bloodRequest.unitsRequired} units</div>
              <div className="text-sm text-600">needed</div>
            </div>
          </div>
          <div className="flex align-items-center gap-1">
            <i className={priorityConfig.icon} style={{ color: priorityConfig.borderColor }}></i>
            <Tag 
              value={priorityConfig.label} 
              severity={priorityConfig.severity}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3">
        <div className="flex align-items-start justify-content-between mb-3">
          <div className="flex-1">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-building text-primary" style={{ fontSize: "0.875rem" }}></i>
              <span className="text-sm font-medium text-900 line-height-3">
                {bloodRequest.institution.name}
              </span>
            </div>
            
            {timeUntilRequired && (
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-calendar text-orange-500" style={{ fontSize: "0.875rem" }}></i>
                <span className="text-sm text-700">
                  Required {timeUntilRequired}
                </span>
              </div>
            )}

            {bloodRequest.patientCondition && (
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-heart text-pink-500" style={{ fontSize: "0.875rem" }}></i>
                <span className="text-sm text-700 line-height-3">
                  {bloodRequest.patientCondition}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex align-items-center gap-1 ml-2">
            <i className={statusConfig.icon} style={{ fontSize: "0.75rem", color: "#6b7280" }}></i>
            <Tag 
              value={statusConfig.label} 
              severity={statusConfig.severity}
              className="text-xs"
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex align-items-center justify-content-between pt-2 border-top-1 border-200">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-clock text-400" style={{ fontSize: "0.75rem" }}></i>
            <span className="text-xs text-500">
              {formatDistanceToNow(new Date(bloodRequest.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <Link to={`/blood-requests/${bloodRequest._id}`} className="no-underline">
            <Button 
              label="View Details" 
              icon="pi pi-arrow-right" 
              iconPos="right"
              size="small"
              className="p-button-outlined p-button-sm"
              style={{ 
                fontSize: "0.75rem", 
                padding: "0.375rem 0.75rem",
                borderColor: priorityConfig.borderColor,
                color: priorityConfig.borderColor
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestCard;
