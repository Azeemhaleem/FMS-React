// src/Components-driver/DriverSettings.jsx
import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout.jsx"; 
export default function DriverSettings({ section }) {
  return <SettingsLayout basePath="/DriverSettings" section={section} role="Driver" />;
}
