import "../Components-Superadmin/styles/overview-styles.css"
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercentage, faPause, faChartLine ,} from '@fortawesome/free-solid-svg-icons';
import { FaClipboard, FaPencilAlt, FaUser } from "react-icons/fa";

function AdminOverview() {


  const options = {
    chart: {
      height: 150,
      type: "radialBar",
      toolbar: {
        show: false, 
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
        },
        track: {
          background: "#d6dfff", 
          strokeWidth: "100%",
        },
        dataLabels: {
          show: true,
          name: {
            show: false, 
          },
          value: {
            formatter: function (val) {
              return `${val}%`;
            },
            fontSize: "22px",
            fontWeight: "bold",
            color: "#6e6e6e",
            show: true,
          },
        },
      },
    },
    fill: {
      colors: ["#6A5ACD"],
      stops: [0, 100], 
    },
    stroke: {
      lineCap: "round",
    },
  };

    const iconStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50px',
      width: '50px',
      borderRadius: '50%',
      backgroundColor: '',
      color: 'white',
    };
  
  

  const finePrecentage=[81];
  const paymentCollectedPrecentage=[60];
  const paymentProccessingPrecentage=[50];



   const recentFines = {
     fine1: [
       { name:"Sandali shela", licenseId: "851234",fineId:"6789",payment:"Due",status:"Approved" },
     ],
     fine2: [
       { name: "Sarasi", licenseId: "45678",fineId:"6789",payment:"Due",status:"Declined" },
     ],
     fine3: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine4: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine5: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Approved" },
     ],
     fine6: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine8: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Approved" },
     ],
     fine9: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine14: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine10: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine11: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine12: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
     fine13: [
       { name: "Sandali", licenseId: "12345",fineId:"6789",payment:"Due",status:"Pending" },
     ],
   }  ;

    return(
      
        <>
    
  
    <div className="row mt-4 mb-5" >
   
    
      {/* first colomn */}
        <div className="col-12 col-lg-9 mb-4">
        {/* card row */}
        <div className="row  card-row">

        <div className="card-info">
        <div style={{ ...iconStyle, backgroundColor: 'purple' }}>
        <FontAwesomeIcon style={{padding:"5px",margin:"5px"}} icon={faPercentage} />
      </div>

          <div class="d-flex justify-content-between align-items-center" style={{margin:"15px"}}>
                <div class="flex-grow-1" >
                  <h5 class="mb-0 fw-bold">Total Fines Recorded</h5>
                  <h6 class="mb-0 text-dark">LKR 25,0240</h6>
                  <small class="text-muted">Last 7 Days</small>
                </div>
                <div class="circle-chart">
                <Chart options={options} series={finePrecentage} type="radialBar" height={350} />
                </div>
         </div>
        </div>
        <div className="card-info">

        <div style={{ ...iconStyle, backgroundColor: 'red' }}>
        <FontAwesomeIcon style={{padding:"5px",margin:"5px"}} icon={faPause} />
      </div>

          <div class="d-flex justify-content-between align-items-center" style={{margin:"15px"}}>
                <div class="flex-grow-1" >
                  <h5 class="mb-0 fw-bold">Total Payment Collected</h5>
                  <h6 class="mb-0 text-dark">LKR 25,0240</h6>
                  <small class="text-muted">Last 7 Days</small>
                </div>
                <div class="circle-chart">
                <Chart options={options} series={paymentCollectedPrecentage} type="radialBar" height={350} />
                </div>
         </div>
         
        </div>
        <div className="card-info">

        <div style={{ ...iconStyle, backgroundColor: 'green' }}>
        <FontAwesomeIcon style={{padding:"5px",margin:"5px"}} icon={faChartLine} />
      </div>

          <div class="d-flex justify-content-between align-items-center"style={{margin:"15px"}}>
                <div class="flex-grow-1" >
                  <h5 class="mb-0 fw-bold">Total Payment Processing</h5>
                  <h6 class="mb-0 text-dark">LKR 25,0240</h6>
                  <small class="text-muted">Last 7 Days</small>
                </div>
                <div class="circle-chart">
                <Chart options={options} series={paymentProccessingPrecentage} type="radialBar" height={350} />
                </div>
         </div>
        </div>
      </div>

      {/* recent fines row */}
    <div className="col-12 col-md-12 col-lg-8 ">
   
    <div className="row-1 recent-fines mt-3" style={{marginLeft:"15%"}}>
    <div className="container mt-4" style={{padding:"0"}}>
      <h5 className="fw-bold mb-3 text-black text-center" >Recent Updates</h5>
      <div className="card shadow-sm p-3 rounded-4 mx-auto w-100" 
      style={{ 
        maxWidth: "100%", 
        width: "100%" }}
      >

        {/* Update 1 */}
          
          <div className="mb-2">
          <p className="mb-1" style={{ fontSize:'0.9rem'  }}>
             <span className="small fw-bold">MIKE TYSON</span>{" "}<span className="small text-muted mb-1">paid 2000LKR
            Fine ID - 2532 License No - 3456</span>{" "}
            <div className="small text-muted min">2 Minutes Ago</div>
            </p>
          </div> 
        <hr />
        {/* Update 2 */}
        <div className="mb-2">
          <p className="mb-1" style={{ fontSize: '12px' }}>
            <span className="small fw-bold">DIANA AYI</span>{" "}
            <span className="small text-muted mb-1">
              violation Recorded Fine ID - 3675 License No - 2254
            </span>{" "}
            <div className="small text-muted min">2 Minutes Ago</div>
          </p>

          </div> 

        <hr />
        {/* Update 3 */}
        <div className="mb-2">
           
            <p className="mb-1"style={{ fontSize: '12px' }}>
             <span className="small fw-bold">MIKE TYSON</span>{" "}<span className="small text-muted mb-1"> account created as a driver
             License No - 3378</span>{" "}
            <div className="small text-muted min">5 Minutes Ago</div></p>
          </div>
        </div>
    
      </div>
    </div>
    </div>
    </div>

      {/* second colomn */}
   <div className="col-12 col-lg-3 mt-2" >
      <div className="container">
      
  {/* Sale Analytics Section */}
  <div className="row  sale-analytics" style={{marginLeft:"15%"}}>
 

      {/* Recorded Fines */}
      <div className="d-flex align-items-center justify-content-between p-3 mb-4 rounded-4" 
      style={{ 
          backgroundColor: "#fff5f5",
          boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
         
        }}>
        <div className="d-flex align-items-center">
          <div className="rounded-circle align-items-center me-3"
            style={{
              backgroundColor: "#5A4CD1",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%", padding: "9.5px" 
            }}
          >
        <FaClipboard color="#fff" size="20px" />
          </div>
          <div>
            <p className="mb-1 fw-bold" style={{ fontSize: "12px" }}>RECORDED FINES</p>
            <p className="small text-muted mb-0">Last 24 hours</p>
          </div>
        </div>
        <div>
          <p className="fw-bold text-success mb-1">+39%</p>
          <p className="fw-bold fs-5 mb-0">203</p>
        </div>
      </div>

      {/* Payment Received */}
      <div
        className="d-flex align-items-center justify-content-between p-3 mb-4 rounded-4"
        style={{ 
          backgroundColor: "#fff5f5",
          boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px"
        }}
      >
        <div className="d-flex align-items-center">
        <div className="rounded-circle align-items-center me-3"
            style={{
              backgroundColor: "#FF5C5C",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%", padding: "9.5px" 
            }}
          >
        <FaPencilAlt color="#fff" size="20px" />
          </div>
          <div>
            <p className="mb-1 fw-bold fs-10" style={{ fontSize: "12px" }}>PAYMENT RECEIVED FINES</p>
            <p className="small text-muted mb-0">Last 24 hours</p>
          </div>
        </div>
        <div>
          <p className="fw-bold text-danger mb-1">-17%</p>
          <p className="fw-bold fs-5 mb-0">102</p>
        </div>
      </div>

      {/* New Drivers */}
      <div
        className="d-flex align-items-center justify-content-between p-3 mb-4 rounded-4"
        style={{ 
          backgroundColor: "#fff5f5",
          boxShadow: "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px"
        }}
      >
        <div className="d-flex align-items-center">
        <div className="rounded-circle align-items-center me-3"
            style={{
              backgroundColor: "#00FF94",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%", padding: "9.5px" 
            }}
          >
        <FaUser color="#fff" size="20px" />
          </div>
          <div>
            <p className="mb-1 fw-bold" style={{ fontSize: "12px" }}>NEW DRIVERS</p>
            <p className="small text-muted mb-0">Last 24 hours</p>
          </div>
        </div>
        <div>
          <p className="fw-bold text-success mb-1">+25%</p>
          <p className="fw-bold fs-5 mb-0">300</p>
        </div>
      </div>
      </div>
      
      
    </div>
  </div>


</div>

  
</>

    );

    
}

export default AdminOverview;
