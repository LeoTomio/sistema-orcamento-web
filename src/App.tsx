import { Navigate, Route, Routes } from "react-router-dom";
import { SessionExpiredCard } from "./components/SessionExpiredCard";
import { LoadingProvider } from "./context/LoadingContext";
import Dashboard from "./modules/dashboard/Dashboard";
import Login from "./modules/login/Login";
import PageLayout from "./components/layout/PageLayout";
import Budgets from "./modules/budgets/Budget";
import Products from "./modules/products/Product";
import Materials from "./modules/materials/Material";
import Clients from "./modules/clients/Client";
import Users from "./modules/user/User";
import Register from "./modules/register/Register";

function App() {
  return (
    <LoadingProvider>
      <Routes>

        <Route path="/" element={<PageLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/products" element={<Products />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/user" element={<Users />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastrar" element={<Register />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>

      <SessionExpiredCard />
    </LoadingProvider>
  )
}

export default App;
