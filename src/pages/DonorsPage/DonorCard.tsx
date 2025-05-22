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
                Age:{" "}
                {donor.dateOfBirth
                  ? (() => {
                      const dob = new Date(donor.dateOfBirth);
                      const today = new Date();
                      let age = today.getFullYear() - dob.getFullYear();
                      const m = today.getMonth() - dob.getMonth();
                      if (
                        m < 0 ||
                        (m === 0 && today.getDate() < dob.getDate())
                      ) {
                        age--;
                      }
                      // Calculate days since last birthday
                      let lastBirthday = new Date(
                        today.getFullYear(),
                        dob.getMonth(),
                        dob.getDate()
                      );
                      if (today < lastBirthday) {
                        lastBirthday.setFullYear(today.getFullYear() - 1);
                      }
                      const diffTime = Math.abs(
                        today.getTime() - lastBirthday.getTime()
                      );
                      const diffDays = Math.floor(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      return `${age} years, ${diffDays} days`;
                    })()
                  : "N/A"}
              </p>
              <p className="m-0 mb-2">
                <i className="pi pi-map-marker mr-2"></i>
                {donor.city
                  ? `${donor.city}, ${donor.state || ""}`
                  : "Location not specified"}
              </p>
            </div>
            <div className="col-12 md:col-6">
              <div className="mb-2">
                <Tag
                  severity="info"
                  value={bloodTypeWithRh}
                  style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
                />
              </div>
              <p className="m-0 mb-2">
                <strong>Last Donation:</strong>{" "}
                {formatDate(donor.lastDonationDate)}
              </p>
              <p className="m-0 mb-2">
                <strong>Total Donations:</strong> {donor.totalDonations || 0}
              </p>
              {donor.nextEligibleDate && (
                <p className="m-0">
                  <strong>Next Eligible Date:</strong>{" "}
                  {formatDate(donor.nextEligibleDate)}
                </p>
              )}
            </div>
          </div>        </div>
        <div className="mt-3 md:mt-0">
          <Link to={`/donors/${donor._id}`}>
            <Button
              icon="pi pi-eye"
              label="View Details"
              className="p-button-outlined"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default DonorCard;
