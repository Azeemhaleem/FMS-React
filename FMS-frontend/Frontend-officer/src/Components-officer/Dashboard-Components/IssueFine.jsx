import React from "react";
import "../Officer-styles.css";

export default function IssueFineModal({ selectedFine, onCancel, onConfirm,selectedDriver }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h5 className='fw-bold text-primary'>Confirm Issue the Fine?</h5>
                <div className="warning-box">
                    <p>
                        <strong>Driver Name:</strong> {selectedDriver?.full_name}
                    </p>
                    <p>
                        <strong>Driver License Number:</strong> {selectedDriver?.license_id_no}
                    </p>
                    <p>
                        <strong>Fine:</strong> {selectedFine?.name}
                    </p>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel me-5" onClick={onCancel}>
                        No, Cancel
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        Yes, Issue
                    </button>
                </div>
            </div>
        </div>
    );
}
