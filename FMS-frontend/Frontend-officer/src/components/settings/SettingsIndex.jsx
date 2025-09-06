import React from "react";
import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt, FaTrash } from "react-icons/fa";
import SettingItem from "../SettingItem.jsx";

export default function SettingsIndex({ onGo }) {
  return (
    <>
      <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
        <h4 className="card-title mb-1 fw-bold p-3">Settings</h4>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <ul className="list-group list-group-flush">
            <SettingItem icon={<FaUser />} label="Account" bar onClick={() => onGo("account")} />
            <SettingItem icon={<FaBell />} label="Notifications" toggle onClick={() => onGo("notifications")} />
            <SettingItem icon={<FaQuestionCircle />} label="Help & Support" bar onClick={() => onGo("help")} />
            <SettingItem icon={<FaSignOutAlt />} label="Sessions" bar onClick={() => onGo("sessions")} />
          </ul>
        </div>
      </div>

      <div className="card shadow rounded-3" style={{ marginBottom: "10%" }}>
        <div className="card-body p-1">
          <ul className="list-group list-group-flush text-white">
            <SettingItem icon={<FaTrash />} label="Delete Account" onClick={() => onGo("danger")} />
          </ul>
        </div>
      </div>
    </>
  );
}
