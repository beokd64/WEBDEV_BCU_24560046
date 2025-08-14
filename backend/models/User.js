import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  currency: { type: String, default: "USD" },
  budgets: [
    {
      category: String,
      amount: Number,
      month: String
    }
  ]
});

export default mongoose.model("User", userSchema);