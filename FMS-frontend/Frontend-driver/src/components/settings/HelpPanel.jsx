// src/Components-driver/settings/HelpPanel.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaMailBulk, FaFilePdf } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import HelpItem from "../../components/HelpItem.jsx";

export default function HelpPanel({ basePath }) {
  return (
    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
      <h4 className="card-title mb-3 fw-bold p-3">
        <Link to={`${basePath}`} className="me-2 text-decoration-none">←</Link>
        Help & Support
      </h4>

      <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <h5 className="ms-lg-5 ps-4 fw-bold mb-2">Help</h5>
          <ul className="list-group list-group-flush mb-4">
            <HelpItem icon={<FaFilePdf />} label="Download User Support document" href="#" />
          </ul>
          <hr />
          <h5 className="ms-lg-5 ps-4 fw-bold my-4">Get Support from Our team</h5>
          <ul className="list-group list-group-flush">
            <HelpItem icon={<FaMailBulk />} label="Email" bar href="mailto:azeemhaleem451@gmail.com" />
            <HelpItem icon={<FaWhatsapp />} label="WhatsApp" bar href="https://wa.me/94703622543" />
            <HelpItem icon={<FaFacebook />} label="Facebook" bar href="https://web.facebook.com" />
            <HelpItem icon={<FaInstagram />} label="Instagram" bar href="https://web.instagram.com" />
          </ul>
        </div>
      
    </div>
  );
}
