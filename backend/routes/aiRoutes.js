import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Simulate a transaction DB in memory for now
let transactions = [
  { id: 1, description: "Coffee", amount: 5 },
  { id: 2, description: "Groceries", amount: 50 },
];

router.post("/ai", async (req, res) => {
  const { message } = req.body;

  try {
    // Send prompt to Ollama local API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `You are a finance assistant. User says: "${message}".
Decide if it's an ADD or DELETE transaction. 
Respond with JSON ONLY in the format:
{"action": "add"|"delete", "description": "...", "amount": number, "id": number (for delete)}`,
      }),
    });

    const data = await response.json();

    // Parse AI JSON result
    const result = JSON.parse(data.response);

    if (result.action === "add") {
      const newId = transactions.length + 1;
      transactions.push({ id: newId, description: result.description, amount: result.amount });
    } else if (result.action === "delete") {
      transactions = transactions.filter(t => t.id !== result.id);
    }

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transactions", (req, res) => {
  res.json(transactions);
});

export default router;
