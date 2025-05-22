import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BloodBanksList from './BloodBanksList';
import BloodBankDetails from './BloodBankDetails';
import EditBloodBankForm from './EditBloodBankForm';
import NearbyBloodBanksSearch from './NearbyBloodBanksSearch';

const BloodBanksRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BloodBanksList />} />
      <Route path="/nearby" element={<NearbyBloodBanksSearch />} />
      <Route path="/edit/:id" element={<EditBloodBankForm />} />
      <Route path="/:id" element={<BloodBankDetails />} />
    </Routes>
  );
};

export default BloodBanksRoutes;