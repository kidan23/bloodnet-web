// Main list page for blood requests
import React, { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Paginator } from "primereact/paginator";
import { useBloodRequests } from "../../state/bloodRequests";
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
    <div className="col-12 md:col-6 lg:col-4" key={request.id}>
      <BloodRequestCard bloodRequest={request} />
    </div>
  );

  if (isLoading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight: 120 }}
      >
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "1.5rem" }}></i>
        <span className="ml-2">Loading blood requests...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-danger">
        Error loading blood requests:{" "}
        {(error as Error)?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Blood Requests</h1>
        <Button
          label="Create New Request"
          icon="pi pi-plus"
          className="p-button-danger"
          onClick={showCreateDialog}
        />
      </div>

      <BloodRequestSearch onSearch={handleSearch} onClear={handleClearSearch} />

      {requests.length === 0 ? (
        <Card className="text-center p-5">
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
          <DataView
            value={requests}
            layout="grid"
            itemTemplate={renderRequestCard}
            paginator={false}
          />

          <Paginator
            first={(currentPage - 1) * queryParams.limit!}
            rows={queryParams.limit!}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onPageChange={handlePageChange}
            className="mt-4"
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
