// src/pages/DriverPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.jsx";
import { useNavigate } from "react-router-dom";

const fmtMoney = (amt) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR", maximumFractionDigits: 2 })
    .format(Number(amt || 0));

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const daysUntil = (iso) => {
  if (!iso) return null;
  const due = new Date(iso);
  if (isNaN(due)) return null;
  const now = new Date();
  return Math.ceil((due.setHours(23,59,59,999) - now) / (1000 * 60 * 60 * 24));
};

export default function DriverPayment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [unpaid, setUnpaid] = useState([]);       // [{id,name,amount,issued_at,expires_at}]
  const [paid, setPaid] = useState([]);           // [{id,name,amount,issued_at,paid_at}]
  const [loadingUnpaid, setLoadingUnpaid] = useState(true);
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [payingIds, setPayingIds] = useState(new Set()); // disable buttons while paying

  // ---------- Auth + initial load ----------
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadUnpaid();
    loadPaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---------- API loads ----------
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const loadUnpaid = async () => {
  try {
    setPageError(""); setLoadingUnpaid(true);
    const res = await api.get("/get-all-unpaid-fines", headers);
    const raw = Array.isArray(res?.data) ? res.data : [];
    const norm = raw.map((x, idx) => ({
      // rowKey: unique for React & selection
      rowKey: String(x.id ?? x.record_id ?? `${x.fine?.id}-${x.issued_at}-${idx}`),

      // payId: the ID your backend expects in fineIds[]
      payId: x.id ?? x.fine?.id,  // adjust if your API expects another identifier

      id: x.fine?.id,             // keep for display (Fine ID)
      name: x.fine?.name,
      amount: x.fine?.amount,
      description: x.fine?.description,
      issued_at: x.issued_at,
      expires_at: x.expires_at,
      paid_at: x.paid_at,
      police_user_id: x.police_user_id,
    })).sort((a,b) => new Date(a.expires_at||a.issued_at) - new Date(b.expires_at||b.issued_at));
    setUnpaid(norm);
  } catch (e) {
    setPageError("Failed to load unpaid fines. Please try again.");
    setUnpaid([]);
  } finally {
    setLoadingUnpaid(false);
  }
};

const loadPaid = async () => {
  try {
    setPageError(""); setLoadingPaid(true);
    const res = await api.get("/get-recently-paid-fines", headers);
    const raw = Array.isArray(res?.data) ? res.data : [];
    const norm = raw.map((x, idx) => ({
      rowKey: String(x.id ?? x.record_id ?? `${x.fine?.id}-${x.issued_at}-${idx}`),
      payId: x.id ?? x.fine?.id,
      id: x.fine?.id,
      name: x.fine?.name,
      amount: x.fine?.amount,
      description: x.fine?.description,
      issued_at: x.issued_at,
      paid_at: x.paid_at,
      expires_at: x.expires_at,
      police_user_id: x.police_user_id,
    })).sort((a,b) => new Date(b.paid_at||b.issued_at) - new Date(a.paid_at||a.issued_at));
    setPaid(norm);
  } catch {
    setPageError("Failed to load paid fines. Please try again.");
    setPaid([]);
  } finally {
    setLoadingPaid(false);
  }
};

const [payingRows, setPayingRows] = useState(new Set());    // of rowKeys

  // ---------- Selection ----------
  const toggleOne = (rowKey) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(rowKey) ? s.delete(rowKey) : s.add(rowKey);
      return s;
    });
  };

  const allChecked = useMemo(
    () => unpaid.length > 0 && selected.size === unpaid.length,
    [unpaid, selected]
  );

  const toggleAll = () => {
    setSelected(prev => (prev.size === unpaid.length ? new Set() : new Set(unpaid.map(u => u.rowKey))));
  };

  const subtotal = useMemo(() => {
    let sum = 0;
    unpaid.forEach(u => { if (selected.has(u.rowKey)) sum += Number(u.amount || 0); });
    return sum;
  }, [selected, unpaid]);

  // ---------- Payment actions ----------
const paySelected = async () => {
  if (selected.size === 0) { alert("Please select at least one fine to pay."); return; }
  const ids = unpaid.filter(u => selected.has(u.rowKey)).map(u => u.payId);
  await payMany(ids, Array.from(selected));
};

const payRow = async (rowKey) => {
  const row = unpaid.find(u => u.rowKey === rowKey);
  if (!row) return;
  await payMany([row.payId], [rowKey]);
};

