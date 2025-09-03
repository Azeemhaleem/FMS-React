import "./styles/driver-style.css";
import "./styles/fines.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";

function SuperAdminFines() {

  

  const [fineId, setFineId] = useState('');
  const [fineData, setFineData] = useState({
    name: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingupdate, setLoadingupdate] = useState(false);
  const [loadingdelete, setLoadingdelete] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get(`get-fine-by-id/${fineId}`);

      setFineData({
        name: response.data.fine.name,
        amount: response.data.fine.amount,
        description: response.data.fine.description
      });
      setMessage('');
      setMessageType('');
    } catch (error) {
      setMessage('Fine not found!');
      setMessageType('error');
      setFineData({ name: '', amount: '', description: '' });
    } 
    finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoadingupdate(true);
      await api.put("/update-fine", {
        fine_id: fineId,
        name: fineData.name,
        amount: fineData.amount,
        description: fineData.description
      });
      setMessage('Fine updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update fine.');
      setMessageType('error');
    } finally {
      setLoadingupdate(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingdelete(true);
      await api.delete("/delete-fine", {
        data: { fine_id: fineId }
      });
      setMessage('Fine deleted successfully!');
      setMessageType('success');
      setFineData({ name: '', amount: '', description: '' }); // clear form
      setFineId('');
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete fine.');
      setMessageType('error');
    } finally {
      setLoadingdelete(false);
    }
  };
  

  return (
    <>
      <div className="row">
      <div
          className="search-section container mb-5 justify-content-center align-items-center "
          style={{
            backgroundColor: "#d3e2fd",
            padding: "1rem",
            marginLeft: window.innerWidth < 576 ? "3rem" : "2rem"
  
          }}
      >
          <div className="d-flex justify-content-center" style={{ width: "86%",marginTop:"2%",marginLeft:"7%"}}>
            <input
              type="text"
              className="form-control"
              value={fineId}
              placeholder="Fine ID"
              style={{ fontSize: "small", width: "100%" }}
              onChange={(e) => setFineId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-info d-none d-md-block" onClick={handleSearch} style={{ width: "5%", color: "white",marginLeft:"3px" }}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>


          <div className="row g-3 mt-5">
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Name"
            value={fineData.name}
            onChange={(e) => setFineData({ ...fineData, name: e.target.value })}
          />
        </div>
        <div className="col-12 col-md-6">
          <input
            type="number"
            className="form-control shadow-sm"
            placeholder="Amount"
            value={fineData.amount}
            onChange={(e) =>
              setFineData({ ...fineData, amount: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="col-12">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Description"
            value={fineData.description}
            onChange={(e) => setFineData({ ...fineData, description: e.target.value })}
          />
        </div>
      </div>
          
      <div className="row justify-content-center gap-2 mb-5 mt-5">
        <div className="col-12 col-sm-6 col-md-3 d-grid">
          <button
            onClick={handleUpdate}
            className="btn btn-primary"
            disabled={loadingupdate}
          >
            {loadingupdate ? 'Updating...' : 'Update Fine'}
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-3 d-grid">
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={loadingdelete}
          >
            {loadingdelete ? 'Deleting...' : 'Delete Fine'}
          </button>
        </div>
      </div>

      {loading ? (
  <p>Loading...</p>
) : (
  message && (
    <p style={{ color: messageType === 'success' ? 'green' : 'red', marginTop: '10px' }}>
      {message}
    </p>
  )
)}

        </div>
      </div>
    </>
  );
}

export default SuperAdminFines;
