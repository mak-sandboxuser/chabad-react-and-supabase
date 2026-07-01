import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import Dashboard from "./components/dashboard/DashboardPage";
import MembershipPage from "./components/membership/MembershipPage";
import HouseholdPage from "./components/household/HouseholdPage";
import MemberDetailsPage from "./components/household/MemberDetailsPage";
import FinancialPage from "./components/financial/FinancialPage";
import ContributionsPage from "./components/contributions/ContributionsPage";
import MakePaymentPage from "./components/payments/MakePaymentPage";
import BillingPortalPage from "./components/billing/BillingPortalPage";
import NotificationsPage from "./components/notifications/NotificationsPage";
import ProfilePage from "./components/profile/ProfilePage"
import SettingsPage from "./components/settings/SettingsPage"
import HelpSupportPage from "./components/help/HelpSupportPage"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/household" element={<HouseholdPage />} />
        <Route path="/household/member/:id" element={<MemberDetailsPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/contributions" element={<ContributionsPage />} />
        <Route path="/payments" element={<MakePaymentPage />} />
        <Route path="/recurring" element={<BillingPortalPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
