import { Html5QrcodeScanner } from "html5-qrcode";
import React, { useEffect, useRef } from "react";

function QrCodeScanner({ setScanResult }) {
    const scannerRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (isInitialized.current) {
            return;
        }

        // Mark as initialized immediately
        isInitialized.current = true;

        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            'render',
            {
                qrbox: { width: 500, height: 500 },
                fps: 5,
            },
            false
        );

        scannerRef.current = scanner;

        // Start scanning
        scanner.render(
            (result) => {
                setScanResult(result);
            },
            (error) => {
                console.warn(error);
            }
        );

        // Cleanup function
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err =>
                    console.warn('Failed to clear scanner:', err)
                );
                scannerRef.current = null;
                isInitialized.current = false;
            }
        };
    }, []); // Empty dependency array - only run once

    return (
        <div>
            <div id="render"></div>
        </div>
    );
}

export default QrCodeScanner;