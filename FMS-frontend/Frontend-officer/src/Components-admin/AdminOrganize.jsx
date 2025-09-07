// src/pages/AdminOrganize.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function friendlyError(err, fallback = "Something went wrong.") {
  const data = err?.response?.data || {};
  let msg = data.message || data.messege || fallback;

  // pretty-up common framework errors so users don't see raw stack info
  if (/Class .+ not found/i.test(msg)) {
    msg = "Server configuration error while processing the request.";
  } else if (/SQLSTATE|Integrity constraint/i.test(msg)) {
    msg = "IDs appear invalid or conflict with an existing assignment.";
  }
  return msg;
}

export default function AdminOrganize() {
  // ASSIGN
  const [assign, setAssign] = useState({ traffic_police_id: "", higher_police_id: "" });
  const [assignAlert, setAssignAlert] = useState(null);
  const [assignErrs, setAssignErrs] = useState({});
  const [assigning, setAssigning] = useState(false);

  // REASSIGN
  const [reassign, setReassign] = useState({
    traffic_officer_police_id: "",
    current_higher: "",
    new_higher_officer_police_id: "",
  });
  const [reassignAlert, setReassignAlert] = useState(null);
  const [reErrs, setReErrs] = useState({});
  const [checking, setChecking] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  // WATCH (lookup current higher)
  const [watchId, setWatchId] = useState("");
  const [watchResult, setWatchResult] = useState(null);
  const [watchAlert, setWatchAlert] = useState(null);
  const [watching, setWatching] = useState(false);

  // utils
  const setA = (k, v) => {
    setAssign((s) => ({ ...s, [k]: v }));
    if (assignErrs[k]) setAssignErrs((e) => ({ ...e, [k]: undefined }));
  };
  const setR = (k, v) => {
    setReassign((s) => ({ ...s, [k]: v }));
    if (reErrs[k]) setReErrs((e) => ({ ...e, [k]: undefined }));
  };

  // ============== ASSIGN ==============
  async function submitAssign(e) {
    e.preventDefault();
    setAssignAlert(null);

    const errs = {};
    if (!assign.traffic_police_id?.trim()) errs.traffic_police_id = "Traffic Police ID is required.";
    if (!assign.higher_police_id?.trim()) errs.higher_police_id = "Higher Officer Police ID is required.";
    if (Object.keys(errs).length) return setAssignErrs(errs);

    setAssigning(true);
    try {
      const res = await api.post("/admin/assign-traffic-police-to-higher-police", assign);
      const msg = res?.data?.message || res?.data?.messege || "Traffic officer assigned successfully.";
      setAssignAlert({ type: "success", msg });
      setAssignErrs({});
    } catch (err) {
      // field errors
      const data = err?.response?.data || {};
      const f = {};
      if (data.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([k, v]) => (f[k] = Array.isArray(v) ? v[0] : String(v)));
      }
      setAssignErrs(f);
      setAssignAlert({ type: "danger", msg: friendlyError(err, "Failed to assign traffic officer.") });
    } finally {
      setAssigning(false);
    }
  }

  // ============== REASSIGN ==============
  async function checkCurrentHigher(e) {
    e?.preventDefault?.();
    setReassignAlert(null);
    setWatchAlert(null);
    if (!reassign.traffic_officer_police_id?.trim()) {
      return setReErrs({ traffic_officer_police_id: "Traffic Officer ID is required." });
    }
    setChecking(true);
    try {
      const res = await api.post("/admin/get-assigned-hOfficer", {
        police_id: reassign.traffic_officer_police_id,
      });
      const higher = res?.data?.assigned_higher_officer || "";
      setReassign((s) => ({ ...s, current_higher: higher }));
      setReassignAlert({ type: "info", msg: higher ? `Current higher: ${higher}` : "This officer is not assigned." });
    } catch (err) {
      setReassignAlert({ type: "danger", msg: friendlyError(err, "Could not fetch current higher officer.") });
    } finally {
      setChecking(false);
    }
  }

  async function submitReassign(e) {
    e.preventDefault();
    setReassignAlert(null);

    const errs = {};
    if (!reassign.traffic_officer_police_id?.trim())
      errs.traffic_officer_police_id = "Traffic Officer ID is required.";
    if (!reassign.new_higher_officer_police_id?.trim())
      errs.new_higher_officer_police_id = "New Higher Officer ID is required.";
    if (Object.keys(errs).length) return setReErrs(errs);

    setReassigning(true);
    try {
      const res = await api.post("/admin/reassign-traffic-officer", {
        traffic_officer_police_id: reassign.traffic_officer_police_id,
        new_higher_officer_police_id: reassign.new_higher_officer_police_id,
      });
      const msg = res?.data?.message || res?.data?.messege || "Traffic officer reassigned successfully.";
      setReassignAlert({ type: "success", msg });
      setReErrs({});
    } catch (err) {
      const data = err?.response?.data || {};
      const f = {};
      if (data.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([k, v]) => (f[k] = Array.isArray(v) ? v[0] : String(v)));
      }
      setReErrs(f);
      setReassignAlert({ type: "danger", msg: friendlyError(err, "Failed to reassign traffic officer.") });
    } finally {
      setReassigning(false);
    }
  }

  // ============== WATCH ==============
  async function submitWatch(e) {
    e.preventDefault();
    setWatchAlert(null);
    setWatchResult(null);

    if (!watchId?.trim()) {
      return setWatchAlert({ type: "warning", msg: "Enter a Traffic Officer ID to look up." });
    }
    setWatching(true);
    try {
      const res = await api.post("/admin/get-assigned-hOfficer", { police_id: watchId });
      setWatchResult(res?.data || null);
      if (!res?.data?.assigned_higher_officer) {
        setWatchAlert({ type: "info", msg: "This officer is currently unassigned." });
      }
    } catch (err) {
      setWatchAlert({ type: "danger", msg: friendlyError(err, "Lookup failed.") });
    } finally {
      setWatching(false);
    }
  }

  const invalid = (map, key) => (map[key] ? "is-invalid" : "");

  return (
    <div className="container py-4">
      <h2 className="h3 m-2 text-center">Admin • Organize Officers</h2>

      {/* Quick links to registration pages */}
      <div className="d-flex gap-2 justify-content-center mb-3 mt-5 px-4">
        <Link to="/AdminHigherPolice" className="btn btn-outline-primary btn-small">Register Higher Officer</Link>
        <Link to="/AdminTrafficPolice" className="btn btn-outline-primary btn-small">Register Traffic Officer</Link>
      </div>

      <div className="row g-4 m-2">
        {/* ASSIGN CARD */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h4 className="card-title mb-4 mt-2">Assign Traffic → Higher</h4>

              {assignAlert && (
                <div className={`alert alert-${assignAlert.type}`} role="alert">
                  {assignAlert.msg}
                </div>
              )}

              <form onSubmit={submitAssign} noValidate>
                <div className="mb-3">
                  <label className="form-label" style={{fontSize:"1rem"}}>Traffic Police ID</label>
                  <input
                    className={`form-control ${invalid(assignErrs, "traffic_police_id")}`}
                    value={assign.traffic_police_id}
                    onChange={(e) => setA("traffic_police_id", e.target.value)}
                    placeholder="e.g., 7777"
                    autoComplete="off"
                    required
                  />
                  {assignErrs.traffic_police_id && (
                    <div className="invalid-feedback">{assignErrs.traffic_police_id}</div>
                  )}
                </div>

                <div className="mb-5">
                  <label className="form-label" style={{fontSize:"1rem"}}>Higher Officer Police ID</label>
                  <input
                    className={`form-control ${invalid(assignErrs, "higher_police_id")}`}
                    value={assign.higher_police_id}
                    onChange={(e) => setA("higher_police_id", e.target.value)}
                    placeholder="e.g., 6666"
                    autoComplete="off"
                    required
                  />
                  {assignErrs.higher_police_id && (
                    <div className="invalid-feedback">{assignErrs.higher_police_id}</div>
                  )}
                </div>

                <div className="text-muted small mb-1">
                * IDs are from <code>police_in_depts.police_id</code>.
                </div>

                <button className="btn btn-dark w-100" disabled={assigning}>
                  {assigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Assigning…
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
              </form>
              
            </div>
          </div>
        </div>

        {/* REASSIGN CARD */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h4 className="card-title mb-4">Reassign Traffic Officer</h4>

              {reassignAlert && (
                <div className={`alert alert-${reassignAlert.type}`} role="alert">
                  {reassignAlert.msg}
                </div>
              )}

              <form onSubmit={submitReassign} noValidate>
                <div className="mb-3">
                  <label className="form-label" style={{fontSize:"1rem"}}>Traffic Officer ID</label>
                  <div className="input-group">
                    <input
                      className={`form-control ${invalid(reErrs, "traffic_officer_police_id")}`}
                      value={reassign.traffic_officer_police_id}
                      onChange={(e) => setR("traffic_officer_police_id", e.target.value)}
                      placeholder="e.g., 7777"
                      autoComplete="off"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary w-50 btn-sm"
                      type="button"
                      onClick={checkCurrentHigher}
                      disabled={checking}
                    >
                      {checking ? "Checking…" : "Check current higher"}
                    </button>
                  </div>
                  {reErrs.traffic_officer_police_id && (
                    <div className="invalid-feedback d-block">{reErrs.traffic_officer_police_id}</div>
                  )}
                  {reassign.current_higher && (
                    <div className="form-text">Current higher: <strong>{reassign.current_higher}</strong></div>
                  )}
                </div>

                <div className="mb-5">
                  <label className="form-label" style={{fontSize:"1rem"}}>New Higher Officer ID</label>
                  <input
                    className={`form-control ${invalid(reErrs, "new_higher_officer_police_id")}`}
                    value={reassign.new_higher_officer_police_id}
                    onChange={(e) => setR("new_higher_officer_police_id", e.target.value)}
                    placeholder="e.g., 6666"
                    autoComplete="off"
                    required
                  />
                  {reErrs.new_higher_officer_police_id && (
                    <div className="invalid-feedback d-block">
                      {reErrs.new_higher_officer_police_id}
                    </div>
                  )}
                </div>

                <button className="btn btn-dark w-100" disabled={reassigning}>
                  {reassigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Reassigning…
                    </>
                  ) : (
                    "Reassign"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* WATCH CARD */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title mb-3">Watch / Lookup Assignment</h5>

              {watchAlert && (
                <div className={`alert alert-${watchAlert.type}`} role="alert">
                  {watchAlert.msg}
                </div>
              )}

              <form className="row g-2 align-items-end" onSubmit={submitWatch}>
                <div className="col-12 col-md-4">
                  <label className="form-label">Traffic Officer ID</label>
                  <input
                    className="form-control"
                    value={watchId}
                    onChange={(e) => setWatchId(e.target.value)}
                    placeholder="e.g., 7777"
                  />
                </div>
                <div className="col-12 col-md-auto">
                  <button className="btn btn-outline-dark" disabled={watching}>
                    {watching ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Checking…
                      </>
                    ) : (
                      "Lookup"
                    )}
                  </button>
                </div>
              </form>

              {watchResult && (
                <div className="mt-3">
                  <div className="row">
                    <div className="col-12 col-md-4">
                      <div className="border rounded p-2">
                        <div className="text-muted small">Traffic Officer</div>
                        <div className="fw-semibold">{watchResult.traffic_officer}</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="border rounded p-2">
                        <div className="text-muted small">Assigned Higher</div>
                        <div className="fw-semibold">{watchResult.assigned_higher_officer || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-muted small mt-2">
                * All IDs refer to <code>police_in_depts.police_id</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
