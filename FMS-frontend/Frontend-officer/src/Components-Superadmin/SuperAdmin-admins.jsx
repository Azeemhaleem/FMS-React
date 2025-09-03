import "./styles/driver-style.css";
import React, { useState, useMemo } from "react";
import api from "../api/axios";

function SuperAdminAdmins() {

  const [formData, setFormData] = useState({
    police_id: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    
    

    if (formData.password !== formData.password_confirmation) {
      setError("Password confirmation does not match.");
      return;
    }
    const password = formData.password;
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number and symbol.");
      return;
    }

    console.log("Form Data Submitted:", formData);
    try {
      const response =await api.post("super-admin/register-admin", formData);
      setMessage(response.data.messege);

      setFormData({
        police_id: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: ""
      });

    }  catch (err) {
      if (err.response && err.response.data) {
        console.error("Error Response:", err.response.data);
  
        
        if (err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join("\n");
          setError(errorMessages);
        } else {
         
          setError(err.response.data.messege || "An error occurred");
        }
      } else {
        setError("Something went wrong");
      }
    }
  };



  return (
    <div className="row">
       <div
          className="search-section d-flex container mb-5 justify-content-center align-items-center "
          style={{
            backgroundColor: "#d3e2fd",
            padding: "1rem",
            marginLeft: window.innerWidth < 576 ? "2rem" : "3rem"
  
          }}
      >
         <div
            className="card shadow p-4 px-3 px-sm-5 mt-3 mb-3"
            style={{
              backgroundColor: "#f7f9fc",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "1rem"
            }}
          >
      <h2 className="text-xl font-semibold mb-4 text-center">Admin Registration</h2>
      {message && <p className="response-message" style={{ color: "green"}}>{message}</p>}
      {error && <p className="response-errors " style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="police_id"
          placeholder="Police ID"
          value={formData.police_id}
          onChange={handleChange}
          required
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
          className="w-full p-2 mb-2 border rounded"
        />
            <div className="d-flex justify-content-end mt-3 mb-3">
            <button type="submit" className="btn btn-dark w-100 w-md-auto">
              Register
            </button>
            </div>
      </form>
    </div>

      </div>
    </div>
  );
}

export default SuperAdminAdmins;
