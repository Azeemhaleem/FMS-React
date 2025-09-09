import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaBell, FaQuestionCircle, FaShieldAlt, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

export default function SettingsIndex({ basePath }) {
  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
      <h4 className="card-title mb-1 fw-bold p-3">Settings</h4>

      <div className="card-body bg-white rounded-top-4 rounded-bottom-4 ">
        <ul className="list-group list-group-flush">
          <li className="list-group-item mb-3">
            <Link to={`${basePath}/account`} className="d-flex align-items-center text-decoration-none text-dark">
              <FaUser className="me-3 " /> <span className="flex-grow-1">Account</span> <span>&gt;</span>
            </Link>
          </li>

          <li className="list-group-item mb-3">
            <Link to={`${basePath}/notifications`} className="d-flex align-items-center text-decoration-none text-dark">
              <FaBell className="me-3" /> <span className="flex-grow-1">Notifications</span> <span>&gt;</span>
            </Link>
          </li>

          <li className="list-group-item mb-3">
            <Link to={`${basePath}/help`} className="d-flex align-items-center text-decoration-none text-dark">
              <FaQuestionCircle className="me-3" /> <span className="flex-grow-1">Help & Support</span> <span>&gt;</span>
            </Link>
          </li>

          <li className="list-group-item mb-3">
            <Link to="/Privacy" className="d-flex align-items-center text-decoration-none text-dark">
              <FaShieldAlt className="me-3" /> <span className="flex-grow-1">Privacy</span> <span>&gt;</span>
            </Link>
          </li>

          <li className="list-group-item mb-3">
            <Link to="/About" className="d-flex align-items-center text-decoration-none text-dark">
              <FaInfoCircle className="me-3" /> <span className="flex-grow-1">About</span> <span>&gt;</span>
            </Link>
          </li>

          {/* 🔴 Danger Zone entry */}
          <li className="list-group-item mb-3">
            <Link to={`${basePath}/danger`} className="d-flex align-items-center text-decoration-none text-danger">
              <FaExclamationTriangle className="me-3" />
              <span className="flex-grow-1">Danger Zone</span>
              <span className="text-danger">&gt;</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
