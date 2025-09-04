import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios.jsx";
import { useNavigate } from "react-router-dom";
import "./Driver-styles.css";

/* ================================
   Toggle mock data for UI testing
   ================================ */
const USE_MOCK = false; // <-- set to false to hit backend
const SAMPLE_BACKEND_NOTIFICATIONS = [
  {
    id: "n-101",
    data: { message: "Your fine #3 is overdue. Please pay to avoid penalties." },
    read_at: null,
    created_at: "2025-09-04T13:05:00Z",
  },
  {
    id: "n-102",
    data: { message: "Receipt issued for payment LKR 300.00 on Sep 2, 2025." },
    read_at: "2025-09-03T10:10:00Z",
    created_at: "2025-09-03T09:58:00Z",
  },
  {
    id: "n-103",
    data: { message: "Reminder: fine #1 due in 2 days." },
    read_at: null,
    created_at: "2025-09-02T17:25:00Z",
  },
  {
    id: "n-104",
    data: { message: "Officer updated fine #3 description (Speeding at Main St.)." },
    read_at: null,
    created_at: "2025-09-01T08:20:00Z",
  },
  {
    id: "n-105",
    data: { message: "Your profile information was successfully updated." },
    read_at: "2025-08-30T15:00:00Z",
    created_at: "2025-08-30T14:45:00Z",
  },
];

/* Helpers */
const relTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function Messages() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const menuRef = useRef(null);

  /* Auth + initial load */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* Close kebab menu on outside click / Esc */
  useEffect(() => {
    if (!showMenu) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showMenu]);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      let raw = [];
      if (USE_MOCK) {
        raw = SAMPLE_BACKEND_NOTIFICATIONS;
      } else {
        const r = await api.get("/driver/notifications/all", headers);
        raw = Array.isArray(r?.data) ? r.data : [];
      }
      const norm = raw
        .map((n) => ({
          id: n.id,
          message: n?.data?.message ?? "",
          read_at: !!n.read_at,
          created_at: n.created_at,
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(norm);
    } catch {
      setError("Failed to load messages. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => items.filter((i) => !i.read_at).length, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.message.toLowerCase().includes(q)) : items;
  }, [items, query]);

  /* API actions */
  const markRead = async (ids) => {
    if (!ids.length) return;
    setBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          api.put(
            "/driver/notifications/mark-as-read",
            { notification_id: id },
            { headers: { ...headers.headers, "Content-Type": "application/json" } }
          )
        )
      );
      setItems((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, read_at: true } : i)));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to mark as read.");
    } finally {
      setBusy(false);
    }
  };

  const deleteMany = async (ids) => {
    if (!ids.length) return;
    setBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          api.delete("/driver/notifications/delete", {
            data: { notification_id: id },
            headers: headers.headers,
          })
        )
      );
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete messages.");
    } finally {
      setBusy(false);
    }
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await api.put("/driver/notifications/mark-all-as-read", {}, headers);
      setItems((prev) => prev.map((i) => ({ ...i, read_at: true })));
    } catch {
      setError("Failed to mark all as read.");
    } finally {
      setBusy(false);
      setShowMenu(false);
    }
  };

  const deleteAll = async () => {
    setBusy(true);
    try {
      await api.delete("/driver/notifications/delete-all", headers);
      setItems([]);
    } catch {
      setError("Failed to delete all messages.");
    } finally {
      setBusy(false);
      setShowMenu(false);
    }
  };

  /* Row interactions */
  const openModal = async (item) => {
    setOpenItem(item);
    if (!item.read_at) {
      // optimistic mark-read for this one
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read_at: true } : i)));
      try {
        await markRead([item.id]);
      } catch {
        /* error surfaced in markRead */
      }
    }
  };
  const closeModal = () => setOpenItem(null);

  return (
    <>
      {/* Modal */}
      {openItem && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p className="fw-semibold mb-2">Notification</p>
            <div className="warning-box">
              <p className="mb-0">{openItem.message}</p>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={async () => {
                  await deleteMany([openItem.id]);
                  closeModal();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container my-4">
        <div className="card-softgradient rounded-4 shadow-sm p-3 p-sm-4">
          {/* Header row */}
          <div className="d-flex align-items-center">
            <h5 className="fw-bold m-0 col-10">Notifications</h5>
            <span className="badge bg-primary ms-3 col-1">{unreadCount} unread</span>

            {/* Kebab */}
            <div ref={menuRef} className="ms-auto position-relative col-1">
              <button
                className="btn btn-sm"
                onClick={() => setShowMenu((v) => !v)}
                aria-expanded={showMenu}
                aria-label="More actions"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
              {showMenu && (
                <ul className="dropdown-menu dropdown-menu-end show" style={{ position: "absolute", right: 0 }}>
                  <li>
                    <button className="dropdown-item" onClick={markAll} disabled={busy}>
                      Mark all as read
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={deleteAll} disabled={busy}>
                      Delete all
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="input-group input-group-sm mt-3" style={{ maxWidth: 520 }}>
            <input
              className="form-control"
              placeholder="Search notifications…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search notifications"
            />
            {query && (
              <button className="btn btn-outline-secondary" onClick={() => setQuery("")} title="Clear">
                ×
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>}

          {/* List */}
          <ul className="list-group list-group-flush mt-3">
            {loading ? (
              <li className="list-group-item py-4 text-center">Loading…</li>
            ) : filtered.length === 0 ? (
              <li className="list-group-item">
                <div className="bg-white rounded-3 py-2 px-3 text-center text-muted">
                  You do not have any messages.
                </div>
              </li>
            ) : (
              filtered.map((i) => (
                <li key={i.id} className="list-group-item p-0">
                  <button
                    className="w-100 d-flex justify-content-between align-items-center border-0 bg-white text-start px-4 py-3"
                    onClick={() => openModal(i)}
                  >
                    <div className={i.read_at ? "text-muted small" : "fw-semibold small"}>
                      {i.message}
                    </div>
                    <small className="text-muted ms-3" title={new Date(i.created_at).toLocaleString()}>
                      {relTime(i.created_at)}
                    </small>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
