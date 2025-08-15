import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { formatCurrency } from "../utils/currency";

export default function Transactions() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
  });

  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const CURRENCY = "USD";
  const RATE = 1;

  const fetchTransactions = async () => {
    const res = await api.get("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(res.data || []);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return alert("Fill all fields!");
    await api.post(
      "/api/transactions",
      { ...form, amount: Number(form.amount) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setForm({ type: "expense", category: "", amount: "", description: "" });
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`/api/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTransactions();
  };

  // AI Assistant handler
  const handleAiCommand = async () => {
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post(
        "/api/assistant",
        { message: aiMessage, userId: localStorage.getItem("userId") },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.transactions) {
        setTransactions(res.data.transactions);
      }

      if (res.data.reply) {
        console.log("AI reply:", res.data.reply);
      }

      setAiMessage("");
    } catch (err) {
      console.error("AI Error:", err);
      alert("AI assistant failed to process your request.");
    }
    setAiLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Transactions</h1>

      {/* AI Assistant Command */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={aiMessage}
          onChange={(e) => setAiMessage(e.target.value)}
          placeholder='Ask AI: e.g. "Add 15 for coffee" or "Delete transaction 3"'
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleAiCommand}
          disabled={aiLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {aiLoading ? "Processing..." : "Ask AI"}
        </button>
      </div>

      {/* Manual Add Transaction Form */}
      <form onSubmit={addTransaction} className="mb-6 grid grid-cols-5 gap-2">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Amount (USD)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button className="bg-gray-900 text-white px-4 py-2 rounded">Add</button>
      </form>

      <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
        Displaying in <strong>{CURRENCY}</strong>
      </div>

      {/* Transactions Table */}
      <table className="w-full border rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="border p-2">Date</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td className="border p-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="border p-2">{t.type}</td>
              <td className="border p-2">{t.category}</td>
              <td className="border p-2">{formatCurrency(t.amount * RATE, CURRENCY)}</td>
              <td className="border p-2">{t.description}</td>
              <td className="border p-2">
                <button
                  onClick={() => deleteTransaction(t._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
