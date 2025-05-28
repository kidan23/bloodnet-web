import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import type { MedicalInstitution } from './types';

interface MedicalInstitutionCardProps {
  institution: MedicalInstitution;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const MedicalInstitutionCard: React.FC<MedicalInstitutionCardProps> = ({
  institution,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/medical-institutions/${institution._id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(institution._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(institution._id);
    }
  };

  const footer = showActions && (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="View"
        icon="pi pi-eye"
        className="p-button-outlined p-button-info"
        onClick={handleViewDetails}
      />
      {onEdit && (
        <Button
          label="Edit"
          icon="pi pi-pencil"
          className="p-button-outlined"
          onClick={handleEdit}
        />
      )}
      {onDelete && (
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-outlined p-button-danger"
          onClick={handleDelete}
        />
      )}
    </div>
  );

  const getStatusTag = () => {
    if (institution.isActive) {
      return <Tag severity="success" value="Active" />;
    }
    return <Tag severity="danger" value="Inactive" />;
  };

  return (
    <Card
      title={institution.name}
      subTitle={institution.type}
      footer={footer}
      className="h-full cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="flex flex-column gap-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-map-marker"></i>
          <span>
            {institution.address}, {institution.city}, {institution.state},{' '}
            {institution.country} {institution.postalCode}
          </span>
        </div>

        <div className="flex align-items-center gap-2">
          <i className="pi pi-phone"></i>
          <span>{institution.phoneNumber}</span>
        </div>

        {institution.email && (
          <div className="flex align-items-center gap-2">
            <i className="pi pi-envelope"></i>
            <span>{institution.email}</span>
          </div>
        )}

        {institution.website && (
          <div className="flex align-items-center gap-2">
            <i className="pi pi-globe"></i>
            <a 
              href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {institution.website}
            </a>
          </div>
        )}

        {institution.services && institution.services.length > 0 && (
          <div className="mt-2">
            <h4 className="m-0 mb-1">Services</h4>
            <div className="flex flex-wrap gap-1">
              {institution.services.map((service, index) => (
                <Tag key={index} value={service} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-content-between align-items-center">
          <div>Registration: {institution.registrationNumber}</div>
          <div>{getStatusTag()}</div>
        </div>
      </div>
    </Card>
  );
};

export default MedicalInstitutionCard;
