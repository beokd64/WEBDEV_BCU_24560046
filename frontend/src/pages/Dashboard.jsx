import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { formatCurrency } from "../utils/currency";

// Hardcoded static rates relative to USD
const staticRates = {
  USD: 1,
  EUR: 0.92,
  VND: 25000,
  JPY: 145,
  GBP: 0.78,
  AUD: 1.5,
  CAD: 1.35,
};

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);

  // Load preferred currency and its static rate
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") || "USD";
    setCurrency(savedCurrency);
    setRate(staticRates[savedCurrency] || 1);
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data || [];
    setTransactions(data);

    let inc = 0, exp = 0;
    for (const t of data) {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    }
    setIncome(inc);
    setExpense(exp);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const balance = income - expense;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Income</h2>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(income * rate, currency)}
          </p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(expense * rate, currency)}
          </p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Balance</h2>
          <p
            className={`text-2xl font-bold ${
              balance >= 0
                ? "text-blue-700 dark:text-blue-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {formatCurrency(balance * rate, currency)}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          Displaying in <strong>{currency}</strong> (1 USD ≈ {rate} {currency})
        </div>
        <table className="w-full border rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="border p-2">Date</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t) => (
              <tr key={t._id}>
                <td className="border p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="border p-2">{t.type}</td>
                <td className="border p-2">{t.category}</td>
                <td className="border p-2">{formatCurrency(t.amount * rate, currency)}</td>
                <td className="border p-2">{t.description}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-500 dark:text-gray-300">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
