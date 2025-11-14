// src/pages/AssignTrafficPolice.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AssignTrafficPolice() {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    traffic_police_id: "",
    higher_police_id: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  // Prefill traffic_police_id if passed from registration page
  useEffect(() => {
    const prefill = location?.state?.traffic_police_id;
    if (prefill) {
      setForm((f) => ({ ...f, traffic_police_id: String(prefill) }));
    }
  }, [location?.state?.traffic_police_id]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const e = {};
    if (!form.traffic_police_id?.trim())
      e.traffic_police_id = "Traffic Police ID is required.";
    if (!form.higher_police_id?.trim())
      e.higher_police_id = "Higher Officer Police ID is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAlert({ type: "", text: "" });
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);

    setSubmitting(true);
    try {
      const res = await api.post(
        "/admin/assign-traffic-police-to-higher-police",
        form
      );

      const text =
        res?.data?.message ||
        res?.data?.messege ||
        "Traffic officer assigned successfully.";
      setAlert({ type: "success", text });
      setErrors({});

      // Optional: auto return to registration page after success
      setTimeout(() => navigate("/AdminTrafficPolice"), 1200);
    } catch (err) {
      if (err?.response) {
        const data = err.response.data || {};
        const fieldErrors = {};
        if (data.errors && typeof data.errors === "object") {
          Object.entries(data.errors).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
          });
        }
          // Friendly top message
        let text =
          data.message || data.messege || "Failed to assign traffic officer.";

        // Prettify common backend exceptions
        if (/Class .+ not found/i.test(text)) {
          text = "Server configuration error while processing the assignment. Please try again or contact an administrator.";
        } else if (/SQLSTATE|Integrity constraint/i.test(text)) {
          text = "Invalid IDs or an existing assignment is in conflict.";
        }        
        setErrors(fieldErrors);
        setAlert({ type: "danger", text });
      } else {
        setAlert({ type: "danger", text: "Network error. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (name) =>
    `form-control ${errors[name] ? "is-invalid" : ""}`;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div
            className="card shadow border-0"
            style={{ borderRadius: "1rem", backgroundColor: "#f7f9fc" }}
          >
            <div className="card-body p-4 p-sm-5">
              <h2 className="h3 text-center mb-4">Assign Traffic → Higher</h2>

              {alert.text ? (
                <div className={`alert alert-${alert.type || "info"}`} role="alert">
                  {alert.text}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">Traffic Police ID</label>
                  <input
                    type="text"
                    name="traffic_police_id"
                    placeholder="e.g., 7777"
                    className={inputCls("traffic_police_id")}
                    value={form.traffic_police_id}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {errors.traffic_police_id && (
                    <div className="invalid-feedback">{errors.traffic_police_id}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Higher Officer Police ID</label>
                  <input
                    type="text"
                    name="higher_police_id"
                    placeholder="e.g., 6666"
                    className={inputCls("higher_police_id")}
                    value={form.higher_police_id}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {errors.higher_police_id && (
                    <div className="invalid-feedback">{errors.higher_police_id}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Assigning…
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
              </form>

              <div className="mt-3 text-muted small">
                * These are <code>police_in_depts.police_id</code> values (not DB auto IDs).
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#d3e2fd" }} />
        </div>
      </div>
    </div>
  );
}
