import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import Dashboard from "./modules/dashboard/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import Login from "./modules/login/Login";
import { LoadingProvider } from "./context/LoadingContext";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  )
}

export default App;
