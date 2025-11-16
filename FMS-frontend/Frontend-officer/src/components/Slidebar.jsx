// src/components/Slidebar.jsx
import React, { useEffect, useRef, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faUser,
  faCreditCard,
  faChartLine,
  faCommentDots,
  faFile,
  faGear,
  faTableList,
  faClipboard,
  faPlusCircle,
  faDashboard,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import api from "../api/axios.jsx";

/** Safely read token from localStorage (string or JSON) */
const useToken = () => {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (!raw) return null;
      if (!raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);
};

function Slidebar({ role = "Officer" }) {
  const token = useToken();
  const auth = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const [unreadCount, setUnreadCount] = useState(0);
  const controllerRef = useRef(null);
  const intervalRef = useRef(null);

  // ---- Optimized unread count polling ----
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadUnreadCount = async () => {
      if (document.visibilityState === "hidden") return;

      // cancel any in-flight request
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();

      try {
        // ✅ use lightweight unread-count endpoint instead of full /unread
        const r = await api.get("/police/notifications/unread-count", {
          ...auth,
          signal: controllerRef.current.signal,
        });

        if (!cancelled) {
          const next = Number(r?.data?.count ?? 0);
          setUnreadCount((prev) => (prev !== next ? next : prev));
        }
      } catch (e) {
        if (!cancelled && e.code !== "ERR_CANCELED") {
          setUnreadCount(0);
        }
      }
    };

    // initial fetch
    loadUnreadCount();

    // polling every 30s
    if (!intervalRef.current) {
      intervalRef.current = setInterval(loadUnreadCount, 30000);
    }

    // refetch when user returns to tab
    const onVis = () => {
      if (document.visibilityState === "visible") loadUnreadCount();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [token, auth]);

  // ---- Menu structure (unchanged) ----
  const sidebarOptions = {
    Driver: [
      { icon: faTableColumns, text: "Overview", link: "/DriverOverview" },
      { icon: faUser, text: "My Profile", link: "/DriverProfile" },
      { icon: faCreditCard, text: "Payment", link: "/DriverPayment" },
      { icon: faCommentDots, text: "Notifications", link: "/DriverNotifications" },
      { icon: faFile, text: "Appeal", link: "/DriverAppeal" },
      { icon: faGear, text: "Settings", link: "/DriverSettings" },
    ],
    Admin: [
      { icon: faUser, text: "AdminOrganize", link: "/AdminOrganize" },
      { icon: faChartLine, text: "higher police", link: "/AdminHigherPolice" },
      { icon: faCommentDots, text: "Notifications", link: "/AdminPoliceNotifications" },
      { icon: faPlusCircle, text: "traffic police", link: "/AdminTrafficPolice" },
      { icon: faGear, text: "Settings", link: "/AdminSettings" },
      { icon: faUser, text: "Profile", link: "/AdminProfile" },
    ],
    SuperAdmin: [
      { icon: faTableColumns, text: "Overview", link: "/SuperAdminOverview" },
      { icon: faUser, text: "Admins", link: "/SuperAdminAdmins" },
      { icon: faTableList, text: "Fines", link: "/SuperAdminFines" },
      { icon: faPlusCircle, text: "Add New", link: "/SuperAdminAddNew" },
      { icon: faTableList, text: "Charged fines", link: "/ChargedFinesSadmin" },
      { icon: faFile, text: "Logs", link: "/AccountCreationLogs" },
      { icon: faUser, text: "Drivers", link: "/SuperAdminDrivers" },
      { icon: faClipboard, text: "Police", link: "/SuperAdminOfficers" },
      { icon: faCommentDots, text: "Notifications", link: "/SuperAdminPoliceNotifications" },
      { icon: faGear, text: "Settings", link: "/SuperAdminSettings" },
      { icon: faUser, text: "Profile", link: "/SuperAdminProfile" },
    ],
    Officer: [
      { icon: faTableColumns, text: "Overview", link: "/OfficerOverview" },
      { icon: faDashboard, text: "Dashboard", link: "/OfficerDashboard" },
      { icon: faBell, text: "Notifications", link: "/OfficerNotifications" },
      { icon: faGear, text: "Settings", link: "/OfficerSettings" },
      { icon: faUser, text: "Profile", link: "/OfficerProfile" },
    ],
    HigherOfficer: [
      { icon: faFile, text: "Appeal", link: "/ManageAppeal" },
      { icon: faTableList, text: "Fines", link: "/ManageChargedFines" },
      { icon: faUser, text: "Traffic Officers", link: "/ManageTrafficPolice" },
      { icon: faUser, text: "Profile", link: "/HigherOfficerProfile" },
      { icon: faBell, text: "Notifications", link: "/HigherOfficerPoliceNotifications" },
      { icon: faGear, text: "Settings", link: "/HigherOfficerSettings" },
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

                {/* Tiny dot for unread notifications */}
                {item.text.toLowerCase().includes("notifications") && unreadCount > 0 && (
                  <span
                    title={`${unreadCount} unread`}
                    aria-label={`${unreadCount} unread`}
                    className="ms-auto"
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 8,
                      borderRadius: "50%",
                      background: "#fd0da5ff", // same pink as driver
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
