import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import './styles-admin.css';

const initialForm = {
  police_id: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
};

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function AdminTrafficPolice() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRegisteredTrafficId, setLastRegisteredTrafficId] = useState("");

  const [allOfficers, setAllOfficers] = useState([]);
  const [officerDetails, setOfficerDetails] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllOfficers = async () => {
      try {
        const res = await api.get("/admin/all-police-officers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setAllOfficers(res.data.data || []);
      } catch (err) {
        console.error("Failed to load all officers");
      }
    };

    fetchAllOfficers();
    console.log(allOfficers);
  }, []);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "police_id") {
      const enteredId = value.trim();

      if (!enteredId) {
        setOfficerDetails(null);
      } else {
        const match = allOfficers.find(
          (officer) => officer.police_id === enteredId
        );
        setOfficerDetails(match || null);
      
      }
      
    }
    console.log(officerDetails);

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

  const getOfficerRole = (officer) => {
  if (!officer) return "No role assigned";

  if (officer.admin) return "Admin";
  if (officer.higher_police) return "Higher Police";
  if (officer.traffic_police) return "Traffic Police";

  return "No role assigned";
};

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAlert({ type: "", text: "" });

    const e = validate();
    if (Object.keys(e).length) return setErrors(e);

    setSubmitting(true);

    try {
      const res = await api.post("/admin/register-traffic-police", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const text =
        res?.data?.message ||
        res?.data?.messege ||
        "Traffic officer registered successfully.";

      setLastRegisteredTrafficId(form.police_id);
      setAlert({ type: "success", text });
      setErrors({});
      setForm(initialForm);
      setShowSuccess(true);
    } catch (err) {
      if (err?.response) {
        const data = err.response.data || {};
        const fieldErrors = {};
        if (data.errors) {
          Object.entries(data.errors).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
          });
        }
        setErrors(fieldErrors);
        setAlert({
          type: "danger",
          text:
            err.response.data.message ||
            "Failed to register traffic officer.",
        });
      } else {
        setAlert({ type: "danger", text: "Network error. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (name) =>
    `form-control custom-css ${errors[name] ? "is-invalid" : ""}`;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div
            className="card shadow border-0 "
            style={{ borderRadius: "1rem", backgroundColor: "#f7f9fc" }}
          >
            <div className="card-body p-4 p-sm-5">
              <h2 className="h3 text-center mb-4">
                Traffic Officer Registration
              </h2>

              {alert.text ? (
                <div className={`alert alert-${alert.type}`} role="alert">
                  {alert.text}
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
                    onChange={(e) =>
                      setField(e.target.name, e.target.value)
                    }
                    required
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
                  {submitting ? "Registering…" : "Register"}
                </button>
              </form>

              {showSuccess && (
                <div
                  className="mt-4 p-3"
                  style={{
                    backgroundColor: "#d4edda",
                    borderLeft: "5px solid #28a745",
                    color: "#155724",
                    borderRadius: "4px",
                  }}
                >
                  <div className="mb-2">
                    <strong>Traffic Officer registered successfully!</strong>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        navigate("/AssignTrafficPolice", {
                          state: {
                            traffic_police_id: lastRegisteredTrafficId,
                          },
                        })
                      }
                    >
                      Assign Officer
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowSuccess(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded"
            style={{ backgroundColor: "#d3e2fd" }}
          />
        </div>

        {officerDetails && (
          <div className="col-12 col-sm-10 col-md-4 col-lg-4">
            <div
              className="card shadow-sm border-0 p-3"
              style={{
                borderRadius: "1rem",
                backgroundColor: "#eef3ff",
              }}
            >
              <h5 className="mb-3">Officer Details</h5>

              <p><strong>ID:</strong> {officerDetails.police_id}</p>
              <p><strong>Name:</strong> {officerDetails.full_name}</p>
              <p><strong>Station:</strong> {officerDetails.p_station || null}</p>
              <p><strong>Assigned Role:</strong> {getOfficerRole(officerDetails)}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
