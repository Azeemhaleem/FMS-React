import React, { useState } from "react";
import api from "../api/axios";
import "./styles/driver-style.css";

export default function SuperAdminDrivers() {
  const [query, setQuery] = useState("");
  const [driver, setDriver] = useState(null);  // driver_in_dept
  const [user, setUser] = useState(null);      // driver_user (backend currently returns "police_user")
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");  // "success" | "error" | ""

  const handleSearch = async () => {
    const q = query.trim();
    setMsg("");
    setMsgType("");
    setDriver(null);
    setUser(null);

    if (!q) {
      setMsg("Please enter a license number.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("get-driver/by-license-number", { license_number: q });

      // Backend returns { driver_in_dept, police_user } (note: key is a bit off).
      const d = res.data?.driver_in_dept || null;
      const u = res.data?.driver_user || res.data?.police_user || null;

      setDriver(d);
      setUser(u);
      if (!d) {
        setMsg("No driver record found for that license number.");
        setMsgType("error");
      } else {
        setMsg("Driver details fetched successfully.");
        setMsgType("success");
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.messege || // some controllers use this key
        // Laravel validation errors (422)
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : null) ||
        "Driver not found or something went wrong.";
      setMsg(apiMessage);
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  // small field helpers (schema-safe)
  const fullName = (d) => d?.full_name || d?.name || "N/A";
  const licenseNo = (d) => d?.license_no || "N/A";
  const email = (d, u) => d?.email || u?.email || "N/A";
  const phone = (d) => d?.contact_number || d?.phone || "N/A";

  return (
    <div
      className="container mb-5"
      style={{ backgroundColor: "#d3e2fd", padding: "1rem", borderRadius: "1rem" }}
    >
      <div className="text-center my-4 mb-2">
        <h2 className="fw-bold" style={{ color: "#003366" }}>
          Driver Details
        </h2>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          Search for a driver’s details by entering their <strong>license number</strong>.
        </p>
      </div>

      {/* Search bar */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-stretch px-4 mt-4 mb-4">
            <input
              type="text"
              className="form-control me-md-2 mb-2 mb-md-0"
              placeholder="e.g., B1234567"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (msgType) { setMsg(""); setMsgType(""); }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="btn btn-dark w-25"
              onClick={handleSearch}
              disabled={loading}
              title="Search"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          <div className="form-text mt-1">
            The license number must exist in <code>driver_in_depts.license_no</code>.
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
      {driver && (
        <div className="d-flex justify-content-center mt-4 mb-4 ">
          <div
            className="card shadow-sm px-4 "
            style={{ backgroundColor: "#f7f9fc", width: "100%", maxWidth: 720 }}
          >
            <div className="card-body">
              <h5 className="card-title mb-4">Driver Profile</h5>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-muted">License Number</div>
                  <div className="fw-semibold">{licenseNo(driver)}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Driver Name</div>
                  <div className="fw-semibold">{fullName(driver)}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Email</div>
                  <div className="fw-semibold">{email(driver, user)}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted">Contact Number</div>
                  <div className="fw-semibold">{phone(driver)}</div>
                </div>
              </div>

              {user && (
                <>
                  <hr />
                  <h6 className="mt-4">Linked User</h6>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="text-muted">User ID</div>
                      <div className="fw-semibold">{user?.id ?? "N/A"}</div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="text-muted">Username</div>
                      <div className="fw-semibold">{user?.username ?? "N/A"}</div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="text-muted">Email Notifications</div>
                      <span className={`w-25 badge bg-${user?.receives_email_notifications ? "success" : "secondary"}`}>
                        {user?.receives_email_notifications ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state (no match) */}
      {!loading && !driver && msgType === "success" && (
        <div className="text-center text-muted mt-4">No driver selected.</div>
      )}
    </div>
  );
}
