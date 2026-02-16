import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,

  type: {
    type: String,
    enum: ["petrol", "electric", "hybrid"],
    required: true,
  },

  mileage: Number,        // km per litre (for petrol)
  efficiency: Number,     // km per kWh (for electric)

  co2PerKm: Number,       // direct emission per km (optional)

  basePrice: Number,      // vehicle showroom price

}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
