import React from 'react';

const HelpItem = ({ icon, label, bar, href }) => {
    const commonLinks = "d-flex align-items-center text-decoration-none w-100 py-1 text-dark";

    return (
        <li className="list-group-item d-flex justify-content-between align-items-center py-2">
            {(bar ? (
                    <a href={href} className={commonLinks}>
                        <span className="icons fs-5" style={{ width: "13%" }}>{icon}</span>
                        <span className="flex-grow-1">{label}</span>
                        <div style={{ width: "15%" }}>
                            <span className="ms-4 fs-5">&gt;</span>
                        </div>
                    </a>
                ) : (
                    <a href={href} className={commonLinks}>
                        <span className="fs-5" style={{ width: "11%" }}>{icon}</span>
                        <span className="flex-grow-1">{label}</span>
                    </a>
                )
            )}
        </li>
    );
};

export default HelpItem;