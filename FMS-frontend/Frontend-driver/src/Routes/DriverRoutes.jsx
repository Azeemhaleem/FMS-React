import React from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";

import PrivateRoute from "./PrivateRoute";
import StripePay from "../Components-Stripe/StripePay.jsx";
import StripeComplete from "../Components-Stripe/StripeComplete.jsx";

function DriverRoutes() {
  const role = "Driver";

  return (
    <Routes>
      <Route path="/DriverOverview" element={<MainContent role={role} type="Dashboard" />} />
      <Route path="/DriverMessages" element={<MainContent role={role} type="Messages" />} />
      <Route path="/DriverPayment" element={<MainContent role={role} type="Payment" />} />
      <Route path="/DriverMyFines" element={<MainContent role={role} type="My Fines" />} />
      <Route path="/DriverProfile" element={<MainContent role={role} type="My Profile" />} />
      <Route path="/DriverAppeal" element={<MainContent role={role} type="Appeal" />} />

      {/* Settings index + sub-pages */}
      <Route path="/DriverSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/account" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/security/username" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/security/password" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/notifications" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/help" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverSettings/danger" element={<MainContent role={role} type="Settings" />} />

      {/* You already use standalone pages for these */}
      <Route path="/Privacy" element={<MainContent role={role} type="Privacy" />} />
      <Route path="/About" element={<MainContent role={role} type="About" />} />
      <Route path="/pay-fines" element={<StripePay />} />
      <Route path="/payment/complete" element={<StripeComplete />} />
    </Routes>
  );
}

export default DriverRoutes;
