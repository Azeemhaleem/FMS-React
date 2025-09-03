import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faUser,
  faCreditCard,
  faChartLine,
  faCommentDots,
  faFile,
  faGear,
  faTableList,
  faClipboard,
  faPlusCircle,
  faDashboard,
  faBell,

} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";


function Slidebar({ messages, role }) {
  const sidebarOptions = {
    Driver: [
      { icon: faTableColumns, text: "Overview",link:"/DriverOverview" },
      { icon: faUser, text: "My Profile",link:"/DriverProfile" },
      { icon: faCreditCard, text: "Payment",link:"/DriverPayment" },
      { icon: faCommentDots, text: "Messages",link:"/DriverMessages" },
      { icon: faFile, text: "Appeal",link:"/DriverAppeal" },
      { icon: faGear, text: "Settings",link: "/DriverSettings"},
    ],
    // Policeman: [
    //   { icon: faTableColumns, text: "Overview" },
    //   { icon: faFile, text: "Report" },
    //   { icon: faChartLine, text: "Analytics" },
    // ],
    Admin: [
      { icon: faTableColumns, text: "Overview",link:"/AdminOverview" },
      { icon: faChartLine, text: "higher police",link:"/AdminHigherPolice" },
      { icon: faCommentDots, text: "Messages",link:"/AdminMessages" },
      { icon: faPlusCircle, text: "traffic police",link:"/AdminTrafficPolice" },
      { icon: faGear, text: "Settings",link:"/AdminSettings" },
      { icon: faUser, text: "Profile",link:"/AdminProfile" },
    ],
    SuperAdmin: [
      { icon: faTableColumns, text: "Overview",link:"/SuperAdminOverview" },
      { icon: faUser, text: "Admins",link:"/SuperAdminAdmins" },
      { icon: faTableList, text: "Fines",link:"/SuperAdminFines" },
      { icon: faPlusCircle, text: "Add New",link:"/SuperAdminAddNew" },
      { icon: faTableList, text: "Charged fines",link:"/ChargedFinesSadmin" },
      { icon: faFile, text: "Logs",link:"/AccountCreationLogs" },
      { icon: faUser, text: "Drivers",link:"/SuperAdminDrivers" },
      { icon: faClipboard, text: "Police",link:"/SuperAdminOfficers" },
      { icon: faChartLine, text: "Analytics",link:"/SuperAdminAnalytics" },
      { icon: faCommentDots, text: "Messages",link:"/SuperAdminMessages" },
      { icon: faGear, text: "Settings",link:"/SuperAdminSettings" },
      { icon: faUser, text: "Profile",link:"/SuperAdminProfile" },
      
      
    ],
    Officer: [
      { icon: faTableColumns, text: "Overview",link:"/OfficerOverview" },
      { icon: faDashboard, text: "Dashboard",link:"/OfficerDashboard" },
      { icon: faBell, text: "Notifications",link:"/OfficerNotifications" },
      { icon: faGear, text: "Settings",link:"/OfficerSettings" },
      { icon: faUser, text: "Profile",link:"/OfficerProfile" },
    ],
    HigherOfficer: [
      { icon: faFile, text: "Appeal",link:"/ManageAppeal" },
      { icon: faTableList, text: "Fines",link:"/ManageChargedFines" },
      { icon: faUser, text: "Traffic Officers",link:"/ManageTrafficPolice" },
      { icon: faUser, text: "Profile",link:"/HigherOfficerProfile" },
      ],
  };



  return (
    <>
    <nav className="sidebar min-h-screen pb-5">
  {sidebarOptions[role]?.map((item, index) => (
    <div key={index} className="sidebar-links mb-2">
    <Link to={item.link}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <FontAwesomeIcon icon={item.icon} style={{ fontSize: "20px", marginRight: "10px" }} />
        <span>{item.text}</span>
      </div>
    </Link>
  </div>
  
  ))}
</nav>

    </>
  );
}

export default Slidebar;
