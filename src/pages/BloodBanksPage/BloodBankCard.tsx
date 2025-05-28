import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import type { BloodBank } from './types';

interface BloodBankCardProps {
  bloodBank: BloodBank;
}

const BloodBankCard: React.FC<BloodBankCardProps> = ({ bloodBank }) => {
  return (
    <Card
      title={bloodBank.name}
      subTitle={bloodBank.city && bloodBank.state ? `${bloodBank.city}, ${bloodBank.state} ${bloodBank.postalCode || ''}` : bloodBank.city || ''}
      className="mb-3 flex flex-column justify-between h-full"      footer={
        <div className="flex justify-end mt-3">
          {bloodBank._id ? (
            <Link to={`/blood-banks/${bloodBank._id}`}>
              <Button label="View Details" icon="pi pi-search" className="sm" />
            </Link>
          ) : (
            <Button label="View Details" icon="pi pi-search" className="sm" disabled />
          )}
        </div>
      }
    >
      <div className="flex align-items-center justify-content-between mb-2">
        {bloodBank.isActive === false && (
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 12, borderRadius: 4, padding: '2px 8px' }}>Inactive</span>
        )}
      </div>
      <div style={{ color: '#6b7280', fontSize: 14 }}>
        <div>{bloodBank.address}</div>
        {bloodBank.city && bloodBank.state && (
          <div>{bloodBank.city}, {bloodBank.state} {bloodBank.postalCode}</div>
        )}
      </div>
      <div className="mt-2" style={{ fontSize: 14 }}>
        <div><b>Contact:</b> {bloodBank.contactNumber}</div>
        {bloodBank.email && (
          <div><b>Email:</b> {bloodBank.email}</div>
        )}
      </div>
      {bloodBank.bloodTypesAvailable && bloodBank.bloodTypesAvailable.length > 0 && (
        <div className="mt-2">
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Blood Types Available:</div>
          <div className="flex flex-wrap gap-2">
            {bloodBank.bloodTypesAvailable.map(type => (
              <span 
                key={type} 
                style={{ background: '#fef2f2', color: '#b91c1c', fontSize: 12, borderRadius: 12, padding: '2px 10px', marginRight: 4, marginBottom: 4, display: 'inline-block' }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BloodBankCard;
