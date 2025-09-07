import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout";

export default function AdminSettings({ section }) {
  return <SettingsLayout basePath="/AdminSettings" section={section} role="Admin" />;
}
