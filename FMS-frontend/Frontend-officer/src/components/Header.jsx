import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api/axios.jsx";
import default_image from "../assets/default_user.svg";

const toAbsolute = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (api.defaults?.baseURL || "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
const toTitle = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

function Header({ username, role }) {
  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem("police_profile_img") || default_image
  );
  const [displayName, setDisplayName] = useState(username || "");

  const token = (() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    // 1) greet with cached minimal user if present
    try {
      const cached = JSON.parse(localStorage.getItem("user_min") || "null");
      if (cached?.full_name) setDisplayName(cached.full_name);
      else if (cached?.user_name) setDisplayName(cached.user_name);
    } catch {}

    // 2) always try to fetch avatar when authenticated (works for admin/super_admin/officers)
    if (!token) {
      setProfileImage(default_image);
      return;
    }
    (async () => {
      try {
        const res = await api.get("/police/get-profile-image", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          const full = toAbsolute(res.data?.path);
          if (full) {
            const bust = `${full}${full.includes("?") ? "&" : "?"}t=${Date.now()}`;
            setProfileImage(bust);
            try { localStorage.setItem("police_profile_img", bust); } catch {}
          }
        }
      } catch (e) {
        // keep default silently
      }
    })();
  }, [token]);

  // react to image updates + cross-tab sync
  useEffect(() => {
    const onImgUpdated = (e) => {
      const url = e?.detail?.url;
      if (url) setProfileImage(url);
    };
    const onStorage = (e) => {
      if (e.key === "police_profile_img" && e.newValue) setProfileImage(e.newValue);
    };
    window.addEventListener("profile-image-updated", onImgUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("profile-image-updated", onImgUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const rawRole = role || localStorage.getItem("role") || "Officer";
  const r = toTitle(rawRole); // e.g., "Super Admin", "Higher Officer", "Traffic Officer", "Admin", "Officer"

  const portalHeading = (() => {
    const low = rawRole.toLowerCase();
    if (low.includes("super")) return ["Super Admin Portal", "/SuperAdminOverview"];
    if (low === "admin") return ["Admin Portal", "/AdminOverview"];
    if (low.includes("higher")) return ["Higher Officer Portal", "/HigherOfficerProfile"];
    if (low.includes("officer")) return ["Officer Portal", "/OfficerOverview"];
    return ["Police Portal", "/OfficerOverview"];
  })();
  const [portalTitle, portalLink] = portalHeading;

  return (
    <header className="header">
      <div className="header-right">
        <nav className="nav-bar">
          <Link to={portalLink} style={{ textDecoration: "none", color: "black" }}>
            <h2 className="m-3 d-none d-md-block"><b>{portalTitle}</b></h2>
          </Link>

          <div className="navbarlinks mt-3" style={{ marginLeft: "5%" }}>
            <p className="navbarlink"><a href="/home" id="navlinks"><b>Home</b></a></p>

            <p className="navbarlink">
              <a
                href="#"
                id="navlinks"
                title="Logout"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("user_min");            // ✅ clear cached name
                  localStorage.removeItem("police_profile_img");  // ✅ clear cached avatar
                  window.location.href = "/loginPolice";
                }}
              >
                <b>Logout</b>
              </a>
            </p>

            <p className="navbarlink text-secondary d-flex pe-1 me-1">
              <span className="name d-block pe-2">
                Hey,<b style={{ color: "black" }}>{displayName || username || "User"}</b>
                <br />{r}
              </span>
              <Link
                to={
                  rawRole.toLowerCase().includes("higher")
                    ? "/HigherOfficerProfile"
                    : rawRole.toLowerCase() === "admin" || rawRole.toLowerCase().includes("super")
                    ? "/AdminProfile"
                    : "/OfficerProfile"
                }
                className="profile-img-link"
              >
                <img
                  src={profileImage}
                  onError={(e) => { e.currentTarget.src = default_image; }}
                  alt="Profile"
                  style={{ width: 48, height: 48, aspectRatio: "1 / 1", borderRadius: "50%", objectFit: "cover", display: "block" }}
                />
              </Link>
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
