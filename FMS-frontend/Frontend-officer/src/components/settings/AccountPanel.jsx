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

export default function AccountPanel({ onGo, onBack }) {
  const token = useToken();
  const [data, setData] = useState({ username: "", email: "" });
  const [verified, setVerified] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/police/get-username-email", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData({
          username: r?.data?.user_name ?? "",
          email: r?.data?.email ?? "",
        });
      } catch {}
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/police/is-email-verified", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVerified(!!r?.data?.isEmailVerified);
      } catch {}
    })();
  }, [token]);

  const verifyNow = async () => {
    try {
      const r = await api.post(
        "/police/verify-email",
        { token: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (r.status === 200) {
        alert("Email verified");
        setVerified(true);
        setShowOTP(false);
      }
    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <section id="account">
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h4 className="card-title mb-3 fw-bold p-3">Account</h4>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <div>
            <span className="info-label">Username:</span>
            <button className="info-value d-flex w-100 text-black opacity-75 border-0 bg-transparent"
                    onClick={() => onGo("security/username")}>
              <div className="d-flex justify-content-start">{data.username || "No username"}</div>
              <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
            </button>
          </div>

          <div>
            <span className="info-label">Password:</span>
            <button className="info-value d-flex w-100 text-black opacity-75 border-0 bg-transparent"
                    onClick={() => onGo("security/password")}>
              <div className="d-flex justify-content-start">********</div>
              <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
            </button>
          </div>

          <div>
            <span className="info-label">Email:</span>
            {verified ? (
              <div className="info-value d-flex w-100 text-black opacity-75">
                <div className="d-flex justify-content-start">{data.email}</div>
                <div className="d-flex justify-content-center text-success">Verified ✅</div>
              </div>
            ) : (
              <button className="info-value d-flex w-100 text-black opacity-75 border-0 bg-transparent"
                      onClick={() => setShowOTP(true)}>
                <div className="d-flex justify-content-start">{data.email}</div>
                <div className="d-flex justify-content-center text-danger">Not Verified ❌</div>
                <div className="d-lg-flex d-none justify-content-end me-4 fs-5">&gt;</div>
              </button>
            )}
          </div>
        
        </div>
        
      </div>
        
      <button className="ms-auto w-25 btn btn-outline-secondary btn-sm" onClick={onBack}>Back</button>


      {showOTP && (
        <div className="modal-overlay" onClick={() => setShowOTP(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Verify Email</h5>
            <p>Enter the OTP sent to your email</p>
            <Form onSubmit={(e) => { e.preventDefault(); verifyNow(); }}>
              <div className="warning-box">
                <Form.Group controlId="otp">
                  <Form.Control
                    type="text"
                    placeholder="xxxxxx"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </Form.Group>
              </div>
              <div className="modal-actions d-flex gap-2">
                <button type="button" className="btn-cancel" onClick={() => setShowOTP(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Verify</button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </section>
  );
}
