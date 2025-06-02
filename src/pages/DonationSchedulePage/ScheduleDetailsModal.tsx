import React from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { type DonationSchedule, ScheduleStatus } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";

interface ScheduleDetailsModalProps {
  schedule: DonationSchedule | null;
  visible: boolean;
  onHide: () => void;
  onEdit?: (schedule: DonationSchedule) => void;
  onConfirm?: (scheduleId: string) => void;
  onCancel?: (scheduleId: string) => void;
  onComplete?: (scheduleId: string) => void;
}

export const ScheduleDetailsModal: React.FC<ScheduleDetailsModalProps> = ({
  schedule,
  visible,
  onHide,
  onEdit,
  onConfirm,
  onCancel,
  onComplete,
}) => {
  if (!schedule) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canConfirm = schedule.status === ScheduleStatus.SCHEDULED;
  const canCancel = [
    ScheduleStatus.SCHEDULED,
    ScheduleStatus.CONFIRMED,
  ].includes(schedule.status);
  const canComplete = schedule.status === ScheduleStatus.CONFIRMED;
  const canEdit =
    schedule.status !== ScheduleStatus.COMPLETED &&
    schedule.status !== ScheduleStatus.CANCELLED;

  const statusColor = STATUS_COLORS[schedule.status] || "gray";
  const statusLabel = STATUS_LABELS[schedule.status] || schedule.status;

  const headerElement = (
    <div className="flex align-items-center gap-3">
      <i className="pi pi-calendar text-2xl"></i>
      <div>
        <h3 className="m-0">Schedule Details</h3>
        <p className="m-0 text-sm text-gray-600">ID: {schedule._id}</p>
      </div>
    </div>
  );

  const footerElement = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2">
        {canEdit && (
          <Button
            label="Edit"
            icon="pi pi-pencil"
            className="p-button-outlined"
            onClick={() => onEdit?.(schedule)}
          />
        )}
        {canConfirm && (
          <Button
            label="Confirm"
            icon="pi pi-check"
            className="p-button-success"
            onClick={() => onConfirm?.(schedule._id)}
          />
        )}
        {canComplete && (
          <Button
            label="Complete"
            icon="pi pi-check-circle"
            className="p-button-info"
            onClick={() => onComplete?.(schedule._id)}
          />
        )}
        {canCancel && (
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-danger p-button-outlined"
            onClick={() => onCancel?.(schedule._id)}
          />
        )}
      </div>
      <Button
        label="Close"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
    </div>
  );

  return (
    <Dialog
      header={headerElement}
      footer={footerElement}
      visible={visible}
      onHide={onHide}
      style={{ width: "50vw" }}
      className="p-fluid"
      maximizable
      modal
    >
      <div className="grid">
        {/* Status and Basic Info */}
        <div className="col-12">
          <Card className="mb-3">
            <div className="flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-2">Schedule Information</h4>
                <Tag
                  value={statusLabel}
                  severity={statusColor as any}
                  className="text-base px-3 py-1"
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="text-sm font-medium">
                  {formatDateTime(schedule.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid">
              <div className="col-6">
                <div className="field">
                  <label className="font-medium text-gray-700">
                    Scheduled Date
                  </label>
                  <p className="mt-1 text-lg font-medium">
                    {formatDate(schedule.scheduledDate)}
                  </p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label className="font-medium text-gray-700">Time Slot</label>
                  <p className="mt-1 text-lg font-medium">
                    {schedule.timeSlot}
                  </p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label className="font-medium text-gray-700">
                    Donation Type
                  </label>
                  <p className="mt-1">{schedule.donationType}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label className="font-medium text-gray-700">Purpose</label>
                  <p className="mt-1">{schedule.purpose}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Donor Information */}
        <div className="col-6">
          <Card>
            <h4 className="mb-3 flex align-items-center gap-2">
              <i className="pi pi-user text-blue-500"></i>
              Donor Information
            </h4>
            <div className="flex flex-column gap-3">
              <div>
                <label className="font-medium text-gray-700">Name</label>
                <p className="mt-1">
                  {schedule.donor?.firstName + schedule.donor?.lastName ||
                    "Unknown Donor"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Email</label>
                <p className="mt-1">
                  {schedule.donor?.email || "Not provided"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone</label>
                <p className="mt-1">
                  {schedule.donor?.phoneNumber || "Not provided"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Blood Type</label>
                <p className="mt-1">
                  <Chip
                    label={schedule.donor?.bloodType || "Unknown"}
                    className="bg-red-100 text-red-800"
                  />
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Blood Bank Information */}
        <div className="col-6">
          <Card>
            <h4 className="mb-3 flex align-items-center gap-2">
              <i className="pi pi-building text-red-500"></i>
              Blood Bank Information
            </h4>
            <div className="flex flex-column gap-3">
              <div>
                <label className="font-medium text-gray-700">Name</label>
                <p className="mt-1">
                  {schedule.bloodBank?.name || "Unknown Blood Bank"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Email</label>
                <p className="mt-1">
                  {schedule.bloodBank?.email || "Not provided"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone</label>
                <p className="mt-1">
                  {schedule.bloodBank?.contactNumber || "Not provided"}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Address</label>
                <p className="mt-1">
                  {schedule.bloodBank?.address ? (
                    <>
                      {schedule.bloodBank.address}
                      <br />
                      {schedule.bloodBank.city}, {schedule.bloodBank.state}{" "}
                      {schedule.bloodBank.postalCode}
                    </>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Details */}
        {(schedule.notes ||
          schedule.reminderStatus == "SENT" ||
          schedule.confirmedAt ||
          schedule.cancelledAt) && (
          <div className="col-12">
            <Card>
              <h4 className="mb-3 flex align-items-center gap-2">
                <i className="pi pi-info-circle text-blue-500"></i>
                Additional Details
              </h4>

              {schedule.notes && (
                <div className="mb-3">
                  <label className="font-medium text-gray-700">Notes</label>
                  <p className="mt-1 p-3 bg-gray-50 border-round">
                    {schedule.notes}
                  </p>
                </div>
              )}

              <div className="grid">
                {schedule.reminderStatus == "SENT" && (
                  <div className="col-6">
                    <label className="font-medium text-gray-700">
                      Reminder Status
                    </label>
                    <p className="mt-1">
                      <Tag value="Sent" severity="success" />
                    </p>
                  </div>
                )}

                {schedule.confirmedAt && (
                  <div className="col-6">
                    <label className="font-medium text-gray-700">
                      Confirmed At
                    </label>
                    <p className="mt-1">
                      {formatDateTime(schedule.confirmedAt)}
                    </p>
                  </div>
                )}

                {schedule.cancelledAt && (
                  <div className="col-6">
                    <label className="font-medium text-gray-700">
                      Cancelled At
                    </label>
                    <p className="mt-1">
                      {formatDateTime(schedule.cancelledAt)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Dialog>
  );
};
