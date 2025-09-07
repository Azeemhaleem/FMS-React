import React, { useMemo, useState } from "react";
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

export default function DangerZonePanel({ onBack }) {
  const token = useToken();
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    setBusy(true);
    try {
      await api.delete("/police/delete-account", { headers: { Authorization: `Bearer ${token}` } });
      alert("Account deleted.");
      window.location.href = "/loginPolice";
    } catch {
      alert("Failed to delete account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h4 className="card-title mb-3 fw-bold p-3">Delete Account</h4>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <div className="warning-box mb-3">
            <p>This action is permanent and cannot be undone.</p>
          </div>
          <button className="btn btn-danger" onClick={deleteAccount} disabled={busy}>
            Yes, Delete Account
          </button>
        </div>
      </div>

      <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>Back</button>
    </section>
  );
}
