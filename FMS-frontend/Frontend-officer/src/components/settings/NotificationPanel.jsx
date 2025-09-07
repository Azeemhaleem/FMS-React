import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
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

export default function NotificationPanel({ onBack }) {
  const token = useToken();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/police/notifications/setting", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnabled(!!r?.data?.receives_email);
      } catch {}
    })();
  }, [token]);

  const save = async (v) => {
    try {
      await api.patch(
        "/police/notifications/update-setting",
        { receives_email: !!v },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnabled(!!v);
    } catch {
      alert("Failed to update notification setting.");
    }
  };

  return (
    <section id="notifications">
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h4 className="card-title mb-3 fw-bold p-3">Notifications</h4>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <div className="d-flex align-items-center justify-content-between">
            <span>Email notifications</span>
            <Form.Check type="switch" id="notif-toggle" checked={enabled}
                        onChange={(e) => save(e.target.checked)} />
          </div>
        </div>
      </div>

      <button className="ms-auto w-25 btn btn-outline-secondary btn-sm" onClick={onBack}>Back</button>
    </section>
  );
}
