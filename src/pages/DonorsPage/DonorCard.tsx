import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import type { Donor } from "./types";

interface DonorCardProps {
  donor: Donor;
  onViewDetails?: (id: string) => void;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor, onViewDetails }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const bloodTypeWithRh = `${donor.bloodType}${donor.RhFactor}`;
  
  const handleViewDetails = () => {
    if (onViewDetails && donor._id) {
      onViewDetails(donor._id);
    }
  };

  return (
    <Card className="mb-3">
      <div className="flex flex-column md:flex-row justify-content-between align-items-start">
        <div className="flex-1">
          <div className="text-xl font-bold mb-2">
            {donor.firstName} {donor.lastName}
          </div>
          <div className="grid">
            <div className="col-12 md:col-6">
              <p className="m-0 mb-2">
                <i className="pi pi-phone mr-2"></i>
                {donor.phoneNumber}
              </p>
              {donor.email && (
                <p className="m-0 mb-2">
                  <i className="pi pi-envelope mr-2"></i>
                  {donor.email}
                </p>
              )}
              <p className="m-0 mb-2">
                <i className="pi pi-calendar mr-2"></i>
                Age: {donor.age || "N/A"}
              </p>
              <p className="m-0 mb-2">
                <i className="pi pi-map-marker mr-2"></i>
                {donor.city ? `${donor.city}, ${donor.state || ""}` : "Location not specified"}
              </p>
            </div>
            <div className="col-12 md:col-6">
              <div className="mb-2">
                <Tag 
                  severity="info" 
                  value={bloodTypeWithRh}
                  style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
                />
              </div>
              <p className="m-0 mb-2">
                <strong>Last Donation:</strong> {formatDate(donor.lastDonationDate)}
              </p>
              <p className="m-0 mb-2">
                <strong>Total Donations:</strong> {donor.totalDonations || 0}
              </p>
              {donor.nextEligibleDate && (
                <p className="m-0">
                  <strong>Next Eligible Date:</strong> {formatDate(donor.nextEligibleDate)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-0">
          <Button 
            icon="pi pi-eye" 
            label="View Details"
            className="p-button-outlined"
            onClick={handleViewDetails}
          />
        </div>
      </div>
    </Card>
  );
};

export default DonorCard;