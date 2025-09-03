import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";

function AdminRoutes() {
    const role = "Admin";
    

  return (
    
    <Routes>

      <Route path="/AdminOverview" element={<MainContent role={role} type="Overview" />} />
      <Route path="/AdminSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/AdminReport" element={<MainContent role={role} type="Report" />} />
      <Route path="/AdminOfficers" element={<MainContent role={role} type="Officers" />} />
      <Route path="/AdminMessages" element={<MainContent role={role} type="Messages" />} />
      <Route path="/AdminDrivers" element={<MainContent role={role} type="Drivers" />} />
      <Route path="/AdminTrafficPolice" element={<MainContent role={role} type="trafficPolice" />} />
      <Route path="/AdminHigherPolice" element={<MainContent role={role} type="higherPolice" />} />
      <Route path="/AssignTrafficPolice" element={<MainContent role={role} type="assignOfficer" />} />
      <Route path="/AdminProfile" element={<MainContent role={role} type="Profile" />} />
    </Routes>
  );
}

export default AdminRoutes;
