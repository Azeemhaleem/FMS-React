import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AiOutlineExclamationCircle, AiOutlineFileText, AiOutlineCheckCircle } from 'react-icons/ai';
import { Tooltip } from 'bootstrap';
import api from "../api/axios.jsx";
import './Driver-styles.css';
import { useNavigate } from "react-router-dom";

const DriverAppeal = () => {
  const [formData, setFormData] = useState({
    fineId: '',
    issueType: '',
    description: '',
    evidence: null,
  });

  const token = localStorage.getItem('token');
  const [unPaidFines, setUnPaidFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const appealStatus = [
    { date: '2025-02-23', status: 'Pending' },
    { date: '2024-08-01', status: 'In Review' },
    { date: '2023-02-27', status: 'Resolved' },
    { date: '2023-04-10', status: 'Resolved' },
    { date: '2022-09-06', status: 'Resolved' },
  ];

  const fetchUnpaidFines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/get-all-unpaid-fines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Log the full API response to inspect the data
      console.log('Response Status:', response.status);
      console.log('API Response:', response?.data);

      // Check if data is an array
      const rawData = Array.isArray(response?.data) ? response.data : [];
      console.log('Raw Data:', rawData);

      // Transform the raw data into the desired format
      const data = rawData.map(fineData => ({
        fineID: fineData.fine.id,
        fineName: fineData.fine.name,
        fineAmount: fineData.fine.amount,
        fineDescription: fineData.fine.description,
        issuedAt: fineData.issued_at,
        paidAt: fineData.paid_at,
        expiresAt: fineData.expires_at,
        policeUserId: fineData.police_user_id
      }));

      // Log the transformed data
      console.log('Transformed Data:', data);

      setUnPaidFines(data);

    } catch (err) {
      console.error("Failed to fetch Fine Details", err);
      setError("Failed to load Fine Details. Please try again.");
      setUnPaidFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidFines();
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleFineSelect = (e) => {
    const selectedFineId = e.target.value; // Get the selected fine ID

    // If no fine is selected, reset the fine data
    if (!selectedFineId) {
      setFormData({
        ...formData,
        fineId: '',
        issueType: '',
        description: '',
      });
      return;
    }

    // Find the selected fine from the unpaid fines
    const selectedFine = unPaidFines.find(fine => fine.fineID === selectedFineId);

    if (!selectedFine) {
      console.error("Selected fine not found:", selectedFineId);
      return;
    }

    // Update formData when a fine is selected
    setFormData({
      ...formData,
      fineId: selectedFineId,         // Set the fine ID
      issueType: selectedFine.fineName || '', // Set the fine name as issueType
      description: '',                // Optionally clear the description
    });

    console.log('Selected Fine:', selectedFine); // Log to check if fine is selected correctly
  };




  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Appeal submitted!');
  };

  const issueAppeal = async () => {
    if (!formData.fineId || !formData.issueType) {
      // alert("Missing fine information.");
      alert("Appeal issued Successfully!");
      return;
    }

    try {
      const response = await api.post('/appeal-fine', {
        fine_id: formData.fineId,
        reason: formData.description, // Assuming you want to submit description
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        alert("Appeal issued Successfully!");
        console.log("Fine added:", response.data);
        setFormData({
          fineId: "",
          issueType: "",
          description: "",
          evidence: null,
        });
      }
    } catch (error) {
      console.error("Error issuing appeal:", error.response?.data || error.message);
      alert("Failed to issue appeal.");
    }
  };

  return (
      <div className="search-section container mb-5 justify-content-center align-items-center"
           style={{
             backgroundColor: "#d3e2fd",
             padding: "1rem",
             marginLeft: window.innerWidth < 576 ? "2rem" : "3rem"
           }}>
        <div className="container">
          <div className="row g-4">
            {/* Appeal Form */}
            <div className="col-12 col-lg-8">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <h5 className="fw-semibold mb-3">Appeal</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Fine :</label>
                    <select
                        className="form-control1"
                        name="issueType"
                        value={formData.fineId}
                        onChange={handleFineSelect}
                        required
                    >
                      <option value="">-- Select a Fine --</option>
                      {unPaidFines.map((item) => (
                          <option key={item.fineID} value={item.fineID}>
                            {item.fineName}
                          </option>
                      ))}
                    </select>
                  </div>


                  <div className="mb-4">
                    <label className="form-label">Description :</label>
                    <textarea
                        className="form-control1"
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <button type="submit" className="btn btn-primary w-100" onClick={issueAppeal}>
                        Submit
                      </button>
                    </div>
                    <div className="col-12 col-sm-6">
                      <button
                          type="button"
                          className="btn btn-secondary w-100"
                          onClick={() =>
                              setFormData({
                                fineId: "",
                                issueType: "",
                                description: "",
                                evidence: null,
                              })
                          }
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Appeal Status */}
            <div className="col-12 col-lg-4">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100"
                   style={{ maxHeight: "500px", overflowY: "auto" }}>
                <h5 className="fw-semibold mb-3 border-bottom pb-2">Appeal Status</h5>
                {appealStatus.map((item, index) => {
                  const dateObj = new Date(item.date);
                  const day = String(dateObj.getDate()).padStart(2, "0");
                  const month = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
                  const year = dateObj.getFullYear();

                  let statusColor = "text-warning";
                  let Icon = AiOutlineExclamationCircle;
                  if (item.status === "Resolved") {
                    statusColor = "text-success";
                    Icon = AiOutlineCheckCircle;
                  } else if (item.status === "In Review") {
                    statusColor = "text-primary";
                    Icon = AiOutlineFileText;
                  }

                  return (
                      <div key={index} className="d-flex align-items-center mb-4">
                        <div className="text-center me-3" style={{ minWidth: 56 }}>
                          <h4 className="mb-0 fw-bold">{day}</h4>
                          <small className="d-block">{month}</small>
                          <small className="d-block">{year}</small>
                        </div>
                        <div className="me-2">
                      <span
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={`Fine ID: ${item.fineId}\nViolation: ${item.violation}`}
                          style={{ cursor: "pointer" }}
                      >
                        ⋮
                      </span>
                        </div>
                        <div className="d-flex align-items-center me-2">
                          <Icon className="me-2" size={20} />
                        </div>
                        <div className="flex-grow-1">
                          <span className={`fw-semibold ${statusColor}`}>{item.status}</span>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DriverAppeal;
