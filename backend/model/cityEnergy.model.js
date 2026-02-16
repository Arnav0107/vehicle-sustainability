import mongoose from "mongoose";

const cityEnergySchema = new mongoose.Schema({
  city: {
    type: String,
    unique: true,
  },

  petrolPrice: Number,      // ₹ per litre
  electricityPrice: Number, // ₹ per kWh

  gridEmissionFactor: Number, // kg CO2 per kWh

}, { timestamps: true });

export default mongoose.model("CityEnergy", cityEnergySchema);
