// routes/transactionRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all transactions for a user
router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  let userId;
  try {
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// Add transaction
router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];

  let userId;
  try {
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const { type, category, amount, description, recurring } = req.body;
  if (!type || !category || !amount) return res.status(400).json({ message: "Missing fields" });

  try {
    const transaction = new Transaction({
      userId,
      type,
      category,
      amount,
      description: description || "",
      recurring: recurring || false,
    });
    await transaction.save();
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add transaction" });
  }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];

  let userId;
  try {
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    await Transaction.deleteOne({ _id: id, userId });
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

export default router;
