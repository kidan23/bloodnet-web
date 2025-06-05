import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Sidebar } from "primereact/sidebar";
import { useAuth } from "../../state/authContext";
import {
  Home,
  Heart,
  MapPin,
  Calendar,
  Settings,
  User,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { notificationsService } from "../../services/notificationsService";
import { fetchBloodRequests } from "../../pages/BloodRequestsPage/api";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  badge?: number;
}

interface DonorSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  visible?: boolean;
  onHide?: () => void;
  isMobile?: boolean; // Add explicit mobile prop
}

// Helper function to render Lucide icons
const renderIcon = (
  iconName: string,
  className: string = "",
  size: number = 20
) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Home,
    Heart,
    MapPin,
    Calendar,
    Settings,
    User,
    Bell,
    Activity,
    ChevronLeft,
    ChevronRight,
    BarChart3,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? (
    <IconComponent className={className} size={size} />
  ) : null;
};

const DonorSidebar: React.FC<DonorSidebarProps> = ({
  collapsed = false,
  onToggle = () => {},
  visible = false,
  onHide = () => {},
  isMobile = false, // Default to desktop mode
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // State for live badge counts
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  useEffect(() => {
    // Fetch unread notifications count
    notificationsService.fetchUnreadCount().then(setNotificationCount);
    // Fetch pending blood requests count for this donor
    fetchBloodRequests({ status: "PENDING" }).then((data) => {
      setPendingRequestsCount(data.totalResults || 0);
    });
  }, []);

  // Donor-specific menu items
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "Home",
      to: "/",
    },
    {
      label: "My Donations",
      icon: "Activity",
      to: "/my-donations",
    },
    {
      label: "Nearby Blood Banks",
      icon: "MapPin",
      to: "/nearby-blood-banks",
    },
    {
      label: "Blood Requests",
      icon: "Heart",
      to: "/blood-requests",
      badge: pendingRequestsCount,
    },
    {
      label: "Donation Schedule",
      icon: "Calendar",
      to: "/donation-schedule",
    },
    {
      label: "My Statistics",
      icon: "BarChart3",
      to: "/my-stats",
    },
    {
      label: "Notifications",
      icon: "Bell",
      to: "/notifications",
      badge: notificationCount,
    },
    {
      label: "Donor Settings",
      icon: "Settings",
      to: "/donor-settings",
    },
  ];

  // Sidebar content component (shared between mobile and desktop)
  const SidebarContent = ({ isCollapsed = false, onItemClick = () => {} }) => (
    <div className="flex flex-column h-full">
      <div className="overflow-y-auto flex-1 sidebar-scroll">
        <ul className={`list-none m-0 ${isCollapsed ? "p-2" : "p-4"}`}>
          {/* Collapse/Expand button as menu item when collapsed (desktop only) */}
          {isCollapsed && !isMobile && (
            <li className="mb-2">
              <div
                className="p-ripple flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full justify-content-center p-3 text-xl text-700 hover:surface-100"
                title="Expand"
                onClick={onToggle}
                style={{ minHeight: "3rem" }}
              >
                <ChevronRight size={24} />
                <Ripple />
              </div>
            </li>
          )}

          {menuItems.map((item, index) => (
            <li
              key={index}
              className={isCollapsed && !isMobile ? "mb-2" : "mb-1"}
            >
              <Link
                to={item.to}
                className={`p-ripple no-underline flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full ${
                  location.pathname === item.to
                    ? "bg-primary text-white"
                    : "text-700 hover:surface-100"
                } ${
                  isCollapsed && !isMobile
                    ? "justify-content-center p-2 text-xl"
                    : "p-3"
                }`}
                title={isCollapsed && !isMobile ? item.label : undefined}
                onClick={onItemClick}
              >
                {renderIcon(
                  item.icon,
                  isCollapsed && !isMobile ? "" : "mr-2",
                  isCollapsed && !isMobile ? 24 : 20
                )}
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white border-round px-2 py-1 text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                <Ripple />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Profile Section */}
      {(!isCollapsed || isMobile) && (
        <div className="mt-auto">
          <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
          <div className="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
            <Avatar
              label={user?.email?.charAt(0).toUpperCase()}
              shape="circle"
              style={{ backgroundColor: "#10B981", color: "white" }} // Green for donors
            />
            <div className="flex-1">
              <div className="font-bold text-sm">
                {user?.email && user.email.length > 15
                  ? user.email.slice(0, 14) + "..."
                  : user?.email || "Donor"}
              </div>
              <div className="text-xs text-500">Blood Donor</div>
            </div>
            <Ripple />
          </div>
        </div>
      )}

      {isCollapsed && !isMobile && (
        <div className="mt-auto">
          <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
          <div className="m-3 flex justify-content-center">
            <Avatar
              label={user?.email?.charAt(0).toUpperCase()}
              shape="circle"
              className="cursor-pointer"
              style={{ backgroundColor: "#10B981", color: "white" }} // Green for donors
              title="Blood Donor"
            />
          </div>
        </div>      )}
    </div>
  );

  // Mobile: Use PrimeReact Sidebar
  if (isMobile) {
    return (
      <Sidebar
        visible={visible}
        onHide={onHide}
        position="left"
        className="p-sidebar-sm"
        modal
        showCloseIcon
        style={{ width: "280px" }}
      >
        <div className="mobile-sidebar-header">
          <div className="flex align-items-center gap-2">
            <img
              src="/src/assets/logo.png"
              alt="BloodNet"
              className="h-2rem"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <div className="text-lg font-bold text-primary">BloodNet</div>
              <div className="text-xs text-500">Donor Portal</div>
            </div>
          </div>
        </div>
        <div className="mobile-sidebar-menu">
          <SidebarContent onItemClick={onHide} />
        </div>
      </Sidebar>    );
  }

  // Desktop: Use original design with collapse functionality
  return (
    <div
      className={`donor-sidebar-desktop flex-shrink-0 select-none transition-all transition-duration-300 relative ${
        collapsed ? "w-20 p-2" : "w-280px p-3"
      }`}
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex flex-column h-full bg-white shadow-2 border-round-lg overflow-hidden">
        {/* Collapse/Expand button */}
        {!collapsed && (
          <Button
            type="button"
            onClick={onToggle}
            icon={<ChevronLeft size={16} />}
            className="h-2rem w-2rem bg-white text-gray-700 border-1 border-gray-300 hover:bg-gray-50 shadow-2"
            style={{
              position: "absolute",
              top: "2rem",
              right: "-0.1rem",
              zIndex: 1000,
              borderRadius: "15%",
            }}
            tooltip="Collapse"
            tooltipOptions={{ position: "left" }}
          />
        )}

        <SidebarContent isCollapsed={collapsed} />
      </div>
    </div>
  );
};

export default DonorSidebar;
