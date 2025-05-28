// Search component for blood requests
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
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

  return (
    <Card className="mb-3">
      <div className="flex align-items-center justify-content-between">
        <h2 className="m-0 text-xl">Search Blood Requests</h2>
        <Button 
          icon={expanded ? "pi pi-chevron-up" : "pi pi-chevron-down"} 
          onClick={() => setExpanded(!expanded)} 
          className="p-button-text p-button-rounded"
        />
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6 lg:col-3 field">
              <label htmlFor="institutionName">Institution Name</label>
              <InputText
                id="institutionName"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Search by institution"
              />
            </div>
            
            <div className="col-12 md:col-6 lg:col-3 field">
              <label htmlFor="bloodType">Blood Type</label>
              <Dropdown
                id="bloodType"
                value={bloodType}
                options={bloodTypeOptions}
                onChange={(e) => setBloodType(e.value)}
                placeholder="Select blood type"
              />
            </div>
            
            <div className="col-12 md:col-6 lg:col-3 field">
              <label htmlFor="status">Status</label>
              <Dropdown
                id="status"
                value={status}
                options={statusOptions}
                onChange={(e) => setStatus(e.value)}
                placeholder="Select status"
              />
            </div>
            
            <div className="col-12 md:col-6 lg:col-3 field">
              <label htmlFor="priority">Priority</label>
              <Dropdown
                id="priority"
                value={priority}
                options={priorityOptions}
                onChange={(e) => setPriority(e.value)}
                placeholder="Select priority"
              />
            </div>
            
            <div className="col-12 md:col-6 field">
              <label htmlFor="requiredBy">Required By</label>
              <Calendar
                id="requiredBy"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.value as Date)}
                showIcon
                dateFormat="yy-mm-dd"
                placeholder="Select date"
              />
            </div>
          </div>
          
          <div className="flex justify-content-end gap-2 mt-3">
            <Button type="button" label="Clear" className="p-button-outlined" onClick={handleClear} />
            <Button type="submit" label="Search" icon="pi pi-search" />
          </div>
        </form>
      )}
    </Card>
  );
};

export default BloodRequestSearch;