// const payMany = async (idsToPay, rowKeysInvolved) => {
//   setPageError("");
//   setPayingRows(prev => new Set([...prev, ...rowKeysInvolved]));
//   try {
//     await api.post(
//       "/process-payment",
//       { fineIds: idsToPay },
//       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//     );
//     setSelected(new Set());
//     await Promise.all([loadUnpaid(), loadPaid()]);
//   } catch {
//     setPageError("Payment failed. No charge was made. Please try again.");
//   } finally {
//     setPayingRows(new Set());
//   }
// };

  // inside DriverPayment.jsx
  const payMany = async (idsToPay, rowKeysInvolved) => {
    navigate("/pay-fines", { state: { fineIds: idsToPay } });
  };



  // ---------- Render ----------
  return (
    <div className="container my-4">
      <h4 className="fw-bold mb-3">Payment</h4>
      {pageError && <div className="alert alert-danger">{pageError}</div>}

      {/* Unpaid List */}
      <div className="bg-white rounded-4 shadow-sm p-3 p-sm-4 mb-5" style={{ background: "linear-gradient(135deg,#d9eaff,#fff)" }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="fw-semibold m-0">Unpaid List</h6>
          <div className="d-flex align-items-center gap-3">
            <div className="small text-muted">
              Selected: <strong>{selected.size}</strong> • Total: <strong>{fmtMoney(subtotal)}</strong>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={paySelected}
              disabled={selected.size === 0 || payingIds.size > 0}
            >
              {payingIds.size > 0 ? "Processing…" : "Pay Selected"}
            </button>
          </div>
        </div>

<div className="table-responsive">
  <table className="table align-middle mb-0 table-fixed">
    <colgroup>
      <col className="check-col" />      {/* checkbox */}
      <col style={{ width: "5%" }} />    {/* Fine ID */}
      <col style={{ width: "25%" }} />   {/* Fine */}
      <col style={{ width: "15%" }} />   {/* Amount */}
      <col style={{ width: "18%" }} />   {/* Issued */}
      <col style={{ width: "20%" }} />   {/* Deadline */}
      <col style={{ width: "10%" }} />   {/* Pay */}
    </colgroup>
    <thead>
      <tr className="text-secondary text-center">
        <th className="check-col">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all fines" />
        </th>
        <th>Fine ID</th>
        <th className="text-start">Fine</th>
        <th className="text-start">Amount</th>
        <th className="text-start">Issued</th>
        <th className="nowrap">Deadline</th>
        <th>Pay</th>
      </tr>
    </thead>
    <tbody className="text-center">
      {unpaid.map((u) => {
        const d = daysUntil(u.expires_at);
        let badge = null;
        if (d !== null) {
          if (d < 0) badge = <span className="badge bg-danger">Overdue</span>;
          else if (d <= 3) badge = <span className="badge bg-warning text-dark">Due in {d}d</span>;
          else badge = <span className="badge bg-secondary">Due in {d}d</span>;
        }
        return (
          <tr key={u.rowKey}>
            <td className="check-col">
              <input
                type="checkbox"
                checked={selected.has(u.rowKey)}
                onChange={() => toggleOne(u.rowKey)}
                aria-label={`Select ${u.name} • ${fmtMoney(u.amount)}`} />
            </td>
            <td>{u.id}</td>
            <td className="text-start truncate small">{u.name}</td>
            <td className="text-start small">{fmtMoney(u.amount)}</td>
            <td className="text-start small">{fmtDate(u.issued_at)}</td>
            <td className="nowrap small">
              <div className="d-flex flex-column align-items-center gap-1">
                <span>{fmtDate(u.expires_at)}</span>
                {badge}
              </div>
            </td>
            <td>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={payingRows.has(u.rowKey)}
                onClick={() => payRow(u.rowKey)}
              >
                {payingRows.has(u.rowKey) ? "Paying…" : "Pay"}
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

      </div>

      {/* Paid List */}
      <div className="bg-white rounded-4 shadow-sm p-3 p-sm-4" style={{ background: "linear-gradient(135deg,#d9eaff,#fff)" }}>
        <h6 className="fw-semibold mb-2">Paid List</h6>
        <div className="table-responsive">
          <table className="table align-middle mb-0 table-fixed">
            <colgroup>
            <col style={{ width: "5%" }} />    {/* Fine ID */}
            <col style={{ width: "25%" }} />   {/* Fine */}
            <col style={{ width: "18%" }} />   {/* Issued */}
            <col style={{ width: "20%" }} />   {/* Deadline */}
            <col style={{ width: "10%" }} />   {/* Pay */}
          </colgroup>
            <thead>
              <tr className="text-secondary text-center">
                <th className="text-start">Fine ID</th>
                <th className="text-start">Fine</th>
                <th className="text-start">Amount</th>
                <th className="text-start">Issued</th>
                <th className="text-start nowrap">Paid</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {loadingPaid ? (
                <tr><td colSpan={5} className="py-4">Loading paid fines…</td></tr>
              ) : paid.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-muted">No recent payments.</td></tr>
              ) : (
                paid.map((p) => (
                  <tr key={p.id}>
                    <td className="text-start">{p.id}</td>
                    <td className="text-start truncate small">{p.name}</td>
                    <td className="text-start small">{fmtMoney(p.amount)}</td>
                    <td className="text-start small">{fmtDate(p.issued_at)}</td>
                    <td className="text-start nowrap small">{fmtDate(p.paid_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .nowrap { white-space: nowrap; }
      `}</style>
    </div>
  );
}
