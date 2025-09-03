import React, { useState } from "react";
import api from "../api/axios";
import "./styles-admin.css"

function AdminHigherPolice() {
  

  const [formData, setFormData] = useState({
    police_id: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [messageType, setMessageType] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});
    setMessageType(null);

    if (formData.password !== formData.password_confirmation) {
      setErrors({
        password_confirmation: "Password confirmation does not match.",
      });
      return;
    }
    
    const password = formData.password;
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      setErrors({
        password: "Password must be at least 8 characters with uppercase, lowercase, number and symbol.",
      });
      return;
    }
    

    console.log("Higher Officer Registration Data:", formData);

    try {
      const response = await api.post("/admin/register-higher-police", formData);
      setMessage(response.data.message || response.data.messege || "Higher Police registered successfully.");
      setMessageType("success");
    } catch (err) {
      if (err.response) {
        const data = err.response.data;

        if (data.errors) {
          setErrors(data.errors);
          setMessageType("error");
        } else if (data.messege) {
          setMessage(data.messege);
          setMessageType("error");
        } else {
          setMessage("An unexpected error occurred.");
          setMessageType("error");
        }
      } else {
        setMessage("Network error. Please try again.");
        setMessageType("error");
      }
    }
  };

  return (
    <>
    <div
        className="search-section container mb-5 d-flex justify-content-center align-items-center "
        style={{
          backgroundColor: "#d3e2fd",
          padding: "1rem",
          marginLeft: window.innerWidth < 576 ? "2rem" : "3rem"

        }}
    >
       <div
          className="card shadow p-4 px-3 px-sm-5 mt-3 mb-3"
          style={{
            backgroundColor: "#f7f9fc",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "1rem"
          }}
        >
    <h2 className="text-xl font-semibold mb-4  text-center">Higher Officer Registration</h2>

          {message && (
            <p className="response-message" style={{ color: messageType === "error" ? "red" : "green" }}>{message}</p>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="response-errors" style={{ color: "red" }}>
              {Object.keys(errors).map((key) => (
                <p key={key}>{errors[key]}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="police_id"
              placeholder="Police ID"
              value={formData.police_id}
              onChange={handleChange}
              required
              className=" w-full p-2 mb-4 border rounded"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="d-flex justify-content-end mt-3 mb-3">
            <button type="submit" className="btn btn-dark w-100 w-md-auto">
              Register
            </button>
            </div>
          </form>
        </div>
      </div>
    
    </>
  );
}

export default AdminHigherPolice;
