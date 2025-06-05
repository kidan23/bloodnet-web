import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useMedicalInstitutions, useDeleteMedicalInstitution } from './api';
import { UserRole } from '../../state/auth';
import RoleBasedAccess from '../../components/RoleBasedAccess';
import MedicalInstitutionCard from './MedicalInstitutionCard';
import CreateMedicalInstitutionDialog from './CreateMedicalInstitutionDialog';
import EditMedicalInstitutionDialog from './EditMedicalInstitutionDialog';
import { useRef } from 'react';
import { extractErrorForToast } from "../../utils/errorHandling";
import { useNavigate } from 'react-router-dom';

const sortOptions = [
  { label: 'Name A-Z', value: 'name' },
  { label: 'Name Z-A', value: '-name' },
  { label: 'Type', value: 'type' },
  { label: 'Newest', value: '-createdAt' },
  { label: 'Oldest', value: 'createdAt' },
];

const MedicalInstitutionsList: React.FC = () => {
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [pagination, setPagination] = useState({ page: 0, limit: 9 });
  
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const params = {
    page: pagination.page + 1, // API uses 1-based pagination
    limit: pagination.limit,
    sort: sortBy,    name: searchSubmitted ? { $regex: searchSubmitted, $options: 'i' } : undefined,
  };

  const { data, isLoading, error, refetch } = useMedicalInstitutions(params);
  const deleteMutation = useDeleteMedicalInstitution();

  const handleSearch = () => {
    setSearchSubmitted(searchTerm);
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page on new search
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateSuccess = () => {
    refetch();
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Medical institution created successfully',
      life: 3000,
    });
  };

  const handleEditSuccess = () => {
    refetch();
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Medical institution updated successfully',
      life: 3000,
    });
  };

  const handleEdit = (id: string) => {
    setSelectedInstitutionId(id);
    setEditDialogVisible(true);
  };

  const handleDelete = (id: string) => {
    confirmDialog({
      message: 'Are you sure you want to delete this medical institution?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Medical institution deleted successfully',
            life: 3000,
          });
          refetch();        } catch (error) {
          console.error('Error deleting medical institution:', error);
          const { summary, detail } = extractErrorForToast(error);
          toast.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 5000,
          });
        }
      },
    });
  };

  const handleNearbySearch = () => {
    navigate('/medical-institutions/nearby');
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Medical Institutions</h1>        <div className="flex gap-2">
          <RoleBasedAccess allowedRoles={[UserRole.ADMIN]}>
            <Button 
              label="Add New" 
              icon="pi pi-plus"
              onClick={() => setCreateDialogVisible(true)} 
            />
          </RoleBasedAccess>
          <Button
            label="Nearby Search"
            icon="pi pi-map-marker"
            className="p-button-secondary"
            onClick={handleNearbySearch}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-grow-1">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search pl-2" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name"
              className="w-full pl-5"
            />
          </span>
        </div>
        <Button 
          label="Search" 
          onClick={handleSearch}
        />
        <div style={{ width: '250px' }}>
          <Dropdown
            value={sortBy}
            options={sortOptions}
            onChange={(e) => setSortBy(e.value)}
            placeholder="Sort by"
            className="w-full"
          />
        </div>
      </div>      {isLoading ? (
        <div className="flex justify-content-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>      ) : error ? (
        <div className="p-message p-message-error mt-3">
          <div className="p-message-text">{(() => {
            const { summary, detail } = extractErrorForToast(error);
            return `${summary}: ${detail}`;
          })()}</div>
        </div>
      ) : (
        <>
          {data?.results.length === 0 ? (
            <div className="text-center p-5">
              <p>No medical institutions found</p>
              <Button
                label="Create New Institution"
                icon="pi pi-plus"
                onClick={() => setCreateDialogVisible(true)}
                className="mt-3"
              />
            </div>          ) : (
            <div className="grid">
              {data?.results.map((institution) => (
                <div key={institution._id} className="col-12 md:col-6 lg:col-4 mb-3">
                  <MedicalInstitutionCard
                    institution={institution}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}

          {data && data.results.length > 0 && (
            <Paginator
              first={pagination.page * pagination.limit}
              rows={pagination.limit}
              totalRecords={data.totalResults}
              rowsPerPageOptions={[9, 18, 27]}
              onPageChange={(e) => setPagination({ page: e.page, limit: e.rows })}
              className="mt-4"
            />
          )}
        </>
      )}

      <CreateMedicalInstitutionDialog
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditMedicalInstitutionDialog
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        institutionId={selectedInstitutionId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default MedicalInstitutionsList;
