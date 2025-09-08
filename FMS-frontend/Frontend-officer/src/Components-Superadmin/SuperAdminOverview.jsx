import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";


/* ---------- helpers ---------- */
const fmtMoney = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }).format(n)
    : "—";

const fmtDateTime = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const softCard = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 6px 18px rgba(17, 24, 39, .06)",
};

/* ---------- component ---------- */
export default function SuperAdminOverview() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.get("s-admin/overview");
      setPayload(res?.data ?? {});
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load overview.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------- normalize from backend structure ---------- */
  const totals = {
    recordedAmount: payload?.totals?.recorded?.amount ?? 0,
    recordedCount: payload?.totals?.recorded?.count ?? 0,
    paidAmount: payload?.totals?.paid?.amount ?? 0,
    paidCount: payload?.totals?.paid?.count ?? 0,
    processingCount: payload?.totals?.processingCount ?? 0,
  };
  const windows = {
    last7Recorded: payload?.windows?.last7days?.recorded ?? 0,
    last7Paid: payload?.windows?.last7days?.paid ?? 0,
    last24Recorded: payload?.windows?.last24h?.recorded ?? 0,
    last24Paid: payload?.windows?.last24h?.paid ?? 0,
    last24Drivers: payload?.windows?.last24h?.newDrivers ?? 0,
  };
  const recent = Array.isArray(payload?.recent) ? payload.recent : [];
  const asOf = payload?.as_of;

  /* ---------- charts data ---------- */
  // 7-day bar (we only have totals for the 7-day window; show a two-bar comparison)
  const last7Data = useMemo(
    () => [
      { name: "Recorded", value: Number(windows.last7Recorded || 0) },
      { name: "Paid", value: Number(windows.last7Paid || 0) },
    ],
    [windows.last7Recorded, windows.last7Paid]
  );

  // donut for paid vs unpaid *amounts* (derived from totals)
  const unpaidAmount = Math.max(totals.recordedAmount - totals.paidAmount, 0);
  const donutData = useMemo(
    () => [
      { name: "Paid", value: Number(totals.paidAmount || 0) },
      { name: "Unpaid", value: Number(unpaidAmount || 0) },
    ],
    [totals.paidAmount, unpaidAmount]
  );
  const donutColors = ["#10b981", "#f59e0b"];

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "linear-gradient(180deg,#e9f2ff 0,#dbe9ff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-5 mt-2">
        <h3 className="fw-bold m-0">Admin Overview</h3>
        <div className="ms-auto small text-muted">
          as of {fmtDateTime(asOf)}
        </div>
      <button
        className="w-25 btn btn-small btn ms-2 d-flex align-items-center"
        onClick={load}
        disabled={loading}
        title="Refresh"
      >
        <FontAwesomeIcon
          icon={faRotateRight}
          style={{color:"blue"}}
          spin={loading}   // animate when loading
          className="me-1"
        />
      </button>

      </div>

      {msg && <div className="alert alert-danger">{msg}</div>}

      {/* KPI row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div style={softCard} className="p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <span className="rounded-circle me-2" style={{ width: 10, height: 10, background: "#7c3aed" }} />
              <span className="text-muted">Total Fines Recorded</span>
            </div>
            <div className="display-6 fw-bold">{fmtMoney(totals.recordedAmount)}</div>
            <div className="text-muted">{totals.recordedCount} fines</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div style={softCard} className="p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <span className="rounded-circle me-2" style={{ width: 10, height: 10, background: "#0ea5e9" }} />
              <span className="text-muted">Total Payment Collected</span>
            </div>
            <div className="display-6 fw-bold">{fmtMoney(totals.paidAmount)}</div>
            <div className="text-muted">{totals.paidCount} fines paid</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div style={softCard} className="p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <span className="rounded-circle me-2" style={{ width: 10, height: 10, background: "#34d399" }} />
              <span className="text-muted">Currently Processing</span>
            </div>
            <div className="display-6 fw-bold">{totals.processingCount}</div>
            <div className="text-muted">unpaid & active</div>
          </div>
        </div>
      </div>

      {/* Charts + Right tiles */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div style={softCard} className="p-3">
            <div className="fw-semibold mb-2">Last 7 days — Recorded vs Paid</div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Data} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3" style={softCard}>
            <div className="p-3">
              <div className="fw-semibold mb-2 mt-2">Paid vs Unpaid (Amount)</div>
              <div className="row m-2">
                <div className="col-12 col-lg-6 m-0" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => fmtMoney(v)}/>
                     
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={`slice-${i}`} fill={donutColors[i % donutColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
                  <div className="gap-2 d-flex align-items-center mb-2">
                    <span className="w-25 badge me-2" style={{ background: "#10b981" }}>
                      Paid
                    </span>
                    <span className="fw-semibold">{fmtMoney(totals.paidAmount)}</span>
                  </div>
                  <div className="gap-2 d-flex align-items-center">
                    <span className="w-25 badge me-2" style={{ background: "#f59e0b" }}>
                      Unpaid
                    </span>
                    <span className="fw-semibold">{fmtMoney(unpaidAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      
    </div>
  );
}
