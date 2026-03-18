import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Toaster } from 'sonner'
import './styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

createRoot(rootElement).render(
  <StrictMode>

    <BrowserRouter>
      <AuthProvider>
        <Toaster closeButton richColors />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
