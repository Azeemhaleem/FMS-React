import React, { useState } from "react";
import api from "../api/axios";

function SuperAdminAddNew() {


  const [fineID, setFineID] = useState("");
  const [fineName, setFineName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");  // Added description
  const [errorMessage, setErrorMessage] = useState("");  // State for error message
  const [successMessage, setSuccessMessage] = useState("");  // Optional state for success message

  const handleAddFine = async () => {  
    console.log("Fine ID:", fineID);
    console.log("Fine Name:", fineName);
    console.log("Amount:", amount);
    console.log("Description:", description);

    setErrorMessage("");  // Reset error message before making the request
    setSuccessMessage(""); // Reset success message before making the request

    try {
      const response = await api.post("/add-fine", {
        name: fineName,
        amount: amount,
        description: description,  // Send the description along with other data
      });

      console.log("Fine added successfully:", response.data);
      setSuccessMessage("Fine added successfully!");  // Set success message
      setFineName(''); 
      setAmount('');
      setDescription('');
      setFineID('');
    } catch (error) {
      console.error("Error adding fine:", error.response || error.message);

      if (error.response && error.response.data) {
        // Handle specific error response from backend
        setErrorMessage(error.response.data.messege || "An unexpected error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
     <div
          className="search-section d-flex container mb-5 justify-content-center align-items-center "
          style={{
            backgroundColor: "#d3e2fd",
            padding: "1rem",
            marginLeft: window.innerWidth < 576 ? "2rem" : "3rem"
  
          }}
      >
      
        <div className="col-md-7">
          <div style={{ margin:"2%" }}>
            <h5 className="fw-bold mb-3 text-center">Add New Fine</h5>
  
            <div className="card p-3 border-0" style={{ backgroundColor: "#ffffff" }}>
              <div className="mb-2 m-3 ">
                <label className="form-label small fw-semibold">Fine ID</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={fineID}
                  onChange={(e) => setFineID(e.target.value)}
                />
              </div>
  
              <div className="mb-2 m-3">
                <label className="form-label small fw-semibold">Fine Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={fineName}
                  onChange={(e) => setFineName(e.target.value)}
                />
              </div>
  
              <div className="mb-2 m-3 ">
                <label className="form-label small fw-semibold">Amount</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
  
              <div className="mb-2 m-3 ">
                <label className="form-label small fw-semibold">Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
  
              {successMessage && (
                <div className="alert alert-success mt-2 py-1 text-center">
                  {successMessage}
                </div>
              )}
  
              {errorMessage && (
                <div className="alert alert-danger mt-2 py-1 text-center">
                  {errorMessage}
                </div>
              )}
  
              <div className="text-center mt-4 mb-4">
                <button
                  className="btn btn-dark w-100 w-md-50"
                  style={{ borderRadius: "12px",  maxWidth: "300px" }}
                  onClick={handleAddFine}
                >
                  Add Fine
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
     
    </>
  );
  
}

export default SuperAdminAddNew;
