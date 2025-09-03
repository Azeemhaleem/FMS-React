import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function ManageTrafficOfficers() {

//   localStorage.setItem("token","47|ZnXMyjG1oypiRZzaAtWdWudYyvApy1AnZDc6zr0C714c5a46");
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

    const mockOfficers = [
      { id: 1, police_user_id: 'PU1234', police_department_id: 'P001', in_service: true },
      { id: 2, police_user_id: 'PU2345', police_department_id: 'P002', in_service: false },
      { id: 3, police_user_id: 'PU3456', police_department_id: 'P003', in_service: true },
      { id: 4, police_user_id: 'PU1237', police_department_id: 'P001', in_service: true },
      { id: 5, police_user_id: 'PU2348', police_department_id: 'P002', in_service: false },
      { id: 6, police_user_id: 'PU3459', police_department_id: 'P003', in_service: true },
    ];

  const fetchTrafficOfficers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/get-assigned-traffic-officers');
      setOfficers(mockOfficers);
      setMessageType('success');
    } catch (error) {
        console.error('Error fetching officers:', error);
      
        if (error.response) {
          setMessage(error.response.data.message || "Something went wrong.");
        } else if (error.request) {
          setMessage('No response from server. Please try again later.');
        } else {
          setMessage('Request setup error: ' + error.message);
        }
      
          setOfficers(mockOfficers);
        setMessageType('error');
      }
      finally {
      setLoading(false);
    }
  };

  const toggleOfficerStatus = async (id, action) => {
    try {
      const endpoint = action === 'activate' ? '/activate-traffic-officer' : '/deactivate-traffic-officer';
      await api.put(endpoint, { police_user_id: id });
      setMessage(`Officer ${action}d successfully!`);
      fetchTrafficOfficers();
      setMessageType('success');
    } catch (error) {
      console.error(`Failed to ${action} officer:`, error);
      setMessage(`Failed to ${action} officer.`);
      setMessageType('error');
    }
  };

  useEffect(() => {
    fetchTrafficOfficers();
  }, []);

  return (
    <div
    className="search-section container mb-5 justify-content-center align-items-center "
    style={{
      backgroundColor: "#d3e2fd",
      padding: "1rem",
      marginLeft: window.innerWidth < 576 ? "3rem" : "2rem"

    }}
>
      <h3 className="fw-bold mb-4 text-center">Manage Traffic Officers</h3>

      
      {message && (
        <div
          className={`text-center mb-3 fw-semibold ${
            messageType === 'success' ? 'text-success' : 'text-danger'
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading officers...</div>
      ) : (
        <div className="row my-5 mx-1">
          {officers.length === 0 ? (
            <p className="text-center">No officers found.</p>
          ) : (
            officers.map((officer) => (
              <div className="col-md-3 mb-4" key={officer.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <h5 className="card-title">Police User ID: {officer.police_user_id}</h5>
                    <p className={`fw-bold ${officer.in_service ? 'text-success' : 'text-danger'}`}>
                      {officer.in_service ? 'Active' : 'Inactive'}
                    </p>
                    <button
                      className={`btn ${officer.in_service ? 'btn-danger' : 'btn-success'} btn-sm`}
                      onClick={() => toggleOfficerStatus(officer.police_user_id, officer.in_service ? 'deactivate' : 'activate')}
                    >
                      {officer.in_service ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ManageTrafficOfficers;
