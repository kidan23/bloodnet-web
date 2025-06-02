import React from "react";
import { Card } from "primereact/card";
import { Statistic } from "antd";
import { type DonationSchedule, ScheduleStatus } from "./types";

interface ScheduleStatsProps {
  schedules: DonationSchedule[];
  loading?: boolean;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({
  schedules = [],
  loading = false,
}) => {
  const stats = React.useMemo(() => {
    const total = schedules.length;
    const scheduled = schedules.filter(
      (s) => s.status === ScheduleStatus.SCHEDULED
    ).length;
    const confirmed = schedules.filter(
      (s) => s.status === ScheduleStatus.CONFIRMED
    ).length;
    const completed = schedules.filter(
      (s) => s.status === ScheduleStatus.COMPLETED
    ).length;
    const cancelled = schedules.filter(
      (s) => s.status === ScheduleStatus.CANCELLED
    ).length;

    const thisWeek = schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledDate);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return scheduleDate >= weekStart && scheduleDate < weekEnd;
    }).length;

    const upcomingConfirmed = schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledDate);
      const now = new Date();
      return s.status === ScheduleStatus.CONFIRMED && scheduleDate >= now;
    }).length;

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      thisWeek,
      upcomingConfirmed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [schedules]);

  return (
    <div className="grid">
      <div className="col-6 lg:col-3">
        <Card className="text-center bg-blue-50 border-blue-200">
          <Statistic
            title="Total Schedules"
            value={stats.total}
            loading={loading}
            valueStyle={{ color: "#1e40af" }}
            prefix={<i className="pi pi-calendar text-blue-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-orange-50 border-orange-200">
          <Statistic
            title="Scheduled"
            value={stats.scheduled}
            loading={loading}
            valueStyle={{ color: "#ea580c" }}
            prefix={<i className="pi pi-clock text-orange-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-green-50 border-green-200">
          <Statistic
            title="Confirmed"
            value={stats.confirmed}
            loading={loading}
            valueStyle={{ color: "#16a34a" }}
            prefix={<i className="pi pi-check-circle text-green-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-emerald-50 border-emerald-200">
          <Statistic
            title="Completed"
            value={stats.completed}
            loading={loading}
            valueStyle={{ color: "#059669" }}
            prefix={<i className="pi pi-check text-emerald-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-red-50 border-red-200">
          <Statistic
            title="Cancelled"
            value={stats.cancelled}
            loading={loading}
            valueStyle={{ color: "#dc2626" }}
            prefix={<i className="pi pi-times-circle text-red-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-purple-50 border-purple-200">
          <Statistic
            title="This Week"
            value={stats.thisWeek}
            loading={loading}
            valueStyle={{ color: "#9333ea" }}
            prefix={<i className="pi pi-calendar-times text-purple-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-indigo-50 border-indigo-200">
          <Statistic
            title="Upcoming Confirmed"
            value={stats.upcomingConfirmed}
            loading={loading}
            valueStyle={{ color: "#4f46e5" }}
            prefix={<i className="pi pi-arrow-up text-indigo-600"></i>}
          />
        </Card>
      </div>

      <div className="col-6 lg:col-3">
        <Card className="text-center bg-teal-50 border-teal-200">
          <Statistic
            title="Completion Rate"
            value={stats.completionRate}
            suffix="%"
            loading={loading}
            valueStyle={{ color: "#0d9488" }}
            prefix={<i className="pi pi-chart-line text-teal-600"></i>}
          />
        </Card>
      </div>
    </div>
  );
};
