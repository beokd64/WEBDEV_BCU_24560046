import axios from "axios";

const API_URL = "https://my-backend-n3nx.onrender.com"; // your backend URL

export default axios.create({
  baseURL: API_URL,
});
