import React, { useEffect, useState } from 'react';

const OnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div
            title={isOnline ? 'Online' : 'Offline'}
            className={`online-status rounded-circle border shadow`}
            style={{
                width: "22px",
                height: "22px",
                backgroundColor: isOnline ? "#28a745" : "#dc3545",
                display: "inline-block",
            }}
        ></div>
    );
};

export default OnlineStatus;
