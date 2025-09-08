// import React, { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheck, faCircleCheck, faEllipsisVertical, faMessage, faTrash } from '@fortawesome/free-solid-svg-icons';
// import api from "../api/axios.jsx";
// import { useNavigate } from "react-router-dom";
// import "./Officer-styles.css";
//
// function Notifications() {
//     const token = localStorage.getItem('token');
//     const [notifications, setNotifications] = useState([]);
//     const [showCheckbox, setShowCheckbox] = useState(false);
//     const [selectOptions, setSelectOptions] = useState(false);
//     const [showOptions, setShowOptions] = useState(false);
//     const [selectedMessage, setSelectedMessage] = useState(null); // for modal
//     const navigate = useNavigate();
//
//     // Fetch notifications on load
//     useEffect(() => {
//         if (!token) {
//             navigate('/loginPolice');
//         } else {
//             fetchNotifications();
//         }
//     }, [navigate]);
//
//     const [loading, setLoading] = useState(false);
//
//     const fetchNotifications = async () => {
//         try {
//             setLoading(true);
//             const response = await api.get('/police/notifications/all', {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if(response.status === 200) {
//                 setNotifications(response.data);
//             }
//         } catch (err) {
//             console.error("Failed to fetch notifications", err);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleCheckboxClickTodayIssued = () => {
//         setShowCheckbox(!showCheckbox);
//     };
//
//     const toggleSelectMessage = (id) => {
//         setNotifications(prev =>
//             prev.map(msg => msg.id === id ? { ...msg, isSelected: !msg.isSelected } : msg)
//         );
//     };
//
//     const deleteSelectedMessages = async () => {
//         const selectedIds = notifications.filter(msg => msg.isSelected).map(msg => msg.id);
//
//         try {
//             for (const id of selectedIds) {
//                 await api.delete('/police/notifications/delete', {
//                     data: { notification_id: id },
//                     headers: { 'Authorization': `Bearer ${token}` }
//                 });
//             }
//
//             setNotifications(prev => prev.filter(msg => !msg.isSelected));
//             setShowCheckbox(false);
//
//         } catch (error) {
//             console.error('Notification delete error:', error.response?.data || error.message);
//             alert("Failed to delete notifications. Please try again later.");
//         }
//     };
//
//     const markSelectedMessages = async () => {
//         const selectedIds = notifications.filter(msg => msg.isSelected).map(msg => msg.id);
//
//         try {
//             for (const id of selectedIds) {
//                 const response = await api.put('/police/notifications/mark-as-read',
//                     { notification_id: id },  // Send single ID as string
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 );
//                 if(response.status === 200) {
//                     console.log("mark as read successfully");
//                     window.location.reload();
//                 }
//             }
//
//             setNotifications(prev =>
//                 prev.map(msg => selectedIds.includes(msg.id) ? { ...msg, read_at: true } : msg)
//             );
//
//         } catch (error) {
//             console.error('Mark as read error:', error.response?.data || error.message);
//             alert(error.response?.data?.message || "Failed to mark notifications as read");
//         }
//     };
//
//     const deleteAllMessages = async () => {
//         try {
//             const response = await api.delete('/police/notifications/delete-all', {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if(response.status === 200){
//                 console.log("All notifications are deleted successfully");
//                 setNotifications([]);
//             }
//         } catch (err) {
//             console.error("Error deleting all messages:", err);
//         }
//     };
//
//     const markAllMessages = async () => {
//         try {
//             const response = await api.put('/police/notifications/mark-all-as-read', {}, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if(response.status === 200){
//                 console.log("All notifications are mark as read successfully");
//                 setNotifications(prev => prev.map(msg => ({ ...msg, read_at: true })));
//             }
//
//         } catch (err) {
//             console.error("Error marking all as read:", err);
//         }
//     };
//
//     useEffect(() => {
//         const anySelected = notifications.some(item => item.isSelected);
//         setSelectOptions(anySelected);
//     }, [notifications]);
//
//     const openMessageModal = (msg) => {
//         setSelectedMessage(msg);
//     };
//
//     const closeModal = () => {
//         setSelectedMessage(null);
//     };
//
//     return (
//         <>
//             {selectedMessage && (
//                 <div className="modal-overlay" onClick={closeModal}>
//                     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                         <p><strong>Message</strong></p>
//                         <div className="warning-box">
//                             <p>{selectedMessage.data.message}</p>
//                         </div>
//                         <div className="modal-actions">
//                             <button className="btn-cancel" onClick={closeModal}>
//                                 Back
//                             </button>
//                             <button className="btn-confirm" onClick={() => {
//                                 toggleSelectMessage(selectedMessage.id);
//                                 deleteSelectedMessages();
//                                 markSelectedMessages();
//                                 closeModal();
//                             }}>
//                                 Delete Message
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//
//             <div className='fines-list'>
//                 <div className="search-section container" style={{ backgroundColor: "#d3e2fd", borderRadius: "10px", padding: "0px" }}>
//                     <div className="d-flex align-content-center">
//                         <h5 className="fw-bold d-flex justify-content-start" style={{ margin: "7px" }}>
//                             All Notifications
//                         </h5>
//                         <button
//                             className="me-lg-3 rounded p-2 d-flex justify-content-end align-items-center border-0"
//                             style={{ width: "fit-content", height: "fit-content", backgroundColor: "#d3e2fd" }}
//                             onClick={handleCheckboxClickTodayIssued}
//                         >
//                             <FontAwesomeIcon icon={faCircleCheck} className="fs-3" />
//                         </button>
//                         <button
//                             className="me-lg-3 rounded px-3 py-2 d-flex justify-content-end align-items-center border-0"
//                             style={{width: "fit-content", height: "fit-content", backgroundColor: "#d3e2fd"}}
//                             onClick={() => setShowOptions(prev => !prev)}
//                         >
//                             <FontAwesomeIcon icon={faEllipsisVertical} className="fs-3" />
//                         </button>
//                     </div>
//
//                     <ul className="list-group list-group-flush d-flex" style={{ maxHeight: "75vh", borderRadius: "10px" }}>
//                             {notifications.length === 0  ? (
//                                     <li className="list-group-item text-center text-muted">
//                                         You do not have any notifications.
//                                     </li>
//                                 ):
//                                 (
//                                 notifications.map((item) => (
//                                         <li key={item.id} className="list-group-item d-flex w-100">
//                                             {showCheckbox && (
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={item.isSelected || false}
//                                                     onChange={() => toggleSelectMessage(item.id)}
//                                                     className="me-1"
//                                                     style={{ width: "5%" }}
//                                                 />
//                                             )}
//                                             <button
//                                                 className="d-flex justify-content-between w-100 border-0 bg-white text-li"
//                                                 style={{ textAlign: "start" }}
//                                                 onClick={() => openMessageModal(item)}
//                                             >
//                                             <span className={`d-flex justify-content-start ${item.read_at ? "text-muted" : "text-dark"}`}>
//                                                 {item.data.message.length > 50 ? item.data.message.slice(0, 50) + '...' : item.data.message}
//                                             </span>
//                                                 {(() => {
//                                                     const createdDate = new Date(item.created_at);
//                                                     return (
//                                                         <span className="text-muted small justify-content-end text-end">
//                                                             {createdDate.toLocaleTimeString()}  {createdDate.toLocaleDateString()}
//                                                         </span>
//                                                     );
//                                                 })()}
//                                             </button>
//                                         </li>
//                                         ))
//                                 )
//                         }
//
//                     </ul>
//                 </div>
//             </div>
//
//             {showOptions && (
//                 <div className='notification-options row'>
//                     <div className="search-section container w-25"
//                          style={{backgroundColor: "#d3e2fd", borderRadius: "10px", padding: "0px"}}>
//                         <ul className="list-group list-group-flush d-flex"
//                             style={{maxHeight: "75vh", borderRadius: "10px"}}>
//                             {selectOptions ? (
//                                 <>
//                                     <li className="list-group-item d-flex bg-light">
//                                         <button className="d-flex border-0 bg-light w-100" onClick={markSelectedMessages}>
//                                             <span className="d-flex justify-content-start align-content-center mt-1"
//                                                   style={{width: "15%", textAlign: "center"}}>
//                                                 <FontAwesomeIcon icon={faMessage} />
//                                             </span>
//                                             <span className="d-flex justify-content-start align-content-center">Mark Selected as Read</span>
//                                         </button>
//                                     </li>
//                                     <li className="list-group-item d-flex bg-light">
//                                         <button className="d-flex border-0 bg-light w-100" onClick={deleteSelectedMessages}>
//                                             <span className="d-flex justify-content-start align-content-center mt-1"
//                                                   style={{width: "15%", textAlign: "center"}}>
//                                                 <FontAwesomeIcon icon={faTrash} />
//                                             </span>
//                                             <span className="d-flex justify-content-start align-content-center">Delete Selected</span>
//                                         </button>
//                                     </li>
//                                 </>
//                             ) : (
//                                 <>
//                                     <li className="list-group-item d-flex bg-light">
//                                         <button className="d-flex border-0 bg-light w-100" onClick={markAllMessages}>
//                                             <span className="d-flex justify-content-start align-content-center mt-1"
//                                                   style={{width: "15%", textAlign: "center"}}>
//                                                 <FontAwesomeIcon icon={faMessage} />
//                                             </span>
//                                             <span className="d-flex justify-content-start align-content-center">Mark All as Read</span>
//                                         </button>
//                                     </li>
//                                     <li className="list-group-item d-flex bg-light">
//                                         <button className="d-flex border-0 bg-light w-100" onClick={deleteAllMessages}>
//                                             <span className="d-flex justify-content-start align-content-center mt-1"
//                                                   style={{width: "15%", textAlign: "center"}}>
//                                                 <FontAwesomeIcon icon={faTrash} />
//                                             </span>
//                                             <span className="d-flex justify-content-start align-content-center">Delete All Notifications</span>
//                                         </button>
//                                     </li>
//                                 </>
//                             )}
//                         </ul>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }
//
// export default Notifications;


