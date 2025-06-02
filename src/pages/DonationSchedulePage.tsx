import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputSwitch } from 'primereact/inputswitch';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from 'primereact/divider';
import { 
  useDonationSchedules, 
  useUpdateDonationSchedule,
  useConfirmSchedule,
  useCancelSchedule,
  useCompleteSchedule
} from './DonationSchedulePage/hooks';
import type { 
  DonationSchedule, 
  DonationScheduleQuery, 
  DonationScheduleQueryParams,
  UpdateDonationScheduleDto
} from './DonationSchedulePage/types';
import { ScheduleStatus } from './DonationSchedulePage/types';
import { ScheduleList } from './DonationSchedulePage/ScheduleList';
import ScheduleSearch from './DonationSchedulePage/ScheduleSearch';
import CreateScheduleForm from './DonationSchedulePage/CreateScheduleForm';
import { ScheduleDetailsModal } from './DonationSchedulePage/ScheduleDetailsModal';
import { EditScheduleModal } from './DonationSchedulePage/EditScheduleModal';
import { ScheduleStats } from './DonationSchedulePage/ScheduleStats';
import { useConfirmationDialog } from './DonationSchedulePage/confirmationDialogs';

const DonationSchedulePage: React.FC = () => {
  const toast = useRef<Toast>(null);
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DonationSchedule | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Query parameters
  const [queryParams, setQueryParams] = useState<DonationScheduleQuery>({
    page: 1,
    limit: 10,
    sortBy: 'scheduledDate',
    sortOrder: 'asc'
  });

  // API hooks
  const { 
    data: schedulesData, 
    isLoading: schedulesLoading, 
    error: schedulesError,
    refetch: refetchSchedules
  } = useDonationSchedules(queryParams);

  const updateScheduleMutation = useUpdateDonationSchedule();
  const confirmScheduleMutation = useConfirmSchedule();
  const cancelScheduleMutation = useCancelSchedule();
  const completeScheduleMutation = useCompleteSchedule();
  // Confirmation dialogs
  const { confirmSchedule, cancelSchedule, completeSchedule } = useConfirmationDialog(toast as React.RefObject<Toast>);

  // Get schedules data
  const schedules = schedulesData?.data || [];
  const totalRecords = schedulesData?.total || 0;
  const currentPage = schedulesData?.page || 1;

  // Handle pagination
  const handlePageChange = (event: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: Math.floor(event.first / event.rows) + 1,
      limit: event.rows
    }));
  };  // Handle search/filter changes - convert from DonationScheduleQueryParams to DonationScheduleQuery
  const handleSearchChange = (params: DonationScheduleQueryParams) => {
    const newParams: Partial<DonationScheduleQuery> = {
      page: params.page,
      limit: params.limit,
      sortBy: params.sort?.replace(/^-/, ''),
      sortOrder: params.sort?.startsWith('-') ? 'desc' : 'asc',
      status: params.status as ScheduleStatus,
      donorId: params.donorId,
      bloodBankId: params.bloodBankId,
      startDate: params.startDate,
      endDate: params.endDate,
      timeSlot: params.timeSlot
    };
    
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Schedule actions
  const handleViewSchedule = (schedule: DonationSchedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsModal(true);
  };

  const handleEditSchedule = (schedule: DonationSchedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };
  const handleConfirmSchedule = (scheduleId: string) => {
    confirmSchedule(async () => {
      await confirmScheduleMutation.mutateAsync(scheduleId);
    });
  };

  const handleCancelSchedule = (scheduleId: string) => {
    cancelSchedule(async () => {
      await cancelScheduleMutation.mutateAsync({ id: scheduleId, reason: 'Cancelled by user' });
    });
  };

  const handleCompleteSchedule = (scheduleId: string) => {
    completeSchedule(async () => {
      await completeScheduleMutation.mutateAsync({ id: scheduleId, donationId: 'pending' });
    });
  };

  const handleUpdateSchedule = async (scheduleId: string, data: UpdateDonationScheduleDto) => {
    try {
      await updateScheduleMutation.mutateAsync({ id: scheduleId, data });
      toast.current?.show({
        severity: 'success',
        summary: 'Schedule Updated',
        detail: 'The donation schedule has been updated successfully.',
        life: 3000
      });
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSchedules();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetchSchedules]);

  // Toolbar content
  const leftToolbarTemplate = () => (
    <div className="flex align-items-center gap-3">
      <h1 className="m-0 text-2xl font-bold text-gray-800">Donation Schedules</h1>
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm"
        onClick={() => refetchSchedules()}
        tooltip="Refresh"
        loading={schedulesLoading}
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex align-items-center gap-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-th-large"></i>
        <InputSwitch 
          checked={viewMode === 'cards'} 
          onChange={(e) => setViewMode(e.value ? 'cards' : 'table')}
          tooltip="Toggle view mode"
        />
        <i className="pi pi-list"></i>
      </div>
      <Divider layout="vertical" />
      <Button
        label="New Schedule"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={() => setShowCreateForm(true)}
      />
    </div>
  );

  return (
    <div className="donation-schedule-page p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header Toolbar */}
      <Card className="mb-4">
        <Toolbar 
          left={leftToolbarTemplate} 
          right={rightToolbarTemplate}
          className="border-none p-0"
        />
      </Card>

      {/* Main Content */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* All Schedules Tab */}
        <TabPanel header="All Schedules" leftIcon="pi pi-calendar mr-2">
          <div className="grid">            {/* Search and Filters */}
            <div className="col-12">
              <ScheduleSearch
                onSearch={handleSearchChange}
                onClear={() => setQueryParams({ page: 1, limit: 10, sortBy: 'scheduledDate', sortOrder: 'asc' })}
              />
            </div>

            {/* Schedule List */}
            <div className="col-12">
              <ScheduleList
                schedules={schedules}
                loading={schedulesLoading}
                error={schedulesError?.message || null}
                totalRecords={totalRecords}
                first={(currentPage - 1) * queryParams.limit!}
                rows={queryParams.limit!}
                onPageChange={handlePageChange}
                onView={handleViewSchedule}
                onEdit={handleEditSchedule}
                onConfirm={handleConfirmSchedule}
                onCancel={handleCancelSchedule}
                onComplete={handleCompleteSchedule}
                viewMode={viewMode}
              />
            </div>
          </div>
        </TabPanel>

        {/* Dashboard Tab */}
        <TabPanel header="Dashboard" leftIcon="pi pi-chart-bar mr-2">
          <div className="grid">
            <div className="col-12">
              <h2 className="mb-4">Schedule Statistics</h2>
              <ScheduleStats 
                schedules={schedules} 
                loading={schedulesLoading}
              />
            </div>
          </div>
        </TabPanel>

        {/* Pending Actions Tab */}
        <TabPanel header="Pending Actions" leftIcon="pi pi-clock mr-2">
          <div className="grid">
            <div className="col-12">
              <ScheduleList
                schedules={schedules.filter(s => s.status === ScheduleStatus.SCHEDULED)}
                loading={schedulesLoading}
                error={schedulesError?.message || null}
                onView={handleViewSchedule}
                onEdit={handleEditSchedule}
                onConfirm={handleConfirmSchedule}
                onCancel={handleCancelSchedule}
                viewMode={viewMode}
              />
            </div>
          </div>
        </TabPanel>

        {/* Upcoming Tab */}
        <TabPanel header="Upcoming" leftIcon="pi pi-arrow-right mr-2">
          <div className="grid">
            <div className="col-12">
              <ScheduleList
                schedules={schedules.filter(s => {
                  const scheduleDate = new Date(s.scheduledDate);
                  const now = new Date();
                  return s.status === ScheduleStatus.CONFIRMED && scheduleDate >= now;
                })}
                loading={schedulesLoading}
                error={schedulesError?.message || null}
                onView={handleViewSchedule}
                onEdit={handleEditSchedule}
                onComplete={handleCompleteSchedule}
                onCancel={handleCancelSchedule}
                viewMode={viewMode}
              />
            </div>
          </div>
        </TabPanel>
      </TabView>

      {/* Create Schedule Modal */}
      <CreateScheduleForm
        visible={showCreateForm}
        onHide={() => setShowCreateForm(false)}
      />

      {/* Schedule Details Modal */}
      <ScheduleDetailsModal
        schedule={selectedSchedule}
        visible={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false);
          setSelectedSchedule(null);
        }}
        onEdit={handleEditSchedule}
        onConfirm={handleConfirmSchedule}
        onCancel={handleCancelSchedule}
        onComplete={handleCompleteSchedule}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        schedule={selectedSchedule}
        visible={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
        }}        onSave={handleUpdateSchedule}
        loading={updateScheduleMutation.isPending}
      />
    </div>
  );
};

export default DonationSchedulePage;
