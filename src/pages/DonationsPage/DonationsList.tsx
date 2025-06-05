import React, { useState } from "react";
import { DataView } from "primereact/dataview";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { Badge } from "primereact/badge";
import { useDonations } from "../../state/donations";
import DonationCard from "./DonationCard";
import type { DonationFilters } from "./types.ts";
import { donationStatusOptions } from "./constants";
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

  // UI state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<DonationFilters>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  // Fetch donations with pagination and filters
  const {
    data: donationsData,
    isLoading,
    isError,
    error,
  } = useDonations({
    donorId,
    bloodBankId,
    page,
    pageSize,
    filters,
  });

  const donations = donationsData?.content || [];
  const totalRecords = donationsData?.totalElements || 0;

  const handlePageChange = (e: {
    first: number;
    rows: number;
    page: number;
  }) => {
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

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };
  if (isLoading) {
    return (
      <div
        style={{ background: "#f8fafc", minHeight: "100vh", padding: "1rem" }}
      >
        <div
          className="flex flex-column justify-content-center align-items-center gap-3"
          style={{
            minHeight: "400px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div className="relative">
            <i
              className="pi pi-spin pi-spinner text-primary"
              style={{
                fontSize: "2.5rem",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            ></i>
          </div>
          <div className="text-center">
            <h3 className="m-0 text-900 font-semibold">Loading Donations</h3>
            <p className="m-0 mt-2 text-600">
              Please wait while we fetch your donation records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{ background: "#f8fafc", minHeight: "100vh", padding: "1rem" }}
      >
        <div
          className="flex flex-column justify-content-center align-items-center gap-3 p-4"
          style={{
            minHeight: "300px",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            borderRadius: "16px",
            border: "1px solid #fecaca",
            boxShadow: "0 4px 16px rgba(239, 68, 68, 0.1)",
          }}
        >
          <i
            className="pi pi-exclamation-triangle"
            style={{
              fontSize: "2.5rem",
              color: "#dc2626",
            }}
          ></i>
          <div className="text-center">
            <h3 className="m-0 font-semibold" style={{ color: "#dc2626" }}>
              Failed to Load Donations
            </h3>
            <p className="m-0 mt-2" style={{ color: "#7f1d1d" }}>
              {(() => {
                const { summary, detail } = extractErrorForToast(error);
                return `${summary}: ${detail}`;
              })()}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "#f8fafc", padding: "1rem" }}>
      {showFilters && (
        <>
          <div
            className="modern-filter-header p-3"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div className="flex justify-content-between align-items-center">
              <div className="flex align-items-center gap-3">
                <i
                  className="pi pi-filter text-primary"
                  style={{ fontSize: "1.1rem" }}
                ></i>
                <span className="font-semibold text-900">Filter Donations</span>
                {getActiveFiltersCount() > 0 && (
                  <Badge
                    value={getActiveFiltersCount()}
                    severity="info"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      fontSize: "0.75rem",
                    }}
                  />
                )}
              </div>
              <i
                className={`pi ${
                  filtersExpanded ? "pi-chevron-up" : "pi-chevron-down"
                } text-600 transition-transform duration-300`}
              ></i>
            </div>
          </div>

          {filtersExpanded && (
            <div className="modern-filter-content p-4">
              <div className="grid">
                <div className="col-12 md:col-3">
                  <div className="filter-input-group">
                    <label className="filter-label">Status</label>
                    <Dropdown
                      value={filters.status}
                      options={donationStatusOptions}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.value })
                      }
                      placeholder="Any Status"
                      className="w-full p-inputtext-sm"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-3">
                  <div className="filter-input-group">
                    <label className="filter-label">From Date</label>
                    <Calendar
                      value={
                        filters.startDate ? new Date(filters.startDate) : null
                      }
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          startDate: e.value
                            ? e.value.toISOString()
                            : undefined,
                        })
                      }
                      dateFormat="yy-mm-dd"
                      showIcon
                      className="w-full p-calendar-sm"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-3">
                  <div className="filter-input-group">
                    <label className="filter-label">To Date</label>
                    <Calendar
                      value={filters.endDate ? new Date(filters.endDate) : null}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          endDate: e.value ? e.value.toISOString() : undefined,
                        })
                      }
                      dateFormat="yy-mm-dd"
                      showIcon
                      className="w-full p-calendar-sm"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-3 flex align-items-end gap-2">
                  <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    onClick={clearFilters}
                    className="p-button-outlined p-button-sm flex-1"
                    style={{
                      borderColor: "#e2e8f0",
                      color: "#6b7280",
                    }}
                  />
                  <Button
                    label="Apply"
                    icon="pi pi-search"
                    onClick={applyFilters}
                    className="p-button-sm flex-1"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      border: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}{" "}
      {donations.length === 0 ? (
        <div
          className="text-center p-6"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex flex-column align-items-center gap-3">
            <div
              className="flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                border: "1px solid #93c5fd",
              }}
            >
              <i
                className="pi pi-info-circle"
                style={{ fontSize: "2rem", color: "#3b82f6" }}
              ></i>
            </div>
            <div>
              <h3 className="m-0 text-900 font-semibold">No Donations Found</h3>
              <p className="m-0 mt-2 text-600">
                No donations match your current filter criteria.
              </p>
            </div>
          </div>
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
            className="mt-4 modern-paginator"
            template={{
              layout:
                "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport",
              CurrentPageReport: (options) => (
                <div className="flex align-items-center gap-3 ml-4">
                  <div
                    className="flex align-items-center gap-2 p-2 border-round-lg"
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <i
                      className="pi pi-info-circle"
                      style={{
                        fontSize: "0.875rem",
                        color: "#3b82f6",
                      }}
                    ></i>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#1e40af" }}
                    >
                      Showing {options.first + 1}-
                      {Math.min(
                        options.first + options.rows,
                        options.totalRecords
                      )}{" "}
                      of {options.totalRecords} donations
                    </span>
                  </div>
                  {options.totalRecords > 0 && (
                    <div className="flex align-items-center gap-2 text-xs text-600">
                      <span>
                        Page {Math.floor(options.first / options.rows) + 1} of{" "}
                        {Math.ceil(options.totalRecords / options.rows)}
                      </span>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </>
      )}
    </div>
  );
};

export default DonationsList;
