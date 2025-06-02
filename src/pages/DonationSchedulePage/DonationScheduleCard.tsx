// Card component for displaying individual donation schedule

import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Avatar } from "primereact/avatar";
import { useNavigate } from "react-router-dom";
import type { DonationSchedule } from "./types";
import { ScheduleStatus } from "./types";
import { STATUS_SEVERITY } from "./constants";

interface DonationScheduleCardProps {
  schedule: DonationSchedule;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

const DonationScheduleCard: React.FC<DonationScheduleCardProps> = ({
  schedule,
  onEdit,
  onCancel,
  onConfirm,
  onComplete,
  showActions = true,
  variant = "default",
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot: string) => {
    const [start, end] = timeSlot.split("-");
    const formatTimeString = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatTimeString(start)} - ${formatTimeString(end)}`;
  };

  const getStatusSeverity = (status: ScheduleStatus) => {
    return STATUS_SEVERITY[status] || "info";
  };

  const canConfirm = schedule.status === ScheduleStatus.SCHEDULED;
  const canCancel = [ScheduleStatus.SCHEDULED, ScheduleStatus.CONFIRMED].includes(schedule.status);
  const canComplete = schedule.status === ScheduleStatus.CONFIRMED;
  const canEdit = [ScheduleStatus.SCHEDULED, ScheduleStatus.CONFIRMED].includes(schedule.status);

  const handleViewDetails = () => {
    navigate(`/donation-schedules/${schedule._id}`);
  };

  const renderHeader = () => (
    <div className="flex justify-content-between align-items-center">
      <div className="flex align-items-center gap-2">
        <Avatar
          label={`${schedule.donor.firstName[0]}${schedule.donor.lastName[0]}`}
          className="mr-2"
          size="normal"
          style={{ backgroundColor: "#2196F3", color: "white" }}
        />
        <div>
          <h4 className="m-0">
            {schedule.donor.firstName} {schedule.donor.lastName}
          </h4>
          {schedule.donor.bloodType && schedule.donor.RhFactor && (
            <span className="text-sm text-600">
              {schedule.donor.bloodType}
              {schedule.donor.RhFactor}
            </span>
          )}
        </div>
      </div>
      <Tag
        value={schedule.status}
        severity={getStatusSeverity(schedule.status)}
        className="text-sm"
      />
    </div>
  );

  const renderContent = () => (
    <div className="pt-3">
      {/* Date and Time */}
      <div className="flex align-items-center gap-2 mb-3">
        <i className="pi pi-calendar text-600"></i>
        <span className="font-semibold">{formatDate(schedule.scheduledDate)}</span>
        <i className="pi pi-clock text-600 ml-2"></i>
        <span>{formatTime(schedule.timeSlot)}</span>
      </div>

      {/* Blood Bank */}
      <div className="flex align-items-center gap-2 mb-3">
        <i className="pi pi-building text-600"></i>
        <div>
          <div className="font-semibold">{schedule.bloodBank.name}</div>
          <div className="text-sm text-600">{schedule.bloodBank.city}</div>
        </div>
      </div>

      {/* Additional Info */}
      {variant === "detailed" && (
        <div className="grid">
          {schedule.donationType && (
            <div className="col-6">
              <span className="text-600">Type:</span>
              <div className="font-semibold">{schedule.donationType}</div>
            </div>
          )}
          {schedule.purpose && (
            <div className="col-6">
              <span className="text-600">Purpose:</span>
              <div className="font-semibold">{schedule.purpose}</div>
            </div>
          )}
          {schedule.estimatedDuration && (
            <div className="col-6">
              <span className="text-600">Duration:</span>
              <div className="font-semibold">{schedule.estimatedDuration} min</div>
            </div>
          )}
          {schedule.contactMethod && (
            <div className="col-6">
              <span className="text-600">Contact:</span>
              <div className="font-semibold">{schedule.contactMethod}</div>
            </div>
          )}
        </div>
      )}

      {/* Chips for additional info */}
      <div className="flex gap-2 mt-3">
        {schedule.sendReminders && (
          <Chip label="Reminders On" className="p-chip-outlined" />
        )}
        {schedule.isRecurring && (
          <Chip label="Recurring" className="p-chip-outlined" />
        )}
        {schedule.specialInstructions && (
          <Chip label="Special Instructions" className="p-chip-outlined" />
        )}
      </div>

      {/* Special Instructions */}
      {schedule.specialInstructions && variant === "detailed" && (
        <div className="mt-3 p-3 border-round surface-100">
          <div className="text-600 text-sm mb-1">Special Instructions:</div>
          <div className="text-sm">{schedule.specialInstructions}</div>
        </div>
      )}
    </div>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex gap-2 mt-3">
        <Button
          label="View"
          icon="pi pi-eye"
          className="p-button-outlined p-button-sm"
          onClick={handleViewDetails}
        />
        
        {canEdit && onEdit && (
          <Button
            label="Edit"
            icon="pi pi-pencil"
            className="p-button-outlined p-button-sm"
            onClick={() => onEdit(schedule._id)}
          />
        )}

        {canConfirm && onConfirm && (
          <Button
            label="Confirm"
            icon="pi pi-check"
            className="p-button-success p-button-sm"
            onClick={() => onConfirm(schedule._id)}
          />
        )}

        {canComplete && onComplete && (
          <Button
            label="Complete"
            icon="pi pi-check-circle"
            className="p-button-success p-button-sm"
            onClick={() => onComplete(schedule._id)}
          />
        )}

        {canCancel && onCancel && (
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-danger p-button-outlined p-button-sm"
            onClick={() => onCancel(schedule._id)}
          />
        )}
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <Card className="mb-3 schedule-card schedule-card-compact">
        <div className="flex justify-content-between align-items-center">
          <div className="flex align-items-center gap-3">
            <Avatar
              label={`${schedule.donor.firstName[0]}${schedule.donor.lastName[0]}`}
              size="normal"
              style={{ backgroundColor: "#2196F3", color: "white" }}
            />
            <div>
              <div className="font-semibold">
                {schedule.donor.firstName} {schedule.donor.lastName}
              </div>
              <div className="text-sm text-600">
                {formatDate(schedule.scheduledDate)} • {formatTime(schedule.timeSlot)}
              </div>
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            <Tag
              value={schedule.status}
              severity={getStatusSeverity(schedule.status)}
              className="text-sm"
            />
            {showActions && (
              <Button
                icon="pi pi-chevron-right"
                className="p-button-text p-button-sm"
                onClick={handleViewDetails}
              />
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="mb-3 schedule-card"
      header={renderHeader()}
    >
      {renderContent()}
      {renderActions()}
    </Card>
  );
};

export default DonationScheduleCard;
