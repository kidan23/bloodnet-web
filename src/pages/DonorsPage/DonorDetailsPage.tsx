import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Paginator } from "primereact/paginator";
import { useDonor } from "../../state/donors";
import { useDonations } from "../../state/donations";

const DonorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: donor, isLoading: isDonorLoading } = useDonor(id);
    // Pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);
  const currentPage = Math.floor(first / rows);

  const { data: donationsData, isLoading: isDonationsLoading } = useDonations({ 
    donorId: id,
    page: currentPage,
    pageSize: rows 
  });
  
  // Extract donations and pagination info
  const donations = donationsData?.content || [];
  const totalRecords = donationsData?.totalElements || 0;

  // Handle pagination change
  const onPageChange = (event: { first: number; rows: number }) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  if (isDonorLoading) {
    return (
      <div className="flex justify-content-center p-5">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        <span className="ml-2">Loading donor details...</span>
      </div>
    );
  }
  if (!donor) {
    return (
      <div className="p-5">
        <Link to="/donors">
          <Button label="Back to Donors" icon="pi pi-arrow-left" className="mb-3" />
        </Link>
        <div className="p-message p-message-error mt-3">
          <i className="pi pi-times-circle p-message-icon"></i>
          <span className="p-message-text">Donor not found or failed to load donor data.</span>
        </div>
      </div>
    );
  }return (
    <div className="p-4 max-w-3xl mx-auto">
      <Link to="/donors">
        <Button label="Back to Donors" icon="pi pi-arrow-left" className="mb-3" />
      </Link>
      <Card className="mb-4">
        <div className="flex flex-column md:flex-row justify-content-between align-items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold m-0">{donor.firstName} {donor.lastName}</h2>
            <Tag 
              value={`${donor.bloodType}${donor.RhFactor}`} 
              severity="info" 
              className="mt-2"
              style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
            />
          </div>
          <div className="mt-3 md:mt-0">
            <Tag 
              value={donor.isEligible ? "Eligible to Donate" : "Not Eligible"} 
              severity={donor.isEligible ? "success" : "warning"}
            />
          </div>
        </div>

        <div className="grid">
          <div className="col-12 md:col-6">
            <h3>Personal Information</h3>
            <p><i className="pi pi-phone mr-2"></i>{donor.phoneNumber}</p>
            {donor.email && <p><i className="pi pi-envelope mr-2"></i>{donor.email}</p>}
            <p><i className="pi pi-calendar mr-2"></i>Date of Birth: {formatDate(donor.dateOfBirth)}</p>
            <p><i className="pi pi-user mr-2"></i>Gender: {donor.gender}</p>
            <p><i className="pi pi-map-marker mr-2"></i>
              {donor.address ? donor.address : ''}
              {donor.city ? (donor.address ? ', ' : '') + donor.city : ''}
              {donor.state ? ', ' + donor.state : ''}
              {donor.postalCode ? ' ' + donor.postalCode : ''}
            </p>
          </div>
          <div className="col-12 md:col-6">
            <h3>Donation Information</h3>
            <p><strong>Last Donation:</strong> {formatDate(donor.lastDonationDate)}</p>
            <p><strong>Total Donations:</strong> {donor.totalDonations || 0}</p>
            <p><strong>Next Eligible Date:</strong> {formatDate(donor.nextEligibleDate)}</p>
          </div>
        </div>

        {donor.medicalConditions?.length || donor.medications?.length || donor.allergies?.length ? (
          <div className="mt-4">
            <h3>Medical Information</h3>
            {donor.medicalConditions?.length ? (
              <p><strong>Medical Conditions:</strong> {donor.medicalConditions.join(", ")}</p>
            ) : null}
            {donor.medications?.length ? (
              <p><strong>Medications:</strong> {donor.medications.join(", ")}</p>
            ) : null}
            {donor.allergies?.length ? (
              <p><strong>Allergies:</strong> {donor.allergies.join(", ")}</p>
            ) : null}
          </div>
        ) : null}

        {donor.emergencyContactName ? (
          <div className="mt-4">
            <h3>Emergency Contact</h3>
            <p><strong>Name:</strong> {donor.emergencyContactName}</p>
            {donor.emergencyContactPhone && <p><strong>Phone:</strong> {donor.emergencyContactPhone}</p>}
            {donor.emergencyContactRelationship && <p><strong>Relationship:</strong> {donor.emergencyContactRelationship}</p>}
          </div>
        ) : null}
      </Card>

      <Card title="Donation History" className="mb-4">
        {isDonationsLoading ? (
          <div className="flex justify-content-center p-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
            <span className="ml-2">Loading donation history...</span>
          </div>
        ) : !donations || donations.length === 0 ? (
          <p className="p-3">No donation history available for this donor.</p>
        ) : (
          <>
            <div className="p-datatable p-component">
              <table className="p-datatable-table">
                <thead className="p-datatable-thead">
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="p-datatable-tbody">
                  {donations.map((donation: any) => (
                    <tr key={donation.id}>
                      <td>{formatDate(donation.date)}</td>
                      <td>{donation.amount}ml</td>
                      <td>
                        <Tag 
                          value={donation.status} 
                          severity={donation.status === 'completed' ? 'success' : 'info'} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Paginator 
                first={first} 
                rows={rows} 
                totalRecords={totalRecords} 
                onPageChange={onPageChange} 
                rowsPerPageOptions={[5, 10, 20]}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default DonorDetailsPage;
