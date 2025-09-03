import React, { useEffect, useState } from 'react';
import api from "../api/axios";
import "./styles/driver-style.css";

function AccountCreationLogs() {

 
  
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [createdById, setCreatedById] = useState("");
  const [createdForId, setCreatedForId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    let endpoint = "";

    if (activeTab === "all") {
      endpoint = "/get-logs/account-creation/all";
    } else if (activeTab === "created-by" && createdById) {
      endpoint = `/get-logs/account-creation/created-by/${createdById}`;
    } else if (activeTab === "created-for" && createdForId) {
      endpoint = `/get-logs/account-creation/created-for/${createdForId}`;
    }

    if (!endpoint) return;

    try {
      const response = await api.get(endpoint);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchLogs();
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLogs([]);
    setCreatedById("");
    setCreatedForId("");
  };

  const handleSearch = () => {
    fetchLogs();
  };

  return (
    <div
    className="search-section container mb-5 justify-content-center align-items-center "
    style={{
      backgroundColor: "#d3e2fd",
      padding: "1rem",
      marginLeft: window.innerWidth < 576 ? "3rem" : "2rem"

    }}
>
      
      {/* Tabs */}
      <div className="d-md-flex justify-content-center mb-4 gap-md-3 mt-3" style={{padding: "3%"}}>
        <button
          className={`btn w-100 w-md-auto mb-2 ${activeTab === "all" ? "text-white" : ""}`}
          style={{
            backgroundColor: activeTab === "all" ? "#3366cc" : "#cfd8e6",
            padding: "10px",
            borderRadius: "7px",
            fontSize: "small"  
          }}
          onClick={() => handleTabChange("all")}
        >
          All Logs
        </button>
        <button
          className={`btn w-100 w-md-auto mb-2 ${activeTab === "created-by" ? "text-white" : ""}`}
          style={{
            backgroundColor: activeTab === "created-by" ? "#3366cc" : "#cfd8e6",
            padding: "10px",
            borderRadius: "7px",
            fontSize: "small"           
          }}
          onClick={() => handleTabChange("created-by")}
        >
          Created By
        </button>
        <button
          className={`btn w-100 w-md-auto mb-2 ${activeTab === "created-for" ? "text-white" : ""}`}
          style={{
            backgroundColor: activeTab === "created-for" ? "#3366cc" : "#cfd8e6",
            padding: "10px",
            borderRadius: "7px",
            fontSize: "small"  
          }}
          onClick={() => handleTabChange("created-for")}
        >
          Created For
        </button>
      </div>

      {/* Filters */}
      {(activeTab === "created-by" || activeTab === "created-for") && (
        <div className="row justify-content-center mb-4">
          <div className="d-flex justify-content-center w-100">
          <input
            type="text"
            style={{ fontSize: "small" }}
            className="form-control"
            placeholder={`Enter Police ID for ${activeTab === "created-by" ? "Created By" : "Created For"}`}
            value={activeTab === "created-by" ? createdById : createdForId}
            onChange={(e) => {
              activeTab === "created-by" ? setCreatedById(e.target.value) : setCreatedForId(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

            <button
              className="btn d-none d-md-block "
              onClick={handleSearch}
              style={{ backgroundColor: "#4a90e2", color: "#fff", marginLeft: "10px", width: "7%", fontSize:"small" }}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Logs Display */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8" style={{marginTop:"3%",fontSize:"small"}}>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-center">No logs found.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="shadow-sm rounded-2 p-3 mb-3" style={{ backgroundColor: "#2c3e50" }}>
                <p style={{ color: "#ecf0f1" }}><strong>Created By:</strong> Police Officer {log.created_by?.police_id}</p>
                <p style={{ color: "#ecf0f1" }}><strong>Created For:</strong> Police Officer {log.created_for?.police_id}</p>
                <p style={{ color: "#ecf0f1" }}><strong>Date:</strong> {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountCreationLogs;
