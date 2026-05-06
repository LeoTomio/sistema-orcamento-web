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
import Plans from "./modules/plans/Plan";

function App() {
  return (
    <LoadingProvider>
      <Routes>

        <Route path="/" element={<PageLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orcamentos" element={<Budgets />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/materiais" element={<Materials />} />
          <Route path="/usuario" element={<Users />} />
          <Route path="/planos" element={<Plans />} />
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
