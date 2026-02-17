import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  dailyKm: Number,
  years: Number,
  city: String
});

export default mongoose.model("User", userSchema);
