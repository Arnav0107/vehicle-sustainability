import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/*
STEP 1 → Generate Graph Data
User sends:
{
  avgKmPerYear: 12000,
  years: 5
}
*/

router.post("/calculate", async (req, res) => {
  try {
    const { avgKmPerYear, years } = req.body;

    const vehicles = await Vehicle.find();

    const results = vehicles.map((vehicle) => {
      // Convert km to miles
      const milesPerYear = avgKmPerYear * 0.621371;

      const usageEmission =
        vehicle.co2TailpipeGpm * milesPerYear * years;

      const manufacturing = vehicle.manufacturingEmission || 0;
      const disposal = vehicle.batteryDisposalEmission || 0;

      const totalEmission =
        usageEmission + manufacturing + disposal;

      return {
        _id: vehicle._id,
        model: vehicle.model,
        fuelType: vehicle.fuelType,
        totalEmission,
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Calculation failed" });
  }
});


/*
STEP 2 → Suggest Best Vehicle
User sends:
{
  avgKmPerYear: 12000,
  years: 5,
  fuelType: "electric"
}
*/

router.post("/suggest", async (req, res) => {
  try {
    const { avgKmPerYear, years, fuelType } = req.body;

    const vehicles = await Vehicle.find({
      fuelType: fuelType,
    });

    if (!vehicles.length) {
      return res.status(404).json({
        message: "No vehicles found for this fuel type",
      });
    }

    const milesPerYear = avgKmPerYear * 0.621371;

    let bestVehicle = null;
    let lowestEmission = Infinity;

    vehicles.forEach((vehicle) => {
      const usageEmission =
        vehicle.co2TailpipeGpm * milesPerYear * years;

      const manufacturing = vehicle.manufacturingEmission || 0;
      const disposal = vehicle.batteryDisposalEmission || 0;

      const totalEmission =
        usageEmission + manufacturing + disposal;

      if (totalEmission < lowestEmission) {
        lowestEmission = totalEmission;
        bestVehicle = vehicle;
      }
    });

    res.json({
      bestVehicle,
      totalEmission: lowestEmission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Suggestion failed" });
  }
});

export default router;
