// src/Components-driver/settings/NotificationPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.jsx";

export default function NotificationPanel({ basePath }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/driver/notifications/setting", auth);
        setEnabled(!!r.data?.receives_email);
        setHint("");
      } catch (e) {
        setHint(e?.response?.status === 403 ? "Verify your email to change this." : "Failed to load.");
      }
    })();
  }, [auth]);

  const toggle = async () => {
    if (busy || hint) return;
    const next = !enabled;
    setEnabled(next);
    try {
      setBusy(true);
      await api.patch("/driver/notifications/update-setting", { receives_email: next }, auth);
    } catch {
      setEnabled(!next);
      alert("Failed to update.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
      <h4 className="card-title mb-3 fw-bold p-3">
        <Link to={`${basePath}`} className="me-2 text-decoration-none">←</Link>
        Notifications
      </h4>
      <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-semibold">Email notifications</div>
            <small className="text-muted">{hint || "Receive email updates about fines & payments."}</small>
          </div>
          <div className="form-check form-switch ms-3">
            <input className="form-check-input" type="checkbox" checked={enabled} disabled={!!hint || busy} onChange={toggle} />
          </div>
        </div>
      </div>
    </div>
  );
}
