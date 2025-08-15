import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow w-full max-w-sm">
        <h2 className="mb-4 text-2xl font-semibold text-center">Login</h2>
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <input type="email" placeholder="Email"
          className="border p-2 w-full mb-2 rounded"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-gray-900 text-white px-4 py-2 rounded">Login</button>
        <p className="text-sm mt-3 text-center">
          No account? <Link className="underline" to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
