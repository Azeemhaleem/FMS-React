// src/pages/DriverOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const money = (n) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 2,
    }).format(Number(n || 0));

const when = (iso) =>
    iso
        ? new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : "—";
const cardStyle = {
    background: "linear-gradient(135deg, #d9eaff 0%, #ffffff 100%)",
    borderRadius: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

export default function DriverOverview() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Data
    const [unpaid, setUnpaid] = useState([]); // This should contain charged_fine records
    const [recentPayments, setRecentPayments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // UI state
    const [loadingCards, setLoadingCards] = useState({
        unpaid: true,
        payments: true,
        notices: true,
    });
    const [pageError, setPageError] = useState("");
    const [payingId, setPayingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // ---------- EFFECT: Auth + initial load ----------
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        setPageError("");
        setLoadingCards({ unpaid: true, payments: true, notices: true });

        const headers = { headers: { Authorization: `Bearer ${token}` } };
        Promise.all([
            api.get("/get-all-unpaid-fines", headers),
            api.get("/get-recently-paid-fines", headers),
            api.get("/driver/notifications/for-today", headers),
        ])
            .then(([unpaidRes, paidRes, noteRes]) => {
                const unpaidRaw = Array.isArray(unpaidRes?.data) ? unpaidRes.data : [];
                const paidRaw = Array.isArray(paidRes?.data) ? paidRes.data : [];
                const noticeRaw = Array.isArray(noteRes?.data?.data)
                    ? noteRes.data.data
                    : [];

                // Make sure we're storing the charged_fine objects with their actual IDs
                setUnpaid(
                    unpaidRaw
                        .map((x) => ({
                            chargedFineId: x.id, // This is the ID from charged_fines table
                            fineId: x.fine?.id, // This is the ID from fines table
                            name: x.fine?.name,
                            amount: x.fine?.amount,
                            description: x.fine?.description,
                            issued_at: x.issued_at,
                            paid_at: x.paid_at,
                            expires_at: x.expires_at,
                            police_user_id: x.police_user_id,
                        }))
                        .sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at))
                );

                setRecentPayments(
                    paidRaw
                        .map((x) => ({
                            chargedFineId: x.id,
                            fineId: x.fine?.id,
                            name: x.fine?.name,
                            amount: x.fine?.amount,
                            description: x.fine?.description,
                            issued_at: x.issued_at,
                            paid_at: x.paid_at,
                            expires_at: x.expires_at,
                            police_user_id: x.police_user_id,
                        }))
                        .sort(
                            (a, b) =>
                                new Date(b.paid_at || b.issued_at) -
                                new Date(a.paid_at || a.issued_at)
                        )
                );

                setNotifications(noticeRaw);
            })
            .catch(() =>
                setPageError("Could not load your dashboard. Please try again.")
            )
            .finally(() =>
                setLoadingCards({ unpaid: false, payments: false, notices: false })
            );
    }, [navigate, token]);

    // ---------- ACTIONS ----------
    const payOne = async (chargedFineId) => {
        if (!chargedFineId || !token) return;
        setPageError("");
        setPayingId(chargedFineId);

        try {
            // Navigate to payment page with the CHARGED FINE ID (not fine ID)
            navigate("/pay-fines", { state: { fineIds: [chargedFineId] } });
        } catch {
            setPageError("Payment navigation failed. Please try again.");
        } finally {
            setPayingId(null);
        }
    };

    const payAllNavigate = () => {
        // Get all unpaid CHARGED FINE IDs (not fine IDs)
        const allUnpaidIds = unpaid.map(chargedFine => chargedFine.chargedFineId);

        // Navigate to payment page with all unpaid charged fine IDs
        navigate("/pay-fines", { state: { fineIds: allUnpaidIds } });
    };

      setRecentPayments(
        paidRaw
          .map((x) => ({
            id: x.fine?.id,
            name: x.fine?.name,
            amount: x.fine?.amount,
            description: x.fine?.description,
            issued_at: x.issued_at,
            paid_at: x.paid_at,
            expires_at: x.expires_at,
            police_user_id: x.police_user_id,
          }))
          .sort(
            (a, b) =>
              new Date(b.paid_at || b.issued_at) -
              new Date(a.paid_at || a.issued_at)
          )
      );
    } catch {
      setPageError("Payment failed. No charge was made. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

    // ---------- MEMO ----------
    const threeUnpaid = useMemo(() => unpaid.slice(0, 3), [unpaid]);
    const threePayments = useMemo(
        () => recentPayments.slice(0, 3),
        [recentPayments]
    );
    const threeNotices = useMemo(
        () => notifications.slice(0, 3),
        [notifications]
    );

    const canPayAll = unpaid.length > 0 && payingId === null;

    // ---------- RENDER ----------
    return (
        <div className="container my-4">

            {/* Overview Fines */}
            <div style={cardStyle} className="p-3 p-sm-4 mb-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h4 className="fw-bold m-0">Overview Fines</h4>
                </div>

                {pageError && <div className="alert alert-danger py-2 mb-3">{pageError}</div>}

                {loadingCards.unpaid ? (
                    <div className="placeholder-glow">
                        <span className="placeholder col-12 mb-2"></span>
                        <span className="placeholder col-11 mb-2"></span>
                        <span className="placeholder col-9"></span>
                    </div>
                ) : threeUnpaid.length === 0 ? (
                    <div className="text-muted small">No recent fines.</div>
                ) : (
                    <ul className="list-group list-group-flush rounded-3 border">
                        {threeUnpaid.map((f, i) => (
                            <li
                                key={f.chargedFineId}
                                className={`list-group-item d-flex align-items-center justify-content-between flex-wrap gap-2  ${
                                    i !== 0 ? "" : "rounded-top-3"
                                } ${
                                    i === 2 || i === threeUnpaid.length - 1 ? "rounded-bottom-3" : ""
                                }`}
                            >
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold">{f.name || `Fine #${f.fineId}`}</span>
                                    <span className="text-muted small">Issued: {when(f.issued_at)}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge text-bg-light border small">{money(f.amount)}</span>
                                    <button
                                        className="btn btn-sm btn-outline-primary ms-auto"
                                        onClick={() => payOne(f.chargedFineId)} // Pass chargedFineId, not fineId
                                        disabled={payingId === f.chargedFineId}
                                        aria-label={`Pay fine ${f.fineId}`}
                                        style={{width:"10%"}}
                                    >
                                        {payingId === f.chargedFineId ? "Paying…" : "Pay"}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="d-flex justify-content-between flex-wrap gap-2 mb-2 mt-3">
                    <button
                        className="btn btn-sm btn-primary w-25"
                        onClick={() => navigate("/DriverMyFines")}
                    >
                        View all fines
                    </button>
                    <button
                        className="btn btn-sm btn-primary w-25 ms-auto"
                        disabled={!canPayAll}
                        onClick={() => setShowConfirm(true)}
                    >
                        Pay all
                    </button>
                </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-4 shadow-sm p-3 p-sm-4">
                <h5 className="fw-bold mb-3">Payment Status</h5>
                <div className="row g-3">
                    <div className="col-md-6">
                        <h6 className="small mb-2">Recent Payments</h6>
                        {loadingCards.payments ? (
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                            </div>
                        ) : threePayments.length === 0 ? (
                            <div className="text-muted small bg-primary-subtle rounded-4 p-2">No recent payments.</div>
                        ) : (
                            <ul className="list-group list-group-flush border rounded-3">
                                {threePayments.map((p) => (
                                    <li
                                        key={p.chargedFineId}
                                        className="list-group-item d-flex justify-content-between align-items-center bg-primary-subtle rounded-4 p-2"
                                    >
                                        <span className="small text-muted">{when(p.paid_at || p.issued_at)}</span>
                                        <span className="badge text-bg-light border small">{money(p.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="col-md-6">
                        <h6 className="small mb-2">Notifications</h6>
                        {loadingCards.notices ? (
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                            </div>
                        ) : threeNotices.length === 0 ? (
                            <div className="text-muted small bg-primary-subtle rounded-4 p-2">No notifications.</div>
                        ) : (
                            <ul className="list-group list-group-flush border rounded-3">
                                {threeNotices.map((n) => (
                                    <li key={n.id} className="list-group-item small bg-primary-subtle rounded-4 p-2">
                                        {String(n?.data?.message || "")}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Pay All */}
            {showConfirm && (
                <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header py-2">
                                <h6 className="modal-title">Pay all fines?</h6>
                                <button className="btn-close" onClick={() => setShowConfirm(false)} />
                            </div>
                            <div className="modal-body small">You'll proceed to the payment screen.</div>
                            <div className="modal-footer py-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-sm btn-dark" onClick={payAllNavigate}>
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}