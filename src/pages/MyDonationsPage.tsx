import React, { useState } from "react";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Paginator } from "primereact/paginator";
import { Link } from "react-router-dom";
import { useDonations } from "../state/donations";
import { useAuth } from "../state/authContext";
import { DonationStatus, donationStatusOptions } from "../pages/DonationsPage/constants";
import type { Donation } from "../pages/DonationsPage/types";

const MyDonationsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<DonationStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Get donations for current user
  const { data: donationsData, isLoading, isError } = useDonations({
    donorId:user?.donorProfile || user?._id,
    page,
    pageSize,
    filters: {
      status: statusFilter,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    },
  });

  const donations = donationsData?.content || [];
  const totalRecords = donationsData?.totalElements || 0;

  const handlePageChange = (e: { first: number; rows: number; page: number }) => {
    setPage(e.page);
    setPageSize(e.rows);
  };

  const clearFilters = () => {
    setStatusFilter(undefined);
    setStartDate(null);
    setEndDate(null);
  };

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

  const donationTemplate = (donation: Donation) => {
    return (
      <div className="col-12">
        <Card className="mb-3">
          <div className="flex flex-column md:flex-row justify-content-between align-items-start gap-3">
            <div className="flex-1">
              <div className="flex align-items-center gap-2 mb-2">
                <h3 className="m-0">{formatDate(donation.donationDate)}</h3>
                <Tag 
                  value={donation.status} 
                  severity={getStatusSeverity(donation.status)}
                />
              </div>
              
              <div className="grid">
                <div className="col-12 md:col-6">
                  <p className="m-1"><strong>Blood Bank:</strong> {donation.bloodBankName || 'N/A'}</p>
                  <p className="m-1"><strong>Volume:</strong> {donation.volumeCollected ? `${donation.volumeCollected} ml` : 'N/A'}</p>
                  <p className="m-1"><strong>Type:</strong> {donation.donationType || 'N/A'}</p>
                </div>
                <div className="col-12 md:col-6">
                  {donation.hemoglobinLevel && (
                    <p className="m-1"><strong>Hemoglobin:</strong> {donation.hemoglobinLevel} g/dL</p>
                  )}
                  {donation.nextEligibleDonationDate && (
                    <p className="m-1"><strong>Next Eligible:</strong> {formatDate(donation.nextEligibleDonationDate)}</p>
                  )}
                  {donation.bagNumber && (
                    <p className="m-1"><strong>Bag Number:</strong> {donation.bagNumber}</p>
                  )}
                </div>
              </div>

              {donation.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong> {donation.notes}
                </div>
              )}

              {donation.adverseReaction && (
                <div className="mt-2">
                  <Tag value="Adverse Reaction" severity="warning" />
                  {donation.adverseReactionDetails && (
                    <p className="mt-1 text-sm">{donation.adverseReactionDetails}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-column gap-2">
              <Link to={`/donations/${donation.id}`}>
                <Button 
                  label="View Details" 
                  icon="pi pi-eye" 
                  className="p-button-outlined"
                  size="small"
                />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          <span className="ml-2">Loading your donations...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <Card title="My Donations">
          <div className="p-message p-message-error">
            <i className="pi pi-times-circle p-message-icon"></i>
            <span className="p-message-text">Failed to load your donations. Please try again later.</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">My Donations</h1>
        <div className="flex gap-2">
          <Link to="/donation-schedule">
            <Button
              label="Schedule Donation"
              icon="pi pi-calendar-plus"
              className="p-button-primary"
            />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <h5 className="mt-0">Filter Donations</h5>
        <div className="grid">
          <div className="col-12 md:col-3">
            <label htmlFor="status" className="block mb-2">Status</label>
            <Dropdown
              id="status"
              value={statusFilter}
              options={[{ label: 'All Statuses', value: undefined }, ...donationStatusOptions]}
              onChange={(e) => setStatusFilter(e.value)}
              placeholder="Select Status"
              className="w-full"
            />
          </div>
          
          <div className="col-12 md:col-3">
            <label htmlFor="startDate" className="block mb-2">From Date</label>
            <Calendar
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.value as Date)}
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full"
              placeholder="Select start date"
              maxDate={new Date()}
            />
          </div>
          
          <div className="col-12 md:col-3">
            <label htmlFor="endDate" className="block mb-2">To Date</label>
            <Calendar
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.value as Date)}
              showIcon
              dateFormat="yy-mm-dd"
              className="w-full"
              placeholder="Select end date"
              maxDate={new Date()}
              minDate={startDate || undefined}
            />
          </div>
          
          <div className="col-12 md:col-3 flex align-items-end">
            <Button 
              label="Clear Filters" 
              icon="pi pi-filter-slash" 
              onClick={clearFilters} 
              className="p-button-outlined w-full"
            />
          </div>
        </div>
      </Card>

      {/* Donations List */}
      <Card>
        {donations.length === 0 ? (
          <div className="text-center p-5">
            <i className="pi pi-heart" style={{ fontSize: '3rem', color: 'var(--blue-500)' }}></i>
            <h3 className="mt-3">No Donations Found</h3>
            <p className="text-600">
              {statusFilter || startDate || endDate 
                ? "No donations match your current filters. Try adjusting your search criteria."
                : "You haven't made any donations yet. Schedule your first donation to get started!"
              }
            </p>
            {!statusFilter && !startDate && !endDate && (
              <Link to="/donation-schedule">
                <Button
                  label="Schedule Your First Donation"
                  icon="pi pi-calendar-plus"
                  className="mt-3"
                />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-600">
                Showing {donations.length} of {totalRecords} donations
              </p>
            </div>

            <DataView
              value={donations}
              itemTemplate={donationTemplate}
              layout="list"
              paginator={false}
            />
            
            {totalRecords > pageSize && (
              <Paginator
                first={page * pageSize}
                rows={pageSize}
                totalRecords={totalRecords}
                rowsPerPageOptions={[5, 10, 20]}
                onPageChange={handlePageChange}
                className="mt-3"
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default MyDonationsPage;
