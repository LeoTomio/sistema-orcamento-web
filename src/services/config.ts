const isLocal = import.meta.env.VITE_ENV === 'local';
export const baseUrl = isLocal ? import.meta.env.VITE_LOCAL_API_URL : import.meta.env.VITE_PROD_API_URL;
