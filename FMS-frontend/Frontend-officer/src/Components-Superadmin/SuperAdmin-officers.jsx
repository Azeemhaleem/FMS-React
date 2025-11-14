import React, { useState } from "react";
import api from "../api/axios";
import "./styles/driver-style.css";

export default function SuperAdminOfficers() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null); // { police_in_dept, police_user, role }
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error" | ""

  const reset = () => {
    setData(null);
    setMsg("");
    setMsgType("");
  };

  const handleSearch = async () => {
    const id = query.trim();
    reset();

    if (!id) {
      setMsg("Please enter a Police ID.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("get-police/by-police-id", { police_id: id });
      const payload = res.data || {};
      setData(payload);

      if (!payload?.police_in_dept && !payload?.police_user) {
        setMsg("No police record found for that ID.");
        setMsgType("error");
      } else {
        setMsg("Police details fetched successfully.");
        setMsgType("success");
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.messege ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : null) ||
        "Police not found or invalid ID.";
      setMsg(apiMessage);
      setMsgType("error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // safe getters (tolerate slight schema variations)
  const pid = data?.police_in_dept?.police_id ?? "N/A";
  const fullName = data?.police_in_dept?.full_name ?? "N/A";
  const username = data?.police_user?.username ?? "N/A";
  const email = data?.police_user?.email ?? "N/A";
  const role =
    data?.role ?? data?.police_user?.role_name ?? "N/A";
  const station = data?.police_user?.station ?? "N/A";
  const emailNotifs = data?.police_user?.receives_email_notifications;

  return (
    <div
      className="container mb-5"
      style={{ backgroundColor: "#d3e2fd", padding: "1rem", borderRadius: "1rem" }}
    >
      {/* Header */}
      <div className="text-center my-4 mb-2">
        <h2 className="fw-bold" style={{ color: "#003366" }}>
          Police Details
        </h2>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          Search for a police user’s details by entering their{" "}
          <strong>Police ID</strong>.
        </p>
      </div>

      {/* Search card */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex px-4 mt-4 mb-4">
            <input
              type="text"
              className="col-8 form-control me-md-2 mb-2 mb-md-0"
              placeholder="e.g., 1011"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (msgType) { setMsg(""); setMsgType(""); }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="d-grid d-md-flex gap-2">
              <button
                className="w-75 btn btn-dark"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Searching…" : "Search"}
              </button>

            </div>
          </div>
          <div className="form-text mt-1">
            The Police ID must exist in <code>police_in_depts.police_id</code>.
          </div>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div
          className={`small py-2 alert ${msgType === "success" ? "alert-success" : "alert-danger"}`}
          role="alert"
        >
          {msg}
        </div>
      )}

      {/* Result card */}
      {data && (data.police_in_dept || data.police_user) && (
        <div className="d-flex justify-content-center mt-3">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "#f7f9fc", width: "100%", maxWidth: 720 }}
          >
            <div className="card-body">
              <h5 className="card-title mb-3">Officer Profile</h5>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-muted">Police ID</div>
                  <div className="fw-semibold">{pid}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Full Name</div>
                  <div className="fw-semibold">{fullName}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Username</div>
                  <div className="fw-semibold">{username}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Email</div>
                  <div className="fw-semibold">{email}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Role</div>
                  <span className="w-50 badge bg-primary" style={{ fontSize: ".85rem" }}>
                    {role}
                  </span>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Station</div>
                  <div className="fw-semibold">{station}</div>
                </div>

                <div className="col-12">
                  <div className="text-muted">Email Notifications</div>
                  <span
                    className={`w-25 badge bg-${
                      emailNotifs ? "success" : "secondary"
                    }`}
                  >
                    {emailNotifs ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <hr />
              <div className="text-muted" style={{ fontSize: ".85rem" }}>
                Fields are shown as returned by the API:
                <code> police_in_dept, police_user, role</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state after successful search with no data */}
      {!loading && !data && msgType === "success" && (
        <div className="text-center text-muted mt-4">No record selected.</div>
      )}
    </div>
  );
}
