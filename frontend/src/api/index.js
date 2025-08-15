import axios from "axios";

// Set the base URL to your deployed backend
const api = axios.create({
  baseURL: "https://my-backend-n3nx.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add a request interceptor to attach token if using authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or wherever you store your token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
