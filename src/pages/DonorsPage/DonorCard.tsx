import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Link } from "react-router-dom";
import type { Donor } from "./types";

interface DonorCardProps {
  donor: Donor;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  const bloodTypeWithRh = `${donor.bloodType}${donor.RhFactor}`;
  const calculateAge = () => {
    if (!donor.dateOfBirth) return "N/A";
    const dob = new Date(donor.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  return (
    <Card className="h-full">
      <div className="flex flex-column h-full">
        {/* Header with name and blood type */}
        <div className="flex justify-content-between align-items-start mb-3">
          <div className="text-lg font-bold text-primary">
            {donor.firstName} {donor.lastName}
          </div>
          <Tag
            severity="info"
            value={bloodTypeWithRh}
            style={{ fontSize: "0.9rem", padding: "0.25rem 0.75rem" }}
          />
        </div>

        {/* Key info in compact format */}
        <div className="flex-1 mb-3">
          <div className="mb-2">
            <i className="pi pi-phone text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
            <span className="text-sm">{donor.phoneNumber}</span>
          </div>
          
          {donor.email && (
            <div className="mb-2">
              <i className="pi pi-envelope text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
              <span className="text-sm">{donor.email}</span>
            </div>
          )}
          
          <div className="mb-2">
            <i className="pi pi-calendar text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
            <span className="text-sm">{calculateAge()}</span>
          </div>
          
          <div className="mb-2">
            <i className="pi pi-map-marker text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
            <span className="text-sm">
              {donor.city ? `${donor.city}, ${donor.state || ""}` : "Location not specified"}
            </span>
          </div>
          
          <div className="mt-3 pt-2 border-top-1 surface-border">
            <div className="text-sm text-600 mb-1">
              <strong>Donations:</strong> {donor.totalDonations || 0}
            </div>
            <div className="text-sm text-600">
              <strong>Last:</strong> {formatDate(donor.lastDonationDate)}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-auto">
          <Link to={`/donors/${donor._id}`} className="w-full">
            <Button
              icon="pi pi-eye"
              label="View Details"
              className="p-button-outlined w-full p-button-sm"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default DonorCard;