import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { CheckCircle, MoreVertical, MessageSquare, Trash2, X, AlertCircle } from 'lucide-react';

// API Service
const createNotificationsApi = (token) => ({
    async getAll() {
        const response = await fetch('/police/notifications/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    async markAsRead(ids) {
        const promises = ids.map(id =>
            fetch('/police/notifications/mark-as-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notification_id: id })
            })
        );
        await Promise.all(promises);
    },

    async markAllAsRead() {
        const response = await fetch('/police/notifications/mark-all-as-read', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to mark all as read');
    },

    async delete(ids) {
        const promises = ids.map(id =>
            fetch('/police/notifications/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notification_id: id })
            })
        );
        await Promise.all(promises);
    },

    async deleteAll() {
        const response = await fetch('/police/notifications/delete-all', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete all notifications');
    }
});

// State reducer for complex state management
const notificationReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_NOTIFICATIONS':
            return { ...state, notifications: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'TOGGLE_CHECKBOX':
            return { ...state, showCheckbox: !state.showCheckbox };
        case 'TOGGLE_OPTIONS':
            return { ...state, showOptions: !state.showOptions };
        case 'SELECT_MESSAGE':
            return { ...state, selectedMessage: action.payload };
        case 'TOGGLE_SELECT':
            return {
                ...state,
                notifications: state.notifications.map(notification =>
                    notification.id === action.payload
                        ? { ...notification, isSelected: !notification.isSelected }
                        : notification
                ),
            };
        case 'MARK_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map(notification =>
                    action.payload.includes(notification.id)
                        ? { ...notification, read_at: true, isSelected: false }
                        : notification
                ),
            };
        case 'DELETE_NOTIFICATIONS':
            return {
                ...state,
                notifications: state.notifications.filter(
                    notification => !action.payload.includes(notification.id)
                ),
                showCheckbox: false,
            };
        default:
            return state;
    }
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center py-4">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
    <div className="alert alert-danger d-flex align-items-center my-3" role="alert">
        <div className="d-flex align-items-center justify-content-start">
            <AlertCircle className="" size={20} style={{width:"10%"}}/>
            <div>{message}</div>
        </div>

        <div className="flex-grow-1 justify-content-end w-25">
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn btn-link p-0 text-danger text-decoration-underline mt-1"
                >
                    Try again
                </button>
            )}
        </div>
    </div>
);

