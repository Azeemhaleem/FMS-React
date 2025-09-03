import React,{useState}from"react";

const Report=()=>{
  const[formData, setFormData]=useState({
    name:"",
    telephone:"",
    email:"",
    problem:"",
  });

  const[errorMessage,setErrorMessage]=useState("");

  return(
    <div
      className="container mt-5 p-4"
      style={{
        maxWidth:"600px",
        backgroundColor:"#e8f0ff",
        borderRadius:"15px",
        boxShadow:"0 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Name */}
      <div className="mb-3">
        <label className="form-label fw-bold">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="form-control"
          placeholder="Enter your name"
        />
      </div>

      {/* Telephone */}
      <div className="mb-3">
        <label className="form-label fw-bold">Telephone Number:</label>
        <input
          type="text"
          name="telephone"
          value={formData.telephone}
          onChange={(e) =>
            setFormData({ ...formData, telephone: e.target.value })
          }
          className="form-control"
          placeholder="Enter your telephone number"
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label fw-bold">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="form-control"
          placeholder="Enter your email"
        />
      </div>

      {/* Problem */}
      <div className="mb-3">
        <label className="form-label fw-bold">Problem:</label>
        <textarea
          name="problem"
          value={formData.problem}
          onChange={(e) =>
            setFormData({ ...formData, problem: e.target.value })
          }
          className="form-control"
          placeholder="Describe your problem"
          rows="3"
        ></textarea>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          onClick={()=>{
            if (
              !formData.name.trim() ||
              !formData.telephone.trim() ||
              !formData.email.trim() ||
              !formData.problem.trim()
            ) {
              alert("Please fill in all fields before submitting.");
            } else {
              
              console.log("Submitted Data:", formData);
              alert("Form submitted successfully!");
              setFormData({
                name:"",
                telephone:"",
                email:"",
                problem:"",
              });
            }
          }}
          className="btn btn-primary"
          style={{
            backgroundColor:"#3e2c86",
            border:"none",
            borderRadius:"20px",
            padding:"5px 20px",
          }}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={()=>{
            setFormData({
              name:"",
              telephone:"",
              email:"",
              problem:"",
            });
            
          }}
          className="btn btn-secondary"
          style={{
            backgroundColor:"#3e2c86",
            border:"none",
            borderRadius:"20px",
            padding:"5px 20px",
            color:"white",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Report;
