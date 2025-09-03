import React, { useState } from "react";

function AdminAddNew() {

  const [fineID, setFineID] = useState("");
  const [fineName, setFineName] = useState("");
  const [amount, setAmount] = useState("");
  
  const handleAddFine = () => {
    console.log("Fine ID:", fineID);
    console.log("Fine Name:", fineName);
    console.log("Amount:", amount);
  
  };


  return (
    <>
    <div className='row'>
      <div className="search-section container" style={{ backgroundColor: "#d3e2fd",borderRadius: "10px",padding:"20px" }}>
      <h5 className="fw-bold" style={{margin:"7px"}}>
      Add New</h5>
      <div className="card p-4 mt-3" style={{ backgroundColor: "#f7f9fc", borderRadius: "15px" }}>
        <div className="mb-3">
          <label className="fw-semibold">Fine ID :</label>
          <input 
          type="text" 
          className="form-control input-field" 
          style={{borderRadius: "15px" }}
          value={fineID}
          onChange={(e) => setFineID(e.target.value)} // Update state
        />
          </div>

        <div className="mb-3">
          <label className="fw-semibold">Fine Name :</label>
          <input 
          type="text" 
          className="form-control input-field" 
          style={{borderRadius: "15px" }}
          value={fineName}
          onChange={(e) => setFineName(e.target.value)} // Update state
        />
        </div>

        <div className="mb-3">
          <label className="fw-semibold">Amount :</label>
          <input 
          type="text" 
          className="form-control input-field" 
          style={{borderRadius: "15px" }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)} // Update state
        />
        </div>
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-dark px-4 py-2" style={{ borderRadius: "20px" }} onClick={handleAddFine}>
          Add Fine
        </button>
      </div>
    </div>
    </div>
    </>
  )
}

export default AdminAddNew
