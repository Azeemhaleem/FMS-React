import React, { useEffect, useState } from 'react';
import default_image from '../assets/default_user.svg';
import OnlineStatus from './OnlineStatus.jsx';
import { FaCamera } from 'react-icons/fa';
import api from '../api/axios.jsx';

function PoliceProfile() {
  const getUser = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString && !userString.startsWith('{') && !userString.startsWith('[')) {
        return { username: userString };
      }
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  };

  const user = getUser();
  const [profileImage, setProfileImage] = useState(default_image);

  useEffect(() => {
    async function getProfilePic() {
      try {
        const response = await api.get('/police/get-profile-image');
        if (response.status === 200) {
          const fullImageUrl = `http://127.0.0.1:8000${response.data.path}`;
          setProfileImage(fullImageUrl);
        }
      } catch (error) {
        console.error('Profile Image Failed to load:', error.response?.data || error.message);
      }
    }

    getProfilePic();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/police/upload-profile-image', formData, {
        headers: {
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

  return (
    <div>
      <div className="row-cols-lg-auto d-lg-flex">
        <div className="profile col-lg-4 bg-white rounded shadow me-lg-3" style={{ height: "fit-content" }}>
          <div className="d-block w-100 my-4">
            <div className="d-flex justify-content-center mb-4 position-relative" style={{ width: "100%" }}>
              <label className="position-relative d-block" style={{ width: "140px", cursor: "pointer" }}>
                <img
                  src={profileImage}
                  alt="profile"
                  className="rounded-circle w-100"
                  style={{ display: 'block', objectFit: 'cover', aspectRatio: '1 / 1' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex justify-content-center align-items-center overlay-hover">
                  <FaCamera size={32} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
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
                <OnlineStatus />
              </div>
            </div>

            <div className="d-flex justify-content-center mb-3">
                      <div className="justify-content-center text-white text-center fs-5 rounded py-1 px-3"
                           style={{width: "auto", backgroundColor: "#332E90"}}>
                          {user?.short_name || 'Undefined'}
                      </div>
                  </div>
                  <div className="d-flex justify-content-center mb-1">
                      <div className="justify-content-center text-white text-center fs-5 rounded py-1 px-3"
                           style={{width: "auto", backgroundColor: "#332E90"}}>
                          {user?.batch_number || 'Undefined'}
                      </div>
                  </div>
          </div>
        </div>

        <div className="profile-details col-lg-7">
          <div className="card bg-white rounded p-4 shadow">
            <div>
              <span className="info-label">Full Name:</span>
              <div className="info-value">{user?.full_name || 'Undefined'}</div>
            </div>
            <div>
              <span className="info-label">Police ID:</span>
              <div className="info-value">{user?.police_id || 'Undefined'}</div>
            </div>
            <div>
              <span className="info-label">Email:</span>
              <div className="info-value">{user?.email || 'Undefined'}</div>
            </div>
            <div>
              <span className="info-label">Police Station:</span>
              <div className="info-value">{user?.station || 'Undefined'}</div>
            </div>
            <div>
              <span className="info-label">Account Type:</span>
              <div className="info-value">{user?.role || 'Traffic Officer'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliceProfile;
