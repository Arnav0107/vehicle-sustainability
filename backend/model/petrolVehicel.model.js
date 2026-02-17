import mongoose from "mongoose";
import Vehicle from "./Vehicle.model.js";

const PetrolSchema = new mongoose.Schema({
  combinedMPG: {
    type: Number,
    required: true
  },
  co2TailpipeGpm: {
    type: Number,
    required: true
  }
});

const PetrolVehicle = Vehicle.discriminator(
  "petrol",
  PetrolSchema
);

export default PetrolVehicle;