// Notification Header Component
const NotificationHeader = ({ onToggleCheckbox, onToggleOptions }) => (
    <div className="bg-primary bg-opacity-10 p-3 rounded-top">
        <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-dark">All Notifications</h5>

            <div className="d-flex gap-2 justify-content-end">
                <button
                    onClick={onToggleCheckbox}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center py-1"
                    title="Select notifications" style={{width:"15%"}}
                >
                    <CheckCircle size={18} />
                </button>

                <button
                    onClick={onToggleOptions}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center py-1" style={{width:"15%"}}
                    title="More options"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    </div>
);

// Notification Item Component
const NotificationItem = ({ notification, showCheckbox, onToggleSelect, onOpenModal }) => {
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString(),
        };
    };

    const { time, date } = formatDateTime(notification.created_at);
    const truncatedMessage = notification.data.message.length > 50
        ? `${notification.data.message.slice(0, 50)}...`
        : notification.data.message;

    return (
        <li className="list-group-item border-0 border-bottom p-0">
            <div className="d-flex align-items-center p-3 hover-bg-light">
                {showCheckbox && (
                    <div className="form-check me-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={notification.isSelected || false}
                            onChange={() => onToggleSelect(notification.id)}
                        />
                    </div>
                )}

                <button
                    onClick={() => onOpenModal(notification)}
                    className="btn btn-link text-start p-0 flex-grow-1 text-decoration-none"
                >
                    <div className="d-flex justify-content-between align-items-center w-100">
            <span className={`flex-grow-1 ${notification.read_at ? 'text-muted' : 'text-dark fw-medium'}`}>
              {truncatedMessage}
            </span>

                        <div className="text-end ms-3">
                            <div className="small text-muted">{time}</div>
                            <div className="small text-muted">{date}</div>
                        </div>
                    </div>
                </button>
            </div>
        </li>
    );
};

