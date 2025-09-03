import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import api from "../api/axios";

const Account = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    nic: "",
    email: "",
    city: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null); // new
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch user details
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await api.get("/user");
        const user = res.data;

        setFormData((prev) => ({
          ...prev,
          username: user.username ?? "",
          nic: user.nic ?? "",
          email: user.email ?? "",
          city: user.address ?? "",
          phone: user.phone ?? "",
        }));

       const imageRes = await api.get("/driver/get-profile-image");
      if (imageRes.data && imageRes.data.path) {
        setPreviewImage(imageRes.data.path);
      } 

    } catch (err) {
      console.error("Error fetching profile:", err);
      setPreviewImage("/default-user.png"); // fallback
    }
  };

    fetchDriver();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file)); // show preview
    }
  };

  const toggleEdit = () => setIsEditMode(true);
  const handleCancel = () => setIsEditMode(false);

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("address", formData.city);
      if (profileImage) {
        form.append("image", profileImage);
      }

       //Debug FormData before sending
    for (let pair of form.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

      // Update profile
      await api.post("/driver/upload-profile-image", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Optional: Change password
      if (formData.currentPassword && formData.newPassword && formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          return alert("New and confirm password do not match.");
        }

        await api.post("/driver/change-password", {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          new_password_confirmation: formData.confirmPassword,
        });
      }

      alert("Profile updated successfully!");
      setIsEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      alert("Update failed. See console.");
    }
  };

  return (
    <div className="container py-4" style={{ backgroundColor: "#b3d1ff", minHeight: "100vh" }}>
      <div className="mx-auto bg-white p-4 rounded-4 shadow" style={{ maxWidth: "600px" }}>
        <h4 className="fw-bold mb-4">{isEditMode ? "Edit Profile" : "Account"}</h4>

        <div className="text-center mb-3">
          <div className="position-relative d-inline-block">
            <img
              src={previewImage}
              alt="Profile"
              className="rounded-circle border"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
            {isEditMode && (
              <div className="position-absolute bottom-0 end-0">
                <label className="btn btn-sm btn-primary rounded-circle p-1 mb-0" htmlFor="profileImage">
                  <FaEdit size={16} />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Fields */}
        {[
          { label: "Username", field: "username" },
          { label: "NIC", field: "nic" },
          { label: "Email", field: "email" },
          { label: "City/Town", field: "city" },
          { label: "Telephone Number", field: "phone" },
        ].map(({ label, field }, idx) => (
          <div className="row mb-3 align-items-center" key={idx}>
            <div className="col-4 text-end fw-semibold">{label}:</div>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                readOnly={!isEditMode || field === "nic"} // NIC remains read-only
                style={{
                  backgroundColor: !isEditMode || field === "nic" ? "#eaeaea" : "#fff",
                }}
              />
            </div>
          </div>
        ))}

        {/* Buttons */}
        {!isEditMode ? (
          <div className="text-end">
            <button className="btn btn-primary" onClick={toggleEdit}>
              <FaEdit className="me-2" />
              Edit
            </button>
          </div>
        ) : (
          <>
            <hr />
            <h6 className="fw-bold mb-3">Change Password</h6>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              className="form-control mb-2"
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="form-control mb-2"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="form-control mb-4"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-primary px-4" onClick={(e) => { e.preventDefault(); handleSave(); }}>
                Save Changes
              </button>
              <button className="btn btn-secondary px-4" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
