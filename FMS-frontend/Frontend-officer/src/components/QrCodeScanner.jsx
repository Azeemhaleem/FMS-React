import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

function QrCodeScanner({ setScanResult }) {
    const scannerRef = useRef(null);
    const [startScan, setStartScan] = useState(false);

    useEffect(() => {
        // cleanup if component unmounts or scan stopped
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err =>
                    console.warn("Failed to clear scanner:", err)
                );
                scannerRef.current = null;
            }
        };
    }, []);

    // Function to start scanning manually
    const startScanning = () => {
        setStartScan(true); // render the container first
        setTimeout(() => {
            if (!scannerRef.current) {
                scannerRef.current = new Html5QrcodeScanner(
                    "render",
                    { qrbox: { width: 500, height: 500 }, fps: 5 },
                    false
                );

                scannerRef.current.render(
                    (result) => {
                        setScanResult(result);
                    },
                    (error) => {
                        console.warn(error);
                    }
                );
            }
        }, 0); // ensure container is in DOM before render()
    };

    return (
        <div>
            {startScan ? (
                <div id="render"></div>
            ) : (
                <button
                    onClick={startScanning}
                    className="btn btn-dark p-4 sliding-btn fs-6"
                    id="scan"
                >
                    Press here to Start Scanning
                </button>
            )}
        </div>
    );
}

export default QrCodeScanner;