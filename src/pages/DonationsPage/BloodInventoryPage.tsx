import React, { useState, useRef, useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Badge } from "primereact/badge";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import {
  useBloodInventory,
  useMarkAsDispatched,
  useMarkAsUsed,
  useDiscardBloodUnit,
  useBulkDiscardBloodUnits,
  useMarkAsExpired,
  useReserveBloodUnit,
  useProcessExpiredUnits,
  useBloodUnitTracking,
} from "../../state/bloodInventory";
import type { Donation, BloodInventoryFilters } from "./types";
import TrackingDialog from "./TrackingDialog";
import DispatchDialog from "./DispatchDialog";
import ReserveDialog from "./ReserveDialog";
import { UserRole } from "../../state/auth";
import RoleBasedAccess, { useHasRole } from "../../components/RoleBasedAccess";

// Type alias for backward compatibility
type BloodUnit = Donation;

// Filter options
const unitStatuses = [
  { label: "All", value: "" },
  { label: "In Inventory", value: "in_inventory" },
  { label: "Reserved", value: "reserved" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Used", value: "used" },
  { label: "Expired", value: "expired" },
  { label: "Discarded", value: "discarded" },
];

const bloodTypes = [
  { label: "All", value: "" },
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

const donationTypes = [
  { label: "All", value: "" },
  { label: "Whole Blood", value: "whole_blood" },
  { label: "Plasma", value: "plasma" },
  { label: "Platelets", value: "platelets" },
  { label: "Red Blood Cells", value: "red_blood_cells" },
];

const BloodInventoryPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUnits, setSelectedUnits] = useState<BloodUnit[]>([]);
  const [filters, setFilters] = useState<BloodInventoryFilters>({
    unitStatus: undefined,
    bloodType: undefined,
    donationType: undefined,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  // Dialog states
  const [trackingDialogVisible, setTrackingDialogVisible] = useState(false);
  const [dispatchDialogVisible, setDispatchDialogVisible] = useState(false);
  const [reserveDialogVisible, setReserveDialogVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<BloodUnit | null>(null);

  const toast = useRef<Toast>(null);

  // Role-based access checks
  const canManageInventory = useHasRole([UserRole.ADMIN, UserRole.BLOOD_BANK]);
  const canDispatch = useHasRole([UserRole.ADMIN, UserRole.BLOOD_BANK]);
  const canDiscard = useHasRole([UserRole.ADMIN, UserRole.BLOOD_BANK]);
  const canMarkAsUsed = useHasRole([UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]);
  const canReserve = useHasRole([UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]);
  // Prepare filters for API call
  const apiFilters = useMemo(() => {
    const cleanFilters: BloodInventoryFilters = {};

    if (filters.unitStatus) {
      cleanFilters.unitStatus = filters.unitStatus;
    }
    if (filters.bloodType) {
      cleanFilters.bloodType = filters.bloodType;
    }
    if (filters.donationType) {
      cleanFilters.donationType = filters.donationType;
    }

    return cleanFilters;
  }, [filters]); // TanStack Query hooks
  const {
    data: inventoryData,
    isLoading,
    refetch,
  } = useBloodInventory({
    filters: apiFilters,
    page,
    pageSize,
  });  // Mutation hooks
  const dispatchMutation = useMarkAsDispatched();
  const markAsUsedMutation = useMarkAsUsed();
  const discardMutation = useDiscardBloodUnit();
  const bulkDiscardMutation = useBulkDiscardBloodUnits();
  const expireMutation = useMarkAsExpired();
  const reserveMutation = useReserveBloodUnit();
  const processExpiredMutation = useProcessExpiredUnits();  // Tracking query hook
  const {
    data: trackingData,
    isLoading: isTrackingLoading,
  } = useBloodUnitTracking(selectedUnit?._id || "");

  const bloodUnits = inventoryData?.content || [];

  // Helper function to calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Status rendering
  const statusBodyTemplate = (rowData: BloodUnit) => {
    const getSeverity = (status?: string) => {
      switch (status) {
        case "in_inventory":
          return "success";
        case "reserved":
          return "info";
        case "dispatched":
          return "warning";
        case "used":
          return "secondary";
        case "expired":
          return "danger";
        case "discarded":
          return "danger";
        default:
          return "secondary";
      }
    };

    const getDisplayStatus = (status?: string) => {
      switch (status) {
        case "in_inventory":
          return "Available";
        case "reserved":
          return "Reserved";
        case "dispatched":
          return "Dispatched";
        case "used":
          return "Used";
        case "expired":
          return "Expired";
        case "discarded":
          return "Discarded";
        default:
          return status || "Unknown";
      }
    };

    return (
      <Tag
        value={getDisplayStatus(rowData.unitStatus)}
        severity={getSeverity(rowData.unitStatus)}
      />
    );
  };

  // Blood type rendering
  const bloodTypeBodyTemplate = (rowData: BloodUnit) => {
    return <Badge value={rowData.bloodType} severity="info" />;
  };

  // Donor name rendering
  const donorNameBodyTemplate = (rowData: BloodUnit) => {
    return `${rowData.donor.firstName} ${rowData.donor.lastName}`;
  };

  // Blood bank name rendering
  const bloodBankBodyTemplate = (rowData: BloodUnit) => {
    return rowData.bloodBank.name;
  };
  // Expiry date rendering with color coding
  const expiryBodyTemplate = (rowData: BloodUnit) => {
    if (!rowData.expiryDate) {
      return <span className="text-500">No expiry date</span>;
    }

    const daysUntilExpiry = getDaysUntilExpiry(rowData.expiryDate);
    const expiryDate = new Date(rowData.expiryDate).toLocaleDateString();

    let severity: "secondary" | "danger" | "warning" | "success" = "secondary";
    if (daysUntilExpiry < 0) severity = "danger"; // Expired
    else if (daysUntilExpiry <= 3) severity = "danger"; // Critical
    else if (daysUntilExpiry <= 7) severity = "warning"; // Warning
    else severity = "success"; // Good

    return (
      <div className="flex align-items-center gap-2">
        <Tag value={`${daysUntilExpiry} days`} severity={severity} />
        <span className="text-sm text-500">{expiryDate}</span>
      </div>
    );
  };  // Actions column
  const actionsBodyTemplate = (rowData: BloodUnit) => {
    const isDispatchLoading = dispatchMutation.isPending;
    const isMarkAsUsedLoading = markAsUsedMutation.isPending;
    const isDiscardLoading = discardMutation.isPending;
    const isExpireLoading = expireMutation.isPending;
    const isReserveLoading = reserveMutation.isPending;

    const unitStatus = rowData.unitStatus || "";
    const canDispatchUnit = unitStatus === "in_inventory" && canDispatch;
    const canMarkAsUsedUnit = unitStatus === "dispatched" && canMarkAsUsed;
    const canDiscardUnit = !["used", "discarded"].includes(unitStatus) && canDiscard;
    const canExpireUnit = ["in_inventory", "reserved"].includes(unitStatus) && canDiscard;
    const canReserveUnit = unitStatus === "in_inventory" && canReserve;

    return (
      <div className="flex gap-1 flex-wrap">
        {canDispatchUnit && (
          <Button
            icon="pi pi-truck"
            size="small"
            tooltip="Dispatch"
            tooltipOptions={{ position: 'top' }}
            loading={isDispatchLoading}
            onClick={() => handleDispatch(rowData)}
            disabled={isDispatchLoading}
            className="p-button-outlined p-button-primary"
          />
        )}
        
        {canMarkAsUsedUnit && (
          <Button
            icon="pi pi-check"
            size="small"
            severity="success"
            tooltip="Mark as Used"
            tooltipOptions={{ position: 'top' }}
            loading={isMarkAsUsedLoading}
            onClick={() => handleUse(rowData)}
            disabled={isMarkAsUsedLoading}
            className="p-button-outlined"
          />
        )}
        
        {canReserveUnit && (
          <Button
            icon="pi pi-bookmark"
            size="small"
            severity="info"
            tooltip="Reserve"
            tooltipOptions={{ position: 'top' }}
            loading={isReserveLoading}
            onClick={() => handleReserve(rowData)}
            disabled={isReserveLoading}
            className="p-button-outlined"
          />
        )}
        
        {canExpireUnit && (
          <Button
            icon="pi pi-clock"
            size="small"
            severity="warning"
            tooltip="Mark as Expired"
            tooltipOptions={{ position: 'top' }}
            loading={isExpireLoading}
            onClick={() => handleExpire(rowData)}
            disabled={isExpireLoading}
            className="p-button-outlined"
          />
        )}
        
        {canDiscardUnit && (
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Discard"
            tooltipOptions={{ position: 'top' }}
            loading={isDiscardLoading}
            onClick={() => handleDiscard(rowData)}
            disabled={isDiscardLoading}
            className="p-button-outlined"
          />
        )}
        
        <Button
          icon="pi pi-eye"
          size="small"
          severity="secondary"
          tooltip="View Tracking"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleViewTracking(rowData)}
          className="p-button-outlined"
        />
      </div>
    );
  };// Action handlers
  const handleDispatch = (unit: BloodUnit) => {
    setSelectedUnit(unit);
    setDispatchDialogVisible(true);
  };
  const handleDispatchConfirm = (unitId: string, hospitalId: string, notes?: string) => {
    dispatchMutation.mutate(
      {
        id: unitId,
        data: {
          dispatchedTo: hospitalId,
          dispatchedAt: new Date().toISOString(),
          forRequest: notes, // Using forRequest field for notes
        },
      },
      {
        onSuccess: () => {
          toast.current?.show({
            severity: "success",
            summary: "Dispatched",
            detail: `Unit has been dispatched successfully`,
          });
          setDispatchDialogVisible(false);
          setSelectedUnit(null);
        },
        onError: (error) => {
          toast.current?.show({
            severity: "error",
            summary: "Dispatch Failed",
            detail: `Failed to dispatch unit: ${error.message}`,
          });
        },
      }
    );
  };

  const handleUse = (unit: BloodUnit) => {
    // For demo purposes, we'll use mock values
    // In a real app, these would be selected from dropdowns
    const mockPurpose = "Emergency Transfusion";

    confirmDialog({
      message: `Mark unit ${unit._id} as used for ${mockPurpose}?`,
      header: "Confirm Usage",
      icon: "pi pi-check",
      accept: () => {
        markAsUsedMutation.mutate(
          {
            id: unit._id,
            data: {
              usedFor: mockPurpose,
              usedAt: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              toast.current?.show({
                severity: "success",
                summary: "Marked as Used",
                detail: `Unit ${unit._id} has been marked as used`,
              });
            },
            onError: (error) => {
              toast.current?.show({
                severity: "error",
                summary: "Operation Failed",
                detail: `Failed to mark unit ${unit._id} as used: ${error.message}`,
              });
            },
          }
        );
      },
    });
  };
  const handleDiscard = (unit: BloodUnit) => {
    confirmDialog({
      message: `Are you sure you want to discard unit ${unit._id}?`,
      header: "Confirm Discard",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        discardMutation.mutate(
          {
            id: unit._id,
            data: {
              discardReason: "Expired",
              discardedAt: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              toast.current?.show({
                severity: "warn",
                summary: "Discarded",
                detail: `Unit ${unit._id} has been discarded`,
              });
            },
            onError: (error) => {
              toast.current?.show({
                severity: "error",
                summary: "Discard Failed",
                detail: `Failed to discard unit ${unit._id}: ${error.message}`,
              });
            },
          }
        );
      },
    });
  };

  const handleExpire = (unit: BloodUnit) => {
    confirmDialog({
      message: `Are you sure you want to mark unit ${unit._id} as expired?`,
      header: "Confirm Expire",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        expireMutation.mutate(unit._id, {
          onSuccess: () => {
            toast.current?.show({
              severity: "warn", 
              summary: "Expired",
              detail: `Unit ${unit._id} has been marked as expired`,
            });
          },
          onError: (error) => {
            toast.current?.show({
              severity: "error",
              summary: "Expire Failed",
              detail: `Failed to expire unit ${unit._id}: ${error.message}`,
            });
          },
        });
      },
    });
  };
  const handleReserve = (unit: BloodUnit) => {
    setSelectedUnit(unit);
    setReserveDialogVisible(true);
  };

  const handleReserveConfirm = (unitId: string, requestId: string, _notes?: string) => {
    reserveMutation.mutate(
      { id: unitId, requestId: requestId },
      {
        onSuccess: () => {
          toast.current?.show({
            severity: "info",
            summary: "Reserved",
            detail: `Unit has been reserved successfully`,
          });
          setReserveDialogVisible(false);
          setSelectedUnit(null);
        },
        onError: (error) => {
          toast.current?.show({
            severity: "error",
            summary: "Reserve Failed",
            detail: `Failed to reserve unit: ${error.message}`,
          });
        },
      }
    );
  };
  const handleViewTracking = (unit: BloodUnit) => {
    setSelectedUnit(unit);
    setTrackingDialogVisible(true);
  };
  // Bulk actions
  const handleBulkDiscard = () => {
    if (selectedUnits.length === 0) return;

    confirmDialog({
      message: `Are you sure you want to discard ${selectedUnits.length} selected units?`,
      header: "Confirm Bulk Discard",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        const unitIds = selectedUnits.map((unit) => unit._id);

        bulkDiscardMutation.mutate(unitIds, {
          onSuccess: () => {
            toast.current?.show({
              severity: "warn",
              summary: "Bulk Discard",
              detail: `${selectedUnits.length} units have been discarded`,
            });
            setSelectedUnits([]);
          },
          onError: (error) => {
            toast.current?.show({
              severity: "error",
              summary: "Bulk Discard Failed",
              detail: `Failed to discard units: ${error.message}`,
            });
          },        });
      },
    });
  };

  const handleProcessExpired = () => {
    confirmDialog({
      message: "Are you sure you want to process all expired units? This will mark them as discarded.",
      header: "Process Expired Units",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        processExpiredMutation.mutate(undefined, {
          onSuccess: (result) => {
            toast.current?.show({
              severity: "success",
              summary: "Processed",
              detail: `${result.processedCount || 0} expired units have been processed`,
            });
          },
          onError: (error) => {
            toast.current?.show({
              severity: "error",
              summary: "Process Failed",
              detail: `Failed to process expired units: ${error.message}`,
            });
          },
        });
      },
    });
  };  // Toolbar content
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          loading={isLoading}
          onClick={() => refetch()}
        />
        {selectedUnits.length > 0 && canDiscard && (
          <Button
            label={`Bulk Discard (${selectedUnits.length})`}
            icon="pi pi-trash"
            severity="danger"
            loading={bulkDiscardMutation.isPending}
            onClick={handleBulkDiscard}
            disabled={bulkDiscardMutation.isPending}
          />
        )}
        {canManageInventory && (
          <Button
            label="Process Expired"
            icon="pi pi-clock"
            severity="warning"
            loading={processExpiredMutation.isPending}
            onClick={handleProcessExpired}
            disabled={processExpiredMutation.isPending}
            tooltip="Automatically mark expired units as discarded"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Search units..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
        <Button
          label="Export"
          icon="pi pi-download"
          onClick={() => {
            toast.current?.show({
              severity: "info",
              summary: "Export",
              detail: "Export functionality will be implemented",
            });
          }}
        />
      </div>
    );
  };
  // Summary stats based on actual data
  const getSummaryStats = () => {
    const total = bloodUnits.length;
    const available = bloodUnits.filter(
      (u: BloodUnit) => u.unitStatus === "in_inventory"
    ).length;
    const expiringSoon = bloodUnits.filter(
      (u: BloodUnit) =>
        u.expiryDate &&
        getDaysUntilExpiry(u.expiryDate) <= 7 &&
        getDaysUntilExpiry(u.expiryDate) > 0
    ).length;
    const expired = bloodUnits.filter(
      (u: BloodUnit) => u.expiryDate && getDaysUntilExpiry(u.expiryDate) < 0
    ).length;

    return { total, available, expiringSoon, expired };
  };

  const stats = getSummaryStats();

  // Pagination handlers
  const onPageChange = (event: any) => {
    setPage(event.page);
    setPageSize(event.rows);
  };
  return (
    <RoleBasedAccess 
      allowedRoles={[UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]}
      fallback={
        <div className="p-4">
          <Card>
            <div className="text-center p-6">
              <i className="pi pi-lock text-6xl text-400 mb-4"></i>
              <h3 className="text-2xl font-bold text-900 mb-2">Access Restricted</h3>
              <p className="text-600 text-lg mb-4">
                You don't have permission to access the Blood Inventory Dashboard.
              </p>
              <p className="text-500">
                This page is only accessible to Administrators, Blood Banks, Medical Institutions, and Hospitals.
              </p>
            </div>
          </Card>
        </div>
      }
    >
      <div className="p-4">
        <Toast ref={toast} />

      {/* Header */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-900 m-0">
            Blood Inventory Dashboard
          </h2>
          <p className="text-600 mt-1 mb-0">
            Manage and track blood unit status across the system
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <Card className="bg-blue-50 border-1 border-blue-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Total Units</div>
                <div className="text-900 font-bold text-xl">{stats.total}</div>
              </div>
              <div
                className="bg-blue-500 text-white border-round flex align-items-center justify-content-center"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-box text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card className="bg-green-50 border-1 border-green-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Available</div>
                <div className="text-900 font-bold text-xl">
                  {stats.available}
                </div>
              </div>
              <div
                className="bg-green-500 text-white border-round flex align-items-center justify-content-center"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-check text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card className="bg-orange-50 border-1 border-orange-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Expiring Soon</div>
                <div className="text-900 font-bold text-xl">
                  {stats.expiringSoon}
                </div>
              </div>
              <div
                className="bg-orange-500 text-white border-round flex align-items-center justify-content-center"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-clock text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card className="bg-red-50 border-1 border-red-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Expired</div>
                <div className="text-900 font-bold text-xl">
                  {stats.expired}
                </div>
              </div>
              <div
                className="bg-red-500 text-white border-round flex align-items-center justify-content-center"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-times text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-3">
            <label className="block text-900 font-medium mb-2">Status</label>
            <Dropdown
              value={filters.unitStatus}
              options={unitStatuses}
              onChange={(e) => setFilters({ ...filters, unitStatus: e.value })}
              placeholder="All Statuses"
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3">
            <label className="block text-900 font-medium mb-2">
              Blood Type
            </label>
            <Dropdown
              value={filters.bloodType}
              options={bloodTypes}
              onChange={(e) => setFilters({ ...filters, bloodType: e.value })}
              placeholder="All Types"
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3">
            <label className="block text-900 font-medium mb-2">
              Donation Type
            </label>
            <Dropdown
              value={filters.donationType}
              options={donationTypes}
              onChange={(e) =>
                setFilters({ ...filters, donationType: e.value })
              }
              placeholder="All Donations"
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3 flex align-items-end">
            <Button
              label="Clear Filters"
              icon="pi pi-filter-slash"
              outlined
              onClick={() =>
                setFilters({
                  unitStatus: undefined,
                  bloodType: undefined,
                  donationType: undefined,
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}      <Card>
        <Toolbar
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
          className="mb-4"
        />
        {canDiscard ? (
          <DataTable
            value={bloodUnits}
            loading={isLoading}
            selection={selectedUnits}
            onSelectionChange={(e: any) => setSelectedUnits(e.value)}
            selectionMode="multiple"
            dataKey="_id"
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            totalRecords={inventoryData?.totalElements || 0}
            lazy
            onPage={onPageChange}
            globalFilter={globalFilter}
            emptyMessage="No blood units found"
            className="p-datatable-striped"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column
              field="_id"
              header="Unit ID"
              sortable
              style={{ minWidth: "8rem" }}
              body={(rowData) => rowData._id.slice(-8)}
            />
            <Column
              field="bloodType"
              header="Blood Type"
              body={bloodTypeBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="donationType"
              header="Type"
              sortable
              style={{ minWidth: "10rem" }}
              body={(rowData) =>
                rowData.donationType?.replace("_", " ").toUpperCase() || "N/A"
              }
            />
            <Column
              field="unitStatus"
              header="Status"
              body={statusBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              header="Donor"
              body={donorNameBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Blood Bank"
              body={bloodBankBodyTemplate}
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="donationDate"
              header="Collection Date"
              sortable
              body={(rowData) =>
                new Date(rowData.donationDate).toLocaleDateString()
              }
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="expiryDate"
              header="Expiry"
              body={expiryBodyTemplate}
              sortable
              style={{ minWidth: "12rem" }}
            />
            <Column
              header="Actions"
              body={actionsBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
          </DataTable>
        ) : (
          <DataTable
            value={bloodUnits}
            loading={isLoading}
            dataKey="_id"
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            totalRecords={inventoryData?.totalElements || 0}
            lazy
            onPage={onPageChange}
            globalFilter={globalFilter}
            emptyMessage="No blood units found"
            className="p-datatable-striped"
          >
            <Column
              field="_id"
              header="Unit ID"
              sortable
              style={{ minWidth: "8rem" }}
              body={(rowData) => rowData._id.slice(-8)}
            />
            <Column
              field="bloodType"
              header="Blood Type"
              body={bloodTypeBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="donationType"
              header="Type"
              sortable
              style={{ minWidth: "10rem" }}
              body={(rowData) =>
                rowData.donationType?.replace("_", " ").toUpperCase() || "N/A"
              }
            />
            <Column
              field="unitStatus"
              header="Status"
              body={statusBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              header="Donor"
              body={donorNameBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Blood Bank"
              body={bloodBankBodyTemplate}
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="donationDate"
              header="Collection Date"
              sortable
              body={(rowData) =>
                new Date(rowData.donationDate).toLocaleDateString()
              }
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="expiryDate"
              header="Expiry"
              body={expiryBodyTemplate}
              sortable
              style={{ minWidth: "12rem" }}
            />
            <Column
              header="Actions"
              body={actionsBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
          </DataTable>
        )}      </Card>
      
      {/* Dialog Components */}
      <TrackingDialog
        visible={trackingDialogVisible}
        onHide={() => setTrackingDialogVisible(false)}
        unitId={selectedUnit?._id || ""}
        unit={selectedUnit}
        trackingData={trackingData}
        isLoading={isTrackingLoading}
      />

      <DispatchDialog
        visible={dispatchDialogVisible}
        onHide={() => setDispatchDialogVisible(false)}
        unit={selectedUnit}
        onDispatch={handleDispatchConfirm}
        isLoading={dispatchMutation.isPending}
      />

      <ReserveDialog
        visible={reserveDialogVisible}
        onHide={() => setReserveDialogVisible(false)}
        unit={selectedUnit}
        onReserve={handleReserveConfirm}
        isLoading={reserveMutation.isPending}
      />
    </div>
    </RoleBasedAccess>
  );
};

export default BloodInventoryPage;
