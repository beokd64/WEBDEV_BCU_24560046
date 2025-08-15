import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

export default function Transactions() {
  const { token, user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get("/transactions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTransactions(res.data);
  };

  const sendToAI = async () => {
    const res = await api.post(
      "/assistant",
      { message: aiMessage, userId: user._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTransactions(res.data.transactions);
    setAiMessage("");
  };

  return (
    <div>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t._id}>
            {t.description} - ${t.amount}
          </li>
        ))}
      </ul>

      <input
        value={aiMessage}
        onChange={(e) => setAiMessage(e.target.value)}
        placeholder="Ask AI to add/delete..."
      />
      <button onClick={sendToAI}>Send to AI</button>
    </div>
  );
}
