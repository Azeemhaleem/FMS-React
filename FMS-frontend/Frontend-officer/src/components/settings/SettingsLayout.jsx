import React from "react";
import { useNavigate } from "react-router-dom";
import SettingsIndex from "./SettingsIndex";
import AccountPanel from "./AccountPanel";
import ChangeUsernamePanel from "./ChangeUsernamePanel";
import ChangePasswordPanel from "./ChangePasswordPanel";
import NotificationPanel from "./NotificationPanel";
import SessionsPanel from "./SessionsPanel";
import DangerZonePanel from "./DangerZonePanel";
import HelpPanel from "./HelpPanel";

/**
 * Props:
 * - basePath: "/AdminSettings" | "/SuperAdminSettings" | "/OfficerSettings" | "/HigherOfficerSettings"
 * - section:  "", "account", "security-username", "security-password",
 *             "notifications", "help", "sessions", "danger"
 * - role:     "Admin" | "SuperAdmin" | "Officer" | "HigherOfficer"
 */
export default function SettingsLayout({ basePath, section = "", role = "Admin" }) {
  const navigate = useNavigate();
  const go = (leaf = "") => navigate(leaf ? `${basePath}/${leaf}` : basePath);
  const back = () => navigate(-1);

  if (!section) return <SettingsIndex onGo={go} />;

  switch (section) {
    case "account":
      return <AccountPanel onGo={go} onBack={back} />;
    case "security-username":
      return <ChangeUsernamePanel onBack={back} />;
    case "security-password":
      return <ChangePasswordPanel onBack={back} />;
    case "notifications":
      return <NotificationPanel onBack={back} />;
    case "help":
      return <HelpPanel onBack={back} />;
    case "sessions":
      return <SessionsPanel onBack={back} />;
    case "danger":
      return <DangerZonePanel onBack={back} />;
    default:
      return <SettingsIndex onGo={go} />;
  }
}
