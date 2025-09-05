import React from "react";
import Loginpage from "../pages/login";
import Homepage from "../pages/Home.jsx";
import RegisterPage from "../pages/Register.jsx";
import { Route, Routes, Navigate } from "react-router-dom";



function loginRoutes() {
  
    return (
      <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={< Homepage/>}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="/login" element={< Loginpage/>}/>

      </Routes>
    );
  }
  
  export default loginRoutes;
  