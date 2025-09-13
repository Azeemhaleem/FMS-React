// src/Components-driver/settings/DangerZonePanel.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaSignOutAlt, FaTrash } from "react-icons/fa";
import api from "../../api/axios.jsx";

export default function DangerZonePanel({ basePath }) {
  const navigate = useNavigate();

  // ---- auth header (safe parse) ----
  const token = useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // ---- modal state ----
  const [confirm, setConfirm] = useState(null); // 'logout' | 'logoutAll' | 'delete' | null
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const backTo = basePath || "/DriverSettings";

  // ---- copy for each action ----
  const copy = {
    logout: {
      title: "Log out from this device?",
      body: "You’ll be signed out only from this browser. You can sign in again anytime.",
      actionText: "Log out",
      variant: "dark",
      icon: <FaSignOutAlt className="me-2" />,
    },
    logoutAll: {
      title: "Log out from ALL devices?",
      body: "This will sign you out from every browser and device.",
      actionText: "Log out everywhere",
      variant: "dark",
      icon: <FaSignOutAlt className="me-2" />,
    },
    delete: {
      title: "Delete account permanently?",
      body: "This action cannot be undone. Your account and data will be removed.",
      actionText: "Delete account",
      variant: "danger",
      icon: <FaTrash className="me-2" />,
    },
  };

  // ---- unified executor ----
  const run = async (kind) => {
    try {
      setBusy(true);
      setError("");

      if (kind === "logout") {
        await api.post("/logout", null, auth);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (kind === "logoutAll") {
        await api.post("/logout-all", null, auth);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (kind === "delete") {
        await api.delete("/driver/delete-account", auth);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/home");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed. Try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#ffe3e3" }}>
      <h4 className="card-title mb-3 fw-bold p-3">
        <Link to={backTo} className="me-2 text-decoration-none">←</Link>
        Danger Zone
      </h4>

      <div className="card-body bg-white rounded-4 p-4">
        <p className="text-muted mb-4">
          Sensitive actions. Be careful—some cannot be undone.
        </p>

        <div className="d-flex flex-column flex-md-row gap-3 p-3">
          <button
            className="btn btn-outline-dark d-flex align-items-center justify-content-center w-100 w-md-25"
            onClick={() => setConfirm("logout")}
            disabled={busy}
            aria-label="Log out from this device"
          >
           Log out (this device)
          </button>

          <button
            className="btn btn-outline-dark d-flex align-items-center justify-content-center w-100 w-md-25"
            onClick={() => setConfirm("logoutAll")}
            disabled={busy}
            aria-label="Log out from all devices"
          >
            Log out all devices
          </button>

          <button
            className="btn btn-danger d-flex align-items-center justify-content-center w-100 w-md-25"
            onClick={() => setConfirm("delete")}
            disabled={busy}
            aria-label="Delete account"
          >
         Delete Account
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        show={!!confirm}
        onHide={() => (!busy ? setConfirm(null) : null)}
        centered
        backdrop={busy ? "static" : true}
        keyboard={!busy}
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title className={confirm === "delete" ? "text-danger" : ""}>
            {confirm ? copy[confirm].title : ""}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">{confirm ? copy[confirm].body : ""}</p>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={confirm ? copy[confirm].variant : "dark"}
            onClick={() => run(confirm)}
            disabled={busy}
          >
            {busy && <Spinner animation="border" size="sm" className="me-2" />}
            {confirm && copy[confirm].icon}
            {confirm ? copy[confirm].actionText : "Continue"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
