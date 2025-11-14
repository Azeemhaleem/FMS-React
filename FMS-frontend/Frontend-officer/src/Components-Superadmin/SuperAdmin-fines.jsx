import "./styles/driver-style.css";
import "./styles/fines.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";

function SuperAdminFines() {
  const [fineId, setFineId] = useState("");
  const [fineData, setFineData] = useState({
    name: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleSearch = async () => {
    if (!fineId) {
      setMessage("Please enter a Fine ID.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`get-fine-by-id/${fineId}`);
      const fine = response.data.fine;

      setFineData({
        name: fine.name,
        amount: fine.amount,
        description: fine.description,
      });

      setMessage("");
      setMessageType("");
    } catch (error) {
      setMessage("Fine not found!");
      setMessageType("error");
      setFineData({ name: "", amount: "", description: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!fineId) {
      setMessage("Please search or enter a Fine ID first.");
      setMessageType("error");
      return;
    }

    try {
      setLoadingUpdate(true);
      const response = await api.post("/update-fine", {
        fine_id: fineId,
        name: fineData.name,
        amount: fineData.amount,
        description: fineData.description,
      });

      setMessage(response.data.message || "Fine updated successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to update fine.");
      setMessageType("error");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    if (!fineId) {
      setMessage("Please search or enter a Fine ID first.");
      setMessageType("error");
      return;
    }

    try {
      setLoadingDelete(true);
      const response = await api.post("/delete-fine", {
        fine_id: fineId,
      });

      setMessage(response.data.message || "Fine deleted successfully!");
      setMessageType("success");
      setFineData({ name: "", amount: "", description: "" }); // clear form
      setFineId("");
    } catch (error) {
      setMessage("Failed to delete fine.");
      setMessageType("error");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="row">
      <div
        className="search-section container mb-5 justify-content-center align-items-center"
        style={{
          backgroundColor: "#d3e2fd",
          padding: "2rem",
          marginLeft: window.innerWidth < 576 ? "3rem" : "2rem",
          borderRadius: "1rem",
        }}
      >
        {/* Search Section */}
        <div className="d-flex justify-content-center mb-5" style={{ gap: "5px" }}>
          <input
            type="text"
            className="form-control"
            value={fineId}
            placeholder="Enter Fine ID "
            onChange={(e) => setFineId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          
        </div>

        {/* Fine Form */}
        <div className="row g-3 mt-5 m-3">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Name"
              value={fineData.name}
              onChange={(e) =>
                setFineData({ ...fineData, name: e.target.value })
              }
            />
          </div>
          <div className="col-12 col-md-6">
            <input
              type="number"
              className="form-control shadow-sm"
              placeholder="Amount"
              value={fineData.amount}
              onChange={(e) =>
                setFineData({
                  ...fineData,
                  amount: parseFloat(e.target.value) || "",
                })
              }
            />
          </div>
          <div className="col-12">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Description"
              value={fineData.description}
              onChange={(e) =>
                setFineData({ ...fineData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row justify-content-center gap-2 mt-5 mb-4">
          <div className="col-12 col-sm-6 col-md-3 d-grid">
            <button
              onClick={handleUpdate}
              className="btn btn-primary"
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Updating..." : "Update Fine"}
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-3 d-grid">
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={loadingDelete}
            >
              {loadingDelete ? "Deleting..." : "Delete Fine"}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <p
            style={{
              color: messageType === "success" ? "green" : "red",
              marginTop: "15px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default SuperAdminFines;
