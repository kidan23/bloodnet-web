import React, { useState, useEffect } from "react";
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
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuVisible(!mobileMenuVisible);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };
  const hideMobileMenu = () => {
    setMobileMenuVisible(false);
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
    <div className="h-screen flex flex-column surface-ground">
        {/* Top Navigation for Donors */}
        <Topbar onMenuToggle={toggleSidebar} isMobile={isMobile} />
          {/* Main container with sidebar and content */}        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar - Only render when not mobile */}
          {!isMobile && (
            <DonorSidebar
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              isMobile={false}
            />
          )}
          
          {/* Mobile Sidebar - Only render when mobile */}
          {isMobile && (
            <DonorSidebar
              collapsed={false}
              visible={mobileMenuVisible}
              onHide={hideMobileMenu}
              isMobile={true}
            />
          )}

          {/* Main Content Area - adjust margin for mobile */}
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
