import React from "react";

const Privacy = () => {
  return (
    <div className="container mt-5 p-4 bg-light rounded shadow-sm">
      <h2 className="mb-4">Privacy Policy</h2>
      <p>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information through the Fine Management System (FMS).
      </p>

      <h4 className="mt-4">Information We Collect</h4>
      <ul>
        <li>User identification details (e.g., NIC, license number)</li>
        <li>Fine-related data (violation type, amount, status)</li>
        <li>Payment details (secured and encrypted)</li>
        <li>Contact information (for sending notifications)</li>
      </ul>

      <h4 className="mt-4">How We Use Your Information</h4>
      <ul>
        <li>To issue and track fines</li>
        <li>To process secure payments</li>
        <li>To notify users about due or unpaid fines</li>
        <li>To generate reports for administrative use</li>
      </ul>

      <h4 className="mt-4">Data Protection</h4>
      <p>
        We take appropriate technical and organizational measures to protect your data. Access is restricted and encrypted where necessary.
      </p>

      <h4 className="mt-4">Third-Party Sharing</h4>
      <p>
        We do not sell or share your personal data with third parties except with authorized law enforcement bodies as required by law.
      </p>

      <p className="mt-4">
        By using the Fine Management System, you agree to this policy. If you have any concerns, please contact our admin team.
      </p>
    </div>
  );
};

export default Privacy;
