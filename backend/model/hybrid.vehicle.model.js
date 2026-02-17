import mongoose from "mongoose";
import Vehicle from "./Vehicle.model.js";

const HybridSchema = new mongoose.Schema({
  combinedMPG: {
    type: Number,
    required: true
  },
  co2TailpipeGpm: {
    type: Number,
    required: true
  },
  chargeConsumption: {
    type: Number,
    default: 0
  }
});

const HybridVehicle = Vehicle.discriminator(
  "hybrid",
  HybridSchema
);

export default HybridVehicle;
