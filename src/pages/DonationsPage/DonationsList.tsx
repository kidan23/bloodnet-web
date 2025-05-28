import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataView } from 'primereact/dataview';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { useDonations } from '../../state/donations';
import DonationCard from './DonationCard';
import type { DonationFilters } from './types.ts';
import { donationStatusOptions } from './constants';
import { extractErrorForToast } from "../../utils/errorHandling";

interface DonationsListProps {
  donorId?: string;
  bloodBankId?: string;
  showDonorInfo?: boolean;
  showBloodBankInfo?: boolean;
  showFilters?: boolean;
}

const DonationsList: React.FC<DonationsListProps> = ({
  donorId,
  bloodBankId,
  showDonorInfo = true,
  showBloodBankInfo = true,
  showFilters = true,
}) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<DonationFilters>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  // Fetch donations with pagination and filters
  const { data: donationsData, isLoading, isError, error } = useDonations({
    donorId,
    bloodBankId,
    page,
    pageSize,
    filters,
  });

  const donations = donationsData?.content || [];
  const totalRecords = donationsData?.totalElements || 0;

  const handlePageChange = (e: { first: number; rows: number; page: number }) => {
    setPage(e.page);
    setPageSize(e.rows);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const applyFilters = () => {
    // The filters are already applied through the useDonations hook
    // This function is here for future extensions
  };

  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        <span className="ml-2">Loading donations...</span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-message p-message-error mt-3">
        <i className="pi pi-times-circle p-message-icon"></i>
        <span className="p-message-text">{(() => {
          const { summary, detail } = extractErrorForToast(error);
          return `${summary}: ${detail}`;
        })()}</span>
      </div>
    );
  }

  return (
    <>
      {showFilters && (
        <Card className="mb-3">
          <div className="grid">
            <div className="col-12 md:col-3">
              <label htmlFor="status" className="block mb-2">Status</label>
              <Dropdown
                id="status"
                value={filters.status}
                options={donationStatusOptions}
                onChange={(e) => setFilters({ ...filters, status: e.value })}
                placeholder="Any Status"
                className="w-full"
              />
            </div>
            
            <div className="col-12 md:col-3">
              <label htmlFor="startDate" className="block mb-2">From Date</label>
              <Calendar
                id="startDate"
                value={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(e) => setFilters({ ...filters, startDate: e.value ? e.value.toISOString() : undefined })}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
            
            <div className="col-12 md:col-3">
              <label htmlFor="endDate" className="block mb-2">To Date</label>
              <Calendar
                id="endDate"
                value={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(e) => setFilters({ ...filters, endDate: e.value ? e.value.toISOString() : undefined })}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
            
            <div className="col-12 md:col-3 flex align-items-end">
              <Button 
                label="Clear Filters" 
                icon="pi pi-filter-slash" 
                onClick={clearFilters} 
                className="p-button-outlined mr-2"
              />
              <Button 
                label="Apply" 
                icon="pi pi-search" 
                onClick={applyFilters}
              />
            </div>
          </div>
        </Card>
      )}

      {donations.length === 0 ? (
        <div className="text-center p-5">
          <i className="pi pi-info-circle" style={{ fontSize: '2rem', color: 'var(--blue-500)' }}></i>
          <p className="mt-3">No donations found with the current filters.</p>
        </div>
      ) : (
        <>
          <DataView
            value={donations}
            itemTemplate={(donation) => (
              <DonationCard 
                donation={donation} 
                showDonorInfo={showDonorInfo} 
                showBloodBankInfo={showBloodBankInfo}
              />
            )}
            layout="list"
            emptyMessage="No donations found."
          />
          
          <Paginator
            first={page * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onPageChange={handlePageChange}
            className="mt-3"
          />
        </>
      )}
    </>
  );
};

export default DonationsList;
