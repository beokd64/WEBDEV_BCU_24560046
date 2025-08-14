// routes/assistantRoutes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    const data = await response.json();
    res.json({ reply: data[0]?.generated_text || "Sorry, I cannot respond now." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

export default router;
