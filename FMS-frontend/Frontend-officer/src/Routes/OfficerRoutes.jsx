import React, {useEffect, useState} from "react";
import { Route, Routes } from "react-router-dom";
import MainContent from "../pages/MainContent";
import PrivateRoute from "./PrivateRoute";

function OfficerRoutes() {
  const username = "JohnDoe";
  const role = "Officer";
  

  return (

      <Routes>
              {/* <Route path="/OfficerOverview" element={<PrivateRoute> <MainContent username={username} role={role} type="Overview" /> </PrivateRoute>} />
              <Route path="/OfficerSettings" element={<PrivateRoute> <MainContent role={role} type="Settings" /> </PrivateRoute>} />
              <Route path="/OfficerDashboard" element={<PrivateRoute> <MainContent role={role} type="Dashboard" /> </PrivateRoute>} />
              <Route path="/OfficerProfile" element={<PrivateRoute> <MainContent role={role} type="Profile" /> </PrivateRoute>} />
              <Route path="/OfficerNotifications" element={<PrivateRoute> <MainContent role={role} type="Notifications" /> </PrivateRoute>} /> */}

              <Route path="/OfficerOverview" element={ <MainContent username={username} role={role} type="Overview" />} />
              <Route path="/OfficerDashboard" element={ <MainContent role={role} type="Dashboard" /> } />
              <Route path="/OfficerProfile" element={ <MainContent role={role} type="Profile" /> } />
              <Route path="/OfficerNotifications" element={ <MainContent role={role} type="Notifications" />} />

              <Route path="/OfficerSettings" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/account" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/notifications" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/help" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/security/username" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/security/password" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/sessions" element={<MainContent role={role} type="Settings" />} />
              <Route path="/OfficerSettings/danger" element={<MainContent role={role} type="Settings" />} />

      </Routes>
  );
}

export default OfficerRoutes;

