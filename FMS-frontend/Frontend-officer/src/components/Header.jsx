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
      return; // ⛔ Don't proceed if token is missing
    }

    if (!user) {
      console.warn('Unauthorized access attempt');
      return;
    }
    const role = localStorage.getItem('role');
    async function getProfilePic() {
      try {
        const endpoint =
            role === 'driver'
                ? '/driver/get-profile-image'
                : '/police/get-profile-image';
        const response = await api.get(endpoint, {
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

    const handleProfileImageUpdate = () => {
      getProfilePic(); // refetch the image
    };

    window.addEventListener('profile-image-updated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profile-image-updated', handleProfileImageUpdate);
    };
  }, []);


  return (
      <header className="header">

        <div>
          <div className="header-right" >
            <nav className="nav-bar">
              <Link to={
                role === 'Admin' ? '/AdminOverview'
                    : role === 'SuperAdmin' ? '/SuperAdminOverview'
                        : role === 'HigherOfficer' ? '/HigherOfficerProfile'
                            : role === 'Officer' ? '/OfficerOverview'
                                : role === 'Driver' ? '/DriverOverview'
                                    : null
              } style={{ textDecoration: "none", color: "black" }}>
                <h2 className="m-3 d-none d-md-block">
                  <b>{role} Portal</b>
                </h2>
              </Link>

              <div className="navbarlinks mt-3" style={{marginLeft:"5%"}}>
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
                        window.location.href = "/loginPolice"; // Redirect to home
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
                  <Link to={
                    role === 'Admin' ? '/AdminProfile'
                        : role === 'SuperAdmin' ? '/SuperAdminProfile'
                            : role === 'HigherOfficer' ? '/HigherOfficerProfile'
                                : role === 'Officer' ? '/OfficerProfile'
                                    : role === 'Driver' ? '/DriverProfile'
                                        : null
                  } className="profile-img-link" >
                    <img
                        src={profileImage}
                        onError={(e) => { e.target.src = default_image; }}
                        alt=""
                        width="50px"
                        height="50px"
                        className="rounded-circle d-inline-flex"
                    />
                  </Link>
                </p>

              </div>
            </nav>
          </div>
        </div>
      </header>
  );
}

export default Header;