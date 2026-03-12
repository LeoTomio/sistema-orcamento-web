import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request para login (comentado por enquanto)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Interceptor de response para capturar erros e mostrar toast
api.interceptors.response.use(
  (response) => response, // sucesso
  (error) => {
    if (error.response) {
      // Erro retornado pelo backend (status 4xx ou 5xx)
      const msg =
        error.response.data?.message || // se o backend mandar { message: '...' }
        error.response.data ||          // ou qualquer coisa que venha no body
        "Ocorreu um erro inesperado";

      toast.error(msg);
    } else if (error.request) {
      // requisição feita mas sem resposta
      toast.error("Não foi possível conectar ao servidor.");
    } else {
      // outro erro inesperado
      toast.error("Erro inesperado: " + error.message);
    }

    return Promise.reject(error);
  }
);

// Interceptor de response para login (comentado por enquanto)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );