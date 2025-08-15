// routes/assistantRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import OpenAI from "openai";

const router = express.Router();

// Instantiate OpenAI client using env variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId)
    return res.status(400).json({ reply: "Message and userId are required" });

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ reply: "Invalid userId" });

  try {
    // Construct prompt
    const prompt = `
You are a finance transaction assistant.
The user will give you a request like "add 20 for coffee".
You MUST output ONLY valid JSON in this exact format:
{
  "type": "income" or "expense",
  "category": "string",
  "amount": number,
  "description": "string",
  "recurring": true or false
}
Do NOT add any extra text.
User message: ${message}
`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a finance transaction assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    const text = completion.choices[0].message.content;
    console.log("AI raw response:", text);

    // Extract JSON safely
    let aiOutput;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI did not return valid JSON");
      aiOutput = JSON.parse(match[0]);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.status(500).json({
        reply: "AI did not return valid JSON. See server logs for details.",
      });
    }

    // Save transaction
    const newTransaction = new Transaction({ userId, ...aiOutput });
    await newTransaction.save();

    // Return updated transactions
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json({ reply: "Transaction added successfully.", transactions });
  } catch (err) {
    console.error("AI processing error:", err);
    res.status(500).json({ reply: "AI processing failed. See server logs." });
  }
});

export default router;
