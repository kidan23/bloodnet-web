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
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
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
    case UserRole.MEDICAL_INSTITUTION:
    case UserRole.ADMIN:
    default: // Admin layout (current default layout)
      return (
        <ToastProvider>
          <div className="h-screen flex flex-column surface-ground">
            {/* Top Navigation */}
            <Topbar onMenuToggle={toggleSidebar} isMobile={isMobile} />
            {/* Main container with sidebar and content */}{" "}            <div className="flex flex-1 overflow-hidden">
              {/* Desktop Sidebar - Only render when not mobile */}
              {!isMobile && (
                <Sidebar
                  collapsed={sidebarCollapsed}
                  onToggle={toggleSidebar}
                  isMobile={false}
                />
              )}

              {/* Mobile Sidebar - Only render when mobile */}
              {isMobile && (
                <Sidebar
                  collapsed={sidebarCollapsed}
                  onToggle={toggleSidebar}
                  visible={mobileMenuVisible}
                  onHide={hideMobileMenu}
                  isMobile={true}
                />
              )}

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
