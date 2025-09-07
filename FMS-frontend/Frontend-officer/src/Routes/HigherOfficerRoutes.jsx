import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";


function HigherOfficerRoutes() {
    const role = "HigherOfficer"; 
    return (
      
      <Routes>        
        <Route path="/ManageAppeal" element={<MainContent role={role} type="ManageAppeal" />} />
        <Route path="/ManageChargedFines" element={<MainContent role={role} type="ChargedFines" />} />
        <Route path="/ManageTrafficPolice" element={<MainContent role={role} type="ManageTrafficPolice" />} />
        <Route path="/HigherOfficerProfile" element={<MainContent role={role}  type="Profile" />} />
        <Route path="/HigherOfficerPoliceNotifications" element={<MainContent role={role} type="Notifications" />} />
        <Route path="/HigherOfficerSettings" element={<MainContent role={role} type="Settings" />} />

        {/* Settings index + sub-pages */}
      <Route path="/HigherOfficerSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/account" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/notifications" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/help" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/security/username" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/security/password" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/sessions" element={<MainContent role={role} type="Settings" />} />
      <Route path="/HigherOfficerSettings/danger" element={<MainContent role={role} type="Settings" />} />

       </Routes>
    );
}

export default HigherOfficerRoutes
