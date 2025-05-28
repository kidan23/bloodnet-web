import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import DonationsList from './DonationsList';
import { useUserRole } from '../../state/authContext';
import { UserRole } from '../../state/auth';

const DonationsListPage: React.FC = () => {
  const userRole = useUserRole();
  const canCreateDonation = [UserRole.ADMIN, UserRole.HOSPITAL].includes(userRole);

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Donations Management</h1>
        {canCreateDonation && (
          <Link to="/donations/create">
            <Button
              label="Record New Donation"
              icon="pi pi-plus"
              className="p-button-primary"
            />
          </Link>
        )}
      </div>

      <Card>
        <DonationsList 
          showDonorInfo={true}
          showBloodBankInfo={true}
          showFilters={true}
        />
      </Card>
    </div>
  );
};

export default DonationsListPage;
