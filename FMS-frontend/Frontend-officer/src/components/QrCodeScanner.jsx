import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

function QrCodeScanner({ setScanResult }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner('render', {
            qrbox: {
                width: 500,
                height: 500,
            },
            fps: 5,
        });

        scanner.render(success, error);

        function success(result) {
            scanner.clear();
            setScanResult(result);
        }

        function error(err) {
            console.warn(err);
        }

        return () => {
            scanner.clear().catch(err => console.warn('Failed to clear scanner:', err));
        };
    }, [setScanResult]);

    return <div id="render"></div>;
}

export default QrCodeScanner;
