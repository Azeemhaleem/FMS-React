import "../styles.css";
import Footer from '../components/Footer.jsx';
import React, {useEffect, useState} from "react";
import Slidebar from "../components/Slidebar";
import Header from "../components/Header";
// import Quickbar from "../components/Quickbar";
import "bootstrap/dist/css/bootstrap.min.css";


import DriverOverview from "../Components-driver/DriverOverview";
import DriverSettings from "../Components-driver/DriverSettings";
import DriverAppeal from "../Components-driver/DriverAppeal";
import DriverMessages from "../Components-driver/DriverMessages";
import DriverProfile from "../Components-driver/DriverProfile";
import DriverPayment from "../Components-driver/DriverPayment";
import Account from "../Components-driver/Account";
import Privacy from "../Components-driver/Privacy";
import About from "../Components-driver/About";
import DriverMyFines from "../Components-driver/DriverMyFines.jsx";

// import PoliceProfile from "../components/PoliceProfile.jsx";




function MainContent({ username,image,role,type }) {



  const [messages, setMessage] = useState([]);
  //   useEffect(() => {
  //     const newMessages = [
  //       { id: 1, text: "Your payment Approved" },
  //       { id: 2, text: "Your payment Approved" },
  //       { id: 3, text: "UYour payment Approved" },
  //     ];
  //     setMessage(newMessages);
  //     document.title = "Driver Portal";
  //   }, []);
  // const date = new Date();
  // const formattedDate = `${date.getDate()}-${
  //   date.getMonth() + 1
  // }-${date.getFullYear()}`;

  // function closeTag() {
  //   const tag1 = document.getElementById("tag-1");
  //   const tag2 = document.getElementById("tag-2");
  //   tag1.style.display = "none";
  //   tag2.style.display = "none";
  // }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
    <div className="DriverPortal" id="DriverPortal">
    <button
        className="btn btn-dark d-md-none "
        style={{padding:"4%",paddingRight:"80%"}}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
    <Header username={username} image={image} role={role} messages={messages} />
    <div className="dashboard">
      <div className="row" style={{width:"100%"}} >
      
      {/* Desktop Sidebar */}
        <div className="m-0 d-none d-md-block col-2 align-items-left min-h-screen block" style={{backgroundColor: "#fff", }}>
          <Slidebar messages={messages} role={role} />
        </div>

      {/* Mobile Sidebar Overlay (conditioned with sidebarOpen) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        >
          <div className="sidebar-mobile bg-white shadow-sm">
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            <Slidebar messages={messages} role={role} />
          </div>
        </div>


        <div className="col-9" style={{marginTop:"3%",gap:"10px",marginLeft:"5%"}}>
          {/* <h2 className="pt-2 px-0 m-0">
            <b>{type}</b>
          </h2>
          <span className="tag-1" id="tag-1">
            <p className="bg-secondary px-4">{formattedDate}</p>
          </span>
          <span className="tag-2" id="tag-2">
            <p className="ms-2" onClick={closeTag}>
              <FontAwesomeIcon
                icon={faCircleXmark}
                style={{ fontSize: "larger" }}
              />
            </p>
          </span> */}

              {role==="Driver"&&(
              <>
              {type === "Dashboard" && <DriverOverview />}
              {type === "Settings" && <DriverSettings />}
              {type === "Appeal" && <DriverAppeal />}
              {type === "My Profile" && <DriverProfile />}
              {type === "Messages" && <DriverMessages />}
              {type === "Payment" && <DriverPayment />}
              {type === "Account" && <Account />}
              {type === "Privacy" && <Privacy />}
              {type === "About" && <About />}
              {type === "My Fines" && <DriverMyFines />}
              </>
              )}






              {/*<div className="m-0 d-none d-md-block"> <Quickbar role={role} /></div>*/}
                
           

        </div>
        
      </div>
      <Footer/>
    </div>
</div>
  </>
  );
}

export default MainContent;