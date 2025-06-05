import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchUsers } from '../../state/users';

interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserSearchDialogProps {
  visible: boolean;
  onHide: () => void;
  onUserSelect: (user: User) => void;
  header?: string;
}

export const UserSearchDialog: React.FC<UserSearchDialogProps> = ({
  visible,
  onHide,
  onUserSelect,
  header = "Select User"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: searchResults, isLoading, error } = useSearchUsers(debouncedSearchTerm);
  const users = searchResults?.users || [];

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    onHide();
    setSearchTerm('');
  };

  const handleClose = () => {
    onHide();
    setSearchTerm('');
  };

  const getRoleSeverity = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'BLOOD_BANK':
        return 'info';
      case 'HOSPITAL':
        return 'success';
      case 'DONOR':
        return 'warning';
      case 'MEDICAL_INSTITUTION':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end">
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={handleClose}
        className="p-button-text"
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      style={{ width: '600px', maxHeight: '80vh' }}
      footer={dialogFooter}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-4">
        {/* Search Input */}
        <div className="field">
          <label htmlFor="search" className="font-bold">Search by email</label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-search"></i>
            </span>
            <InputText
              id="search"
              placeholder="Enter email to search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>          {error && (
            <div className="p-3 mb-3 border-round surface-ground text-red-600 border-left-3 border-red-500">
              {error instanceof Error ? error.message : 'Failed to search users'}
            </div>
          )}          {isLoading && (
            <div className="flex justify-content-center align-items-center py-6">
              <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" />
              <span className="ml-2">Searching users...</span>
            </div>
          )}

          {!isLoading && !error && searchTerm && users.length === 0 && (
            <div className="flex justify-content-center align-items-center py-6 text-500">
              <i className="pi pi-search mr-2"></i>
              No users found
            </div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className="flex flex-column gap-2">
              {users.map((user: User) => (                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}                  className="flex align-items-center justify-content-between p-3 border-1 surface-border border-round cursor-pointer hover:surface-hover transition-colors transition-duration-150"
                >
                  <div className="flex-1">
                    <div className="font-medium text-900">{user.email}</div>
                    <div className="text-sm text-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Tag 
                    value={user.role} 
                    severity={getRoleSeverity(user.role)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          )}

          {!searchTerm && (
            <div className="flex justify-content-center align-items-center py-6 text-500">
              <i className="pi pi-info-circle mr-2"></i>
              Start typing to search for users
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
