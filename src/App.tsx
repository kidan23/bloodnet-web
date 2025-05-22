// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/layout/MainLayout";
import { useAuth } from "./state/authContext";
import { DonorsListPage as DonorsPage, DonorDetailsPage } from "./pages/DonorsPage";
import RequestsPage from "./pages/RequestsPage";
import BloodBanksRoutes from "./pages/BloodBanksPage/BloodBanksRoutes";
import DonationsPage from "./pages/DonationsPage";
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
              <Route index element={<HomePage />} />
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/donors" element={<DonorsPage />} />
              <Route path="/donors/:id" element={<DonorDetailsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/blood-banks/*" element={<BloodBanksRoutes />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/settings/account"
                element={<AccountSettingsPage />}
              />
              <Route
                path="/settings/preferences"
                element={<PreferencesPage />}
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
              <MainLayout isLoggedIn={false}>
                <LoginPage />
              </MainLayout>
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
