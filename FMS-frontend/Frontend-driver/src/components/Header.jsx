import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from '../api/axios.jsx';
import default_image from '../assets/default_user.svg';

function Header({ username, role }) {
  const [profileImage, setProfileImage] = useState(default_image);

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

  useEffect(() => {
    if (!token) {
      setProfileImage(default_image);
      return;
    }

    if (!user) {
      console.warn('Unauthorized access attempt');
      return;
    }

    const role = localStorage.getItem('role');
    if (role === 'Driver') {
      async function getProfilePic() {
        try {
          const response = await api.get('/driver/get-profile-image', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.status === 200) {
            const imagePath = response.data.path;
            const fullImageUrl = `http://127.0.0.1:8000${imagePath}?t=${new Date().getTime()}`;
            setProfileImage(fullImageUrl);
          }
        } catch (error) {
          console.error('Profile Image Failed to load:', error.response?.data || error.message);
        }
      }

      getProfilePic();
    }

  }, [token, user]);

  return (
      <header className="header">
        <div>
          <div className="header-right">
            <nav className="nav-bar">
              {/* Render link only if the role is 'Driver' */}
              {role === 'Driver' && (
                  <Link to="/DriverOverview" style={{ textDecoration: "none", color: "black" }}>
                    <h2 className="m-3 d-none d-md-block">
                      <b>Driver Portal</b>
                    </h2>
                  </Link>
              )}

              <div className="navbarlinks mt-3" style={{ marginLeft: "5%" }}>
                <p className="navbarlink">
                  <a href="/home" id="navlinks">
                    <b>Home</b>
                  </a>
                </p>

                <p className="navbarlink">
                  <a
                      href="#"
                      id="navlinks"
                      title="Logout"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = "/login"; // Redirect to home
                      }}
                  >
                    <b>Logout</b>
                  </a>
                </p>

                <p className="navbarlink text-secondary d-flex pe-1 me-1">
                  <p className="name d-block pe-2">
                    Hey,<b style={{ color: "black" }}>{username}</b>
                    <br />
                    {role}
                  </p>
                  {role === 'Driver' && (
                      <Link to="/DriverProfile" className="profile-img-link">
                        <img
                            src={profileImage}
                            onError={(e) => { e.target.src = default_image; }}
                            alt="Profile"
                            width="50px"
                            height="50px"
                            className="rounded-circle d-inline-flex"
                        />
                      </Link>
                  )}
                </p>
              </div>
            </nav>
          </div>
        </div>
      </header>
  );
}

export default Header;
