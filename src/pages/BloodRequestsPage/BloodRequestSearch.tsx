// Search component for blood requests
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { RequestStatus, RequestPriority } from './types';

interface BloodRequestSearchProps {
  onSearch: (filters: any) => void;
  onClear: () => void;
}

const bloodTypeOptions = [
  { label: 'Any Blood Type', value: '' },
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
];

const statusOptions = [
  { label: 'Any Status', value: '' },
  ...Object.values(RequestStatus).map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status
  }))
];

const priorityOptions = [
  { label: 'Any Priority', value: '' },
  ...Object.values(RequestPriority).map(priority => ({
    label: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: priority
  }))
];

const BloodRequestSearch: React.FC<BloodRequestSearchProps> = ({ onSearch, onClear }) => {
  const [institutionName, setInstitutionName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [requiredBy, setRequiredBy] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      institutionName: institutionName.trim() || undefined,
      bloodType: bloodType || undefined,
      status: status || undefined,
      priority: priority || undefined,
      requiredBy: requiredBy ? requiredBy.toISOString() : undefined
    });
  };

  const handleClear = () => {
    setInstitutionName('');
    setBloodType('');
    setStatus('');
    setPriority('');
    setRequiredBy(null);
    onClear();
  };

  const hasActiveFilters = institutionName || bloodType || status || priority || requiredBy;

  return (
    <div 
      className="mb-3 border-round-lg shadow-1 hover:shadow-2 transition-all transition-duration-200"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        border: "1px solid #e2e8f0"
      }}
    >
      {/* Compact Header */}
      <div 
        className="flex align-items-center justify-content-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ borderBottom: expanded ? "1px solid #e2e8f0" : "none" }}
      >
        <div className="flex align-items-center gap-2">
          <i className="pi pi-filter text-primary" style={{ fontSize: "1rem" }}></i>
          <span className="font-medium text-900">Search & Filter</span>
          {hasActiveFilters && (
            <div 
              className="border-circle flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                width: "20px",
                height: "20px",
                fontSize: "0.75rem",
                fontWeight: "bold"
              }}
            >
              {[institutionName, bloodType, status, priority, requiredBy].filter(Boolean).length}
            </div>
          )}
        </div>
        
        <div className="flex align-items-center gap-2">
          {hasActiveFilters && (
            <Button
              label="Clear All"
              size="small"
              className="p-button-text p-button-sm"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <i 
            className={`pi ${expanded ? "pi-chevron-up" : "pi-chevron-down"} text-600`}
            style={{ fontSize: "0.875rem" }}
          ></i>
        </div>
      </div>

      {/* Expanded Search Form */}
      {expanded && (
        <div className="p-3">
          <form onSubmit={handleSubmit} className="p-fluid">
            <div className="grid" style={{ rowGap: "0.75rem" }}>
              <div className="col-12 md:col-6 lg:col-3">
                <div className="field mb-0">
                  <label htmlFor="institutionName" className="text-sm font-medium text-700 mb-1">
                    Institution
                  </label>
                  <InputText
                    id="institutionName"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Search institution..."
                    size="small"
                    className="p-inputtext-sm"
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <div className="field mb-0">
                  <label htmlFor="bloodType" className="text-sm font-medium text-700 mb-1">
                    Blood Type
                  </label>
                  <Dropdown
                    id="bloodType"
                    value={bloodType}
                    options={bloodTypeOptions}
                    onChange={(e) => setBloodType(e.value)}
                    placeholder="Any type"
                    className="p-dropdown-sm"
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <div className="field mb-0">
                  <label htmlFor="status" className="text-sm font-medium text-700 mb-1">
                    Status
                  </label>
                  <Dropdown
                    id="status"
                    value={status}
                    options={statusOptions}
                    onChange={(e) => setStatus(e.value)}
                    placeholder="Any status"
                    className="p-dropdown-sm"
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <div className="field mb-0">
                  <label htmlFor="priority" className="text-sm font-medium text-700 mb-1">
                    Priority
                  </label>
                  <Dropdown
                    id="priority"
                    value={priority}
                    options={priorityOptions}
                    onChange={(e) => setPriority(e.value)}
                    placeholder="Any priority"
                    className="p-dropdown-sm"
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="field mb-0">
                  <label htmlFor="requiredBy" className="text-sm font-medium text-700 mb-1">
                    Required By
                  </label>
                  <Calendar
                    id="requiredBy"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.value as Date)}
                    showIcon
                    dateFormat="yy-mm-dd"
                    placeholder="Select date..."
                    className="p-calendar-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-content-end gap-2 mt-3 pt-2" style={{ borderTop: "1px solid #e2e8f0" }}>
              <Button 
                type="button" 
                label="Reset" 
                icon="pi pi-refresh"
                size="small"
                className="p-button-outlined p-button-sm" 
                onClick={handleClear}
                style={{ fontSize: "0.75rem" }}
              />
              <Button 
                type="submit" 
                label="Apply Filters" 
                icon="pi pi-search" 
                size="small"
                className="p-button-sm"
                style={{ fontSize: "0.75rem" }}
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BloodRequestSearch;
