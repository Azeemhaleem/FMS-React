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
       </Routes>
    );
}

export default HigherOfficerRoutes
