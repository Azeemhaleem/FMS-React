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
      <Route path="/SuperAdminMessages" element={<MainContent role={role} type="Messages" />} />
      <Route path="/SuperAdminFines" element={<MainContent role={role} type="Fines" />} />
      <Route path="/SuperAdminDrivers" element={<MainContent role={role}  type="Drivers" />} />
      <Route path="/SuperAdminAdmins" element={<MainContent role={role} type="Admins" />} />
      <Route path="/SuperAdminAnalytics" element={<MainContent role={role} type="Analytics" />} />
      <Route path="/SuperAdminAddNew" element={<MainContent role={role} type="AddNew" />} />
      <Route path="/AccountCreationLogs" element={<MainContent role={role} type="AccountCreationLogs" />} />
      <Route path="/ChargedFinesSadmin" element={<MainContent role={role} type="ChargedFinesSadmin" />} />
      <Route path="/SuperAdminProfile" element={<MainContent role={role} type="Profile" />} />
      
    </Routes>
  );
}

export default SuperAdminRoutes;
