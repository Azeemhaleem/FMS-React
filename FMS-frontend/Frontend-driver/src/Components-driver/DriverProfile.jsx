// import React, { useEffect, useState } from 'react';
// import default_image from '../assets/default_user.svg'; // Use your actual path
// import { FaCamera } from 'react-icons/fa';
// import api from '../api/axios.jsx'; // Your Axios config file

// For development/testing only (set token in localStorage)
// localStorage.setItem('token', '22|rltHcXuNiFu5sbTri43YCfA5173PsHWNiqjbFjKd64779309');


import React, {useEffect, useRef, useState} from 'react'
import default_image from '../assets/default_user.svg'
import {Link} from "react-router-dom";
import OnlineStatus from "../components/OnlineStatus.jsx";
import { FaCamera } from "react-icons/fa";
import api from "../api/axios.jsx";

const getToken = () => {
  try {
    const tokenString = localStorage.getItem('token');
    if (tokenString && !tokenString.startsWith('{') && !tokenString.startsWith('[')) {
      return tokenString;
    }
    return tokenString ? JSON.parse(tokenString) : null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

const token = getToken();

const DriverProfile = () => {
//   const [profileImage, setProfileImage] = useState(default_image);
//   const [driver, setDriver] = useState({});
//   const token = localStorage.getItem("token");
//
// const fetchDriver = async () => {
//   try {
//     const response = await api.get('/user', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//
//     if (response.status === 200) {
//       setDriver(response.data);
//     }
//   } catch (error) {
//     console.error('Failed to fetch driver data:', error?.response?.data || error.message);
//   }
// };
//
//
//
//   const fetchProfileImage = async () => {
//     try {
//       const response = await api.get('/driver/get-profile-image', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.status === 200) {
//         setProfileImage(`http://127.0.0.1:8000${response.data.path}`);
//       }
//     } catch (error) {
//       console.warn("Using default profile image.", error?.response?.data || error.message);
//     }
//   };
//
//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//
//     const formData = new FormData();
//     formData.append('image', file);
//
//     try {
//       const response = await api.post('/driver/upload-profile-image', formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//
//       if (response.status === 200) {
//         setProfileImage(`http://127.0.0.1:8000${response.data.path}`);
//         window.dispatchEvent(new Event('profile-image-updated'));
//         alert("Profile Image changed successfully!");
//       } else {
//         alert("Failed to upload image.");
//       }
//     } catch (error) {
//       console.error("Upload failed:", error?.response?.data || error.message);
//       alert("Image upload failed.");
//     }
//   };
//
//   useEffect(() => {
//     fetchDriver();
//     fetchProfileImage();
//   }, []);
//
//   return (
//     <div className="container mt-4">
//       <div className="row g-4">
//         {/* Profile Image + Name */}
//         <div className="col-lg-4 bg-white rounded shadow p-4 text-center">
//           <label className="position-relative d-inline-block" style={{ width: "140px", cursor: "pointer" }}>
//             <img
//               src={profileImage}
//               onError={(e) => { e.target.src = default_image; }}
//               alt="Driver"
//               className="rounded-circle w-100"
//               style={{ objectFit: 'cover', aspectRatio: '1/1' }}
//             />
//             <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle overlay-hover">
//               <FaCamera size={28} />
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               style={{ display: 'none' }}
//             />
//           </label>
//           <h5 className="mt-3"><span style={{ color: '#7d8ea6' }}>Hi,</span>{driver?.username || 'Driver Name'}</h5>
//           <p className="text-muted">{driver?.city || 'Location Unknown'}</p>
//         </div>
//
//         {/* Driver Details */}
//         <div className="col-lg-8">
//           <div className="card bg-white rounded shadow p-4">
//             <div className="mb-3"><strong>License Number:</strong> <div>{driver?.license_number || 'Undefined'}</div></div>
//             <div className="mb-3"><strong>NIC:</strong> <div>{driver?.nic || 'Undefined'}</div></div>
//             <div className="mb-3"><strong>Date of Birth:</strong> <div>{driver?.dob || 'Undefined'}</div></div>
//             <div className="mb-3"><strong>Email:</strong> <div>{driver?.email || 'Undefined'}</div></div>
//             <div className="mb-3"><strong>Telephone Number:</strong> <div>{driver?.phone || 'Undefined'}</div></div>
//           </div>
//         </div>
//       </div>
//
//       {/* Vehicle Table */}
//       <div className="mt-4 bg-white rounded shadow p-4">
//         <h6 className="fw-bold mb-3">Vehicle Details:</h6>
//         <table className="table table-sm table-bordered text-center align-middle">
//           <thead className="table-light">
//             <tr>
//               <th>Vehicle Number</th>
//               <th>Model & Type (Optional)</th>
//               <th>Insurance Expiry Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* This should come from actual driver vehicle data */}
//             <tr>
//               <td>{driver?.vehicle_number || 'WP ABC-1234'}</td>
//               <td>{driver?.vehicle_model || 'Toyota Prius - Car'}</td>
//               <td>{driver?.insurance_expiry || '2025-06-15'}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );




  const [profileImage, setProfileImage] = useState(default_image);

  useEffect(() => {
    if (profileImage !== default_image || !token) return;

    let isMounted = true;

    async function getProfilePic() {
      try {
        const response = await api.get('/driver/get-profile-image', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (isMounted && response.status === 200) {
          const imagePath = response.data.path;
          const fullImageUrl = `http://127.0.0.1:8000${imagePath}`;
          setProfileImage(fullImageUrl);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Profile Image Failed to load:', error.response?.data || error.message);
        }
      }
    }

    getProfilePic();

    return () => { isMounted = false; };
  }, [token, profileImage]);


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // name should match what your Laravel backend expects

    try {
      const response = await api.post('/driver/upload-profile-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        alert("Profile Image changed successfully!");
        window.location.reload();
      } else {
        alert("Invalid Image type!");
      }
    } catch (error) {
      console.error('Profile Image Update Failed:', error.response?.data || error.message);
      alert("Profile Image Update Failed!");
    }
  };

  const [officerAuthData, setOfficerAuthData] = useState(null);
  const [officerPData, setOfficerPData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/driver/get-user-name-email',
          {headers: {'Authorization':`Bearer ${token}`}
          }
      );
      const response1 = await api.get('/driver/get-user-info',
          {headers: {'Authorization':`Bearer ${token}`}
          }
      )
      if (response.status === 200 && response1.status === 200) {
        const username = response.data.user_name;
        const email = response.data.email;
        setOfficerAuthData({
          username,
          email
        })
        const full_name = response1.data.full_name;
        const license_number = response1.data.license_number;
        const license_expiry_date = response1.data.license_expiry_date;
        const role = response1.data.role;
        setUserRole("Driver")
        setOfficerPData({
          full_name,
          license_number,
          license_expiry_date
        })
      } else {
        console.log("Failed to fetch username email");
      }
    } catch (error) {
      console.error('Username Email fetching failed:', error.response?.data || error.message);
      console.error('Officer personal data fetching failed:', error.response1?.data || error.message);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (

      <div>
        <div className="row-cols-lg-auto d-lg-flex">
          <div className="profile col-lg-4 bg-white rounded shadow me-lg-3" style={{height:"fit-content"}}>
            <div className="d-block w-100 my-4">
              <div className="d-flex justify-content-center mb-4 position-relative" style={{width: "100%"}}>
                <label className="position-relative d-block" style={{width: "140px", cursor: "pointer"}}>
                  <img
                      src={profileImage}
                      alt="profile"
                      className="rounded-circle w-100"
                      style={{display: 'block', objectFit: 'cover', aspectRatio: '1 / 1'}}
                  />

                  <div
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex justify-content-center align-items-center overlay-hover"
                  >
                    <FaCamera size={32}/>
                  </div>

                  <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{display: "none"}}
                  />
                </label>
                <div
                    className="online-status-checker position-absolute w-75 d-flex justify-content-center"
                    style={{
                      bottom: "11%",
                      right: "40%",
                      transform: "translate(50%, 50%)",
                      zIndex: 1,
                    }}
                >
                  <OnlineStatus/>
                </div>
              </div>
              <div className="d-flex justify-content-center mb-3">
                <div className="justify-content-center text-white text-center fs-5 rounded py-1 px-3"
                     style={{width: "auto", backgroundColor: "#332E90"}}>
                  {officerAuthData?.username || 'Undefined'}
                </div>
              </div>
              <div className="d-flex justify-content-center mb-1">
                <div className="justify-content-center text-white text-center fs-5 rounded py-1 px-3"
                     style={{width: "auto", backgroundColor: "#332E90"}}>
                  {userRole || 'Undefined'}
                </div>
              </div>
            </div>
          </div>
          <div className="profile-details col-lg-7">
            <div className="card bg-white rounded p-4 shadow">
              <div>
                <span className="info-label">Driver Full Name:</span>
                <div className="info-value">{officerPData?.full_name || 'Undefined'}</div>
              </div>
              <div>
                <span className="info-label">Driver License:</span>
                <div className="info-value">{officerPData?.license_number || 'Undefined'}</div>
              </div>
              <div>
                <span className="info-label">Email:</span>
                <div className="info-value">{officerAuthData?.email || 'No email available'}</div>
              </div>
              <div>
                <span className="info-label">Driver License Expiry Data:</span>
                <div className="info-value">{officerPData?.license_expiry_date || 'Undefined'}</div>
              </div>
              {/*<div>*/}
              {/*    <span className="info-label">Account type:</span>*/}
              {/*    <div className="info-value">Traffic Officer</div>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DriverProfile;

