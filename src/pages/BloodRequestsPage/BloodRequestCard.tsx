// Card component for displaying blood request summary
import React from "react";
import { Link } from "react-router-dom";
import { Card } from "primereact/card";
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityTag = (priority: RequestPriority) => {
    switch (priority) {
      case RequestPriority.URGENT:
        return <Tag value="URGENT" severity="danger" />;
      case RequestPriority.HIGH:
        return <Tag value="HIGH" severity="warning" />;
      case RequestPriority.MEDIUM:
        return <Tag value="MEDIUM" severity="info" />;
      case RequestPriority.LOW:
        return <Tag value="LOW" severity="success" />;
      default:
        return <Tag value={priority} />;
    }
  };

  const getStatusTag = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return <Tag value="PENDING" severity="info" />;
      case RequestStatus.FULFILLED:
        return <Tag value="FULFILLED" severity="success" />;
      case RequestStatus.CANCELLED:
        return <Tag value="CANCELLED" severity="danger" />;
      case RequestStatus.EXPIRED:
        return <Tag value="EXPIRED" severity="danger" />;
      case RequestStatus.PARTIALLY_FULFILLED:
        return <Tag value="PARTIALLY FULFILLED" severity="warning" />;
      default:
        return <Tag value={status} />;
    }
  };

  const timeUntilRequired = bloodRequest.requiredBy ? (
    <span>
      Required by: {formatDate(bloodRequest.requiredBy)} (
      {formatDistanceToNow(new Date(bloodRequest.requiredBy), {
        addSuffix: true,
      })}
      )
    </span>
  ) : null;

  return (
    <Card
      className="mb-3 flex flex-column justify-between h-full"
      footer={
        <div className="flex justify-end mt-3">
          <Link to={`/blood-requests/${bloodRequest.id}`}>
            <Button label="View Details" icon="pi pi-search" className="sm" />
          </Link>
        </div>
      }
    >
      <div className="flex align-items-center justify-content-between mb-2">
        <div className="flex align-items-center">
          <span className="text-xl font-bold">
            {String(bloodRequest.bloodType)}
            {bloodRequest.RhFactor}
          </span>
          <span className="ml-3">{bloodRequest.unitsRequired} units</span>
        </div>
        <div className="flex gap-2">
          {getPriorityTag(bloodRequest.priority)}
          {getStatusTag(bloodRequest.status)}
        </div>
      </div>

      <div style={{ color: "#6b7280", fontSize: 14 }}>
        <div className="mb-2">
          <i className="pi pi-hospital mr-2"></i>
          {bloodRequest.institution.name}
        </div>
        <div className="mb-2">
          <i className="pi pi-calendar mr-2"></i>
          {timeUntilRequired}
        </div>
        {bloodRequest.patientCondition && (
          <div className="mb-2">
            <i className="pi pi-info-circle mr-2"></i>
            Condition: {bloodRequest.patientCondition}
          </div>
        )}
      </div>

      <div className="mt-2 text-500">
        <i className="pi pi-clock mr-2"></i>
        Created{" "}
        {formatDistanceToNow(new Date(bloodRequest.createdAt), {
          addSuffix: true,
        })}
      </div>
    </Card>
  );
};

export default BloodRequestCard;
