import SuperAdminRoutes from "./Routes/SuperAdminRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
// import DriverRoutes from "./Routes/DriverRoutes";
import OfficerRoutes from "./Routes/OfficerRoutes";
import LoginRoutes from "./Routes/loginRoutes";
//import RegisterRoutes from "./Routes/RegisterRoutes";
import TestApiRoutes from "./Routes/testApiRoutes";
import HigherOfficerRoutes from "./Routes/HigherOfficerRoutes";
import { BrowserRouter} from "react-router-dom";

function App() {

  return (
  <BrowserRouter>
    <SuperAdminRoutes /> 
    <AdminRoutes /> 
    {/* <DriverRoutes/>  */}
    <OfficerRoutes/>
    <LoginRoutes/>
    <TestApiRoutes/>
    <HigherOfficerRoutes/>
  </BrowserRouter>
  );
}

export default App;
