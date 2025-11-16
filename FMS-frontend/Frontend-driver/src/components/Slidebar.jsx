// src/components/Slidebar.jsx
import React, { useEffect, useRef, useMemo, useState } from "react";
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
  const controllerRef = useRef(null); // [KEPT] abort in-flight request
  const intervalRef = useRef(null);   // [CHANGED] use this to avoid duplicates

  useEffect(() => {
    if (!token) return; // if token is null, effect won't run

    let cancelled = false;

    const loadUnreadCount = async () => {
      // console.log("➡️ loadUnreadCount", document.visibilityState);
      if (document.visibilityState === "hidden") return;

      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();

      try {
        const r = await api.get("/driver/notifications/unread-count", {
          ...auth,
          signal: controllerRef.current.signal,
        });

        if (!cancelled) {
          const next = Number(r?.data?.count ?? 0);
          setUnreadCount((prev) => (prev !== next ? next : prev));
        }
      } catch (e) {
        // axios cancel in v1 has e.code === "ERR_CANCELED"
        if (!cancelled && e.code !== "ERR_CANCELED") {
          setUnreadCount(0);
          // console.error("unread-count error:", e);
        }
      }
    };

    // Initial fetch on mount
    loadUnreadCount();

    // [CHANGED] Only create interval if not already set
    if (!intervalRef.current) {
      intervalRef.current = setInterval(loadUnreadCount, 30000);
    }

    const onVis = () => {
      if (document.visibilityState === "visible") loadUnreadCount();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null; // [CHANGED] ensure we can recreate cleanly
      }
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [token, auth]); // [CHANGED] removed didSetup guard entirely

  const sidebarOptions = {
    Driver: [
      { icon: faTableColumns, text: "Overview", link: "/DriverOverview" },
      { icon: faTableColumns, text: "My Fines", link: "/DriverMyFines" },
      { icon: faCreditCard, text: "Payment", link: "/DriverPayment" },
      { icon: faCommentDots, text: "Notifications", link: "/DriverMessages" },
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
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 rounded-3 text-decoration-none sidebar-link ${isActive ? "sidebar-link--active" : ""
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

                {/* Tiny pink dot when there are unread notifications */}
                {item.text === "Notifications" && unreadCount > 0 && (
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

export default React.memo(Slidebar);
