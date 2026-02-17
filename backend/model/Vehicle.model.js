import mongoose from "mongoose";

const options = {
  discriminatorKey: "type",
  collection: "vehicles",
  timestamps: true
};

const VehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    manufacturingEmission: {
      type: Number,
      default: 9000   // kg CO2 approx manufacturing
    }
  },
  options
);

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
