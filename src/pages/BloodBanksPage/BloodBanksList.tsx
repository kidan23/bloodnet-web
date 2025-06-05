import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { InputText } from "primereact/inputtext";
import {
  useBloodBanks,
  useSearchBloodBanksByName,
  useSearchBloodBanksByCity,
} from "../../state/bloodBanks";
import { UserRole } from "../../state/auth";
import RoleBasedAccess from "../../components/RoleBasedAccess";
import type { BloodBank, BloodBankQueryParams } from "./types";
import CreateBloodBankForm from "./CreateBloodBankForm";
import BloodBankCard from "./BloodBankCard";

const BloodBanksList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<BloodBankQueryParams>({
    page: 1,
    limit: 10,
  });
  const [searchMode, setSearchMode] = useState<"none" | "name" | "city">(
    "none"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);

  const { data, isLoading, isError, error } = useBloodBanks(
    searchMode === "none" ? queryParams : undefined
  );
  const { data: nameSearchData } = useSearchBloodBanksByName(
    searchMode === "name" ? searchTerm : ""
  );
  const { data: citySearchData } = useSearchBloodBanksByCity(
    searchMode === "city" ? searchTerm : ""
  );

  const banks = data?.results || [];
  const currentPage = data?.page || 1;
  const totalRecords = data?.totalResults || 0;
  const nameSearchResults = nameSearchData?.results || [];
  const citySearchResults = citySearchData?.results || [];
  const displayedBanks =
    searchMode === "name"
      ? nameSearchResults
      : searchMode === "city"
      ? citySearchResults
      : banks;

  const handleSearch = (term: string, mode: "name" | "city") => {
    setSearchTerm(term);
    setSearchMode(mode);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchMode("none");
  };
  const handlePageChange = (event: { page: number }) => {
    setQueryParams((prev) => ({ ...prev, page: event.page + 1 }));
  };

  const showCreateDialog = () => {
    setDialogVisible(true);
  };

  const hideCreateDialog = () => {
    setDialogVisible(false);
  };  const renderBankCard = (bank: BloodBank) => (
    <div className="col-12 md:col-6 lg:col-4 xl:col-3" key={bank._id}>
      <BloodBankCard bloodBank={bank} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-content-center p-5">
        Loading blood banks...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-4 text-danger">
        Error loading blood banks:{" "}
        {(error as Error)?.message || "Unknown error"}
      </div>
    );
  }
  return (
    <div className="p-4">      {/* Header Section */}
      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-4 mb-5">
        <div>
          <h1 className="m-0 text-3xl font-bold text-900 mb-1">Blood Banks</h1>
          <p className="m-0 text-600 text-sm">Find and manage blood bank locations</p>
        </div>
        
        <div className="flex align-items-center gap-2">
          <Link to="/blood-banks/nearby">
            <Button
              label="Find Nearby"
              icon="pi pi-map-marker"
              className="p-button-outlined"
              size="small"
            />          </Link>
          <RoleBasedAccess allowedRoles={[UserRole.ADMIN]}>
            <Button
              label="Add New"
              icon="pi pi-plus"
              onClick={showCreateDialog}
              size="small"
            />
          </RoleBasedAccess>
        </div>
      </div>      {/* Search Section */}
      <div className="surface-card border-round-lg shadow-1 p-4 mb-4">
        <div className="flex flex-column lg:flex-row align-items-stretch lg:align-items-center gap-4">
          <div className="flex-1">
            <label className="block text-900 font-medium mb-2 text-sm">Search Blood Banks</label>
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter name or city..."
              className="w-full"
            />
          </div>
          
          <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-3">
            <div className="flex align-items-center gap-2">
              <span className="text-sm text-600 font-medium white-space-nowrap">Search by:</span>
              <div className="flex gap-1">
                <Button
                  label="Name"
                  className={`${
                    searchMode === "name" ? "p-button-info" : "p-button-outlined"
                  }`}
                  onClick={() => handleSearch(searchTerm, "name")}
                  size="small"
                />
                <Button
                  label="City"
                  className={`${
                    searchMode === "city" ? "p-button-info" : "p-button-outlined"
                  }`}
                  onClick={() => handleSearch(searchTerm, "city")}
                  size="small"
                />
              </div>
            </div>
            
            {searchMode !== "none" && (
              <Button
                label="Clear"
                icon="pi pi-times"
                className="p-button-outlined p-button-secondary"
                onClick={handleClearSearch}
                size="small"
              />
            )}
          </div>
        </div>
      </div>
      {searchMode !== "none" && (
        <div className="mb-3 p-2 bg-primary-reverse border-round">
          <span>
            Showing results for <b>{searchMode}</b>:{" "}
            <span className="text-bold">{searchTerm}</span>
          </span>
        </div>
      )}{" "}
      {displayedBanks.length === 0 ? (
        <div className="text-center p-5 bg-primary-reverse border-round">
          No blood banks found.
        </div>
      ) : (
        <div className="grid">
          {displayedBanks.map((bank) => renderBankCard(bank))}
        </div>
      )}
      {searchMode === "none" && totalRecords > 0 && (
        <Paginator
          first={(currentPage - 1) * queryParams.limit!}
          rows={queryParams.limit!}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          className="p-mt-4"
        />
      )}
      <CreateBloodBankForm visible={dialogVisible} onHide={hideCreateDialog} />
    </div>
  );
};

export default BloodBanksList;
