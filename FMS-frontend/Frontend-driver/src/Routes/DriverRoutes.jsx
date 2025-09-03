import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";

function DriverRoutes() {
  
  const role = "Driver"; 
 

  return (
    
    
    <Routes>
      
      <Route path="/DriverOverview" element={<MainContent role={role} type="Dashboard" />} />
      <Route path="/DriverSettings" element={<MainContent role={role} type="Settings" />} />
      <Route path="/DriverReport" element={<MainContent role={role} type="Report" />} />
      <Route path="/DriverPayment" element={<MainContent role={role} type="Payment" />} />
      <Route path="/DriverMessages" element={<MainContent role={role} type="Messages" />} />
      <Route path="/DriverMyFines" element={<MainContent role={role} type="My Fines" />} />
      <Route path="/DriverProfile" element={<MainContent role={role} type="My Profile" />} />
      <Route path="/DriverAppeal" element={<MainContent role={role} type="Appeal" />} />
      <Route path="/Account" element={<MainContent role={role} type="Account" />} />
      <Route path="/Privacy" element={<MainContent role={role} type="Privacy" />} />
      <Route path="/About" element={<MainContent role={role} type="About" />} />

    </Routes>
  );
}

export default DriverRoutes;
