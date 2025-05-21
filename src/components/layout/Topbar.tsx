import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { useAuth } from "../../state/authContext";

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const menuRef = useRef<Menu>(null);
  const [notificationCount] = useState(3); // Example notification count
  const { user } = useAuth();

  const userMenuItems = [
    {
      label: "Profile",
      icon: "pi pi-user",
      command: () => {
        // Handle profile click
        console.log("Profile clicked");
      },
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => {
        // Handle settings click
        console.log("Settings clicked");
      },
    },
    { separator: true },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        // Handle logout
        console.log("Logout clicked");
      },
    },
  ];
  return (
    <div className="flex justify-content-between align-items-center px-4 py-2 shadow-2 relative surface-section border-bottom-1 surface-border">
      <div className="flex align-items-center">
        <Button
          icon="pi pi-bars"
          onClick={onMenuToggle}
          className="p-button-rounded p-button-text p-button-plain mr-3"
          aria-label="Menu"
        />
        <Link to="/" className="no-underline text-primary">
          <div className="flex align-items-center">
            <i
              className="pi pi-heart-fill mr-2"
              style={{ fontSize: "1.5rem" }}
            ></i>
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
        />

        <div
          className="cursor-pointer flex align-items-center"
          onClick={(e) => menuRef.current?.toggle(e)}
        >
          <Avatar
            image={
              user?.avatar ||
              "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
            }
            shape="circle"
            className="mr-2"
          />
          <span className="mr-2 font-medium">
            {user?.name || user?.email || "User"}
          </span>
          <i className="pi pi-angle-down"></i>
        </div>

        <Menu model={userMenuItems} popup ref={menuRef} />
      </div>
    </div>
  );
};

export default Topbar;
