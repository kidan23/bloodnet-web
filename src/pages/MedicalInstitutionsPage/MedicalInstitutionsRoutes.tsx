import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MedicalInstitutionsList from './MedicalInstitutionsList';
import MedicalInstitutionDetails from './MedicalInstitutionDetails';
import NearbyMedicalInstitutionsSearch from './NearbyMedicalInstitutionsSearch';

const MedicalInstitutionsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MedicalInstitutionsList />} />
      <Route path="/nearby" element={<NearbyMedicalInstitutionsSearch />} />
      <Route path="/:id" element={<MedicalInstitutionDetails />} />
    </Routes>
  );
};

export default MedicalInstitutionsRoutes;
