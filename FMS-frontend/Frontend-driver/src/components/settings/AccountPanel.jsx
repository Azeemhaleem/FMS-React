// src/Components-driver/settings/AccountPanel.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.jsx";

export default function AccountPanel({ basePath }) {
  const token = useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [driver, setDriver] = useState({ username: "", email: "" });
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await api.get("/driver/get-user-name-email", auth);
        setDriver({ username: u.data?.user_name ?? "", email: u.data?.email ?? "" });
      } catch {}
      try {
        const v = await api.get("/driver/check-email-verified", auth);
        setVerified(!!v.data?.is_email_verified);
      } catch {}
    })();
  }, [auth]);

  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
      <h4 className="card-title mb-3 fw-bold p-3">
        <Link to={`${basePath}`} className="me-2 text-decoration-none">←</Link>
        Account
      </h4>
      <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
        <div>
          <span className="info-label">Username:</span>
          <Link to={`${basePath}/security/username`} className="info-value d-flex w-100 text-decoration-none text-black opacity-75">
            <div className="d-flex justify-content-start">{driver.username || "No username"}</div>
            <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
          </Link>
        </div>
        <div>
          <span className="info-label">Password:</span>
          <Link to={`${basePath}/security/password`} className="info-value d-flex w-100 text-decoration-none text-black opacity-75">
            <div className="d-flex justify-content-start">********</div>
            <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
          </Link>
        </div>
        <div>
          <span className="info-label">Email:</span>
          <div className="info-value d-flex w-100 text-decoration-none text-black opacity-75">
            <div className="d-flex justify-content-start">{driver.email || "No email"}</div>
            <div className={`d-flex justify-content-center ${verified ? "text-success" : "text-danger"}`}>
              {verified ? "Verified ✅" : "Not Verified ❌"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
