import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ApplyPage from "./pages/ApplyPage";
import AdminApplicationsPage from "./pages/AdminApplicationsPage";
import MainLayout from "./components/layout/MainLayout";
import ProfileCompletionChecker from "./components/ProfileCompletionChecker";
import ApprovalStatusChecker from "./components/ApprovalStatusChecker";
import RoleBasedAccess from "./components/RoleBasedAccess";
import { useAuth } from "./state/authContext";
import { UserRole } from "./state/auth";
import { DonorsRoutes } from "./pages/DonorsPage";
import { BloodRequestsRoutes } from "./pages/BloodRequestsPage";
import BloodBanksRoutes from "./pages/BloodBanksPage/BloodBanksRoutes";
import { DonationsRoutes } from "./pages/DonationsPage/index";
import { MedicalInstitutionsRoutes } from "./pages/MedicalInstitutionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import PreferencesPage from "./pages/PreferencesPage";

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout isLoggedIn={isLoggedIn} />}>
          {isLoggedIn ? (
            <>
              <Route
                index
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <HomePage />
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <HomePage />
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/donors/*"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <DonorsRoutes />
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/blood-requests/*"
                element={
                  <ApprovalStatusChecker>
                    <BloodRequestsRoutes />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/blood-banks/*"
                element={
                  <ApprovalStatusChecker>
                    <BloodBanksRoutes />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/donations/*"
                element={
                  <ApprovalStatusChecker>
                    <DonationsRoutes />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/medical-institutions/*"
                element={
                  <ApprovalStatusChecker>
                    <MedicalInstitutionsRoutes />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/reports"
                element={
                  <ApprovalStatusChecker>
                    <ReportsPage />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/settings"
                element={
                  <ApprovalStatusChecker>
                    <SettingsPage />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/settings/account"
                element={
                  <ApprovalStatusChecker>
                    <AccountSettingsPage />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/settings/preferences"
                element={
                  <ApprovalStatusChecker>
                    <PreferencesPage />
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ApprovalStatusChecker>
                    <RoleBasedAccess allowedRoles={[UserRole.ADMIN]}>
                      <AdminApplicationsPage />
                    </RoleBasedAccess>
                  </ApprovalStatusChecker>
                }
              />
            </>
          ) : (
            <Route index element={<LoginPage />} />
          )}
        </Route>

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <MainLayout isLoggedIn={false} />
            )
          }
        >
          <Route index element={<LoginPage />} />
        </Route>

        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <div className="min-h-screen flex align-items-center justify-content-center surface-ground p-4">
                <div className="w-4">
                  <SignupPage />
                </div>
              </div>
            )
          }
        />

        <Route
          path="/apply"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <div className="min-h-screen flex align-items-center justify-content-center surface-ground p-4">
                <div className="w-8">
                  <ApplyPage />
                </div>
              </div>
            )
          }
        />

        <Route
          path="/demo-toggle-login"
          element={
            <div className="p-5">
              <h3>Authentication Demo Controls</h3>
              <div className="p-3 border-round bg-primary text-white">
                This demo toggle is disabled. Please log in/out using the real
                authentication flow.
              </div>
              <div className="mt-3">
                <a href="/" className="text-primary">
                  Go to Home
                </a>
              </div>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
