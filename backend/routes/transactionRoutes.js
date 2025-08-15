import express from "express";
import Transaction from "../models/Transaction.js";
const router = express.Router();

// Get all transactions for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Add a transaction
router.post("/", async (req, res) => {
  const { userId, type, category, amount, description } = req.body;
  if (!userId || !type || !category || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transaction = new Transaction({
      userId,
      type,
      category,
      amount,
      description,
    });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    await Transaction.deleteOne({ _id: id, userId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
