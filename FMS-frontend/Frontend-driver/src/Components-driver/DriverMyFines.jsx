import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.jsx";
import { useNavigate } from "react-router-dom";
import "./Driver-styles.css";

const fmtMoney = (amt) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR", maximumFractionDigits: 2 })
    .format(Number(amt || 0));

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const daysUntil = (iso) => {
  if (!iso) return null;
  const due = new Date(iso);
  if (isNaN(due)) return null;
  const now = new Date();
  return Math.ceil((due.setHours(23, 59, 59, 999) - now) / 86_400_000);
};

export default function DriverMyFines() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // data + ui
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // controls
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | unpaid | overdue | paid
  const [timeFilter, setTimeFilter] = useState("all");     // all | 30d
  const [showCount, setShowCount] = useState(6);           // render at least 6 rows

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadFines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadFines = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/get-my-fines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = Array.isArray(res?.data) ? res.data : [];

      const norm = raw.map((x, idx) => ({
        rowKey: String(x.id ?? x.record_id ?? `${x.fine?.id}-${x.issued_at}-${idx}`),
        id: x.fine?.id,
        name: x.fine?.name,
        amount: x.fine?.amount,
        description: x.fine?.description,
        issued_at: x.issued_at,
        paid_at: x.paid_at,
        expires_at: x.expires_at,
        police_user_id: x.police_user_id,
      }));
      setFines(norm);
    } catch (e) {
      setError("Failed to load fines. Please try again.");
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset to the first 6 whenever filters/search change
  useEffect(() => {
    setShowCount(6);
  }, [query, statusFilter, timeFilter]);

  // filter by time (all-time or last 30 days)
  const timeFiltered = useMemo(() => {
    if (timeFilter !== "30d") return fines;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return fines.filter((f) => {
      const issued = new Date(f.issued_at);
      return !isNaN(issued) && issued >= cutoff;
    });
  }, [fines, timeFilter]);

  // search + status filter + sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return timeFiltered
      .filter((f) => {
        if (statusFilter === "paid" && !f.paid_at) return false;
        if (statusFilter === "unpaid" && f.paid_at) return false;
        if (statusFilter === "overdue" && !(daysUntil(f.expires_at) < 0 && !f.paid_at)) return false;
        if (!q) return true;
        const hay = `${f.name ?? ""} ${f.id ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      // Sort: Overdue → Due soon (<=3d) → newest issued
      .sort((a, b) => {
        const da = daysUntil(a.expires_at);
        const db = daysUntil(b.expires_at);
        const aOver = !a.paid_at && da !== null && da < 0;
        const bOver = !b.paid_at && db !== null && db < 0;
        if (aOver !== bOver) return aOver ? -1 : 1;
        const aSoon = !a.paid_at && da !== null && da <= 3;
        const bSoon = !b.paid_at && db !== null && db <= 3;
        if (aSoon !== bSoon) return aSoon ? -1 : 1;
        return new Date(b.issued_at) - new Date(a.issued_at);
      });
  }, [timeFiltered, query, statusFilter]);

  const visible = useMemo(() => filtered.slice(0, Math.max(6, showCount)), [filtered, showCount]);

  const badge = (f) => {
    if (f.paid_at) return <span className="badge bg-success">Paid</span>;
    const d = daysUntil(f.expires_at);
    if (d === null) return <span className="badge bg-secondary">Unpaid</span>;
    if (d < 0) return <span className="badge bg-danger">Overdue</span>;
    if (d <= 3) return <span className="badge bg-warning text-dark">Due in {d}d</span>;
    return <span className="badge bg-secondary">Unpaid</span>;
  };

  return (
    <div className="container my-4">
      <div className="card-softgradient rounded-4 shadow-sm p-3 p-sm-4">
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <h5 className="fw-bold text-secondary m-0">Fines (All time)</h5>

          <div className="d-flex flex-wrap gap-2">
            {/* status filter */}
            <div className="d-flex flex-wrap gap-2 m-3">
            <div className="btn-group btn-group-sm w-25" role="group" aria-label="Status filter">
              <button className={`btn btn-outline-secondary ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All</button>
              <button className={`btn btn-outline-secondary ${statusFilter === "unpaid" ? "active" : ""}`} onClick={() => setStatusFilter("unpaid")}>Unpaid</button>
              <button className={`btn btn-outline-secondary ${statusFilter === "overdue" ? "active" : ""}`} onClick={() => setStatusFilter("overdue")}>Overdue</button>
              <button className={`btn btn-outline-secondary ${statusFilter === "paid" ? "active" : ""}`} onClick={() => setStatusFilter("paid")}>Paid</button>
            </div>
            <button className="btn btn-sm btn-primary w-25 ms-auto" onClick={() => navigate("/DriverPayment")}>
              Go to Payment
            </button>
            </div>

            {/* time filter */}
            <div className="btn-group btn-group gap-1" role="group" aria-label="Time filter">
                            <button className={`btn btn-outline-secondary ${timeFilter === "30d" ? "active" : ""}`} onClick={() => setTimeFilter("30d")}>Last 30 days</button>
              <button className={`btn btn-outline-secondary ${timeFilter === "all" ? "active" : ""}`} onClick={() => setTimeFilter("all")}>All time</button>
            </div>

            {/* search */}
            <div className="input-group input-group-sm m-2" style={{ width: 260 }}>
              <input
                className="form-control"
                placeholder="Search by name or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="btn btn-outline-secondary" onClick={() => setQuery("")} title="Clear">
                  ×
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Content */}
        {loading && <div className="text-center py-3">Loading fines…</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            <div className="table-responsive">
              <table className="table table-fixed align-middle mb-0">
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead>
                  <tr className="text-secondary">
                    <th>Fine ID</th>
                    <th>Fine</th>
                    <th className="text-start">Amount</th>
                    <th>Status</th>
                    <th className="nowrap">Issued</th>
                    <th className="nowrap">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-muted small">
                        No fines found.
                      </td>
                    </tr>
                  ) : (
                    visible.map((f) => (
                      <tr key={f.rowKey}>
                        <td className="text-muted small">{f.id ?? "—"}</td>
                        <td className="truncate small">
                          <div className="fw-semibold">{f.name ?? "—"}</div>
                          <div className="small text-muted">#{f.id}</div>
                        </td>
                        <td className="text-start small">{fmtMoney(f.amount)}</td>
                        <td>{badge(f)}</td>
                        <td className="nowrap small">{fmtDateTime(f.issued_at)}</td>
                        <td className="nowrap small">{fmtDateTime(f.expires_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* footer controls */}
            <div className="d-flex align-items-center justify-content-between mt-3">
              <div className="small text-muted">
                Showing <strong>{visible.length}</strong> of <strong>{filtered.length}</strong>
              </div>
              {visible.length < filtered.length ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowCount((c) => c + 6)}>
                    Show 6 more
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowCount(filtered.length)}>
                    Show all
                  </button>
                </div>
              ) : filtered.length > 6 ? (
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowCount(6)}>
                  Collapse
                </button>
              ) : (
                <span />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
