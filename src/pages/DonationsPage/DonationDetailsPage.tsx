import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useDonation, useDeleteDonation } from '../../state/donations';
import { useUserRole } from '../../state/authContext';
import { UserRole } from '../../state/auth';
import { DonationStatus } from './constants';
import { useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const DonationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const userRole = useUserRole();
  const canEdit = [UserRole.ADMIN, UserRole.HOSPITAL].includes(userRole);
  const canDelete = userRole === UserRole.ADMIN;
  
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const { data: donation, isLoading, isError } = useDonation(id);
  const deleteMutation = useDeleteDonation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case DonationStatus.COMPLETED:
        return 'success';
      case DonationStatus.SCHEDULED:
        return 'info';
      case DonationStatus.PENDING:
        return 'warning';
      case DonationStatus.CANCELLED:
      case DonationStatus.NO_SHOW:
      case DonationStatus.FAILED:
        return 'danger';
      case DonationStatus.DEFERRED:
        return 'secondary';
      default:
        return 'info';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Donation record deleted successfully', 
        life: 3000 
      });
      navigate('/donations');
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to delete donation record', 
        life: 3000 
      });
    }
    setDeleteDialogVisible(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-content-center p-5">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        <span className="ml-2">Loading donation details...</span>
      </div>
    );
  }

  if (isError || !donation) {
    return (
      <div className="p-5">
        <Link to="/donations">
          <Button label="Back to Donations" icon="pi pi-arrow-left" className="mb-3" />
        </Link>
        <div className="p-message p-message-error mt-3">
          <i className="pi pi-times-circle p-message-icon"></i>
          <span className="p-message-text">Donation not found or failed to load donation data.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Toast ref={toast} />
      
      <Link to="/donations">
        <Button label="Back to Donations" icon="pi pi-arrow-left" className="mb-3" />
      </Link>
      
      <Card className="mb-4">
        <div className="flex flex-column md:flex-row justify-content-between align-items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold m-0">
              Donation Record
            </h2>
            <Tag 
              value={donation.status} 
              severity={getStatusSeverity(donation.status)} 
              className="mt-2"
              style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
            />
          </div>
          
          <div className="mt-3 md:mt-0 flex">
            {canEdit && (
              <Link to={`/donations/edit/${donation.id}`}>
                <Button 
                  label="Edit" 
                  icon="pi pi-pencil" 
                  className="p-button-outlined mr-2"
                />
              </Link>
            )}
            
            {canDelete && (
              <Button 
                label="Delete" 
                icon="pi pi-trash" 
                className="p-button-danger p-button-outlined"
                onClick={() => setDeleteDialogVisible(true)}
              />
            )}
          </div>
        </div>

        <div className="grid">
          <div className="col-12 md:col-6">
            <h3>General Information</h3>
            <p><strong>Donor:</strong> {donation.donorName || 'N/A'}</p>
            <p><strong>Blood Bank:</strong> {donation.bloodBankName || 'N/A'}</p>
            <p><strong>Donation Date:</strong> {formatDate(donation.donationDate)}</p>
            <p><strong>Status:</strong> {donation.status}</p>
            {donation.nextEligibleDonationDate && (
              <p><strong>Next Eligible Date:</strong> {formatDate(donation.nextEligibleDonationDate)}</p>
            )}
          </div>
          
          <div className="col-12 md:col-6">
            <h3>Donation Details</h3>
            <p><strong>Type:</strong> {donation.donationType || 'N/A'}</p>
            <p><strong>Volume Collected:</strong> {donation.volumeCollected ? `${donation.volumeCollected} ml` : 'N/A'}</p>
            <p><strong>Bag Number:</strong> {donation.bagNumber || 'N/A'}</p>
            <p><strong>Collection Method:</strong> {donation.collectionMethod || 'N/A'}</p>
            <p><strong>Staff:</strong> {donation.phlebotomist || 'N/A'}</p>
          </div>
        </div>

        {(donation.weight || donation.height || donation.hemoglobinLevel || 
          donation.bloodPressureSystolic || donation.bloodPressureDiastolic || 
          donation.pulseRate || donation.temperature) && (
          <div className="mt-4">
            <h3>Medical Metrics</h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                {donation.weight && <p><strong>Weight:</strong> {donation.weight} kg</p>}
                {donation.height && <p><strong>Height:</strong> {donation.height} cm</p>}
                {donation.hemoglobinLevel && <p><strong>Hemoglobin:</strong> {donation.hemoglobinLevel} g/dL</p>}
              </div>
              <div className="col-12 md:col-6">
                {(donation.bloodPressureSystolic && donation.bloodPressureDiastolic) && 
                  <p><strong>Blood Pressure:</strong> {donation.bloodPressureSystolic}/{donation.bloodPressureDiastolic} mmHg</p>
                }
                {donation.pulseRate && <p><strong>Pulse Rate:</strong> {donation.pulseRate} bpm</p>}
                {donation.temperature && <p><strong>Temperature:</strong> {donation.temperature}°C</p>}
              </div>
            </div>
          </div>
        )}

        {(donation.adverseReaction || donation.notes) && (
          <div className="mt-4">
            <h3>Additional Information</h3>
            {donation.adverseReaction && (
              <div className="mb-3">
                <p><strong>Adverse Reaction:</strong> Yes</p>
                {donation.adverseReactionDetails && (
                  <p><strong>Details:</strong> {donation.adverseReactionDetails}</p>
                )}
              </div>
            )}
            
            {donation.notes && (
              <div>
                <p><strong>Notes:</strong></p>
                <div className="p-2 border-1 surface-border border-round">
                  {donation.notes}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-color-secondary">
          <p>Created: {formatDate(donation.createdAt)}</p>
          {donation.updatedAt && <p>Last Updated: {formatDate(donation.updatedAt)}</p>}
        </div>
      </Card>

      <Dialog 
        header="Confirm Deletion" 
        visible={deleteDialogVisible} 
        style={{ width: '450px' }} 
        modal 
        footer={(
          <div>
            <Button label="No" icon="pi pi-times" onClick={() => setDeleteDialogVisible(false)} className="p-button-text" />
            <Button label="Yes" icon="pi pi-check" onClick={handleDelete} autoFocus />
          </div>
        )} 
        onHide={() => setDeleteDialogVisible(false)}
      >
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'var(--orange-500)' }} />
          <span>Are you sure you want to delete this donation record? This action cannot be undone.</span>
        </div>
      </Dialog>
    </div>
  );
};

export default DonationDetailsPage;
