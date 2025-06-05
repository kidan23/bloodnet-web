import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DonationsListPage from "./DonationsListPage.tsx";
import CreateDonationPage from "./CreateDonationPage.tsx";
import DonationDetailsPage from "./DonationDetailsPage.tsx";
import BloodInventoryPage from "./BloodInventoryPage.tsx";
import ExpiryManagementPage from "./ExpiryManagementPage.tsx";
import RequestFulfillmentPage from "./RequestFulfillmentPage.tsx";

const DonationsRoutes: React.FC = () => {
  return (    <Routes>
      <Route path="/" element={<DonationsListPage />} />
      <Route path="/create" element={<CreateDonationPage />} />
      <Route path="/blood-inventory" element={<BloodInventoryPage />} />
      <Route path="/expiry-management" element={<ExpiryManagementPage />} />
      <Route path="/request-fulfillment" element={<RequestFulfillmentPage />} />
      <Route path="/:id" element={<DonationDetailsPage />} />
      <Route path="*" element={<Navigate to="/donations" replace />} />
    </Routes>
  );
};

export default DonationsRoutes;
