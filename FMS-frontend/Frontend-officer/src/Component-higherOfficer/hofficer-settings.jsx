import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout";

export default function HigherOfficerSettings({ section }) {
  return <SettingsLayout basePath="/HigherOfficerSettings" section={section} role="HigherOfficer" />;
}
