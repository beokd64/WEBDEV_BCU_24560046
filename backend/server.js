import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import Transaction from "./models/Transaction.js";
import OpenAI from "openai";
import apiDocsRoutes from "./routes/apiDocs.js";

dotenv.config();
connectDB();

const app = express();

// ✅ CORS config to allow your frontend domain
app.use(cors({
  origin: ["https://my-frontend-2xtv.onrender.com"],
  credentials: true
}));

app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a financial transaction assistant.

Rules:
- Only respond with valid JSON.
- JSON format for adding: {"action": "add", "description": "string", "amount": number}
- JSON format for deleting: {"action": "deleteByDescription", "description": "string"}
- If unsure, ask the user for clarification in JSON: {"action": "clarify", "message": "string"}.
`;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/docs", apiDocsRoutes);

// AI assistant endpoint
app.post("/api/assistant", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId)
    return res.status(400).json({ error: "Message and userId are required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0
    });

    const aiText = completion.choices[0].message.content;
    console.log("AI raw response:", aiText);

    let parsed;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI did not return valid JSON");
      parsed = JSON.parse(match[0]);
    } catch {
      return res.status(400).json({ error: "Invalid JSON from AI", raw: aiText });
    }

    let result;
    if (parsed.action === "add") {
      const newTransaction = new Transaction({
        userId,
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type || "expense"
      });
      await newTransaction.save();
      result = { message: "Transaction added", transaction: newTransaction };
    } else if (parsed.action === "deleteByDescription") {
      const deleted = await Transaction.deleteMany({
        description: { $regex: parsed.description, $options: "i" },
        userId
      });
      result = { message: `Deleted ${deleted.deletedCount} transaction(s)` };
    } else if (parsed.action === "clarify") {
      result = { message: parsed.message };
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json({ success: true, aiResult: parsed, transactions, result });

  } catch (err) {
    console.error("OpenAI AI error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Root route
app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
