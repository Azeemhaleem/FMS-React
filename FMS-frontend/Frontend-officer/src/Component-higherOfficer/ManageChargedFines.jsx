
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from '../api/axios';
import { Table, Button, Spinner } from 'react-bootstrap';

const ManageChargedFines = () => {

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ message: '', variant: '' });

  useEffect(() => {
    fetchFines();
  }, []);
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', variant: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  

  const fetchFines = async () => {
    try {
      const response = await api.get('h-police/get-all-fines-to-delete');
      setFines(mockFines);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'failed to fetch data – using mock data.';
      setFeedback({ message: errorMessage, variant: 'danger' });

  
       //MOCK DATA
       const mockFines = [
         {
           id: 101,
           driver_user: { name: 'driver1' },
           police_user: { name: 'Officer1' },
           fine: { offense: 'Speeding', amount: 500 },
         },
         {
           id: 102,
           driver_user: { name: 'driver2' },
           police_user: { name: 'Officer2' },
           fine: { offense: 'Illegal Parking', amount: 250 },
         },
         {
           id: 103,
           driver_user: { name: 'driver3' },
           police_user: { name: 'Officer3' },
           fine: { offense: 'No Helmet', amount: 300 },
         },
       ];
  
       setFines(mockFines);
    
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (fineId) => {
    try {
      await api.post('h-police/accept-delete-fine-request', { fine_id: fineId });
      setFeedback({ message: 'Fine deletion approved.', variant: 'success' });
      fetchFines();
      // setFeedback({ message: 'Fine deletion approved.', variant: 'success' });
      // setFines((prevFines) => prevFines.filter((fine) => fine.id !== fineId));
    } catch (error) {
      setFeedback({ message: 'Error approving fine deletion.', variant: 'danger' });
    }
  };

  const handleDecline = async (fineId) => {
    try {
      await api.post('h-police/decline-delete-fine-request', { fine_id: fineId });
      setFeedback({ message: 'Fine deletion declined.', variant: 'warning' });
      fetchFines();
    } catch (error) {
      setFeedback({ message: 'Error declining fine deletion.', variant: 'danger' });
    }
  };

  const filteredFines = fines.filter((fine) => {
    const driverName = fine.driver_user?.name?.toLowerCase() || '';
    const officerName = fine.police_user?.name?.toLowerCase() || '';
    const fineId = String(fine.id); // fine.id is a number, so convert to string
  
    return (
      driverName.includes(searchTerm.toLowerCase()) ||
      officerName.includes(searchTerm.toLowerCase()) ||
      fineId.includes(searchTerm)
    );
  });
  

  return (
    <div
      className="search-section container"
      style={{
        backgroundColor: "#d3e2fd",
      }}
    >
      
      <h3 className="fw-bold mb-3 text-center">Pending Fine Deletion Requests</h3>
      
      {feedback.message && (
      <p
        style={{
          color:
            feedback.variant === 'success'
              ? 'green'
              : feedback.variant === 'danger'
              ? 'red'
              : feedback.variant === 'warning'
              ? 'orange'
              : 'black',
              fontSize:"small"
        }}
      >
        {feedback.message}
      </p>
    )}

      <div
              className="d-flex justify-content-center mb-3"
              style={{ width: "100%" }}
            >
              
              <div className="d-flex justify-content-center mb-3" style={{ marginTop:"2%",width:"85%"}}>
                <input
                  type="text"
                  className="form-control"
                  value={searchTerm}
                  placeholder="Search by Driver or Officer..."
                  style={{ fontSize: "small", width: "100%"  }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button   type="submit" className="btn btn-info"  style={{ width: "5%", color: "white",marginLeft:"3px" }}>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
              
            </div>
            

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th></th>
              <th>Driver</th>
              <th>Officer</th>
              <th>Offense</th>
              <th>Fine Amount</th>
              <th>Actions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFines.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No matching fines found.</td>
              </tr>
            ) : (
              filteredFines.slice(0, 10).map((fine, index) => (
                <tr key={fine.id}>
                  <td>{index + 1}</td>
                  <td>{fine.driver_user?.name}</td>
                  <td>{fine.police_user?.name}</td>
                  <td>{fine.fine?.offense || 'N/A'}</td>
                  <td>{fine.fine?.amount || 'N/A'}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApprove(fine.id)}
                    >
                      Approve
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDecline(fine.id)}
                    >
                      Decline
                    </Button>
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ManageChargedFines;

