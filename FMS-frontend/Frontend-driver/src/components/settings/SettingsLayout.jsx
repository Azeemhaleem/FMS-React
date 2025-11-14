// src/components/settings/SettingsLayout.jsx
import React from "react";
import SettingsIndex from "./SettingsIndex";
import AccountPanel from "./AccountPanel";
import ChangeUsernamePanel from "./ChangeUsernamePanel";
import ChangePasswordPanel from "./ChangePasswordPanel";
import NotificationPanel from "./NotificationPanel";
import HelpPanel from "./HelpPanel";
import DangerZonePanel from "./DangerZonePanel";

export default function SettingsLayout({ basePath, section, role }) {
  // you can branch by role if some panels differ
  if (!section) return <SettingsIndex basePath={basePath} role={role} />;

  switch (section) {
    case "account": return <AccountPanel basePath={basePath} role={role} />;
    case "security-username": return <ChangeUsernamePanel basePath={basePath} role={role} />;
    case "security-password": return <ChangePasswordPanel basePath={basePath} role={role} />;
    case "notifications": return <NotificationPanel basePath={basePath} role={role} />;
    case "help": return <HelpPanel basePath={basePath} role={role} />;
    case "danger": return <DangerZonePanel basePath={basePath} role={role} />;
    default: return <SettingsIndex basePath={basePath} role={role} />;
  }
}
