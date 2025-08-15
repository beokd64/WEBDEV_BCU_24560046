import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import fetch from "node-fetch";
import Transaction from "./models/Transaction.js"; // Make sure you have this model

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const systemPrompt = `
You are a financial transaction assistant.

Rules:
- Only respond with valid JSON.
- JSON format for adding: {"action": "add", "description": "string", "amount": number}
- JSON format for deleting: {"action": "delete", "id": "mongodb_id"}
- If unsure, ask the user for clarification in JSON: {"action": "clarify", "message": "string"}.
`;

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.post("/api/assistant", async (req, res) => {
  const { message, userId } = req.body;

  try {
    // Send to Ollama
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `${systemPrompt}\nUser: ${message}`,
        stream: false
      }),
    });

    const ollamaData = await ollamaRes.json();
    let parsed;
    try {
      parsed = JSON.parse(ollamaData.response.trim());
    } catch {
      return res.status(400).json({
        error: "Invalid JSON from AI",
        raw: ollamaData.response
      });
    }

    // Perform DB action
    let result;
    if (parsed.action === "add") {
      const newTransaction = new Transaction({
        user: userId,
        description: parsed.description,
        amount: parsed.amount
      });
      await newTransaction.save();
      result = { message: "Transaction added", transaction: newTransaction };
    } else if (parsed.action === "delete") {
      await Transaction.deleteOne({ _id: parsed.id, user: userId });
      result = { message: "Transaction deleted", id: parsed.id };
    } else if (parsed.action === "clarify") {
      result = { message: parsed.message };
    }

    // Return updated transactions
    const transactions = await Transaction.find({ user: userId });
    res.json({ success: true, aiResult: parsed, transactions, result });

  } catch (err) {
    console.error("Ollama AI error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
