import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash } from "react-icons/fa";
import api from "../../api/axios.jsx";

export default function DangerZonePanel({ basePath }) {
  const navigate = useNavigate();

  const token = useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const [busy, setBusy] = useState(false);

  const confirm = async (msg, fn) => {
    if (!window.confirm(msg)) return;
    try {
      setBusy(true);
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const logout = () =>
    confirm("Log out from this device?", async () => {
      await api.post("/logout", null, auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    });

  const logoutAll = () =>
    confirm("Log out from ALL devices?", async () => {
      await api.post("/logout-all", null, auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    });

  const deleteAccount = () =>
    confirm("This will permanently delete your account. Continue?", async () => {
      await api.delete("/driver/delete-account", auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/home");
    });

  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#ffe3e3" }}>
      <h4 className="card-title mb-3 fw-bold p-3">
        <Link to={basePath || "/DriverSettings"} className="me-2 text-decoration-none">←</Link>
        Danger Zone
      </h4>

      <div className="card-body bg-white rounded-4">
        <p className="text-muted mb-4">
          Sensitive actions. Be careful—some cannot be undone.
        </p>

        <div className="d-flex flex-column gap-3">
          <button
            className="btn btn-outline-dark d-flex align-items-center justify-content-center"
            disabled={busy}
            onClick={logout}
          >
            <FaSignOutAlt className="me-2" /> Log out (this device)
          </button>

          <button
            className="btn btn-outline-dark d-flex align-items-center justify-content-center"
            disabled={busy}
            onClick={logoutAll}
          >
            <FaSignOutAlt className="me-2" /> Log out (all devices)
          </button>

          <div className="border rounded-4 p-3">
            <h6 className="text-danger fw-bold mb-3">Delete account</h6>
            <p className="small text-muted mb-3">
              This will permanently remove your data from the system.
            </p>
            <button
              className="btn btn-danger d-flex align-items-center justify-content-center w-100"
              disabled={busy}
              onClick={deleteAccount}
            >
              <FaTrash className="me-2" /> Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
