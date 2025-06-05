import React, { useState } from "react";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { UserRole } from "../state/auth";
import RoleBasedAccess from "../components/RoleBasedAccess";
import {
  useAdminMonthlyTrends,
  useAdminRegionalDistribution,
  useAdminBloodInventory,
  useAdminRecentActivities,
  useAdminQuickStats,
  useAdminDonationsChart,
  useAdminUserGrowthChart,
} from "../state/admin";

const ReportsPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeIndex, setActiveIndex] = useState(0);

  // Data hooks
  const { data: monthlyTrends, isLoading: trendsLoading } = useAdminMonthlyTrends({ 
    year: selectedYear, 
    months: 12 
  });
  const { data: regionalData, isLoading: regionalLoading } = useAdminRegionalDistribution();
  const { data: inventoryData, isLoading: inventoryLoading } = useAdminBloodInventory();
  const { data: activitiesData, isLoading: activitiesLoading } = useAdminRecentActivities({ 
    limit: 50 
  });
  const { data: quickStats, isLoading: statsLoading } = useAdminQuickStats();
  const { data: donationsChart, isLoading: donationsLoading } = useAdminDonationsChart();
  const { data: userGrowthChart, isLoading: userGrowthLoading } = useAdminUserGrowthChart();

  // Year options for dropdown
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    label: (new Date().getFullYear() - i).toString(),
    value: new Date().getFullYear() - i
  }));

  // Process monthly trends data
  const processedMonthlyTrends = monthlyTrends || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Donations',
        data: [45, 65, 80, 70, 95, 120, 140, 110, 100, 85, 75, 90],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Blood Requests',
        data: [25, 35, 45, 40, 55, 70, 80, 65, 60, 50, 45, 55],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Users',
        data: [15, 25, 35, 30, 40, 50, 55, 45, 40, 35, 30, 40],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Process regional distribution
  const processedRegionalData = regionalData || {
    labels: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Ohio'],
    datasets: [{
      data: [850, 720, 650, 580, 450, 380],
      backgroundColor: [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Process blood inventory data
  const processedInventoryData = inventoryData?.summary || [
    { bloodType: 'O+', availableUnits: 245, criticalLevel: 100, status: 'sufficient' },
    { bloodType: 'A+', availableUnits: 189, criticalLevel: 80, status: 'sufficient' },
    { bloodType: 'B+', availableUnits: 156, criticalLevel: 70, status: 'sufficient' },
    { bloodType: 'AB+', availableUnits: 98, criticalLevel: 50, status: 'sufficient' },
    { bloodType: 'O-', availableUnits: 43, criticalLevel: 60, status: 'critical' },
    { bloodType: 'A-', availableUnits: 67, criticalLevel: 50, status: 'sufficient' },
    { bloodType: 'B-', availableUnits: 34, criticalLevel: 40, status: 'low' },
    { bloodType: 'AB-', availableUnits: 21, criticalLevel: 30, status: 'critical' }
  ];
  // Process activities data for detailed reporting
  const processedActivities = (activitiesData?.activities || [
    { id: 1, type: 'donation', description: 'Blood donation completed at City Hospital', timestamp: new Date(), user: { _id: '1', email: 'john.smith@email.com' }, location: 'City Hospital' },
    { id: 2, type: 'request', description: 'Emergency blood request for O- blood', timestamp: new Date(Date.now() - 3600000), user: { _id: '2', email: 'metro.medical@hospital.com' }, location: 'Metro Medical Center' },
    { id: 3, type: 'registration', description: 'New blood bank registered', timestamp: new Date(Date.now() - 7200000), user: { _id: '3', email: 'regional@bloodcenter.com' }, location: 'Downtown' },
    { id: 4, type: 'approval', description: 'Blood bank application approved', timestamp: new Date(Date.now() - 10800000), user: { _id: '4', email: 'community@healthcenter.com' }, location: 'Suburb Area' },
  ]).map((activity: any) => ({
    ...activity,
    // Handle user field - extract email if it's an object, otherwise use as string
    userDisplay: typeof activity.user === 'object' && activity.user?.email 
      ? activity.user.email 
      : activity.user || 'Unknown User'
  }));

  const statusBodyTemplate = (rowData: any) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'critical': return 'danger';
        case 'low': return 'warning';
        case 'sufficient': return 'success';
        default: return 'info';
      }
    };
    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
  };

  const exportReport = (type: string) => {
    // Placeholder for export functionality
    console.log(`Exporting ${type} report...`);
  };
  return (
    <RoleBasedAccess allowedRoles={[UserRole.ADMIN]} fallback={
      <div style={{ 
        textAlign: "center", 
        padding: "3rem 2rem", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "12px",
        border: "1px solid #e9ecef",
        margin: "2rem"
      }}>
        <i className="pi pi-lock" style={{ fontSize: "3rem", color: "#dc3545", marginBottom: "1rem" }}></i>
        <h3 style={{ color: "#dc3545", marginBottom: "1rem" }}>Admin Access Required</h3>
        <p style={{ color: "#6c757d", marginBottom: "2rem", fontSize: "1.1rem" }}>
          You need administrator privileges to access the reports dashboard.
        </p>
        <Button 
          label="Go Back"
          outlined
          onClick={() => window.history.back()}
        />
      </div>
    }>
      <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
        {/* Page Header */}
      <div style={{ 
        marginBottom: '2rem', 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '2.5rem', fontWeight: '700' }}>
              📊 Comprehensive Reports
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1.1rem' }}>
              Detailed analytics and insights for blood donation network management
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Dropdown 
              value={selectedYear} 
              options={yearOptions} 
              onChange={(e) => setSelectedYear(e.value)}
              placeholder="Select Year"
              style={{ minWidth: '120px' }}
            />
            <Button 
              label="Export All" 
              icon="pi pi-download" 
              className="p-button-outlined"
              onClick={() => exportReport('comprehensive')}
            />
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        {statsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {quickStats?.summary?.totalDonations || 1247}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Donations</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #EF4444, #DC2626)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {quickStats?.summary?.totalDonors || 856}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Donors</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #10B981, #059669)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {quickStats?.summary?.successRate || 94}%
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Success Rate</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #F59E0B, #D97706)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {quickStats?.alerts?.pendingRequests || 23}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending Requests</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Reports Content */}
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        
        {/* Monthly Trends Report */}
        <TabPanel header="📈 Monthly Trends" leftIcon="pi pi-chart-line mr-2">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <Card title="Annual Trends Analysis" style={{ height: 'fit-content' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Comprehensive view of donations, requests, and user growth for {selectedYear}
                </p>
                <Button 
                  label="Export" 
                  icon="pi pi-download" 
                  size="small"
                  className="p-button-text"
                  onClick={() => exportReport('monthly-trends')}
                />
              </div>
              {trendsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ProgressSpinner />
                </div>
              ) : (
                <Chart 
                  type="line" 
                  data={processedMonthlyTrends}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: { usePointStyle: true }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                  style={{ height: '400px' }}
                />
              )}
            </Card>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card title="Key Insights" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
                    <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>Peak Donation Period</div>
                    <div style={{ color: '#374151', fontSize: '0.9rem' }}>July-August showed highest donation activity with 140 donations in July</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>Request Spike</div>
                    <div style={{ color: '#374151', fontSize: '0.9rem' }}>Emergency requests peaked in July (80 requests) during summer period</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>User Growth</div>
                    <div style={{ color: '#374151', fontSize: '0.9rem' }}>Steady growth with 55 new users registered in July</div>
                  </div>
                </div>
              </Card>
              
              <Card title="Year-over-Year Comparison">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#6b7280' }}>vs Previous Year</span>
                  <Tag value="+12.5%" severity="success" />
                </div>
                <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                  Total donations increased by 12.5% compared to {selectedYear - 1}, with significant improvements in Q3.
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Regional Distribution Report */}
        <TabPanel header="🗺️ Regional Analysis" leftIcon="pi pi-map mr-2">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <Card title="Regional Distribution" style={{ height: 'fit-content' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Donation distribution across different regions
                </p>
                <Button 
                  label="Export" 
                  icon="pi pi-download" 
                  size="small"
                  className="p-button-text"
                  onClick={() => exportReport('regional')}
                />
              </div>
              {regionalLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ProgressSpinner />
                </div>
              ) : (
                <Chart 
                  type="doughnut" 
                  data={processedRegionalData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: { usePointStyle: true }
                      }
                    }
                  }}
                  style={{ height: '400px' }}
                />
              )}
            </Card>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card title="Regional Performance" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {processedRegionalData.labels?.map((region: string, index: number) => (
                    <div key={region} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: processedRegionalData.datasets[0].backgroundColor[index] 
                        }}></div>
                        <span style={{ fontWeight: '500' }}>{region}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                          {processedRegionalData.datasets[0].data[index]}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>donations</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card title="Regional Insights">
                <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
                  <p><strong>Top Performer:</strong> California leads with 850 donations (23.8% of total)</p>
                  <p><strong>Growth Opportunity:</strong> Ohio shows potential for expansion with targeted campaigns</p>
                  <p><strong>Coverage:</strong> 6 major regions contributing to nationwide blood supply network</p>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Blood Inventory Report */}
        <TabPanel header="🩸 Inventory Analysis" leftIcon="pi pi-chart-bar mr-2">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <Card title="Blood Type Inventory Status">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Current availability and critical levels for all blood types
                </p>
                <Button 
                  label="Export" 
                  icon="pi pi-download" 
                  size="small"
                  className="p-button-text"
                  onClick={() => exportReport('inventory')}
                />
              </div>
              {inventoryLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ProgressSpinner />
                </div>
              ) : (
                <DataTable value={processedInventoryData} responsiveLayout="scroll">
                  <Column field="bloodType" header="Blood Type" style={{ fontWeight: 'bold' }} />
                  <Column field="availableUnits" header="Available Units" />
                  <Column field="criticalLevel" header="Critical Level" />
                  <Column field="status" header="Status" body={statusBodyTemplate} />
                </DataTable>
              )}
            </Card>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card title="Critical Alerts" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {processedInventoryData
                    .filter((item: any) => item.status === 'critical' || item.status === 'low')
                    .map((item: any) => (
                      <div key={item.bloodType} style={{ 
                        padding: '1rem', 
                        background: item.status === 'critical' ? '#fef2f2' : '#fffbeb',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${item.status === 'critical' ? '#EF4444' : '#F59E0B'}`
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: item.status === 'critical' ? '#dc2626' : '#d97706',
                          marginBottom: '0.5rem' 
                        }}>
                          {item.bloodType} - {item.status.toUpperCase()}
                        </div>
                        <div style={{ color: '#374151', fontSize: '0.9rem' }}>
                          {item.availableUnits} units available (Critical: {item.criticalLevel})
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
              
              <Card title="Inventory Summary">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Units:</span>
                    <strong>{processedInventoryData.reduce((sum: number, item: any) => sum + item.availableUnits, 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Critical Types:</span>
                    <strong style={{ color: '#dc2626' }}>
                      {processedInventoryData.filter((item: any) => item.status === 'critical').length}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Low Stock:</span>
                    <strong style={{ color: '#d97706' }}>
                      {processedInventoryData.filter((item: any) => item.status === 'low').length}
                    </strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Activity Reports */}
        <TabPanel header="📋 Activity Log" leftIcon="pi pi-history mr-2">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <Card title="Recent System Activities">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Detailed log of all system activities and user interactions
                </p>
                <Button 
                  label="Export" 
                  icon="pi pi-download" 
                  size="small"
                  className="p-button-text"
                  onClick={() => exportReport('activities')}
                />
              </div>
              {activitiesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ProgressSpinner />
                </div>
              ) : (
                <DataTable 
                  value={processedActivities} 
                  responsiveLayout="scroll"
                  paginator 
                  rows={10}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                >
                  <Column 
                    field="type" 
                    header="Type" 
                    body={(rowData) => (
                      <Tag 
                        value={rowData.type} 
                        severity={
                          rowData.type === 'donation' ? 'success' :
                          rowData.type === 'request' ? 'warning' :
                          rowData.type === 'registration' ? 'info' : 'secondary'
                        }
                      />
                    )}
                  />
                  <Column field="description" header="Description" />
                  <Column field="userDisplay" header="User/Entity" />
                  <Column field="location" header="Location" />
                  <Column 
                    field="timestamp" 
                    header="Time" 
                    body={(rowData) => new Date(rowData.timestamp).toLocaleString()}
                  />
                </DataTable>
              )}
            </Card>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card title="Activity Summary">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '8px'
                  }}>
                    <span>🩸 Donations</span>
                    <strong style={{ color: '#059669' }}>
                      {processedActivities.filter((a: any) => a.type === 'donation').length}
                    </strong>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#fffbeb',
                    borderRadius: '8px'
                  }}>
                    <span>🆘 Requests</span>
                    <strong style={{ color: '#d97706' }}>
                      {processedActivities.filter((a: any) => a.type === 'request').length}
                    </strong>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f0f9ff',
                    borderRadius: '8px'
                  }}>
                    <span>📝 Registrations</span>
                    <strong style={{ color: '#2563eb' }}>
                      {processedActivities.filter((a: any) => a.type === 'registration').length}
                    </strong>
                  </div>
                </div>
              </Card>
              
              <Card title="Performance Metrics">
                <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
                  <p><strong>Peak Activity:</strong> 2-4 PM daily</p>
                  <p><strong>Response Time:</strong> Average 15 minutes</p>
                  <p><strong>Success Rate:</strong> 94% completion rate</p>
                  <p><strong>User Engagement:</strong> High activity in urban areas</p>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Comparative Analytics */}
        <TabPanel header="📊 Comparative Analysis" leftIcon="pi pi-chart-line mr-2">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <Card title="Donations vs User Growth">
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                  Correlation between user registrations and donation activities
                </p>
              </div>
              {donationsLoading || userGrowthLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <ProgressSpinner />
                </div>
              ) : (
                <Chart 
                  type="bar" 
                  data={{
                    labels: donationsChart?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Donations',
                        data: donationsChart?.data || [45, 65, 80, 70, 95, 120],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: '#3B82F6',
                        borderWidth: 1
                      },
                      {
                        label: 'New Users',
                        data: userGrowthChart?.data?.slice(0, 6) || [15, 25, 35, 30, 40, 50],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10B981',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                  style={{ height: '300px' }}
                />
              )}
            </Card>
            
            <Card title="Performance Indicators">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Donation Efficiency</span>
                    <span style={{ fontWeight: 'bold', color: '#059669' }}>94%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '94%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #10B981, #059669)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Request Fulfillment</span>
                    <span style={{ fontWeight: 'bold', color: '#3B82F6' }}>87%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '87%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>User Retention</span>
                    <span style={{ fontWeight: 'bold', color: '#8B5CF6' }}>76%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '76%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <Card title="Executive Summary">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              marginTop: '1rem'
            }}>
              <div>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Key Achievements</h4>
                <ul style={{ color: '#374151', lineHeight: '1.8' }}>
                  <li>12.5% increase in total donations year-over-year</li>
                  <li>94% donation efficiency rate maintained</li>
                  <li>Expanded to 6 major regional markets</li>
                  <li>Successfully handled 23 emergency requests</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Areas for Improvement</h4>
                <ul style={{ color: '#374151', lineHeight: '1.8' }}>
                  <li>O- and AB- blood types showing critical levels</li>
                  <li>Regional distribution could be more balanced</li>
                  <li>User retention can be improved in suburban areas</li>
                  <li>Response time for emergency requests needs optimization</li>
                </ul>
              </div>
            </div>
          </Card>        </TabPanel>
      </TabView>
    </div>
    </RoleBasedAccess>
  );
};

export default ReportsPage;
