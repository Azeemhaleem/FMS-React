import "./styles/driver-style.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios"; // make sure you import your axios instance

function SuperAdminOfficers() {
  
  const [query, setQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a Police ID.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await api.post("get-police/by-police-id", {
        police_id: query,
      });
      setSelectedOfficer(response.data);
    } catch (err) {
      setError("Police not found or invalid ID.");
      setSelectedOfficer(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="search-section container mb-5 justify-content-center align-items-center"
      style={{
        backgroundColor: "#d3e2fd",
        padding: "1rem",
        marginLeft: window.innerWidth < 576 ? "2rem" : "2rem",
        width:"100%"
      }}
    >
      <div className="text-center my-4 mb-2">
        <h2 className="fw-bold" style={{ color: "#003366" }}>Police Details</h2>
        <p className="text-muted driver-subtext">
          Search for a police user's details by entering their police ID below.
        </p>
      </div>

      <div className="d-flex justify-content-center mb-3" style={{ width: "100%" }}>
        <div className="d-flex justify-content-center mb-3" style={{ marginTop: "2%", width: "85%" }}>
          <input
            type="text"
            className="form-control"
            value={query}
            placeholder="Police ID"
            style={{ fontSize: "small", width: "100%" }}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn btn-info d-none d-md-block"
            onClick={handleSearch}
            disabled={loading}
            style={{ width: "5%", color: "white", marginLeft: "3px" }}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {loading && <div className="text-center">Searching...</div>}
      {error && <div className="text-danger text-center mb-3">{error}</div>}

      {selectedOfficer && (
  <div className="d-flex justify-content-center mt-4 mb-4">
    <div
      className="card"
      style={{
        backgroundColor: "#f7f9fc",
        padding: "20px",
        fontSize: "small",
        width: "100%",
        maxWidth: "700px",
      }}
    >
      <div>
        <span className="info-label">Name:</span>
        <div className="info-value">
          {selectedOfficer.police_user?.username || "N/A"}
        </div>
      </div>
      <div>
        <span className="info-label">Email:</span>
        <div className="info-value">
          {selectedOfficer.police_user?.email || "N/A"}
        </div>
      </div>
      <div>
        <span className="info-label">Role:</span>
        <div className="info-value">
          {selectedOfficer.role || "N/A"}
        </div>
      </div>
      <div>
        <span className="info-label">Police ID:</span>
        <div className="info-value">
          {selectedOfficer.police_in_dept?.police_id}
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default SuperAdminOfficers;
