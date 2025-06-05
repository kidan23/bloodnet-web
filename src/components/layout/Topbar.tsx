import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { useAuth } from "../../state/authContext";
import { notificationsService } from "../../services/notificationsService";
import logoPath from "../../assets/logo.png"; // Adjust the path as necessary

interface TopbarProps {
  onMenuToggle: () => void;
  isMobile?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, isMobile: propIsMobile }) => {
  const menuRef = useRef<Menu>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState<boolean>(propIsMobile || false);
  
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

  const userMenuItems = [
    {
      label: "Account Settings",
      icon: "pi pi-user",
      command: () => {
        navigate("/settings/account");
      },
    },
    {
      label: "Preferences",
      icon: "pi pi-cog",
      command: () => {
        navigate("/settings/preferences");
      },
    },
    { separator: true },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        logout();
      },
    },
  ];

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
  return (
    <div className="flex justify-content-between align-items-center px-4 py-2 shadow-2 relative surface-section border-bottom-1 surface-border">      <div className="flex align-items-center ml-4">
        {/* Mobile menu toggle button */}
        {isMobile && (
          <Button
            icon="pi pi-bars"
            className="p-button-rounded p-button-text mr-2"
            onClick={onMenuToggle}
            aria-label="Menu"
            style={{ 
              fontSize: '1.25rem', 
              color: '#3B82F6'
            }}
          />
        )}
        <Link to="/" className="no-underline text-primary">
          <div className="flex align-items-center">
            <img
              src={logoPath}
              alt="BloodNet Logo"
              className="mr-2"
              style={{ width: "32px", height: "32px" }}
            />
            <h2 className="m-0 font-medium">BloodNet</h2>
          </div>
        </Link>
      </div>
      <div className="flex align-items-center">
        <Button
          icon="pi pi-bell"
          badge={notificationCount.toString()}
          badgeClassName="p-badge-danger"
          className="p-button-rounded p-button-text p-button-plain mr-3"
          aria-label="Notifications"
        />{" "}
        <div
          className="cursor-pointer flex align-items-center"
          onClick={(e) => menuRef.current?.toggle(e)}
        >
          <Avatar
            label={user?.email?.charAt(0).toUpperCase()}
            shape="circle"
            className="mr-2"
            style={{ backgroundColor: "#3B82F6", color: "white" }}
          />
          <span className="mr-2 font-medium">{user?.email || "User"}</span>
          <i className="pi pi-angle-down"></i>
        </div>
        <Menu model={userMenuItems} popup ref={menuRef} />
      </div>
    </div>
  );
};

export default Topbar;
