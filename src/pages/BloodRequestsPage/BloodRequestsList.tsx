// Main list page for blood requests
import React, { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Paginator } from "primereact/paginator";
import { useBloodRequests } from "../../state/bloodRequests";
import { UserRole } from "../../state/auth";
import RoleBasedAccess from "../../components/RoleBasedAccess";
import type { BloodRequest, BloodRequestQueryParams } from "./types";
import BloodRequestCard from "./BloodRequestCard";
import BloodRequestSearch from "./BloodRequestSearch";
import CreateBloodRequestDialog from "./CreateBloodRequestDialog";

const BloodRequestsList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<BloodRequestQueryParams>({
    page: 1,
    limit: 10,
  });
  const [dialogVisible, setDialogVisible] = useState(false);

  const { data, isLoading, isError, error } = useBloodRequests(queryParams);

  const requests = data?.results || [];
  const currentPage = data?.page || 1;
  const totalRecords = data?.totalResults || 0;

  const handleSearch = (filters: any) => {
    setQueryParams((prev) => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page on new search
    }));
  };

  const handleClearSearch = () => {
    setQueryParams({
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (event: { page: number; rows: number }) => {
    setQueryParams((prev) => ({
      ...prev,
      page: event.page + 1,
      limit: event.rows,
    }));
  };

  const showCreateDialog = () => {
    setDialogVisible(true);
  };

  const hideCreateDialog = () => {
    setDialogVisible(false);
  };
  const renderRequestCard = (request: BloodRequest) => (
    <div className="col-12 md:col-6 lg:col-4 p-2" key={request._id}>
      <BloodRequestCard bloodRequest={request} />
    </div>
  );
  if (isLoading) {
    return (
      <div
        className="p-4"
        style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
      >        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="m-0 text-900">Blood Requests</h1>
          <RoleBasedAccess allowedRoles={[UserRole.ADMIN, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]}>
            <Button
              label="Create New Request"
              icon="pi pi-plus"
              className="p-button-danger"
              onClick={showCreateDialog}
            />
          </RoleBasedAccess>
        </div>

        <div
          className="flex flex-column justify-content-center align-items-center border-round-lg shadow-2"
          style={{
            minHeight: "400px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            className="border-circle flex align-items-center justify-content-center mb-3"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#f1f5f9",
              animation: "pulse 2s infinite",
            }}
          >
            <i
              className="pi pi-spin pi-spinner text-primary"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </div>
          <span className="text-lg font-medium text-700">
            Loading blood requests...
          </span>
          <span className="text-sm text-500 mt-1">
            Please wait while we fetch the latest data
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="p-4"
        style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
      >        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="m-0 text-900">Blood Requests</h1>
          <RoleBasedAccess allowedRoles={[UserRole.ADMIN, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]}>
            <Button
              label="Create New Request"
              icon="pi pi-plus"
              className="p-button-danger"
              onClick={showCreateDialog}
            />
          </RoleBasedAccess>
        </div>

        <div
          className="border-round-lg shadow-2 p-5 text-center"
          style={{
            backgroundColor: "white",
            border: "1px solid #fecaca",
            borderLeft: "6px solid #dc2626",
          }}
        >
          <div
            className="border-circle flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#fef2f2",
            }}
          >
            <i
              className="pi pi-exclamation-triangle text-red-500"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </div>
          <h3 className="text-900 mb-2">Unable to Load Blood Requests</h3>
          <p className="text-600 mb-3">
            {(error as Error)?.message ||
              "An unexpected error occurred while fetching blood requests."}
          </p>
          <Button
            label="Try Again"
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className="p-4"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0 text-900">Blood Requests</h1>
        <RoleBasedAccess allowedRoles={[UserRole.ADMIN, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL]}>
          <Button
            label="Create New Request"
            icon="pi pi-plus"
            className="p-button-danger"
            onClick={showCreateDialog}
          />
        </RoleBasedAccess>
      </div>

      <BloodRequestSearch onSearch={handleSearch} onClear={handleClearSearch} />

      {requests.length === 0 ? (
        <Card
          className="text-center p-5"
          style={{
            backgroundColor: "white",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <i
            className="pi pi-info-circle mb-3"
            style={{ fontSize: "2rem", color: "var(--primary-color)" }}
          ></i>
          <h3>No Blood Requests Found</h3>
          <p className="text-color-secondary">
            No blood requests match your criteria or none have been created yet.
          </p>
          <Button
            label="Create First Request"
            icon="pi pi-plus"
            onClick={showCreateDialog}
          />
        </Card>
      ) : (
        <>
          {" "}
          <DataView
            value={requests}
            layout="grid"
            itemTemplate={renderRequestCard}
            paginator={false}
          />{" "}
          <Paginator
            first={(currentPage - 1) * queryParams.limit!}
            rows={queryParams.limit!}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onPageChange={handlePageChange}
            className="mt-6 modern-paginator"
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
                      of {options.totalRecords} requests
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

      <CreateBloodRequestDialog
        visible={dialogVisible}
        onHide={hideCreateDialog}
      />
    </div>
  );
};

export default BloodRequestsList;
