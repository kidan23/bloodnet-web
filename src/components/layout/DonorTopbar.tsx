import React, { useState, useEffect } from "react";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Menu, Bell, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "../../state/authContext";

interface DonorTopbarProps {
  onMenuToggle: () => void;
  isMobile?: boolean;
}

const DonorTopbar: React.FC<DonorTopbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
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

  const startContent = (
    <div className="flex align-items-center gap-2">
      <Button
        icon={<Menu size={20} />}
        className="p-button-text p-button-plain"
        onClick={onMenuToggle}
        tooltip="Toggle Menu"
        tooltipOptions={{ position: "bottom" }}
      />
      <div className="flex align-items-center gap-2">
        <img
          src="/src/assets/logo.png"
          alt="BloodNet"
          className="h-2rem"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="text-xl font-bold text-primary">BloodNet</span>
        <span className="text-sm text-500 ml-2">Donor Portal</span>
      </div>
    </div>
  );

  const endContent = (
    <div className="flex align-items-center gap-2">
      {/* Notifications */}
      <Button
        icon={
          <div className="relative">
            <Bell size={18} />
            <Badge
              value="5"
              severity="danger"
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                minWidth: "18px",
                height: "18px",
                fontSize: "10px",
              }}
            />
          </div>
        }
        className="p-button-text p-button-plain"
        tooltip="Notifications"
        tooltipOptions={{ position: "bottom" }}
      />

      {/* Quick Settings */}
      <Button
        icon={<Settings size={18} />}
        className="p-button-text p-button-plain"
        tooltip="Settings"
        tooltipOptions={{ position: "bottom" }}
      />

      {/* User Profile */}
      <div className="flex align-items-center gap-2 ml-2">
        <Avatar
          label={user?.email?.charAt(0).toUpperCase()}
          shape="circle"
          size="normal"
          style={{ backgroundColor: "#10B981", color: "white" }}
        />
        <div className="hidden md:block">
          <div className="text-sm font-medium">
            {user?.email && user.email.length > 20
              ? user.email.slice(0, 20) + "..."
              : user?.email || "Donor"}
          </div>
          <div className="text-xs text-500">Active Donor</div>
        </div>
      </div>

      {/* Logout */}
      <Button
        icon={<LogOut size={18} />}
        className="p-button-text p-button-plain ml-2"
        onClick={logout}
        tooltip="Logout"
        tooltipOptions={{ position: "bottom" }}
      />
    </div>
  );

  return (
    <Toolbar
      start={startContent}
      end={endContent}
      className="border-none shadow-2 px-4"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
    />
  );
};

export default DonorTopbar;
