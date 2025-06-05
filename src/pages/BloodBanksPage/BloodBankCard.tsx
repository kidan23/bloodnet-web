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
    <Card className="h-full">
      <div className="flex flex-column h-full">
        {/* Header with name and status */}
        <div className="flex justify-content-between align-items-start mb-3">
          <div className="text-lg font-bold text-primary">
            {bloodBank.name}
          </div>
          {bloodBank.isActive === false && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 border-round">
              Inactive
            </span>
          )}
        </div>

        {/* Location */}
        {(bloodBank.city || bloodBank.state) && (
          <div className="text-sm text-600 mb-3">
            <i className="pi pi-map-marker mr-1"></i>
            {bloodBank.city && bloodBank.state 
              ? `${bloodBank.city}, ${bloodBank.state} ${bloodBank.postalCode || ''}` 
              : bloodBank.city || ''}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 mb-3">
          <div className="mb-2">
            <i className="pi pi-home text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
            <span className="text-sm">{bloodBank.address}</span>
          </div>
          
          <div className="mb-2">
            <i className="pi pi-phone text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
            <span className="text-sm">{bloodBank.contactNumber}</span>
          </div>
          
          {bloodBank.email && (
            <div className="mb-2">
              <i className="pi pi-envelope text-600 mr-2" style={{ fontSize: "0.9rem" }}></i>
              <span className="text-sm">{bloodBank.email}</span>
            </div>
          )}
            {bloodBank.bloodTypesAvailable && bloodBank.bloodTypesAvailable.length > 0 && (
            <div className="mt-3 pt-2 border-top-1 surface-border">
              <div className="text-sm text-600 mb-1">
                <strong>Available Blood Types:</strong>
              </div>
              <div className="flex flex-wrap gap-1">
                {bloodBank.bloodTypesAvailable.map(type => {
                  // Get base blood type (ignore Rh factor)
                  const baseType = type.replace(/[+-]$/, '');
                  
                  // Color mapping for blood types
                  const colorMap: { [key: string]: { bg: string; text: string } } = {
                    'A': { bg: 'bg-red-100', text: 'text-red-800' },
                    'B': { bg: 'bg-blue-100', text: 'text-blue-800' },
                    'AB': { bg: 'bg-purple-100', text: 'text-purple-800' },
                    'O': { bg: 'bg-green-100', text: 'text-green-800' }
                  };
                  
                  const colors = colorMap[baseType] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                  
                  return (
                    <span 
                      key={type}
                      className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 border-round font-medium`}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-auto">
          {bloodBank._id ? (
            <Link to={`/blood-banks/${bloodBank._id}`} className="w-full">
              <Button 
                label="View Details" 
                icon="pi pi-eye"
                className="p-button-outlined w-full p-button-sm" 
              />
            </Link>
          ) : (
            <Button 
              label="View Details" 
              icon="pi pi-eye"
              className="p-button-outlined w-full p-button-sm" 
              disabled 
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default BloodBankCard;
