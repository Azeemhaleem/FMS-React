import React from "react";
import PoliceLoginPage from "../pages/login-police.jsx";
import { Route, Routes } from "react-router-dom";



function loginRoutes() {

  
  
    return (
      
      <Routes>
          <Route path="/" element={< PoliceLoginPage/>}/>
          <Route path="/loginPolice" element={< PoliceLoginPage/>}/>
      </Routes>
    );
  }
  
  export default loginRoutes;
  