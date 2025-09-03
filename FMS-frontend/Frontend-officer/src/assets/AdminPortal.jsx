import React from "react";
import Header from "./Header";
import Dashboard from "./Dashboard";
import Quickbar from "./Quickbar";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function AdminPortal({ username, image, role }) {
  return (
    <div className="DriverPortal" id="DriverPortal">
      <Header username={username} image={image} role={role} />
      <Dashboard role={role} />
      <Quickbar role={role} />
    </div>
  );
}

export default AdminPortal;
