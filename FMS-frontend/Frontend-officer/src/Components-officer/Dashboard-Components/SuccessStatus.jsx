import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import "../Officer-styles.css";
import QrImage from '../Qr Code.svg.png'

export default function SuccessPage() {
    return (
        <div id="SuccessPage" className="d-flex justify-content-center align-items-center">
            <div className="row bg-white bg-opacity-75 p-3 rounded w-75 my-4">
                <h4>QR Code Scanned Successfully</h4>
                <div className="col-6">
                    <img src={QrImage} alt="QR Code Scanned Successfully" style={{ width: "65%" }} />
                </div>
                <div className="col-4 d-flex justify-content-center align-items-center">
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: "10vh" }} className="text-success" />
                </div>
            </div>
        </div>
    );
}
