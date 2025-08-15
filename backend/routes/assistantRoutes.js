import express from "express";
import fetch from "node-fetch";
import Transaction from "../models/Transaction.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ reply: "Message and userId are required" });
  }

  const preprocessedMessage = message.trim();

  // Automatically treat any "delete" message as deleteByDescription
  const autoDelete = /delete/i.test(preprocessedMessage);

  const systemPrompt = `
You are a fun financial assistant.
Rules:
- Only respond with JSON.
- JSON for deleting by description: {"action":"deleteByDescription","description":"string"}
- JSON for deleting by category: {"action":"deleteCategory","category":"string"}
- You can include emojis in descriptions.
- Ignore asking for transaction IDs. All deletes are by description.
- If unsure, use: {"action":"clarify","message":"string"}
User message: ${preprocessedMessage}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let aiOutput;

    try {
      aiOutput = JSON.parse(data.choices[0].message.content);
    } catch {
      aiOutput = {}; // fallback if AI returns invalid JSON
    }

    // Force deleteByDescription if message contains "delete"
    if (autoDelete) {
      aiOutput.action = "deleteByDescription";
      aiOutput.description = preprocessedMessage.replace(/delete/i, "").trim();
    }

    let result;

    if (aiOutput.action === "deleteByDescription") {
      const deleted = await Transaction.deleteMany({
        description: { $regex: aiOutput.description, $options: "i" },
        userId,
      });
      result = { message: `Deleted ${deleted.deletedCount} transaction(s) matching description "${aiOutput.description}"` };
    } else if (aiOutput.action === "deleteCategory") {
      const deleted = await Transaction.deleteMany({ category: aiOutput.category, userId });
      result = { message: `Deleted ${deleted.deletedCount} transaction(s) in category "${aiOutput.category}"` };
    } else if (aiOutput.action === "clarify") {
      result = { message: aiOutput.message };
    } else {
      result = { message: "Action not supported by AI" };
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    res.json({ success: true, aiResult: aiOutput, transactions, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

export default router;
