// src/Components-driver/DriverAppeal.jsx
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  AiOutlineExclamationCircle,
  AiOutlineFileText,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import api from "../api/axios.jsx";
import "./Driver-styles.css";
import { useNavigate } from "react-router-dom";

/* ----------------- helpers ----------------- */
const fmtMoney = (amt) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amt || 0));

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d)
    ? "—"
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const fmtShortDate = (iso) => {
  if (!iso) return { day: "--", mon: "--", year: "" };
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
  };
};

const statusMeta = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "resolved") return { key: "Resolved", cls: "resolved", Icon: AiOutlineCheckCircle };
  if (v === "in review") return { key: "In Review", cls: "review", Icon: AiOutlineFileText };
  return { key: "Pending", cls: "pending", Icon: AiOutlineExclamationCircle };
};

/** Detect the *charged_fines.id* from common keys returned by the API.
 * Adjust the order if your payload differs. We return a **string** id so the Map lookup is consistent.
 */
const extractChargedFineId = (row) => {
  const candidates = [
    row?.charged_fine_id,
    row?.chargedFineId,
    row?.charged_id,
    row?.id,         // many endpoints use top-level `id` for charged_fines.id
    row?.fine_id,    // fallback if the field is misnamed
  ];
  const val = candidates.find((v) => v !== undefined && v !== null);
  return val == null ? null : String(val);
};

