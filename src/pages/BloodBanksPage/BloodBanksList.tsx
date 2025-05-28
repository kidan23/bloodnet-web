import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataView } from "primereact/dataview";
import { Paginator } from "primereact/paginator";
import { InputText } from "primereact/inputtext";
import {
  useBloodBanks,
  useSearchBloodBanksByName,
  useSearchBloodBanksByCity,
} from "../../state/bloodBanks";
import type { BloodBank, BloodBankQueryParams } from "./types";
import CreateBloodBankForm from "./CreateBloodBankForm";

const BloodBanksList: React.FC = () => {
  const [queryParams, setQueryParams] = useState<BloodBankQueryParams>({
    page: 1,
    limit: 10,
  });
  const [searchMode, setSearchMode] = useState<"none" | "name" | "city">(
    "none"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [layout] = useState<"grid" | "list">("grid");
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
  };

  const renderBankCard = (bank: BloodBank) => (
    <div className="col-12 md-6 lg-4" key={bank.id}>
      <Card
        title={bank.name}
        subTitle={
          bank.city
            ? `${bank.city}${bank.state ? ", " + bank.state : ""}`
            : undefined
        }
        className="mb-3"
      >
        <div className="mb-2">
          <b>Address:</b> {bank.address}
        </div>
        <div className="mb-2">
          <b>Contact:</b> {bank.contactNumber}
        </div>
        <div className="mb-2">
          <b>Email:</b> {bank.email}
        </div>
        {bank.bloodTypesAvailable && bank.bloodTypesAvailable.length > 0 && (
          <div className="mb-2">
            <b>Blood Types:</b> {bank.bloodTypesAvailable.join(", ")}
          </div>
        )}
        <div className="mt-3">
          <Link to={`/blood-banks/${bank.id}`}>
            <Button label="View Details" className="button-sm mr-2" />
          </Link>
        </div>
      </Card>
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
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Blood Banks</h1>
        <div className="flex align-items-center gap-2">
          <Link to="/blood-banks/nearby">
            <Button
              label="Find Nearby"
              icon="pi pi-map-marker"
              className="button-info mr-2"
            />
          </Link>
          <Button
            label="Add New Blood Bank"
            icon="pi pi-plus"
            className="button-danger"
            onClick={showCreateDialog}
          />
        </div>
      </div>

      <div className="flex align-items-center justify-content-end mb-3">
        <InputText
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search blood banks..."
          className="mr-2"
        />
        <Button
          label="By Name"
          className={`button-text mr-1${
            searchMode === "name" ? " button-info" : ""
          }`}
          onClick={() => handleSearch(searchTerm, "name")}
        />
        <Button
          label="By City"
          className={`button-text${
            searchMode === "city" ? " button-info" : ""
          }`}
          onClick={() => handleSearch(searchTerm, "city")}
        />
        {searchMode !== "none" && (
          <Button
            label="Clear"
            className="button-text ml-2"
            onClick={handleClearSearch}
          />
        )}
      </div>

      {searchMode !== "none" && (
        <div className="mb-3 p-2 bg-primary-reverse border-round">
          <span>
            Showing results for <b>{searchMode}</b>:{" "}
            <span className="text-bold">{searchTerm}</span>
          </span>
        </div>
      )}

      {displayedBanks.length === 0 ? (
        <div className="text-center p-5 bg-primary-reverse border-round">
          No blood banks found.
        </div>
      ) : (
        <DataView
          value={displayedBanks}
          layout={layout}
          itemTemplate={renderBankCard}
          paginator={false}
        />
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
