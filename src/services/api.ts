import axios from "axios";
import { toast } from "sonner";

const localUrl = "http://localhost:3000/api";
const prodUrl = "https://sistema-orcamento-api-sgii.vercel.app/api"; 
const BASE_URL = prodUrl

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
  (error) => Promise.reject(error)
);

api.interceptors.response.use((response) => response, (error) => {
  const url = error.config?.url;

  if (error.response) {
    if (error.response.status === 401 && url !== "/auth/login") {
      window.dispatchEvent(new Event("session-expired"));
      return Promise.reject(error);
    }

    const msg = error.response.data?.message || error.response.data || "Ocorreu um erro inesperado";
    toast.error(msg);

  } else if (error.request) {
    toast.error("Não foi possível conectar ao servidor.");

  } else {
    toast.error("Erro inesperado: " + error.message);
  }
  return Promise.reject(error);
}
);