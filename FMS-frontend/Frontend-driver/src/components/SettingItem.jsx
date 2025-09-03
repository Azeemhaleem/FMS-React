import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import api from "../api/axios.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const getToken = () => {
    try {
        const tokenString = localStorage.getItem('token');
        if (tokenString && !tokenString.startsWith('{') && !tokenString.startsWith('[')) {
            return tokenString;
        }
        return tokenString ? JSON.parse(tokenString) : null;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};

const getUser = () => {
    try {
        const userString = localStorage.getItem('user');
        if (userString && !userString.startsWith('{') && !userString.startsWith('[')) {
            return { username: userString };
        }
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        console.error('Error parsing user:', error);
        return null;
    }
};

const SettingItem = ({ icon, label, bar, toggle, to, id, onClick }) => {
    const user = getUser();
    const token = getToken();
    const isDelete = label === "Delete Account";
    const isNotification = label === "Notifications";

    const [isToggled, setIsToggled] = useState(false);

    useEffect(() => {
        if (!isNotification || !token) return;

        const getNotifications = async () => {
            try {
                const response = await api.get('/driver/notifications/setting', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setIsToggled(response.data.receives_email);
                    console.log("Notification setting fetched.");
                }
            } catch (error) {
                console.error('Notification Setting fetch failed:', error.response?.data || error.message);
            }
        };

        getNotifications();
    }, [isNotification, token]);

    const handleToggle = async () => {
        const newValue = !isToggled;
        setIsToggled(newValue);

        try {
            const response = await api.patch('/driver/notifications/update-setting', {
                receives_email: newValue
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log("Notification setting updated.");
            }
        } catch (error) {
            console.error('Notification Update Failed:', error.response?.data || error.message);
            alert("Notification Update Failed!");
        }
    };

    const commonClasses = `d-flex align-items-center text-decoration-none w-100 py-1 ${isDelete ? "text-danger" : "text-dark"} ${isNotification ? "ms-1" : "ms-0"}`;

    return (
        <li
            className="list-group-item d-flex justify-content-between align-items-center py-2"
            onClick={() => onClick?.(id)}
            style={{ cursor: 'pointer' }}
        >
            <Link to={to || "#"} className={commonClasses}>
                <span className="icons fs-5" style={{ width: "15%" }}>{icon}</span>
                <span className="flex-grow-1" style={{ width: "70%" }}>{label}</span>
                {bar && (
                    <div style={{ width: "15%" }}>
                        <span className={`ms-4 fs-5 ${isDelete ? "text-danger" : "text-muted"}`}>&gt;</span>
                    </div>
                )}
                {toggle && isNotification && (
                    <div className="form-check form-switch ms-5" style={{ width: "14%" }}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isToggled}
                            onChange={handleToggle}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </Link>
        </li>
    );
};

export default SettingItem;
