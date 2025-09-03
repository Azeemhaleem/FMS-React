import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import api from '../api/axios';
import { Table, Button, Spinner } from 'react-bootstrap';

const toStatus = (accepted) => {
  if (typeof accepted === 'undefined' || accepted === null) return 'Pending';
  return accepted ? 'Accepted' : 'Declined';
};

// Map one server appeal → flat view model for the UI
const mapAppeal = (a) => {
  const cf = a?.charged_fine ?? {};
  const fine = cf?.fine ?? {};
  const driver = cf?.driver_user ?? {};
  const officer = cf?.issuing_police_officer ?? {};

  return {
    id: a?.id,
    driverName: driver?.name || 'N/A',
    officerName: officer?.name || 'N/A',
    offense: fine?.title || fine?.name || 'N/A',
    reason: a?.reason || a?.description || 'N/A',
    status: toStatus(a?.accepted),
    // keep original for modal if you want to show more later
    _raw: a,
  };
};

// mock fallback data
const mockAppeals = [
  {
    id: 1,
    driverName: "driver1",
    officerName: "Officer1",
    offense: "Speeding",
    reason: "Emergency situation",
    status: "Pending",
  },
  {
    id: 2,
    driverName: "driver2",
    officerName: "Officer2",
    offense: "Illegal parking",
    reason: "Did not see sign",
    status: "Pending",
  },
];

const ManageAppeal = () => {
  const [appeals, setAppeals] = useState([]); // flattened list
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null); // flattened item

  const handleShowMore = (appeal) => {
    setSelectedAppeal(appeal);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppeal(null);
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', variant: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const response = await api.get('h-police/get-all-appeals');
      const serverAppeals = Array.isArray(response.data?.appeals) ? response.data.appeals : [];
      const flattened = serverAppeals.map(mapAppeal);
      setAppeals(mockAppeals);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data. Showing mock data.';
      setFeedback({ message: errorMessage, variant: 'danger' });
      // fallback to mock data
      setAppeals(mockAppeals);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appealId) => {
    try {
      await api.post('h-police/accept-appeal', { appeal_id: appealId });
      setFeedback({ message: 'Appeal approved.', variant: 'success' });
      fetchAppeals();
    } catch (error) {
      setFeedback({ message: 'Error approving appeal.', variant: 'danger' });
    }
  };

  const handleDecline = async (appealId) => {
    try {
      await api.post('h-police/decline-appeal', { appeal_id: appealId });
      setFeedback({ message: 'Appeal declined.', variant: 'warning' });
      fetchAppeals();
    } catch (error) {
      setFeedback({ message: 'Error declining appeal.', variant: 'danger' });
    }
  };

  const filteredAppeals = (Array.isArray(appeals) ? appeals : []).filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
        a.driverName.toLowerCase().includes(q) ||
        a.officerName.toLowerCase().includes(q) ||
        String(a.id).includes(searchTerm)
    );
  });

  return (
      <div className="search-section container" style={{ backgroundColor: "#d3e2fd" }}>
        <h3 className="fw-bold mb-3 text-center">Pending Appeal Requests</h3>

        {feedback.message && (
            <p style={{
              color:
                  feedback.variant === 'success'
                      ? 'green'
                      : feedback.variant === 'danger'
                          ? 'red'
                          : feedback.variant === 'warning'
                              ? 'orange'
                              : 'black',
              fontSize: "small"
            }}>
              {feedback.message}
            </p>
        )}

        <div className="d-flex justify-content-center mb-3" style={{ width: "100%" }}>
          <div className="d-flex justify-content-center mb-3" style={{ marginTop: "2%", width: "85%" }}>
            <input
                type="text"
                className="form-control"
                value={searchTerm}
                placeholder="Search by Driver, Officer or ID..."
                style={{ fontSize: "small", width: "100%" }}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="button" className="btn btn-info" style={{ width: "5%", color: "white", marginLeft: "3px" }}>
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
                <th>#</th>
                <th>Driver</th>
                <th>Officer</th>
                <th>Offense</th>
                <th>Appeal Reason</th>
                <th>Status</th>
                <th>Approve</th>
                <th>Decline</th>
                <th>View</th>
              </tr>
              </thead>
              <tbody>
              {filteredAppeals.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">No matching appeals found.</td>
                  </tr>
              ) : (
                  filteredAppeals.slice(0, 10).map((a, index) => (
                      <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td>{a.driverName}</td>
                        <td>{a.officerName}</td>
                        <td>{a.offense}</td>
                        <td>{a.reason}</td>
                        <td>{a.status}</td>
                        <td>
                          <Button variant="success" size="sm" onClick={() => handleApprove(a.id)}>Accept</Button>
                        </td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => handleDecline(a.id)}>Decline</Button>
                        </td>
                        <td>
                          <a href="#" className="text-primary text-decoration-none" onClick={(e) => { e.preventDefault(); handleShowMore(a); }}>
                            view
                          </a>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </Table>
        )}

        {showModal && selectedAppeal && (
            <div className="custom-modal-overlay">
              <div className="custom-modal-content" style={{ width: "40%" }}>
                <div className="modal-header">
                  <h5 className="modal-title">Appeal Details</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body" style={{ margin: "3%", marginLeft: "10%" }}>
                  <input className="form-control mb-2" type="text" value={selectedAppeal.driverName} readOnly />
                  <input className="form-control mb-2" type="text" value={selectedAppeal.officerName} readOnly />
                  <input className="form-control mb-2" type="text" value={selectedAppeal.offense} readOnly />
                  <input className="form-control mb-2" type="text" value={selectedAppeal.reason} readOnly />
                  <input className="form-control mb-2" type="text" value={selectedAppeal.status} readOnly />
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default ManageAppeal;