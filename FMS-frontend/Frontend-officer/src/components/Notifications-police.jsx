import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

/* ---------- tiny helpers ---------- */
const getToken = () => {
  try {
    const raw = localStorage.getItem("token");
    if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
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

/* ---------- component ---------- */
export default function PoliceNotifications() {
  const token = getToken();
  const navigate = useNavigate();

  const headers = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const menuRef = useRef(null);

  // auth + initial load
  useEffect(() => {
    if (!token) {
      navigate("/loginPolice");
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r = await api.get("/police/notifications/all", headers);
        const raw = Array.isArray(r?.data) ? r.data : [];
        const norm = raw
          .map((n) => ({
            id: n.id,
            message: n?.data?.message ?? "",
            read_at: !!n.read_at,
            created_at: n.created_at,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setItems(norm);
      } catch (e) {
        setError("Failed to load messages. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate, headers]);

  // kebab closing
  useEffect(() => {
    if (!showMenu) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setShowMenu(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showMenu]);

  const unread = useMemo(() => items.filter((i) => !i.read_at).length, [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.message.toLowerCase().includes(q)) : items;
  }, [items, query]);

  /* ----- API actions ----- */
  const markAll = async () => {
    setBusy(true);
    try {
      await api.put("/police/notifications/mark-all-as-read", {}, headers);
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
      await api.delete("/police/notifications/delete-all", headers);
      setItems([]);
    } catch {
      setError("Failed to delete all messages.");
    } finally {
      setBusy(false);
      setShowMenu(false);
    }
  };

  const markOne = async (id) => {
    try {
      await api.put(
        "/police/notifications/mark-as-read",
        { notification_id: id },
        { headers: { ...headers.headers, "Content-Type": "application/json" } }
      );
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read_at: true } : i)));
    } catch {
      setError("Failed to mark notification as read.");
    }
  };

  const deleteOne = async (id) => {
    setBusy(true);
    try {
      await api.delete("/police/notifications/delete", {
        data: { notification_id: id },
        headers: headers.headers,
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Failed to delete the notification.");
    } finally {
      setBusy(false);
      setOpenItem(null);
    }
  };

  /* ----- UI handlers ----- */
  const openModal = async (item) => {
    setOpenItem(item);
    if (!item.read_at) {
      // optimistic read
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read_at: true } : i)));
      await markOne(item.id);
    }
  };

  /* ---------- styles (local) ---------- */
  const shell = {
    background: "linear-gradient(180deg, #eef5ff 0%, #e8f0ff 100%)",
    borderRadius: 16,
    padding: 16,
  };
  const listCard = {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
  };
  const pill = {
    background: "#1f73ff",
    color: "#fff",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 12,
    padding: "6px 12px",
    minWidth: 86,
    textAlign: "center",
  };

  return (
    <>
      {/* Modal */}
      {openItem && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
          onClick={() => setOpenItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title m-0">Notification</h6>
                <button type="button" className="btn-close" onClick={() => setOpenItem(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-2">{openItem.message}</p>
                <small className="text-muted">{relTime(openItem.created_at)}</small>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-danger" disabled={busy} onClick={() => deleteOne(openItem.id)}>
                  Delete
                </button>
                <button className="btn btn-secondary" onClick={() => setOpenItem(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container my-4">
        <div style={shell} className="shadow-sm">
          {/* header row */}
          <div className="d-flex align-items-center mb-5">
            <h4 className="m-0 fw-bold">Notifications</h4>

            <div className="ms-auto w-25 d-flex align-items-center gap-1">
              <span style={pill}>{unread} unread</span>

              {/* kebab */}
              <div ref={menuRef} className="position-relative">
                <button className="btn btn-sm" onClick={() => setShowMenu((v) => !v)} aria-label="More actions">
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
          </div>

          {/* search input */}
          <input
            className="form-control mb-5"
            placeholder="Search notifications…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notifications"
            style={{ maxWidth: 640 }}
          />

          {/* error bar */}
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          {/* list card */}
          <div style={listCard}>
            {loading ? (
              <div className="text-center text-muted py-3">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted py-3">
                You do not have any messages.
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {filtered.map((i) => (
                  <li key={i.id} className="list-group-item p-0">
                    <button
                      className="w-100 d-flex justify-content-between align-items-center border-0 bg-white text-start px-3 py-3"
                      onClick={() => openModal(i)}
                      title={new Date(i.created_at).toLocaleString()}
                    >
                      <div className={i.read_at ? "text-muted" : "fw-semibold"}>
                        {i.message.length > 120 ? i.message.slice(0, 120) + "…" : i.message}
                      </div>
                      <small className="text-muted ms-3">{relTime(i.created_at)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
