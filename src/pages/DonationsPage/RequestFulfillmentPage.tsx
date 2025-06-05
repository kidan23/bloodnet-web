import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { confirmDialog } from 'primereact/confirmdialog';
import { Target, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface BloodRequest {
  id: string;
  requestDate: Date;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  bloodType: string;
  rhFactor: string;
  quantity: number;
  hospitalName: string;
  patientId: string;
  purpose: string;
  status: 'Pending' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled';
  requiredBy: Date;
  contactPerson: string;
  notes?: string;
}

interface AvailableUnit {
  id: string;
  bloodType: string;
  rhFactor: string;
  donationDate: Date;
  expiryDate: Date;
  status: 'Available' | 'Reserved' | 'Dispatched';
  compatibility: number; // Compatibility score with current request
  location: string;
  donorId: string;
}

interface FulfillmentStats {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  partiallyFulfilled: number;
  averageFulfillmentTime: number;
  fulfillmentRate: number;
}

const RequestFulfillmentPage: React.FC = () => {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [matchingUnits, setMatchingUnits] = useState<AvailableUnit[]>([]);
  const [fulfillmentVisible, setFulfillmentVisible] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<AvailableUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FulfillmentStats | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const urgencyOptions = [
    { label: 'All Urgencies', value: null },
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' }
  ];

  const statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: 'Pending' },
    { label: 'Partially Fulfilled', value: 'Partially Fulfilled' },
    { label: 'Fulfilled', value: 'Fulfilled' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  // Mock data generation
  useEffect(() => {
    const generateMockRequests = (): BloodRequest[] => {
      const requests: BloodRequest[] = [];
      const hospitals = ['City General Hospital', 'Regional Medical Center', 'Emergency Care Unit', 'Pediatric Hospital'];
      const urgencies: BloodRequest['urgency'][] = ['Critical', 'High', 'Medium', 'Low'];
      const statuses: BloodRequest['status'][] = ['Pending', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'];
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const purposes = ['Surgery', 'Emergency', 'Transfusion', 'Treatment'];

      for (let i = 1; i <= 30; i++) {
        const requestDate = new Date();
        requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 30));
        
        const requiredBy = new Date();
        requiredBy.setDate(requiredBy.getDate() + Math.floor(Math.random() * 7) + 1);

        requests.push({
          id: `REQ${i.toString().padStart(3, '0')}`,
          requestDate,
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)].slice(0, -1),
          rhFactor: Math.random() > 0.5 ? '+' : '-',
          quantity: Math.floor(Math.random() * 5) + 1,
          hospitalName: hospitals[Math.floor(Math.random() * hospitals.length)],
          patientId: `PT${(Math.floor(Math.random() * 10000) + 1).toString().padStart(5, '0')}`,
          purpose: purposes[Math.floor(Math.random() * purposes.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          requiredBy,
          contactPerson: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)]}`,
          notes: Math.random() > 0.7 ? 'Urgent requirement for surgery' : undefined
        });
      }

      return requests.sort((a, b) => {
        const urgencyOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
    };

    const generateMockUnits = (): AvailableUnit[] => {
      const units: AvailableUnit[] = [];
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const locations = ['Main Bank', 'Branch A', 'Branch B', 'Mobile Unit'];
      const statuses: AvailableUnit['status'][] = ['Available', 'Reserved', 'Dispatched'];

      for (let i = 1; i <= 100; i++) {
        const donationDate = new Date();
        donationDate.setDate(donationDate.getDate() - Math.floor(Math.random() * 30));
        
        const expiryDate = new Date(donationDate);
        expiryDate.setDate(expiryDate.getDate() + 42);

        units.push({
          id: `BU${i.toString().padStart(4, '0')}`,
          bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)].slice(0, -1),
          rhFactor: Math.random() > 0.5 ? '+' : '-',
          donationDate,
          expiryDate,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          compatibility: Math.floor(Math.random() * 100) + 1,
          location: locations[Math.floor(Math.random() * locations.length)],
          donorId: `DN${(Math.floor(Math.random() * 1000) + 1).toString().padStart(4, '0')}`
        });
      }

      return units;
    };

    const mockRequests = generateMockRequests();
    const mockUnits = generateMockUnits();
    
    setBloodRequests(mockRequests);
    setAvailableUnits(mockUnits);    // Calculate stats
    const statsData: FulfillmentStats = {
      totalRequests: mockRequests.length,
      pendingRequests: mockRequests.filter(r => r.status === 'Pending').length,
      fulfilledRequests: mockRequests.filter(r => r.status === 'Fulfilled').length,
      partiallyFulfilled: mockRequests.filter(r => r.status === 'Partially Fulfilled').length,
      averageFulfillmentTime: 2.5,
      fulfillmentRate: 85
    };

    setStats(statsData);
    setLoading(false);
  }, []);

  const findMatchingUnits = (request: BloodRequest): AvailableUnit[] => {
    return availableUnits.filter(unit => {
      // Basic compatibility check
      const isCompatible = (unit.bloodType === request.bloodType && unit.rhFactor === request.rhFactor) ||
                          (request.bloodType === 'AB' && request.rhFactor === '+') || // AB+ can receive any
                          (unit.bloodType === 'O' && unit.rhFactor === '-'); // O- can give to any
      
      return isCompatible && unit.status === 'Available' && unit.expiryDate > new Date();
    }).sort((a, b) => b.compatibility - a.compatibility);
  };
  const handleFulfillRequest = (request: BloodRequest) => {
    setSelectedRequest(request);
    const matching = findMatchingUnits(request);
    setMatchingUnits(matching);
    setSelectedUnits([]);
    setFulfillmentVisible(true);
  };

  const handleAutoFulfill = () => {
    if (!selectedRequest) return;

    const autoSelectedUnits = matchingUnits.slice(0, Math.min(selectedRequest.quantity, matchingUnits.length));
    setSelectedUnits(autoSelectedUnits);
  };

  const confirmFulfillment = () => {
    if (!selectedRequest || selectedUnits.length === 0) return;

    confirmDialog({
      message: `Are you sure you want to fulfill this request with ${selectedUnits.length} unit(s)?`,
      header: 'Confirm Fulfillment',
      icon: 'pi pi-exclamation-triangle',      accept: () => {
        // Update request status
        const updatedRequests = bloodRequests.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: (selectedUnits.length >= req.quantity ? 'Fulfilled' : 'Partially Fulfilled') as BloodRequest['status'] }
            : req
        );
        
        // Update unit statuses
        const updatedUnits = availableUnits.map(unit =>
          selectedUnits.find(selected => selected.id === unit.id)
            ? { ...unit, status: 'Reserved' as const }
            : unit
        );

        setBloodRequests(updatedRequests);
        setAvailableUnits(updatedUnits);
        setFulfillmentVisible(false);
        
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            pendingRequests: stats.pendingRequests - 1,
            fulfilledRequests: selectedUnits.length >= selectedRequest.quantity ? stats.fulfilledRequests + 1 : stats.fulfilledRequests,
            partiallyFulfilled: selectedUnits.length < selectedRequest.quantity ? stats.partiallyFulfilled + 1 : stats.partiallyFulfilled
          });
        }
      }
    });
  };

  const getUrgencySeverity = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'info';
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'success';
      case 'Partially Fulfilled': return 'warning';
      case 'Pending': return 'info';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  const urgencyTemplate = (rowData: BloodRequest) => (
    <Tag value={rowData.urgency} severity={getUrgencySeverity(rowData.urgency)} />
  );

  const statusTemplate = (rowData: BloodRequest) => (
    <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
  );

  const bloodTypeTemplate = (rowData: BloodRequest) => (
    <Badge value={`${rowData.bloodType}${rowData.rhFactor}`} severity="info" />
  );

  const dateTemplate = (rowData: BloodRequest) => (
    <span>{rowData.requestDate.toLocaleDateString()}</span>
  );

  const requiredByTemplate = (rowData: BloodRequest) => {
    const isUrgent = rowData.requiredBy <= new Date();
    return (
      <span className={isUrgent ? 'text-red-500 font-bold' : ''}>
        {rowData.requiredBy.toLocaleDateString()}
        {isUrgent && <AlertCircle size={16} className="ml-1 inline" />}
      </span>
    );
  };

  const actionTemplate = (rowData: BloodRequest) => (
    <div className="flex gap-2">
      <Button
        icon={<Target size={16} />}
        className="p-button-text p-button-sm"
        tooltip="Fulfill Request"
        onClick={() => handleFulfillRequest(rowData)}
        disabled={rowData.status === 'Fulfilled' || rowData.status === 'Cancelled'}
      />
    </div>
  );

  const leftToolbarTemplate = () => (
    <div className="flex align-items-center gap-2">
      <Target size={20} className="text-primary" />
      <span className="text-lg font-semibold">Request Fulfillment</span>
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button
        icon={<RefreshCw size={16} />}
        className="p-button-outlined"
        tooltip="Refresh Data"
        onClick={() => setLoading(true)}
        loading={loading}
      />
    </div>
  );

  const header = (
    <div className="flex flex-column gap-3">
      <div className="flex justify-content-between align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search requests..."
            className="w-20rem"
          />
        </span>
      </div>
      
      <div className="flex gap-3 align-items-center flex-wrap">
        <Dropdown
          value={selectedUrgency}
          options={urgencyOptions}
          onChange={(e) => setSelectedUrgency(e.value)}
          placeholder="Filter by Urgency"
          className="w-12rem"
          showClear
        />
        <Dropdown
          value={selectedStatus}
          options={statusOptions}
          onChange={(e) => setSelectedStatus(e.value)}
          placeholder="Filter by Status"
          className="w-12rem"
          showClear
        />
      </div>
    </div>
  );

  const filteredRequests = bloodRequests.filter(request => {
    if (selectedUrgency && request.urgency !== selectedUrgency) return false;
    if (selectedStatus && request.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="request-fulfillment-page">
      <div className="mb-4">
        <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate} />
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid mb-4">
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalRequests}</div>
              <div className="text-600">Total Requests</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.pendingRequests}</div>
              <div className="text-600">Pending</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.fulfilledRequests}</div>
              <div className="text-600">Fulfilled</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.fulfillmentRate}%</div>
              <div className="text-600">Fulfillment Rate</div>
              <ProgressBar 
                value={stats.fulfillmentRate} 
                className="mt-2" 
                style={{ height: '6px' }}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <Card>
        <DataTable
          value={filteredRequests}
          loading={loading}
          paginator
          rows={15}
          rowsPerPageOptions={[10, 15, 25]}
          header={header}
          globalFilter={globalFilter}
          emptyMessage="No blood requests found"
          responsiveLayout="scroll"
        >
          <Column field="id" header="Request ID" sortable />
          <Column body={urgencyTemplate} header="Urgency" sortable field="urgency" />
          <Column body={bloodTypeTemplate} header="Blood Type" sortable field="bloodType" />
          <Column field="quantity" header="Quantity" sortable />
          <Column field="hospitalName" header="Hospital" sortable />
          <Column field="patientId" header="Patient ID" sortable />
          <Column body={dateTemplate} header="Request Date" sortable field="requestDate" />
          <Column body={requiredByTemplate} header="Required By" sortable field="requiredBy" />
          <Column body={statusTemplate} header="Status" sortable field="status" />
          <Column body={actionTemplate} header="Actions" frozen alignFrozen="right" />
        </DataTable>
      </Card>

      {/* Fulfillment Dialog */}
      <Dialog
        header="Fulfill Blood Request"
        visible={fulfillmentVisible}
        onHide={() => setFulfillmentVisible(false)}
        style={{ width: '800px' }}
        modal
      >
        {selectedRequest && (
          <div>
            <div className="grid mb-4">
              <div className="col-6">
                <div className="field">
                  <label className="font-semibold">Request ID:</label>
                  <div>{selectedRequest.id}</div>
                </div>
                <div className="field">
                  <label className="font-semibold">Blood Type:</label>
                  <Badge value={`${selectedRequest.bloodType}${selectedRequest.rhFactor}`} severity="info" />
                </div>
                <div className="field">
                  <label className="font-semibold">Quantity Needed:</label>
                  <div>{selectedRequest.quantity} unit(s)</div>
                </div>
              </div>
              <div className="col-6">
                <div className="field">
                  <label className="font-semibold">Hospital:</label>
                  <div>{selectedRequest.hospitalName}</div>
                </div>
                <div className="field">
                  <label className="font-semibold">Urgency:</label>
                  <Tag value={selectedRequest.urgency} severity={getUrgencySeverity(selectedRequest.urgency)} />
                </div>
                <div className="field">
                  <label className="font-semibold">Required By:</label>
                  <div>{selectedRequest.requiredBy.toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-content-between align-items-center mb-3">
              <h4>Available Compatible Units ({matchingUnits.length})</h4>
              <Button
                label="Auto Select"
                icon={<CheckCircle size={16} />}
                className="p-button-outlined p-button-sm"
                onClick={handleAutoFulfill}
              />
            </div>

            <DataTable
              value={matchingUnits}
              selection={selectedUnits}
              onSelectionChange={(e) => setSelectedUnits(e.value)}
              selectionMode="multiple"
              paginator
              rows={5}
              emptyMessage="No compatible units available"
              className="mb-4"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column field="id" header="Unit ID" />
              <Column 
                body={(unit) => <Badge value={`${unit.bloodType}${unit.rhFactor}`} severity="info" />} 
                header="Blood Type" 
              />
              <Column field="compatibility" header="Compatibility" body={(unit) => `${unit.compatibility}%`} />
              <Column field="location" header="Location" />
              <Column 
                field="expiryDate" 
                header="Expires" 
                body={(unit) => unit.expiryDate.toLocaleDateString()} 
              />
            </DataTable>

            <div className="flex justify-content-between align-items-center">
              <div>
                <strong>Selected Units: {selectedUnits.length} / {selectedRequest.quantity}</strong>
              </div>
              <div className="flex gap-2">
                <Button
                  label="Cancel"
                  className="p-button-text"
                  onClick={() => setFulfillmentVisible(false)}
                />
                <Button
                  label="Fulfill Request"
                  icon={<CheckCircle size={16} />}
                  onClick={confirmFulfillment}
                  disabled={selectedUnits.length === 0}
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default RequestFulfillmentPage;
