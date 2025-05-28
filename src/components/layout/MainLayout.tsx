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
      <div className="h-screen flex flex-column surface-ground">
        {/* Top Navigation */}
        <Topbar onMenuToggle={toggleSidebar} />
        
        {/* Main container with sidebar and content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />

          {/* Main Content Area - Only this part scrolls */}
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

export default MainLayout;
