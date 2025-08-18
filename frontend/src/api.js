import axios from "axios";

const api = axios.create({
  baseURL: "https://my-backend-n3nx.onrender.com/api", // your deployed backend
});

export default api;
