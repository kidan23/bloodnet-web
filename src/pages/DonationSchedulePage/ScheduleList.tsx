import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Message } from "primereact/message";
import { type DonationSchedule, ScheduleStatus } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import DonationScheduleCard from "./DonationScheduleCard";

interface ScheduleListProps {
  schedules: DonationSchedule[];
  loading?: boolean;
  error?: string | null;
  totalRecords?: number;
  first?: number;
  rows?: number;
  onPageChange?: (event: any) => void;
  onEdit?: (schedule: DonationSchedule) => void;
  onView?: (schedule: DonationSchedule) => void;
  onConfirm?: (scheduleId: string) => void;
  onCancel?: (scheduleId: string) => void;
  onComplete?: (scheduleId: string) => void;
  viewMode?: "table" | "cards";
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  loading = false,
  error,
  totalRecords,
  first = 0,
  rows = 10,
  onPageChange,
  onEdit,
  onView,
  onConfirm,
  onCancel,
  onComplete,
  viewMode = "table",
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot;
  };

  const statusBodyTemplate = (rowData: DonationSchedule) => {
    const color = STATUS_COLORS[rowData.status] || "gray";
    const label = STATUS_LABELS[rowData.status] || rowData.status;

    return <Tag value={label} severity={color as any} className="text-sm" />;
  };

  const dateBodyTemplate = (rowData: DonationSchedule) => {
    return (
      <div className="flex flex-column gap-1">
        <span className="font-medium">{formatDate(rowData.scheduledDate)}</span>
        <span className="text-sm text-gray-600">
          {formatTime(rowData.timeSlot)}
        </span>
      </div>
    );
  };

  const donorBodyTemplate = (rowData: DonationSchedule) => {
    return (
      <div className="flex flex-column gap-1">
        <span className="font-medium">
          {rowData.donor?.firstName + rowData.donor?.lastName ||
            "Unknown Donor"}
        </span>
        <span className="text-sm text-gray-600">{rowData.donor?.email}</span>
      </div>
    );
  };

  const bloodBankBodyTemplate = (rowData: DonationSchedule) => {
    return (
      <div className="flex flex-column gap-1">
        <span className="font-medium">
          {rowData.bloodBank?.name || "Unknown Blood Bank"}
        </span>
        <span className="text-sm text-gray-600">
          {rowData.bloodBank?.address}
        </span>
      </div>
    );
  };

  const actionsBodyTemplate = (rowData: DonationSchedule) => {
    const canConfirm = rowData.status === ScheduleStatus.SCHEDULED;
    const canCancel = [
      ScheduleStatus.SCHEDULED,
      ScheduleStatus.CONFIRMED,
    ].includes(rowData.status);
    const canComplete = rowData.status === ScheduleStatus.CONFIRMED;

    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          tooltip="View Details"
          onClick={() => onView?.(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          tooltip="Edit Schedule"
          onClick={() => onEdit?.(rowData)}
          disabled={
            rowData.status === ScheduleStatus.COMPLETED ||
            rowData.status === ScheduleStatus.CANCELLED
          }
        />
        {canConfirm && (
          <Button
            icon="pi pi-check"
            className="p-button-text p-button-success p-button-sm"
            tooltip="Confirm Schedule"
            onClick={() => onConfirm?.(rowData._id)}
          />
        )}
        {canCancel && (
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-danger p-button-sm"
            tooltip="Cancel Schedule"
            onClick={() => onCancel?.(rowData._id)}
          />
        )}
        {canComplete && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-text p-button-info p-button-sm"
            tooltip="Mark as Completed"
            onClick={() => onComplete?.(rowData._id)}
          />
        )}
      </div>
    );
  };

  const loadingTemplate = () => (
    <div className="grid">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="col-12">
          <Card className="mb-3">
            <div className="flex justify-content-between align-items-center">
              <div className="flex flex-column gap-2 flex-1">
                <Skeleton width="60%" height="1.5rem" />
                <Skeleton width="40%" height="1rem" />
              </div>
              <div className="flex gap-2">
                <Skeleton width="3rem" height="2rem" />
                <Skeleton width="3rem" height="2rem" />
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return loadingTemplate();
  }

  if (error) {
    return <Message severity="error" text={error} className="w-full" />;
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Card>
        <div className="text-center py-6">
          <i className="pi pi-calendar text-6xl text-gray-400 mb-3 block"></i>
          <h3 className="text-gray-600 mb-2">No Schedules Found</h3>
          <p className="text-gray-500">
            There are no donation schedules matching your criteria.
          </p>
        </div>
      </Card>
    );
  }

  if (viewMode === "cards") {
    return (
      <div className="grid">
        {schedules.map((schedule) => (
          <div key={schedule._id} className="col-12 lg:col-6 xl:col-4">
            <DonationScheduleCard
              schedule={schedule}
              variant="detailed"
              onEdit={
                onEdit
                  ? (id) => {
                      const sched = schedules.find((s) => s._id === id);
                      if (sched) onEdit(sched);
                    }
                  : undefined
              }
              onConfirm={onConfirm}
              onCancel={onCancel}
              onComplete={onComplete}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <DataTable
        value={schedules}
        paginator
        lazy
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={loading}
        className="p-datatable-sm"
        emptyMessage="No schedules found"
        rowHover
        stripedRows
      >
        <Column
          field="scheduledDate"
          header="Date & Time"
          body={dateBodyTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          field="donor"
          header="Donor"
          body={donorBodyTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          field="bloodBank"
          header="Blood Bank"
          body={bloodBankBodyTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          field="donationType"
          header="Type"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="purpose"
          header="Purpose"
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          header="Actions"
          body={actionsBodyTemplate}
          style={{ minWidth: "200px" }}
          frozen
          alignFrozen="right"
        />
      </DataTable>
    </Card>
  );
};
