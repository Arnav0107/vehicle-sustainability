import mongoose from "mongoose";
import Vehicle from "./Vehicle.model.js";

const ElectricSchema = new mongoose.Schema({
  chargeConsumption: {
    type: Number,
    required: true   // Wh per mile (combE)
  },
  batteryDisposalEmission: {
    type: Number,
    default: 3000
  }
});

const ElectricVehicle = Vehicle.discriminator(
  "electric",
  ElectricSchema
);

export default ElectricVehicle;
