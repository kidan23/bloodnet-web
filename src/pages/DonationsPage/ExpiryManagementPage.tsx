import React, { useState, useRef, useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { confirmDialog } from "primereact/confirmdialog";
import { Calendar } from "primereact/calendar";
import { UserRole } from "../../state/auth";
import RoleBasedAccess from "../../components/RoleBasedAccess";
import { 
  useBloodInventory, 
  useDiscardBloodUnit, 
  useBulkDiscardBloodUnits 
} from "../../state/bloodInventory";
import { 
  useExpiredBloodUnits, 
  useBloodUnitsExpiringSoon 
} from "../../state/expiryManagement";
import type { Donation } from "./types";
import { BloodUnitStatus } from "./types";

// Type alias for backward compatibility with computed fields
type BloodUnit = Donation & {
  daysUntilExpiry?: number;
};

interface DiscardFormData {
  discardReason: string;
  notes: string;
  discardedAt: Date;
}

const ExpiryManagementPage: React.FC = () => {
  const [selectedUnits, setSelectedUnits] = useState<BloodUnit[]>([]);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discardForm, setDiscardForm] = useState<DiscardFormData>({
    discardReason: "",
    notes: "",
    discardedAt: new Date(),
  });
  const [activeTab, setActiveTab] = useState(0); // 0: Expiring Soon, 1: Expired, 2: Discarded
  const [globalFilter, setGlobalFilter] = useState("");

  const toast = useRef<Toast>(null);
  // Backend hooks using dedicated expiry endpoints
  const { 
    data: expiringSoonData, 
    isLoading: expiringSoonLoading, 
    refetch: refetchExpiringSoon 
  } = useBloodUnitsExpiringSoon({
    days: 7, // Get units expiring within 7 days
    page: 0,
    pageSize: 1000,
  });

  const { 
    data: expiredData, 
    isLoading: expiredLoading, 
    refetch: refetchExpired 
  } = useExpiredBloodUnits({
    page: 0,
    pageSize: 1000,
  });

  const { 
    data: allInventoryData, 
    isLoading: allInventoryLoading, 
    refetch: refetchAll 
  } = useBloodInventory({
    filters: { unitStatus: BloodUnitStatus.DISCARDED },
    page: 0,
    pageSize: 1000,
  });

  const discardMutation = useDiscardBloodUnit();
  const bulkDiscardMutation = useBulkDiscardBloodUnits();

  // Combine loading states
  const inventoryLoading = expiringSoonLoading || expiredLoading || allInventoryLoading;

  // Refetch all data
  const refetch = () => {
    refetchExpiringSoon();
    refetchExpired();
    refetchAll();
  };

  // Helper function to calculate days until expiry
  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };  // Get units from dedicated backend endpoints with daysUntilExpiry computed
  const expiringSoonUnits = useMemo((): BloodUnit[] => {
    const units = expiringSoonData?.content || expiringSoonData?.results || [];
    return units.map((unit: Donation): BloodUnit => ({
      ...unit,
      daysUntilExpiry: getDaysUntilExpiry(unit.expiryDate) || 0
    }));
  }, [expiringSoonData]);

  const expiredUnits = useMemo((): BloodUnit[] => {
    const units = expiredData?.content || expiredData?.results || [];
    return units.map((unit: Donation): BloodUnit => ({
      ...unit,
      daysUntilExpiry: getDaysUntilExpiry(unit.expiryDate) || 0
    }));
  }, [expiredData]);  const discardedUnits = useMemo((): BloodUnit[] => {
    const units = allInventoryData?.content || [];
    return units.map((unit: Donation): BloodUnit => ({
      ...unit,
      daysUntilExpiry: getDaysUntilExpiry(unit.expiryDate) || 0
    }));
  }, [allInventoryData]);

  // Discard reason options
  const discardReasons = [
    { label: "Expired", value: "EXPIRED" },
    { label: "Contaminated", value: "CONTAMINATED" },
    { label: "Quality Control Failure", value: "QUALITY_CONTROL" },
    { label: "Storage Failure", value: "STORAGE_FAILURE" },
    { label: "Damaged Container", value: "DAMAGED_CONTAINER" },
    { label: "Other", value: "OTHER" },
  ];  // Blood type rendering
  const bloodTypeBodyTemplate = (rowData: BloodUnit) => {
    if (!rowData.bloodType) return <Badge value="Unknown" severity="secondary" />;
    
    // Blood type should already include the Rh factor from backend
    const displayType = rowData.bloodType;
    
    return <Badge value={displayType} severity="info" />;
  };
  // Expiry status rendering with progress bar
  const expiryStatusTemplate = (rowData: BloodUnit) => {
    const daysUntilExpiry = rowData.daysUntilExpiry ?? 0;
    const expiryDate = rowData.expiryDate ? new Date(rowData.expiryDate).toLocaleDateString() : 'N/A';
    
    // Calculate progress based on donation type
    const maxDays = getMaxDaysForDonationType(rowData.donationType || 'WHOLE_BLOOD');
    const daysPassed = maxDays - daysUntilExpiry;
    const progressPercent = Math.min(100, Math.max(0, (daysPassed / maxDays) * 100));
    
    let severity: "success" | "info" | "warning" | "danger" = "success";
    let statusText = "";
    
    if (daysUntilExpiry < 0) {
      severity = "danger";
      statusText = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry <= 1) {
      severity = "danger";
      statusText = `Expires ${daysUntilExpiry === 0 ? 'today' : 'tomorrow'}`;
    } else if (daysUntilExpiry <= 3) {
      severity = "danger";
      statusText = `${daysUntilExpiry} days left`;
    } else if (daysUntilExpiry <= 7) {
      severity = "warning";
      statusText = `${daysUntilExpiry} days left`;
    } else {
      severity = "success";
      statusText = `${daysUntilExpiry} days left`;
    }
    
    return (
      <div className="flex flex-column gap-2">
        <div className="flex align-items-center gap-2">
          <Tag value={statusText} severity={severity} />
        </div>
        <div className="text-xs text-500">{expiryDate}</div>
        <ProgressBar 
          value={progressPercent} 
          style={{ height: '4px' }}
          className={`progress-${severity}`}
        />
      </div>
    );
  };

  // Discard info template
  const discardInfoTemplate = (rowData: BloodUnit) => {
    if (!rowData.discardReason) return "-";
    
    return (
      <div className="text-sm">
        <div className="font-medium">{rowData.discardReason.replace('_', ' ')}</div>
        {rowData.discardedAt && (
          <div className="text-400 text-xs mt-1">
            Discarded: {new Date(rowData.discardedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get max days for donation type
  const getMaxDaysForDonationType = (donationType: string): number => {
    switch (donationType) {
      case 'WHOLE_BLOOD': return 42;
      case 'RED_BLOOD_CELLS': return 42;
      case 'PLASMA': return 365;
      case 'PLATELETS': return 5;
      default: return 42;
    }
  };
  // Priority score calculation for sorting
  const getPriorityScore = (unit: BloodUnit): number => {
    // Higher score = higher priority (closer to expiry)
    const daysLeft = unit.daysUntilExpiry;
    if (daysLeft == null) return 0; // No expiry date
    if (daysLeft < 0) return 1000; // Expired - highest priority
    if (daysLeft <= 1) return 100;
    if (daysLeft <= 3) return 50;
    if (daysLeft <= 7) return 20;
    return Math.max(0, 10 - daysLeft); // Anything beyond 7 days gets lower priority
  };
  // Actions template for expiring/expired units
  const expiryActionsTemplate = (rowData: BloodUnit) => {
    const isExpired = (rowData.daysUntilExpiry ?? 0) < 0;
    const canDiscard = rowData.unitStatus !== BloodUnitStatus.DISCARDED && rowData.unitStatus !== BloodUnitStatus.USED;
    
    return (
      <div className="flex gap-2">
        {!isExpired && rowData.unitStatus === BloodUnitStatus.IN_INVENTORY && (
          <Button
            icon="pi pi-truck"
            size="small"
            severity="warning"
            tooltip="Priority Dispatch"
            onClick={() => handlePriorityDispatch(rowData)}
          />
        )}
        {canDiscard && (
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Discard"
            onClick={() => handleDiscardUnit([rowData])}
          />
        )}
        <Button
          icon="pi pi-eye"
          size="small"
          outlined
          tooltip="View Details"
          onClick={() => handleViewDetails(rowData)}
        />
      </div>
    );
  };

  // Handler functions
  const handlePriorityDispatch = (unit: BloodUnit) => {
    confirmDialog({
      message: `Send unit ${unit._id} for priority dispatch due to expiry?`,
      header: "Priority Dispatch",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        toast.current?.show({
          severity: "success",
          summary: "Priority Dispatch",
          detail: `Unit ${unit._id} marked for priority dispatch`,
        });
      },
    });
  };

  const handleDiscardUnit = (units: BloodUnit[]) => {
    setSelectedUnits(units);
    setShowDiscardDialog(true);
  };

  const handleBulkDiscard = () => {
    if (selectedUnits.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No Selection",
        detail: "Please select units to discard",
      });
      return;
    }
    setShowDiscardDialog(true);
  };
  const handleDiscardSubmit = async () => {
    if (!discardForm.discardReason) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please select a discard reason",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedUnits.length === 1) {
        // Single unit discard
        await discardMutation.mutateAsync({
          id: selectedUnits[0]._id,
          data: {
            discardReason: discardForm.discardReason,
            discardedAt: discardForm.discardedAt.toISOString(),
          }
        });      } else {
        // Bulk discard
        await bulkDiscardMutation.mutateAsync(
          selectedUnits.map(unit => unit._id)
        );
      }

      toast.current?.show({
        severity: "success",
        summary: "Units Discarded",
        detail: `${selectedUnits.length} unit(s) have been discarded`,
      });
      
      // Reset form
      setDiscardForm({
        discardReason: "",
        notes: "",
        discardedAt: new Date(),
      });
      setSelectedUnits([]);
      setShowDiscardDialog(false);
      
      // Refetch data
      refetch();
    } catch (error) {
      toast.current?.show({
        severity: "error", 
        summary: "Error",
        detail: "Failed to discard units",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (unit: BloodUnit) => {
    toast.current?.show({
      severity: "info",
      summary: "Unit Details",
      detail: `Viewing details for unit ${unit._id}`,
    });
  };  const handleAutoDiscardExpired = () => {
    const expiredAvailableUnits = expiredUnits.filter((u: BloodUnit) => u.unitStatus === BloodUnitStatus.IN_INVENTORY);
    
    confirmDialog({
      message: `Automatically discard ${expiredAvailableUnits.length} expired units?`,
      header: "Auto-Discard Expired Units",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await bulkDiscardMutation.mutateAsync(
            expiredAvailableUnits.map((unit: BloodUnit) => unit._id)
          );
          
          toast.current?.show({
            severity: "success",
            summary: "Auto-Discard Complete",
            detail: `${expiredAvailableUnits.length} expired units have been discarded`,
          });
          
          refetch();
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to auto-discard expired units",
          });
        }
      },
    });
  };
  // Toolbar templates
  const expiringSoonToolbar = () => (
    <div className="flex justify-content-between">
      <div className="flex gap-2">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          onClick={() => refetch()}
        />
        {selectedUnits.length > 0 && (
          <Button
            label={`Bulk Discard (${selectedUnits.length})`}
            icon="pi pi-trash"
            severity="danger"
            onClick={handleBulkDiscard}
          />
        )}
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <input
            type="text"
            placeholder="Search units..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-inputtext p-component"
          />
        </span>
      </div>
    </div>
  );

  const expiredToolbar = () => (
    <div className="flex justify-content-between">
      <div className="flex gap-2">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          onClick={() => refetch()}
        />
        <Button
          label="Auto-Discard Expired"
          icon="pi pi-trash"
          severity="danger"
          onClick={handleAutoDiscardExpired}
        />
        {selectedUnits.length > 0 && (
          <Button
            label={`Bulk Discard (${selectedUnits.length})`}
            icon="pi pi-trash"
            severity="danger"
            onClick={handleBulkDiscard}
          />
        )}
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <input
            type="text"
            placeholder="Search units..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-inputtext p-component"
          />
        </span>
      </div>
    </div>
  );  // Calculate summary statistics
  const getExpiryStats = () => {
    const today = expiringSoonUnits.filter((u: BloodUnit) => u.daysUntilExpiry === 0).length;
    const tomorrow = expiringSoonUnits.filter((u: BloodUnit) => u.daysUntilExpiry === 1).length;
    const within3Days = expiringSoonUnits.filter((u: BloodUnit) => (u.daysUntilExpiry ?? 0) <= 3 && (u.daysUntilExpiry ?? 0) >= 0).length;
    const within7Days = expiringSoonUnits.filter((u: BloodUnit) => (u.daysUntilExpiry ?? 0) <= 7 && (u.daysUntilExpiry ?? 0) >= 0).length;
    const expired = expiredUnits.length;
    
    return { today, tomorrow, within3Days, within7Days, expired };
  };

  const stats = getExpiryStats();
  return (
    <RoleBasedAccess allowedRoles={[UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION]} fallback={
      <div style={{ 
        textAlign: "center", 
        padding: "3rem 2rem", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "12px",
        border: "1px solid #e9ecef",
        margin: "2rem"
      }}>
        <i className="pi pi-lock" style={{ fontSize: "3rem", color: "#dc3545", marginBottom: "1rem" }}></i>
        <h3 style={{ color: "#dc3545", marginBottom: "1rem" }}>Access Denied</h3>
        <p style={{ color: "#6c757d", marginBottom: "2rem", fontSize: "1.1rem" }}>
          You need appropriate privileges to access the expiry management system.
        </p>
        <Button 
          label="Go Back"
          outlined
          onClick={() => window.history.back()}
        />
      </div>
    }>
      <div className="p-4">
        <Toast ref={toast} />

      {/* Header */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-900 m-0">Expiry Management</h2>
          <p className="text-600 mt-1 mb-0">Monitor and manage blood unit expiration to minimize waste</p>
        </div>
      </div>      {/* Summary Cards */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <Card className="bg-red-50 border-1 border-red-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Expires Today</div>
                <div className="text-900 font-bold text-xl">{stats.today}</div>
              </div>
              <div className="bg-red-500 text-white border-round flex align-items-center justify-content-center" style={{width: '2.5rem', height: '2.5rem'}}>
                <i className="pi pi-exclamation-triangle text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex-1" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <Card className="bg-orange-50 border-1 border-orange-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Tomorrow</div>
                <div className="text-900 font-bold text-xl">{stats.tomorrow}</div>
              </div>
              <div className="bg-orange-500 text-white border-round flex align-items-center justify-content-center" style={{width: '2.5rem', height: '2.5rem'}}>
                <i className="pi pi-clock text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex-1" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <Card className="bg-yellow-50 border-1 border-yellow-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Within 3 Days</div>
                <div className="text-900 font-bold text-xl">{stats.within3Days}</div>
              </div>
              <div className="bg-yellow-500 text-white border-round flex align-items-center justify-content-center" style={{width: '2.5rem', height: '2.5rem'}}>
                <i className="pi pi-calendar text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex-1" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <Card className="bg-blue-50 border-1 border-blue-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Within 7 Days</div>
                <div className="text-900 font-bold text-xl">{stats.within7Days}</div>
              </div>
              <div className="bg-blue-500 text-white border-round flex align-items-center justify-content-center" style={{width: '2.5rem', height: '2.5rem'}}>
                <i className="pi pi-info-circle text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex-1" style={{ minWidth: '200px', maxWidth: '300px' }}>
          <Card className="bg-gray-50 border-1 border-gray-200">
            <div className="flex align-items-center">
              <div className="flex-1">
                <div className="text-500 font-medium">Already Expired</div>
                <div className="text-900 font-bold text-xl">{stats.expired}</div>
              </div>
              <div className="bg-gray-500 text-white border-round flex align-items-center justify-content-center" style={{width: '2.5rem', height: '2.5rem'}}>
                <i className="pi pi-times text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Alert Messages */}
      {stats.expired > 0 && (
        <Message
          severity="error"
          text={`${stats.expired} unit(s) have already expired and require immediate attention`}
          className="mb-3"
        />
      )}
      
      {stats.today > 0 && (
        <Message
          severity="warn"
          text={`${stats.today} unit(s) expire today - consider priority dispatch`}
          className="mb-3"
        />
      )}

      {/* Tab Navigation */}
      <Card className="mb-4">
        <div className="flex gap-2">
          <Button
            label={`Expiring Soon (${expiringSoonUnits.length})`}
            icon="pi pi-clock"
            onClick={() => setActiveTab(0)}
            className={activeTab === 0 ? "p-button" : "p-button-outlined"}
          />
          <Button
            label={`Expired (${expiredUnits.length})`}
            icon="pi pi-times"
            onClick={() => setActiveTab(1)}
            className={activeTab === 1 ? "p-button" : "p-button-outlined"}
          />
          <Button
            label={`Discarded (${discardedUnits.length})`}
            icon="pi pi-trash"
            onClick={() => setActiveTab(2)}
            className={activeTab === 2 ? "p-button" : "p-button-outlined"}
          />
        </div>
      </Card>      {/* Expiring Soon Tab */}
      {activeTab === 0 && (
        <Card>
          <div className="mb-4">
            {expiringSoonToolbar()}
          </div>
            <DataTable
            value={expiringSoonUnits.sort((a: BloodUnit, b: BloodUnit) => getPriorityScore(b) - getPriorityScore(a))}
            loading={inventoryLoading}
            selection={selectedUnits}
            onSelectionChange={(e) => setSelectedUnits(e.value as BloodUnit[])}
            selectionMode="multiple"
            dataKey="_id"
            paginator
            rows={25}
            globalFilter={globalFilter}
            emptyMessage="No units expiring soon"
            className="p-datatable-striped"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            
            <Column
              field="_id"
              header="Unit ID"
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="bloodType"
              header="Blood Type"
              body={bloodTypeBodyTemplate}
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="donationType"
              header="Type"
              sortable
              style={{ minWidth: '10rem' }}
            />
            
            <Column
              header="Expiry Status"
              body={expiryStatusTemplate}
              sortable
              style={{ minWidth: '15rem' }}
            />
            
            <Column
              field="collectionDate"
              header="Collection Date"
              sortable
              body={(rowData) => new Date(rowData.collectionDate).toLocaleDateString()}
              style={{ minWidth: '10rem' }}
            />
            
            <Column
              header="Actions"
              body={expiryActionsTemplate}
              style={{ minWidth: '12rem' }}
            />
          </DataTable>
        </Card>
      )}      {/* Expired Tab */}
      {activeTab === 1 && (
        <Card>
          <div className="mb-4">
            {expiredToolbar()}
          </div>
          
          <DataTable
            value={expiredUnits}
            loading={inventoryLoading}
            selection={selectedUnits}
            onSelectionChange={(e) => setSelectedUnits(e.value as BloodUnit[])}
            selectionMode="multiple"
            dataKey="_id"
            paginator
            rows={25}
            globalFilter={globalFilter}
            emptyMessage="No expired units"
            className="p-datatable-striped"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            
            <Column
              field="_id"
              header="Unit ID"
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="bloodType"
              header="Blood Type"
              body={bloodTypeBodyTemplate}
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="donationType"
              header="Type"
              sortable
              style={{ minWidth: '10rem' }}
            />
            
            <Column
              header="Expiry Status"
              body={expiryStatusTemplate}
              sortable
              style={{ minWidth: '15rem' }}
            />
            
            <Column
              field="unitStatus"
              header="Current Status"
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              header="Actions"
              body={expiryActionsTemplate}
              style={{ minWidth: '12rem' }}
            />
          </DataTable>
        </Card>
      )}

      {/* Discarded Tab */}
      {activeTab === 2 && (
        <Card>
          <DataTable
            value={discardedUnits}
            loading={loading}
            dataKey="_id"
            paginator
            rows={25}
            globalFilter={globalFilter}
            emptyMessage="No discarded units"
            className="p-datatable-striped"
          >
            <Column
              field="_id"
              header="Unit ID"
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="bloodType"
              header="Blood Type"
              body={bloodTypeBodyTemplate}
              sortable
              style={{ minWidth: '8rem' }}
            />
            
            <Column
              field="donationType"
              header="Type"
              sortable
              style={{ minWidth: '10rem' }}
            />
            
            <Column
              header="Discard Info"
              body={discardInfoTemplate}
              style={{ minWidth: '12rem' }}
            />
            
            <Column
              field="expiryDate"
              header="Original Expiry"
              sortable
              body={(rowData) => new Date(rowData.expiryDate).toLocaleDateString()}
              style={{ minWidth: '10rem' }}
            />
          </DataTable>
        </Card>
      )}

      {/* Discard Dialog */}
      <Dialog
        header="Discard Blood Units"
        visible={showDiscardDialog}
        onHide={() => setShowDiscardDialog(false)}
        style={{ width: '500px' }}
        modal
      >
        <div className="grid">
          <div className="col-12">
            <div className="mb-3">
              <strong>Units to discard: </strong>
              {selectedUnits.map(unit => unit._id).join(', ')}
            </div>
            <Divider />
          </div>
            <div className="col-12">
            <label className="block text-900 font-medium mb-2">Discard Reason *</label>
            <Dropdown
              value={discardForm.discardReason}
              options={discardReasons}
              onChange={(e) => setDiscardForm({...discardForm, discardReason: e.value})}
              placeholder="Select Reason"
              className="w-full"
            />
          </div>
          
          <div className="col-12">
            <label className="block text-900 font-medium mb-2">Discard Date</label>
            <Calendar
              value={discardForm.discardedAt}
              onChange={(e) => setDiscardForm({...discardForm, discardedAt: e.value || new Date()})}
              className="w-full"
              showTime
              hourFormat="24"
            />
          </div>
          
          <div className="col-12">
            <label className="block text-900 font-medium mb-2">Additional Notes</label>
            <InputTextarea
              value={discardForm.notes}
              onChange={(e) => setDiscardForm({...discardForm, notes: e.target.value})}
              placeholder="Additional details about the discard reason..."
              rows={3}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            outlined
            onClick={() => setShowDiscardDialog(false)}
          />
          <Button
            label="Discard Units"
            icon="pi pi-trash"
            severity="danger"
            loading={loading}
            onClick={handleDiscardSubmit}
          />        </div>
      </Dialog>
    </div>
    </RoleBasedAccess>
  );
};

export default ExpiryManagementPage;
