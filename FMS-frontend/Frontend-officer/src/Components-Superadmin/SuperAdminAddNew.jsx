import React, { useState } from "react";
import api from "../api/axios";

function SuperAdminAddNew() {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Fine name is required.";
    if (form.amount === "" || isNaN(Number(form.amount)))
      return "Amount must be a number.";
    if (Number(form.amount) <= 0) return "Amount must be greater than 0.";
    if (!form.description.trim()) return "Description is required.";
    return null;
    };

  const handleAddFine = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        amount: Number(form.amount),
        description: form.description.trim(),
      };

      const res = await api.post("add-fine", payload);

      setSuccessMessage(res.data?.message || "Fine added successfully!");
      setForm({ name: "", amount: "", description: "" });
    } catch (error) {
      // Laravel validation or other errors
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          // Flatten validation errors
          const msg = Object.values(data.errors).flat().join("\n");
          setErrorMessage(msg);
        } else {
          setErrorMessage(data.message || "Failed to add fine.");
        }
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFine();
    }
  };

  return (
    <div className="row">
      <div
        className="d-flex container mb-5 justify-content-center align-items-center"
        style={{
          backgroundColor: "#d3e2fd",
          padding: "1.25rem",
          marginLeft: window.innerWidth < 576 ? "2rem" : "3rem",
          borderRadius: "1rem",
        }}
      >
        <div className="col-lg-7 col-md-9 col-12">
          <div style={{ margin: "2%" }}>
            <h4 className="fw-bold mb-3 text-center">Add New Fine</h4>

            <div className="card p-3 border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
              <div className="mb-3 mx-3">
                <label className="form-label small fw-semibold">Fine Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-control form-control-sm"
                  value={form.name}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  placeholder="e.g., Speeding (20–40 km/h over)"
                />
              </div>

              <div className="mb-3 mx-3">
                <label className="form-label small fw-semibold">Amount</label>
                <input
                  name="amount"
                  type="number"
                  className="form-control form-control-sm"
                  value={form.amount}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  min="1"
                  step="1"
                  placeholder="e.g., 5000"
                />
              </div>

              <div className="mb-2 mx-3">
                <label className="form-label small fw-semibold">Description</label>
                <input
                  name="description"
                  type="text"
                  className="form-control form-control-sm"
                  value={form.description}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  placeholder="Short description of the fine"
                />
              </div>

              {successMessage && (
                <div className="alert alert-success mt-3 py-2 text-center mx-3">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger mt-3 py-2 text-center mx-3" style={{ whiteSpace: "pre-line" }}>
                  {errorMessage}
                </div>
              )}

              <div className="text-center mt-4 mb-3">
                <button
                  className="btn btn-dark w-100 w-md-50"
                  style={{ borderRadius: "12px", maxWidth: "300px" }}
                  onClick={handleAddFine}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Fine"}
                </button>
              </div>
            </div>

            <p className="text-muted text-center mt-2" style={{ fontSize: "0.9rem" }}>
              Note: Fine ID is generated automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminAddNew;
