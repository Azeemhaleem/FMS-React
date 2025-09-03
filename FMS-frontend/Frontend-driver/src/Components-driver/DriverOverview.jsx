import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../api/axios';
import { useNavigate } from "react-router-dom";


const DriverOverview = () => {

  const [fines, setFines] = useState([]);
  const [selectedFines, setSelectedFines] = useState([]);
  const token = localStorage.getItem('token');
  const [unPaidFines, setUnPaidFines] = useState([]);
  const [resentPayments, setResentPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchUnpaidFines();
      fetchRecentPayments();
      fetchNotifications();
    }
  }, [navigate, token]);


  // Fetch fines from backend on component mount
  useEffect(() => {
    async function fetchFines() {
      try {
        const response = await api.get('/get-my-fines');  // Backend route to get all fines
        setFines(response.data);
      } catch (error) {
        console.error('Error fetching fines:', error);
      }
    }
    fetchFines();
  }, []);

  const payFines = () => {
    navigate('/DriverPayment');
  }

  const handlePayment = async () => {
    if (selectedFines.length === 0) {
      alert('Please select fines to pay.');
      return;
    }

    try {
      // Process payment for all selected fines
      for (const fineId of selectedFines) {
        const response = await api.post('/process-payment',
            { fineIds: [fineId] },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
        );
        if(response.status === 200) {
          console.log("Payment processed successfully");
        }
      }

      // Update unpaid fines state to reflect payments
      setUnPaidFines(prev =>
          prev.map(msg => selectedFines.includes(msg.id) ? { ...msg, paid_at: new Date() } : msg)
      );
      setSelectedFines([]);

    } catch (error) {
      console.error('Payment error:', error.response?.data || error.message);
      alert('Failed to process payment');
    }
  };

  const handleLink = () =>{
    navigate('/DriverMyFines');
  }

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

      // Set notifications with the transformed data
      setUnPaidFines(data);

    } catch (err) {
      console.error("Failed to fetch Fine Details", err);
      setError("Failed to load Fine Details. Please try again.");
      setUnPaidFines([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? "Invalid date" : `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
    } catch (e) {
      return "Invalid date";
    }
  };

  const fetchRecentPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/get-recently-paid-fines', {
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
        fine_ID: fineData.fine.id,
        fine_Name: fineData.fine.name,
        fine_Amount: fineData.fine.amount,
        fine_Description: fineData.fine.description,
        issued_At: fineData.issued_at,
        paid_At: fineData.paid_at,
        expires_At: fineData.expires_at,
        policeUser_Id: fineData.police_user_id
      }));

      // Log the transformed data
      console.log('Transformed Data:', data);

      // Set notifications with the transformed data
      setResentPayments(data);

    } catch (err) {
      console.error("Failed to fetch Fine Details", err);
      setError("Failed to load Fine Details. Please try again.");
      setResentPayments([]);
    } finally {
      setLoading(false);
    }
  };




  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/driver/notifications/for-today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      setResentPayments(data);
    } catch (err) {
      console.error("Failed to fetch unPaidFines", err);
      setError("Failed to load unPaidFines. Please try again.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="search-section container mb-5 justify-content-center align-items-center"
      style={{
        backgroundColor: '#d3e2fd',
        padding: '1rem',
        marginLeft: window.innerWidth < 576 ? '2rem' : '3rem',
      }}
    >

      <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0">Overview Fines</h4>
          <button
            className="btn btn-dark px-2 py-2"
            style={{ width: '150px', borderRadius: '10px', fontSize: '0.88rem' }}
            onClick={payFines}>
            Pay All Fines
          </button>
        </div>

        <div className="bg-white rounded-4 p-3">
          <div className="row">
            <div className="col-md-12 mb-3">
              {unPaidFines.length === 0 ? (
                  <div className="bg-primary-subtle rounded-4 p-2 mb-2">No Recent Fines.</div>
              ) : (
                  unPaidFines.slice(0, 3).map((item) => (   // 👈 Only take first 3 fines
                      <div key={item.fineID} className="d-flex mb-2">
                        <div className="d-flex bg-primary-subtle rounded-4 px-3 py-2">
                          {item.fineName}        {formatDate(item.issuedAt)}
                        </div>
                        <button
                            className="d-flex btn btn-dark mx-2 rounded-3"
                            style={{ width: "fit-content" }}
                            onClick={handlePayment}
                        >
                          Pay
                        </button>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>


        <div className="d-flex justify-content-between">
          <button className="btn btn-dark px-3 py-1 rounded-3" style={{ width: 'fit-content' }} onClick={handleLink}>
            View all fines
          </button>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4">
        <h5 className="fw-bold mb-3">Payment Status</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <h6 className="small">Recent Payments</h6>
            {/* Log resentPayments to check its value */}
            {console.log(resentPayments)}

            {resentPayments.length === 0 ? (
                <div className="bg-primary-subtle rounded-4 p-2 mb-2">No Recent Payments.</div>
            ) : (
                resentPayments.slice(0, 3).map((item) => (
                    <div key={item.fine_ID} className="d-flex mb-2">
                      <div className="d-flex bg-primary-subtle rounded-4 px-3 py-2">
                        {item.fine_Name}
                      </div>
                    </div>
                ))
            )}
          </div>
          <div className="col-md-6">
            <h6 className="small">Notifications</h6>
            {notifications.length === 0 ? (
                <div className="bg-primary-subtle rounded-4 p-2 mb-2">No Notifications.</div>
            ) : (
                notifications.slice(0, 3).map((item) => (
                    <div key={item.id} className="d-flex mb-2">
                      <div className="d-flex bg-primary-subtle rounded-4 px-3 py-2">
                        {item.data.message.length > 11 ? item.data.message.slice(0, 10) + '...' : item.data.message}
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

      </div>
      </div>


  );
};

export default DriverOverview;
