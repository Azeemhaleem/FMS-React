import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import "../Officer-styles.css";
import QrCodeScanner from "../../components/QrCodeScanner.jsx";

export default function ScanPage({ setScanResult }) {
    return (
        <div
            id="ScanPage"
            className="bg-white bg-opacity-25 p-3 rounded d-flex justify-content-center align-items-center mx-auto"
            style={{ width: "80%", height: "65vh" }}
        >
            <main className="w-100">
                <div className="container h-100 d-flex align-items-center">
                    <div className="row g-4 justify-content-center w-100">
                        <div className="col-12 col-lg-6 d-flex">
                            <div className="card shadow-sm w-100">
                                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                                    <div className="display-5 text-primary mb-3">
                                        <i className="bi bi-qr-code" />
                                    </div>
                                    <div
                                        className="help-content bg-white px-lg-4 d-flex justify-content-center align-items-center mx-auto mb-4"
                                        style={{ height: "35vh", width: "90%" }}
                                    >
                                        <QrCodeScanner setScanResult={setScanResult} />
                                    </div>
                                    <h3 className="card-title fw-semibold">Scan Driver License QR</h3>
                                    <p className="text-muted mb-1">
                                        Scan a driver&rsquo;s QR code to access license information
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6 d-flex">
                            <div className="card shadow-sm w-100">
                                <div className="card-body text-center">
                                    <div className="display-5 text-primary mb-3">
                                        <i className="bi bi-file-earmark-text" />
                                    </div>
                                    <a
                                        href="/assets/fines_list.pdf"
                                        download="fines_list.pdf"
                                        className="text-primary-emphasis text-decoration-none"
                                    >
                                        <div
                                            className="help-content bg-white px-lg-4 d-flex justify-content-center align-items-center mx-auto"
                                            style={{ height: "35vh", width: "85%" }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faFileLines}
                                                style={{ fontSize: "20vh" }}
                                                className="pdf-icon"
                                            />
                                        </div>
                                    </a>
                                    <h3 className="card-title fw-semibold mt-3">Check Fines Info</h3>
                                    <p className="text-muted mb-1">
                                        View driver&rsquo;s fines and payment history
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
