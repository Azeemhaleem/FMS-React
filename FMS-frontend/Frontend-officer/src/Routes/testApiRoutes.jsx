import React from "react";
import TestApi from "../pages/testAPpi";
import { Route, Routes } from "react-router-dom";



function loginRoutes() {

  
  
    return (
      
      <Routes>
        <Route path="/testApi" element={<TestApi/>}/>
      </Routes>
    );
  }
  
  export default loginRoutes;
  