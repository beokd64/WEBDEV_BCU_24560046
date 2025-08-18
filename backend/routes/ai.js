// backend/routes/ai.js
import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // stays on server
});

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return res.json({ reply });
  } catch (err) {
    console.error("AI route error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
