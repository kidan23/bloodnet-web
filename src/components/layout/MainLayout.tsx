import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastProvider } from "./ToastContext";
import { useAuth } from "../../state/authContext";
import { UserRole } from "../../state/auth";

// Admin Layout Components
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Donor Layout Components
import DonorLayout from "./DonorLayout";

interface MainLayoutProps {
  isLoggedIn: boolean;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isLoggedIn }) => {
  const { userRole } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // If user is not logged in, only show login component
  if (!isLoggedIn) {
    return (
      <div className="h-screen flex align-items-center justify-content-center surface-ground">
        <ToastProvider>
          <Outlet />
        </ToastProvider>
      </div>
    );
  }

  // Switch layout based on user role
  switch (userRole) {
    case UserRole.DONOR:
      return <DonorLayout isLoggedIn={isLoggedIn} />;
    
    case UserRole.BLOOD_BANK:
      // TODO: Implement BloodBankLayout
      return <DonorLayout isLoggedIn={isLoggedIn} />; // Temporary fallback
    
    case UserRole.MEDICAL_INSTITUTION:
      // TODO: Implement MedicalInstitutionLayout  
      return <DonorLayout isLoggedIn={isLoggedIn} />; // Temporary fallback
    
    case UserRole.ADMIN:
    default:
      // Admin layout (current default layout)
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
  }
};

export default MainLayout;
