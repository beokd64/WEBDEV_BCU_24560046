import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { formatCurrency } from "../utils/currency";

export default function Transactions() {
  const { user, token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: "expense", category: "", amount: "", description: "" });
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const CURRENCY = "USD";

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/transactions?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTransactions(); }, [user]);

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    await api.post("/api/transactions", { ...form, amount: Number(form.amount), userId: user._id }, { headers: { Authorization: `Bearer ${token}` } });
    setForm({ type: "expense", category: "", amount: "", description: "" });
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` }, data: { userId: user._id } });
    fetchTransactions();
  };

  const handleAiCommand = async () => {
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    try {
      await api.post("/api/assistant", { message: aiMessage, userId: user._id }, { headers: { Authorization: `Bearer ${token}` } });
      setAiMessage("");
      fetchTransactions();
    } catch (err) { console.error(err); }
    setAiLoading(false);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto font-sans text-gray-800">
      <h1 className="text-3xl font-semibold mb-8">Transactions</h1>

      {/* AI Assistant */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={aiMessage}
          onChange={(e) => setAiMessage(e.target.value)}
          placeholder='Ask AI: "Add 15 for coffee"'
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition-all"
        />
        <button
          onClick={handleAiCommand}
          disabled={aiLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all"
        >
          {aiLoading ? "Processing..." : "Ask AI"}
        </button>
      </div>

      {/* Add Transaction */}
      <form onSubmit={addTransaction} className="grid grid-cols-5 gap-4 mb-6">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 transition-all">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 transition-all" />
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 transition-all" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 transition-all" />
        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">Add</button>
      </form>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{t.type}</td>
                <td className="px-6 py-4">{t.category}</td>
                <td className="px-6 py-4">{formatCurrency(t.amount * 1, CURRENCY)}</td>
                <td className="px-6 py-4">{t.description}</td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteTransaction(t._id)} className="text-red-500 hover:text-red-700 transition-all">Delete</button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
