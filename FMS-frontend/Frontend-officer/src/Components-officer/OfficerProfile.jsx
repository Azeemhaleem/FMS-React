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

function OfficerProfile() {

    const [profileImage, setProfileImage] = useState(default_image);

    useEffect(() => {
        if (profileImage !== default_image || !token) return;

        let isMounted = true;

        async function getProfilePic() {
            try {
                const response = await api.get('/police/get-profile-image', {
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
            const response = await api.post('/police/upload-profile-image', formData, {
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
            const response = await api.get('/police/get-username-email',
                {headers: {'Authorization':`Bearer ${token}`}
                }
            );
            const response1 = await api.get('/police/get-user-info',
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
                const police_id = response1.data.police_id;
                const station = response1.data.station;
                const role = response1.data.role;
                switch (role) {
                    case "admin":
                        setUserRole("Admin");
                        break;
                    case "traffic_officer":
                        setUserRole("Traffic Officer");
                        break;
                    case "super_admin":
                        setUserRole("Super Admin");
                        break;
                    case "higher_police":
                        setUserRole("Higher police");
                        break;
                    default:
                        console.log("Invalid user role!");
                        break;
                }
                setOfficerPData({
                    full_name,
                    police_id,
                    station
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
                      <span className="info-label">Officer full name:</span>
                      <div className="info-value">{officerPData?.full_name || 'Undefined'}</div>
                  </div>
                  <div>
                  <span className="info-label">Officer ID:</span>
                      <div className="info-value">{officerPData?.police_id || 'Undefined'}</div>
                  </div>
                  <div>
                      <span className="info-label">Email:</span>
                      <div className="info-value">{officerAuthData?.email || 'No email available'}</div>
                  </div>
                  <div>
                      <span className="info-label">Police Station:</span>
                      <div className="info-value">{officerPData?.station || 'Undefined'}</div>
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
}

export default OfficerProfile;
