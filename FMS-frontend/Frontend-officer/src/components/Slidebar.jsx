import React, { useEffect, useMemo, useState } from "react";
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

  // ---- Unread notifications polling (safe fallback) ----
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadUnread = async () => {
      try {
        // Preferred police endpoint (parallel to your driver version)
        const r = await api.get("/police/notifications/unread", auth);
        if (!cancelled) {
          const count = Array.isArray(r?.data) ? r.data.length : (r?.data?.count ?? 0);
          setUnreadCount(Number(count) || 0);
        }
      } catch {
        // Fallback: try fetching all and counting unread locally
        try {
          const r2 = await api.get("/police/notifications/all", auth);
          if (!cancelled) {
            const raw = Array.isArray(r2?.data) ? r2.data : [];
            const count = raw.reduce((acc, n) => acc + (n.read_at ? 0 : 1), 0);
            setUnreadCount(Number(count) || 0);
          }
        } catch {
          if (!cancelled) setUnreadCount(0);
        }
      }
    };

    loadUnread();
    const id = setInterval(loadUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, auth]);

  // ---- Menus (kept 1:1 with your original to avoid missing options) ----
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
      { icon: faTableColumns, text: "Overview", link: "/AdminOverview" },
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
      { icon: faBell, text: "Notifications", link: "/OfficerPoliceNotifications" },
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
 shela's-branch
    <nav className="sidebar min-h-screen pb-5">
      {sidebarOptions[role]?.map((item, index) => (
        <div key={index} className="sidebar-links mb-2">
          <NavLink
            to={item.link}
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
                      background: "#ff1fa5ff", // change to '#fd0da5ff' if you want the driver pink
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
      ))}
    </nav>

    <>
    <nav className="sidebar min-h-screen pb-5 mt-3">
  {sidebarOptions[role]?.map((item, index) => (
    <div key={index} className="sidebar-links mb-2 ms-3">
    <Link to={item.link}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <FontAwesomeIcon icon={item.icon} style={{ fontSize: "20px", marginRight: "10px" }} />
        <span>{item.text}</span>
      </div>
    </Link>
  </div>
  
  ))}
</nav>

    </>
 main
  );
}

export default Slidebar;
