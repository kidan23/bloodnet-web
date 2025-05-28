import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { StyleClass } from "primereact/styleclass";
import { OverlayPanel } from "primereact/overlaypanel";
import { useAuth } from "../../state/authContext";
import { UserRole } from "../../state/auth";
import {
  Home,
  Heart,
  Users,
  Building,
  Hospital,
  Calendar,
  List,
  Plus,
  BarChart3,
  Settings,
  User,
  Sliders,
  Shield,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  items?: MenuItem[];
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
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
    Users,
    Building,
    Hospital,
    Calendar,
    List,
    Plus,
    BarChart3,
    Settings,
    User,
    Sliders,
    Shield,
    FileCheck,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? (
    <IconComponent className={className} size={size} />
  ) : null;
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle = () => {},
}) => {  const location = useLocation();
  const { userRole, user } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeActiveSubmenu();
      }
    };

    if (activeSubmenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeSubmenu]);

  // Create refs for submenu items
  const donationsMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const adminMenuRef = useRef(null);

  // Create refs for overlay panels
  const donationsOverlayRef = useRef<OverlayPanel>(null);
  const settingsOverlayRef = useRef<OverlayPanel>(null);
  const adminOverlayRef = useRef<OverlayPanel>(null);
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "Home",
      to: "/",
    },
    {
      label: "Blood Requests",
      icon: "Heart",
      to: "/blood-requests",
    },
    {
      label: "Donors",
      icon: "Users",
      to: "/donors",
    },
    {
      label: "Blood Banks",
      icon: "Building",
      to: "/blood-banks",
    },
    {
      label: "Medical Institutions",
      icon: "Hospital",
      to: "/medical-institutions",
    },
    {
      label: "Donations",
      icon: "Calendar",
      to: "/donations",
      items: [
        {
          label: "All Donations",
          icon: "List",
          to: "/donations",
        },
        {
          label: "Record Donation",
          icon: "Plus",
          to: "/donations/create",
        },
      ],
    },
    {
      label: "Reports",
      icon: "BarChart3",
      to: "/reports",
    },
    {
      label: "Settings",
      icon: "Settings",
      to: "/settings",
      items: [
        {
          label: "Account",
          icon: "User",
          to: "/settings/account",
        },
        {
          label: "Preferences",
          icon: "Sliders",
          to: "/settings/preferences",
        },
      ],
    },
  ]; // Add admin menu items for admin users
  if (userRole === UserRole.ADMIN) {
    menuItems.splice(-1, 0, {
      label: "Admin",
      icon: "Shield",
      to: "/admin",
      items: [
        {
          label: "Applications",
          icon: "FileCheck",
          to: "/admin/applications",
        },
      ],
    });
  }

  // Helper function to get overlay ref for a menu item
  const getOverlayRef = (label: string) => {
    switch (label) {
      case "Donations":
        return donationsOverlayRef;
      case "Settings":
        return settingsOverlayRef;
      case "Admin":
        return adminOverlayRef;
      default:
        return null;
    }  }; 

  // Helper function to handle submenu click when collapsed
  const handleSubmenuClick = (event: React.MouseEvent, item: MenuItem) => {
    if (collapsed && item.items) {
      const overlayRef = getOverlayRef(item.label);
      if (overlayRef?.current) {
        if (activeSubmenu === item.label) {
          // If this submenu is already open, close it
          overlayRef.current.hide();
          setActiveSubmenu(null);
        } else {
          // Close any other open submenu first
          if (activeSubmenu) {
            const prevOverlayRef = getOverlayRef(activeSubmenu);
            prevOverlayRef?.current?.hide();
          }
          // Open this submenu
          setActiveSubmenu(item.label);
          overlayRef.current.show(event, event.currentTarget);
        }
      }
    }
  };

  // Helper function to close active submenu
  const closeActiveSubmenu = () => {
    if (activeSubmenu) {
      const overlayRef = getOverlayRef(activeSubmenu);
      overlayRef?.current?.hide();
      setActiveSubmenu(null);
    }
  };  return (
    <div
      ref={sidebarRef}
      className={`flex-shrink-0 select-none transition-all transition-duration-300 relative ${
        collapsed ? "w-20 p-2" : "w-280px p-3"
      }`}
      style={{ height: "calc(100vh - 120px)" }}
    >
      {" "}
      <div className="flex flex-column h-full bg-white shadow-2 border-round-lg overflow-hidden">
        {" "}
        {/* Collapse/Expand button - positioned absolutely when expanded, as menu item when collapsed */}{" "}
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
        <div className="overflow-y-auto flex-1 sidebar-scroll">
          <ul className={`list-none m-0 ${collapsed ? "p-2" : "p-4"}`}>
            {/* Collapse/Expand button as menu item when collapsed */}{" "}
            {collapsed && (
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
              <li key={index} className={collapsed ? "mb-2" : "mb-1"}>
                {item.items && !collapsed ? (
                  // Regular submenu for expanded sidebar
                  <>
                    <StyleClass
                      nodeRef={
                        item.label === "Donations"
                          ? donationsMenuRef
                          : item.label === "Admin"
                          ? adminMenuRef
                          : settingsMenuRef
                      }
                      selector="@next"
                      enterClassName="hidden"
                      enterActiveClassName="slidedown"
                      leaveToClassName="hidden"
                      leaveActiveClassName="slideup"
                    >
                      <div
                        ref={
                          item.label === "Donations"
                            ? donationsMenuRef
                            : item.label === "Admin"
                            ? adminMenuRef
                            : settingsMenuRef
                        }
                        className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                      >
                        {renderIcon(item.icon, "mr-2")}
                        <span className="font-medium">{item.label}</span>
                        <ChevronDown className="ml-auto mr-1" size={16} />
                        <Ripple />
                      </div>
                    </StyleClass>
                    <ul className="list-none py-0 pl-3 pr-0 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out">
                      {item.items.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            to={child.to}
                            className={`p-ripple no-underline flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors w-full ${
                              location.pathname === child.to
                                ? "bg-primary text-white"
                                : "text-700 hover:surface-100"
                            }`}
                          >
                            {renderIcon(child.icon, "mr-2")}
                            <span className="font-medium">{child.label}</span>
                            <Ripple />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : item.items && collapsed ? (
                  // Collapsed submenu with overlay
                  <>
                    {" "}                    <div
                      className={`p-ripple flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full justify-content-center p-3 text-xl text-700 hover:surface-100`}
                      title={item.label}
                      onClick={(e) => handleSubmenuClick(e, item)}
                      style={{ minHeight: "3rem" }} // Ensure consistent hover area
                    >
                      {renderIcon(item.icon, "", 24)}
                      <Ripple />
                    </div>{" "}                    <OverlayPanel
                      ref={getOverlayRef(item.label)}
                      className="w-auto"
                      style={{ minWidth: "200px" }}
                    >
                      <div className="p-2">
                        <div className="font-semibold text-primary mb-2 px-2">
                          {item.label}
                        </div>
                        {item.items.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.to}
                            className={`p-ripple no-underline flex align-items-center cursor-pointer p-2 border-round transition-duration-150 transition-colors w-full ${
                              location.pathname === child.to
                                ? "bg-primary text-white"
                                : "text-700 hover:surface-100"
                            }`}                            onClick={() => {
                              const overlayRef = getOverlayRef(item.label);
                              overlayRef?.current?.hide();
                              setActiveSubmenu(null);
                            }}
                          >
                            {renderIcon(child.icon, "mr-2")}
                            <span className="font-medium">{child.label}</span>
                            <Ripple />
                          </Link>
                        ))}
                      </div>
                    </OverlayPanel>
                  </>
                ) : (
                  // Regular menu item without submenu
                  <Link
                    to={item.to}
                    className={`p-ripple no-underline flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full ${
                      location.pathname === item.to
                        ? "bg-primary text-white"
                        : "text-700 hover:surface-100"
                    } ${
                      collapsed ? "justify-content-center p-2 text-xl" : "p-3"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {renderIcon(
                      item.icon,
                      collapsed ? "" : "mr-2",
                      collapsed ? 24 : 20
                    )}
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    <Ripple />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>{" "}
        {!collapsed && (
          <div className="mt-auto">
            <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
            <a className="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
              <Avatar
                label={user?.email?.charAt(0).toUpperCase()}
                shape="circle"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              />
              <span className="font-bold" title={user?.email || "User"}>
                {user?.email && user.email.length > 15
                  ? user.email.slice(0, 14) + "..."
                  : user?.email || "User"}
              </span>
              <Ripple />
            </a>
          </div>
        )}{" "}
        {collapsed && (
          <div className="mt-auto">
            <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
            <div className="m-3 flex justify-content-center">
              {" "}
              <Avatar
                label={user?.email?.charAt(0).toUpperCase()}
                shape="circle"
                className="cursor-pointer"
                style={{ backgroundColor: "#3B82F6", color: "white" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
