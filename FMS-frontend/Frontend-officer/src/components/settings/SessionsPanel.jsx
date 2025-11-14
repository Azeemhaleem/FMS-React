import React, { useMemo } from "react";
import api from "../../api/axios.jsx";

function useToken() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
}

export default function SessionsPanel({ onBack }) {
  const token = useToken();

  const logout = async () => {
    try {
      await api.post("/police/logout", null, { headers: { Authorization: `Bearer ${token}` } });
      alert("Logged out.");
      window.location.href = "/loginPolice";
    } catch {
      alert("Failed to logout.");
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/police/logout-all", null, { headers: { Authorization: `Bearer ${token}` } });
      alert("Logged out from all devices.");
      window.location.href = "/loginPolice";
    } catch {
      alert("Failed to logout from all devices.");
    }
  };

  return (
    <section>
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h4 className="card-title mb-3 fw-bold p-3">Sessions</h4>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <div className="warning-box mb-3">
            <p>End your current session or all sessions.</p>
          </div>
          <div className="d-flex gap-2 mt-4 mb-3">
            <button className="btn btn-dark btn-small" onClick={logout}>Log Out</button>
            <button className="btn btn-outline-dark btn-small" onClick={logoutAll}>Log Out All Devices</button>
          </div>
        </div>
      </div>

      <button className="ms-auto w-25 mt-3 btn btn-outline-secondary btn-sm" onClick={onBack}>Back</button>
    </section>
  );
}