// Notification Options Component
const NotificationOptions = ({
                                 hasSelectedItems,
                                 onMarkSelectedAsRead,
                                 onDeleteSelected,
                                 onMarkAllAsRead,
                                 onDeleteAll,
                             }) => {
    const options = hasSelectedItems
        ? [
            { icon: MessageSquare, label: 'Mark Selected as Read', action: onMarkSelectedAsRead },
            { icon: Trash2, label: 'Delete Selected', action: onDeleteSelected },
        ]
        : [
            { icon: MessageSquare, label: 'Mark All as Read', action: onMarkAllAsRead },
            { icon: Trash2, label: 'Delete All Notifications', action: onDeleteAll },
        ];

    return (
        <div className="position-absolute end-0 mt-2 bg-white rounded shadow border" style={{ zIndex: 1050, minWidth: '250px' }}>
            <div className="list-group list-group-flush">
                {options.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                        <button
                            key={index}
                            onClick={option.action}
                            className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0"
                        >
                            <IconComponent size={16} className="text-secondary" />
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Notification Modal Component
const NotificationModal = ({ notification, onClose, onDelete }) => {
    const handleDelete = () => {
        onDelete([notification.id]);
        onClose();
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Message</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="alert alert-warning">
                            <p className="mb-0">{notification.data.message}</p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            Delete Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Notifications Component
const Notifications = () => {
    const token = localStorage.getItem('token');
    const api = useMemo(() => createNotificationsApi(token), [token]);

    const initialState = {
        notifications: [],
        loading: false,
        error: null,
        showCheckbox: false,
        showOptions: false,
        selectedMessage: null,
    };

    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const {
        notifications,
        loading,
        error,
        showCheckbox,
        showOptions,
        selectedMessage,
    } = state;

    // Memoized calculations
    const selectedIds = useMemo(
        () => notifications.filter(n => n.isSelected).map(n => n.id),
        [notifications]
    );

    const hasSelectedItems = selectedIds.length > 0;

    // API Functions
    const fetchNotifications = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const data = await api.getAll();
            dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch notifications' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [api]);

    const markAsRead = useCallback(async (ids) => {
        try {
            await api.markAsRead(ids);
            dispatch({ type: 'MARK_AS_READ', payload: ids });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notifications as read' });
        }
    }, [api]);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.markAllAsRead();
            const allIds = notifications.map(n => n.id);
            dispatch({ type: 'MARK_AS_READ', payload: allIds });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
        }
    }, [api, notifications]);

    const deleteNotifications = useCallback(async (ids) => {
        try {
            await api.delete(ids);
            dispatch({ type: 'DELETE_NOTIFICATIONS', payload: ids });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notifications' });
        }
    }, [api]);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await api.deleteAll();
            dispatch({ type: 'DELETE_NOTIFICATIONS', payload: notifications.map(n => n.id) });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete all notifications' });
        }
    }, [api, notifications]);

    // Event Handlers
    const toggleSelect = useCallback((id) => {
        dispatch({ type: 'TOGGLE_SELECT', payload: id });
    }, []);

    const toggleCheckbox = useCallback(() => {
        dispatch({ type: 'TOGGLE_CHECKBOX' });
    }, []);

    const toggleOptions = useCallback(() => {
        dispatch({ type: 'TOGGLE_OPTIONS' });
    }, []);

    const selectMessage = useCallback((notification) => {
        dispatch({ type: 'SELECT_MESSAGE', payload: notification });
    }, []);

    const handleMarkSelectedAsRead = useCallback(() => {
        if (selectedIds.length > 0) {
            markAsRead(selectedIds);
        }
    }, [selectedIds, markAsRead]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.length > 0) {
            deleteNotifications(selectedIds);
        }
    }, [selectedIds, deleteNotifications]);

    // Effects
    useEffect(() => {
        if (!token) {
            // Handle redirect to login if needed
            console.warn('No token found');
            return;
        }
        fetchNotifications();
    }, [token, fetchNotifications]);

    // Close options dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showOptions) {
                toggleOptions();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showOptions, toggleOptions]);

    return (
        <div className="container-fluid px-4">
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={fetchNotifications}
                />
            )}

            <div className="card shadow-sm">
                <div className="position-relative">
                    <NotificationHeader
                        onToggleCheckbox={toggleCheckbox}
                        onToggleOptions={toggleOptions}
                    />

                    {showOptions && (
                        <NotificationOptions
                            hasSelectedItems={hasSelectedItems}
                            onMarkSelectedAsRead={handleMarkSelectedAsRead}
                            onDeleteSelected={handleDeleteSelected}
                            onMarkAllAsRead={markAllAsRead}
                            onDeleteAll={deleteAllNotifications}
                        />
                    )}
                </div>

                <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <p className="mb-0">You do not have any notifications.</p>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    showCheckbox={showCheckbox}
                                    onToggleSelect={toggleSelect}
                                    onOpenModal={selectMessage}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedMessage && (
                <NotificationModal
                    notification={selectedMessage}
                    onClose={() => selectMessage(null)}
                    onDelete={deleteNotifications}
                />
            )}

            <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
        </div>
    );
};

export default Notifications;