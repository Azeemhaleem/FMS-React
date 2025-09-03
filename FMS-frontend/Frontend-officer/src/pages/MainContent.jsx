import "../styles.css";
import Footer from '../components/Footer.jsx';
import React, {useEffect, useState} from "react";
import Slidebar from "../components/Slidebar";
import Header from "../components/Header";
// import Quickbar from "../components/Quickbar";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminOverview from "../Components-admin/AdminOverview";
import AdminSettings from "../Components-admin/Admin-settings";
import AdminReport from "../Components-admin/Admin-report";
import AdminOfficers from "../Components-admin/Admin-officers";
import AdminMessages from "../Components-admin/Admin-messages";
import AdminDrivers from "../Components-admin/Admin-drivers";
import AdminTrafficPolice from "../Components-admin/Admin-trafficPolice.jsx";
import AdminHigherPolice from "../Components-admin/Admin-higherPolice.jsx";
import AssignTrafficPolice from "../Components-admin/AssignTrafficPolice.jsx";


import SuperAdminOverview from "../Components-Superadmin/SuperAdminOverview";
import SuperAdminSettings from "../Components-Superadmin/SuperAdmin-settings";
import SuperAdminReport from "../Components-Superadmin/SuperAdmin-report";
import SuperAdminOfficers from "../Components-Superadmin/SuperAdmin-officers";
import SuperAdminAdmins from "../Components-Superadmin/SuperAdmin-admins";
import SuperAdminMessages from "../Components-Superadmin/SuperAdmin-messages";
import SuperAdminFines from "../Components-Superadmin/SuperAdmin-fines";
import SuperAdminDrivers from "../Components-Superadmin/SuperAdmin-drivers";
import SuperAdminAnalytics from "../Components-Superadmin/SuperAdmin-analytics";
import SuperAdminAddNew from "../Components-Superadmin/SuperAdminAddNew";
import AccountCreationLogs from "../Components-Superadmin/AccountCreationLogs.jsx"
import ChargedFinesSadmin from "../Components-Superadmin/ChargedFinesSadmin.jsx"

import OfficerOverview from "../Components-officer/OfficerOverview";
import OfficerDashboard from "../Components-officer/OfficerDashboard.jsx";
import OfficerNotifications  from "../Components-officer/OfficerNotifications.jsx";
import OfficerSettings from "../Components-officer/OfficerSettings.jsx";
import OfficerProfile from "../Components-officer/OfficerProfile.jsx";


import ManageAppeal from "../Component-higherOfficer/ManageAppeal.jsx";
import ManageChargedFines from "../Component-higherOfficer/ManageChargedFines.jsx";
import ManageTrafficPolice from "../Component-higherOfficer/ManageTrafficPolice.jsx"
import PoliceProfile from "../components/PoliceProfile.jsx";




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

            
                      {role === "Admin" && (
              <>
                {type === "Overview" && <AdminOverview />}
                {type === "Settings" && <AdminSettings />}
                {type === "Report" && <AdminReport />}
                {type === "Officers" && <AdminOfficers />}
                {type === "Messages" && <AdminMessages />}
                {type === "Drivers" && <AdminDrivers />}
                {type === "trafficPolice" && <AdminTrafficPolice />}
                {type === "higherPolice" && <AdminHigherPolice />}
                {type === "assignOfficer" && <AssignTrafficPolice />}
                {type === "Profile" && <PoliceProfile />}
              </>
            )}
            {role === "SuperAdmin" && (
              <>
                {type === "Dashboard" && <SuperAdminOverview />}
                {type === "Settings" && <SuperAdminSettings />}
                {type === "Report" && <SuperAdminReport />}
                {type === "Officers" && <SuperAdminOfficers />}
                {type === "Admins" && <SuperAdminAdmins/>}
                {type === "Messages" && <SuperAdminMessages />}
                {type === "Fines" && <SuperAdminFines />}
                {type === "Drivers" && <SuperAdminDrivers />}
                {type === "Analytics" && <SuperAdminAnalytics />} 
                {type === "AddNew" && <SuperAdminAddNew />}
                {type === "AccountCreationLogs" && <AccountCreationLogs />}
                {type === "ChargedFinesSadmin" && <ChargedFinesSadmin />}
                {type === "Profile" && <PoliceProfile />}
              </>
            )} 
            {role === "Officer" && (
              <>
                {type === "Overview" && <OfficerOverview />}
                {type === "Dashboard" && <OfficerDashboard />}
                {type === "Notifications" && <OfficerNotifications />}
                {type === "Settings" && <OfficerSettings />}
                {type === "Profile" && <OfficerProfile/>}
              </>
            )}
            {role === "HigherOfficer" && (
              <>
                {type === "ManageAppeal" && <ManageAppeal />}
                {type === "ChargedFines" && <ManageChargedFines />}
                {type === "ManageTrafficPolice" && <ManageTrafficPolice/>}
                {type === "Profile" && <PoliceProfile />}
               
                </>
            )} 


              {/* <div className="m-0 d-none d-md-block"> <Quickbar role={role} /></div> */}
                
           

        </div>
        
      </div>
      <Footer/>
    </div>
</div>
  </>
  );
}

export default MainContent;