import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout";

export default function OfficerSettings({ section, role = "Officer" }) {
  const base = role === "HigherOfficer" ? "/HigherOfficerSettings" : "/OfficerSettings";
  return <SettingsLayout basePath={base} section={section} role={role} />;
}
