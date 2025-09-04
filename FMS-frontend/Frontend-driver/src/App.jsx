
import DriverRoutes from "./Routes/DriverRoutes";
import LoginRoutes from "./Routes/LoginRoutes";
// import RegisterRoutes from "./Routes/RegisterRoutes";
import TestApiRoutes from "./Routes/testApiRoutes";
import { BrowserRouter} from "react-router-dom";

function App() {

  return (
  <BrowserRouter>
    <DriverRoutes/>
    <LoginRoutes/>

    <TestApiRoutes/>
  </BrowserRouter>
  );
}

export default App;