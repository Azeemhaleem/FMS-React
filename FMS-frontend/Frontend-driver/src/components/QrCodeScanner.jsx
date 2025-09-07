import { Html5QrcodeScanner } from "html5-qrcode";
import React, { useEffect, useRef } from "react";

function QrCodeScanner({ setScanResult }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize scanner but don't start it automatically
        scannerRef.current = new Html5QrcodeScanner(
            'render',
            {
                qrbox: { width: 500, height: 500 },
                fps: 5,
            },
            false // verbose = false
        );

        // Cleanup function
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err =>
                    console.warn('Failed to clear scanner:', err)
                );
            }
        };
    }, [setScanResult]);

    // Function to start scanning manually
    const startScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.render(
                (result) => {
                    setScanResult(result);
                },
                (error) => {
                    console.warn(error);
                }
            );
        }
    };
    useEffect(() => {
        return () => {
            startScanning();
        }
    }, []);

    return (
        <div>
            <div id="render"></div>
        </div>
    );
}

export default QrCodeScanner;