import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Toaster } from 'sonner'
import './styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

createRoot(rootElement).render(
  <StrictMode>
    <Toaster closeButton richColors/>
    <App />
  </StrictMode>
);
