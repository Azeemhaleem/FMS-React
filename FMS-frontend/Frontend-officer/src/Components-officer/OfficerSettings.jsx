import React from "react";
import SettingsLayout from "../components/settings/SettingsLayout";

export default function OfficerSettings({ section}) {
  return <SettingsLayout basePath="/OfficerSettings" section={section} role="Officer" />;

}

