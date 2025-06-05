// Modern detail view for a single blood request
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { useBloodRequest, useUpdateBloodRequestStatus, useDeleteBloodRequest } from '../../state/bloodRequests';
import { RequestStatus, RequestPriority } from './types';
import { extractErrorForToast } from "../../utils/errorHandling";
import { formatDistanceToNow } from 'date-fns';
import { useGlobalToast } from '../../components/layout/ToastContext';
import { confirmDialog } from 'primereact/confirmdialog';

const BloodRequestDetails: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useGlobalToast();
  
  const { 
    data: bloodRequest, 
    isLoading, 
    isError, 
    error 
  } = useBloodRequest(id);

  const updateStatusMutation = useUpdateBloodRequestStatus();
  const deleteMutation = useDeleteBloodRequest();
  if (isLoading) {
    return (
      <div className="p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <div
          className="flex flex-column justify-content-center align-items-center border-round-lg shadow-2"
          style={{ 
            minHeight: "400px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          <div 
            className="border-circle flex align-items-center justify-content-center mb-3"
            style={{ 
              width: "60px", 
              height: "60px", 
              backgroundColor: "#f1f5f9",
              animation: "pulse 2s infinite"
            }}
          >
            <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: "1.5rem" }}></i>
          </div>
          <span className="text-lg font-medium text-700">Loading blood request details...</span>
          <span className="text-sm text-500 mt-1">Please wait while we fetch the request information</span>
        </div>
      </div>
    );
  }

  if (isError || !bloodRequest) {
    return (
      <div className="p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <div 
          className="border-round-lg shadow-2 p-5 text-center"
          style={{ 
            backgroundColor: "white",
            border: "1px solid #fecaca",
            borderLeft: "6px solid #dc2626",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          <div 
            className="border-circle flex align-items-center justify-content-center mx-auto mb-3"
            style={{ 
              width: "60px", 
              height: "60px", 
              backgroundColor: "#fef2f2"
            }}
          >
            <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: "1.5rem" }}></i>
          </div>
          <h3 className="text-900 mb-2">Blood Request Not Found</h3>
          <p className="text-600 mb-3">
            {(error as Error)?.message || 'The requested blood request could not be found.'}
          </p>
          <Link to="/blood-requests" className="no-underline">
            <Button 
              label="Back to Blood Requests" 
              icon="pi pi-arrow-left" 
              className="p-button-outlined"
            />
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
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
  const handleStatusChange = async (newStatus: RequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        id: bloodRequest._id, 
        status: newStatus 
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Blood request status updated to ${newStatus}`,
        life: 3000
      });    } catch (err) {
      const { summary, detail } = extractErrorForToast(err);
      toast.current?.show({
        severity: 'error',
        summary,
        detail,
        life: 5000
      });
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: 'Are you sure you want to delete this blood request?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(bloodRequest._id);
          toast.current?.show({
            severity: 'success',
            summary: 'Request Deleted',
            detail: 'Blood request has been deleted successfully',
            life: 3000
          });
          navigate('/blood-requests');        } catch (err) {
          const { summary, detail } = extractErrorForToast(err);
          toast.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 5000
          });
        }
      }
    });
  };
  const statusOptions = Object.values(RequestStatus).map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status
  }));

  const priorityConfig = getPriorityConfig(bloodRequest.priority);
  const statusConfig = getStatusConfig(bloodRequest.status);
  const isUrgent = bloodRequest.priority === RequestPriority.CRITICAL || 
                   bloodRequest.priority === RequestPriority.HIGH;

  return (
    <div className="p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
      `}</style>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Back Navigation */}
        <div className="mb-4">
          <Link to="/blood-requests" className="no-underline">
            <Button 
              label="Back to Blood Requests" 
              icon="pi pi-arrow-left" 
              className="p-button-text p-button-plain"
              style={{ color: "#6b7280" }}
            />
          </Link>
        </div>

        {/* Main Content */}
        <div 
          className="border-round-lg shadow-2"
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
            className="p-4 border-bottom-1 border-200"
            style={{ backgroundColor: priorityConfig.bgColor }}
          >
            <div className="flex justify-content-between align-items-start mb-3">
              <div className="flex align-items-center gap-3">
                <div 
                  className="flex align-items-center justify-content-center border-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: priorityConfig.borderColor,
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "bold"
                  }}
                >
                  {String(bloodRequest.bloodType)}{bloodRequest.RhFactor}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-900 m-0 mb-2">
                    Blood Request Details
                  </h1>
                  <div className="flex align-items-center gap-2">
                    <span className="text-lg font-semibold">{bloodRequest.unitsRequired} units needed</span>
                    <i className={priorityConfig.icon} style={{ color: priorityConfig.borderColor }}></i>
                    <Tag 
                      value={priorityConfig.label} 
                      severity={priorityConfig.severity}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex align-items-center gap-2">
                <i className={statusConfig.icon} style={{ color: "#6b7280" }}></i>
                <Tag 
                  value={statusConfig.label} 
                  severity={statusConfig.severity}
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-4">
            <div className="grid">
              {/* Request Information */}
              <div className="col-12 lg:col-6">
                <div 
                  className="border-round-lg p-4 h-full"
                  style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
                >
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-info-circle text-primary"></i>
                    <h3 className="text-lg font-semibold text-900 m-0">Request Information</h3>
                  </div>
                  
                  <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-building text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Institution:</span>
                      <span className="font-medium text-900">{bloodRequest.institution.name}</span>
                    </div>
                    
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-heart text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Blood Type:</span>
                      <span className="font-medium text-900">{String(bloodRequest.bloodType)}{bloodRequest.RhFactor}</span>
                    </div>
                    
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-chart-bar text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Units Required:</span>
                      <span className="font-medium text-900">{bloodRequest.unitsRequired}</span>
                    </div>
                    
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-calendar text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Required By:</span>
                      <span className="font-medium text-900">
                        {formatDate(bloodRequest.requiredBy)} 
                        <span className="text-sm text-500 ml-2">
                          ({formatDistanceToNow(new Date(bloodRequest.requiredBy), { addSuffix: true })})
                        </span>
                      </span>
                    </div>
                    
                    {bloodRequest.patientCondition && (
                      <div className="flex align-items-start gap-2">
                        <i className="pi pi-user text-600 mt-1" style={{ width: "16px" }}></i>
                        <span className="text-sm text-600 w-6">Condition:</span>
                        <span className="font-medium text-900 line-height-3">{bloodRequest.patientCondition}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-12 lg:col-6">
                <div 
                  className="border-round-lg p-4 h-full"
                  style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
                >
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-cog text-primary"></i>
                    <h3 className="text-lg font-semibold text-900 m-0">Additional Details</h3>
                  </div>
                  
                  <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-clock text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Created:</span>
                      <span className="font-medium text-900">{formatDate(bloodRequest.createdAt)}</span>
                    </div>
                    
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-refresh text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Updated:</span>
                      <span className="font-medium text-900">{formatDate(bloodRequest.updatedAt)}</span>
                    </div>
                    
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-bell text-600" style={{ width: "16px" }}></i>
                      <span className="text-sm text-600 w-6">Notify Donors:</span>
                      <span className="font-medium text-900">{bloodRequest.notifyNearbyDonors ? 'Yes' : 'No'}</span>
                    </div>
                    
                    {bloodRequest.notificationRadius && (
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-map-marker text-600" style={{ width: "16px" }}></i>
                        <span className="text-sm text-600 w-6">Radius:</span>
                        <span className="font-medium text-900">{bloodRequest.notificationRadius} km</span>
                      </div>
                    )}

                    {bloodRequest.coordinates && (
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-globe text-600" style={{ width: "16px" }}></i>
                        <span className="text-sm text-600 w-6">Location:</span>
                        <span className="font-medium text-900 text-sm">
                          {bloodRequest.coordinates[1].toFixed(4)}, {bloodRequest.coordinates[0].toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {bloodRequest.notes && (
              <div className="mt-4">
                <div 
                  className="border-round-lg p-4"
                  style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
                >
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-file-edit text-primary"></i>
                    <h3 className="text-lg font-semibold text-900 m-0">Notes</h3>
                  </div>
                  <div 
                    className="p-3 border-round-lg line-height-3"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    {bloodRequest.notes}
                  </div>
                </div>
              </div>
            )}

            {/* Map Section */}
            {bloodRequest.coordinates && (
              <div className="mt-4">
                <div 
                  className="border-round-lg p-4"
                  style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
                >
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-map text-primary"></i>
                    <h3 className="text-lg font-semibold text-900 m-0">Location</h3>
                  </div>
                  <div 
                    className="border-round-lg flex align-items-center justify-content-center"
                    style={{ 
                      height: "200px", 
                      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                      border: "2px dashed #d1d5db",
                      color: "#6b7280"
                    }}
                  >
                    <div className="text-center">
                      <i className="pi pi-map mb-2" style={{ fontSize: "2rem" }}></i>
                      <div>Interactive map would be displayed here</div>
                      <div className="text-sm mt-1">Coordinates: {bloodRequest.coordinates[1].toFixed(4)}, {bloodRequest.coordinates[0].toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Section */}
            <div className="mt-4">
              <div 
                className="border-round-lg p-4"
                style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
              >
                <div className="flex flex-column lg:flex-row justify-content-between align-items-start gap-4">
                  <div className="flex align-items-center gap-3">
                    <i className="pi pi-cog text-primary"></i>
                    <span className="font-semibold text-900">Update Status:</span>
                    <Dropdown
                      value={bloodRequest.status}
                      options={statusOptions}
                      onChange={(e) => handleStatusChange(e.value)}
                      placeholder="Select Status"
                      className="w-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/blood-requests/edit/${bloodRequest._id}`} className="no-underline">
                      <Button 
                        label="Edit Request" 
                        icon="pi pi-pencil" 
                        className="p-button-outlined"
                        style={{ borderColor: priorityConfig.borderColor, color: priorityConfig.borderColor }}
                      />
                    </Link>
                    <Button 
                      label="Delete" 
                      icon="pi pi-trash" 
                      className="p-button-danger p-button-outlined" 
                      onClick={confirmDelete}
                      disabled={deleteMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestDetails;
