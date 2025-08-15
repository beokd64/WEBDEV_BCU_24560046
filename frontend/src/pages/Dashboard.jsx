import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { formatCurrency } from "../utils/currency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// Static rates
const staticRates = {
  USD: 1,
  EUR: 0.92,
  VND: 25000,
  JPY: 145,
  GBP: 0.78,
  AUD: 1.5,
  CAD: 1.35,
};

// Pie colors for categories
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF1493"];

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") || "USD";
    setCurrency(savedCurrency);
    setRate(staticRates[savedCurrency] || 1);
  }, []);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/transactions?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setTransactions(data);

      let inc = 0,
        exp = 0;
      for (const t of data) {
        if (t.type === "income") inc += t.amount;
        else exp += t.amount;
      }
      setIncome(inc);
      setExpense(exp);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const balance = income - expense;

  // Prepare data for charts
  const categoryData = [];
  const categoryMap = {};
  transactions.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = 0;
    categoryMap[t.category] += t.amount;
  });
  for (const key in categoryMap) {
    categoryData.push({ name: key, value: categoryMap[key] });
  }

  const barData = [
    { name: "Income", value: income },
    { name: "Expenses", value: expense },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Income 💰</h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(income * rate, currency)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Expenses 🛒</h2>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(expense * rate, currency)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Balance 💵</h2>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(balance * rate, currency)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value * rate, currency)} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value * rate, currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Recent Transactions</h2>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Displaying in <strong>{currency}</strong> (1 USD ≈ {rate} {currency})
        </div>
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
              <th className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              <th className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t) => (
              <tr key={t._id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 text-gray-700 dark:text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{t.type}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{t.category}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{formatCurrency(t.amount * rate, currency)}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{t.description}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
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
