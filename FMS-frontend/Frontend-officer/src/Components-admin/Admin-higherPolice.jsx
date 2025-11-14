// src/pages/AdminHigherPolice.jsx
import React, { useState } from "react";
import api from "../api/axios";

const initialForm = {
  police_id: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
};

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function AdminHigherPolice() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    // clear field-level error on change
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
    if (!form.police_id?.trim()) e.police_id = "Police ID is required.";
    if (!form.username?.trim()) e.username = "Username is required.";
    if (!form.email?.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (!PASSWORD_RULE.test(form.password))
      e.password =
        "At least 8 chars, with uppercase, lowercase, number, and symbol.";
    if (!form.password_confirmation)
      e.password_confirmation = "Confirm your password.";
    else if (form.password !== form.password_confirmation)
      e.password_confirmation = "Password confirmation does not match.";
    return e;
    };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAlert({ type: "", text: "" });
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/admin/register-higher-police", form);

      // Laravel sometimes returns `message` or misspelled `messege`
      const text =
        res?.data?.message ||
        res?.data?.messege ||
        "Higher officer registered successfully.";

      setAlert({ type: "success", text });
      setErrors({});
      setForm(initialForm); // reset form on success
    } catch (err) {
      // Normalize Laravel validation errors and generic errors
      if (err?.response) {
        const data = err.response.data || {};
        const fieldErrors = {};

        // data.errors is usually { field: [msg1, msg2] }
        if (data.errors && typeof data.errors === "object") {
          Object.entries(data.errors).forEach(([k, v]) => {
            if (Array.isArray(v)) fieldErrors[k] = v[0];
            else if (typeof v === "string") fieldErrors[k] = v;
          });
        }

        // top banner message
        const text =
          data.message || data.messege || "Failed to register higher officer.";

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
              <h2 className="h3 text-center mb-4">Higher Officer Registration</h2>

              {alert.text ? (
                <div
                  className={`alert alert-${
                    alert.type || "info"
                  } d-flex align-items-center`}
                  role="alert"
                >
                  <div>{alert.text}</div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <input
                    type="text"
                    name="police_id"
                    placeholder="Police ID"
                    className={inputCls("police_id")}
                    value={form.police_id}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {errors.police_id && (
                    <div className="invalid-feedback">{errors.police_id}</div>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className={inputCls("username")}
                    value={form.username}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={inputCls("email")}
                    value={form.email}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={inputCls("password")}
                    value={form.password}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {errors.password ? (
                    <div className="invalid-feedback">{errors.password}</div>
                  ) : (
                    <div className="form-text">
                      Must include uppercase, lowercase, number, and symbol.
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm Password"
                    className={inputCls("password_confirmation")}
                    value={form.password_confirmation}
                    onChange={(e) => setField(e.target.name, e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {errors.password_confirmation && (
                    <div className="invalid-feedback">
                      {errors.password_confirmation}
                    </div>
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
                      Registering…
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Light background like your screenshot */}
          <div
            className="mt-4 p-3 rounded"
            style={{ backgroundColor: "#d3e2fd" }}
          />
        </div>
      </div>
    </div>
  );
}
