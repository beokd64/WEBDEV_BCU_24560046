import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Transactions() {
  const { token, user, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: "expense", category: "", amount: "", description: "" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchTransactions();
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data || []);
    } catch {
      setError("Failed to fetch transactions");
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transactions", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ type: "expense", category: "", amount: "", description: "" });
      fetchTransactions();
    } catch {
      setError("Failed to add transaction");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
    } catch {
      setError("Failed to delete transaction");
    }
  };

  // 🔒 Calls your backend /api/ai; backend calls OpenAI with secret key
  const askAI = async () => {
    if (!aiPrompt.trim()) return;
    try {
      const res = await api.post("/ai", { prompt: aiPrompt });
      setAiReply(res.data.reply || "");
      setAiPrompt("");
    } catch {
      setAiReply("Error: could not reach AI.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <button onClick={logout} className="text-sm underline">Logout</button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={addTransaction} className="grid gap-2 grid-cols-5 mb-6">
        <select name="type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="border p-2 rounded col-span-1">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input name="category" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="border p-2 rounded col-span-1" />
        <input name="amount" type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" className="border p-2 rounded col-span-1" />
        <input name="description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="border p-2 rounded col-span-1" />
        <button className="bg-blue-600 text-white rounded px-4">Add</button>
      </form>

      <div className="mb-6">
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder='Ask AI, e.g. "Summarize recent expenses"' className="border p-2 rounded w-full mb-2" />
        <button onClick={askAI} className="bg-green-600 text-white rounded px-4 py-2">Ask AI</button>
        {aiReply && <div className="mt-3 p-2 border rounded bg-gray-50 whitespace-pre-wrap">{aiReply}</div>}
      </div>

      <ul className="space-y-2">
        {transactions.map((t) => (
          <li key={t._id} className="flex justify-between border p-2 rounded">
            <div>
              <div className="font-semibold">{t.type} • {t.category} • ${t.amount}</div>
              <div className="text-sm text-gray-600">{t.description}</div>
            </div>
            <button onClick={() => remove(t._id)} className="text-red-600">Delete</button>
          </li>
        ))}
        {!transactions.length && <li className="text-gray-500">No transactions yet.</li>}
      </ul>
    </div>
  );
}
