import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./styles-admin.css"; // keep your existing styles

function friendlyError(err, fallback = "Something went wrong.") {
  const data = err?.response?.data || {};
  // also read `error` since some endpoints return it
  let msg = data.message || data.messege || data.error || fallback;
  if (/Class .+ not found/i.test(msg)) msg = "Server configuration issue while processing the request.";
  if (/SQLSTATE|Integrity constraint/i.test(msg)) msg = "IDs appear invalid or conflict with an existing assignment.";
  return msg;
}

const Card = ({ children, className = "" }) => (
  <div
    className={`card shadow-sm border-0 ${className}`}
    style={{ borderRadius: "1rem", backgroundColor: "#f7f9fc" }}
  >
    <div className="card-body p-4 p-sm-5">{children}</div>
  </div>
);

/* ---------- Picker (big equal-height clickable cards, no extra CSS needed) ---------- */
function ActionPicker({ onPick }) {
  const ActionCard = ({ emoji, label, desc, action }) => (
    <button
      type="button"
      className="btn p-0 text-start w-100"
      onClick={() => onPick(action)}
      style={{ border: "none" }}
    >
      <div
        className="card h-100 border-0 shadow-sm rounded-4"
        style={{
          minHeight: 210,
          transition: "transform .15s ease, box-shadow .15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 .8rem 1.6rem rgba(0,0,0,.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            <span className="fs-1 me-3">{emoji}</span>
            <h5 className="mb-0">{label}</h5>
          </div>
          <div className="flex-grow-1" />
          <p className="text-muted mb-0">{desc}</p>
        </div>
      </div>
    </button>
  );

  return (
    <>
      <h2 className="h2 text-center mb-5">Admin • Organize Officers</h2>

      <div className="px-5 d-flex gap-2 justify-content-center mb-5 mt-4">
        <Link to="/AdminHigherPolice" className="btn btn-outline-primary btn-small rounded-pill">
          Register Higher Officer
        </Link>
        <Link to="/AdminTrafficPolice" className="btn btn-outline-primary btn-small rounded-pill">
          Register Traffic Officer
        </Link>
      </div>

      <Card className="text-center">
        <h4 className="mb-5">Choose an action</h4>

        <div className="row g-4 text-start">
          <div className="col-12 col-md-6 col-lg-4">
            <ActionCard
              emoji="➕"
              label="Assign Traffic Officer"
              desc="Link an unassigned traffic officer to a higher officer."
              action="assign"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <ActionCard
              emoji="🔁"
              label="Reassign Traffic Officer"
              desc="Move a traffic officer from their current higher to a new one."
              action="reassign"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <ActionCard
              emoji="🔎"
              label="Lookup Assignment"
              desc="See which higher officer a traffic officer is assigned to."
              action="lookup"
            />
          </div>
        </div>

        <div className="text-muted small mt-3">
          * All IDs refer to <code>police_in_depts.police_id</code>.
        </div>
      </Card>
    </>
  );
}

/* --------------------- Assign form --------------------- */
function AssignForm({ onBack }) {
  const [form, setForm] = useState({ traffic_police_id: "", higher_police_id: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const invalid = (k) => (errors[k] ? "is-invalid" : "");

  async function submit(e) {
    e.preventDefault();
    setAlert(null);

    const eMap = {};
    if (!form.traffic_police_id?.trim()) eMap.traffic_police_id = "Traffic Police ID is required.";
    if (!form.higher_police_id?.trim()) eMap.higher_police_id = "Higher Officer Police ID is required.";
    if (Object.keys(eMap).length) return setErrors(eMap);

    setBusy(true);
    try {
      const res = await api.post("/admin/assign-traffic-police-to-higher-police", form);
      const msg = res?.data?.message || res?.data?.messege || "Traffic officer assigned successfully.";
      setAlert({ type: "success", text: msg });
      setErrors({});
    } catch (err) {
      const data = err?.response?.data || {};
      const f = {};
      if (data.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([k, v]) => (f[k] = Array.isArray(v) ? v[0] : String(v)));
      }
      setErrors(f);
      setAlert({ type: "danger", text: friendlyError(err, "Failed to assign traffic officer.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn px-0 mb-3" onClick={onBack}>← Back</button>
      <Card>
        <h4 className="mb-5">Assign Traffic → Higher</h4>
        {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label">Traffic Police ID</label>
            <input
              className={`form-control ${invalid("traffic_police_id")}`}
              placeholder="e.g., 7777"
              value={form.traffic_police_id}
              onChange={(e) => setField("traffic_police_id", e.target.value)}
              autoComplete="off"
            />
            {errors.traffic_police_id && <div className="invalid-feedback">{errors.traffic_police_id}</div>}
          </div>
          <div className="mb-2">
            <label className="form-label">Higher Officer Police ID</label>
            <input
              className={`form-control ${invalid("higher_police_id")}`}
              placeholder="e.g., 6666"
              value={form.higher_police_id}
              onChange={(e) => setField("higher_police_id", e.target.value)}
              autoComplete="off"
            />
            {errors.higher_police_id && <div className="invalid-feedback">{errors.higher_police_id}</div>}
          </div>

          <div className="text-muted small mb-3">
            * IDs are from <code>police_in_depts.police_id</code>.
          </div>

          <button className="btn btn-dark w-25" disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Assigning…</> : "Assign"}
          </button>
        </form>
      </Card>
    </>
  );
}

/* --------------------- Reassign form --------------------- */
function ReassignForm({ onBack }) {
  const [form, setForm] = useState({
    traffic_officer_police_id: "",
    current_higher: "",
    new_higher_officer_police_id: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const invalid = (k) => (errors[k] ? "is-invalid" : "");

  async function checkCurrent(e) {
    e?.preventDefault?.();
    setAlert(null);
    if (!form.traffic_officer_police_id?.trim()) {
      return setErrors({ traffic_officer_police_id: "Traffic Officer ID is required." });
    }
    setChecking(true);
    try {
      const res = await api.post("/admin/get-assigned-hOfficer", {
        police_id: form.traffic_officer_police_id,
      });
      const higher = res?.data?.assigned_higher_officer || "";
      setForm((s) => ({ ...s, current_higher: higher }));
      setAlert({ type: "info", text: higher ? `Current higher: ${higher}` : "This officer is not assigned." });
    } catch (err) {
      setAlert({ type: "danger", text: friendlyError(err, "Could not fetch current higher officer.") });
    } finally {
      setChecking(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setAlert(null);

    const eMap = {};
    if (!form.traffic_officer_police_id?.trim()) eMap.traffic_officer_police_id = "Traffic Officer ID is required.";
    if (!form.new_higher_officer_police_id?.trim()) eMap.new_higher_officer_police_id = "New Higher Officer ID is required.";
    if (Object.keys(eMap).length) return setErrors(eMap);

    // 1) Ensure we know the current higher now
    let currentHigher = form.current_higher;
    if (!currentHigher) {
      try {
        const res = await api.post("/admin/get-assigned-hOfficer", {
          police_id: form.traffic_officer_police_id,
        });
        currentHigher = res?.data?.assigned_higher_officer || "";
        setForm((s) => ({ ...s, current_higher: currentHigher }));
      } catch (err) {
        setAlert({ type: "danger", text: friendlyError(err, "Could not fetch current higher officer.") });
        return;
      }
    }

    // 2) If unassigned → ask user to use Assign instead
    if (!currentHigher) {
      setAlert({ type: "warning", text: "This officer is not currently assigned. Please use Assign instead." });
      return;
    }

    // 3) If same as new higher → early info exit
    if (String(currentHigher) === String(form.new_higher_officer_police_id)) {
      setAlert({ type: "info", text: "Already assigned to this higher officer." });
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/admin/reassign-traffic-officer", {
        traffic_officer_police_id: form.traffic_officer_police_id,
        new_higher_officer_police_id: form.new_higher_officer_police_id,
      });
      const msg = res?.data?.message || res?.data?.messege || "Traffic officer reassigned successfully.";
      setAlert({ type: "success", text: msg });
      setErrors({});
    } catch (err) {
      const data = err?.response?.data || {};
      const f = {};
      if (data.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([k, v]) => (f[k] = Array.isArray(v) ? v[0] : String(v)));
      }
      setErrors(f);
      setAlert({ type: "danger", text: friendlyError(err, "Failed to reassign traffic officer.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn px-0 mb-3" onClick={onBack}>← Back</button>
      <Card>
        <h4 className="mb-5">Reassign Traffic Officer</h4>
        {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label">Traffic Officer ID</label>
            <div className="input-group">
              <input
                className={`form-control ${invalid("traffic_officer_police_id")}`}
                placeholder="e.g., 7777"
                value={form.traffic_officer_police_id}
                onChange={(e) => setField("traffic_officer_police_id", e.target.value)}
                autoComplete="off"
              />
              <button className="w-25 btn btn-outline-secondary" type="button" onClick={checkCurrent} disabled={checking}>
                {checking ? "Checking…" : "Check current higher"}
              </button>
            </div>
            {errors.traffic_officer_police_id && (
              <div className="invalid-feedback d-block">{errors.traffic_officer_police_id}</div>
            )}
            {form.current_higher && (
              <div className="form-text">Current higher: <strong>{form.current_higher}</strong></div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">New Higher Officer ID</label>
            <input
              className={`form-control ${invalid("new_higher_officer_police_id")}`}
              placeholder="e.g., 6666"
              value={form.new_higher_officer_police_id}
              onChange={(e) => setField("new_higher_officer_police_id", e.target.value)}
              autoComplete="off"
            />
            {errors.new_higher_officer_police_id && (
              <div className="invalid-feedback d-block">{errors.new_higher_officer_police_id}</div>
            )}
          </div>

          <button className="btn btn-dark w-25" disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Reassigning…</> : "Reassign"}
          </button>
        </form>
      </Card>
    </>
  );
}

/* --------------------- Lookup form --------------------- */
function LookupForm({ onBack }) {
  const [id, setId] = useState("");
  const [alert, setAlert] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setAlert(null);
    setResult(null);

    if (!id?.trim()) return setAlert({ type: "warning", text: "Enter a Traffic Officer ID to look up." });

    setBusy(true);
    try {
      const res = await api.post("/admin/get-assigned-hOfficer", { police_id: id });
      setResult(res?.data || null);
      if (!res?.data?.assigned_higher_officer) setAlert({ type: "info", text: "This officer is currently unassigned." });
    } catch (err) {
      setAlert({ type: "danger", text: friendlyError(err, "Lookup failed.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn px-0 mb-3" onClick={onBack}>← Back</button>
      <Card>
        <h4 className="mb-3">Watch / Lookup Assignment</h4>
        {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

        <form className="row g-2 align-items-end" onSubmit={submit}>
          <div className="col-12 col-md-4">
            <label className="form-label">Traffic Officer ID</label>
            <input className="form-control" placeholder="e.g., 7777" value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div className="col-12 col-md-auto">
            <button className="btn btn-outline-dark" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" />Checking…</> : "Lookup"}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-3 row">
            <div className="col-12 col-md-4">
              <div className="border rounded p-2">
                <div className="text-muted small">Traffic Officer</div>
                <div className="fw-semibold">{result.traffic_officer}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-2">
                <div className="text-muted small">Assigned Higher</div>
                <div className="fw-semibold">{result.assigned_higher_officer || "—"}</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-muted small mt-2">
          * All IDs refer to <code>police_in_depts.police_id</code>.
        </div>
      </Card>
    </>
  );
}

export default function AdminOrganize() {
  const [mode, setMode] = useState("picker"); // 'picker' | 'assign' | 'reassign' | 'lookup'
  useEffect(() => { document.title = "Admin • Organize Officers"; }, []);
  return (
    <div className="container py-4">
      {mode === "picker" && <ActionPicker onPick={setMode} />}
      {mode === "assign" && <AssignForm onBack={() => setMode("picker")} />}
      {mode === "reassign" && <ReassignForm onBack={() => setMode("picker")} />}
      {mode === "lookup" && <LookupForm onBack={() => setMode("picker")} />}
      <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#d3e2fd" }} />
    </div>
  );
}
