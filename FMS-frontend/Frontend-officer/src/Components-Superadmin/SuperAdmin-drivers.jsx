import "./styles/driver-style.css";
import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from '../api/axios';

function SuperAdminDrivers() {

  const [query, setQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSelectedDriver(null);

    try {
      const response = await api.post('get-driver/by-license-number', {
        license_number: query,
      });

      setSelectedDriver(response.data.driver_in_dept);
    } catch (err) {
      setError(
        err.response?.data?.message || "Driver not found or something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
          className="search-section container mb-5 justify-content-center align-items-center "
          style={{
            backgroundColor: "#d3e2fd",
            padding: "1rem",
            marginLeft: window.innerWidth < 576 ? "2rem" : "2rem"
  
          }}
      >
         <div className="text-center my-4 mb-2">
    <h2 className="fw-bold" style={{ color: '#003366' }}>Driver Details</h2>
    <p className="text-muted driver-subtext">
      Search for a driver's details by entering their license number below.
    </p>

  </div>
     
      <div
        className="d-flex justify-content-center mb-3"
        style={{ width: "100%" }}
      >
        <div className="d-flex justify-content-center mb-3" style={{ marginTop:"2%",width:"85%"}}>
          <input
            type="text"
            className="form-control"
            value={query}
            placeholder="License number"
            style={{ fontSize: "small", width: "100%"  }}
            onChange={(e) =>{
              setQuery(e.target.value);
              setError("");  
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

          />
          <button 
          className="btn btn-info d-none d-md-block"  
          style={{ width: "5%", color: "white",marginLeft:"3px" }}
          onClick={handleSearch}
          disabled={loading}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      {loading && <div className="text-center">Searching...</div>}
      {error && <div className="text-danger text-center mb-3">{error}</div>}
      
      {selectedDriver && (
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
            <span className="info-label">License Number:</span>
            <div className="info-value"> {selectedDriver.license_no ||"N/A"}</div>
          </div>
          <div>
            <span className="info-label">Driver Name:</span>
            <div className="info-value"> {selectedDriver.name ||"N/A"}</div>
          </div>
          <div>
            <span className="info-label">Email:</span>
            <div className="info-value">{selectedDriver.email ||"N/A"}</div>
          </div>
          <div>
            <span className="info-label">Contact Number:</span>
            <div className="info-value">{selectedDriver.contact_number ||"N/A"}</div>
          </div>
        </div>
        </div>
      )}
    </div>
    
  );
}

export default SuperAdminDrivers;
