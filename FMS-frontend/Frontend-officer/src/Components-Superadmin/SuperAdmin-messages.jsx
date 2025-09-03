import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleCheck, faEllipsisVertical, faMessage, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from "../api/axios.jsx";
import { useNavigate } from "react-router-dom";
import "../Components-officer/Officer-styles.css";


function SuperAdminMessages() {
    const token = localStorage.getItem('token');
    const [notifications, setNotifications] = useState([]);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectOptions, setSelectOptions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null); // for modal
    const navigate = useNavigate();

    // Fetch notifications on load
    useEffect(() => {
        if (!token) {
            navigate('/loginPolice');
        } else {
            fetchNotifications();
        }
    }, [navigate]);

    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/police/notifications/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.status === 200) {
                setNotifications(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxClickTodayIssued = () => {
        setShowCheckbox(!showCheckbox);
    };

    const toggleSelectMessage = (id) => {
        setNotifications(prev =>
            prev.map(msg => msg.id === id ? { ...msg, isSelected: !msg.isSelected } : msg)
        );
    };

    const deleteSelectedMessages = async () => {
        const selectedIds = notifications.filter(msg => msg.isSelected).map(msg => msg.id);

        try {
            for (const id of selectedIds) {
                await api.delete('/police/notifications/delete', {
                    data: { notification_id: id },
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setNotifications(prev => prev.filter(msg => !msg.isSelected));
            setShowCheckbox(false);

        } catch (error) {
            console.error('Notification delete error:', error.response?.data || error.message);
            alert("Failed to delete notifications. Please try again later.");
        }
    };

    const markSelectedMessages = async () => {
        const selectedIds = notifications.filter(msg => msg.isSelected).map(msg => msg.id);

        try {
            for (const id of selectedIds) {
                const response = await api.put('/police/notifications/mark-as-read',
                    { notification_id: id },  // Send single ID as string
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if(response.status === 200) {
                    console.log("mark as read successfully");
                    window.location.reload();
                }
            }

            setNotifications(prev =>
                prev.map(msg => selectedIds.includes(msg.id) ? { ...msg, read_at: true } : msg)
            );

        } catch (error) {
            console.error('Mark as read error:', error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to mark notifications as read");
        }
    };

    const deleteAllMessages = async () => {
        try {
            const response = await api.delete('/police/notifications/delete-all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.status === 200){
                console.log("All notifications are deleted successfully");
                setNotifications([]);
            }
        } catch (err) {
            console.error("Error deleting all messages:", err);
        }
    };

    const markAllMessages = async () => {
        try {
            const response = await api.put('/police/notifications/mark-all-as-read', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.status === 200){
                console.log("All notifications are mark as read successfully");
                setNotifications(prev => prev.map(msg => ({ ...msg, read_at: true })));
            }

        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    useEffect(() => {
        const anySelected = notifications.some(item => item.isSelected);
        setSelectOptions(anySelected);
    }, [notifications]);

    const openMessageModal = (msg) => {
        setSelectedMessage(msg);
    };

    const closeModal = () => {
        setSelectedMessage(null);
    };

    return (
        <>
            {selectedMessage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <p><strong>Message</strong></p>
                        <div className="warning-box">
                            <p>{selectedMessage.data.message}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>
                                Back
                            </button>
                            <button className="btn-confirm" onClick={() => {
                                toggleSelectMessage(selectedMessage.id);
                                deleteSelectedMessages();
                                markSelectedMessages();
                                closeModal();
                            }}>
                                Delete Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='fines-list'>
                <div className="search-section container" style={{ backgroundColor: "#d3e2fd", borderRadius: "10px", padding: "0px" }}>
                    <div className="d-flex align-content-center">
                        <h5 className="fw-bold d-flex justify-content-start" style={{ margin: "7px" }}>
                            All Notifications
                        </h5>
                        <button
                            className="me-lg-3 rounded p-2 d-flex justify-content-end align-items-center border-0"
                            style={{ width: "fit-content", height: "fit-content", backgroundColor: "#d3e2fd" }}
                            onClick={handleCheckboxClickTodayIssued}
                        >
                            <FontAwesomeIcon icon={faCircleCheck} className="fs-3" />
                        </button>
                        <button
                            className="me-lg-3 rounded px-3 py-2 d-flex justify-content-end align-items-center border-0"
                            style={{width: "fit-content", height: "fit-content", backgroundColor: "#d3e2fd"}}
                            onClick={() => setShowOptions(prev => !prev)}
                        >
                            <FontAwesomeIcon icon={faEllipsisVertical} className="fs-3" />
                        </button>
                    </div>

                    <ul className="list-group list-group-flush d-flex" style={{ maxHeight: "75vh", borderRadius: "10px" }}>
                        {notifications.length === 0  ? (
                                <li className="list-group-item text-center text-muted">
                                    You do not have any notifications.
                                </li>
                            ):
                            (
                                notifications.map((item) => (
                                    <li key={item.id} className="list-group-item d-flex w-100">
                                        {showCheckbox && (
                                            <input
                                                type="checkbox"
                                                checked={item.isSelected || false}
                                                onChange={() => toggleSelectMessage(item.id)}
                                                className="me-1"
                                                style={{ width: "5%" }}
                                            />
                                        )}
                                        <button
                                            className="d-flex justify-content-between w-100 border-0 bg-white text-li"
                                            style={{ textAlign: "start" }}
                                            onClick={() => openMessageModal(item)}
                                        >
                                            <span className={`d-flex justify-content-start ${item.read_at ? "text-muted" : "text-dark"}`}>
                                                {item.data.message.length > 50 ? item.data.message.slice(0, 50) + '...' : item.data.message}
                                            </span>
                                            {(() => {
                                                const createdDate = new Date(item.created_at);
                                                return (
                                                    <span className="text-muted small justify-content-end text-end">
                                                            {createdDate.toLocaleTimeString()}  {createdDate.toLocaleDateString()}
                                                        </span>
                                                );
                                            })()}
                                        </button>
                                    </li>
                                ))
                            )
                        }

                    </ul>
                </div>
            </div>

            {showOptions && (
                <div className='notification-options row'>
                    <div className="search-section container w-25"
                         style={{backgroundColor: "#d3e2fd", borderRadius: "10px", padding: "0px"}}>
                        <ul className="list-group list-group-flush d-flex"
                            style={{maxHeight: "75vh", borderRadius: "10px"}}>
                            {selectOptions ? (
                                <>
                                    <li className="list-group-item d-flex bg-light">
                                        <button className="d-flex border-0 bg-light w-100" onClick={markSelectedMessages}>
                                            <span className="d-flex justify-content-start align-content-center mt-1"
                                                  style={{width: "15%", textAlign: "center"}}>
                                                <FontAwesomeIcon icon={faMessage} />
                                            </span>
                                            <span className="d-flex justify-content-start align-content-center">Mark Selected as Read</span>
                                        </button>
                                    </li>
                                    <li className="list-group-item d-flex bg-light">
                                        <button className="d-flex border-0 bg-light w-100" onClick={deleteSelectedMessages}>
                                            <span className="d-flex justify-content-start align-content-center mt-1"
                                                  style={{width: "15%", textAlign: "center"}}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>
                                            <span className="d-flex justify-content-start align-content-center">Delete Selected</span>
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="list-group-item d-flex bg-light">
                                        <button className="d-flex border-0 bg-light w-100" onClick={markAllMessages}>
                                            <span className="d-flex justify-content-start align-content-center mt-1"
                                                  style={{width: "15%", textAlign: "center"}}>
                                                <FontAwesomeIcon icon={faMessage} />
                                            </span>
                                            <span className="d-flex justify-content-start align-content-center">Mark All as Read</span>
                                        </button>
                                    </li>
                                    <li className="list-group-item d-flex bg-light">
                                        <button className="d-flex border-0 bg-light w-100" onClick={deleteAllMessages}>
                                            <span className="d-flex justify-content-start align-content-center mt-1"
                                                  style={{width: "15%", textAlign: "center"}}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>
                                            <span className="d-flex justify-content-start align-content-center">Delete All Notifications</span>
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

export default SuperAdminMessages
