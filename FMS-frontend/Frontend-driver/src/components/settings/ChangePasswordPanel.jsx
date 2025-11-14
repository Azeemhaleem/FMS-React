// src/Components-driver/settings/ChangePasswordPanel.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.jsx";

export default function ChangePasswordPanel({ basePath }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [confirmP, setConfirmP] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/driver/change-password", {
      current_password: oldP,
      new_password: newP,
      new_password_confirmation: confirmP,
    }, auth);
    alert("Password changed");
  };

  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
      <h5 className="card-title mb-3 fw-bold p-3">
        <Link to={`${basePath}/account`} className="me-2 text-decoration-none">←</Link>
        Change Password
      </h5>
      <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
        <form onSubmit={submit}>
          <label className="form-label">Old Password</label>
          <input className="form-control" type="password" value={oldP} onChange={(e)=>setOldP(e.target.value)} />
          <label className="form-label mt-3">New Password</label>
          <input className="form-control" type="password" value={newP} onChange={(e)=>setNewP(e.target.value)} />
          <label className="form-label mt-3">Confirm Password</label>
          <input className="form-control" type="password" value={confirmP} onChange={(e)=>setConfirmP(e.target.value)} />
          <div className="d-flex justify-content-end mt-4">
            <Link to={`${basePath}/account`} className="btn btn-secondary me-3">Cancel</Link>
            <button className="btn btn-dark" type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
