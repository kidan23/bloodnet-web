import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { useMedicalInstitution, useDeleteMedicalInstitution } from './api';
import EditMedicalInstitutionDialog from './EditMedicalInstitutionDialog';
import { useRef } from 'react';

const MedicalInstitutionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const { data: institution, isLoading, isError } = useMedicalInstitution(id || '');
  const deleteMutation = useDeleteMedicalInstitution();

  const handleEdit = () => {
    setEditDialogVisible(true);
  };

  const handleDelete = () => {
    confirmDialog({
      message: 'Are you sure you want to delete this medical institution?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id || '');
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Medical institution deleted successfully',
            life: 3000,
          });
          navigate('/medical-institutions');
        } catch (error) {
          console.error('Error deleting medical institution:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete medical institution',
            life: 3000,
          });
        }
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !institution) {
    return <div>Error loading medical institution details</div>;
  }

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <h2 className="m-0">{institution.name}</h2>
        <div className="text-500">{institution.type}</div>
      </div>
      <div className="flex gap-2">
        <Button 
          icon="pi pi-arrow-left" 
          label="Back" 
          className="p-button-outlined" 
          onClick={() => navigate('/medical-institutions')} 
        />
        <Button 
          icon="pi pi-pencil" 
          label="Edit" 
          onClick={handleEdit} 
        />
        <Button 
          icon="pi pi-trash" 
          label="Delete" 
          className="p-button-danger" 
          onClick={handleDelete}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card header={header} className="mb-4">
        <TabView>
          <TabPanel header="General Information">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3>Contact Information</h3>
                <div className="field">
                  <label className="font-bold block mb-1">Registration Number</label>
                  <div>{institution.registrationNumber}</div>
                </div>
                <div className="field">
                  <label className="font-bold block mb-1">Phone Number</label>
                  <div>{institution.phoneNumber}</div>
                </div>
                {institution.email && (
                  <div className="field">
                    <label className="font-bold block mb-1">Email</label>
                    <div>{institution.email}</div>
                  </div>
                )}
                {institution.website && (
                  <div className="field">
                    <label className="font-bold block mb-1">Website</label>
                    <div>
                      <a 
                        href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {institution.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-12 md:col-6">
                <h3>Address</h3>
                <div>
                  <p>{institution.address}</p>
                  <p>
                    {institution.city}, {institution.state}{' '}
                    {institution.postalCode && institution.postalCode}
                  </p>
                  <p>{institution.country}</p>
                </div>

                <h3 className="mt-4">Coordinates</h3>
                <div>
                  <p>Longitude: {institution.coordinates[0]}</p>
                  <p>Latitude: {institution.coordinates[1]}</p>
                </div>
              </div>
            </div>

            <Divider />

            <div className="grid">
              <div className="col-12 md:col-6">
                <h3>Status</h3>
                <div className="field">
                  <label className="font-bold block mb-1">Active Status</label>
                  <div>
                    <Chip 
                      label={institution.isActive ? 'Active' : 'Inactive'} 
                      className={institution.isActive ? 'bg-green-500' : 'bg-red-500'} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Contact Person">
            {(institution.contactPersonName || 
              institution.contactPersonRole || 
              institution.contactPersonPhone ||
              institution.contactPersonEmail) ? (
              <div className="grid">
                <div className="col-12 md:col-6">
                  {institution.contactPersonName && (
                    <div className="field">
                      <label className="font-bold block mb-1">Name</label>
                      <div>{institution.contactPersonName}</div>
                    </div>
                  )}
                  {institution.contactPersonRole && (
                    <div className="field">
                      <label className="font-bold block mb-1">Role</label>
                      <div>{institution.contactPersonRole}</div>
                    </div>
                  )}
                </div>
                <div className="col-12 md:col-6">
                  {institution.contactPersonPhone && (
                    <div className="field">
                      <label className="font-bold block mb-1">Phone</label>
                      <div>{institution.contactPersonPhone}</div>
                    </div>
                  )}
                  {institution.contactPersonEmail && (
                    <div className="field">
                      <label className="font-bold block mb-1">Email</label>
                      <div>{institution.contactPersonEmail}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>No contact person information available</div>
            )}
          </TabPanel>

          <TabPanel header="Services & Hours">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3>Services</h3>
                {institution.services && institution.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {institution.services.map((service, index) => (
                      <Chip key={index} label={service} />
                    ))}
                  </div>
                ) : (
                  <div>No services listed</div>
                )}
              </div>

              <div className="col-12 md:col-6">
                <h3>Operating Hours</h3>
                {institution.operatingHours && institution.operatingHours.length > 0 ? (
                  <ul className="list-none p-0 m-0">
                    {institution.operatingHours.map((hours, index) => (
                      <li key={index} className="mb-2">{hours}</li>
                    ))}
                  </ul>
                ) : (
                  <div>No operating hours listed</div>
                )}
              </div>
            </div>
          </TabPanel>
        </TabView>
      </Card>

      <EditMedicalInstitutionDialog
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        institutionId={id || ''}
      />
    </div>
  );
};

export default MedicalInstitutionDetails;
