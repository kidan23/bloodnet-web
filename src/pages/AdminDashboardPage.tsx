import React from "react";
import { Chart } from "primereact/chart";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { UserRole } from "../state/auth";
import RoleBasedAccess from "../components/RoleBasedAccess";
import "../styles/dashboard.css";
import {
  useAdminKpis,
  useAdminDonationsChart,
  useAdminUserGrowthChart,
  useAdminQuickStats,
  useAdminRecentActivities,
  useAdminBloodInventory,
  useAdminMonthlyTrends,
  useAdminRegionalDistribution,
} from "../state/admin";

const AdminDashboardPage: React.FC = () => {
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErr,
  } = useAdminKpis();
  const { data: donationsChart, isLoading: donationsLoading } =
    useAdminDonationsChart();
  const { data: userGrowthChart, isLoading: userGrowthLoading } =
    useAdminUserGrowthChart();

  // New API hooks for dashboard data
  const { data: quickStatsData, isLoading: quickStatsLoading } =
    useAdminQuickStats();
  const { data: recentActivitiesData, isLoading: activitiesLoading } =
    useAdminRecentActivities({ limit: 4 });
  const { data: bloodInventoryData, isLoading: inventoryLoading } =
    useAdminBloodInventory();
  const { data: monthlyTrendsApiData, isLoading: trendsLoading } =
    useAdminMonthlyTrends();
  const { data: regionalApiData, isLoading: regionalLoading } =
    useAdminRegionalDistribution();
  // Format data for components (use API data or fallback to placeholder)
  const recentActivities =
    recentActivitiesData?.activities?.length > 0
      ? recentActivitiesData.activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          time: new Date(activity.timestamp).toLocaleString(),
          icon:
            activity.type === "donation"
              ? "🩸"
              : activity.type === "registration"
              ? "🏥"
              : activity.type === "approval"
              ? "✅"
              : "🚨",
        }))
      : !activitiesLoading && recentActivitiesData
      ? []
      : [
          {
            id: 1,
            type: "donation",
            title: "New blood donation registered",
            description: "John Doe donated O+ blood",
            time: "2 hours ago",
            icon: "🩸",
          },
          {
            id: 2,
            type: "registration",
            title: "New blood bank registered",
            description: "City General Hospital applied for approval",
            time: "4 hours ago",
            icon: "🏥",
          },
          {
            id: 3,
            type: "approval",
            title: "Blood bank approved",
            description: "Metro Blood Center has been approved",
            time: "1 day ago",
            icon: "✅",
          },
          {
            id: 4,
            type: "donation",
            title: "Emergency request fulfilled",
            description: "AB- blood request completed",
            time: "2 days ago",
            icon: "🚨",
          },
        ];

  const bloodInventory =
    bloodInventoryData?.summary?.length > 0
      ? bloodInventoryData.summary.map((item: any, index: number) => ({
          type: item.bloodType || item.type,
          count: item.availableUnits || item.count || 0,
          percentage:
            item.percentage || Math.floor((item.availableUnits / 300) * 100),
          color: [
            "#ef4444",
            "#10b981",
            "#3b82f6",
            "#8b5cf6",
            "#f59e0b",
            "#ef4444",
            "#06b6d4",
            "#8b5cf6",
          ][index % 8],
        }))
      : !inventoryLoading && bloodInventoryData
      ? []
      : [
          { type: "A+", count: 245, percentage: 85, color: "#ef4444" },
          { type: "O+", count: 189, percentage: 75, color: "#10b981" },
          { type: "B+", count: 156, percentage: 62, color: "#3b82f6" },
          { type: "AB+", count: 98, percentage: 45, color: "#8b5cf6" },
          { type: "A-", count: 67, percentage: 38, color: "#f59e0b" },
          { type: "O-", count: 43, percentage: 25, color: "#ef4444" },
          { type: "B-", count: 34, percentage: 20, color: "#06b6d4" },
          { type: "AB-", count: 21, percentage: 15, color: "#8b5cf6" },
        ];
  const regionData = regionalApiData || {
    labels: ["North", "South", "East", "West", "Central"],
    datasets: [
      {
        data: [45, 32, 28, 38, 42],
        backgroundColor: [
          "#667eea",
          "#764ba2",
          "#f093fb",
          "#f5576c",
          "#4facfe",
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyTrendsData = monthlyTrendsApiData || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Donations",
        data: [120, 190, 300, 500, 200, 300],
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Requests",
        data: [80, 150, 280, 480, 180, 280],
        borderColor: "#f093fb",
        backgroundColor: "rgba(240, 147, 251, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
  return (
    <RoleBasedAccess allowedRoles={[UserRole.ADMIN]} fallback={
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Access Denied</h2>
        </div>
        <div style={{ 
          textAlign: "center", 
          padding: "3rem 2rem", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "12px",
          border: "1px solid #e9ecef"
        }}>
          <i className="pi pi-lock" style={{ fontSize: "3rem", color: "#dc3545", marginBottom: "1rem" }}></i>
          <h3 style={{ color: "#dc3545", marginBottom: "1rem" }}>Admin Access Required</h3>
          <p style={{ color: "#6c757d", marginBottom: "2rem", fontSize: "1.1rem" }}>
            You need administrator privileges to access this dashboard.
          </p>
          <button 
            className="p-button p-component p-button-outlined"
            onClick={() => window.history.back()}
            style={{ marginRight: "1rem" }}
          >
            <span className="p-button-label">Go Back</span>
          </button>
        </div>
      </div>
    }>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Badge value="3" severity="danger" />
            <Avatar
              image="https://dummyimage.com/40"
              shape="circle"
              size="normal"
            />
          </div>
        </div>{" "}
      {/* Hero Dashboard Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
          padding: "3rem 2rem",
          color: "white",
          marginBottom: "3rem",
          boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.3,
          }}
        />

        <div
          style={{ marginBottom: "2.5rem", position: "relative", zIndex: 1 }}
        >
          <h2
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "2.5rem",
              fontWeight: "800",
            }}
          >
            Welcome back, Administrator! 👋
          </h2>
          <p
            style={{
              margin: 0,
              opacity: 0.9,
              fontSize: "1.2rem",
              fontWeight: "300",
            }}
          >
            Here's your blood donation network overview for today.
          </p>
        </div>

        {kpisLoading || quickStatsLoading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <ProgressSpinner style={{ width: 60, height: 60 }} />
          </div>
        ) : kpisError ? (
          <Message
            severity="error"
            text={kpisErr?.message || "Failed to load dashboard data"}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Primary KPIs */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(15px)",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>👥</div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    fontWeight: "500",
                  }}
                >
                  TOTAL USERS
                </div>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}
              >
                {kpis?.totalUsers || 0}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.9,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#4ade80" }}>↗</span> +8.2% from last
                month
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(15px)",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🩸</div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    fontWeight: "500",
                  }}
                >
                  TODAY'S DONATIONS
                </div>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}
              >
                {quickStatsData?.summary?.totalDonations ||
                  kpis?.totalDonations ||
                  24}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.9,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#4ade80" }}>↗</span> +12% from yesterday
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(15px)",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>
                  {quickStatsData?.alerts?.criticalAlerts > 0 ? "🚨" : "✅"}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    fontWeight: "500",
                  }}
                >
                  ALERTS STATUS
                </div>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}
              >
                {quickStatsData?.alerts?.criticalAlerts ||
                  kpis?.pendingRequests ||
                  0}
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                {(quickStatsData?.alerts?.criticalAlerts || 0) > 0
                  ? "Needs attention"
                  : "All systems normal"}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(15px)",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🏥</div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    fontWeight: "500",
                  }}
                >
                  BLOOD BANKS
                </div>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}
              >
                {kpis?.approvedBloodBanks || 0}
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Active nationwide
              </div>
            </div>
          </div>
        )}
      </div>{" "}
      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "2.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Blood Inventory Section */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#2c3e50",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                }}
              >
                Blood Inventory Status
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "0.95rem",
                }}
              >
                Current blood type availability and stock levels
              </p>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                padding: "0.75rem",
                fontSize: "1.5rem",
              }}
            >
              🩸
            </div>
          </div>

          {inventoryLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <ProgressSpinner style={{ width: 50, height: 50 }} />
            </div>
          ) : bloodInventory.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 2rem",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                border: "2px dashed #cbd5e1",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🩸</div>
              <h4
                style={{
                  margin: "0 0 0.75rem 0",
                  color: "#475569",
                  fontSize: "1.2rem",
                }}
              >
                No Blood Inventory Data
              </h4>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
                Blood inventory information will appear here once donations are
                processed and recorded in the system.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {bloodInventory.map((blood: any, index: number) => (
                <div
                  key={index}
                  style={{
                    background: `linear-gradient(135deg, ${blood.color}15, ${blood.color}05)`,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: `1px solid ${blood.color}25`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: "#2c3e50",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Blood Type {blood.type}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {blood.count} units available
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: blood.color,
                        background: `${blood.color}20`,
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                      }}
                    >
                      {blood.percentage}%
                    </div>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "#f1f5f9",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${blood.percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${blood.color}, ${blood.color}dd)`,
                        borderRadius: "4px",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            maxHeight: "600px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#2c3e50",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                }}
              >
                Recent Activities
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "0.9rem",
                }}
              >
                Latest system events
              </p>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                padding: "0.75rem",
                fontSize: "1.25rem",
              }}
            >
              📋
            </div>
          </div>

          {activitiesLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", flex: 1 }}>
              <ProgressSpinner style={{ width: 40, height: 40 }} />
            </div>
          ) : recentActivities.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                border: "2px dashed #cbd5e1",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h4
                style={{
                  margin: "0 0 0.75rem 0",
                  color: "#475569",
                  fontSize: "1.1rem",
                }}
              >
                No Recent Activities
              </h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                System activities and user interactions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{ flex: 1, overflowY: "auto", paddingRight: "0.5rem" }}
              >
                {recentActivities.map((activity: any, index: number) => (
                  <div
                    key={activity.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "1.25rem 0",
                      borderBottom:
                        index < recentActivities.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                        fontSize: "1.5rem",
                        background:
                          activity.type === "donation"
                            ? "linear-gradient(135deg, #ef4444, #dc2626)"
                            : activity.type === "registration"
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : activity.type === "approval"
                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                            : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#2c3e50",
                          marginBottom: "0.25rem",
                          fontSize: "0.95rem",
                        }}
                      >
                        {activity.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "0.5rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {activity.description}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#9ca3af",
                          fontWeight: "500",
                        }}
                      >
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <button
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 2rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  View All Activities
                </button>
              </div>
            </>
          )}
        </div>
      </div>{" "}
      {/* Analytics Dashboard */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "2.5rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                color: "#2c3e50",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              Analytics Overview
            </h3>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "0.95rem",
              }}
            >
              Comprehensive insights into donations, trends, and regional
              performance
            </p>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              padding: "0.75rem",
              fontSize: "1.5rem",
            }}
          >
            📊
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Monthly Trends Chart */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: "0 0 1.5rem 0",
                color: "#2c3e50",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Monthly Trends
            </h4>
            {trendsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <ProgressSpinner style={{ width: 40, height: 40 }} />
              </div>
            ) : !monthlyTrendsData ||
              !monthlyTrendsData.datasets ||
              monthlyTrendsData.datasets.every((dataset: any) =>
                dataset.data.every((value: number) => value === 0)
              ) ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  📈
                </div>
                <h5 style={{ margin: "0 0 0.5rem 0", color: "#475569" }}>
                  No Trend Data
                </h5>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Trends will appear as data accumulates
                </p>
              </div>
            ) : (
              <Chart
                type="line"
                data={monthlyTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: { usePointStyle: true },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                    x: { grid: { display: false } },
                  },
                }}
                style={{ height: "250px" }}
              />
            )}
          </div>

          {/* Regional Distribution Chart */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: "0 0 1.5rem 0",
                color: "#2c3e50",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Regional Distribution
            </h4>
            {regionalLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <ProgressSpinner style={{ width: 40, height: 40 }} />
              </div>
            ) : !regionData ||
              !regionData.datasets ||
              regionData.datasets[0]?.data?.every(
                (value: number) => value === 0
              ) ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  🗺️
                </div>
                <h5 style={{ margin: "0 0 0.5rem 0", color: "#475569" }}>
                  No Regional Data
                </h5>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Regional insights coming soon
                </p>
              </div>
            ) : (
              <Chart
                type="doughnut"
                data={regionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      labels: { usePointStyle: true },
                    },
                  },
                }}
                style={{ height: "250px" }}
              />
            )}
          </div>
        </div>

        {/* Additional Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Donations Chart */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: "0 0 1.5rem 0",
                color: "#2c3e50",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Monthly Donations
            </h4>
            {donationsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <ProgressSpinner style={{ width: 30, height: 30 }} />
              </div>
            ) : !donationsChart ||
              !donationsChart.data ||
              donationsChart.data.every((value: number) => value === 0) ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  📊
                </div>
                <h5 style={{ margin: "0 0 0.5rem 0", color: "#475569" }}>
                  No Donation Data
                </h5>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Statistics will appear once donations are recorded
                </p>
              </div>
            ) : (
              <Chart
                type="line"
                data={{
                  labels: donationsChart.labels,
                  datasets: [
                    {
                      label: "Donations",
                      data: donationsChart.data,
                      fill: true,
                      borderColor: "#42A5F5",
                      backgroundColor: "rgba(66, 165, 245, 0.1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                    x: { grid: { display: false } },
                  },
                }}
                style={{ height: "200px" }}
              />
            )}
          </div>

          {/* User Growth Chart */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: "0 0 1.5rem 0",
                color: "#2c3e50",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              User Growth
            </h4>
            {userGrowthLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <ProgressSpinner style={{ width: 30, height: 30 }} />
              </div>
            ) : !userGrowthChart ||
              !userGrowthChart.data ||
              userGrowthChart.data.every((value: number) => value === 0) ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  👥
                </div>
                <h5 style={{ margin: "0 0 0.5rem 0", color: "#475569" }}>
                  No User Growth Data
                </h5>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Statistics will appear as users register
                </p>
              </div>
            ) : (
              <Chart
                type="bar"
                data={{
                  labels: userGrowthChart.labels,
                  datasets: [
                    {
                      label: "Users",
                      data: userGrowthChart.data,
                      backgroundColor: "rgba(102, 126, 234, 0.8)",
                      borderColor: "#667eea",
                      borderWidth: 1,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                    x: { grid: { display: false } },
                  },
                }}
                style={{ height: "200px" }}
              />          )}
          </div>
        </div>
      </div>
    </div>
    </RoleBasedAccess>
  );
};

export default AdminDashboardPage;
