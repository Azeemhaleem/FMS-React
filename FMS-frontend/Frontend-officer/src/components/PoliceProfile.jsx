import React, { useEffect, useMemo, useRef, useState } from "react";
import default_image from "../assets/default_user.svg";
import OnlineStatus from "./OnlineStatus.jsx";
import { FaCamera } from "react-icons/fa";
import api from "../api/axios.jsx";
import { Link } from "react-router-dom";

function getToken() {
  try {
    const raw = localStorage.getItem("token");
    if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
const toAbsolute = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  let origin;
  try {
    origin = new URL(api.defaults?.baseURL || window.location.origin).origin;
  } catch {
    origin = window.location.origin;
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return `${origin}${path}`;
};
const toTitle = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());



export default function PoliceProfile() {
  const token = getToken();
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem("police_profile_img") || default_image
  );
  const fileInputRef = useRef(null);

  const [basic, setBasic] = useState({ username: "", email: "" });
  const [info, setInfo] = useState({
    full_name: "",
    police_id: "",
    station: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [imgBusy, setImgBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!token) {
        setError("Not authenticated.");
        setLoading(false);              // ✅ don’t get stuck in loading
        return;
      }
      setLoading(true);
      setError("");

      const p1 = api.get("/police/get-username-email", auth);
      const p2 = api.get("/police/get-user-info", auth);
      const p3 = api.get("/police/get-profile-image", auth);

      const [rBasic, rInfo, rPic] = await Promise.allSettled([p1, p2, p3]);
      if (!alive) return;

      // username + masked email
      if (rBasic.status === "fulfilled") {
        const d = rBasic.value?.data || {};
        setBasic({
          username: d.user_name ?? "",
          email: d.email ?? "No email available",
        });
      } else {
        setError("Failed to load username/email.");
      }

      // police info
      let mergedInfo = { full_name: "", police_id: "", station: "", role: "" };
      if (rInfo.status === "fulfilled") {
        const d = rInfo.value?.data || {};
        mergedInfo = {
          full_name: d.full_name ?? "",
          police_id: d.police_id ?? "",
          station: d.station ?? "",
          role: d.role ?? (localStorage.getItem("role") || ""),
        };
        setInfo(mergedInfo);
      } else {
        setError((prev) => prev || "Failed to load profile details.");
      }

      // profile image
      if (rPic.status === "fulfilled") {
        const full = toAbsolute(rPic.value?.data?.path);
        if (full) {
          const bust = `${full}${full.includes("?") ? "&" : "?"}t=${Date.now()}`;
          setProfileImage(bust);
          try { localStorage.setItem("police_profile_img", bust); } catch {}
          window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { url: bust } }));
        }
      }

      // ✅ cache a minimal display name for Header
      try {
        localStorage.setItem(
          "user_min",
          JSON.stringify({
            full_name: mergedInfo.full_name || "",
            user_name: (rBasic.status === "fulfilled" ? rBasic.value?.data?.user_name : "") || "",
            role: mergedInfo.role || "",
          })
        );
      } catch {}

      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [token, auth]);

  const normalize = (r) => String(r || "").toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
  const settingsBaseFor = (role) => {
    const key = normalize(role);
    return (
      {
        admin: "/AdminSettings",
        superadmin: "/SuperAdminSettings",
        officer: "/OfficerSettings",
        higherofficer: "/HigherOfficerSettings",
      }[key] || "/OfficerSettings"
    );
  };

  const roleRaw = info.role || localStorage.getItem("role");
  const settingsBase = settingsBaseFor(roleRaw);

  const onPickFile = () => fileInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!okTypes.includes(file.type)) {
      alert("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large (max 2 MB).");
      return;
    }

    const form = new FormData();
    form.append("image", file);

    setImgBusy(true);
    try {
      const res = await api.post("/police/upload-profile-image", form, {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "multipart/form-data" },
      });
      const full = toAbsolute(res?.data?.path);
      if (full) {
        const bust = `${full}${full.includes("?") ? "&" : "?"}t=${Date.now()}`;
        setProfileImage(bust);
        try { localStorage.setItem("police_profile_img", bust); } catch {}
        window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { url: bust } }));
      }
      alert("Profile image updated.");
    } catch (err) {
      console.error("Profile image upload failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Image upload failed.");
    } finally {
      setImgBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const Safe = ({ children }) => <div className="info-value">{children || "—"}</div>;
  const Row = ({ label, value, hideIfEmpty = false }) =>
    hideIfEmpty && !value ? null : (
      <div className="mb-3">
        <span className="info-label">{label}</span>
        <Safe>{value}</Safe>
      </div>
    );

  return (
    <div className="container mt-4 mb-5">
      <div className="row g-4">
        {/* LEFT */}
        <div className="col-lg-4 bg-white rounded shadow p-4" style={{ height: "fit-content" }}>
          <div className="d-flex justify-content-center mb-4 position-relative">
            <button
              type="button"
              onClick={onPickFile}
              className="position-relative d-block p-0 border-0 bg-transparent"
              style={{ width: 140, cursor: "pointer" }}
              aria-label={imgBusy ? "Uploading image…" : "Change profile photo"}
              disabled={imgBusy}
            >
              <img
                src={profileImage}
                onError={(e) => { e.currentTarget.src = default_image; }}
                alt="Police profile"
                className="rounded-circle w-100"
                style={{ objectFit: "cover", aspectRatio: "1 / 1", display: "block" }}
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle overlay-hover">
                <FaCamera size={28} />
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div
              className="position-absolute w-75 d-flex justify-content-center"
              style={{ bottom: "11%", right: "40%", transform: "translate(50%, 50%)", zIndex: 1 }}
            >
              <OnlineStatus />
            </div>
          </div>

          {/* Username */}
          <div className="d-flex justify-content-center mb-2">
            <span className="text-white text-center fs-5 rounded py-1 px-3" style={{ backgroundColor: "#332E90" }}>
              {basic.username || "—"}
            </span>
          </div>

          {/* Role */}
          <div className="d-flex justify-content-center mb-3">
            <span className="text-white text-center fs-6 rounded py-2 px-3" style={{ backgroundColor: "#6c757d" }}>
              {toTitle(info.role || localStorage.getItem("role")) || "—"}
            </span>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-center gap-2">
            <Link className="btn btn-outline-primary btn-sm" to={`${settingsBase}/security/username`}>
              Change Username
            </Link>
            <Link className="btn btn-outline-secondary btn-sm" to={`${settingsBase}/security/password`}>
              Change Password
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-8">
          <div className="card bg-white rounded shadow p-4">
            {error && <div className="alert alert-warning py-2 mb-3">{error}</div>}

            {loading ? (
              <div className="text-muted">Loading profile…</div>
            ) : (
              <>
                <Row label="Full Name:" value={info.full_name} />
                <Row label="Police ID:" value={info.police_id} />
                <Row label="Email:" value={basic.email} />
                <Row label="Police Station:" value={info.station} hideIfEmpty /> {/* ✅ hide if null */}
                <Row label="Account Type:" value={toTitle(info.role)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
