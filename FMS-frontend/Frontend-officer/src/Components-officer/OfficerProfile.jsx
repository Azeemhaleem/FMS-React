import React, { useEffect, useMemo, useRef, useState } from "react";
import default_image from "../assets/default_user.svg";
import OnlineStatus from "../components/OnlineStatus.jsx";
import { FaCamera } from "react-icons/fa";
import api from "../api/axios.jsx";

function getToken() {
    try {
        const raw = localStorage.getItem("token");
        if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// Make backend paths absolute even if they’re like “/storage/…”
const toAbsolute = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path; // already absolute
    // build from origin (scheme://host[:port])
    let origin;
    try {
        origin = new URL(api.defaults?.baseURL || window.location.origin).origin;
    } catch {
        origin = window.location.origin;
    }
    if (!path.startsWith("/")) path = `/${path}`;
    return `${origin}${path}`;
};


export default function OfficerProfile() {
    const token = getToken();
    const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const [profileImage, setProfileImage] = useState(default_image);
    const fileInputRef = useRef(null);

    const [basic, setBasic] = useState({ username: "", email: "" });
    const [info, setInfo] = useState({
        full_name: "",
        police_id: "",
        role: "",
        station:""
    });
    const [role,setRole] = useState("");

    const [isVerified, setIsVerified] = useState(false);

    const [loading, setLoading] = useState(true);
    const [imgBusy, setImgBusy] = useState(false);
    const [error, setError] = useState("");

    // ---------- load all data ----------
    useEffect(() => {
        let alive = true;
        async function load() {
            if (!token) return;
            setLoading(true);
            setError("");

            try {
                const [rBasic, rInfo, rPic, rVer] = await Promise.allSettled([
                    api.get("/police/get-username-email", auth),
                    api.get("/police/get-user-info", auth),
                    api.get("/police/get-profile-image", auth),
                    api.get("/police/check-email-verified", auth),
                ]);

                if (alive) {
                    // username + masked email
                    if (rBasic.status === "fulfilled") {
                        setBasic({
                            username: rBasic.value?.data?.user_name ?? "",
                            email: rBasic.value?.data?.email ?? "No email available",
                        });
                    }

                    // driver info
                    if (rInfo.status === "fulfilled") {
                        const p = rInfo.value?.data || {};
                        setInfo({
                            full_name: p.full_name ?? "",
                            police_id: p.police_id ?? "",
                            role: p.role ?? "",
                            station: p.station ?? "",
                        });
                        console.log(info.role);
                        switch (p.role) {
                            case "admin":
                                setRole("Admin");
                                break;
                            case "traffic_officer":
                                setRole("Traffic Officer");
                                break;
                            case "super_admin":
                                setRole("Super Admin");
                                break;
                            case "higher_police":
                                setRole("Higher police");
                                break;
                            default:
                                console.log("Invalid user role!");
                                break;
                        }
                    }

                    // profile image
                    if (rPic.status === "fulfilled") {
                        const full = toAbsolute(rPic.value?.data?.path);
                        if (full) {
                            const bust = `${full}${full.includes("?") ? "&" : "?"}t=${Date.now()}`;
                            setProfileImage(bust);
                            try { localStorage.setItem("driver_profile_img", bust); } catch {}
                            window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { url: bust } }));
                        }
                    }

                    // email verified
                    if (rVer.status === "fulfilled") {
                        setIsVerified(!!rVer.value?.data?.is_email_verified);
                    }
                }
            } catch (e) {
                if (alive) setError(e?.response?.data?.message || "Failed to load profile.");
            } finally {
                if (alive) setLoading(false);
            }
        }
        load();
        return () => {
            alive = false;
        };
    }, [token, auth]);

    // ---------- image upload ----------
    const onPickFile = () => fileInputRef.current?.click();

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!okTypes.includes(file.type)) {
            alert("Please choose a JPG, PNG, WEBP or GIF image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Image is too large (max 5 MB).");
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
                // notify header (and any other listeners)
                window.dispatchEvent(new CustomEvent("profile-image-updated", { detail: { url: bust } }));
            }
            alert("Profile image updated.");
        } catch (err) {
            console.error("Profile image upload failed:", err?.response?.data || err.message);
            alert(err?.response?.data?.message || "Image upload failed.");
        } finally {
            setImgBusy(false);
            // reset input so selecting the same file again still triggers change
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="container mt-4 mb-5 ">
            {/* top row */}
            <div className="row g-4">
                {/* LEFT: avatar + username/role */}
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
                                onError={(e) => {
                                    e.currentTarget.src = default_image;
                                }}
                                alt="Driver profile"
                                className="rounded-circle w-100"
                                style={{ objectFit: "cover", aspectRatio: "1 / 1", display: "block" }}
                            />
                            {/* hover overlay */}
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle overlay-hover">
                                <FaCamera size={28} />
                            </div>
                        </button>

                        {/* file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />

                        {/* online/verified dot (your existing component) */}
                        <div
                            className="position-absolute w-75 d-flex justify-content-center"
                            style={{ bottom: "11%", right: "40%", transform: "translate(50%, 50%)", zIndex: 1 }}
                        >
                            <OnlineStatus />
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mb-3 ">
            <span
                className="text-white text-center fs-5 rounded py-1 px-5"
                style={{ backgroundColor: "#332E90",width:"fit-content"}}
                title="Username"
            >
              {basic.username || "—"}
            </span>
                    </div>

                    <div className="d-flex justify-content-center">
            <span
                className="text-white text-center fs-6 rounded py-2 px-5"
                style={{ backgroundColor: "#332E90",width:"fit-content" }}
                title="Role"
            >
              {role}
            </span>
                    </div>
                </div>

                {/* RIGHT: details */}
                <div className="col-lg-8">
                    <div className="card bg-white rounded shadow p-4">
                        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

                        {loading ? (
                            <div className="text-muted">Loading profile…</div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <span className="info-label">Officer Full Name</span>
                                    <div className="info-value">{info.full_name || "Not available"}</div>
                                </div>

                                <div className="mb-3">
                                    <span className="info-label">Officer ID:</span>
                                    <div className="info-value">{info.police_id || "Not available"}</div>
                                </div>


                                <div className="mb-3 d-flex align-items-center gap-2">
                                    <div style={{ flex: 1 }}>
                    <span className="info-label ">Email
                    <span
                        className={`badge ${isVerified ? "bg-success m-1" : "bg-secondary m-1"}`}
                        title={isVerified ? "Email verified" : "Email not verified"}
                        style={{ width:"fit-content" }}
                    >
                    {isVerified ? "Verified" : "Not verified"}
                  </span>
                  </span>
                                        <div className="info-value">{basic.email || "No email available"}</div>
                                    </div>

                                </div>

                                <div className="mb-1">
                                    <span className="info-label">Police Station:</span>
                                    <div className="info-value">{info.station || "Not available"}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* (Optional) Vehicles block remains below if/when you wire real data */}
        </div>
    );
}

