// src/pages/Assistant.jsx
import { useState } from "react";
import axios from "axios";
import api from "../api";

export default function Assistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your AI assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("https://my-backend-n3nx.onrender.com/api/assistant", {
        message: userMessage.text,
      });
      const assistantMessage = { role: "assistant", text: res.data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: Could not reach the AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-100 dark:bg-gray-800">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`inline-block p-2 rounded max-w-xs break-words ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 dark:text-gray-300">Typing...</div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border p-2 rounded dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
