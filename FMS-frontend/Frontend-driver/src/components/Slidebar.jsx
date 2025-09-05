// src/components/Slidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faUser,
  faCreditCard,
  faCommentDots,
  faFile,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import api from "../api/axios.jsx";

function Slidebar({ role = "Driver" }) {
  // ---- auth header (same approach you use elsewhere) ----
  const token = useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications (lightweight) so the dot stays fresh
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const r = await api.get("/driver/notifications/unread", auth);
        if (!cancelled) {
          const count = Array.isArray(r?.data) ? r.data.length : 0;
          setUnreadCount(count);
        }
      } catch (e) {
        // If email not verified, this route may 403 — just hide the dot
        setUnreadCount(0);
      }
    };

    loadUnread();
    const id = setInterval(loadUnread, 30000); // refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, auth]);

  const sidebarOptions = {
    Driver: [
      { icon: faTableColumns, text: "Overview", link: "/DriverOverview" },
      { icon: faTableColumns, text: "My Fines", link: "/DriverMyFines" },
      { icon: faCreditCard, text: "Payment", link: "/DriverPayment" },
      { icon: faCommentDots, text: "Messages", link: "/DriverMessages" }, // we'll decorate this one
      { icon: faFile, text: "Appeal", link: "/DriverAppeal" },
      { icon: faGear, text: "Settings", link: "/DriverSettings" },
      { icon: faUser, text: "My Profile", link: "/DriverProfile" },
    ],
  };

  return (
    <nav className="sidebar min-h-screen pb-5">
      {sidebarOptions[role]?.map((item, index) => (
        <div key={index} className="sidebar-links mb-2">
          <Link to={item.link}>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: "20px", marginRight: "10px" }} />
              <span>{item.text}</span>

              {/* Tiny blue dot when there are unread notifications */}
              {item.text === "Messages" && unreadCount > 0 && (
                <span
                  title={`${unreadCount} unread`}
                  aria-label={`${unreadCount} unread`}
                  className="ms-2"
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 8,
                    borderRadius: "50%",
                    background: "#0d6efd",
                  }}
                />
              )}
            </div>
          </Link>
        </div>
      ))}
    </nav>
  );
}

export default Slidebar;
