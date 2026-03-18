import { Navigate, Route, Routes } from "react-router-dom";
import { SessionExpiredCard } from "./components/SessionExpiredCard";
import { LoadingProvider } from "./context/LoadingContext";
import Dashboard from "./modules/dashboard/Dashboard";
import Login from "./modules/login/Login";

function App() {
  return (
    <LoadingProvider>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>

        <SessionExpiredCard /> 
    </LoadingProvider>
  )
}

export default App;
