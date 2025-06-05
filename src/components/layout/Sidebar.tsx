import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { StyleClass } from "primereact/styleclass";
import { OverlayPanel } from "primereact/overlaypanel";
import { Sidebar as PrimeReactSidebar } from "primereact/sidebar";
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
  Bell,
  Truck,
  Clock,
  Activity,
  Target,
} from "lucide-react";
import { notificationsService } from "../../services/notificationsService";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  items?: MenuItem[];
  badge?: number;
  allowedRoles?: UserRole[]; // Optional role restriction
}

interface SidebarProps {
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
) => {  const iconMap: { [key: string]: React.ComponentType<any> } = {
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
    Bell,
    Truck,
    Clock,
    Activity,
    Target,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? (
    <IconComponent className={className} size={size} />
  ) : null;
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle = () => {},
  visible = false,
  onHide = () => {},
  isMobile = false, // Default to desktop mode
}) => {
  const location = useLocation();
  const { userRole, user } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
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

  // Fetch unread notification count
  useEffect(() => {
    async function fetchCount() {
      try {
        const count = await notificationsService.fetchUnreadCount();
        setNotificationCount(count);
      } catch (e) {
        setNotificationCount(0);
      }
    }
    fetchCount();
  }, []);

  // Create refs for submenu items
  const donationsMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const adminMenuRef = useRef(null);

  // Create refs for overlay panels
  const donationsOverlayRef = useRef<OverlayPanel>(null);
  const settingsOverlayRef = useRef<OverlayPanel>(null);
  const adminOverlayRef = useRef<OverlayPanel>(null);  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "Home",
      to: "/",
      allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
    },
    {
      label: "Blood Requests",
      icon: "Heart",
      to: "/blood-requests",
      allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
    },
    {
      label: "Donors",
      icon: "Users",
      to: "/donors",
      allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK],
    },
    {
      label: "Blood Banks",
      icon: "Building",
      to: "/blood-banks",
      allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
    },
    {
      label: "Medical Institutions",
      icon: "Hospital",
      to: "/medical-institutions",
      allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.BLOOD_BANK],
    },
    {
      label: "Donations",
      icon: "Calendar",
      to: "/donations",
      allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION],
      items: [
        {
          label: "All Donations",
          icon: "List",
          to: "/donations",
          allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION],
        },
        {
          label: "Record Donation",
          icon: "Plus",
          to: "/donations/create",
          allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION],
        },
        {
          label: "Blood Inventory",
          icon: "BarChart3",
          to: "/donations/blood-inventory",
          allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION],
        },
        {
          label: "Expiry Management",
          icon: "Clock",
          to: "/donations/expiry-management",
          allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK],
        },
        {
          label: "Request Fulfillment",
          icon: "Target",
          to: "/donations/request-fulfillment",
          allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK],
        },
      ],
    },
    {
      label: "Reports",
      icon: "BarChart3",
      to: "/reports",
      allowedRoles: [UserRole.ADMIN, UserRole.BLOOD_BANK],
    },
    {
      label: "Settings",
      icon: "Settings",
      to: "/settings",
      allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
      items: [
        {
          label: "Account",
          icon: "User",
          to: "/settings/account",
          allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
        },
        {
          label: "Preferences",
          icon: "Sliders",
          to: "/settings/preferences",
          allowedRoles: [UserRole.ADMIN, UserRole.DONOR, UserRole.BLOOD_BANK, UserRole.MEDICAL_INSTITUTION, UserRole.HOSPITAL],
        },
      ],
    },
  ];  // Filter menu items based on user role
  const filterMenuItemsByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => !item.allowedRoles || item.allowedRoles.includes(userRole))
      .map(item => ({
        ...item,
        items: item.items ? filterMenuItemsByRole(item.items) : undefined
      }))
      .filter(item => !item.items || item.items.length > 0); // Remove parent items with no children
  };

  const filteredMenuItems = filterMenuItemsByRole(menuItems);

  // Add admin menu items for admin users
  if (userRole === UserRole.ADMIN) {
    filteredMenuItems.splice(-1, 0, {
      label: "Admin",
      icon: "Shield",
      to: "/admin",
      allowedRoles: [UserRole.ADMIN],
      items: [
        {
          label: "Applications",
          icon: "FileCheck",
          to: "/admin/applications",
          allowedRoles: [UserRole.ADMIN],
        },
      ],
    });
  }

  // Add notifications menu item for donors
  if (userRole === UserRole.DONOR) {
    filteredMenuItems.splice(1, 0, {
      label: "Notifications",
      icon: "Bell",
      to: "/notifications",
      badge: notificationCount > 0 ? notificationCount : undefined,
      allowedRoles: [UserRole.DONOR],
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
    }
  };

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
  };  // Sidebar content component (shared between mobile and desktop)
  const SidebarContent = ({ isCollapsed = false, onItemClick = () => {} }) => (
    <div className="flex flex-column h-full">
      <div className="overflow-y-auto flex-1 sidebar-scroll">
        <ul className={`list-none m-0 ${isCollapsed && !isMobile ? "p-2" : "p-4"}`}>
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
            </li>          )}

          {filteredMenuItems.map((item, index) => (
            <li key={index} className={isCollapsed && !isMobile ? "mb-2" : "mb-1"}>
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
                          onClick={onItemClick}
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
                  {" "}
                  <div
                    className={`p-ripple flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full justify-content-center p-3 text-xl text-700 hover:surface-100`}
                    title={item.label}
                    onClick={(e) => handleSubmenuClick(e, item)}
                    style={{ minHeight: "3rem" }} // Ensure consistent hover area
                  >
                    {renderIcon(item.icon, "", 24)}
                    <Ripple />
                  </div>{" "}
                  <OverlayPanel
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
                          }`}
                          onClick={() => {
                            const overlayRef = getOverlayRef(item.label);
                            overlayRef?.current?.hide();
                            setActiveSubmenu(null);
                            onItemClick();
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
                    isCollapsed && !isMobile ? "justify-content-center p-2 text-xl" : "p-3"
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
                      {item.label === "Notifications" && notificationCount > 0 && (
                        <span className="p-badge p-badge-danger ml-2">
                          {notificationCount}
                        </span>
                      )}
                    </>
                  )}
                  <Ripple />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* User Profile Section */}
      {!isCollapsed || isMobile ? (
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
      ) : (
        <div className="mt-auto">
          <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
          <div className="m-3 flex justify-content-center">
            <Avatar
              label={user?.email?.charAt(0).toUpperCase()}
              shape="circle"
              className="cursor-pointer"
              style={{ backgroundColor: "#3B82F6", color: "white" }}
              title={user?.email || "User"}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Use PrimeReact Sidebar
  if (isMobile) {
    return (
      <PrimeReactSidebar
        visible={visible}
        onHide={onHide}
        position="left"
        className="p-sidebar-sm"
        modal
        showCloseIcon
        style={{ width: '280px' }}
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
              <div className="text-xs text-500">BloodNet Portal</div>
            </div>
          </div>
        </div>
        <div className="mobile-sidebar-menu">
          <SidebarContent onItemClick={onHide} />
        </div>
      </PrimeReactSidebar>
    );
  }
  
  // Desktop: Use original design with collapse functionality
  return (
    <div
      ref={sidebarRef}
      className={`sidebar-desktop flex-shrink-0 select-none transition-all transition-duration-300 relative ${
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
              </li>            )}
            {filteredMenuItems.map((item, index) => (
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
                    {" "}
                    <div
                      className={`p-ripple flex align-items-center cursor-pointer border-round transition-duration-150 transition-colors w-full justify-content-center p-3 text-xl text-700 hover:surface-100`}
                      title={item.label}
                      onClick={(e) => handleSubmenuClick(e, item)}
                      style={{ minHeight: "3rem" }} // Ensure consistent hover area
                    >
                      {renderIcon(item.icon, "", 24)}
                      <Ripple />
                    </div>{" "}
                    <OverlayPanel
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
                            }`}
                            onClick={() => {
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
                    {item.label === "Notifications" && notificationCount > 0 && (
                      <span className="p-badge p-badge-danger ml-2">
                        {notificationCount}
                      </span>
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
