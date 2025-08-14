import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  description: String,
  recurring: { type: Boolean, default: false }
});

export default mongoose.model("Transaction", transactionSchema);