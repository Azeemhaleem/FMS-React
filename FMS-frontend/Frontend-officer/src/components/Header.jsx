import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api/axios.jsx";
import default_image from "../assets/default_user.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faHome } from "@fortawesome/free-solid-svg-icons";

function toAbsolute(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  let origin;
  try {
    origin = new URL(api?.defaults?.baseURL || window.location.origin).origin;
  } catch {
    origin = window.location.origin;
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return `${origin}${path}`;
}

function getToken() {
  try {
    const raw = localStorage.getItem("token");
    if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Header({ username, role }) {
  // 1) Start with whatever we last cached (instant render, no flash)
  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem("police_profile_img") || default_image
  );

  const token = getToken();

  // One fetch on mount to be sure we have the latest (with cache-buster)
  useEffect(() => {
    if (!token) {
      setProfileImage(default_image);
      return;
    }

    const roleKey = (localStorage.getItem("role") || role || "").toLowerCase();
    const endpoint =
      roleKey === "driver" ? "/driver/get-profile-image" : "/police/get-profile-image";

    const fetchPic = async () => {
      try {
        const r = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const full = toAbsolute(r?.data?.path);
        if (full) {
          const bust = `${full}${full.includes("?") ? "&" : "?"}t=${Date.now()}`;
          setProfileImage(bust);
          try {
            localStorage.setItem("police_profile_img", bust);
          } catch {}
        }
      } catch (err) {
        // fall back silently; default image already shown
        // console.error("Header image load failed:", err?.response?.data || err?.message);
      }
    };

    fetchPic();

    // 2) Listen for the custom event fired by the profile page after upload
    const onUpdated = (e) => {
      const next = e?.detail?.url;
      if (next) {
        setProfileImage(next);               // instant swap, no refetch
        try { localStorage.setItem("police_profile_img", next); } catch {}
      }
    };
    window.addEventListener("profile-image-updated", onUpdated);

    return () => window.removeEventListener("profile-image-updated", onUpdated);
  }, [token, role]);

  return (
    <header className="header">
      <div className="header-right">
        <nav className="nav-bar">
          <Link
            to={
              role === "Admin" ? "/AdminOverview"
              : role === "SuperAdmin" ? "/SuperAdminOverview"
              : role === "HigherOfficer" ? "/HigherOfficerProfile"
              : role === "Officer" ? "/OfficerOverview"
              : role === "Driver" ? "/DriverOverview"
              : "/"
            }
            style={{ textDecoration: "none", color: "black" }}
          >
            <h2 className="m-4 d-none d-md-block">
              <b>{role} Portal</b>
            </h2>
          </Link>

          <div className="navbarlinks mt-2" style={{ marginLeft: "5%" }}>
            <p className="navbarlink fs-5 mt-2">
              <Link to="/home" id="navlinks">
                              <b>Home</b>
              </Link>
            </p>

            <p className="navbarlink fs-5 mt-2">
              <a
                href="#"
                id="navlinks"
                title="Logout"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/loginPolice";
                }}
              >
                
                <b>Logout</b>
              </a>
            </p>

            <p className="navbarlink text-secondary d-flex pe-1 me-1">
              <span className="name d-block pe-2 mt-1">
                Hey, <b style={{ color: "black" }}>{username}</b>
                <br />
                {role}
              </span>

              <Link
                to={
                  role === "Admin" ? "/AdminProfile"
                  : role === "SuperAdmin" ? "/SuperAdminProfile"
                  : role === "HigherOfficer" ? "/HigherOfficerProfile"
                  : role === "Officer" ? "/OfficerProfile"
                  : role === "Driver" ? "/DriverProfile"
                  : "/"
                }
                className="profile-img-link"
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                >
                <img
                  src={profileImage}
                  onError={(e) => { e.currentTarget.src = default_image; }}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                </div>
              </Link>
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
