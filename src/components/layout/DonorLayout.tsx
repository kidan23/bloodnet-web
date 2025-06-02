import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastProvider } from "./ToastContext";
import Topbar from "./Topbar";
import DonorSidebar from "./DonorSidebar";
import Footer from "./Footer";

interface DonorLayoutProps {
  isLoggedIn: boolean;
}

const DonorLayout: React.FC<DonorLayoutProps> = ({ isLoggedIn }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex align-items-center justify-content-center surface-ground">
        <ToastProvider>
          <Outlet />
        </ToastProvider>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="h-screen flex flex-column surface-ground">        {/* Top Navigation for Donors */}
        <Topbar onMenuToggle={toggleSidebar} />
        
        {/* Main container with sidebar and content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Donor-specific Sidebar */}
          <DonorSidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="surface-section border-round">
              <Outlet />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default DonorLayout;
