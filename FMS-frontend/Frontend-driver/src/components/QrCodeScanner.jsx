import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import QrImage from "../assets/Qr Code.svg.png";

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
                <div className="d-flex flex-column justify-content-center align-content-center">
                    <div className="" id="render"></div>
                </div>

            ) : (
                <div className="d-flex flex-column w-100 justify-content-center align-items-center">
                    <button
                        onClick={startScanning}
                        className="w-50 mb-2"
                        id="scan">
                        <img src={QrImage} alt=""/>
                    </button>
                    <p className="d-flex justify-content-center align-content-center">Press the Qr Image to Start Scanning</p>
                </div>
            )}
        </div>
    );
}

export default QrCodeScanner;
