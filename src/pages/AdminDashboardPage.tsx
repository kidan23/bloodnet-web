import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import "../styles/dashboard.css";
import { useAdminKpis, useAdminDonationsChart, useAdminUserGrowthChart } from "../state/admin";

const AdminDashboardPage: React.FC = () => {
  const { data: kpis, isLoading: kpisLoading, isError: kpisError, error: kpisErr } = useAdminKpis();
  const { data: donationsChart, isLoading: donationsLoading } = useAdminDonationsChart();
  const { data: userGrowthChart, isLoading: userGrowthLoading } = useAdminUserGrowthChart();

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      {kpisLoading ? (
        <ProgressSpinner style={{ width: 50, height: 50 }} />
      ) : kpisError ? (
        <Message severity="error" text={kpisErr?.message || "Failed to load KPIs"} />
      ) : (
        <div className="kpi-cards">
          <Card title="Total Users">
            <div className="kpi-value">{kpis.totalUsers}</div>
          </Card>
          <Card title="Total Donations">
            <div className="kpi-value">{kpis.totalDonations}</div>
          </Card>
          <Card title="Pending Requests">
            <div className="kpi-value">{kpis.pendingRequests}</div>
          </Card>
          <Card title="Approved Blood Banks">
            <div className="kpi-value">{kpis.approvedBloodBanks}</div>
          </Card>
          <Card title="Rejected Applications">
            <div className="kpi-value">{kpis.rejectedApplications}</div>
          </Card>
        </div>
      )}

      <div className="dashboard-charts">
        <Card title="Donations Per Month" className="dashboard-chart-card">
          {donationsLoading ? (
            <ProgressSpinner style={{ width: 30, height: 30 }} />
          ) : donationsChart ? (
            <Chart
              type="line"
              data={{
                labels: donationsChart.labels,
                datasets: [
                  {
                    label: "Donations",
                    data: donationsChart.data,
                    fill: false,
                    borderColor: "#42A5F5",
                  },
                ],
              }}
            />
          ) : null}
        </Card>
        <Card title="User Growth" className="dashboard-chart-card">
          {userGrowthLoading ? (
            <ProgressSpinner style={{ width: 30, height: 30 }} />
          ) : userGrowthChart ? (
            <Chart
              type="bar"
              data={{
                labels: userGrowthChart.labels,
                datasets: [
                  {
                    label: "Users",
                    data: userGrowthChart.data,
                    backgroundColor: "#66BB6A",
                  },
                ],
              }}
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
