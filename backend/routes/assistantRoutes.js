// routes/assistantRoutes.js
import express from "express";
import fetch from "node-fetch";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ reply: "Message and userId are required" });
  }

  try {
    // Detect delete command
    const deleteMatch = message.match(/delete transaction (\w+)/i);
    if (deleteMatch) {
      const txId = deleteMatch[1];
      const deleted = await Transaction.findOneAndDelete({ _id: txId, userId });
      const transactions = await Transaction.find({ userId }).sort({ date: -1 });

      return res.json({
        reply: deleted ? "Transaction deleted successfully." : "Transaction not found.",
        transactions,
      });
    }

    // AI Add transaction
    const prompt = `
You are a finance transaction assistant. The user will give you a request like "add a 20 dollar coffee expense".
IMPORTANT: Ignore any previous transactions, examples, or past messages. Only respond to this single request.
You must output ONLY valid JSON in this exact format, nothing else:
{
  "type": "income" or "expense",
  "category": "string",
  "amount": number,
  "description": "string",
  "recurring": true or false
}
Do NOT include userId or date — the system will handle it.
User message: ${message}
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false
      }),
    });

    const data = await response.json();

    let aiOutput;
    try {
      aiOutput = JSON.parse(data.response);

      // If AI returns an array
      if (Array.isArray(aiOutput)) {
        if (aiOutput.length !== 1) {
          console.log("AI returned multiple objects:", aiOutput);
          return res.status(400).json({ reply: "AI returned multiple transactions, ignoring." });
        }
        aiOutput = aiOutput[0];
      }

      // Ensure it's a single object
      if (typeof aiOutput !== "object" || aiOutput === null) {
        console.log("AI returned invalid output:", data.response);
        return res.status(400).json({ reply: "AI did not return valid transaction JSON" });
      }

      console.log("AI Output to save:", aiOutput);

    } catch (err) {
      console.error("AI JSON parse error:", err, "Response:", data.response);
      return res.status(400).json({ reply: "AI did not return valid JSON" });
    }

    // Validate fields
    const { type, category, amount, description, recurring } = aiOutput;
    if (!["income", "expense"].includes(type) || !category || !amount) {
      return res.status(400).json({ reply: "AI returned invalid transaction data" });
    }

    // Save transaction to DB
    const newTransaction = new Transaction({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      category,
      amount,
      description: description || "",
      recurring: recurring || false,
    });

    await newTransaction.save();

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    res.json({
      reply: "Transaction added successfully.",
      transactions,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

export default router;
