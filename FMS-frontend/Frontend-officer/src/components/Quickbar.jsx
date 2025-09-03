import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Quickbar({ role }) {
  const actions = {
    Driver: [
      ["My Fines", "Appeal Fine"],
      ["Download History", "Summary"],
    ],
    Admin: [
      ["Fined Drivers", "Issued Fines","Appealed Fines"],
      ["Download History", "Summary"],
    ],
    SuperAdmin: [
      ["Fined Drivers", "Issued Fines","Appealed Fines"],
      ["Download History", "Summary"],
    ],
    Officer: [
      ["Scan QR", "Today Activities","Fine list"],
      ["All Issued Fines", "Notofications"],
    ],
    HigherOfficer: [
      ["Scan QR", "Today Activities","Fine list"],
      ["All Issued Fines", "Notofications"],
    ],
  };

  return (
    <div className="row" id="quickbar">
      <h2>Quick Actions</h2>
      <div className="d-block">
        {actions[role]?.map((row, rowIndex) => (
          <div className="row" id={`row-${rowIndex + 1}`}>
             {row.map((action, actionIndex) => (
              <button className="action d-inline-flex me-5" key={actionIndex}>
                <b>{action}</b>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Quickbar;
