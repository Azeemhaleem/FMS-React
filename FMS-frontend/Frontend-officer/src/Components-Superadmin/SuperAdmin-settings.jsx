import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout";

export default function SuperAdminSettings({ section }) {
  return <SettingsLayout basePath="/SuperAdminSettings" section={section} role="SuperAdmin" />;
}
