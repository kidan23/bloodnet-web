import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BloodRequestsList from './BloodRequestsList';
import BloodRequestDetails from './BloodRequestDetails';
import EditBloodRequestForm from './EditBloodRequestForm';
import { ConfirmDialog } from 'primereact/confirmdialog';

const BloodRequestsRoutes: React.FC = () => {
  return (
    <>
      <ConfirmDialog />
      <Routes>
        <Route path="/" element={<BloodRequestsList />} />
        <Route path="/:id" element={<BloodRequestDetails />} />
        <Route path="/edit/:id" element={<EditBloodRequestForm />} />
      </Routes>
    </>
  );
};

export default BloodRequestsRoutes;
