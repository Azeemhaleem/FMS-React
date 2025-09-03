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
      { icon: faTableColumns, text: "My Fines",link:"/DriverMyFines" },
      { icon: faCreditCard, text: "Payment",link:"/DriverPayment" },
      { icon: faCommentDots, text: "Messages",link:"/DriverMessages" },
      { icon: faFile, text: "Appeal",link:"/DriverAppeal" },
      { icon: faGear, text: "Settings",link: "/DriverSettings"},
      { icon: faUser, text: "My Profile",link:"/DriverProfile" }
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
