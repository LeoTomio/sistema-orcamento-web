import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "./config";

const activeToasts = new Set<string>();

const showToast = (message: string) => {
  if (activeToasts.has(message)) return;

  activeToasts.add(message);
  toast.error(message, {
    onDismiss: () => activeToasts.delete(message),
    onAutoClose: () => activeToasts.delete(message),
  });
};

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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

    if (error.response.status === 403) {
      window.dispatchEvent(new Event("subscription-expired"));
      return Promise.reject(error);
    }

    const msg = error.response.data?.message || error.response.data || "Ocorreu um erro inesperado";
    showToast(msg);

  } else if (error.request) {
    showToast("Não foi possível conectar ao servidor.");
  } else {
    showToast("Erro inesperado: " + error.message);
  }
  return Promise.reject(error);
});