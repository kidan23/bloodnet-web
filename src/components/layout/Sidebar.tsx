import React, { useRef } from "react";
import type { RefObject } from "react";
import { Link, useLocation } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { StyleClass } from "primereact/styleclass";

interface MenuItem {
  label: string;
  icon: string;
  to: string;
  badge?: string;
  items?: MenuItem[];
}

interface SidebarProps {
  visible?: boolean;
  onHide?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  visible = true,
  onHide = () => {},
}) => {
  const location = useLocation();
  // Only one ref needed for the main menu collapse
  const btnRef1 = useRef(null);

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      to: "/",
    },
    {
      label: "Blood Requests",
      icon: "pi pi-heart",
      to: "/requests",
      badge: "5",
    },
    {
      label: "Donors",
      icon: "pi pi-users",
      to: "/donors",
    },
    {
      label: "Blood Banks",
      icon: "pi pi-building",
      to: "/blood-banks",
    },
    {
      label: "Donations",
      icon: "pi pi-calendar",
      to: "/donations",
    },
    {
      label: "Reports",
      icon: "pi pi-chart-bar",
      to: "/reports",
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      to: "/settings",
      items: [
        {
          label: "Account",
          icon: "pi pi-user",
          to: "/settings/account",
        },
        {
          label: "Preferences",
          icon: "pi pi-sliders-h",
          to: "/settings/preferences",
        },
      ],
    },
  ];

  return (
    <PrimeSidebar
      visible={visible}
      onHide={onHide}
      showCloseIcon={false}
      blockScroll={true}
      style={{ width: 280 }}
      content={({ closeIconRef, hide }) => (
        <div className="min-h-screen flex relative lg:static surface-ground">
          <div
            id="app-sidebar-2"
            className="surface-section h-screen block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 surface-border select-none"
            style={{ width: "280px" }}
          >
            <div className="flex flex-column h-full">
              <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                <span className="inline-flex align-items-center gap-2">
                  <i className="pi pi-heart text-primary text-2xl"></i>
                  <span className="font-semibold text-2xl text-primary">
                    Blood Donation
                  </span>
                </span>
                <span>
                  <Button
                    type="button"
                    ref={closeIconRef as RefObject<Button>}
                    onClick={hide}
                    icon="pi pi-times"
                    rounded
                    outlined
                    className="h-2rem w-2rem lg:hidden"
                  />
                </span>
              </div>
              <div className="overflow-y-auto">
                <ul className="list-none p-3 m-0">
                  <li>
                    <StyleClass
                      nodeRef={btnRef1}
                      selector="@next"
                      enterFromClassName="hidden"
                      enterActiveClassName="slidedown"
                      leaveToClassName="hidden"
                      leaveActiveClassName="slideup"
                    >
                      <div
                        ref={btnRef1}
                        className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer"
                      >
                        <span className="font-medium">MAIN MENU</span>
                        <i className="pi pi-chevron-down"></i>
                        <Ripple />
                      </div>
                    </StyleClass>
                    <ul className="list-none p-0 m-0 overflow-hidden">
                      {menuItems.map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.items ? (
                            <>
                              <div className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                                <i className={`${item.icon} mr-2`}></i>
                                <span className="font-medium">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className="inline-flex align-items-center justify-content-center ml-auto bg-primary text-0 border-circle"
                                    style={{
                                      minWidth: "1.5rem",
                                      height: "1.5rem",
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <i className="pi pi-chevron-down ml-auto mr-1"></i>
                                <Ripple />
                              </div>
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
                                      <i className={`${child.icon} mr-2`}></i>
                                      <span className="font-medium">
                                        {child.label}
                                      </span>
                                      <Ripple />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Link
                              to={item.to}
                              className={`p-ripple no-underline flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors w-full ${
                                location.pathname === item.to
                                  ? "bg-primary text-white"
                                  : "text-700 hover:surface-100"
                              }`}
                            >
                              <i className={`${item.icon} mr-2`}></i>
                              <span className="font-medium">{item.label}</span>
                              {item.badge && (
                                <span
                                  className="inline-flex align-items-center justify-content-center ml-auto bg-primary text-white border-circle"
                                  style={{
                                    minWidth: "1.5rem",
                                    height: "1.5rem",
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <Ripple />
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
                <a className="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
                  <Avatar
                    image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                    shape="circle"
                  />
                  <span className="font-bold">Admin User</span>
                  <Ripple />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default Sidebar;
