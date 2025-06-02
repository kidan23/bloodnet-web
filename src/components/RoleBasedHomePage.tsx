import React from "react";
import { useAuth } from "../state/authContext";
import { UserRole } from "../state/auth";
import HomePage from "../pages/HomePage";
import DonorHomePage from "../pages/DonorHomePage";

const RoleBasedHomePage: React.FC = () => {
  const { userRole } = useAuth();

  switch (userRole) {
    case UserRole.DONOR:
      return <DonorHomePage />;
    
    case UserRole.BLOOD_BANK:
    case UserRole.MEDICAL_INSTITUTION:
    case UserRole.HOSPITAL:
    case UserRole.ADMIN:
    default:
      return <HomePage />;
  }
};

export default RoleBasedHomePage;
