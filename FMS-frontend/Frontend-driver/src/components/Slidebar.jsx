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
import { NavLink } from "react-router-dom";
import api from "../api/axios.jsx";

function Slidebar({ role = "Driver" }) {
  // ---- auth header (same approach as elsewhere) ----
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

  // Poll unread notifications so the dot stays fresh
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
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnread();
    const id = setInterval(loadUnread, 30000); // every 30s
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
      { icon: faCommentDots, text: "Messages", link: "/DriverMessages" },
      { icon: faFile, text: "Appeal", link: "/DriverAppeal" },
      { icon: faGear, text: "Settings", link: "/DriverSettings" },
      { icon: faUser, text: "My Profile", link: "/DriverProfile" },
    ],
  };

  return (
    <nav className="sidebar min-h-screen pb-5">
      {sidebarOptions[role]?.map((item, index) => (
        <div key={index} className="sidebar-links mb-2">
          <NavLink
            to={item.link}
            // className gets `isActive` automatically
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 rounded-3 text-decoration-none sidebar-link ${
                isActive ? "sidebar-link--active" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`me-2 ${isActive ? "text-primary" : "text-muted"}`}
                  style={{ fontSize: 20 }}
                />
                <span className={isActive ? "fw-semibold text-primary" : "text-dark"}>
                  {item.text}
                </span>

                {/* Tiny blue dot when there are unread notifications */}
                {item.text === "Messages" && unreadCount > 0 && (
                  <span
                    title={`${unreadCount} unread`}
                    aria-label={`${unreadCount} unread`}
                    className="ms-auto"
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 8,
                      borderRadius: "50%",
                      background: "#fd0da5ff",
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
      ))}
    </nav>
  );
}

export default Slidebar;