/* ----------------- component ----------------- */
export default function DriverAppeal() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // form
  const [selectedFineId, setSelectedFineId] = useState(""); // charged_fines.id (string)
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  // data
  const [unpaid, setUnpaid] = useState([]);        // normalized unpaid charged fines
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  // timeline (replace with GET /driver/appeals when you add it)
  const [timeline, setTimeline] = useState([]);

  // right panel UI
  const [statusFilter, setStatusFilter] = useState("All");
  const [panelSearch, setPanelSearch] = useState("");
  const [openRow, setOpenRow] = useState(null);

  // left fine search
  const [fineQuery, setFineQuery] = useState("");

  /* ---------- auth + load ---------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadUnpaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const loadUnpaid = async () => {
    try {
      setPageError("");
      setLoading(true);

      const res = await api.get("/get-all-unpaid-fines", headers);
      const raw = Array.isArray(res?.data) ? res.data : [];

      const norm = raw
        .map((x) => {
          const chargedId = extractChargedFineId(x); // 🔑 must be charged_fines.id
          return {
            chargedFineId: chargedId, // used as key in our lookup Map and in <option value=...>
            name: x.fine?.name ?? `Fine ${x.fine?.id ?? ""}`,
            amount: x.fine?.amount ?? 0,
            issued_at: x.issued_at,
            appeal_requested: !!x.appeal_requested,
          };
        })
        .filter((f) => !!f.chargedFineId);

      setUnpaid(norm);
      // console.table(norm.slice(0,5)); // <— uncomment once for sanity check
    } catch (e) {
      setPageError("Failed to load fines. Please try again.");
      setUnpaid([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- lookups & filters ---------- */
  const fineLookup = useMemo(() => {
    const m = new Map();
    unpaid.forEach((f) =>
      m.set(String(f.chargedFineId), { name: f.name, amount: f.amount })
    );
    return m;
  }, [unpaid]);

  const filteredFines = useMemo(() => {
    const q = fineQuery.trim().toLowerCase();
    if (!q) return unpaid;
    return unpaid.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        String(f.chargedFineId || "").includes(q)
    );
  }, [unpaid, fineQuery]);

  const filteredTimeline = useMemo(() => {
    const f = (statusFilter || "All").toLowerCase();
    const q = (panelSearch || "").toLowerCase();
    return timeline
      .filter((t) => (f === "all" ? true : (t.status || "").toLowerCase() === f))
      .filter((t) => {
        if (!q) return true;
        const idKey =
          t.fine_id ?? t.chargedFineId ?? t.fineId ?? null; // be forgiving for old items
        const lookup = idKey ? fineLookup.get(String(idKey)) : undefined;
        const fineName = t.fine_name || lookup?.name || "";
        const fineAmt = t.fine_amount ?? lookup?.amount ?? "";
        return (
          (t.status || "").toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q) ||
          (t.decision || "").toLowerCase().includes(q) ||
          String(t.id || "").toLowerCase().includes(q) ||
          fineName.toLowerCase().includes(q) ||
          String(fineAmt).toLowerCase().includes(q)
        );
      });
  }, [timeline, statusFilter, panelSearch, fineLookup]);

  /* ---------- validation ---------- */
  const MIN = 20;
  const MAX = 1000;
  const descLen = description.trim().length;
  const canSubmit =
    !!selectedFineId && descLen >= MIN && descLen <= MAX && !submitting;

  const resetForm = () => {
    setSelectedFineId("");
    setDescription("");
    setTouched(false);
  };

  /* ---------- submit ---------- */
  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const selectedFine = unpaid.find(
      (f) => String(f.chargedFineId) === String(selectedFineId)
    );

    try {
      setSubmitting(true);

      await api.post(
        "/appeal-fine",
        { fine_id: selectedFineId, reason: description },
        headers
      );

      // Optimistic insert with the fine name/amount so the row shows immediately
      setTimeline((prev) => [
        {
          id: `tmp-${Date.now()}`,
          date: new Date().toISOString(),
          status: "Pending",
          note: "Submitted appeal",
          fine_id: String(selectedFineId),          // must match the Map key
          fine_name: selectedFine?.name ?? "",      // ensures label shows
          fine_amount: selectedFine?.amount ?? null,
        },
        ...prev,
      ]);

      resetForm();
      alert("Appeal submitted. We’ll notify you after review.");
    } catch (e) {
      setPageError(
        e?.response?.data?.message ||
          "Failed to submit appeal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------- render ----------------- */
  return (
    <div
      className="search-section container mb-5 justify-content-center align-items-center"
      style={{
        backgroundColor: "#d3e2fd",
        padding: "1rem",
        marginLeft: window.innerWidth < 576 ? "2rem" : "3rem",
      }}
    >
      <div className="container">
        <div className="row g-4">
          {/* LEFT: form */}
          <div className="col-12 col-lg-8">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100">
              <h5 className="fw-semibold mb-3">Appeal a Fine</h5>

              {pageError && (
                <div className="alert alert-danger py-2">{pageError}</div>
              )}

              <form onSubmit={onSubmit} noValidate>
                {/* Search + select */}
                <div className="mb-2 d-flex gap-2">
                  <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
                    <input
                      className="form-control"
                      placeholder="Search by name or ID…"
                      value={fineQuery}
                      onChange={(e) => setFineQuery(e.target.value)}
                    />
                    {fineQuery && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setFineQuery("")}
                        title="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="fineSelect" className="form-label">
                    Fine <span className="text-danger">*</span>
                  </label>

                  {loading ? (
                    <div className="form-control disabled">Loading fines…</div>
                  ) : filteredFines.length === 0 ? (
                    <div className="bg-light rounded-3 p-3">
                      <div className="mb-1 fw-semibold">
                        No eligible fines to appeal.
                      </div>
                      <div className="small text-muted">
                        You can view all fines from the Fines page.
                      </div>
                    </div>
                  ) : (
                    <select
                      id="fineSelect"
                      className="form-control1"
                      value={selectedFineId}
                      onChange={(e) => setSelectedFineId(e.target.value)}
                      aria-invalid={touched && !selectedFineId}
                      required
                    >
                      <option value="">-- Select a Fine --</option>
                      {filteredFines.map((f) => (
                        <option
                          key={f.chargedFineId}
                          value={f.chargedFineId}
                          disabled={f.appeal_requested}
                        >
                          #{f.chargedFineId} — {f.name} — {fmtMoney(f.amount)} — Issued{" "}
                          {fmtDateTime(f.issued_at)}
                          {f.appeal_requested ? " (appeal already requested)" : ""}
                        </option>
                      ))}
                    </select>
                  )}

                  {touched && !selectedFineId && (
                    <div className="text-danger small mt-1">
                      Please select a fine to appeal.
                    </div>
                  )}
                  <div className="form-text">
                    Only fines without an active appeal are selectable.
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="desc" className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="desc"
                    className="form-control1"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => setTouched(true)}
                    maxLength={1000}
                    aria-describedby="descHelp descCounter"
                    aria-invalid={touched && (descLen < MIN || descLen > MAX)}
                    placeholder="Explain why this fine is incorrect. Include date/time, location, plate number, or any details that help us review."
                  />
                  <div id="descHelp" className="form-text">
                    Be specific. You can attach evidence after submitting, if needed.
                  </div>
                  <div
                    id="descCounter"
                    className={`small mt-1 ${
                      descLen > MAX || (touched && descLen < MIN)
                        ? "text-danger"
                        : "text-muted"
                    }`}
                  >
                    {descLen} / {MAX} characters
                    {touched && descLen < MIN && (
                      <span> — please write at least {MIN} characters</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: status */}
          <div className="col-12 col-lg-4">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-semibold m-0">Appeal Status</h5>
                <span className="badge bg-light text-dark">
                  {filteredTimeline.length} item{filteredTimeline.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* filters + search */}
              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                {["All", "Pending", "In Review", "Resolved"].map((lab) => (
                  <button
                    key={lab}
                    type="button"
                    className={`btn btn-sm ${
                      statusFilter === lab ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setStatusFilter(lab)}
                  >
                    {lab}
                  </button>
                ))}
                <div className="input-group input-group-sm ms-auto" style={{ maxWidth: 200 }}>
                  <input
                    className="form-control"
                    placeholder="Search…"
                    value={panelSearch}
                    onChange={(e) => setPanelSearch(e.target.value)}
                    aria-label="Search appeals"
                  />
                  {panelSearch && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setPanelSearch("")}
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* timeline */}
              <div className="appeal-list" style={{ maxHeight: 520, overflowY: "auto" }}>
                {filteredTimeline.length === 0 ? (
                  <div className="text-muted">No appeals yet — submit one on the left.</div>
                ) : (
                  filteredTimeline.map((item, i) => {
                    const id = item.id ?? `${item.date}-${i}`;
                    const { key, cls, Icon } = statusMeta(item.status);
                    const short = fmtShortDate(item.date);

                    // resolve label
                    const idKey =
                      item.fine_id ?? item.chargedFineId ?? item.fineId ?? null;
                    const lookup = idKey ? fineLookup.get(String(idKey)) : undefined;
                    const fineLabel = item.fine_name || lookup?.name;
                    const fineAmount = item.fine_amount ?? lookup?.amount;

                    return (
                      <div key={id} className="appeal-row">
                        {/* date pill */}
                        <div className="date-pill p-3">
                          <div className="day">{short.day}</div>
                          <div className="mon">{short.mon}</div>
                          <div className="year">{short.year}</div>
                        </div>

                        {/* row content */}
                        <div className="appeal-main">
                        <button
                          type="button"
                          className="appeal-content"
                          onClick={() => setOpenRow(openRow === id ? null : id)}
                          aria-expanded={openRow === id}
                          aria-controls={`ap-row-${id}`}
                        >
                          <span className={`status-badge ${cls}`}>
                            <Icon className="me-1" size={16} />
                            {key}
                          </span>

                          <div className="small text-muted mt-1">
                            {fineLabel
                              ? `${fineLabel}${fineAmount ? ` • ${fmtMoney(fineAmount)}` : ""}`
                              : item.note || "Submitted appeal"}
                          </div>
                        </button>

                 
                        {/* expanded details */}
                        {openRow === id && (
                          
                          <div id={`ap-row-${id}`} className="appeal-details">
                            <dl className="deflist">
                              {fineLabel && (
                                <>
                                  <dt >Fine</dt>
                                  <dd >
                                    {fineLabel}
                                    {fineAmount ? ` • ${fmtMoney(fineAmount)}` : ""}
                                  </dd>
                                </>
                              )}
                              <dt >Submitted</dt>
                              <dd >{fmtDateTime(item.date)}</dd>

                              {item.updated_at && (
                                <>
                                  <dt >Last updated</dt>
                                  <dd >{fmtDateTime(item.updated_at)}</dd>
                                </>
                              )}
                              {item.reason && (
                                <>
                                  <dt >Reason</dt>
                                  <dd >{item.reason}</dd>
                                </>
                              )}
                              {item.decision && (
                                <>
                                  <dt >Decision</dt>
                                  <dd >{item.decision}</dd>
                                </>
                              )}
                              {item.letter_url && (
                                <>
                                  <dt >Letter</dt>
                                  <dd >
                                    <a href={item.letter_url} target="_blank" rel="noreferrer">
                                      Download decision letter
                                    </a>
                                  </dd>
                                </>
                              )}
                            </dl>
                          </div>
                        )}
                        </div>
                        </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          {/* /RIGHT */}
        </div>
      </div>
    </div>
  );
}
