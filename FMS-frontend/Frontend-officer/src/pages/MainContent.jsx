// src/pages/MainContent.jsx
import "../styles.css";
import Footer from '../components/Footer.jsx';
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Slidebar from "../components/Slidebar";
import Header from "../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";

/* ---- Admin ---- */
import AdminOverview from "../Components-admin/AdminOverview";
import AdminSettings from "../Components-admin/Admin-settings";
import AdminReport from "../Components-admin/Admin-report";
import AdminOfficers from "../Components-admin/Admin-officers";
import AdminDrivers from "../Components-admin/Admin-drivers";
import AdminTrafficPolice from "../Components-admin/Admin-trafficPolice.jsx";
import AdminHigherPolice from "../Components-admin/Admin-higherPolice.jsx";
import AssignTrafficPolice from "../Components-admin/AssignTrafficPolice.jsx";

/* ---- Super Admin ---- */
import SuperAdminOverview from "../Components-Superadmin/SuperAdminOverview";
import SuperAdminSettings from "../Components-Superadmin/SuperAdmin-settings";
import SuperAdminReport from "../Components-Superadmin/SuperAdmin-report";
import SuperAdminOfficers from "../Components-Superadmin/SuperAdmin-officers";
import SuperAdminAdmins from "../Components-Superadmin/SuperAdmin-admins";
import SuperAdminFines from "../Components-Superadmin/SuperAdmin-fines";
import SuperAdminDrivers from "../Components-Superadmin/SuperAdmin-drivers";
import SuperAdminAnalytics from "../Components-Superadmin/SuperAdmin-analytics";
import SuperAdminAddNew from "../Components-Superadmin/SuperAdminAddNew";
import AccountCreationLogs from "../Components-Superadmin/AccountCreationLogs.jsx";
import ChargedFinesSadmin from "../Components-Superadmin/ChargedFinesSadmin.jsx";

/* ---- Officer / Higher Officer ---- */
import OfficerOverview from "../Components-officer/OfficerOverview";
import OfficerDashboard from "../Components-officer/OfficerDashboard.jsx";
import OfficerSettings from "../Components-officer/OfficerSettings.jsx";
import OfficerProfile from "../Components-officer/OfficerProfile.jsx";
import HigherOfficerSettings from "../Component-higherOfficer/hofficer-settings.jsx";

/* ---- Shared (police) ---- */
import ManageAppeal from "../Component-higherOfficer/ManageAppeal.jsx";
import ManageChargedFines from "../Component-higherOfficer/ManageChargedFines.jsx";
import ManageTrafficPolice from "../Component-higherOfficer/ManageTrafficPolice.jsx";
import PoliceProfile from "../components/PoliceProfile.jsx";
import PoliceNotifications from "../components/Notifications-police.jsx";

/* Map the current URL to a settings section key */
function useSettingsSection() {
  const { pathname } = useLocation();
  const p = pathname.toLowerCase();

  if (!p.includes("settings")) return ""; // index page

  if (p.endsWith("/account")) return "account";
  if (p.includes("/notifications")) return "notifications";
  if (p.includes("/help")) return "help";
  if (p.includes("/security/username")) return "security-username";
  if (p.includes("/security/password")) return "security-password";
  if (p.includes("/sessions")) return "sessions";
  if (p.includes("/danger")) return "danger";

  return ""; // default to index inside settings
}

function MainContent({ username, image, role, type }) {
  const [messages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // for routes like /AdminSettings/notifications, etc.
  const settingsSection = useSettingsSection();

  return (
    <>
      <div className="DriverPortal" id="DriverPortal">
        {/* Mobile toggle */}
        <button
          className="btn btn-dark d-md-none"
          style={{ padding: "4%", paddingRight: "80%" }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <Header username={username} image={image} role={role} messages={messages} />

        <div className="dashboard">
          <div className="row" style={{ width: "100%" }}>
            {/* Desktop Sidebar */}
            <div
              className="m-0 d-none d-md-block col-2 align-items-left min-h-screen block"
              style={{ backgroundColor: "#fff" }}
            >
              <Slidebar messages={messages} role={role} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}>
              <div className="sidebar-mobile bg-white shadow-sm">
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                  ×
                </button>
                <Slidebar messages={messages} role={role} />
              </div>
            </div>

            {/* Main panel */}
            <div className="col-9 mb-4" style={{ marginTop: "3%", gap: "10px", marginLeft: "5%" }}>
              {/* -------- Admin -------- */}
              {role === "Admin" && (
                <>
                  {type === "Overview" && <AdminOverview />}
                  {type === "Settings" && <AdminSettings section={settingsSection} />}
                  {type === "Report" && <AdminReport />}
                  {type === "Officers" && <AdminOfficers />}
                  {type === "Notifications" && <PoliceNotifications />}
                  {type === "Drivers" && <AdminDrivers />}
                  {type === "trafficPolice" && <AdminTrafficPolice />}
                  {type === "higherPolice" && <AdminHigherPolice />}
                  {type === "assignOfficer" && <AssignTrafficPolice />}
                  {type === "Profile" && <PoliceProfile />}
                </>
              )}

              {/* -------- SuperAdmin -------- */}
              {role === "SuperAdmin" && (
                <>
                  {type === "Dashboard" && <SuperAdminOverview />}
                  {type === "Settings" && <SuperAdminSettings section={settingsSection} />}
                  {type === "Report" && <SuperAdminReport />}
                  {type === "Officers" && <SuperAdminOfficers />}
                  {type === "Admins" && <SuperAdminAdmins />}
                  {type === "Notifications" && <PoliceNotifications />}
                  {type === "Fines" && <SuperAdminFines />}
                  {type === "Drivers" && <SuperAdminDrivers />}
                  {type === "Analytics" && <SuperAdminAnalytics />}
                  {type === "AddNew" && <SuperAdminAddNew />}
                  {type === "AccountCreationLogs" && <AccountCreationLogs />}
                  {type === "ChargedFinesSadmin" && <ChargedFinesSadmin />}
                  {type === "Profile" && <PoliceProfile />}
                </>
              )}

              {/* -------- Officer -------- */}
              {role === "Officer" && (
                <>
                  {type === "Overview" && <OfficerOverview />}
                  {type === "Dashboard" && <OfficerDashboard />}
                  {type === "Notifications" && <PoliceNotifications />}
                  {type === "Settings" && <OfficerSettings section={settingsSection} />}
                  {type === "Profile" && <OfficerProfile />}
                </>
              )}

              {/* -------- Higher Officer -------- */}
              {role === "HigherOfficer" && (
                <>
                  {type === "ManageAppeal" && <ManageAppeal />}
                  {type === "ChargedFines" && <ManageChargedFines />}
                  {type === "ManageTrafficPolice" && <ManageTrafficPolice />}
                  {type === "Notifications" && <PoliceNotifications />}
                  {type === "Profile" && <PoliceProfile />}
                  {type === "Settings" && <HigherOfficerSettings section={settingsSection} />}
                </>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}

export default MainContent;
