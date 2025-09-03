import React from "react";

const About = () => {
  return (
    <div className="container mt-5 p-4 bg-light rounded shadow-sm">
      <h2 className="mb-4">About Fine Management System</h2>
      <p>
        The <strong>Fine Management System (FMS)</strong> is an efficient digital solution designed to streamline the process of issuing, managing, and paying fines. Built to support both traffic authorities and citizens, FMS ensures transparency, convenience, and timely communication.
      </p>

      <h4 className="mt-4">Our Vision</h4>
      <p>
        To create a seamless and secure ecosystem for fine management in Sri Lanka, reducing paperwork, delays, and errors while improving public trust in law enforcement.
      </p>

      <h4 className="mt-4">Key Features</h4>
      <ul>
        <li>Digital fine issuance by officers</li>
        <li>Online fine payment and receipt generation</li>
        <li>Dispute resolution workflow</li>
        <li>Automated email/SMS reminders for pending fines</li>
        <li>Admin dashboard with analytics and reports</li>
      </ul>

      <p className="mt-4">
        Our system is developed by <strong>FinTech</strong> – a passionate group of Computer Science undergraduates from the University of Sri Jayewardenepura.
      </p>
    </div>
  );
};

export default About;
