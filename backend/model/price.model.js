import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  city: String,
  petrolPrice: Number,      // ₹ per litre
  electricityPrice: Number  // ₹ per kWh
});

export default mongoose.model("Price", priceSchema);
