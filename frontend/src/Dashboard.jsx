import { useEffect, useState } from "react";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    fetch("https://my-backend-n3nx.onrender.com/api/transactions") // Change if your backend URL differs
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        const income = data.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
        const expense = data.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
        setTotalIncome(income);
        setTotalExpense(expense);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-lg">Total Income</h2>
          <p className="text-2xl font-bold text-green-700">${totalIncome}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="text-lg">Total Expense</h2>
          <p className="text-2xl font-bold text-red-700">${totalExpense}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg">Balance</h2>
          <p className="text-2xl font-bold text-blue-700">${totalIncome - totalExpense}</p>
        </div>
      </div>
      <h2 className="text-xl mb-2">Recent Transactions</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 5).map((t, i) => (
            <tr key={i} className="border">
              <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="p-2">{t.description}</td>
              <td className={`p-2 ${t.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                {t.type === "expense" ? "-" : "+"}${t.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
