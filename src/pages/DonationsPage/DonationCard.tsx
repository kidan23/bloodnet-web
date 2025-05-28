import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import type { Donation } from './types';
import { DonationStatus } from './constants';

interface DonationCardProps {
  donation: Donation;
  showDonorInfo?: boolean;
  showBloodBankInfo?: boolean;
}

const DonationCard: React.FC<DonationCardProps> = ({ 
  donation, 
  showDonorInfo = true,
  showBloodBankInfo = true 
}) => {
  const formatDate = (dateString: string) => {
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

  return (
    <Card className="mb-3">
      <div className="flex flex-column md:flex-row justify-content-between align-items-start">
        <div className="flex-1">
          <div className="text-xl font-bold mb-2">
            Donation {donation.id.substring(0, 8)} - {formatDate(donation.donationDate)}
          </div>
          
          <div className="grid">
            <div className="col-12 md:col-6">
              {showDonorInfo && (
                <p className="m-0 mb-2">
                  <i className="pi pi-user mr-2"></i>
                  Donor: {donation.donorName || 'Unknown'}
                </p>
              )}
              
              {showBloodBankInfo && (
                <p className="m-0 mb-2">
                  <i className="pi pi-building mr-2"></i>
                  Blood Bank: {donation.bloodBankName || 'Unknown'}
                </p>
              )}
              
              <p className="m-0 mb-2">
                <i className="pi pi-calendar mr-2"></i>
                Date: {formatDate(donation.donationDate)}
              </p>
            </div>
            
            <div className="col-12 md:col-6">
              <p className="m-0 mb-2">
                <i className="pi pi-tag mr-2"></i>
                Status: <Tag value={donation.status} severity={getStatusSeverity(donation.status)} />
              </p>
              
              {donation.volumeCollected && (
                <p className="m-0 mb-2">
                  <i className="pi pi-chart-bar mr-2"></i>
                  Volume: {donation.volumeCollected} ml
                </p>
              )}
              
              {donation.donationType && (
                <p className="m-0 mb-2">
                  <i className="pi pi-heart mr-2"></i>
                  Type: {donation.donationType}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3 md:mt-0">
          <Link to={`/donations/${donation.id}`}>
            <Button 
              icon="pi pi-eye" 
              label="View Details" 
              className="p-button-outlined mr-2"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default DonationCard;
