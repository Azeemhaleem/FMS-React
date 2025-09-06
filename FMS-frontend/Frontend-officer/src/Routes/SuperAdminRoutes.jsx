import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";

function SuperAdminRoutes() {
  const username = "JohnDoe";
  const role = "SuperAdmin"; 
  

  return (
    
    <Routes>
    
      <Route path="/SuperAdminOverview" element={<MainContent username={username} role={role} type="Dashboard" />} />
      <Route path="/SuperAdminSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminReport" element={<MainContent role={role} type="Report" />} />
      <Route path="/SuperAdminOfficers" element={<MainContent role={role} type="Officers" />} />
      <Route path="/SuperAdminPoliceNotifications" element={<MainContent role={role} type="Notifications" />} />
      <Route path="/SuperAdminFines" element={<MainContent role={role} type="Fines" />} />
      <Route path="/SuperAdminDrivers" element={<MainContent role={role}  type="Drivers" />} />
      <Route path="/SuperAdminAdmins" element={<MainContent role={role} type="Admins" />} />
      <Route path="/SuperAdminAnalytics" element={<MainContent role={role} type="Analytics" />} />
      <Route path="/SuperAdminAddNew" element={<MainContent role={role} type="AddNew" />} />
      <Route path="/AccountCreationLogs" element={<MainContent role={role} type="AccountCreationLogs" />} />
      <Route path="/ChargedFinesSadmin" element={<MainContent role={role} type="ChargedFinesSadmin" />} />
      <Route path="/SuperAdminProfile" element={<MainContent role={role} type="Profile" />} />

      {/* Settings index + sub-pages */}
      <Route path="/SuperAdminSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/account" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/notifications" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/help" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/security/username" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/security/password" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/sessions" element={<MainContent role={role} type="Settings" />} />
      <Route path="/SuperAdminSettings/danger" element={<MainContent role={role} type="Settings" />} />

      
    </Routes>
  );
}

export default SuperAdminRoutes;
