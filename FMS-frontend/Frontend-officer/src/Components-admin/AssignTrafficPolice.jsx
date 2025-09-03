import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../Components-Superadmin/styles/driver-style.css"



function AssignTrafficPolice() {
  
  const [formData, setFormData] = useState({
    traffic_police_id: "",
    higher_police_id: "",
  });

  const [message, setMessage] = useState(null); // Success message
  const [error, setError] = useState(null);     // Error message
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await api.post(
        "admin/assign-traffic-police-to-higher-police",
        formData
        
      );

      // Status 200 or 201 → success
      setMessage(response.data.messege || "Assignment successful");
      setTimeout(() => {
        navigate("/AdminTrafficPolice");
      }, 1000);

    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.errors) {
          // Laravel validation errors
          const allErrors = Object.values(data.errors).flat().join(" | ");
          setError(allErrors);
        } else if (data.messege) {
          setError(data.messege);
        } else {
          setError("An unexpected error occurred.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
      

    }
  };

  return (
    <div
        className="search-section container mb-5 d-flex justify-content-center align-items-center "
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
      <h2
        className="text-center text-dark mb-5 mt-2"
        style={{ fontSize: "1.3rem",fontWeight:"bold" }}
      >
        Assign Traffic Police to Higher Officer
      </h2>

      {/* Success & Error messages */}
      {message && <p  className="response-message" style={{ color: "green" }}>{message}</p>}
      {error && <p  className="response-errors" style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
  <div className="mb-4">
    <label htmlFor="traffic_police_id" className="form-label fw-normal fs-6 fs-sm-6 fs-md-5">
      Traffic Police ID
    </label>
    <input
      type="text"
      name="traffic_police_id"
      value={formData.traffic_police_id}
      onChange={handleChange}
      className="w-100 border rounded px-3 py-2 fs-6"
      required
    />
  </div>

  <div className="mb-4">
    <label htmlFor="higher_police_id" className="form-label fw-normal fs-6 fs-sm-6 fs-md-5">
      Higher Police ID
    </label>
    <input
      type="text"
      name="higher_police_id"
      value={formData.higher_police_id}
      onChange={handleChange}
      className="w-100 border rounded px-3 py-2 fs-6"
      required
    />
  </div>

  <div className="d-flex justify-content-end mt-3">
    <button type="submit" className="btn btn-dark w-100 fs-6 mt-3 mb-3">
      Assign
    </button>
  </div>
</form>

    </div>
    </div>
  );
}

export default AssignTrafficPolice;
