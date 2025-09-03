import "../Components-Superadmin/styles/driver-style.css"
import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function AdminDrivers() {
  const drivers = [
    {
      LicenseNumber: "12345666",
      DriverName: "Sandali Shela",
      IdNumber: "200251589789",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      LicenseNumber: "75675666",
      DriverName: "Sarasi",
      IdNumber: "2002565459789",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      LicenseNumber: "12564632666",
      DriverName: "Mohamad Azeem",
      IdNumber: "2002576743789",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      LicenseNumber: "89762366",
      DriverName: "Rikaf",
      IdNumber: "20025158322446",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      LicenseNumber: "120532422",
      DriverName: "Sanjaya",
      IdNumber: "20043639789",
      Email: "saead@gmail.com",
      ContactNumber: "0731234244",
    },
    {
      LicenseNumber: "1987662",
      DriverName: "Chandira",
      IdNumber: "2005334289",
      Email: "syujkfdd@gmail.com",
      ContactNumber: "0708343242",
    },
  ];
  const [query, setQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Memoized filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(
      (driver) =>
        driver.DriverName.toLowerCase().includes(query.toLowerCase()) ||
        driver.LicenseNumber.includes(query)
    );
  }, [query]);

  const handleRowClick = (driver) => {
    setSelectedDriver(driver);
  };

  return (
    <div
      className="search-section container"
      style={{
        backgroundColor: "#d3e2fd",
      }}
    >
     
      <div
        className="d-flex justify-content-center mb-3"
        style={{ width: "100%" }}
      >
        <div className="d-flex justify-content-center mb-3" style={{ marginTop:"2%",width:"85%"}}>
                  <input
                    type="text"
                    className="form-control"
                    value={query}
                    placeholder="Name / license number"
                    style={{ fontSize: "small", width: "100%"  }}
                    onChange={(e) =>{
                      setQuery(e.target.value);
                      setSelectedDriver(null);  
                    }}
                  />
                  <button className="btn btn-info"  style={{ width: "5%", color: "white",marginLeft:"3px" }}>
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
         </div>
      </div>

      
      {!selectedDriver&& (
        <table className="table table-striped table-hover ">
          <thead>
            <tr>
              <th>License Number</th>
              <th>Driver Name</th>
              <th>ID Number</th>
              <th>Email</th>
              <th>Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.slice(0, 5).map((driver, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(driver)}
                style={{ cursor: "pointer" }}
              >
                <td>{driver.LicenseNumber}</td>
                <td>{driver.DriverName}</td>
                <td>{driver.IdNumber}</td>
                <td>{driver.Email}</td>
                <td>{driver.ContactNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedDriver && (
        <div
          className="card mt-4"
          style={{ backgroundColor: "#f7f9fc", padding: "20px" , fontSize: "small"}}
        >      


    <div>
      <span class="info-label">License Number:</span>
      <div class="info-value"> {selectedDriver.LicenseNumber}</div>
    </div>
    <div>
      <span class="info-label">Driver Name:</span>
      <div class="info-value"> {selectedDriver.DriverName}</div>
    </div>
    <div>
      <span class="info-label">Email:</span>
      <div class="info-value">{selectedDriver.Email}</div>
    </div>
    <div>
      <span class="info-label">Contact Number:</span>
      <div class="info-value">{selectedDriver.ContactNumber}</div>
    </div>
  </div>
       
      )}
    </div>
  );
}

export default AdminDrivers;
