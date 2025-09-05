
import DriverRoutes from "./Routes/DriverRoutes";
import LoginRoutes from "./Routes/LoginRoutes";
// import RegisterRoutes from "./Routes/RegisterRoutes";
import TestApiRoutes from "./Routes/testApiRoutes";
import { BrowserRouter} from "react-router-dom";
import PaymentRoutes from "./Routes/PaymentRoutes"

function App() {

  return (
  <BrowserRouter>
    <DriverRoutes/>
    <LoginRoutes/>
    <PaymentRoutes/>
    <TestApiRoutes/>
  </BrowserRouter>
  );
}

export default App;