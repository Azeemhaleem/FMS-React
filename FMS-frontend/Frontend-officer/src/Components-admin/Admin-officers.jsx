import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "../Components-Superadmin/styles/driver-style.css"

function AdminOfficers() {


  const [query, setQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showaddAccount, setshowaddAccount] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
 


  const [Officers, setOfficers] = useState([
    {
      OfficerID: "12345",
      OfficerName: "Sandali Shela",
      AssignedArea: "Matara",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      OfficerID: "3456",
      OfficerName: "Sarasi",
      AssignedArea: "Colombo",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      OfficerID: "5678",
      OfficerName: "Mohamad Azeem",
      AssignedArea: "Nuwara",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      OfficerID: "7890",
      OfficerName: "Rikaf",
      AssignedArea: "Colombo",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      OfficerID: "9012",
      OfficerName: "Sanjaya",
      AssignedArea: "Gampaha",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      OfficerID: "2345",
      OfficerName: "Chandira",
      AssignedArea: "Galle",
      Email: "syujkfdd@gmail.com",
      ContactNumber: "0708343242",
    },
  ]);

  const filteredOfficers = useMemo(() => {
    if (!query) return Officers;
    return Officers.filter((officer) => {
      const officerName = officer?.OfficerName?.toLowerCase() || '';  // Safe check for officerName
      const officerID = officer?.OfficerID || '';  // Safe check for officerID
      return officerName.includes(query.toLowerCase()) || officerID.includes(query);
    });
  }, [query, Officers]);

  const handleRowClick = (officer) => {
    setSelectedOfficer(officer);
  };

  const handleDelete = () => {
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setshowaddAccount(false);
  };
  const deleteOfficer = () => {
    setOfficers((prevOfficers) =>
      prevOfficers.filter((officer) => officer.OfficerID !== selectedOfficer.OfficerID)
    );
    setSelectedOfficer(null);
    setShowModal(false);
  };



  return (
    <div className="row">
      <div
        className="search-section container"
        style={{
          backgroundColor: "#d3e2fd",
        }}
    >
        
          <div className="d-flex justify-content-center mb-3" style={{ width: "100%" }}>
                  <div className="d-flex justify-content-center mb-3" style={{ marginTop:"2%",width:"85%"}}>
                      <input
                        type="text"
                        className="form-control"
                        value={query}
                        placeholder="Name / Officer Id"
                        style={{ fontSize: "small", width: "100%" }}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setSelectedOfficer(null);
                        }}
                      />
                      <button className="btn btn-info"  style={{ width: "5%", color: "white",marginLeft:"3px" }}>
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                    </div>
          </div>
      
        {!selectedOfficer&& (
          <div className="row">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Officer ID</th>
                  <th>Officer Name</th>
                  <th>Assigned Area</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.slice(0, 5).map((officer, index) => (
                  <tr key={index} onClick={() => handleRowClick(officer)} style={{ cursor: "pointer" }}>
                    <td>{officer.OfficerID}</td>
                    <td>{officer.OfficerName}</td>
                    <td>{officer.AssignedArea}</td>
                    <td>{officer.Email}</td>
                    <td>{officer.ContactNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
        )}
        

        {selectedOfficer && (
          <div className="row">
            <div className="card mt-4" style={{ backgroundColor: "#f7f9fc", padding: "20px", fontSize: "small" }}>
              <div>
                <span className="info-label">Officer ID:</span>
                <div className="info-value"> {selectedOfficer.OfficerID}</div>
              </div>
              <div>
                <span className="info-label">Officer Name:</span>
                <div className="info-value"> {selectedOfficer.OfficerName}</div>
              </div>
              <div>
                <span className="info-label">Assigned Area:</span>
                <div className="info-value">{selectedOfficer.AssignedArea}</div>
              </div>
              <div>
                <span className="info-label">Email:</span>
                <div className="info-value">{selectedOfficer.Email}</div>
              </div>
              <div>
                <span className="info-label">Contact Number:</span>
                <div className="info-value">{selectedOfficer.ContactNumber}</div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-dark btn-lg"
                type="button"
                style={{ fontSize: "medium" }}
                onClick={handleDelete}
              >
                Delete Officer
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Hide Officer</h2>
              <p>Are you sure you want to delete this officer?</p>
              <div className="warning-box">
                <strong>Warning</strong>
                <p>By deleting this officer, they will no longer be accessible in the system.</p>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>
                  No, Cancel
                </button>
                <button className="btn-confirm" onClick={deleteOfficer}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showaddAccount && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>ADD Officer</h2>
              <p>Are you sure you want to add this officer?</p>
              <div className="warning-box">
              <p><strong>Full Name:</strong> {submittedData?.fullName}</p>
              <p><strong>officer ID:</strong> {submittedData?.officerId}</p>
              <p><strong>Assigned Area:</strong> {submittedData?.email}</p>
              <p><strong>Username:</strong> {submittedData?.email}</p>
              <p><strong>Password:</strong> {submittedData?.email}</p>
              
                </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>
                  No, Cancel
                </button>
                <button className="btn-confirm" onClick={addOfficer}>
                  Yes, ADD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOfficers;
