import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleBasedHomePage from "./components/RoleBasedHomePage";
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
import MyDonationsPage from "./pages/MyDonationsPage";
import NearbyBloodBanksPage from "./pages/NearbyBloodBanksPage";
import DonationSchedulePage from "./pages/DonationSchedulePage";
import MyStatisticsPage from "./pages/MyStatisticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DonorSettingsPage from "./pages/DonorSettingsPage";

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
                      <RoleBasedHomePage />
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedHomePage />
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
              {/* Donor-specific routes */}
              <Route
                path="/my-donations"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <MyDonationsPage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/nearby-blood-banks"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <NearbyBloodBanksPage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/donation-schedule"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <DonationSchedulePage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/my-stats"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <MyStatisticsPage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <NotificationsPage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
                  </ApprovalStatusChecker>
                }
              />
              <Route
                path="/donor-settings"
                element={
                  <ApprovalStatusChecker>
                    <ProfileCompletionChecker>
                      <RoleBasedAccess allowedRoles={[UserRole.DONOR]}>
                        <DonorSettingsPage />
                      </RoleBasedAccess>
                    </ProfileCompletionChecker>
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
              <div className="w-full flex justify-content-center align-items-center my-5">
                <SignupPage />
              </div>
            )
          }
        />

        <Route
          path="/apply"
          element={isLoggedIn ? <Navigate to="/" replace /> : <ApplyPage />}
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
