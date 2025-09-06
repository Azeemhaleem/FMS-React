import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";

function OfficerRoutes() {
  const username = "JohnDoe";
  const role = "Officer";
  

  return (

      <Routes>
              <Route path="/OfficerOverview" element={<PrivateRoute> <MainContent username={username} role={role} type="Overview" /> </PrivateRoute>} />
              <Route path="/OfficerSettings" element={<PrivateRoute> <MainContent role={role} type="Settings" /> </PrivateRoute>} />
              <Route path="/OfficerDashboard" element={<PrivateRoute> <MainContent role={role} type="Dashboard" /> </PrivateRoute>} />
              <Route path="/OfficerProfile" element={<PrivateRoute> <MainContent role={role} type="Profile" /> </PrivateRoute>} />
              <Route path="/PoliceNotifications" element={<MainContent role={role} type="Notifications" />} />
      </Routes>
  );
}

export default OfficerRoutes;

