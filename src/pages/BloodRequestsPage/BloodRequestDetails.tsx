// Detail view for a single blood request
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { useBloodRequest, useUpdateBloodRequestStatus, useDeleteBloodRequest } from '../../state/bloodRequests';
import { RequestStatus, RequestPriority } from './types';
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
      <div className="flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
        <span className="ml-2">Loading blood request details...</span>
      </div>
    );
  }

  if (isError || !bloodRequest) {
    return (
      <div className="text-danger">
        Error loading blood request: {(error as Error)?.message || 'Blood request not found'}
        <div className="mt-3">
          <Link to="/blood-requests" className="text-primary underline-hover">
            Back to Blood Requests
          </Link>
        </div>
      </div>
    );
  }

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

  const handleStatusChange = async (newStatus: RequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        id: bloodRequest.id, 
        status: newStatus 
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Blood request status updated to ${newStatus}`,
        life: 3000
      });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update blood request status',
        life: 3000
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
          await deleteMutation.mutateAsync(bloodRequest.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Request Deleted',
            detail: 'Blood request has been deleted successfully',
            life: 3000
          });
          navigate('/blood-requests');
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Delete Failed',
            detail: 'Failed to delete blood request',
            life: 3000
          });
        }
      }
    });
  };

  const statusOptions = Object.values(RequestStatus).map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status
  }));

  return (
    <div className="flex flex-column gap-4" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="mb-3">
        <Link to="/blood-requests" className="text-primary underline-hover">
          &larr; Back to Blood Requests
        </Link>
      </div>
      <Card>
        <div className="flex justify-content-between align-items-center mb-3">
          <div className="flex align-items-center gap-2">
            <h1 className="m-0">Blood Request: {String(bloodRequest.bloodType)}{bloodRequest.RhFactor}</h1>
            {getPriorityTag(bloodRequest.priority)}
          </div>
          <div>
            <Tag 
              value={bloodRequest.status.toUpperCase()} 
              severity={
                bloodRequest.status === RequestStatus.FULFILLED ? 'success' :
                bloodRequest.status === RequestStatus.PENDING ? 'info' :
                bloodRequest.status === RequestStatus.PARTIALLY_FULFILLED ? 'warning' : 'danger'
              } 
            />
          </div>
        </div>

        <div className="grid">
          <div className="col-12 md:col-6">
            <h2>Request Information</h2>
            <div style={{ lineHeight: 1.7 }}>
              <div><b>Institution:</b> {bloodRequest.institution.name}</div>
              <div><b>Blood Type:</b> {String(bloodRequest.bloodType)}{bloodRequest.RhFactor}</div>
              <div><b>Units Required:</b> {bloodRequest.unitsRequired}</div>
              <div><b>Priority:</b> {bloodRequest.priority}</div>
              <div><b>Required By:</b> {formatDate(bloodRequest.requiredBy)} ({formatDistanceToNow(new Date(bloodRequest.requiredBy), { addSuffix: true })})</div>
              {bloodRequest.patientCondition && (
                <div><b>Patient Condition:</b> {bloodRequest.patientCondition}</div>
              )}
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <h2>Additional Information</h2>
            <div style={{ lineHeight: 1.7 }}>
              <div><b>Created:</b> {formatDate(bloodRequest.createdAt)}</div>
              <div><b>Last Updated:</b> {formatDate(bloodRequest.updatedAt)}</div>
              <div><b>Status:</b> {bloodRequest.status}</div>
              <div><b>Notify Nearby Donors:</b> {bloodRequest.notifyNearbyDonors ? 'Yes' : 'No'}</div>
              {bloodRequest.notificationRadius && (
                <div><b>Notification Radius:</b> {bloodRequest.notificationRadius} km</div>
              )}
            </div>
          </div>
        </div>

        {bloodRequest.notes && (
          <div className="mt-4">
            <h2>Notes</h2>
            <div className="p-3 border-1 surface-border border-round">
              {bloodRequest.notes}
            </div>
          </div>
        )}

        {bloodRequest.coordinates && (
          <div className="mt-4">
            <h2>Location</h2>
            <div><b>Coordinates:</b> {bloodRequest.coordinates[1]}, {bloodRequest.coordinates[0]}</div>
            <div style={{ height: 180, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              Map view would be displayed here
            </div>
          </div>
        )}

        <div className="flex flex-column md:flex-row justify-content-between gap-3 mt-4">
          <div className="flex align-items-center gap-2">
            <span className="font-bold">Update Status:</span>
            <Dropdown
              value={bloodRequest.status}
              options={statusOptions}
              onChange={(e) => handleStatusChange(e.value)}
              placeholder="Select Status"
            />
          </div>
          <div className="flex gap-2">
            <Link to={`/blood-requests/edit/${bloodRequest.id}`}>
              <Button label="Edit" icon="pi pi-pencil" className="p-button-primary" />
            </Link>
            <Button 
              label="Delete" 
              icon="pi pi-trash" 
              className="p-button-danger" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BloodRequestDetails;
