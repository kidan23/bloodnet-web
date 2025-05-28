import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastProvider } from "./ToastContext";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface MainLayoutProps {
  isLoggedIn: boolean;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isLoggedIn }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  // If user is not logged in, only show login component
  // Commented out for now

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
      <div className="min-h-screen flex flex-column relative surface-ground">
        {/* Top Navigation */}
        <Topbar onMenuToggle={toggleSidebar} />
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />

          {/* Main Content Area */}
          <div className="flex-1 p-4">
            <div className="surface-section border-round p-4">
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

export default MainLayout;
